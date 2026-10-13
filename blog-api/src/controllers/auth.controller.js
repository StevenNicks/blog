const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { resetPasswordEmail } = require('../utils/emailTemplates');
const User = require('../models/User');
const Role = require('../models/Role');
const Token = require('../models/Token');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const hashToken = require('../utils/hashToken');

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

const issueTokens = async (res, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await Token.create({
    user: user._id,
    token: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TTL_MS,
  });

  return accessToken;
};

const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Ya existe una cuenta con este email.');

  const defaultRole = await Role.findOne({ name: 'reader' });
  if (!defaultRole) {
    throw new ApiError(500, 'Rol por defecto no configurado. Ejecuta "npm run seed".');
  }

  const user = await User.create({ name, email, password, role: defaultRole._id });
  await user.populate('role');

  const accessToken = await issueTokens(res, user);
  res.status(201).json({ success: true, data: { user, accessToken } });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password').populate('role');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Credenciales inválidas.');
  }
  if (!user.isActive) throw new ApiError(403, 'Esta cuenta está desactivada.');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = await issueTokens(res, user);
  res.json({ success: true, data: { user, accessToken } });
});

const refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, 'No hay token de refresco.');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Token de refresco inválido o expirado.');
  }

  const hashed = hashToken(token);
  const stored = await Token.findOne({ user: payload.sub, token: hashed, revoked: false });
  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Token de refresco inválido o expirado.');
  }

  const user = await User.findById(payload.sub).populate('role');
  if (!user || !user.isActive) throw new ApiError(401, 'Usuario no encontrado o inactivo.');

  // Rotación: se revoca el token usado y se emite uno nuevo
  stored.revoked = true;
  await stored.save();

  const accessToken = await issueTokens(res, user);
  res.json({ success: true, data: { accessToken } });
});

const logout = catchAsync(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await Token.updateMany({ token: hashToken(token) }, { revoked: true });
  }
  res.clearCookie(REFRESH_COOKIE);
  res.json({ success: true, data: null });
});

const me = catchAsync(async (req, res) => {
  res.json({ success: true, data: req.user });
});

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hora

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  // Respuesta genérica para no revelar si el email existe
  const response = {
    success: true,
    data: { message: 'Si el correo existe, te enviamos un enlace para restablecer tu contraseña.' },
  };

  const user = await User.findOne({ email, isActive: true });
  if (!user) return res.json(response);

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = hashToken(rawToken);
  user.resetPasswordExpires = new Date(Date.now() + RESET_TTL_MS);
  await user.save({ validateBeforeSave: false });

  // El enlace apunta al mismo origen desde el que se pidió, si es uno de los permitidos
  const clientUrls = (process.env.CLIENT_URL || '').split(',').map((o) => o.trim()).filter(Boolean);
  const clientUrl = clientUrls.includes(req.get('origin')) ? req.get('origin') : clientUrls[0];
  const link = `${clientUrl}/reset-password?token=${rawToken}`;
  try {
    await sendEmail({
      to: user.email,
      ...resetPasswordEmail({ name: user.name, link, expiresMinutes: RESET_TTL_MS / 60000 }),
    });
  } catch (err) {
    console.error('[forgot-password] Error enviando correo:', err.message);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'No se pudo enviar el correo. Inténtalo más tarde.');
  }

  res.json(response);
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');
  if (!user) throw new ApiError(400, 'El enlace es inválido o ha expirado.');

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // Cierra todas las sesiones existentes
  await Token.updateMany({ user: user._id }, { revoked: true });

  res.json({ success: true, data: { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' } });
});

module.exports = { register, login, refresh, logout, me, forgotPassword, resetPassword };
