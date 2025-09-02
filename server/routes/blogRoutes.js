const express = require('express');
const { check, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const db = getFirestore();

// @route   GET api/v1/blogs
// @desc    Get all published blog posts with pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const blogsRef = db.collection('blogs');
    let query = blogsRef.where('status', '==', 'published').orderBy('createdAt', 'desc');
    const snapshot = await query.offset(startIndex).limit(limit).get();
    const blogs = [];
    snapshot.forEach(doc => {
      blogs.push({ id: doc.id, ...doc.data() });
    });
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET api/v1/blogs/:id
// @desc    Get a single blog post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const blogDoc = await db.collection('blogs').doc(req.params.id).get();
    if (!blogDoc.exists) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }
    res.json({ success: true, data: { id: blogDoc.id, ...blogDoc.data() } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   POST api/v1/blogs
// @desc    Create a new blog post
// @access  Private (Admin/Editor)
router.post(
  '/',
  [ protect, authorize('admin', 'editor'),
    [
      check('title', 'Please add a title').not().isEmpty().isLength({ max: 100 }),
      check('content', 'Please add content').not().isEmpty(),
      check('status', 'Status must be draft, published, or archived').optional().isIn(['draft', 'published', 'archived'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { title, content, excerpt, featured_image_url, status, tags, categories } = req.body;
      const newBlog = {
        title,
        content,
        excerpt,
        featured_image_url,
        status: status || 'draft',
        tags: tags || [],
        categories: categories || [],
        author_id: req.user.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection('blogs').add(newBlog);
      res.status(201).json({ success: true, data: { id: docRef.id, ...newBlog } });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
);

// @route   PUT api/v1/blogs/:id
// @desc    Update a blog post
// @access  Private (Admin/Editor)
router.put(
  '/:id',
  [ protect, authorize('admin', 'editor') ],
  async (req, res) => {
    try {
      const blogDoc = await db.collection('blogs').doc(req.params.id).get();
      if (!blogDoc.exists) {
        return res.status(404).json({ success: false, error: 'Blog not found' });
      }
      if (blogDoc.data().author_id !== req.user.uid) {
        return res.status(403).json({ success: false, error: 'Not authorized to update this blog' });
      }
      const updateData = {
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await db.collection('blogs').doc(req.params.id).update(updateData);
      res.json({ success: true, data: { id: req.params.id, ...updateData } });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
);

// @route   DELETE api/v1/blogs/:id
// @desc    Delete a blog post
// @access  Private (Admin/Editor)
router.delete(
  '/:id',
  [ protect, authorize('admin', 'editor') ],
  async (req, res) => {
    try {
      const blogDoc = await db.collection('blogs').doc(req.params.id).get();
      if (!blogDoc.exists) {
        return res.status(404).json({ success: false, error: 'Blog not found' });
      }
      if (blogDoc.data().author_id !== req.user.uid) {
        return res.status(403).json({ success: false, error: 'Not authorized to delete this blog' });
      }
      await db.collection('blogs').doc(req.params.id).delete();
      res.json({ success: true, msg: 'Blog removed' });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
);

module.exports = router;
