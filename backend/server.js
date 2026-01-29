require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.use(cors());

// --- 1. LE WEBHOOK (SÉCURISÉ) ---
// Note : express.raw est obligatoire ici pour que Stripe puisse vérifier la signature
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Erreur de signature Webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // A. QUAND LE PAIEMENT RÉUSSIT
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log("💰 Metadata reçus de Stripe:", session.metadata);

    // Génération du code de validation DP-XXXX
    const secureCode = "DP-" + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Insertion de la mission dans Supabase avec les infos de la session
    const { data: newAppointment, error } = await supabase
      .from('appointments')
      .insert([{
        pro_id: session.metadata.pro_id,
        client_name: session.metadata.client_email || session.customer_details?.email,
        service_selected: session.metadata.service_name,
        total_price: session.amount_total / 100,
        appointment_date: session.metadata.date,
        appointment_time: session.metadata.time,
        validation_code: secureCode,
        payment_status: 'escrow',
        status: 'confirmé'
      }])
      .select();

    if (error) {
      console.error("❌ Erreur Supabase lors de l'insertion:", error.message);
    } else {
      console.log(`✅ MISSION CRÉÉE EN BASE ! ID: ${newAppointment[0].id} | Code: ${secureCode}`);
    }
  }

  // B. QUAND L'ONBOARDING DU PRO EST TERMINÉ
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

// --- 2. MIDDLEWARES (APRES LE WEBHOOK) ---
app.use(express.json());

// --- 3. ROUTES API ---

// LIBÉRATION DES FONDS (QUAND LE PRO ENTRE LE CODE)
app.post('/release-funds', async (req, res) => {
  const { appointmentId, validationCode } = req.body;
  
  console.log("--- TENTATIVE DE VALIDATION ---");
  console.log("ID Reçu:", appointmentId);
  console.log("Code Reçu:", validationCode);

  try {
    // 1. On récupère la mission
const { data: appt, error: fetchError } = await supabase
  .from('appointments')
  .select('*, profiles_pro!appointments_pro_id_fkey(stripe_connect_id, subscription_type)') // <--- ON PRÉCISE LA CLÉ
  .eq('id', appointmentId.trim())
  .maybeSingle();

    if (fetchError || !appt) {
      console.error("❌ ERREUR BASE : Mission introuvable ou problème de jointure Profiles_Pro", fetchError);
      return res.status(404).json({ error: "Mission introuvable en base." });
    }

    console.log("Code en Base:", appt.validation_code);

    // 2. Comparaison ultra-stricte (sans espaces, tout en majuscules)
    const codeBase = appt.validation_code.trim().toUpperCase();
    const codeSaisi = validationCode.trim().toUpperCase();

    if (codeBase !== codeSaisi) {
      console.log(`❌ ECHEC : Base(${codeBase}) vs Saisi(${codeSaisi})`);
      return res.status(400).json({ error: "CODE_INVALIDE" });
    }

    // 3. Vérification du compte Connect du Pro
    if (!appt.profiles_pro?.stripe_connect_id) {
      console.error("❌ ERREUR : Le pro n'a pas de compte Stripe Connect lié.");
      return res.status(400).json({ error: "Compte Stripe Pro manquant." });
    }

    console.log("✅ Code OK ! Transfert en cours vers:", appt.profiles_pro.stripe_connect_id);

    // 4. Transfert Stripe
    const totalAmount = Math.round(appt.total_price * 100);
    const transferAmount = appt.profiles_pro.subscription_type === 'commission' 
      ? Math.round(totalAmount * 0.85) 
      : totalAmount;

    await stripe.transfers.create({
      amount: transferAmount,
      currency: 'eur',
      destination: appt.profiles_pro.stripe_connect_id,
      description: `Libération mission ${appt.id}`
    });

    // 5. Mise à jour statut
    await supabase.from('appointments')
      .update({ status: 'terminé', payment_status: 'released' })
      .eq('id', appt.id);

    console.log("💰 SUCCÈS : Fonds débloqués !");
    res.json({ success: true });

  } catch (e) {
    console.error("❌ ERREUR CRITIQUE :", e.message);
    res.status(500).json({ error: e.message });
  }
});

// CRÉATION COMPTE CONNECT (STRIPE ONBOARDING)
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

// CRÉATION SESSION PAIEMENT (STRIPE CHECKOUT)
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
      metadata: metadata, // Contient pro_id, date, time, etc.
      success_url: `${process.env.FRONTEND_URL}/mes-reservations?status=success`,
      cancel_url: `${process.env.FRONTEND_URL}/explorer`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('🚀 Serveur prêt sur le port 3000'));