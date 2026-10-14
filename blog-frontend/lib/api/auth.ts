import { apiFetch, type Fetcher } from "@/lib/api/client"
import type { User } from "@/lib/types"

export interface AuthPayload {
  user: User
  accessToken: string
}

export function registerRequest(input: { name: string; email: string; password: string }) {
  return apiFetch<AuthPayload>("/auth/register", { method: "POST", body: input })
}

export function loginRequest(input: { email: string; password: string }) {
  return apiFetch<AuthPayload>("/auth/login", { method: "POST", body: input })
}

export function refreshRequest() {
  return apiFetch<{ accessToken: string }>("/auth/refresh-token", { method: "POST" })
}

export function logoutRequest() {
  return apiFetch<null>("/auth/logout", { method: "POST" })
}

export function meRequest(token: string) {
  return apiFetch<User>("/auth/me", { token })
}

export function forgotPasswordRequest(input: { email: string }) {
  return apiFetch<{ message: string }>("/auth/forgot-password", { method: "POST", body: input })
}

export function resetPasswordRequest(input: { token: string; password: string }) {
  return apiFetch<{ message: string }>("/auth/reset-password", { method: "POST", body: input })
}

export function verifyEmailRequest(input: { token: string }) {
  return apiFetch<{ message: string }>("/auth/verify-email", { method: "POST", body: input })
}

export function sendVerificationRequest(fetcher: Fetcher) {
  return fetcher<{ message: string; delivered: boolean }>("/auth/send-verification", { method: "POST" })
}
