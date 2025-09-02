const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Middleware to protect routes using Firebase Auth
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      return res.status(401).json({ success: false, error: 'User profile not found' });
    }
    req.user = { uid: decoded.uid, ...userDoc.data() };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
  }
};

// Middleware for role-based access
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route.`
      });
    }
    next();
  };
};
