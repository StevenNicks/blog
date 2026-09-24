import type { Fetcher, FetcherPaged } from "@/lib/api/client"
import type { ImageAsset } from "@/lib/types"

export function listImages(fetcherPaged: FetcherPaged, params: { page?: number; limit?: number } = {}) {
  return fetcherPaged<ImageAsset[]>("/images", { query: params, cache: "no-store" })
}

export function uploadImages(fetcher: Fetcher, files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append("images", file))
  return fetcher<ImageAsset[]>("/images", { method: "POST", body: formData, isFormData: true })
}

export function deleteImage(fetcher: Fetcher, id: string) {
  return fetcher<null>(`/images/${id}`, { method: "DELETE" })
}
