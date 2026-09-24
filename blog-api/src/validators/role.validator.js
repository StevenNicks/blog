const { body } = require('express-validator');

const roleValidator = [
  body('name').trim().notEmpty().withMessage('El nombre del rol es obligatorio'),
  body('permissions').optional().isArray().withMessage('permissions debe ser un arreglo'),
];

module.exports = { roleValidator };
