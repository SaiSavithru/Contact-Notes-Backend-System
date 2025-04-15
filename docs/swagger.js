const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Contact Notes API', version: '1.0.0' },
    components: {
      securitySchemes: {
          bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      }
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);