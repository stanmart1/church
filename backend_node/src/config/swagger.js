import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bibleway Fellowship Tabernacle API',
      version: '1.0.0',
      description: 'Church Management System API Documentation',
      contact: {
        name: 'API Support',
        email: 'biblewayft@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development server',
      },
            {
        url: 'https://churchapi.scaleitpro.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'pastor', 'minister', 'staff', 'member'] },
            phone: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Sermon: {
          type: 'object',
          required: ['title', 'speaker', 'date'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', minLength: 3, maxLength: 255 },
            speaker: { type: 'string', minLength: 2, maxLength: 100 },
            date: { type: 'string', format: 'date' },
            duration: { type: 'integer', minimum: 0 },
            description: { type: 'string', maxLength: 2000 },
            series_id: { type: 'string', format: 'uuid' },
            audio_url: { type: 'string' },
            thumbnail_url: { type: 'string' },
            tags: { type: 'string' },
          },
        },
        Giving: {
          type: 'object',
          required: ['member_id', 'amount', 'type', 'method'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            member_id: { type: 'string', format: 'uuid' },
            amount: { type: 'number', minimum: 0.01 },
            type: { type: 'string', enum: ['tithe', 'offering', 'missions', 'building_fund', 'special'] },
            method: { type: 'string', enum: ['cash', 'check', 'online', 'card'] },
            date: { type: 'string', format: 'date' },
            notes: { type: 'string', maxLength: 500 },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            field: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
