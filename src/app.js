const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const magasinRoutes = require('./routes/magasinRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const errorHandler = require('./middlewares/errorHandler');
const HttpError = require('./utils/HttpError');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/magasins', magasinRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/emprunts', require('./routes/emprunt.routes'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ToolShare API fonctionne correctement',
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
  next(new HttpError(404, 'Route introuvable.'));
});
app.use(errorHandler);

module.exports = app;