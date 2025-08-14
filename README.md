# Carer's Care CIC

A comprehensive platform supporting carers in the community with resources, support, and community features.

## Features

- 🔐 Secure user authentication with Firebase
- 🛒 E-commerce functionality with cart and checkout
- 📱 Responsive design for all devices
- ⚡ Fast and accessible user interface
- 🔄 Real-time updates with Firestore
- 🛡️ Secure admin dashboard

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or yarn
- Firebase account and project

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication in the Authentication section
3. Set up Firestore database in test mode initially
4. Create a web app in your Firebase project to get the configuration
5. Create `js/firebase-config.js` with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/carers-care-cic.git
   cd carers-care-cic
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```
   This will start a local development server at `http://localhost:8080`

## Firebase Integration

This project uses Firebase for:
- 🔐 Authentication (Email/Password, Google, etc.)
- 💾 Firestore Database
- 📦 Cloud Storage
- 🚀 Hosting

### Key Firebase Files
- `js/firebase-config.js` - Firebase configuration
- `js/firebase-auth.js` - Authentication service
- `js/order-service.js` - Order management service
- `js/admin-auth.js` - Admin authentication

For detailed information, see [FIREBASE-INTEGRATION.md](FIREBASE-INTEGRATION.md)

## Testing

Run the Firebase test suite:
1. Open `/test-firebase.html` in your browser
2. Follow the on-screen instructions to test all Firebase features

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set `public` as your public directory
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys: No

4. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

### Environment Variables
For production, set these environment variables:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

## Project Structure

```
carers-care-cic/
├── public/                 # Static files
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── images/            # Image assets
│   ├── resources/         # Additional resources
│   └── index.html         # Main HTML file
├── .gitignore            # Git ignore file
├── netlify.toml          # Netlify configuration
├── package.json          # Project configuration
└── README.md            # Project documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.