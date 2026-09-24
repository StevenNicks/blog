const { body } = require('express-validator');

const createPostValidator = [
  body('title').trim().notEmpty().withMessage('El título es obligatorio').isLength({ max: 200 }),
  body('content').notEmpty().withMessage('El contenido es obligatorio'),
  body('category').optional().trim(),
  body('tags').optional().isArray().withMessage('tags debe ser un arreglo de strings'),
  body('status').optional().isIn(['draft', 'published', 'archived']),
];

const updatePostValidator = [
  body('title').optional().trim().isLength({ max: 200 }),
  body('content').optional().notEmpty(),
  body('tags').optional().isArray().withMessage('tags debe ser un arreglo de strings'),
  body('status').optional().isIn(['draft', 'published', 'archived']),
];

module.exports = { createPostValidator, updatePostValidator };
