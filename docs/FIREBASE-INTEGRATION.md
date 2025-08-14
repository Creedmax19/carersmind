# Firebase Integration Guide

This document provides an overview of the Firebase integration in the Carer's Care CIC project, including setup instructions, authentication flows, and data management.

## Table of Contents
- [Firebase Setup](#firebase-setup)
- [Authentication](#authentication)
- [Firestore Database](#firestore-database)
- [Order Management](#order-management)
- [Admin Features](#admin-features)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Firebase Setup

### Configuration
1. The Firebase configuration is stored in `js/firebase-config.js`
2. This file contains the Firebase project credentials and initialization code
3. **Important**: Never commit actual API keys to version control in production

### Initialization
Firebase is initialized in each page that requires it. The initialization pattern is:

```javascript
// Check if Firebase is already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
```

## Authentication

### User Authentication
- Handled by `js/firebase-auth.js`
- Supports email/password authentication
- Includes session management and persistence

### Key Functions
- `register(email, password, userData)` - Register a new user
- `login(email, password)` - Sign in a user
- `logout()` - Sign out the current user
- `resetPassword(email)` - Send password reset email
- `getCurrentUser()` - Get the currently authenticated user
- `isAuthenticated()` - Check if a user is logged in

### Admin Authentication
- Handled by `js/admin-auth.js`
- Extends basic authentication with admin-specific features
- Includes role-based access control

## Firestore Database

### Data Structure

#### Users Collection
```
/users/{userId}
  - email: string
  - displayName: string
  - createdAt: timestamp
  - role: 'user' | 'admin'
  - ...other user data
```

#### Orders Collection
```
/orders/{orderId}
  - userId: string (reference to users collection)
  - items: array
    - id: string
    - name: string
    - price: number
    - quantity: number
  - total: number
  - status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  - shippingInfo: object
    - name: string
    - email: string
    - address: string
    - city: string
    - postalCode: string
    - country: string
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Order Management

### OrderService
Located in `js/order-service.js`, this service handles all order-related operations:

```javascript
// Create a new order
const order = await orderService.createOrder(items, shippingInfo);

// Get user's orders
const orders = await orderService.getUserOrders();

// Get order by ID
const order = await orderService.getOrderById(orderId);

// Update order status
await orderService.updateOrderStatus(orderId, 'shipped');

// Process payment (creates order and processes payment)
const result = await orderService.processPayment(items, paymentInfo);
```

## Admin Features

### Admin Dashboard
- Accessible at `/admin/dashboard.html`
- Requires admin authentication
- Provides order management interface
- User management capabilities

### Admin Authentication
1. Admins must have a user document in the `admins` collection
2. The admin login enforces role-based access control

## Testing

### Test Page
A test page is available at `/test-firebase.html` to verify Firebase integration:
- Tests authentication flows
- Verifies Firestore operations
- Tests order service functionality

### Running Tests
1. Open `/test-firebase.html` in a browser
2. Click the test buttons to verify each component
3. Check the console for detailed logs

## Troubleshooting

### Common Issues

#### Authentication
- **Issue**: User not being redirected after login
  - **Solution**: Check the auth state observer in the target page

- **Issue**: "User not found" errors
  - **Solution**: Verify the user exists in Firebase Authentication console

#### Firestore
- **Issue**: Permission denied errors
  - **Solution**: Check Firestore security rules and user authentication status

- **Issue**: Data not saving
  - **Solution**: Verify the document path and that required fields are provided

#### Storage
- **Issue**: Upload failures
  - **Solution**: Check storage security rules and file size limits

### Debugging
1. Check the browser console for error messages
2. Verify network requests in the browser's developer tools
3. Check Firebase console for any reported issues

## Security Considerations

1. **API Keys**: Never commit actual API keys to version control
2. **Security Rules**: Always implement proper security rules in Firebase Console
3. **Input Validation**: Validate all user inputs on both client and server sides
4. **Authentication**: Always verify authentication state before performing sensitive operations

## Deployment

1. Set environment-specific configuration in `firebase-config.js`
2. Deploy Firestore security rules from the Firebase Console
3. Configure hosting and set up proper redirects
4. Set up environment variables for sensitive information in production
