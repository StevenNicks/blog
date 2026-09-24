const Role = require('../models/Role');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const getRoles = catchAsync(async (req, res) => {
  const roles = await Role.find().sort('name');
  res.json({ success: true, data: roles });
});

const getRole = catchAsync(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, 'Rol no encontrado.');
  res.json({ success: true, data: role });
});

const createRole = catchAsync(async (req, res) => {
  const { name, description, permissions } = req.body;
  const role = await Role.create({ name: name.toLowerCase(), description, permissions });
  res.status(201).json({ success: true, data: role });
});

const updateRole = catchAsync(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, 'Rol no encontrado.');
  if (role.isSystem && req.body.name) {
    throw new ApiError(400, 'No se puede renombrar un rol del sistema.');
  }

  const { description, permissions, name } = req.body;
  if (description !== undefined) role.description = description;
  if (permissions !== undefined) role.permissions = permissions;
  if (name !== undefined && !role.isSystem) role.name = name.toLowerCase();

  await role.save();
  res.json({ success: true, data: role });
});

const deleteRole = catchAsync(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, 'Rol no encontrado.');
  if (role.isSystem) throw new ApiError(400, 'No se puede eliminar un rol del sistema.');

  const inUse = await User.countDocuments({ role: role._id });
  if (inUse > 0) {
    throw new ApiError(400, 'No se puede eliminar un rol que está asignado a usuarios.');
  }

  await role.deleteOne();
  res.json({ success: true, data: null });
});

module.exports = { getRoles, getRole, createRole, updateRole, deleteRole };
