class StripeService {
    constructor() {
        // Initialize with your publishable key (replace with your test key)
        if (typeof Stripe !== 'function') {
            throw new Error('Stripe.js not loaded. Ensure https://js.stripe.com/v3/ is included once.');
        }
        this.stripe = Stripe('pk_test_51RuCo4AbgyHA5XcoyQjQ054R8jfbfuSELZacUuh2cTQgrBbZxZdTMXSAazIy8dpxcIGB987BSsPQ33woGtTXIpYE00gIMx8N8J');
        this.baseUrl = 'https://us-central1-carersmind-cic.cloudfunctions.net'; // Update with your Firebase project ID
    }

    async createCheckoutSession(cartItems, successUrl, cancelUrl, customerEmail = '') {
        try {
            const response = await fetch(`${this.baseUrl}/createCheckoutSession`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cartItems,
                    successUrl: successUrl,
                    cancelUrl: cancelUrl,
                    customerEmail: customerEmail
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create checkout session');
            }

            const session = await response.json();

            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.id
            });

            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Error:', error);
            throw error; // Re-throw to handle in the calling code
        }
    }
}

// Initialize and make available globally
if (typeof window !== 'undefined') {
    // Do not auto-instantiate to avoid multiple loads; initialize explicitly when needed
}
