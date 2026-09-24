import type { Fetcher, FetcherPaged } from "@/lib/api/client"
import type { User } from "@/lib/types"

export interface ListUsersParams {
  page?: number
  limit?: number
  role?: string
  search?: string
  [key: string]: string | number | undefined
}

export function listUsers(fetcherPaged: FetcherPaged, params: ListUsersParams = {}) {
  return fetcherPaged<User[]>("/users", { query: params, cache: "no-store" })
}

export function getUser(fetcher: Fetcher, id: string) {
  return fetcher<User>(`/users/${id}`, { cache: "no-store" })
}

export function updateUser(fetcher: Fetcher, id: string, input: { name?: string; bio?: string; avatar?: string | null }) {
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
