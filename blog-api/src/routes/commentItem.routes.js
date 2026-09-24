const router = require('express').Router();
const commentController = require('../controllers/comment.controller');
const { protect } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const PERM = require('../constants/permissions');

// Montado en /api/comments — operaciones sobre un comentario puntual por id
router.use(protect);

router.get('/', authorize(PERM.COMMENTS_MODERATE), commentController.getAllComments);
router.patch('/:id', commentController.updateComment);
router.patch('/:id/moderate', authorize(PERM.COMMENTS_MODERATE), commentController.moderateComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
