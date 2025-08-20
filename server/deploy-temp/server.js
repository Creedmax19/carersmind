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

// Enable CORS with production settings
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://carersmind.co.uk', 'https://www.carersmind.co.uk']
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Set security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://js.stripe.com", "https://www.gstatic.com", "https://secure.trust-provider.com"],
      imgSrc: ["'self'", "data:", "https:", "https://js.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://carersmind-cic.firebaseapp.com"]
    }
  }
}));

// Prevent XSS attacks
app.use(xss());

// Rate limiting - more generous for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: process.env.NODE_ENV === 'production' ? 200 : 100, // 200 requests per 15 mins in production
  message: 'Too many requests from this IP, please try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// API Documentation - only in development
if (process.env.NODE_ENV === 'development') {
  try {
    const swagger = require('./config/swagger');
    swagger(app);
    console.log(`API Documentation: http://localhost:${process.env.PORT || 5002}/api-docs`.blue.bold);
  } catch (error) {
    console.log('Swagger not available - skipping API docs'.yellow);
  }
}

// Mount routers
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Health check endpoint for production monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CarersMind API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version
  });
});

// Default route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CarersMind API',
    documentation: process.env.NODE_ENV === 'development' 
      ? `http://localhost:${process.env.PORT || 5002}/api-docs` 
      : 'https://api.carersmind.co.uk/api-docs',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Don't expose error details in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
    
  res.status(500).json({ 
    success: false, 
    error: 'Server Error', 
    message: errorMessage
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
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

const server = app.listen(PORT, HOST, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold
  );
  console.log(
    `📍 Server bound to: ${HOST}`.blue.bold
  );
  if (process.env.NODE_ENV === 'production') {
    console.log(
      `🌐 Production URL: https://api.carersmind.co.uk`.green.bold
    );
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
