const { body } = require('express-validator');

const updateUserValidator = [
  body('name').optional().trim().notEmpty(),
  body('bio').optional().isLength({ max: 500 }),
];

const assignRoleValidator = [body('role').isMongoId().withMessage('role debe ser un id válido')];

module.exports = { updateUserValidator, assignRoleValidator };
