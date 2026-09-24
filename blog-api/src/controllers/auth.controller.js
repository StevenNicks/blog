const jwt = require('jsonwebtoken');
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

module.exports = { register, login, refresh, logout, me };
