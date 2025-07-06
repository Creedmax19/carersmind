// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAvnhm3UuFjDxo1S5fIvBwDMc8QmhKdsUE",
    authDomain: "carersmind.firebaseapp.com",
    projectId: "carersmind",
    storageBucket: "carersmind.firebasestorage.app",
    messagingSenderId: "731722690574",
    appId: "1:731722690574:web:b6058bb5154ec722ef8c5f"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        console.error("Firebase offline persistence error: ", err);
    });
