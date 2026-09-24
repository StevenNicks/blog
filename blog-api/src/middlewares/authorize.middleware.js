const ApiError = require('../utils/ApiError');

// Autoriza si el usuario tiene al menos uno de los permisos indicados,
// o si su rol es 'admin' (los admins pasan cualquier chequeo de permisos).
const authorize = (...permissions) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'No autenticado.'));

  const { role } = req.user;
  if (role.name === 'admin') return next();

  const hasPermission = permissions.some((p) => role.permissions.includes(p));
  if (!hasPermission) {
    return next(new ApiError(403, 'No tienes permiso para realizar esta acción.'));
  }
  next();
};

module.exports = authorize;
