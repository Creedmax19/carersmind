document.addEventListener('DOMContentLoaded', async () => {
    console.log('User profile page loaded, waiting for Firebase services...');
    
    // Wait for Firebase services to be ready
    if (window.authService && window.authService.auth) {
        console.log('Firebase services already available');
        initializeUserProfile();
    } else {
        console.log('Waiting for firebaseServicesReady event...');
        document.addEventListener('firebaseServicesReady', function() {
            console.log('Firebase services ready, initializing user profile');
            initializeUserProfile();
        });
        
        // Fallback: try to initialize after a delay
        setTimeout(() => {
            if (window.authService && window.authService.auth) {
                console.log('Fallback initialization');
                initializeUserProfile();
            } else {
                console.error('Firebase services not available after timeout');
                alert('Authentication services not available. Please refresh the page.');
            }
        }, 5000);
    }
    
    async function initializeUserProfile() {
        const authService = new FirebaseAuthService();
        const orderService = new OrderService();

        const userNameElement = document.getElementById('userName');
        const userEmailElement = document.getElementById('userEmail');
        const logoutBtn = document.getElementById('logoutBtn');
        const purchaseHistoryList = document.getElementById('purchaseHistoryList');
        const profileSidebarLinks = document.querySelectorAll('.profile-sidebar nav a');
        const profileSectionItems = document.querySelectorAll('.profile-section-item');

        // Function to check authentication and load user data
        async function loadUserProfile() {
            // Wait for Firebase auth state to be fully initialized
            return new Promise((resolve) => {
                const unsubscribe = authService.auth.onAuthStateChanged(async (user) => {
                    unsubscribe(); // Stop listening after first check
                    
                    if (!user) {
                        // If not logged in, redirect to login page
                        // Check if we're already coming from login to prevent loops
                        const currentUrl = window.location.pathname;
                        const referrer = document.referrer;
                        
                        console.log('User not authenticated, checking redirect logic...');
                        console.log('Current URL:', currentUrl);
                        console.log('Referrer:', referrer);
                        
                        // Only redirect if we're not already in a redirect loop
                        if (!referrer.includes('/login.html') && !window.location.search.includes('redirect=')) {
                            console.log('Redirecting to login page...');
                            window.location.href = '/login.html?redirect=' + encodeURIComponent(currentUrl);
                        } else {
                            console.log('Preventing redirect loop, staying on profile page');
                            // Show login required message instead of redirecting
                            document.body.innerHTML = `
                                <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                                    <h2>Authentication Required</h2>
                                    <p>You need to be logged in to view your profile.</p>
                                    <a href="/login.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4a6fa5; color: white; text-decoration: none; border-radius: 5px;">Go to Login</a>
                                </div>
                            `;
                        }
                        resolve();
                        return;
                    }

                    console.log('Loading profile for user:', user.uid);
                    console.log('User email from Firebase Auth:', user.email);

                    try {
                        // Get user data from Firestore to ensure consistency
                        const userDoc = await authService.db.collection('users').doc(user.uid).get();
                        
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            console.log('User data from Firestore:', userData);
                            console.log('User data from Firebase Auth:', user);
                            
                            // Use Firestore data for display, fallback to Firebase Auth data
                            const displayName = userData.displayName || user.displayName || user.email.split('@')[0];
                            const displayEmail = userData.email || user.email;
                            
                            userNameElement.textContent = displayName;
                            userEmailElement.textContent = displayEmail;
                            
                            // Log for debugging
                            console.log('Display name:', displayName);
                            console.log('Display email:', displayEmail);
                            console.log('Firebase Auth email:', user.email);
                            console.log('Firestore email:', userData.email);
                            
                            // Check for email mismatch
                            if (userData.email !== user.email) {
                                console.warn('Email mismatch detected!');
                                console.warn('Firebase Auth email:', user.email);
                                console.warn('Firestore email:', userData.email);
                            }
                            
                        } else {
                            // Fallback to Firebase Auth data if Firestore document doesn't exist
                            console.warn('User document not found in Firestore, using Firebase Auth data');
                            userNameElement.textContent = user.displayName || user.email.split('@')[0];
                            userEmailElement.textContent = user.email;
                        }

                        // Load purchase history
                        const orders = await orderService.getUserOrders();
                        displayPurchaseHistory(orders);
                        
                    } catch (error) {
                        console.error('Error loading user profile:', error);
                        
                        // Fallback to Firebase Auth data on error
                        userNameElement.textContent = user.displayName || user.email.split('@')[0];
                        userEmailElement.textContent = user.email;
                        
                        // Show error message for purchase history
                        purchaseHistoryList.innerHTML = `
                            <tr>
                                <td colspan="5" class="empty-state">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <p>Failed to load purchase history. Please try again.</p>
                                </td>
                            </tr>
                        `;
                    }
                    
                    resolve(); // Resolve the promise when done
                });
            });
        }

        // Function to display purchase history
        function displayPurchaseHistory(orders) {
            purchaseHistoryList.innerHTML = ''; // Clear existing content

            if (orders.length === 0) {
                purchaseHistoryList.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-state">
                            <i class="fas fa-box-open"></i>
                            <p>No purchase history found.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            orders.forEach(order => {
                const row = purchaseHistoryList.insertRow();
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.createdAt ? new Date(order.createdAt._seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                    <td>£${order.amount ? order.amount.toFixed(2) : '0.00'}</td>
                    <td><span class="order-status ${order.status}">${order.status}</td>
                    <td>
                        <button class="btn btn-sm btn-info" data-order-id="${order.id}">View Details</button>
                    </td>
                `;
            });
        }

        // Handle logout
        logoutBtn.addEventListener('click', async () => {
            try {
                await authService.logout();
                window.location.href = '/'; // Redirect to home page after logout
            } catch (error) {
                console.error('Logout error:', error);
                alert('Failed to log out. Please try again.');
            }
        });

        // Handle section switching
        profileSidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                // Remove active class from all links and sections
                profileSidebarLinks.forEach(l => l.classList.remove('active'));
                profileSectionItems.forEach(s => s.classList.remove('active'));

                // Add active class to clicked link and corresponding section
                this.classList.add('active');
                const targetSectionId = this.getAttribute('data-section');
                document.getElementById(targetSectionId).classList.add('active');
            });
        });

        // Initial load
        loadUserProfile();
    }
});

