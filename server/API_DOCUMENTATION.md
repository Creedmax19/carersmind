# Carer's Care CIC - API Documentation

Welcome to the Carer's Care CIC API documentation. This guide will help you understand how to interact with our API to build applications that can create, read, update, and delete resources in our system.

## Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Blogs](#blogs)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Pagination](#pagination)
7. [Filtering & Sorting](#filtering--sorting)

## Base URL

All API endpoints are relative to the base URL:

```
https://api.carerscare.org/api/v1
```

For local development:

```
http://localhost:5000/api/v1
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens). To authenticate your requests, include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

### Getting an Authentication Token

1. **Register** a new user:
   ```http
   POST /auth/register
   ```

2. **Login** with your credentials:
   ```http
   POST /auth/login
   ```

## Endpoints

### Auth

#### Register a New User

```http
POST /auth/register
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60a7b4f5e6b0a80015f8d5e1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60a7b4f5e6b0a80015f8d5e1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Blogs

#### Get All Blogs

```http
GET /blogs
```

**Query Parameters:**

| Parameter | Type    | Description                          |
|-----------|---------|--------------------------------------|
| page      | integer | Page number (default: 1)             |
| limit     | integer | Items per page (default: 10, max: 50)|
| tag       | string  | Filter by tag                        |
| category  | string  | Filter by category                   |
| sort      | string  | Sort by field (prefix with - for desc)|

**Response:**

```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 10
    }
  },
  "data": [
    {
      "_id": "60a7b4f5e6b0a80015f8d5e1",
      "title": "Welcome to Carer's Care CIC",
      "slug": "welcome-to-carers-care-cic",
      "content": "...",
      "excerpt": "Welcome to our community of carers...",
      "status": "published",
      "tags": ["welcome", "community"],
      "categories": ["announcements"],
      "author": {
        "_id": "60a7b4f5e6b0a80015f8d5e1",
        "name": "Admin User"
      },
      "createdAt": "2023-03-01T10:00:00.000Z",
      "updatedAt": "2023-03-01T10:00:00.000Z"
    }
  ]
}
```

#### Create a New Blog (Protected)

```http
POST /blogs
```

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "New Blog Post",
  "content": "This is the content of the blog post...",
  "excerpt": "A short excerpt...",
  "status": "draft",
  "tags": ["health", "wellbeing"],
  "categories": ["resources"]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "60a7b4f5e6b0a80015f8d5e2",
    "title": "New Blog Post",
    "slug": "new-blog-post",
    "content": "This is the content of the blog post...",
    "excerpt": "A short excerpt...",
    "status": "draft",
    "tags": ["health", "wellbeing"],
    "categories": ["resources"],
    "author": "60a7b4f5e6b0a80015f8d5e1",
    "createdAt": "2023-03-02T15:30:45.000Z",
    "updatedAt": "2023-03-02T15:30:45.000Z"
  }
}
```

## Error Handling

All error responses follow the same format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

- `200 OK` - Request was successful
- `201 Created` - Resource was created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

The API is rate limited to 100 requests per 10 minutes per IP address. If you exceed this limit, you'll receive a `429 Too Many Requests` response.

## Pagination

Endpoints that return lists of resources support pagination using the `page` and `limit` query parameters. The response includes a `pagination` object with information about the current page and links to the next/previous pages.

## Filtering & Sorting

### Filtering

You can filter results by including query parameters that match the resource properties:

```
GET /blogs?status=published&tags=health
```

### Sorting

Sort results by including a `sort` parameter with the field to sort by. Prefix the field with `-` for descending order:

```
GET /blogs?sort=-createdAt  # Newest first
GET /blogs?sort=title       # A-Z by title
```

## Webhook Events

(To be implemented in future versions)

## Support

For support, please contact [support@carerscare.org](mailto:support@carerscare.org).
