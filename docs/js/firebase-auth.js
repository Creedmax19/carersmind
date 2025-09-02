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

            // Redirect logic after successful login/registration
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');
            if (this.user && this.user.uid) {
                const userDocRef = this.db.collection('users').doc(this.user.uid);
                userDocRef.get().then(doc => {
                    if (doc.exists && doc.data().role === 'admin') {
                        // If admin, redirect to admin dashboard
                        if (!window.location.pathname.startsWith('/admin/')) {
                            window.location.href = '/admin/dashboard.html';
                        }
                    } else {
                        // If regular user or no specific role, redirect as normal
                        if (redirect) {
                            window.location.href = decodeURIComponent(redirect);
                        } else if (window.location.pathname.startsWith('/admin/')) {
                            // If a non-admin user somehow lands on an admin page, redirect them home
                            window.location.href = '/';
                        }
                    }
                }).catch(error => {
                    console.error('Error fetching user role:', error);
                    // Fallback redirect in case of error
                    if (redirect) {
                        window.location.href = decodeURIComponent(redirect);
                    } else if (window.location.pathname.startsWith('/admin/')) {
                        window.location.href = '/';
                    }
                });
            } else if (redirect) {
                window.location.href = decodeURIComponent(redirect);
            } else if (window.location.pathname.startsWith('/admin/')) {
                window.location.href = '/';
            }
        } else {
            // If logged out and on an auth-required page, redirect to login
            if (window.location.pathname.includes('admin/dashboard.html')) {
                window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            }
        }
    }

    // Register a new user with email and password
    async register(email, password, userData) {
        try {
            console.log('Registration attempt with email:', email);
            
            const { user } = await this.auth.createUserWithEmailAndPassword(email, password);
            console.log('User created in Firebase Auth:', user);
            console.log('Firebase Auth email:', user.email);
            
            // Ensure email consistency - use the email from Firebase Auth
            const userDocData = {
                email: user.email, // Use Firebase Auth email for consistency
                displayName: userData.name || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'user',
                ...userData
            };
            
            console.log('Storing user data in Firestore:', userDocData);
            
            // Save additional user data to Firestore
            await this.db.collection('users').doc(user.uid).set(userDocData);
            
            console.log('User document saved to Firestore successfully');

            // Send email verification
            await user.sendEmailVerification();
            
            return { success: true, user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if user is admin
    async isAdmin(user) {
        try {
            if (!user) return false;
            
            // Check if user has admin role in Firestore
            const userDoc = await this.db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData.role === 'admin';
            }
            return false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    // Login with email and password
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const isAdmin = await this.isAdmin(userCredential.user);

            // Redirect logic after successful login
            if (isAdmin) {
                window.location.href = '/admin/dashboard.html';
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');
                
                // Validate redirect URL to prevent loops and security issues
                if (redirect && redirect !== '/login.html' && redirect !== '/user-profile.html') {
                    try {
                        const redirectUrl = decodeURIComponent(redirect);
                        // Only allow redirects to safe paths
                        if (redirectUrl.startsWith('/') && !redirectUrl.includes('..')) {
                            console.log('Redirecting to:', redirectUrl);
                            window.location.href = redirectUrl;
                            return;
                        }
                    } catch (error) {
                        console.warn('Invalid redirect URL, using fallback:', error);
                    }
                }
                
                // Fallback redirects
                console.log('Using fallback redirect to user profile');
                window.location.href = '/user-profile.html';
            }
            
            return { 
                success: true, 
                user: userCredential.user,
                isAdmin: isAdmin
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
