const router = require('express').Router();
const postController = require('../controllers/post.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const { createPostValidator, updatePostValidator } = require('../validators/post.validator');
const PERM = require('../constants/permissions');

router.get('/', optionalAuth, postController.getPosts);
router.get('/:slug', optionalAuth, postController.getPostBySlug);
router.post('/', protect, authorize(PERM.POSTS_CREATE), createPostValidator, validate, postController.createPost);
router.patch('/:id', protect, updatePostValidator, validate, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);

module.exports = router;
