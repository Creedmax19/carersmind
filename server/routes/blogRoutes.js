const express = require('express');
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Blog = require('../models/Blog');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the blog post
 *         title:
 *           type: string
 *           description: The title of the blog post
 *         slug:
 *           type: string
 *           description: URL-friendly version of the title
 *         content:
 *           type: string
 *           description: The main content of the blog post
 *         excerpt:
 *           type: string
 *           description: A short excerpt from the blog post
 *         featuredImage:
 *           type: string
 *           description: URL to the featured image
 *         author:
 *           type: string
 *           description: ID of the user who created the blog post
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: draft
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tags for the blog post
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of categories for the blog post
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the blog post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the blog post was last updated
 */

/**
 * @swagger
 * /api/v1/blogs:
 *   get:
 *     summary: Get all published blog posts
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of blogs per page
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter blogs by tag
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter blogs by category
 *     responses:
 *       200:
 *         description: A list of published blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 */
router.get('/', async (req, res) => {
  try {
    // Build query
    const query = { status: 'published' };
    
    // Filter by tag if provided
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    // Filter by category if provided
    if (req.query.category) {
      query.categories = req.query.category;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Blog.countDocuments(query);

    // Execute query
    const blogs = await Blog.find(query)
      .populate('author', 'name')
      .sort('-createdAt')
      .limit(limit)
      .skip(startIndex);

    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: blogs.length,
      pagination,
      data: blogs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false,
      error: 'Server Error' 
    });
  }
});

/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   get:
 *     summary: Get a single blog post by ID or slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Blog ID or slug
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single blog post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    let blog;
    
    // Check if the parameter is a valid MongoDB ObjectId
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(req.params.id).populate('author', 'name');
    } 
    // Otherwise, search by slug
    else {
      blog = await Blog.findOne({ slug: req.params.id }).populate('author', 'name');
    }
    
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ 
        success: false,
        error: 'Blog not found' 
      });
    }
    
    res.json({
      success: true,
      data: blog
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        error: 'Blog not found' 
      });
    }
    res.status(500).json({ 
      success: false,
      error: 'Server Error' 
    });
  }
});

/**
 * @swagger
 * /api/v1/blogs:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 default: draft
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized, token failed
 *       403:
 *         description: Not authorized to perform this action
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  [
    protect,
    authorize('admin', 'editor'),
    [
      check('title', 'Please add a title').not().isEmpty().isLength({ max: 100 }),
      check('content', 'Please add content').not().isEmpty(),
      check('status', 'Status must be draft, published, or archived').optional().isIn(['draft', 'published', 'archived']),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    try {
      // Add user to req.body
      req.body.author = req.user.id;

      const blog = await Blog.create(req.body);

      res.status(201).json({
        success: true,
        data: blog
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ 
        success: false,
        error: 'Server Error' 
      });
    }
  }
);

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin/Editor)
router.put(
  '/:id',
  [protect, authorize('admin', 'editor')],
  async (req, res) => {
    try {
      let blog = await Blog.findById(req.params.id);

      if (!blog) {
        return res.status(404).json({ msg: 'Blog not found' });
      }

      // Make sure user is blog owner or admin
      if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ msg: 'Not authorized to update this blog' });
      }

      blog = await Blog.findByIdAndUpdate(
        req.params.id,
        { $set: req.body, updatedAt: Date.now() },
        { new: true }
      );

      res.json(blog);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ 
          success: false,
          error: 'Blog not found' 
        });
      }
      res.status(500).json({ 
        success: false,
        error: 'Server Error' 
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Blog ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to delete this blog
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', [protect, authorize('admin', 'editor')], async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        error: 'Blog not found' 
      });
    }

    // Make sure user is blog owner or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Not authorized to delete this blog' 
      });
    }

    await blog.remove();
    res.json({
      success: true,
      msg: 'Blog removed'
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        error: 'Blog not found' 
      });
    }
    res.status(500).json({ 
      success: false,
      error: 'Server Error' 
    });
  }
});

module.exports = router;
