document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.querySelector('[data-tab="login"]');
    const registerTab = document.querySelector('[data-tab="register"]');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const passwordStrength = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    let cartData = JSON.parse(localStorage.getItem('cartData')) || null;

    // Tab switching functionality
    function switchTab(tabName) {
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected form and activate tab
        document.getElementById(`${tabName}Form`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    // Event listeners for tabs
    loginTab.addEventListener('click', () => switchTab('login'));
    registerTab.addEventListener('click', () => switchTab('register'));

    // Toggle password visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Check password strength
    if (registerPassword) {
        registerPassword.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrengthUI(strength);
        });
    }

    // Calculate password strength
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 20;
        
        // Contains number
        if (/\d/.test(password)) strength += 20;
        
        // Contains lowercase
        if (/[a-z]/.test(password)) strength += 10;
        
        // Contains uppercase
        if (/[A-Z]/.test(password)) strength += 10;
        
        // Contains special char
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;
        
        return Math.min(strength, 100); // Cap at 100%
    }

    // Update password strength UI
    function updatePasswordStrengthUI(strength) {
        const strengthBar = passwordStrength.querySelector('span:first-child');
        
        // Update width
        strengthBar.style.width = `${strength}%`;
        
        // Update color and text
        if (strength < 30) {
            strengthBar.style.backgroundColor = '#e53e3e'; // Red
            strengthText.textContent = 'Weak';
            strengthText.style.color = '#e53e3e';
        } else if (strength < 70) {
            strengthBar.style.backgroundColor = '#dd6b20'; // Orange
            strengthText.textContent = 'Moderate';
            strengthText.style.color = '#dd6b20';
        } else {
            strengthBar.style.backgroundColor = '#38a169'; // Green
            strengthText.textContent = 'Strong';
            strengthText.style.color = '#38a169';
        }
    }

    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Here you would typically make an API call to your backend
            // For demo purposes, we'll simulate a successful login
            simulateLogin(email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            
            // Basic validation
            if (password !== confirmPass) {
                alert('Passwords do not match!');
                return;
            }
            
            // Here you would typically make an API call to your backend
            // For demo purposes, we'll simulate a successful registration
            simulateRegistration({
                firstName,
                lastName,
                email,
                password
            });
        });
    }

    // Check for cart data in URL parameters
    function checkForCartData() {
        const urlParams = new URLSearchParams(window.location.search);
        const cartParam = urlParams.get('cart');
        
        if (cartParam) {
            try {
                cartData = JSON.parse(decodeURIComponent(cartParam));
                localStorage.setItem('cartData', JSON.stringify(cartData));
            } catch (e) {
                console.error('Error parsing cart data:', e);
            }
        }
    }

    // Simulate login (replace with actual API call)
    function simulateLogin(email, password) {
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
        
        // Simulate API call
        setTimeout(() => {
            // Store user data in localStorage (in a real app, you'd get this from your backend)
            const userData = {
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                email: email,
                name: email.split('@')[0],
                token: 'dummy_token_' + Math.random().toString(36).substr(2)
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Redirect to checkout or home page
            redirectAfterAuth();
            
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1000);
    }

    // Simulate registration (replace with actual API call)
    function simulateRegistration(userData) {
        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
        
        // Simulate API call
        setTimeout(() => {
            // Store user data in localStorage (in a real app, you'd get this from your backend)
            const newUser = {
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                token: 'dummy_token_' + Math.random().toString(36).substr(2)
            };
            
            localStorage.setItem('user', JSON.stringify(newUser));
            
            // Show success message
            alert('Account created successfully! You are now logged in.');
            
            // Redirect to checkout or home page
            redirectAfterAuth();
            
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1500);
    }

    // Redirect after successful authentication
    function redirectAfterAuth() {
        // Check if we have cart data to redirect to checkout
        const cartData = localStorage.getItem('cartData');
        
        if (cartData) {
            // Redirect to checkout with cart data
            // Redirect to home page after successful login
            window.location.href = '/index.html';
            // Clear the cart data from localStorage after redirect
            localStorage.removeItem('cartData');
        } else {
            // No cart data, redirect to home
            window.location.href = '/';
        }
    }

    // Initialize
    checkForCartData();
    
    // Show login tab by default if coming from checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'login') {
        switchTab('login');
    } else if (urlParams.get('action') === 'register') {
        switchTab('register');
    }
});
