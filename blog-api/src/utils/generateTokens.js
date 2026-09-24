const jwt = require('jsonwebtoken');

const generateAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role.name,
      permissions: user.role.permissions || [],
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );

const generateRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

module.exports = { generateAccessToken, generateRefreshToken };
