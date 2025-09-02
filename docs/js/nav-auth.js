document.addEventListener('DOMContentLoaded', () => {
    const authService = new FirebaseAuthService();
    const authLink = document.getElementById('authLink');

    function updateNavigationUI(user) {
        if (!authLink) return;

        if (user) {
            // User is logged in
            authService.isAdmin(user).then(isAdmin => {
                if (isAdmin) {
                    // Admin user - shortened to 'Admin'
                    authLink.innerHTML = '<a href="/admin/dashboard.html"><i class="fas fa-tachometer-alt"></i> Admin</a>';
                } else {
                    // Regular user - shortened to 'Profile'
                    authLink.innerHTML = '<a href="/user-profile.html"><i class="fas fa-user-circle"></i> Profile</a>';
                }
            }).catch(error => {
                console.error('Error checking admin status in navigation:', error);
                authLink.innerHTML = '<a href="/login.html"><i class="fas fa-user"></i> Login/Sign up</a>'; // Fallback
            });
        } else {
            // User is logged out
            authLink.innerHTML = '<a href="/login.html"><i class="fas fa-user"></i> Login/Sign up</a>';
        }
    }

    // Listen for Firebase auth state changes
    firebase.auth().onAuthStateChanged(updateNavigationUI);

    // Initial check (in case user is already logged in on page load)
    updateNavigationUI(authService.getCurrentUser());
});
