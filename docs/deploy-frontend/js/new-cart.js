/**
 * New Cart System with Enhanced UI/UX
 * Features:
 * - Modern, responsive design
 * - Smooth animations
 * - Persistent storage
 * - Quantity controls
 * - Real-time updates
 */

class Cart {
    constructor() {
        this.items = [];
        this.load();
        this.initEventListeners();
        this.updateCartUI();
    }

    // Initialize event listeners
    initEventListeners() {
        // Delegate events for dynamic elements
        document.body.addEventListener('click', (e) => {
            // Handle quantity increase
            if (e.target.closest('.quantity-increase')) {
                const itemId = e.target.closest('[data-id]').dataset.id;
                this.increaseQuantity(parseInt(itemId));
            }
            // Handle quantity decrease
            else if (e.target.closest('.quantity-decrease')) {
                const itemId = e.target.closest('[data-id]').dataset.id;
                this.decreaseQuantity(parseInt(itemId));
            }
            // Handle remove item
            else if (e.target.closest('.remove-item')) {
                const itemId = e.target.closest('[data-id]').dataset.id;
                this.removeItem(parseInt(itemId));
            }
        });
    }

    // Add item to cart
    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.save();
        this.updateCartUI();
        this.showNotification(`${product.name} added to cart!`, 'success');
        this.animateAddToCart(product.id);
    }

    // Remove item from cart
    removeItem(productId) {
        const itemIndex = this.items.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const item = this.items[itemIndex];
            this.items.splice(itemIndex, 1);
            this.save();
            this.updateCartUI();
            this.showNotification(`${item.name} removed from cart`, 'info');
            this.animateRemoveItem(productId);
        }
    }

    // Update item quantity
    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) return;
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.save();
            this.updateCartUI();
        }
    }

    // Increase item quantity
    increaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity++;
            this.save();
            this.updateCartUI();
        }
    }

    // Decrease item quantity
    decreaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item && item.quantity > 1) {
            item.quantity--;
            this.save();
            this.updateCartUI();
        } else if (item && item.quantity === 1) {
            this.removeItem(productId);
        }
    }

    // Get total items in cart
    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get all items
    getItems() {
        return [...this.items];
    }

    // Clear cart
    clear() {
        this.items = [];
        this.save();
        this.updateCartUI();
    }

    // Save cart to localStorage
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Load cart from localStorage
    load() {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
            }
        } catch (e) {
            console.error('Error loading cart:', e);
            this.items = [];
        }
    }

    // Update cart UI
    updateCartUI() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateCartTotal();
        this.updateCheckoutButton();
    }

    // Update cart item count in header
    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const count = this.getItemCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }

    // Update cart items list
    updateCartItems() {
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="/index.html#store" class="btn btn-primary">Continue Shopping</a>
                </div>`;
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="price">£${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-decrease" aria-label="Decrease quantity">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-increase" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item" aria-label="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                    <div class="item-total">£${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }

    // Update cart total
    updateCartTotal() {
        const subtotal = document.getElementById('subtotal');
        const total = document.getElementById('total');
        const shippingInfo = document.getElementById('shipping-info');
        
        if (subtotal) subtotal.textContent = `£${this.getTotal().toFixed(2)}`;
        if (total) total.textContent = `£${this.getTotal().toFixed(2)}`;
        
        // Update shipping info
        if (shippingInfo) {
            const freeShippingThreshold = 50;
            const amountNeeded = (freeShippingThreshold - this.getTotal()).toFixed(2);
            
            if (this.getTotal() >= freeShippingThreshold) {
                shippingInfo.innerHTML = '<i class="fas fa-check-circle"></i> Free shipping applied!';
                shippingInfo.className = 'shipping-info free-shipping';
            } else {
                shippingInfo.textContent = `Add £${amountNeeded} more for free shipping`;
                shippingInfo.className = 'shipping-info';
            }
        }
    }

    // Update checkout button state
    updateCheckoutButton() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.items.length === 0;
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove notification
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Close button
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Animate add to cart
    animateAddToCart(productId) {
        const button = document.querySelector(`.add-to-cart[data-id="${productId}"]`);
        if (!button) return;
        
        button.classList.add('added');
        setTimeout(() => button.classList.remove('added'), 1000);
    }

    // Animate item removal
    animateRemoveItem(productId) {
        const item = document.querySelector(`.cart-item[data-id="${productId}"]`);
        if (item) {
            item.classList.add('removing');
            setTimeout(() => item.remove(), 300);
        }
    }
}

// Initialize cart when DOM is loaded and Firebase is ready
function initializeCart() {
    // Create cart instance
    window.cart = new Cart();
    
    // Make cart methods globally available
    window.addToCart = (product, quantity = 1) => window.cart.addItem(product, quantity);
    window.removeFromCart = (productId) => window.cart.removeItem(productId);
    window.updateQuantity = (productId, quantity) => window.cart.updateQuantity(productId, quantity);
    window.clearCart = () => window.cart.clear();
    
    // Initialize cart on cart page
    if (document.getElementById('cart-items')) {
        window.cart.updateCartUI();
    }
    
    console.log('Cart system initialized');
}

// Wait for DOM and Firebase to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is already initialized
    if (window.firebase) {
        initializeCart();
    } else {
        // Wait for Firebase to be ready
        document.addEventListener('firebase-initialized', initializeCart);
    }
});
