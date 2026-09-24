const router = require('express').Router({ mergeParams: true });
const commentController = require('../controllers/comment.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCommentValidator } = require('../validators/comment.validator');

// Montado en /api/posts/:postId/comments
router.get('/', optionalAuth, commentController.getComments);
router.post('/', protect, createCommentValidator, validate, commentController.createComment);

module.exports = router;
