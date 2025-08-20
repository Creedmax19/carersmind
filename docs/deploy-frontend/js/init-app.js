/**
 * Application Initialization Script
 * Ensures all dependencies are loaded in the correct order
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        firebase: {
            version: '9.22.0',
            apiKey: 'AIzaSyAkhBk-9_y6LIs3MjUjbyidk6f8BXS7_Hg',
            authDomain: 'carersmind-cic.firebaseapp.com',
            projectId: 'carersmind-cic',
            storageBucket: 'carersmind-cic.firebasestorage.app',
            messagingSenderId: '728928980981',
            appId: '1:728928980981:web:adef960c40dd1bed065abc',
            measurementId: 'G-FJ2X4R3T94'
        },
        cdn: {
            firebase: 'https://www.gstatic.com/firebasejs',
            fontAwesome: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            googleFonts: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
            stripe: 'https://js.stripe.com/v3/'
        }
    };

    // State management
    const appState = {
        loaded: {
            firebase: false,
            cart: false,
            store: false
        },
        initialized: false
    };

    // Load a script with error handling and retries
    function loadScript(src, maxRetries = 3, retryDelay = 1000) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            let lastError = null;

            function attempt() {
                attempts++;
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => resolve();
                script.onerror = (error) => {
                    lastError = error;
                    if (attempts < maxRetries) {
                        console.warn(`Attempt ${attempts} failed for ${src}, retrying...`);
                        setTimeout(attempt, retryDelay * attempts);
                    } else {
                        reject(new Error(`Failed to load script after ${maxRetries} attempts: ${src}`));
                    }
                };
                document.head.appendChild(script);
            }

            attempt();
        });
    }

    // Load a stylesheet
    function loadStylesheet(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        }).catch(error => {
            console.warn(`Failed to load stylesheet: ${href}`, error);
        });
    }

    // Initialize Firebase
    async function initializeFirebase() {
        if (window.firebase?.apps?.length) {
            console.log('Firebase already initialized');
            return window.firebase;
        }

        try {
            // Load Firebase scripts
            await loadScript(`${CONFIG.cdn.firebase}/${CONFIG.firebase.version}/firebase-app-compat.js`);
            await loadScript(`${CONFIG.cdn.firebase}/${CONFIG.firebase.version}/firebase-auth-compat.js`);
            await loadScript(`${CONFIG.cdn.firebase}/${CONFIG.firebase.version}/firebase-firestore-compat.js`);
            await loadScript(`${CONFIG.cdn.firebase}/${CONFIG.firebase.version}/firebase-storage-compat.js`);

            // Initialize Firebase
            window.firebase.initializeApp(CONFIG.firebase);
            console.log('Firebase initialized successfully');
            
            // Initialize services
            window.auth = window.firebase.auth();
            window.db = window.firebase.firestore();
            window.storage = window.firebase.storage();

            // Enable offline persistence
            try {
                await window.db.enablePersistence();
                console.log('Firestore persistence enabled');
            } catch (err) {
                console.warn('Firestore offline persistence not supported:', err);
            }

            appState.loaded.firebase = true;
            return window.firebase;
        } catch (error) {
            console.error('Failed to initialize Firebase:', error);
            throw error;
        }
    }

    // Initialize the cart system
    function initializeCart() {
        if (window.cart) {
            console.log('Cart already initialized');
            return window.cart;
        }

        try {
            // Load cart script if not already loaded
            if (!document.querySelector('script[src*="new-cart.js"]')) {
                const script = document.createElement('script');
                script.src = '/js/new-cart.js';
                document.head.appendChild(script);
            }

            // Wait for cart to be available
            const checkCart = setInterval(() => {
                if (window.cart) {
                    clearInterval(checkCart);
                    appState.loaded.cart = true;
                    console.log('Cart system initialized');
                    document.dispatchEvent(new CustomEvent('cart-ready'));
                }
            }, 100);

            // Timeout after 5 seconds
            setTimeout(() => {
                if (!window.cart) {
                    console.error('Failed to initialize cart: timeout');
                    clearInterval(checkCart);
                }
            }, 5000);
        } catch (error) {
            console.error('Failed to initialize cart:', error);
            throw error;
        }
    }

    // Initialize the application
    async function initializeApp() {
        if (appState.initialized) {
            console.log('App already initialized');
            return;
        }

        console.log('Initializing application...');

        try {
            // Load required styles
            await Promise.all([
                loadStylesheet(CONFIG.cdn.fontAwesome),
                loadStylesheet(CONFIG.cdn.googleFonts)
            ]);

            // Initialize Firebase
            await initializeFirebase();

            // Initialize cart
            initializeCart();

            // Mark as initialized
            appState.initialized = true;
            console.log('Application initialized successfully');
            document.dispatchEvent(new CustomEvent('app-ready'));
        } catch (error) {
            console.error('Failed to initialize application:', error);
            // Show user-friendly error message
            const errorEl = document.createElement('div');
            errorEl.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ffebee;
                color: #c62828;
                padding: 15px;
                text-align: center;
                z-index: 9999;
                font-family: Arial, sans-serif;
            `;
            errorEl.textContent = 'Failed to load the application. Please check your internet connection and refresh the page.';
            document.body.prepend(errorEl);
        }
    }

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

    // Make initialization function available globally
    window.initializeApp = initializeApp;
})();
