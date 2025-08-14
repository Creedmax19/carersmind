/**
 * Admin Authentication Service for Firebase
 * Handles admin-specific authentication and authorization
 */

class AdminAuthService {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.user = null;
        this.adminRoles = ['admin', 'superadmin'];
        this.initAuthStateListener();
    }

    // Initialize auth state listener
    initAuthStateListener() {
        this.auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Verify if user has admin role
                const isAdmin = await this.checkAdminRole(user.uid);
                if (isAdmin) {
                    this.user = user;
                    console.log('Admin user signed in:', user.uid);
                    this.onAuthStateChanged(true);
                } else {
                    console.log('User is not an admin, signing out...');
                    await this.auth.signOut();
                    window.location.href = '/admin/login.html?error=unauthorized';
                }
            } else {
                this.user = null;
                console.log('Admin user signed out');
                this.onAuthStateChanged(false);
            }
        });
    }

    // Check if user has admin role
    async checkAdminRole(uid) {
        try {
            const userDoc = await this.db.collection('admins').doc(uid).get();
            return userDoc.exists && this.adminRoles.includes(userDoc.data().role);
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    // Login with email and password
    async login(email, password) {
        try {
            const { user } = await this.auth.signInWithEmailAndPassword(email, password);
            
            // Verify admin role after successful login
            const isAdmin = await this.checkAdminRole(user.uid);
            if (!isAdmin) {
                await this.auth.signOut();
                throw new Error('Access denied. Administrator privileges required.');
            }
            
            return { success: true, user };
        } catch (error) {
            console.error('Admin login error:', error);
            return { 
                success: false, 
                error: error.message || 'Invalid email or password' 
            };
        }
    }

    // Logout the current admin user
    async logout() {
        try {
            await this.auth.signOut();
            window.location.href = '/admin/login.html';
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    // Password reset for admin users
    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current authenticated admin user
    getCurrentUser() {
        return this.user;
    }

    // Check if admin is authenticated
    isAuthenticated() {
        return this.user !== null;
    }

    // Callback for auth state changes
    onAuthStateChanged() {
        // Can be overridden by admin pages
    }
}

// Initialize Admin Auth Service
let adminAuthService;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase if not already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    adminAuthService = new AdminAuthService();
    
    // Make available globally
    window.adminAuthService = adminAuthService;
    
    // Handle logout button if it exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminAuthService.logout();
        });
    }
});
