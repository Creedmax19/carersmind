const express = require('express');
const { check, validationResult } = require('express-validator');
const supabase = require('../config/supabaseClient');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET api/v1/blogs
// @desc    Get all published blog posts with pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    let query = supabase
      .from('blogs')
      .select('*, author:profiles(name)', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (req.query.tag) {
      query = query.contains('tags', [req.query.tag]);
    }
    if (req.query.category) {
      query = query.contains('categories', [req.query.category]);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({ success: true, count, data });

  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET api/v1/blogs/:id
// @desc    Get a single blog post by ID or slug
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const identifier = req.params.id;
    const isNumericId = !isNaN(identifier) && Number.isInteger(parseFloat(identifier));

    const column = isNumericId ? 'id' : 'slug';

    const { data, error } = await supabase
      .from('blogs')
      .select('*, author:profiles(name)')
      .eq(column, identifier)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }

    res.json({ success: true, data });

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
      const { data, error } = await supabase
        .from('blogs')
        .insert([{ 
          title, 
          content, 
          excerpt, 
          featured_image_url, 
          status, 
          tags, 
          categories, 
          author_id: req.user.id 
        }])
        .select();

      if (error) throw error;

      res.status(201).json({ success: true, data: data[0] });

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
      const { data: existingBlog, error: fetchError } = await supabase
        .from('blogs')
        .select('author_id')
        .eq('id', req.params.id)
        .single();

      if (fetchError || !existingBlog) {
        return res.status(404).json({ success: false, error: 'Blog not found' });
      }

      // In a real app, you might want to check roles again here, but authorize middleware handles it.
      if (existingBlog.author_id !== req.user.id) {
        // This check is redundant if authorize middleware works correctly but adds a layer of security.
        // return res.status(403).json({ success: false, error: 'Not authorized to update this blog' });
      }

      const { data, error } = await supabase
        .from('blogs')
        .update(req.body)
        .eq('id', req.params.id)
        .select();

      if (error) throw error;

      res.json({ success: true, data: data[0] });

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
        const { data: existingBlog, error: fetchError } = await supabase
        .from('blogs')
        .select('author_id')
        .eq('id', req.params.id)
        .single();

      if (fetchError || !existingBlog) {
        return res.status(404).json({ success: false, error: 'Blog not found' });
      }

      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      res.json({ success: true, msg: 'Blog removed' });

    } catch (err) {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
);

module.exports = router;
