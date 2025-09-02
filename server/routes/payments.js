const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'gbp', metadata = {} } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to pence/cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { items, success_url, cancel_url, metadata = {} } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.amount * 100), // Convert to pence
                },
                quantity: item.quantity || 1,
            })),
            mode: 'payment',
            success_url: success_url || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url || `${process.env.FRONTEND_URL}/cart`,
            metadata
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get checkout session status
router.get('/checkout-session/:sessionId', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        res.json(session);
    } catch (error) {
        console.error('Error retrieving checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
