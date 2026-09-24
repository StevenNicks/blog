const Comment = require('../models/Comment');
const Post = require('../models/Post');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const PERM = require('../constants/permissions');

const canModerate = (user) =>
  !!user && (user.role.name === 'admin' || user.role.permissions.includes(PERM.COMMENTS_MODERATE));

const getComments = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post no encontrado.');

  const filter = { post: post._id };
  if (!canModerate(req.user)) filter.status = 'approved';

  const comments = await Comment.find(filter).populate('author', 'name avatar').sort('createdAt');
  res.json({ success: true, data: comments });
});

// Bandeja de moderación: todos los comentarios de todos los posts (requiere comments:moderate).
const getAllComments = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate('author', 'name avatar')
      .populate('post', 'title slug')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Comment.countDocuments(filter),
  ]);

  res.json({ success: true, data: comments, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const createComment = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post no encontrado.');
  if (post.status !== 'published') {
    throw new ApiError(400, 'No se pueden comentar posts que no están publicados.');
  }

  if (req.body.parentComment) {
    const parent = await Comment.findById(req.body.parentComment);
    if (!parent || !parent.post.equals(post._id)) {
      throw new ApiError(400, 'Comentario padre inválido.');
    }
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    content: req.body.content,
    parentComment: req.body.parentComment || null,
  });

  await comment.populate('author', 'name avatar');
  res.status(201).json({ success: true, data: comment });
});

const getCommentOr404 = async (id) => {
  const comment = await Comment.findById(id);
  if (!comment) throw new ApiError(404, 'Comentario no encontrado.');
  return comment;
};

const updateComment = catchAsync(async (req, res) => {
  const comment = await getCommentOr404(req.params.id);
  if (!req.user._id.equals(comment.author)) {
    throw new ApiError(403, 'Solo puedes editar tus propios comentarios.');
  }

  comment.content = req.body.content;
  await comment.save();
  res.json({ success: true, data: comment });
});

const deleteComment = catchAsync(async (req, res) => {
  const comment = await getCommentOr404(req.params.id);
  const isOwner = req.user._id.equals(comment.author);
  const canDeleteAny =
    req.user.role.name === 'admin' ||
    req.user.role.permissions.includes(PERM.COMMENTS_MODERATE) ||
    req.user.role.permissions.includes(PERM.COMMENTS_DELETE_ANY);
  const canDeleteOwn = req.user.role.permissions.includes(PERM.COMMENTS_DELETE_OWN);

  if (!(canDeleteAny || (isOwner && canDeleteOwn))) {
    throw new ApiError(403, 'No tienes permiso para eliminar este comentario.');
  }

  await comment.deleteOne();
  res.json({ success: true, data: null });
});

const moderateComment = catchAsync(async (req, res) => {
  const comment = await getCommentOr404(req.params.id);
  if (!['pending', 'approved', 'spam'].includes(req.body.status)) {
    throw new ApiError(400, 'Estado inválido. Usa pending, approved o spam.');
  }
  comment.status = req.body.status;
  await comment.save();
  res.json({ success: true, data: comment });
});

module.exports = {
  getComments,
  getAllComments,
  createComment,
  updateComment,
  deleteComment,
  moderateComment,
};
