
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ToolShare API',
      version: '1.0.0',
      description:
        'API de gestion des magasins, équipements et réservations de ToolShare.',
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
      { name: 'Users', description: 'Utilisateurs' },
      { name: 'Stores', description: 'Magasins' },
      { name: 'Equipment', description: 'Équipements' },
      { name: 'Reservations', description: 'Réservations' },
    ],
  },
  apis: ['./src/routes/*.js', './src/docs/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
