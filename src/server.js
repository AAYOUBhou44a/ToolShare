require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const { getJwtConfig } = require('./config/jwt');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  getJwtConfig();
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Serveur ToolShare démarré sur le port ${PORT}`);
  });
};

startServer();