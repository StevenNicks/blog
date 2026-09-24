const router = require('express').Router();
const imageController = require('../controllers/image.controller');
const { protect } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const upload = require('../middlewares/upload.middleware');
const PERM = require('../constants/permissions');

router.use(protect);

router.get('/', imageController.getImages);
router.post('/', authorize(PERM.IMAGES_UPLOAD), upload.array('images', 10), imageController.uploadImages);
router.delete('/:id', imageController.deleteImage);

module.exports = router;
