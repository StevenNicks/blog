const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/roles', require('./role.routes'));
router.use('/posts', require('./post.routes'));
router.use('/posts/:postId/comments', require('./comment.routes'));
router.use('/comments', require('./commentItem.routes'));
router.use('/images', require('./image.routes'));

module.exports = router;
