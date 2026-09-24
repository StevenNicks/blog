import type { Fetcher } from "@/lib/api/client"
import type { Role } from "@/lib/types"

export function listRoles(fetcher: Fetcher) {
  return fetcher<Role[]>("/roles", { cache: "no-store" })
}

export function getRole(fetcher: Fetcher, id: string) {
  return fetcher<Role>(`/roles/${id}`, { cache: "no-store" })
}

export function createRole(fetcher: Fetcher, input: { name: string; description?: string; permissions: string[] }) {
  return fetcher<Role>("/roles", { method: "POST", body: input })
}

export function updateRole(
  fetcher: Fetcher,
  id: string,
  input: { name?: string; description?: string; permissions?: string[] }
) {
  return fetcher<Role>(`/roles/${id}`, { method: "PATCH", body: input })
}

export function deleteRole(fetcher: Fetcher, id: string) {
  return fetcher<null>(`/roles/${id}`, { method: "DELETE" })
}
