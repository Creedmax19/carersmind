// Stripe Service for handling payments
class StripeService {
    constructor() {
        // Initialize with global Stripe configuration
        if (window.STRIPE_PUBLISHABLE_KEY) {
            this.stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY);
        } else {
            console.error('Stripe publishable key not found');
        }
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
