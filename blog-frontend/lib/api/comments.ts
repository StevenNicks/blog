import { apiFetch, type Fetcher, type FetcherPaged } from "@/lib/api/client"
import type { Comment, CommentStatus } from "@/lib/types"

export type CommentWithPost = Omit<Comment, "post"> & {
  post: { _id: string; title: string; slug: string }
}

export function listCommentsPublic(postId: string) {
  return apiFetch<Comment[]>(`/posts/${postId}/comments`, { cache: "no-store" })
}

export function listComments(fetcher: Fetcher, postId: string) {
  return fetcher<Comment[]>(`/posts/${postId}/comments`, { cache: "no-store" })
}

export function listAllComments(
  fetcherPaged: FetcherPaged,
  params: { page?: number; limit?: number; status?: CommentStatus } = {}
) {
  return fetcherPaged<CommentWithPost[]>("/comments", { query: params, cache: "no-store" })
}

export function createComment(
  fetcher: Fetcher,
  postId: string,
  input: { content: string; parentComment?: string | null }
) {
  return fetcher<Comment>(`/posts/${postId}/comments`, { method: "POST", body: input })
}

export function updateComment(fetcher: Fetcher, id: string, content: string) {
  return fetcher<Comment>(`/comments/${id}`, { method: "PATCH", body: { content } })
}

export function deleteComment(fetcher: Fetcher, id: string) {
  return fetcher<null>(`/comments/${id}`, { method: "DELETE" })
}

export function moderateComment(fetcher: Fetcher, id: string, status: CommentStatus) {
  return fetcher<Comment>(`/comments/${id}/moderate`, { method: "PATCH", body: { status } })
}
