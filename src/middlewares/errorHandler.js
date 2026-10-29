const HttpError = require('../utils/HttpError');

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Une ressource avec cette valeur existe déjà.',
    });
  }

  if (error.code === 20) {
    return res.status(503).json({
      success: false,
      message:
        'Les réservations nécessitent MongoDB configuré en replica set.',
    });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Le corps de la requête JSON est invalide.',
    });
  }

  console.error('Erreur API non gérée :', error);
  return res.status(500).json({
    success: false,
    message: 'Une erreur interne est survenue.',
  });
};

module.exports = errorHandler;
