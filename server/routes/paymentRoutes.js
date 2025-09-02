const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

// @desc    Create Stripe Checkout Session
// @route   POST /api/v1/payments/create-checkout-session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res, next) => {
  try {
    const { items, currency = 'gbp', successUrl, cancelUrl, metadata = {} } = req.body;
    const userId = req.user.uid;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide items to purchase' });
    }
    // Prepare line items
    const lineItems = items.map(item => ({
      price_data: {
        currency: currency.toLowerCase(),
        unit_amount: Math.round(Number(item.amount || item.price || 0) * 100),
        product_data: { name: item.name },
      },
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: { userId, ...metadata },
      payment_intent_data: { metadata: { userId, ...metadata } },
    });
    res.status(200).json({ success: true, url: session.url, id: session.id });
  } catch (err) {
    next(err);
  }
});

// @desc    Get user's payment history
// @route   GET /api/v1/payments
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const paymentsRef = db.collection('payments').where('user_id', '==', req.user.uid).orderBy('createdAt', 'desc');
    const snapshot = await paymentsRef.get();
    const payments = [];
    snapshot.forEach(doc => {
      payments.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
});

// @desc    Stripe webhook handler
// @route   POST /api/v1/payments/webhook
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId } = session.metadata;
    const paymentData = {
      user_id: userId,
      stripe_payment_id: session.payment_intent,
      amount: session.amount_total / 100,
      currency: session.currency,
      status: 'completed',
      payment_method: 'card',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    try {
      await db.collection('payments').add(paymentData);
    } catch (error) {
      console.error('Error saving payment to Firestore:', error);
    }
  }
  res.json({ received: true });
});

module.exports = router;
