require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const colors = require('colors');
const errorHandler = require('./middleware/error');

// Route files
const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoutes');

// Load env vars
require('dotenv').config({ path: './config/config.env' });

// Connect to database
const connectDB = require('./config/db');
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors());

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again in 10 minutes'
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// API Documentation
if (process.env.NODE_ENV === 'development') {
  const swagger = require('./config/swagger');
  swagger(app);
  console.log(`API Documentation: http://localhost:${process.env.PORT || 5000}/api-docs`.blue.bold);
}

// Mount routers
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/auth', authRoutes);

// Default route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Carer\'s Care CIC API',
    documentation: process.env.NODE_ENV === 'development' 
      ? `http://localhost:${process.env.PORT || 5000}/api-docs` 
      : 'https://api.carerscare.org/api-docs'
  });
});

// Handle 404 - Keep this as the last route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
