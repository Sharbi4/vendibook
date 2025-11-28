import Stripe from 'stripe';

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY. Set it in your environment before running this script.');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
  });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000, // $20.00 USD
      currency: 'usd',
      payment_method: 'pm_card_visa',
      confirm: true,
      description: 'Vendibook test payment'
    });

    console.log('✅ PaymentIntent confirmed');
    console.log(JSON.stringify({
      id: paymentIntent.id,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret
    }, null, 2));
  } catch (error) {
    console.error('❌ Stripe test payment failed');
    if (error.raw) {
      console.error('Type:', error.raw.type);
      console.error('Code:', error.raw.code);
      console.error('Message:', error.raw.message);
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Unexpected error running Stripe test script:', error);
  process.exitCode = 1;
});
