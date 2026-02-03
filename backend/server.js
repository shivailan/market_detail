require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.use(cors());



// --- 1. LE WEBHOOK (SÉCURISÉ) ---
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Erreur de signature Webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;

// A. GESTION DES PAIEMENTS RÉUSSIS
if (event.type === 'checkout.session.completed') {
  // CAS 1 : Mission Client
  if (session.mode === 'payment') {
    const meta = session.metadata; // On récupère les métadonnées envoyées par le BookingModal
    const secureCode = "DP-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const { error } = await supabase.from('appointments').insert([{
      pro_id: meta.pro_id,
      client_name: meta.client_email || session.customer_details?.email,
      service_selected: meta.service_name,
      total_price: session.amount_total / 100,
      appointment_date: meta.date,
      appointment_time: meta.time,
      validation_code: secureCode,
      payment_status: 'escrow',
      status: 'confirmé',
      
      // --- NOUVELLES COLONNES DE DIAGNOSTIC ---
      intervention_type: meta.intervention_type, 
      intervention_address: meta.intervention_address,
      has_power: meta.has_power,
      vehicle_type: meta.vehicle_type,
      technical_details: meta.technical_details,
      major_dirt_detail: meta.major_dirt
    }]);

    if (error) {
      console.error("❌ Erreur Supabase Mission:", error.message);
    } else {
      console.log("✅ Mission enregistrée avec diagnostic complet !");
    }
  }

  // CAS 2 : Abonnement Pro (Reste inchangé)
  if (session.mode === 'subscription') {
    const userId = session.metadata.userId;
    await supabase.from('profiles_pro')
      .update({ subscription_status: 'active', subscription_type: 'monthly' })
      .eq('id', userId);
    console.log("✅ Abonnement activé");
  }
}

  // B. GESTION DE L'ONBOARDING CONNECT
  if (event.type === 'account.updated') {
    const account = event.data.object;
    if (account.details_submitted) {
      await supabase.from('profiles_pro')
        .update({ stripe_onboarding_complete: true })
        .eq('stripe_connect_id', account.id);
      console.log("✅ Onboarding Pro validé !");
    }
  }

  res.json({received: true});
});

// --- 2. MIDDLEWARES ---
app.use(express.json());

// --- 3. ROUTES API ---

// ABONNEMENT MENSUEL (29.99€)
app.post('/create-subscription-session', async (req, res) => {
  const { userId, email } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1Sw2OmR3HvQFL1AwQ2utw86B', // Ton ID réel
        quantity: 1,
      }],
      metadata: { userId: userId },
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/pro-dashboard?subscription=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pro-dashboard?subscription=cancel`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// LIBÉRATION DES FONDS (VÉRIFICATION CODE)
app.post('/release-funds', async (req, res) => {
  const { appointmentId, validationCode } = req.body;
  
  try {
    const { data: appt, error: fetchError } = await supabase
      .from('appointments')
      .select('*, profiles_pro!appointments_pro_id_fkey(stripe_connect_id, subscription_type)')
      .eq('id', appointmentId.trim())
      .maybeSingle();

    if (fetchError || !appt) return res.status(404).json({ error: "Mission introuvable." });

    const codeBase = appt.validation_code.trim().toUpperCase();
    const codeSaisi = validationCode.trim().toUpperCase();

    if (codeBase !== codeSaisi) return res.status(400).json({ error: "CODE_INVALIDE" });

    // CALCUL COMMISSION : 85% si commission, 100% si monthly
    const totalAmount = Math.round(appt.total_price * 100);
    const transferAmount = appt.profiles_pro.subscription_type === 'monthly' 
      ? totalAmount 
      : Math.round(totalAmount * 0.85);

    await stripe.transfers.create({
      amount: transferAmount,
      currency: 'eur',
      destination: appt.profiles_pro.stripe_connect_id,
    });

    await supabase.from('appointments').update({ status: 'terminé', payment_status: 'released' }).eq('id', appt.id);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CRÉATION COMPTE CONNECT
app.post('/create-connect-account', async (req, res) => {
  const { userId, email } = req.body;
  try {
    const account = await stripe.accounts.create({ type: 'express', email });
    await supabase.from('profiles_pro').update({ stripe_connect_id: account.id }).eq('id', userId);
    
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/pro-dashboard`,
      return_url: `${process.env.FRONTEND_URL}/pro-dashboard?onboarding=success`,
      type: 'account_onboarding',
    });
    res.json({ url: accountLink.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PAIEMENT MISSION CLIENT
app.post('/create-checkout-session', async (req, res) => {
  const { serviceName, price, metadata } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: serviceName },
          unit_amount: price * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: metadata,
      success_url: `${process.env.FRONTEND_URL}/mes-reservations?status=success`,
      cancel_url: `${process.env.FRONTEND_URL}/explorer`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- NOUVELLE ROUTE : ACCÈS AU COFFRE-FORT STRIPE DU PRO ---
app.post('/create-portal-link', async (req, res) => {
  const { stripeConnectId } = req.body;

  if (!stripeConnectId) {
    return res.status(400).json({ error: "ID Stripe Connect manquant." });
  }

  try {
    // Génère un lien de connexion unique et temporaire (valable quelques minutes)
    const loginLink = await stripe.accounts.createLoginLink(stripeConnectId);
    
    // On renvoie l'URL vers laquelle le pro sera redirigé
    res.json({ url: loginLink.url });
    console.log("✅ Lien Stripe Portal généré avec succès");
  } catch (e) {
    console.error("❌ Erreur Stripe Login Link:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('🚀 Serveur prêt sur le port 3000'));