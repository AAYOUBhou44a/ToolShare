const HttpError = require('../utils/HttpError');

const validateBody =
  (schema) =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new HttpError(
          400,
          result.error.issues.map((issue) => issue.message).join(' ')
        )
      );
    }

    req.body = result.data;
    return next();
  };

module.exports = validateBody;
