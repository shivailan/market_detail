import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { appointmentId, amount, serviceName, clientEmail, proName } = await req.json()

    // Création de la session de paiement avec le montant dynamique envoyé par le front
    const session = await stripe.checkout.sessions.create({
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${serviceName.toUpperCase()} - ${proName}`,
              description: `Réservation technique sécurisée via DetailPlan.`,
            },
            unit_amount: Math.round(amount * 100), // Stripe travaille en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/mes-reservations?payment=success`,
      cancel_url: `${req.headers.get('origin')}/explorer`,
      metadata: { appointmentId: appointmentId },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})