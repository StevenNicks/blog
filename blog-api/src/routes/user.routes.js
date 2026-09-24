const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateUserValidator, assignRoleValidator } = require('../validators/user.validator');
const PERM = require('../constants/permissions');

router.use(protect);

router.get('/', authorize(PERM.USERS_MANAGE), userController.getUsers);
router.get('/:id', userController.getUser);
router.patch('/:id', updateUserValidator, validate, userController.updateUser);
router.patch('/:id/role', authorize(PERM.USERS_MANAGE), assignRoleValidator, validate, userController.assignRole);
router.patch('/:id/active', authorize(PERM.USERS_MANAGE), userController.setUserActive);
router.delete('/:id', authorize(PERM.USERS_MANAGE), userController.deleteUser);

module.exports = router;
