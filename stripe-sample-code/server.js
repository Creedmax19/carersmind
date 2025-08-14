// Load Stripe from environment to match your own account resources
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
  process.exit(1);
}
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration to allow all origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from any origin
    callback(null, true);
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 4242;
const YOUR_DOMAIN = `http://localhost:${PORT}`;

app.post('/create-checkout-session', async (req, res) => {
  try {
    console.log('=== NEW CHECKOUT REQUEST ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Raw body:', JSON.stringify(req.body, null, 2));
    
    const { items, metadata } = req.body;
    console.log('Parsed items:', JSON.stringify(items, null, 2));
    console.log('Metadata:', JSON.stringify(metadata, null, 2));
    
    // Validate items structure
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }
    
    // Log each item's structure
    items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log('- Price ID:', item.price);
      console.log('- Price Data:', JSON.stringify(item.price_data || null));
      console.log('- Quantity:', item.quantity);
      console.log('- Type of price:', typeof item.price);
      console.log('- Type of quantity:', typeof item.quantity);
    });
    
    // Validate cart items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart must contain at least one item' });
    }

    // Prepare line items with support for: price ID, product ID (create price), or inline price_data
    const lineItems = [];
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

      // Direct price ID
      if (item.price) {
        const price = String(item.price || '').trim();
        if (!price) throw new Error(`Item at index ${index} has an invalid price ID`);
        console.log(`Creating line item ${index + 1} with price ID`, { price, quantity });
        lineItems.push({ price, quantity });
        continue;
      }

      // Provided an existing Product ID: create a one-time Price tied to it
      if (item.product) {
        const unitAmount = Math.floor(Number(item.unit_amount) || 0);
        const currency = (item.currency || '').toLowerCase();
        if (!unitAmount || !currency) throw new Error(`Item at index ${index} missing unit_amount or currency for product ${item.product}`);
        const createdPrice = await stripe.prices.create({ unit_amount: unitAmount, currency, product: item.product });
        console.log(`Created temporary price ${createdPrice.id} for product ${item.product}`);
        lineItems.push({ price: createdPrice.id, quantity });
        continue;
      }

      // Inline price_data fallback
      const pd = item.price_data || {};
      const unitAmount = Math.floor(Number(pd.unit_amount) || 0);
      const currency = (pd.currency || '').toLowerCase();
      const name = pd.product_data?.name || 'Item';
      if (!unitAmount || !currency) throw new Error(`Item at index ${index} missing price_data.unit_amount or price_data.currency`);
      console.log(`Creating line item ${index + 1} with price_data`, { unit_amount: unitAmount, currency, name, quantity });
      lineItems.push({
        price_data: {
          currency,
          unit_amount: unitAmount,
          product_data: { name }
        },
        quantity
      });
    }
    
    console.log('Creating Stripe session with line items:', JSON.stringify(lineItems, null, 2));
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
      metadata: req.body.metadata || {}
    });

    // Return session URL
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', {
      error: error,
      message: error.message,
      stack: error.stack,
      request: req.body
    });
    
    // Send detailed error information to client
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message,
      request: req.body
    });
  }
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));