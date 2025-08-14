const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const colors = require('colors');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// Import Supabase client
const supabase = require('./config/supabaseClient');

// Route files
const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Body parser
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors());

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
  console.log(`API Documentation: http://localhost:${process.env.PORT || 5002}/api-docs`.blue.bold);
}

// Mount routers
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Default route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Carer\'s Care CIC API',
    documentation: process.env.NODE_ENV === 'development' 
      ? `http://localhost:${process.env.PORT || 5002}/api-docs` 
      : 'https://api.carerscare.org/api-docs'
  });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Server Error', 
    message: err.message 
  });
});

// Handle 404 - Keep this as the last route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
