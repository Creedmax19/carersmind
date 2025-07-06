<div align="center">
  <h1>Carer's Care CIC - Backend API</h1>
  <p>
    <strong>A secure, scalable backend API for Carer's Care CIC built with Node.js, Express, and MongoDB</strong>
  </p>
  <p>
    <a href="https://github.com/creedmax19/demo-carersmind/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/creedmax19/demo-carersmind/ci.yml?branch=main" alt="Build Status">
    </a>
    <a href="https://github.com/creedmax19/demo-carersmind/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/creedmax19/demo-carersmind" alt="License">
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/express" alt="Node Version">
    </a>
  </p>
</div>

## 🚀 Features

- **RESTful API** with clean, consistent endpoints
- **User Authentication & Authorization** using JWT
- **Role-Based Access Control** (Admin, Editor, User)
- **Blog Management** with rich text support
- **File Uploads** for blog images
- **Rate Limiting** and request validation
- **API Documentation** with Swagger/OpenAPI
- **Security Best Practices** (helmet, xss-clean, hpp)
- **Error Handling** with meaningful status codes
- **Pagination** & Filtering
- **Environment-based Configuration**
- **Docker Support**

## 🛠 Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: helmet, xss-clean, express-mongo-sanitize, hpp
- **Documentation**: Swagger/OpenAPI
- **Logging**: winston, morgan
- **Testing**: Jest, Supertest

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher) or yarn
- MongoDB (v5.0+ or MongoDB Atlas)
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/creedmax19/demo-carersmind.git
cd demo-carersmind/server
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Copy the example environment file and update the values:

```bash
cp config/config.env.example config/config.env
```

Edit `config/config.env` with your configuration:

```env
NODE_ENV=development
PORT=5000

# MongoDB connection string
MONGO_URI=mongodb://localhost:27017/carers_care

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# File Upload (optional)
# MAX_FILE_UPLOAD=1000000
# FILE_UPLOAD_PATH=./public/uploads

# Email (optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_EMAIL=your-email@gmail.com
# SMTP_PASSWORD=your-email-password
# FROM_EMAIL=noreply@carerscare.org
# FROM_NAME=Carer's Care CIC
```

### 4. Start the development server

```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Interactive API Docs (Swagger UI)

Access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

### Available Endpoints

#### Authentication

| Method | Endpoint           | Description                | Auth Required |
|--------|--------------------|----------------------------|---------------|
| POST   | /api/v1/auth/register | Register a new user        | No            |
| POST   | /api/v1/auth/login    | Login user                 | No            |
| GET    | /api/v1/auth/me       | Get current user           | Yes           |
| GET    | /api/v1/auth/logout   | Logout user / clear cookie | No            |

#### Blogs

| Method | Endpoint           | Description                | Auth Required |
|--------|--------------------|----------------------------|---------------|
| GET    | /api/v1/blogs      | Get all published blogs    | No            |
| GET    | /api/v1/blogs/:id  | Get single blog by ID/slug | No            |
| POST   | /api/v1/blogs      | Create a new blog post     | Yes (Editor+) |
| PUT    | /api/v1/blogs/:id  | Update a blog post         | Yes (Editor+) |
| DELETE | /api/v1/blogs/:id  | Delete a blog post         | Yes (Admin)   |

## 🔒 Authentication

Most endpoints require authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Example: Register a new user

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

## 🐳 Docker Support

### Build and run with Docker

```bash
# Build the Docker image
docker build -t carers-care-api .

# Run the container
docker run -p 5000:5000 --env-file ./config/config.env carers-care-api
```

### Docker Compose

```bash
docker-compose up -d
```

## 🧪 Testing

Run tests using Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🔧 Environment Variables

See `config/config.env.example` for all available environment variables.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspiration from various open-source projects
- Thanks to all contributors who have helped shape this project

## 📞 Contact

For support, email [support@carerscare.org](mailto:support@carerscare.org) or open an issue in the GitHub repository.
```
DELETE /api/v1/blogs/:id
```

## Security

- Password hashing with bcryptjs
- JWT authentication
- Rate limiting
- XSS protection
- HTTP Parameter Pollution protection
- MongoDB query sanitization
- Security headers with helmet

## Testing

To run tests, use:
```
npm test
```

## Deployment

1. Set up a MongoDB database (MongoDB Atlas recommended for production)
2. Update environment variables for production
3. Use a process manager like PM2 to keep the application running
4. Set up Nginx as a reverse proxy
5. Configure SSL with Let's Encrypt

## License

MIT
