const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Ruta no encontrada: ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `El valor de '${field}' ya está en uso.`;
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Identificador inválido: ${err.value}`;
  }
  if (err instanceof require('multer').MulterError) {
    statusCode = 400;
    message = err.message;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: message || 'Error interno del servidor',
    ...(err.details && { details: err.details }),
  });
};

module.exports = { notFound, errorHandler };
