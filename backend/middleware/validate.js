const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Validation Error',
          status: 400,
          detail: 'Request body failed validation',
          instance: req.originalUrl,
          errors: details,
        });
      }
      next(err);
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Validation Error',
          status: 400,
          detail: 'Query parameters failed validation',
          instance: req.originalUrl,
          errors: details,
        });
      }
      next(err);
    }
  };
}

module.exports = { validate, validateQuery };
