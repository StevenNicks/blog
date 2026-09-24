const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    // Contenido enriquecido (HTML saneado en el servidor antes de guardar)
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 500, default: '' },
    coverImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', default: null },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, trim: true, default: 'general' },
    tags: [{ type: String, trim: true, lowercase: true }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
