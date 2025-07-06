// Firebase Authentication Service
const authService = {
    // Check if user is logged in
    isAuthenticated: () => {
        return new Promise((resolve) => {
            auth.onAuthStateChanged(user => {
                resolve(!!user);
            });
        });
    },

    // Login with email and password
    login: async (email, password) => {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error("Login error:", error);
            return { 
                success: false, 
                error: this.getErrorMessage(error.code) 
            };
        }
    },

    // Logout current user
    logout: async () => {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            console.error("Logout error:", error);
            return { success: false, error: error.message };
        }
    },

    // Get current user
    getCurrentUser: () => {
        return auth.currentUser;
    },

    // Get user-friendly error messages
    getErrorMessage: (errorCode) => {
        const errorMessages = {
            'auth/user-not-found': 'No user found with this email.',
            'auth/wrong-password': 'Invalid password.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/invalid-email': 'The email address is not valid.',
            'default': 'An error occurred. Please try again.'
        };
        return errorMessages[errorCode] || errorMessages['default'];
    }
};

// Listen for auth state changes
auth.onAuthStateChanged(user => {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('login.html');
    
    if (user && isLoginPage) {
        // If user is logged in and on login page, redirect to dashboard
        window.location.href = 'dashboard.html';
    } else if (!user && !isLoginPage && !currentPath.includes('index.html')) {
        // If user is not logged in and not on login/index page, redirect to login
        window.location.href = 'login.html';
    }
});
