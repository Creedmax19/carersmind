const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret);
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Create a checkout session
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    cors(req, res, async () => {
        // Handle preflight
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        try {
            const { items, successUrl, cancelUrl, customerEmail } = req.body;

            // Create line items for Stripe
            const lineItems = items.map(item => ({
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: item.name,
                        description: item.description || '',
                    },
                    unit_amount: Math.round(item.price * 100), // Stripe uses smallest currency unit
                },
                quantity: item.quantity || 1,
            }));

            // Create checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                customer_email: customerEmail,
                metadata: {
                    userId: req.body.userId || 'guest',
                    items: JSON.stringify(items) // Store items in metadata for webhook
                }
            });

            res.json({ id: session.id });
        } catch (error) {
            console.error('Error creating checkout session:', error);
            res.status(500).json({ error: error.message });
        }
    });
});

// Webhook handler for Stripe events
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.webhook_secret || 'whsec_your_webhook_secret_here';
    
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody, 
            sig, 
            endpointSecret
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Handle successful payment
        await handleSuccessfulPayment(session);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
});

async function handleSuccessfulPayment(session) {
    try {
        // Create or update order in Firestore
        const orderData = {
            userId: session.metadata.userId,
            customerEmail: session.customer_email,
            amount: session.amount_total / 100, // Convert back to currency
            status: 'paid',
            paymentId: session.payment_intent,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            items: JSON.parse(session.metadata.items || '[]'),
        };

        await admin.firestore().collection('orders').add(orderData);
        console.log(`Order created for payment ${session.payment_intent}`);
    } catch (error) {
        console.error('Error handling successful payment:', error);
        throw error;
    }
}
