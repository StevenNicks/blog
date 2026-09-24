require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Role = require('../models/Role');
const User = require('../models/User');
const PERM = require('../constants/permissions');

const roles = [
  {
    name: 'admin',
    description: 'Control total de la plataforma',
    isSystem: true,
    permissions: Object.values(PERM),
  },
  {
    name: 'editor',
    description: 'Gestiona y publica contenido de cualquier autor, modera comentarios',
    isSystem: true,
    permissions: [
      PERM.POSTS_CREATE,
      PERM.POSTS_EDIT_ANY,
      PERM.POSTS_DELETE_ANY,
      PERM.COMMENTS_CREATE,
      PERM.COMMENTS_MODERATE,
      PERM.COMMENTS_DELETE_ANY,
      PERM.IMAGES_UPLOAD,
      PERM.IMAGES_DELETE_ANY,
    ],
  },
  {
    name: 'author',
    description: 'Escribe y gestiona sus propios posts',
    isSystem: true,
    permissions: [
      PERM.POSTS_CREATE,
      PERM.POSTS_EDIT_OWN,
      PERM.POSTS_DELETE_OWN,
      PERM.COMMENTS_CREATE,
      PERM.COMMENTS_DELETE_OWN,
      PERM.IMAGES_UPLOAD,
      PERM.IMAGES_DELETE_OWN,
    ],
  },
  {
    name: 'reader',
    description: 'Puede comentar en los posts publicados',
    isSystem: true,
    permissions: [PERM.COMMENTS_CREATE, PERM.COMMENTS_DELETE_OWN],
  },
];

const run = async () => {
  await connectDB();

  for (const r of roles) {
    // eslint-disable-next-line no-await-in-loop
    await Role.findOneAndUpdate({ name: r.name }, r, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
  console.log('Roles creados/actualizados: admin, editor, author, reader');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@blog.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin12345!';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const adminRole = await Role.findOne({ name: 'admin' });
    await User.create({
      name: 'Administrador',
      email: adminEmail,
      password: adminPassword,
      role: adminRole._id,
    });
    console.log(`Usuario admin creado -> email: ${adminEmail} / password: ${adminPassword}`);
  } else {
    console.log('El usuario admin ya existe, se omite su creación.');
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Error al ejecutar el seed:', err);
  process.exit(1);
});
