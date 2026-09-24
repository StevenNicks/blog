export type RoleName = "admin" | "editor" | "author" | "reader" | string

export interface Role {
  _id: string
  name: RoleName
  description?: string
  permissions: string[]
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  name: string
  email: string
  avatar: string | null
  bio: string
  role: Role
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ImageAsset {
  _id: string
  filename: string
  originalName: string
  url: string
  mimetype: string
  size: number
  alt: string
  uploadedBy: string | Pick<User, "_id" | "name" | "avatar">
  createdAt: string
  updatedAt: string
}

export type PostStatus = "draft" | "published" | "archived"

export interface Post {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: ImageAsset | null
  images: ImageAsset[]
  author: Pick<User, "_id" | "name" | "avatar" | "bio">
  category: string
  tags: string[]
  status: PostStatus
  views: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CommentStatus = "pending" | "approved" | "spam"

export interface Comment {
  _id: string
  post: string
  author: Pick<User, "_id" | "name" | "avatar">
  content: string
  parentComment: string | null
  status: CommentStatus
  createdAt: string
  updatedAt: string
}

export interface Meta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: Meta
}

export interface ApiFailure {
  success: false
  message: string
  details?: unknown
}

export const PERMISSIONS = [
  "posts:create",
  "posts:edit:own",
  "posts:edit:any",
  "posts:delete:own",
  "posts:delete:any",
  "comments:create",
  "comments:moderate",
  "comments:delete:own",
  "comments:delete:any",
  "users:manage",
  "roles:manage",
  "images:upload",
  "images:delete:own",
  "images:delete:any",
] as const

export type Permission = (typeof PERMISSIONS)[number]
