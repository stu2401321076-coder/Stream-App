const { MongooseError } = require('mongoose');

function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${err.message}`);

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      type: 'https://httpstatuses.com/400',
      title: 'Validation Error',
      status: 400,
      detail: 'Database validation failed',
      instance: req.originalUrl,
      errors: details,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      type: 'https://httpstatuses.com/400',
      title: 'Bad Request',
      status: 400,
      detail: `Invalid value for field "${err.path}": ${err.value}`,
      instance: req.originalUrl,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'unknown';
    return res.status(409).json({
      type: 'https://httpstatuses.com/409',
      title: 'Conflict',
      status: 409,
      detail: `Duplicate value for field "${field}". This value already exists.`,
      instance: req.originalUrl,
    });
  }

  if (err instanceof MongooseError) {
    return res.status(500).json({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: 'A database error occurred',
      instance: req.originalUrl,
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      type: 'https://httpstatuses.com/400',
      title: 'Upload Error',
      status: 400,
      detail: err.message,
      instance: req.originalUrl,
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    type: `https://httpstatuses.com/${status}`,
    title: status === 500 ? 'Internal Server Error' : 'Error',
    status,
    detail: status === 500 ? 'An unexpected error occurred' : err.message,
    instance: req.originalUrl,
  });
}

module.exports = errorHandler;
