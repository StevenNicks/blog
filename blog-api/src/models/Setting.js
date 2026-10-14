const mongoose = require('mongoose');

// Ajustes globales del sitio. Es un documento único (key: 'site').
const BACKGROUND_PATTERNS = ['dot-grid', 'grid', 'dots', 'spotlight', 'none'];

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'site' },
    // Patrón de fondo de las páginas de acceso (auth): 'dot-grid' (cuadrícula con puntos),
    // 'grid' (cuadrícula suave), 'dots' (puntos), 'spotlight' (foco de luz) o 'none'
    backgroundPattern: { type: String, enum: BACKGROUND_PATTERNS, default: 'dot-grid' },
  },
  { timestamps: true }
);

settingSchema.statics.getSite = function getSite() {
  return this.findOneAndUpdate({ key: 'site' }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
};

const Setting = mongoose.model('Setting', settingSchema);
Setting.BACKGROUND_PATTERNS = BACKGROUND_PATTERNS;

module.exports = Setting;
