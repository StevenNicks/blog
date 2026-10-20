const { body } = require('express-validator');

// Acciones en lote: un arreglo de 1 a 100 ids validos (sin repetidos)
const bulkIdsValidator = [
  body('ids')
    .isArray({ min: 1, max: 100 })
    .withMessage('ids debe ser un arreglo de 1 a 100 elementos')
    .customSanitizer((ids) => [...new Set(ids)]),
  body('ids.*').isMongoId().withMessage('Cada id debe ser un id válido'),
];

const bulkPostStatusValidator = [
  ...bulkIdsValidator,
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Estado inválido'),
];

const bulkUserActiveValidator = [
  ...bulkIdsValidator,
  body('isActive').isBoolean().withMessage('isActive debe ser true o false').toBoolean(),
];

module.exports = { bulkIdsValidator, bulkPostStatusValidator, bulkUserActiveValidator };
