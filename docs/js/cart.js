document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const quantityBtns = document.querySelectorAll('.quantity-btn');
    const removeBtns = document.querySelectorAll('.remove-item');
    
    // Initialize cart
    let cart = [];
    
    // Load cart from localStorage if available
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
        } else {
            // Demo cart items
            cart = [
                { id: 1, name: 'Supportive Care Package', price: 24.99, quantity: 1, image: '/images/product1.jpg' },
                { id: 2, name: "Carer's Guide Book", price: 12.99, quantity: 1, image: '/images/product2.jpg' }
            ];
            saveCart();
        }
    }
    
    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }
    
    // Update cart display
    function updateCartDisplay() {
        // Update quantities and totals
        cart.forEach((item, index) => {
            // Update quantity input
            if (quantityInputs[index]) {
                quantityInputs[index].value = item.quantity;
            }
            
            // Update total price for item
            const totalElement = document.querySelectorAll('.item-total')[index];
            if (totalElement) {
                totalElement.textContent = `£${(item.price * item.quantity).toFixed(2)}`;
            }
        });
        
        // Update order summary
        updateOrderSummary();
    }
    
    // Update order summary
    function updateOrderSummary() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 3.99;
        const total = subtotal + shipping;
        
        // Update summary values
        const subtotalElement = document.querySelector('.summary-row:first-child span:last-child');
        const shippingElement = document.querySelectorAll('.summary-row')[1].querySelector('span:last-child');
        const totalElement = document.querySelector('.summary-row.total span:last-child');
        const shippingInfo = document.querySelector('.shipping-info');
        
        if (subtotalElement) subtotalElement.textContent = `£${subtotal.toFixed(2)}`;
        if (shippingElement) shippingElement.textContent = shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `£${total.toFixed(2)}`;
        
        // Update shipping info
        if (shipping === 0) {
            shippingInfo.textContent = '✓ Free shipping applied';
            shippingInfo.style.color = '#38a169';
            shippingInfo.style.backgroundColor = '#f0fff4';
        } else {
            const amountNeeded = (50 - subtotal).toFixed(2);
            shippingInfo.textContent = `Add £${amountNeeded} more for free shipping`;
            shippingInfo.style.color = '';
            shippingInfo.style.backgroundColor = '';
        }
    }
    
    // Handle quantity changes
    function handleQuantityChange(input, itemId, change) {
        const item = cart.find(item => item.id === itemId);
        if (!item) return;
        
        if (change === 'increase') {
            item.quantity += 1;
        } else if (change === 'decrease' && item.quantity > 1) {
            item.quantity -= 1;
        } else if (change === 'input') {
            const newQuantity = parseInt(input.value) || 1;
            item.quantity = Math.max(1, newQuantity);
            input.value = item.quantity; // Ensure it doesn't go below 1
        }
        
        saveCart();
    }
    
    // Remove item from cart
    function removeItem(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        saveCart();
        
        // Reload the page to update the UI
        location.reload();
    }
    
    // Checkout functionality has been temporarily disabled
    
    // Quantity buttons
    quantityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.closest('.cart-item').dataset.itemId);
            const action = this.dataset.action;
            handleQuantityChange(null, itemId, action);
        });
    });
    
    // Quantity inputs
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const itemId = parseInt(this.closest('.cart-item').dataset.itemId);
            handleQuantityChange(this, itemId, 'input');
        });
    });
    
    // Remove buttons
    removeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const itemId = parseInt(this.closest('.cart-item').dataset.itemId);
            if (confirm('Are you sure you want to remove this item from your cart?')) {
                removeItem(itemId);
            }
        });
    });
    
    // Initialize cart
    loadCart();
});
