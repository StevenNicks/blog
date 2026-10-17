require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Role = require('../models/Role');
const PERM = require('../constants/permissions');

// Uso: node src/seed/add-comment-edit-permission.js
// Antes, cualquier usuario podía editar sus propios comentarios sin permiso específico.
// Agrega comments:edit:own a todos los roles existentes para conservar ese comportamiento.
// Es idempotente y, a diferencia de `npm run seed`, no sobrescribe los permisos de los roles.
(async () => {
  await connectDB();
  const result = await Role.updateMany({}, { $addToSet: { permissions: PERM.COMMENTS_EDIT_OWN } });
  console.log(`Roles actualizados: ${result.modifiedCount} de ${result.matchedCount}`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
