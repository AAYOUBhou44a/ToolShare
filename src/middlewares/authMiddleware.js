const authService = require('../services/authService');
const HttpError = require('../utils/HttpError');

const authenticate = async (req, res, next) => {
  const authorization = req.get('authorization');
  const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return next(new HttpError(401, 'Authentification requise.'));
  }

  req.utilisateur = await authService.authenticate(match[1]);
  return next();
};


const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.utilisateur) {
      return next(new HttpError(401, 'Authentification requise.'));
    }

    if (!roles.includes(req.utilisateur.role)) {
      return next(new HttpError(403, 'Accès interdit.'));
    }

    return next();
  };

module.exports = { authenticate, authorizeRoles };
