const express = require('express');
const { check, validationResult } = require('express-validator');
const supabase = require('../config/supabaseClient');
const { protect } = require('../middleware/auth');

const router = express.Router();

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: role || 'user'
          }
        }
      });

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.status(201).json({ success: true, data });

    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(400).json({ success: false, error: 'Invalid credentials' });
      }

      res.status(200).json({ success: true, data });

    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // The user object is attached to the request in the 'protect' middleware
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: profile });

  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET api/auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', protect, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }

    res.status(200).json({ success: true, data: {} });

  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
