const express = require('express');
const { check, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { protect } = require('../middleware/auth');

const router = express.Router();
const db = getFirestore();

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { name, email, password, role } = req.body;
    try {
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
      // Store user profile in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        name,
        email,
        role: role || 'user',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.status(201).json({ success: true, uid: userRecord.uid, email: userRecord.email, name });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      // Firebase Auth does not support password login server-side; client should handle login and send ID token
      return res.status(400).json({ success: false, error: 'Login should be handled on the client using Firebase Auth. Send the ID token to the backend for protected routes.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET api/auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', (req, res) => {
  // Logout is handled client-side by clearing the Firebase Auth session/token
  res.status(200).json({ success: true, message: 'Logout handled on client. Just clear the token.' });
});

module.exports = router;
