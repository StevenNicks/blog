const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const Comment = require('../models/Comment');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const parseSort = require('../utils/parseSort');
const runBulk = require('../utils/bulkResult');

// Columnas por las que la tabla del dashboard puede ordenar (?sort=campo o ?sort=-campo).
// ?sort=role / ?sort=-role se resuelve aparte en findUsersSortedByRole.
const USER_SORT_FIELDS = ['name', 'email', 'isActive', 'createdAt'];

const ownerEmail = () => (process.env.SEED_ADMIN_EMAIL || 'admin@blog.com').toLowerCase();

// La cuenta propietaria (SEED_ADMIN_EMAIL) no se puede degradar, desactivar ni eliminar.
// A los demás administradores solo los puede gestionar otro administrador.
const assertCanManage = async (req, id) => {
  const user = await User.findById(id).populate('role');
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  if (user.email.toLowerCase() === ownerEmail()) {
    throw new ApiError(403, 'La cuenta del propietario no se puede modificar desde aquí.');
  }
  if (user.role?.name === 'admin' && req.user.role.name !== 'admin') {
    throw new ApiError(403, 'Solo un administrador puede modificar a otro administrador.');
  }
  return user;
};

// El rol es una referencia a otra colección: find().sort() no puede ordenar por su nombre.
// Se ordena por la posición del rol en la lista de roles ordenada alfabéticamente, y la
// agregación solo devuelve los ids de la página; los usuarios se cargan después con find()
// para conservar populate, toJSON y select:false (la contraseña nunca sale de la base).
const findUsersSortedByRole = async (filter, direction, skip, limit) => {
  const roleIds = (await Role.find().sort('name').select('_id')).map((r) => r._id);

  // En una agregación no hay cast automático: el id del filtro (ya validado) llega como string
  const match = { ...filter };
  if (match.role) match.role = new mongoose.Types.ObjectId(String(match.role));

  const rows = await User.aggregate([
    { $match: match },
    { $addFields: { roleOrder: { $indexOfArray: [roleIds, '$role'] } } },
    { $sort: { roleOrder: direction, _id: direction } },
    { $skip: skip },
    { $limit: limit },
    { $project: { _id: 1 } },
  ]);

  const ids = rows.map((row) => row._id);
  const docs = await User.find({ _id: { $in: ids } }).populate('role');
  const byId = new Map(docs.map((doc) => [String(doc._id), doc]));
  return ids.map((id) => byId.get(String(id))).filter(Boolean);
};

const getUsers = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const filter = {};
  if (req.query.role) {
    if (!mongoose.isValidObjectId(req.query.role)) throw new ApiError(400, 'El rol del filtro no es válido.');
    filter.role = req.query.role;
  }
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { email: new RegExp(req.query.search, 'i') },
    ];
  }

  const skip = (page - 1) * limit;
  const roleSort = req.query.sort === 'role' ? 1 : req.query.sort === '-role' ? -1 : 0;

  const [users, total] = await Promise.all([
    roleSort
      ? findUsersSortedByRole(filter, roleSort, skip, limit)
      : User.find(filter)
          .populate('role')
          .skip(skip)
          .limit(limit)
          .sort(parseSort(req.query.sort, USER_SORT_FIELDS) ?? '-createdAt'),
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

  const allowedFields = ['name', 'bio', 'avatar', 'coverImage'];
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
  await assertCanManage(req, req.params.id);
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  ).populate('role');
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ success: true, data: user });
});

const assignRole = catchAsync(async (req, res) => {
  const role = await Role.findById(req.body.role);
  if (!role) throw new ApiError(404, 'Rol no encontrado.');
  if (req.user._id.equals(req.params.id)) throw new ApiError(403, 'No puedes cambiar tu propio rol.');
  if (role.name === 'admin' && req.user.role.name !== 'admin') {
    throw new ApiError(403, 'Solo un administrador puede asignar el rol de administrador.');
  }
  await assertCanManage(req, req.params.id);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  ).populate('role');
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ success: true, data: user });
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await assertCanManage(req, req.params.id);
  await Comment.deleteMany({ author: user._id });
  await user.deleteOne();
  res.json({ success: true, data: null });
});

// En lote, la propia cuenta queda fuera: "seleccionar todo" no debe poder dejarte sin acceso
const assertNotSelf = (req, id) => {
  if (req.user._id.equals(id)) throw new ApiError(403, 'No puedes aplicar esta acción a tu propia cuenta.');
};

const bulkDeleteUsers = catchAsync(async (req, res) => {
  const result = await runBulk(req.body.ids, async (id) => {
    assertNotSelf(req, id);
    const user = await assertCanManage(req, id);
    await Comment.deleteMany({ author: user._id });
    await user.deleteOne();
  });
  res.json({ success: true, data: result });
});

const bulkSetUsersActive = catchAsync(async (req, res) => {
  const { isActive } = req.body;
  const result = await runBulk(req.body.ids, async (id) => {
    assertNotSelf(req, id);
    await assertCanManage(req, id);
    await User.updateOne({ _id: id }, { isActive });
  });
  res.json({ success: true, data: result });
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  setUserActive,
  assignRole,
  deleteUser,
  bulkDeleteUsers,
  bulkSetUsersActive,
};
