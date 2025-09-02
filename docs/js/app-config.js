// App configuration for frontend to reach the API
// Automatically detects environment and sets appropriate URLs
(function() {
    'use strict';
    
    // Detect environment - production-focused
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    // Production URLs
    const PROD_API_URL = 'https://api.carersmind.co.uk';
    const PROD_STRIPE_SAMPLE_URL = 'https://stripe.carersmind.co.uk';
    
    // Local development URLs
    const DEV_API_URL = 'http://localhost:3001';
    const DEV_STRIPE_SAMPLE_URL = 'http://localhost:3001/stripe';
    
    // Set URLs based on environment
    window.API_BASE_URL = isLocalhost ? DEV_API_URL : PROD_API_URL;
    window.STRIPE_SAMPLE_BASE_URL = isLocalhost ? DEV_STRIPE_SAMPLE_URL : PROD_STRIPE_SAMPLE_URL;
    
    // Choose where to create Stripe Checkout sessions from the frontend:
    // 'sample' -> use local stripe sample server in `stripe-sample-code` (expects price IDs)
    // 'api'    -> use your Express API at API_BASE_URL (expects name/amount/quantity/productId)
    window.CHECKOUT_MODE = window.CHECKOUT_MODE || 'api';
    
    // Use Stripe Product IDs to create one-time Prices on the server (sample mode)
    // Set to true only if your STRIPE_SECRET_KEY belongs to the same account as your prod_ IDs
    window.STRIPE_USE_PRODUCTS = window.STRIPE_USE_PRODUCTS ?? true;
    
    // Environment indicator for debugging
    window.ENVIRONMENT = isLocalhost ? 'development' : 'production';
    
    // Log configuration for debugging
    console.log(`CarersMind App Config - Environment: ${window.ENVIRONMENT}`);
    console.log(`API Base URL: ${window.API_BASE_URL}`);
    console.log(`Stripe Sample URL: ${window.STRIPE_SAMPLE_BASE_URL}`);
    console.log(`Checkout Mode: ${window.CHECKOUT_MODE}`);
})();


