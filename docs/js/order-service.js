/**
 * Order Service for Firebase
 * Handles order creation, retrieval, and management
 */

class OrderService {
    constructor() {
        if (!firebase.apps.length) {
            throw new Error('Firebase not initialized. Make sure firebase-config.js is loaded first.');
        }
        
        this.db = firebase.firestore();
        this.storage = firebase.storage();
        this.auth = firebase.auth();
        
        console.log('OrderService initialized with Firebase services');
    }

    /**
     * Create a new order in Firestore
     * @param {Array} items - Array of cart items
     * @param {Object} shippingInfo - Shipping information
     * @returns {Promise<Object>} - The created order with ID
     */
    async createOrder(items, shippingInfo) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const orderData = {
                userId: user.uid,
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image || ''
                })),
                shippingInfo: {
                    name: shippingInfo.name,
                    email: shippingInfo.email,
                    address: shippingInfo.address,
                    city: shippingInfo.city,
                    postalCode: shippingInfo.postalCode,
                    country: shippingInfo.country
                },
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };

            const docRef = await this.db.collection('orders').add(orderData);
            return { id: docRef.id, ...orderData };
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    /**
     * Get orders for the current user
     * @returns {Promise<Array>} - Array of user's orders
     */
    async getUserOrders() {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const snapshot = await this.db
                .collection('orders')
                .where('userId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting user orders:', error);
            throw error;
        }
    }

    /**
     * Get order by ID
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} - Order data
     */
    async getOrderById(orderId) {
        try {
            const doc = await this.db.collection('orders').doc(orderId).get();
            if (!doc.exists) {
                throw new Error('Order not found');
            }
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Error getting order:', error);
            throw error;
        }
    }

    /**
     * Update order status
     * @param {string} orderId - Order ID
     * @param {string} status - New status
     * @returns {Promise<void>}
     */
    async updateOrderStatus(orderId, status) {
        try {
            await this.db.collection('orders').doc(orderId).update({
                status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    /**
     * Process payment and create order
     * @param {Array} items - Cart items
     * @param {Object} paymentInfo - Payment information
     * @returns {Promise<Object>} - Payment result
     */
    async processPayment(items, paymentInfo) {
        try {
            // In a real app, you would integrate with a payment processor here
            // For now, we'll just create the order
            const order = await this.createOrder(items, paymentInfo.shipping);
            
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update order status to paid
            await this.updateOrderStatus(order.id, 'paid');
            
            return {
                success: true,
                orderId: order.id,
                message: 'Payment processed successfully'
            };
        } catch (error) {
            console.error('Payment processing error:', error);
            throw error;
        }
    }
}

// Initialize Order Service
let orderService;

// Initialize on demand (called by init-services)
function initializeOrderService() {
    if (!orderService) {
        try {
            // Ensure Firebase is initialized
            if (!firebase.apps.length) {
                throw new Error('Firebase not initialized. Make sure firebase-config.js and init-services.js run first.');
            }
            
            // Initialize Order Service
            orderService = new OrderService();
            
            // Make orderService available globally
            if (typeof window !== 'undefined') {
                window.orderService = orderService;
                console.log('orderService initialized and available globally');
            }
            
            return orderService;
        } catch (error) {
            console.error('Error initializing OrderService:', error);
            throw error;
        }
    }
    return orderService;
}

// Do not auto-instantiate here; init-services.js will manage lifecycle
