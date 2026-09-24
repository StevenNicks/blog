const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    permissions: [{ type: String }],
    // Los roles del sistema (admin, editor, author, reader) no se pueden renombrar ni eliminar
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
