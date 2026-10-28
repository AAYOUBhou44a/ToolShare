
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('node:path');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ToolShare API',
      version: '1.0.0',
      description:
        'API de gestion des magasins, équipements, réservations et emprunts ToolShare. Les opérations protégées utilisent un jeton Bearer JWT.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Authentification avec un token JWT.',
        },
      },
    },
    tags: [
      { name: 'Health', description: 'État de l’API' },
      { name: 'Auth', description: 'Authentification' },
      { name: 'Stores', description: 'Gestion des magasins' },
      { name: 'Reservations', description: 'Réservations' },
      { name: 'Loans', description: 'Sorties, retours, retards et mouvements' },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../docs/*.js'),
    path.join(__dirname, '../app.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
