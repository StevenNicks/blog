import type { Fetcher, FetcherPaged } from "@/lib/api/client"
import type { BulkResult, User } from "@/lib/types"

export interface ListUsersParams {
  page?: number
  limit?: number
  role?: string
  search?: string
  /** Campo de orden; con "-" delante es descendente (p. ej. "-createdAt"). */
  sort?: string
  [key: string]: string | number | undefined
}

export function listUsers(fetcherPaged: FetcherPaged, params: ListUsersParams = {}) {
  return fetcherPaged<User[]>("/users", { query: params, cache: "no-store" })
}

export function getUser(fetcher: Fetcher, id: string) {
  return fetcher<User>(`/users/${id}`, { cache: "no-store" })
}

export function updateUser(fetcher: Fetcher, id: string, input: { name?: string; bio?: string; avatar?: string | null; coverImage?: string | null }) {
  return fetcher<User>(`/users/${id}`, { method: "PATCH", body: input })
}

export function setUserActive(fetcher: Fetcher, id: string, isActive: boolean) {
  return fetcher<User>(`/users/${id}/active`, { method: "PATCH", body: { isActive } })
}

export function assignRole(fetcher: Fetcher, id: string, role: string) {
  return fetcher<User>(`/users/${id}/role`, { method: "PATCH", body: { role } })
}

export function deleteUser(fetcher: Fetcher, id: string) {
  return fetcher<null>(`/users/${id}`, { method: "DELETE" })
}

export function bulkDeleteUsers(fetcher: Fetcher, ids: string[]) {
  return fetcher<BulkResult>("/users/bulk/delete", { method: "POST", body: { ids } })
}

export function bulkSetUsersActive(fetcher: Fetcher, ids: string[], isActive: boolean) {
  return fetcher<BulkResult>("/users/bulk/active", { method: "PATCH", body: { ids, isActive } })
}
