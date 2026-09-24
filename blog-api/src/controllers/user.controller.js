const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const getUsers = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { email: new RegExp(req.query.search, 'i') },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('role')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort('-createdAt'),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: users, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).populate('role');
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ success: true, data: user });
});

const updateUser = catchAsync(async (req, res) => {
  const isSelf = req.user._id.equals(req.params.id);
  const isAdmin = req.user.role.name === 'admin';
  if (!isSelf && !isAdmin) throw new ApiError(403, 'No puedes editar este usuario.');

  const allowedFields = ['name', 'bio', 'avatar'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('role');
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ success: true, data: user });
});

const setUserActive = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  ).populate('role');
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ success: true, data: user });
});

const assignRole = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  ).populate('role');
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ success: true, data: user });
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ success: true, data: null });
});

module.exports = { getUsers, getUser, updateUser, setUserActive, assignRole, deleteUser };
