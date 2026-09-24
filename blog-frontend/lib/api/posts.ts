import { apiFetch, apiFetchPaged, type Fetcher, type FetcherPaged } from "@/lib/api/client"
import type { Post, PostStatus } from "@/lib/types"

export interface ListPostsParams {
  page?: number
  limit?: number
  status?: PostStatus
  author?: string
  category?: string
  tag?: string
  search?: string
  [key: string]: string | number | undefined
}

export interface PostInput {
  title: string
  content: string
  excerpt?: string
  category?: string
  tags?: string[]
  status?: PostStatus
  coverImage?: string | null
  images?: string[]
}

export function listPostsPublic(params: ListPostsParams = {}) {
  return apiFetchPaged<Post[]>("/posts", { query: params, cache: "no-store" })
}

export function getPostPublic(slug: string) {
  return apiFetch<Post>(`/posts/${slug}`, { cache: "no-store" })
}

export function listPosts(fetcherPaged: FetcherPaged, params: ListPostsParams = {}) {
  return fetcherPaged<Post[]>("/posts", { query: params, cache: "no-store" })
}

export function getPost(fetcher: Fetcher, slug: string) {
  return fetcher<Post>(`/posts/${slug}`, { cache: "no-store" })
}

export function createPost(fetcher: Fetcher, input: PostInput) {
  return fetcher<Post>("/posts", { method: "POST", body: input })
}

export function updatePost(fetcher: Fetcher, id: string, input: Partial<PostInput>) {
  return fetcher<Post>(`/posts/${id}`, { method: "PATCH", body: input })
}

export function deletePost(fetcher: Fetcher, id: string) {
  return fetcher<null>(`/posts/${id}`, { method: "DELETE" })
}
