// Admin Authentication with Firebase
const ADMIN_EMAILS = ['admin@carersmind.com']; // Add more admin emails as needed

// Check if user is logged in and has admin privileges
function checkAuth() {
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged((user) => {
            const currentPath = window.location.pathname;
            const isLoginPage = currentPath.includes('login.html');
            const isDashboardPage = currentPath.includes('dashboard.html');
            
            if (user && ADMIN_EMAILS.includes(user.email)) {
                // User is signed in and is an admin
                if (isLoginPage) {
                    window.location.href = 'dashboard.html';
                }
                resolve(true);
            } else {
                // User is not signed in or not an admin
                if (isDashboardPage) {
                    window.location.href = 'login.html';
                }
                resolve(false);
            }
        });
    });
}

// Handle login form submission
function handleLogin(email, password, rememberMe) {
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');
    
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.classList.add('loading');
    errorMessage.textContent = '';
    
    // Sign in with email and password
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Check if user is an admin
            if (!ADMIN_EMAILS.includes(user.email)) {
                throw new Error('Access denied. Admin privileges required.');
            }
            
            // Set persistence based on remember me
            const persistence = rememberMe ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION;
                
            return firebase.auth().setPersistence(persistence);
        })
        .then(() => {
            // Redirect to dashboard on successful login
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            // Handle errors
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please try again.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = 'Invalid email or password.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
            }
            
            errorMessage.textContent = errorMessage;
            errorMessage.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
        });
}

// Handle password reset
function handlePasswordReset(email) {
    return firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            return { success: true, message: 'Password reset email sent. Please check your inbox.' };
        })
        .catch((error) => {
            console.error('Password reset error:', error);
            return { 
                success: false, 
                message: error.message || 'Failed to send password reset email.' 
            };
        });
}

// Handle logout
function handleLogout() {
    return firebase.auth().signOut()
        .then(() => {
            window.location.href = 'login.html';
        });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check authentication status on page load
    checkAuth();
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            handleLogin(email, password, rememberMe);
        });
    }
    
    // Handle forgot password
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = prompt('Please enter your email address to reset your password:');
            
            if (email) {
                handlePasswordReset(email)
                    .then(result => {
                        if (result.success) {
                            alert(result.message);
                        } else {
                            alert('Error: ' + result.message);
                        }
                    });
            }
        });
    }
    
    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
});

// Handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    
    // Check authentication status on page load
    checkAuth();
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const result = login(username, password);
            
            if (result.success) {
                window.location.href = 'dashboard.html';
            } else {
                loginMessage.textContent = result.message || 'Login failed';
                loginMessage.className = 'message error';
            }
        });
    }
    
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});
