const router = require('express').Router();
const roleController = require('../controllers/role.controller');
const { protect } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const { roleValidator } = require('../validators/role.validator');
const PERM = require('../constants/permissions');

router.use(protect, authorize(PERM.ROLES_MANAGE));

router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRole);
router.post('/', roleValidator, validate, roleController.createRole);
router.patch('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

module.exports = router;
