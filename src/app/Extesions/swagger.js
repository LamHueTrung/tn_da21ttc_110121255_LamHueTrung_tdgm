const swaggerJsdoc = require('swagger-jsdoc'); 
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const URLServer = process.env.API_URL;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Tài liệu hệ thống quản lý thiết bị",
      version: "1.0.0",
      description:
        "Tài liệu API cho hệ thống quản lý mượn trả thiết bị, quà tặng và thống kê.",
    },
    servers: [
      {
        url: URLServer,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Định dạng token
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Áp dụng Bearer Authentication cho tất cả các endpoint
      },
    ],
  },
  apis: [
               path.join(__dirname, '../../routes/api/*.js'),         
  ],
  
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
