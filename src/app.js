const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ToolShare API fonctionne correctement',
  });
});

app.use('/api-docs', swaggerUi.serve(), swaggerUi.setup(swaggerSpec));

module.exports = app;