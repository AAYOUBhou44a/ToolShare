const HttpError = require('../utils/HttpError');

const validateQuery =
  (schema) =>
  (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(
        new HttpError(
          400,
          result.error.issues.map((issue) => issue.message).join(' ')
        )
      );
    }

    res.locals.query = result.data;
    return next();
  };

module.exports = validateQuery;
