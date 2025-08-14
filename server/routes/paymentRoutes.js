const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../config/supabaseClient');

// @desc    Create Stripe Checkout Session
// @route   POST /api/v1/payments/create-checkout-session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res, next) => {
  try {
    const { items, currency = 'gbp', successUrl, cancelUrl, metadata = {} } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide items to purchase' });
    }

    // Prepare line items with support for product IDs or dynamic pricing
    const lineItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      
      // If item has a product ID, create a one-time price tied to that product
      if (item.productId) {
        const unitAmount = Math.floor(Number(item.amount || item.price || 0) * 100);
        if (!unitAmount) {
          throw new Error(`Item at index ${i} has invalid amount for product ${item.productId}`);
        }
        
        try {
          const price = await stripe.prices.create({
            unit_amount: unitAmount,
            currency: currency.toLowerCase(),
            product: item.productId,
            recurring: null // One-time payment
          });
          lineItems.push({ price: price.id, quantity });
        } catch (priceError) {
          console.error(`Failed to create price for product ${item.productId}:`, priceError);
          throw new Error(`Could not create price for ${item.name || `item ${i}`}`);
        }
      } else {
        // Fallback to dynamic pricing
        const unitAmount = Math.floor(Number(item.amount || item.price || 0) * 100);
        if (!unitAmount) {
          throw new Error(`Item at index ${i} missing valid amount`);
        }
        
        lineItems.push({
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: unitAmount,
            product_data: { 
              name: item.name || `Item ${i}`,
              // You can add more product details here, like images or descriptions
              // images: [item.imageUrl]
            },
          },
          quantity: quantity,
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: { userId: userId, ...metadata },
      payment_intent_data: { metadata: { userId: userId, ...metadata } },
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
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, count: data.length, data });
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
      payment_method: 'card'
    };

    const { error } = await supabase.from('payments').insert([paymentData]);

    if (error) {
      console.error('Error saving payment to Supabase:', error);
      // Optionally, you could have a retry mechanism or alert system here
    }
  }

  res.json({ received: true });
});

module.exports = router;
