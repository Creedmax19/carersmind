// Store functionality with cart integration
console.log('Store script loaded with cart system');

// Initialize cart array
let cart = [];

// Discount rules
const DISCOUNT_RULES = {
    1: { // Cap
        quantity: 3,
        discount: 5.01
    },
    2: { // Wristband
        quantity: 5,
        discount: 4.95
    },
    3: { // T-shirt
        quantity: 2,
        discount: 4.98
    },
    7: { // Support Card
        quantity: 2,
        discount: 2.02
    },
    8: { // Lanyard
        quantity: 2,
        discount: 2.48
    }
};

// Calculate total with discounts
function calculateTotalWithDiscounts() {
    let subtotal = 0;
    let totalDiscount = 0;
    
    // First calculate subtotal without discounts
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    // Calculate discounts
    cart.forEach(item => {
        const rule = DISCOUNT_RULES[item.id];
        if (rule && item.quantity >= rule.quantity) {
            // Calculate how many times the discount applies
            const discountTimes = Math.floor(item.quantity / rule.quantity);
            totalDiscount += rule.discount * discountTimes;
        }
    });
    
    const shipping = subtotal >= 50 ? 0 : 3.99;
    const total = subtotal - totalDiscount + shipping;
    
    // Update display
    if (document.getElementById('subtotal')) {
        document.getElementById('subtotal').textContent = `£${subtotal.toFixed(2)}`;
        document.getElementById('discount').textContent = totalDiscount > 0 ? `-£${totalDiscount.toFixed(2)}` : '';
        document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`;
        document.getElementById('total').textContent = `£${total.toFixed(2)}`;
    }
    
    // Update shipping info message
    const shippingInfo = document.getElementById('shipping-info');
    if (shippingInfo) {
        if (shipping === 0) {
            shippingInfo.textContent = 'You qualify for free shipping!';
            shippingInfo.style.color = '#27ae60';
        } else {
            const amountNeeded = (50 - subtotal).toFixed(2);
            shippingInfo.textContent = `Add £${amountNeeded} more for free shipping`;
            shippingInfo.style.color = '';
        }
    }
    
    return total;
}

// Initialize the store when the DOM is fully loaded and Firebase is ready
document.addEventListener('firebaseServicesReady', function() {
    console.log('Initializing store with cart system');
    
    try {
        // Load cart from localStorage
        loadCart();
        
        // Initialize store components
        renderProducts();
        setupEventListeners();
        updateCartCount();
        
        // Initial render of cart
        if (document.querySelector('.cart-container')) {
            renderCart();
        }
        
        console.log('Store initialized with', products.length, 'products');
        
        // Run test if on store page
        if (document.getElementById('store')) {
            // Small delay to ensure everything is loaded
            setTimeout(testStore, 1000);
        }
    } catch (error) {
        console.error('Error initializing store:', error);
    }
});

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            renderCart();
        } catch (e) {
            console.error('Error loading cart:', e);
            cart = [];
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function initializeStore() {
    console.log('Initializing store with cart system');
    
    // Render products
    renderProducts();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update cart count on page load
    updateCartCount();
    
    console.log('Store initialized with', products.length, 'products');
}

function setupEventListeners() {
    // Add to cart buttons
    document.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (addToCartBtn) {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(addToCartBtn.dataset.id);
            if (productId) {
                addToCart(productId, addToCartBtn);
            }
        }
    });

    // Cart quantity controls and remove buttons - using event delegation
    document.addEventListener('click', (e) => {
        // Handle quantity buttons
        const quantityBtn = e.target.closest('.quantity-btn');
        if (quantityBtn) {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(quantityBtn.dataset.id);
            const action = quantityBtn.dataset.action;
            if (productId && action) {
                updateQuantity(productId, action, e);
            }
            return;
        }

        // Handle remove buttons
        const removeBtn = e.target.closest('.remove-from-cart');
        if (removeBtn) {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(removeBtn.dataset.id);
            if (productId) {
                removeFromCart(productId, e);
            }
            return;
        }

        // Handle checkout button
        if (e.target.id === 'checkout-button' || e.target.closest('#checkout-button')) {
            e.preventDefault();
            e.stopPropagation();
            checkout();
        }
    });
}

// Wait for DOM and cart to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the store page
    if (document.getElementById('store')) {
        if (window.cart) {
            initializeStore();
        } else {
            // Wait for cart to be initialized
            document.addEventListener('cart-ready', initializeStore);
        }
    }
});

const products = [
    {
        id: 7,
        name: "You Matter Mental Health Support Card",
        price: 4.99,
        // Stripe Price ID for sample checkout server (optional if using productId)
        priceId: 'price_1RvIzyAbgyHA5Xcovgow97xz',
        // Provided Stripe Product ID
        productId: 'prod_SrhV5sNgAQRUjH',
        bundlePrice: 12.00,
        minBundleQty: 3,
        image: "./images/supportcard.jpg",
        description: "A tangible reminder that no carer should feel invisible. This beautifully designed card serves two powerful purposes: for givers to thank a carer who's been their rock, and for receivers as a self-care prompt for days when the world feels too heavy.",
        category: "cards",
        stock: 200,
        features: [
            "Blank inside for personal messages (or affirmations to yourself)",
            "Premium 300gsm matte finish – feels as substantial as your caregiving",
            "Ethical impact: £1 from each card funds 24/7 carer crisis texting",
            "A6 size (fits standard envelopes)",
            "Soy-based ink printing",
            "Ships in compostable packaging"
        ],
        perfectFor: [
            "Thanking a carer who's made a difference",
            "Self-care and personal encouragement",
            "Supporting carer mental health initiatives"
        ],
        specialOffer: "Pack of 3 for just £12 (Save 20%)",
        colors: ["Design as shown in image"]
    },
    {
        id: 6,
        name: "Carers' Mind Identity Lanyard",
        price: 9.99,
        priceId: '',
        productId: 'prod_SrhYwmq0ZOmMTY',
        bundlePrice: 7.50,
        minBundleQty: 10,
        image: "./images/card&.jpg",
        description: "More than a lanyard—it's a badge of honor for those who hold up the world. Designed for carers who want to be seen while keeping essentials close.",
        category: "accessories",
        stock: 100,
        features: [
            "Breakaway safety clasp (prevents workplace accidents)",
            "Adjustable 34-42\" length fits all body types",
            "Dual-sided printing: Front: 'CARERS\' MIND' in bold NHS-blue, Back: 'Mental Health Matters' with crisis hotline",
            "Waterproof ID pocket (fits standard NHS badges)",
            "Every lanyard funds 30 mins of our Carer Support Chatline"
        ],
        perfectFor: [
            "Care homes ordering for staff recognition",
            "Student carers needing campus visibility",
            "Self-identifying carers at support groups"
        ],
        specialOffer: "Bulk discount: Order 10+ for just £7.50 each (Care homes save 25%)",
        colors: ["NHS Blue"]
    },
    {
        id: 1,
        name: "Custom Made Mug",
        price: 12.99,
        priceId: '',
        productId: 'prod_Srhatpx0iuqPp5',
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
        priceId: '',
        productId: 'prod_SrhjuFaxSxvoyr',
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
        priceId: '',
        productId: 'prod_Srhm4HAboUe26V',
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
        priceId: '',
        productId: 'prod_SrhngyILWUc43p',
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
        priceId: '',
        productId: 'prod_Srhp2AG8Emw1L7',
        originalPrice: 54.96,
        image: "./images/comfortkit.jpg",
        description: "Bundle Deal – Because caring for others starts with caring for YOU.",
        category: "bundles",
        stock: 25,
        includes: ["1 Mug", "1 T-Shirt", "1 Wristband", "BONUS: Printable 'Mental Health Check-In' guide"],
        features: ["Save 27% off individual prices", "Perfect gift for carers", "Supports the CarersMind mission"]
    }
];

// Cart functions

// Update cart count in header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Remove duplicate initialization - now handled above

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

// Add item to cart with enhanced UI feedback
function addToCart(productId, button = null) {
    // Prevent multiple rapid clicks
    if (window.addingToCart) return;
    window.addingToCart = true;

    // Get the button that was clicked
    const addButton = button || document.querySelector(`.add-to-cart[data-id="${productId}"]`);
    
    // Store original button content
    const originalContent = addButton ? addButton.innerHTML : null;
    
    // Show loading state
    if (addButton) {
        addButton.disabled = true;
        addButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    }
    
    // Find the product
    const product = products.find(p => p.id === productId);
    if (!product) {
        if (addButton) {
            addButton.disabled = false;
            addButton.innerHTML = originalContent;
            showNotification('Product not found!', 'error');
        }
        window.addingToCart = false;
        return;
    }

    try {
        // Check if product is already in cart
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex > -1) {
            // Item exists, update quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item to cart
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        saveCart();
        updateCartCount();
        renderCart();
        showNotification(`${product.name} added to cart!`, 'success');
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding item to cart', 'error');
    } finally {
        // Restore button state
        if (addButton) {
            addButton.disabled = false;
            addButton.innerHTML = originalContent || 'Add to Cart';
            
            // Add success animation
            addButton.classList.add('add-to-cart-success');
            setTimeout(() => {
                addButton.classList.remove('add-to-cart-success');
                window.addingToCart = false;
            }, 1000);
        } else {
            window.addingToCart = false;
        }
    }
}

// Update cart count in header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'inline-block' : 'none';
    }
    
    // Update the cart items count in the cart page
    const cartItemCount = document.getElementById('cart-item-count');
    if (cartItemCount) {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartItemCount.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
    }
    
    // Update the checkout button state
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
    
    // Calculate and display totals with discounts
    calculateTotalWithDiscounts();
}

// Remove item from cart
function removeFromCart(productId, event = null) {
    if (event) event.stopPropagation();
    
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        cart.splice(itemIndex, 1);
        saveCart();
        updateCartCount();
        renderCart();
        showNotification(`${item.name} removed from cart.`, 'info');
    }
}

// Update item quantity in cart
function updateQuantity(productId, action, event = null) {
    if (event) event.stopPropagation();
    
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return false;
    
    try {
        if (action === 'increase') {
            cart[itemIndex].quantity += 1;
        } else if (action === 'decrease') {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                // If quantity would be 0, remove the item
                removeFromCart(productId);
                return true;
            }
        }
        
        saveCart();
        updateCartCount();
        renderCart();
        return true;
    } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('Error updating quantity', 'error');
        return false;
    }
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
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-details">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='/images/placeholder.jpg'">
                <div>
                    <h4>${item.name}</h4>
                    <div>£${item.price.toFixed(2)} × ${item.quantity}</div>
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
    
    // Persist cart for login flow
    localStorage.setItem('cart', JSON.stringify(cart));

    // If user is logged in, create Stripe Checkout session immediately
    if (typeof authService !== 'undefined' && authService.getCurrentUser()) {
        (async () => {
            try {
                const user = authService.getCurrentUser();
                let idToken = '';
                try {
                    idToken = await user.getIdToken();
                } catch (e) {
                    console.warn('Could not obtain ID token; proceeding without Authorization header');
                }

                let response;
                if (window.CHECKOUT_MODE === 'sample') {
                    const itemsForSample = [];
                    for (const item of cart) {
                        const product = products.find(p => p.id === item.id) || item;
                        const qty = Math.max(1, Number(item.quantity) || 1);
                        if (product && product.priceId) {
                            itemsForSample.push({ price: product.priceId, quantity: qty });
                            continue;
                        }

                        const unitAmount = Math.floor(((product && product.price) ? product.price : Number(item.price) || 0) * 100);
                        if (!unitAmount) {
                            console.warn('Skipping item with zero/invalid amount', item);
                            continue;
                        }

                        if (window.STRIPE_USE_PRODUCTS && product && product.productId) {
                            // Send product reference so server can create a one-time price tied to this product
                            itemsForSample.push({ product: product.productId, unit_amount: unitAmount, currency: 'gbp', quantity: qty });
                        } else {
                            // Fallback to inline product data
                            itemsForSample.push({
                                price_data: {
                                    currency: 'gbp',
                                    unit_amount: unitAmount,
                                    product_data: { name: (product && product.name) || item.name || `Item ${item.id}` }
                                },
                                quantity: qty
                            });
                        }
                    }
                    if (itemsForSample.length === 0) throw new Error('No valid items available for checkout.');
                    response = await fetch(`${window.STRIPE_SAMPLE_BASE_URL}/create-checkout-session`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items: itemsForSample, metadata: { userId: user.uid } })
                    });
                } else {
                    const serverItems = cart.map((item) => {
                        const product = products.find(p => p.id === item.id);
                        return {
                            name: product ? product.name : (item.name || `Item ${item.id}`),
                            amount: product ? product.price : Number(item.price) || 0,
                            quantity: Number(item.quantity) || 1,
                            productId: product ? product.productId : null
                        };
                    });

                    const apiBase = (window.API_BASE_URL || '/api/v1');
                    response = await fetch(`${apiBase}/payments/create-checkout-session`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
                        },
                        body: JSON.stringify({
                            items: serverItems,
                            successUrl: `${window.location.origin}/payment-success.html`,
                            cancelUrl: `${window.location.origin}/index.html#store`,
                            metadata: { userId: user.uid }
                        })
                    });
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed to create checkout session: ${response.status}`);
                }

                const data = await response.json();
                
                if ((data && data.success && data.url) || (data && data.url)) {
                    window.location.href = data.url;
                    return;
                }

                // Fallback to sessionId flow if provided
                if (data && data.id) {
                    if (typeof Stripe !== 'function') throw new Error('Stripe.js not loaded');
                    const stripe = window.getStripeInstance();
                    if (!stripe) throw new Error('Stripe not initialized');
                    const result = await stripe.redirectToCheckout({ sessionId: data.id, mode: 'payment' });
                    if (result.error) throw result.error;
                    return;
                }

                throw new Error('Unexpected response from checkout session API');
            } catch (error) {
                console.error('Checkout error:', error);
                showNotification(error.message || 'Failed to start checkout', 'error');
            }
        })();
    } else {
        // If not logged in, set redirect hint and go to login
        localStorage.setItem('redirectAfterLogin', '/stripe-checkout');
        window.location.href = 'login.html?redirect=checkout';
    }
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

// Test function moved to firebaseServicesReady event handler
