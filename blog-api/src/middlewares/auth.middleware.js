const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

// Requiere autenticación: rechaza la petición si no hay token válido.
const protect = catchAsync(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw new ApiError(401, 'No autenticado. Token no proporcionado.');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Token inválido o expirado.');
  }

  const user = await User.findById(payload.sub).populate('role');
  if (!user || !user.isActive) throw new ApiError(401, 'Usuario no encontrado o inactivo.');

  req.user = user;
  next();
});

// No rechaza si no hay token, pero adjunta req.user si el token es válido
// (útil para endpoints públicos que muestran más datos a usuarios autenticados).
const optionalAuth = catchAsync(async (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(payload.sub).populate('role');
      if (user && user.isActive) req.user = user;
    } catch (err) {
      // Token inválido en ruta opcional: se ignora y se continúa como anónimo
    }
  }
  next();
});

module.exports = { protect, optionalAuth };
