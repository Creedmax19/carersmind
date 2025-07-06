// Store functionality
console.log('Store script loaded');
const products = [
    {
        id: 1,
        name: "Custom Made Cup",
        price: 14.99,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
        description: "Custom made ceramic mug that can be personalized. Perfect for your favorite beverage.",
        category: "mugs",
        stock: 30,
        features: ["Dishwasher safe", "Microwave safe", "BPA free"]
    },
    {
        id: 2,
        name: "Carer's Care T-Shirt",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
        description: "Premium cotton t-shirt with 'Carer's Care' logo. Available in sizes S-XXL.",
        category: "t-shirts",
        stock: 50,
        colors: ["Black", "White", "Navy"]
    },
    {
        id: 3,
        name: "Custom Made Cap",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
        description: "Custom made cap with embroidered design. Adjustable fit for maximum comfort.",
        category: "caps",
        stock: 45,
        features: ["100% cotton", "Adjustable strap", "Embroidered design"]
    }
];

let cart = [];

console.log('Store script loaded - DOMContentLoaded event fired');

// Initialize store when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Store script initialized');
    const storeSection = document.getElementById('store');
    
    if (storeSection) {
        renderProducts();
        loadCart();
        setupEventListeners();
    } else {
        console.warn('Store section not found on this page');
    }
});

// Render product grid
function renderProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image-container">
                <img 
                    src="${product.image}" 
                    alt="${product.name}"
                    onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Image+Not+Found';"
                    loading="lazy"
                >
            </div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">£${product.price.toFixed(2)}</div>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Set up event listeners
function setupEventListeners() {
    // Add to cart button click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
            const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
            const productId = parseInt(button.getAttribute('data-id'));
            addToCart(productId);
        }

        // Remove from cart button click
        if (e.target.classList.contains('remove-from-cart') || e.target.closest('.remove-from-cart')) {
            const button = e.target.classList.contains('remove-from-cart') ? e.target : e.target.closest('.remove-from-cart');
            const productId = parseInt(button.getAttribute('data-id'));
            removeFromCart(productId);
        }

        // Quantity button clicks
        if (e.target.classList.contains('quantity-btn')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const action = e.target.getAttribute('data-action');
            updateQuantity(productId, action);
        }

        // Checkout button click
        if (e.target.id === 'checkout-button' || e.target.closest('#checkout-button')) {
            checkout();
        }
    });
}

// Add item to cart
function addToCart(productId, button = null) {
    // Get the button that was clicked
    const addButton = button || document.querySelector(`.add-to-cart[data-id="${productId}"]`);
    
    // Store original button content
    const originalContent = addButton ? addButton.innerHTML : null;
    
    // Show loading state
    if (addButton) {
        addButton.disabled = true;
        addButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    }
    
    // Simulate API call delay (remove in production)
    setTimeout(() => {
        const product = products.find(p => p.id === productId);
        if (!product) {
            if (addButton) {
                addButton.disabled = false;
                addButton.innerHTML = originalContent;
                showNotification('Product not found!', 'error');
            }
            return;
        }

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }

        saveCart();
        renderCart();
        
        // Show success notification
        showNotification(`${product.name} added to cart!`, 'success');
        
        // Restore button state
        if (addButton) {
            addButton.disabled = false;
            addButton.innerHTML = originalContent;
            
            // Add success animation
            addButton.classList.add('add-to-cart-success');
            setTimeout(() => {
                addButton.classList.remove('add-to-cart-success');
            }, 1000);
        }
    }, 500); // Simulated delay
}

// Remove item from cart
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        cart.splice(itemIndex, 1);
        saveCart();
        renderCart();
        showNotification(`${item.name} removed from cart.`, 'info');
    }
}

// Update item quantity in cart
function updateQuantity(productId, action) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    if (action === 'increase') {
        item.quantity += 1;
    } else if (action === 'decrease' && item.quantity > 1) {
        item.quantity -= 1;
    }

    saveCart();
    renderCart();
}

// Render cart contents
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        document.querySelector('.cart-total').style.display = 'none';
        document.getElementById('checkout-button').style.display = 'none';
        return;
    }

    document.querySelector('.cart-total').style.display = 'block';
    document.getElementById('checkout-button').style.display = 'flex';

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-details">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">£${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                    </div>
                </div>
            </div>
            <button class="remove-from-cart" data-id="${item.id}" aria-label="Remove item">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.querySelector('.cart-total').innerHTML = `Total: <span>£${total.toFixed(2)}</span>`;
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        renderCart();
    }
}

// Handle checkout process
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    // In a real app, you would redirect to a checkout page or show a checkout form
    showNotification('Proceeding to checkout...', 'info');
    
    // For demo purposes, we'll just show an alert
    setTimeout(() => {
        alert('Checkout would be processed here with a payment gateway like Stripe.');
    }, 500);
}

// Show notification to user
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create message content with icon
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Trigger reflow to enable the transition
    void notification.offsetWidth;
    
    // Show notification
    notification.classList.add('show');
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// This would be called after a successful purchase
function clearCart() {
    cart = [];
    saveCart();
    renderCart();
}

// Test function to verify store is working
function testStore() {
    console.log('Testing store functionality...');
    console.log('Products:', products);
    
    // Try to add a test product
    if (products.length > 0) {
        console.log('Adding test product to cart:', products[0].name);
        addToCart(products[0].id);
    }
}

// Run test when the page loads
if (document.getElementById('store')) {
    // Small delay to ensure everything is loaded
    setTimeout(testStore, 1000);
}
