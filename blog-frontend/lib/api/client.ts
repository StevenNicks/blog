import type { ApiFailure, ApiSuccess, Meta } from "@/lib/types"

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  token?: string | null
  body?: unknown
  isFormData?: boolean
  query?: Record<string, string | number | boolean | undefined | null>
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path.startsWith("http") ? path : `${API_URL}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

async function rawFetch(path: string, options: RequestOptions) {
  const { token, body, isFormData, query, headers, ...rest } = options

  const finalHeaders = new Headers(headers)
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`)
  if (body !== undefined && !isFormData) finalHeaders.set("Content-Type", "application/json")

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  })

  const text = await res.text()
  const json = text ? (JSON.parse(text) as ApiSuccess<unknown> | ApiFailure) : null

  if (!res.ok || !json || json.success === false) {
    const message = json && "message" in json && json.message ? json.message : `Error ${res.status}`
    throw new ApiError(res.status, message, json && "details" in json ? json.details : undefined)
  }

  return json as ApiSuccess<unknown>
}

/** Llama a la API y devuelve solo el payload `data`. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const json = await rawFetch(path, options)
  return json.data as T
}

/** Llama a la API y devuelve `data` + `meta` (para endpoints paginados). */
export async function apiFetchPaged<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; meta?: Meta }> {
  const json = await rawFetch(path, options)
  return { data: json.data as T, meta: json.meta }
}

/** Firma que consumen los módulos de `lib/api/*`: ya trae el token inyectado. */
export type Fetcher = <T>(path: string, options?: RequestOptions) => Promise<T>
export type FetcherPaged = <T>(
  path: string,
  options?: RequestOptions
) => Promise<{ data: T; meta?: Meta }>
