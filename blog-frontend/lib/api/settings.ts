import { apiFetch, type Fetcher } from "@/lib/api/client"
import type { BackgroundPattern, SiteSettings } from "@/lib/types"

export function getSettingsPublic() {
  return apiFetch<SiteSettings>("/settings", { cache: "no-store" })
}

export function updateSettings(fetcher: Fetcher, input: { backgroundPattern?: BackgroundPattern }) {
  return fetcher<SiteSettings>("/settings", { method: "PATCH", body: input })
}

/** Patrón de fondo actual; si la API no responde se usa el predeterminado. */
export async function getBackgroundPattern(): Promise<BackgroundPattern> {
  try {
    return (await getSettingsPublic()).backgroundPattern
  } catch {
    return "dot-grid"
  }
}
