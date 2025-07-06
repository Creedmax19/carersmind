const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "Carer's Care CIC API",
      version: '1.0.0',
      description: 'API documentation for Carer\'s Care CIC application',
      contact: {
        name: 'Support',
        email: 'support@carerscare.org'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.carerscare.org/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'password123'
            },
            role: {
              type: 'string',
              enum: ['user', 'editor', 'admin'],
              default: 'user',
              example: 'user'
            }
          }
        },
        Blog: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: {
              type: 'string',
              example: 'Sample Blog Post'
            },
            content: {
              type: 'string',
              example: 'This is the content of the blog post.'
            },
            excerpt: {
              type: 'string',
              example: 'A short excerpt from the blog post.'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              default: 'draft',
              example: 'published'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['health', 'wellbeing']
            },
            categories: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['resources', 'guides']
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  
  // API docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};
