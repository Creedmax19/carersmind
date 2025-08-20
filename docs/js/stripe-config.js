// Stripe Configuration - Automatically detects environment
(function() {
    'use strict';
    
    // Detect environment
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('vercel.app');
    
    // Stripe Publishable Keys
    const LIVE_STRIPE_KEY = 'pk_live_51RuCnOPFUpEhEPQsxVcajdjRx6k2seNunhbFI2QsrbQ53bmwMo00pGnCUAj34SOp82ruTi4NKEy7BPurjf4qDxOy00LAOeR1Mj';
    const TEST_STRIPE_KEY = 'pk_test_51RuCo4AbgyHA5XcoXa8NWWQm11OsYSetjiQyNoXPohvyzQDwePqaJDPwX9OPgFaK6KgBeDugFwCs67lBpg7hGagS00eyrmVJuc';
    
    // Set the appropriate key based on environment
    window.STRIPE_PUBLISHABLE_KEY = isLocalhost ? TEST_STRIPE_KEY : LIVE_STRIPE_KEY;
    
    // Environment indicator for debugging
    window.STRIPE_ENVIRONMENT = isLocalhost ? 'test' : 'live';
    
    // Log configuration for debugging
    console.log(`Stripe Config - Environment: ${window.STRIPE_ENVIRONMENT}`);
    console.log(`Stripe Key: ${window.STRIPE_PUBLISHABLE_KEY.substring(0, 20)}...`);
    
    // Helper function to get Stripe instance
    window.getStripeInstance = function() {
        if (typeof Stripe === 'function') {
            return Stripe(window.STRIPE_PUBLISHABLE_KEY);
        } else {
            console.error('Stripe.js not loaded');
            return null;
        }
    };
})();
