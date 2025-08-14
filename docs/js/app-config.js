// App configuration for frontend to reach the API during local development
// Adjust this value as needed for your environment
window.API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:5002/api/v1';

// Choose where to create Stripe Checkout sessions from the frontend:
// 'sample' -> use local stripe sample server in `stripe-sample-code` (expects price IDs)
// 'api'    -> use your Express API at API_BASE_URL (expects name/amount/quantity)
window.CHECKOUT_MODE = window.CHECKOUT_MODE || 'api';

// Base URL for the stripe sample server
window.STRIPE_SAMPLE_BASE_URL = window.STRIPE_SAMPLE_BASE_URL || 'http://127.0.0.1:5002/api/v1';

// Use Stripe Product IDs to create one-time Prices on the server (sample mode)
// Set to true only if your STRIPE_SECRET_KEY belongs to the same account as your prod_ IDs
window.STRIPE_USE_PRODUCTS = window.STRIPE_USE_PRODUCTS ?? true;


