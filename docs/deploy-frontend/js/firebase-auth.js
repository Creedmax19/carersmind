// Firebase Authentication Service
class FirebaseAuthService {
    constructor() {
        if (!firebase.apps.length) {
            throw new Error('Firebase not initialized. Make sure firebase-config.js is loaded first.');
        }
        
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.user = null;
        
        // Initialize auth state listener
        this.initAuthStateListener();
    }

    // Initialize auth state listener
    initAuthStateListener() {
        this.auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.user = user;
                console.log('User is signed in:', user.uid);
                // Update UI based on auth state
                this.updateAuthUI(true);
            } else {
                this.user = null;
                console.log('User is signed out');
                // Update UI based on auth state
                this.updateAuthUI(false);
            }
        });
    }

    // Update UI based on authentication state
    updateAuthUI(isLoggedIn) {
        const authElements = document.querySelectorAll('.auth-required');
        const unauthElements = document.querySelectorAll('.unauth-required');
        const userDisplay = document.getElementById('user-display');

        if (isLoggedIn) {
            authElements.forEach(el => el.style.display = 'block');
            unauthElements.forEach(el => el.style.display = 'none');
            if (userDisplay) {
                userDisplay.textContent = this.user.email;
            }
        } else {
            authElements.forEach(el => el.style.display = 'none');
            unauthElements.forEach(el => el.style.display = 'block');
            if (userDisplay) {
                userDisplay.textContent = '';
            }
        }
    }

    // Register a new user with email and password
    async register(email, password, userData) {
        try {
            const { user } = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Save additional user data to Firestore
            await this.db.collection('users').doc(user.uid).set({
                email: user.email,
                displayName: userData.name || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'user',
                ...userData
            });

            // Send email verification
            await user.sendEmailVerification();
            
            return { success: true, user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    // Login with email and password
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return { 
                success: true, 
                user: userCredential.user 
            };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }
    
    // Get current user
    getCurrentUser() {
        return this.auth.currentUser;
    }

    // Send password reset email
    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in with Apple
    async signInWithApple() {
        try {
            const provider = new firebase.auth.OAuthProvider('apple.com');
            const result = await this.auth.signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Apple sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Logout the current user
    async logout() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.user !== null;
    }

    // Check if user has admin role
    async isAdmin() {
        if (!this.user) return false;
        
        try {
            const userDoc = await this.db.collection('users').doc(this.user.uid).get();
            return userDoc.exists && userDoc.data().role === 'admin';
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }
}

// Make constructor available globally without auto-instantiation
if (typeof window !== 'undefined') {
    window.FirebaseAuthService = FirebaseAuthService;
}
