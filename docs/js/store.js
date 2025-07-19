// Store functionality
console.log('Store script loaded');
const products = [
    {
        id: 1,
        name: "Custom Made Mug",
        price: 12.99,
        originalPrice: 16.99,
        image: "./images/mug.jpg",
        description: "Sip with Purpose – Fuel the Carers' Movement. This isn't just a mug—it's a daily act of solidarity. Made from premium ceramic, it features the CarersMind logo as a badge of honor for those who care tirelessly.",
        category: "mugs",
        stock: 30,
        features: ["Holds 350ml of tea, coffee, or resilience", "Dishwasher-safe (because you've got enough to wash)", "Every purchase funds 30 mins of peer support for unpaid carers"],
        specialOffer: "Limited Offer: First 50 buyers get a FREE self-care guide (PDF)"
    },
    {
        id: 2,
        name: "Carer's Care T-Shirt",
        price: 19.99,
        bundlePrice: 35.00, // for 2
        image: "./images/t-shirt.jpg",
        description: "Wear Your Heart (And Your Impact). Super-soft 100% cotton tee with the CarersMind logo—because carers deserve comfort on and off duty.",
        category: "t-shirts",
        stock: 50,
        colors: ["Black", "White", "Navy"],
        features: ["Unisex fit (S-XXL) for all body types", "Ethically printed in the UK", "£5 from each sale sponsors mental health workshops"],
        personalization: "I Am a Carer Edition: Add your name/care role (+£3.50)"
    },
    {
        id: 3,
        name: "Carer's Care Cap",
        price: 16.99,
        originalPrice: 22.00,
        bundlePrice: 45.00, // for 3
        image: "./images/cap.jpg",
        description: "Shade Your Eyes, Not Your Light. A breathable, adjustable cap to shield you from the sun—and the world's indifference to carers' struggles.",
        category: "caps",
        stock: 12, // Only 12 left!
        features: ["One-size-fits-most (no awkward sizing)", "UV protection for those long shifts", "Pack of 3 for £45"],
        specialOffer: "Pair It With: Our mug for a 'Shift Survival Kit' (£25)"
    },
    {
        id: 4,
        name: "CarersMind Wristband",
        price: 4.99,
        bundlePrice: 20.00, // for 5
        image: "./images/wristband.jpg",
        description: "Silent Signal of Support. A lightweight, waterproof wristband to remind carers they're seen—and remind the world to step up.",
        category: "accessories",
        stock: 100,
        colors: ["Blue", "White", "Black"],
        features: ["'Care for the Carer' embossed text", "100% silicone (hypoallergenic)", "Buy 1 = Donate 1 to a carer in crisis"],
        specialOffer: "Launch Deal: First 100 orders get a free sticker pack"
    },
    {
        id: 5,
        name: "Carer's Comfort Kit",
        price: 39.99,
        originalPrice: 54.96,
        image: "./images/comfort-kit.jpg",
        description: "Bundle Deal – Because caring for others starts with caring for YOU.",
        category: "bundles",
        stock: 25,
        includes: ["1 Mug", "1 T-Shirt", "1 Wristband", "BONUS: Printable 'Mental Health Check-In' guide"],
        features: ["Save 27% off individual prices", "Perfect gift for carers", "Supports the CarersMind mission"]
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

    productsGrid.innerHTML = products.map(product => {
        // Calculate discount percentage if there's an original price
        const discount = product.originalPrice 
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;
            
        // Stock status
        const stockStatus = product.stock === 0 
            ? 'out-of-stock' 
            : product.stock <= 10 
                ? 'low-stock' 
                : 'in-stock';
        
        // Stock message
        const stockMessage = product.stock === 0
            ? 'Out of Stock'
            : product.stock <= 10
                ? `Only ${product.stock} Left!`
                : 'In Stock';
                
        // Stock icon
        const stockIcon = product.stock === 0
            ? 'fa-times-circle'
            : product.stock <= 10
                ? 'fa-exclamation-circle'
                : 'fa-check-circle';
        
        return `
        <div class="product-card" data-id="${product.id}">
            ${discount > 0 ? `<div class="product-ribbon">${discount}% OFF</div>` : ''}
            
            <div class="product-image-container">
                <img 
                    src="${product.image}" 
                    alt="${product.name}"
                    onerror="this.onerror=null; this.src='https://via.placeholder.com/600x600?text=Image+Not+Found';"
                    loading="lazy"
                    draggable="false"
                >
            </div>
            
            <div class="product-details">
                <div class="stock-indicator ${stockStatus}">
                    <i class="fas ${stockIcon}"></i> ${stockMessage}
                </div>
                
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                
                ${product.features && product.features.length > 0 ? `
                    <div class="product-features">
                        <ul>${product.features.map(feature => `
                            <li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                        </ul>
                    </div>` : ''
                }
                
                ${product.includes ? `
                    <div class="bundle-includes">
                        <strong>This Bundle Includes:</strong>
                        <ul>${product.includes.map(item => `
                            <li>${item}</li>`).join('')}
                        </ul>
                    </div>` : ''
                }
                
                <div class="product-price-container">
                    <span class="product-price">£${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `
                        <span class="original-price">£${product.originalPrice.toFixed(2)}</span>
                        <span class="price-savings">Save £${(product.originalPrice - product.price).toFixed(2)}</span>` : ''
                    }
                    
                    ${product.bundlePrice ? `
                        <div class="bundle-offer">
                            <i class="fas fa-tags"></i>
                            <span>${product.id === 4 ? '5' : product.id === 3 ? '3' : '2'} for £${product.bundlePrice.toFixed(2)} (Save £${(product.price * (product.id === 4 ? 5 : product.id === 3 ? 3 : 2) - product.bundlePrice).toFixed(2)})</span>
                        </div>` : ''
                    }
                </div>
                
                ${product.specialOffer ? `
                    <div class="special-offer">
                        <i class="fas fa-gift"></i>
                        <span>${product.specialOffer}</span>
                    </div>` : ''
                }
                
                ${product.personalization ? `
                    <div class="personalization">
                        <i class="fas fa-pen"></i>
                        <span>${product.personalization}</span>
                    </div>` : ''
                }
                
                <button 
                    class="add-to-cart ${product.stock === 0 ? 'disabled' : ''}" 
                    data-id="${product.id}" 
                    ${product.stock === 0 ? 'disabled' : ''}
                >
                    <i class="fas ${product.stock === 0 ? 'fa-times' : 'fa-shopping-cart'}"></i>
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                
                ${product.stock > 0 ? `
                    <div class="shipping-note">
                        <i class="fas fa-truck"></i>
                        <span>FREE UK shipping on orders over £30</span>
                    </div>` : ''
                }
            </div>
        </div>`;
    }).join('');
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
        
        // Checkout button click
        if (e.target.id === 'checkout-button' || e.target.closest('#checkout-button')) {
            e.preventDefault();
            checkout();
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
        showNotification('Your cart is empty. Add some items first!', 'error');
        return;
    }

    // Prepare cart data for URL parameters
    const cartData = JSON.stringify(cart);
    const encodedCart = encodeURIComponent(cartData);
    
    // Redirect to checkout page with cart data
    // Checkout is currently unavailable
    alert('Checkout functionality is coming soon! Please check back later.');
    // Keep the user on the cart page
    return false;
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
