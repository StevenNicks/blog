const router = require('express').Router();
const { body } = require('express-validator');
const settingController = require('../controllers/setting.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const ApiError = require('../utils/ApiError');
const Setting = require('../models/Setting');

// Los ajustes del sitio solo los cambia el administrador
const requireAdmin = (req, res, next) =>
  req.user.role.name === 'admin' ? next() : next(new ApiError(403, 'Solo el administrador puede cambiar los ajustes.'));

router.get('/', settingController.getSettings);
router.patch(
  '/',
  protect,
  requireAdmin,
  [body('backgroundPattern').optional().isIn(Setting.BACKGROUND_PATTERNS).withMessage('Patrón de fondo inválido')],
  validate,
  settingController.updateSettings
);

module.exports = router;
