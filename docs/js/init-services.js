/**
 * Initialize Firebase services and make them globally available
 * This script should be included after Firebase SDKs and before other app scripts
 */

// Global flag to track if services are initialized
let servicesInitialized = false;

// Function to initialize all services
function initializeServices() {
    if (servicesInitialized) {
        console.log('Services already initialized');
        return Promise.resolve();
    }

    console.log('Initializing Firebase services...');
    
    return new Promise((resolve, reject) => {
        try {
            // Check if firebase is available
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded. Make sure Firebase scripts are included.');
            }

            // Check if Firebase is already initialized
            if (firebase.apps.length > 0) {
                console.log('Firebase already initialized');
                // Get existing app instead of creating a new one
                const app = firebase.app();
                if (!app) {
                    throw new Error('Firebase app not found');
                }
            } else {
                try {
                    const config = window.firebaseConfig;
                    if (!config) {
                        throw new Error('firebaseConfig not found on window');
                    }
                    const app = firebase.initializeApp(config);
                    console.log('Firebase initialized successfully');
                } catch (error) {
                    console.error('Firebase initialization error:', error);
                    throw error;
                }
            }

            // Get Firebase services
            const auth = firebase.auth();
            const db = firebase.firestore();
            
            // Make storage optional - only initialize if available
            let storage = null;
            try {
                if (typeof firebase.storage === 'function') {
                    storage = firebase.storage();
                    console.log('Firebase Storage initialized');
                } else {
                    console.warn('Firebase Storage not available, skipping storage initialization');
                }
            } catch (error) {
                console.warn('Failed to initialize Firebase Storage:', error);
            }

            // Check if required services are available
            if (!auth || !db) {
                throw new Error('Failed to get required Firebase services (auth, firestore)');
            }

            // Make core Firebase services available globally
            window.firebaseAuth = auth;
            window.firestore = db;
            if (storage) {
                window.firebaseStorage = storage;
            }

            // Initialize auth service
            if (typeof FirebaseAuthService === 'function' && !window.authService) {
                try {
                    window.authService = new FirebaseAuthService();
                    console.log('authService initialized');
                } catch (err) {
                    console.error('Failed to initialize authService:', err);
                    throw err;
                }
            } else if (typeof FirebaseAuthService !== 'function') {
                throw new Error('FirebaseAuthService not available');
            }

            // Initialize order service if available
            if (typeof OrderService === 'function' && !window.orderService) {
                try {
                    window.orderService = new OrderService();
                    console.log('orderService initialized');
                } catch (err) {
                    console.error('Failed to initialize orderService:', err);
                }
            }

            // Initialize admin auth service if on admin page and class is available
            if (window.location.pathname.includes('/admin/') && 
                typeof AdminAuthService === 'function' && 
                !window.adminAuthService) {
                try {
                    window.adminAuthService = new AdminAuthService();
                    console.log('adminAuthService initialized');
                } catch (err) {
                    console.error('Failed to initialize adminAuthService:', err);
                }
            }

            servicesInitialized = true;
            console.log('Firebase services initialized successfully');

            // Dispatch an event when services are ready
            const event = new CustomEvent('firebaseServicesReady', {
                detail: {
                    auth: window.authService,
                    db: db,
                    storage: storage || null
                }
            });
            document.dispatchEvent(event);

            resolve();

        } catch (error) {
            console.error('Error initializing Firebase services:', error);
            reject(error);
        }
    });
}

// Auto-initialize when the script loads
if (document.readyState === 'loading') {
    // DOM is still loading, wait for it
    document.addEventListener('DOMContentLoaded', initializeServices);
} else {
    // DOM is already loaded, initialize immediately
    initializeServices();
}

// Also make it available globally for manual initialization
window.initializeServices = initializeServices;
