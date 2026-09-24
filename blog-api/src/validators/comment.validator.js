const { body } = require('express-validator');

const createCommentValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('El comentario no puede estar vacío')
    .isLength({ max: 2000 }),
  body('parentComment')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('parentComment inválido'),
];

module.exports = { createCommentValidator };
