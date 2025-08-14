document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const cartIcon = document.querySelector('.cart-icon');
    const cartOverlay = document.querySelector('.cart-overlay');
    const closeCart = document.querySelector('.close-cart');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total span');
    const cartCount = document.querySelector('.cart-count');
    const products = document.querySelectorAll('.product-card');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Cart array to store items
    let cart = [];
    
    // Event Listeners
    cartIcon.addEventListener('click', () => {
        cartOverlay.style.display = 'flex';
    });
    
    closeCart.addEventListener('click', () => {
        cartOverlay.style.display = 'none';
    });
    
    // Add to cart functionality
    products.forEach(product => {
        product.querySelector('.add-to-cart').addEventListener('click', () => {
            const productId = product.getAttribute('data-id');
            const productTitle = product.querySelector('h3').textContent;
            const productPrice = parseFloat(product.querySelector('.price').textContent.replace('$', ''));
            const productImg = product.querySelector('img').src;
            
            addToCart(productId, productTitle, productPrice, productImg);
        });
    });
    
    // Add to cart function
    function addToCart(id, title, price, img) {
        // Check if item already in cart
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                title,
                price,
                img,
                quantity: 1
            });
        }
        
        updateCart();
    }
    
    // Update cart UI
    function updateCart() {
        renderCartItems();
        updateCartTotal();
        updateCartCount();
    }
    
    // Render cart items
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
            return;
        }
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <img src="${item.img}" alt="${item.title}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <div class="remove-item" data-id="${item.id}">Remove</div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        // Add event listeners to quantity buttons and remove buttons
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                decreaseQuantity(id);
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                increaseQuantity(id);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                removeItem(id);
            });
        });
    }
    
    // Update cart total
    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Update cart count
    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = count;
    }
    
    // Increase quantity
    function increaseQuantity(id) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += 1;
            updateCart();
        }
    }
    
    // Decrease quantity
    function decreaseQuantity(id) {
        const item = cart.find(item => item.id === id);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                removeItem(id);
                return;
            }
            updateCart();
        }
    }
    
    // Remove item
    function removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        updateCart();
    }
    
    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
        } else {
            alert(`Order placed! Total: $${cartTotal.textContent.substring(1)}`);
            cart = [];
            updateCart();
            cartOverlay.style.display = 'none';
        }
    });
});