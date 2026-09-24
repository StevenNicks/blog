const slugify = require('slugify');
const Post = require('../models/Post');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sanitizeRichContent, stripToExcerpt } = require('../utils/sanitize');
const PERM = require('../constants/permissions');

const buildUniqueSlug = async (title) => {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Post.exists({ slug })) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
};

const canSeeAllPosts = (user) =>
  !!user && (user.role.name === 'admin' || user.role.permissions.includes(PERM.POSTS_EDIT_ANY));

const getPosts = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const filter = {};

  const privileged = canSeeAllPosts(req.user);
  const isOwnAuthorQuery =
    req.user && req.query.author && req.user._id.equals(req.query.author);

  if (privileged || isOwnAuthorQuery) {
    if (req.query.status) filter.status = req.query.status;
  } else {
    filter.status = 'published';
  }

  if (req.query.author) filter.author = req.query.author;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name avatar')
      .populate('coverImage')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(req.query.search ? { score: { $meta: 'textScore' } } : '-createdAt'),
    Post.countDocuments(filter),
  ]);

  res.json({ success: true, data: posts, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const getPostBySlug = catchAsync(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug })
    .populate('author', 'name avatar bio')
    .populate('coverImage')
    .populate('images');

  if (!post) throw new ApiError(404, 'Post no encontrado.');

  const isOwnerOrEditor =
    req.user &&
    (req.user._id.equals(post.author._id) ||
      req.user.role.name === 'admin' ||
      req.user.role.permissions.includes(PERM.POSTS_EDIT_ANY));

  if (post.status !== 'published' && !isOwnerOrEditor) {
    throw new ApiError(404, 'Post no encontrado.');
  }

  if (post.status === 'published') {
    post.views += 1;
    await post.save({ validateBeforeSave: false });
  }

  res.json({ success: true, data: post });
});

const createPost = catchAsync(async (req, res) => {
  const { title, content, category, tags, status, coverImage, images, excerpt } = req.body;

  const cleanContent = sanitizeRichContent(content);
  const slug = await buildUniqueSlug(title);

  const post = await Post.create({
    title,
    slug,
    content: cleanContent,
    excerpt: excerpt ? stripToExcerpt(excerpt) : stripToExcerpt(cleanContent),
    author: req.user._id,
    category,
    tags,
    coverImage: coverImage || null,
    images: images || [],
    status: status || 'draft',
    publishedAt: status === 'published' ? new Date() : null,
  });

  res.status(201).json({ success: true, data: post });
});

const getPostOr404 = async (id) => {
  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post no encontrado.');
  return post;
};

const assertCanEdit = (req, post) => {
  const isOwner = req.user._id.equals(post.author);
  const canEditAny = req.user.role.name === 'admin' || req.user.role.permissions.includes(PERM.POSTS_EDIT_ANY);
  const canEditOwn = req.user.role.permissions.includes(PERM.POSTS_EDIT_OWN);
  if (!(canEditAny || (isOwner && canEditOwn))) {
    throw new ApiError(403, 'No tienes permiso para editar este post.');
  }
};

const assertCanDelete = (req, post) => {
  const isOwner = req.user._id.equals(post.author);
  const canDeleteAny =
    req.user.role.name === 'admin' || req.user.role.permissions.includes(PERM.POSTS_DELETE_ANY);
  const canDeleteOwn = req.user.role.permissions.includes(PERM.POSTS_DELETE_OWN);
  if (!(canDeleteAny || (isOwner && canDeleteOwn))) {
    throw new ApiError(403, 'No tienes permiso para eliminar este post.');
  }
};

const updatePost = catchAsync(async (req, res) => {
  const post = await getPostOr404(req.params.id);
  assertCanEdit(req, post);

  const { title, content, category, tags, status, coverImage, images, excerpt } = req.body;

  if (title && title !== post.title) {
    post.title = title;
    post.slug = await buildUniqueSlug(title);
  }
  if (content) {
    post.content = sanitizeRichContent(content);
    if (!excerpt) post.excerpt = stripToExcerpt(post.content);
  }
  if (excerpt) post.excerpt = stripToExcerpt(excerpt);
  if (category !== undefined) post.category = category;
  if (tags !== undefined) post.tags = tags;
  if (coverImage !== undefined) post.coverImage = coverImage;
  if (images !== undefined) post.images = images;
  if (status && status !== post.status) {
    post.status = status;
    if (status === 'published' && !post.publishedAt) post.publishedAt = new Date();
  }

  await post.save();
  res.json({ success: true, data: post });
});

const deletePost = catchAsync(async (req, res) => {
  const post = await getPostOr404(req.params.id);
  assertCanDelete(req, post);
  await post.deleteOne();
  res.json({ success: true, data: null });
});

module.exports = { getPosts, getPostBySlug, createPost, updatePost, deletePost };
