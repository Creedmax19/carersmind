/**
 * Firebase Initialization Script
 * Ensures all Firebase services are properly loaded and initialized
 */

// Wait for Firebase to be loaded
if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not found. Make sure firebase-app.js is loaded first.');
} else {
    console.log('Firebase SDK loaded, initializing services...');
    
    // Initialize Firebase if not already initialized
    if (!firebase.apps.length) {
        try {
            // Try to get config from window object or use default
            const config = window.firebaseConfig || {
                apiKey: "AIzaSyD...",
                authDomain: "your-project-id.firebaseapp.com",
                projectId: "your-project-id",
                storageBucket: "your-project-id.appspot.com",
                messagingSenderId: "1234567890",
                appId: "1:1234567890:web:abc123def456"
            };
            
            firebase.initializeApp(config);
            console.log('Firebase initialized with config:', config.projectId);
        } catch (error) {
            console.error('Error initializing Firebase:', error);
        }
    }
    
    // Initialize services
    try {
        // Initialize auth service
        if (typeof authService === 'undefined' && typeof FirebaseAuthService !== 'undefined') {
            window.authService = new FirebaseAuthService();
            console.log('authService initialized');
        }
        
        // Initialize order service
        if (typeof orderService === 'undefined' && typeof OrderService !== 'undefined') {
            window.orderService = new OrderService();
            console.log('orderService initialized');
        }
        
        // Initialize admin auth service if on admin page
        if (window.location.pathname.includes('admin') && typeof AdminAuthService !== 'undefined') {
            window.adminAuthService = new AdminAuthService();
            console.log('adminAuthService initialized');
        }
        
        console.log('Firebase services initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase services:', error);
    }
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebase;
}
