const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');
const Post = require('../models/Post');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const PERM = require('../constants/permissions');

const buildUrl = (req, filename) => `${req.protocol}://${req.get('host')}/uploads/${filename}`;

const uploadImages = catchAsync(async (req, res) => {
  const files = req.files && req.files.length ? req.files : req.file ? [req.file] : [];
  if (!files.length) throw new ApiError(400, 'No se envió ninguna imagen.');

  const images = await Image.insertMany(
    files.map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      url: buildUrl(req, f.filename),
      mimetype: f.mimetype,
      size: f.size,
      uploadedBy: req.user._id,
    }))
  );

  res.status(201).json({ success: true, data: images });
});

const getImages = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const canSeeAll =
    req.user.role.name === 'admin' || req.user.role.permissions.includes(PERM.IMAGES_DELETE_ANY);
  const filter = canSeeAll ? {} : { uploadedBy: req.user._id };

  const [images, total] = await Promise.all([
    Image.find(filter)
      .populate('uploadedBy', 'name avatar')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort('-createdAt'),
    Image.countDocuments(filter),
  ]);

  res.json({ success: true, data: images, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const deleteImage = catchAsync(async (req, res) => {
  const image = await Image.findById(req.params.id);
  if (!image) throw new ApiError(404, 'Imagen no encontrada.');

  const isOwner = req.user._id.equals(image.uploadedBy);
  const canDeleteAny =
    req.user.role.name === 'admin' || req.user.role.permissions.includes(PERM.IMAGES_DELETE_ANY);
  const canDeleteOwn = req.user.role.permissions.includes(PERM.IMAGES_DELETE_OWN);

  if (!(canDeleteAny || (isOwner && canDeleteOwn))) {
    throw new ApiError(403, 'No tienes permiso para eliminar esta imagen.');
  }

  const inUse = await Post.exists({ $or: [{ coverImage: image._id }, { images: image._id }] });
  if (inUse) throw new ApiError(400, 'No se puede eliminar una imagen que está en uso en un post.');

  const filePath = path.join(__dirname, '..', '..', 'uploads', image.filename);
  fs.unlink(filePath, () => {});

  await image.deleteOne();
  res.json({ success: true, data: null });
});

module.exports = { uploadImages, getImages, deleteImage };
