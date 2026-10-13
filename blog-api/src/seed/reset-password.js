require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

// Uso: node src/seed/reset-password.js <email> <nueva-contraseña>
const [email, newPassword] = process.argv.slice(2);

(async () => {
  if (!email || !newPassword) {
    console.error('Uso: node src/seed/reset-password.js <email> <nueva-contraseña>');
    process.exit(1);
  }
  if (newPassword.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    console.error(`No existe un usuario con el email ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.password = newPassword; // el hook pre('save') la hashea con bcrypt
  await user.save();
  console.log(`Contraseña actualizada para ${user.email}`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
