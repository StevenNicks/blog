const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('El token es obligatorio'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('La nueva contraseña debe ser distinta de la actual'),
];

const verifyEmailValidator = [body('token').notEmpty().withMessage('El token es obligatorio')];

module.exports = {
  verifyEmailValidator,
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
};
