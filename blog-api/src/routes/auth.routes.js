const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const rateLimit = require('express-rate-limit');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  verifyEmailValidator,
} = require('../validators/auth.validator');

const makeLimiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    message: { success: false, message: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.' },
  });

const forgotLimiter = makeLimiter(5);
const resetLimiter = makeLimiter(10);
const verifyLimiter = makeLimiter(5);
const changePasswordLimiter = makeLimiter(10);

router.post(
  '/forgot-password',
  forgotLimiter,
  forgotPasswordValidator,
  validate,
  authController.forgotPassword
);
router.post(
  '/reset-password',
  resetLimiter,
  resetPasswordValidator,
  validate,
  authController.resetPassword
);
router.post(
  '/change-password',
  protect,
  changePasswordLimiter,
  changePasswordValidator,
  validate,
  authController.changePassword
);
router.post('/send-verification', protect, verifyLimiter, authController.sendVerification);
router.post(
  '/verify-email',
  resetLimiter,
  verifyEmailValidator,
  validate,
  authController.verifyEmail
);
router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);

module.exports = router;
