// Checkout functionality
console.log('Checkout script loaded');

document.addEventListener('DOMContentLoaded', function() {
    // Get cart data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const cartData = urlParams.get('cart');
    
    let cart = [];
    
    try {
        if (cartData) {
            cart = JSON.parse(decodeURIComponent(cartData));
            console.log('Cart data loaded:', cart);
        } else {
            console.warn('No cart data found in URL');
            // Redirect back to store if no cart data
            window.location.href = '/index.html#store';
            return;
        }
    } catch (error) {
        console.error('Error parsing cart data:', error);
        window.location.href = '/index.html#store';
        return;
    }

    // Display order summary
    renderOrderSummary(cart);
    
    // Setup payment method selection
    setupPaymentMethods();
});

// Render order summary
function renderOrderSummary(cart) {
    const orderItems = document.getElementById('order-items');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    if (!orderItems || !subtotalElement || !shippingElement || !totalElement) {
        console.error('Required order summary elements not found');
        return;
    }
    
    // Clear existing items
    orderItems.innerHTML = '';
    
    // Calculate totals
    let subtotal = 0;
    
    // Add each item to the order summary
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-details">
                <span class="item-name">${item.name} × ${item.quantity}</span>
                <span class="item-price">£${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
        orderItems.appendChild(itemElement);
    });
    
    // Calculate shipping (example: free shipping over £50, otherwise £4.99)
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const total = subtotal + shipping;
    
    // Update totals
    subtotalElement.textContent = `£${subtotal.toFixed(2)}`;
    shippingElement.textContent = shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`;
    totalElement.textContent = `£${total.toFixed(2)}`;
    
    // Store totals in session for payment processing
    sessionStorage.setItem('orderTotal', total);
    sessionStorage.setItem('orderSubtotal', subtotal);
    sessionStorage.setItem('orderShipping', shipping);
}

// Setup payment method selection
function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    const paymentDetails = document.querySelectorAll('.payment-details');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove active class from all methods
            paymentMethods.forEach(m => m.classList.remove('active'));
            
            // Add active class to clicked method
            this.classList.add('active');
            
            // Hide all payment details
            paymentDetails.forEach(detail => {
                detail.classList.remove('active');
            });
            
            // Show selected payment details
            const targetId = this.getAttribute('data-target');
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
            }
        });
    });
    
    // Initialize first payment method as active by default
    if (paymentMethods.length > 0) {
        paymentMethods[0].click();
    }
}

// Initialize Stripe payment form
function initializeStripe() {
    // This would be called when the credit card payment method is selected
    const stripe = Stripe('YOUR_PUBLISHABLE_KEY');
    const elements = stripe.elements();
    
    // Create an instance of the card Element
    const card = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        }
    });
    
    // Add an instance of the card Element into the `card-element` div
    card.mount('#card-element');
    
    // Handle real-time validation errors from the card Element
    card.addEventListener('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
    
    // Handle form submission
    const form = document.getElementById('payment-form');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const {error, paymentMethod} = await stripe.createPaymentMethod({
                type: 'card',
                card: card,
                billing_details: {
                    name: document.getElementById('card-name').value,
                    email: document.getElementById('email').value
                }
            });
            
            if (error) {
                const errorElement = document.getElementById('card-errors');
                errorElement.textContent = error.message;
            } else {
                // Handle successful payment method creation
                // You would typically send the paymentMethod.id to your server
                // along with the order details to complete the payment
                console.log('PaymentMethod:', paymentMethod);
                // processPayment(paymentMethod.id);
            }
        });
    }
}

// Call this when the credit card payment method is selected
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Stripe when the page loads
    if (typeof Stripe !== 'undefined') {
        initializeStripe();
    } else {
        console.error('Stripe.js not loaded');
    }
});
