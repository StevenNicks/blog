import { apiFetch, type Fetcher, type FetcherPaged } from "@/lib/api/client"
import type { Comment, CommentStatus } from "@/lib/types"

export type CommentWithPost = Omit<Comment, "post"> & {
  // null si el post fue eliminado
  post: { _id: string; title: string; slug: string } | null
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

// Se emite en window cuando cambia el estado de un comentario o se elimina (p. ej. para refrescar
// el contador de pendientes del sidebar)
export const COMMENTS_CHANGED_EVENT = "comments:changed"

function notifyCommentsChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(COMMENTS_CHANGED_EVENT))
}

export async function deleteComment(fetcher: Fetcher, id: string) {
  const result = await fetcher<null>(`/comments/${id}`, { method: "DELETE" })
  notifyCommentsChanged()
  return result
}

export async function moderateComment(fetcher: Fetcher, id: string, status: CommentStatus) {
  const result = await fetcher<Comment>(`/comments/${id}/moderate`, { method: "PATCH", body: { status } })
  notifyCommentsChanged()
  return result
}
