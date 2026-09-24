"use client"

import * as React from "react"

import { ApiError, apiFetch, apiFetchPaged, type Fetcher, type FetcherPaged, type RequestOptions } from "@/lib/api/client"
import { loginRequest, logoutRequest, meRequest, refreshRequest, registerRequest } from "@/lib/api/auth"
import type { Permission, User } from "@/lib/types"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  accessToken: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  hasPermission: (permission: Permission | string) => boolean
  hasAnyPermission: (permissions: (Permission | string)[]) => boolean
  isAdmin: boolean
  fetcher: Fetcher
  fetcherPaged: FetcherPaged
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [accessToken, setAccessToken] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<AuthStatus>("loading")

  const tokenRef = React.useRef<string | null>(null)
  tokenRef.current = accessToken

  const applySession = React.useCallback((nextUser: User, nextToken: string) => {
    setUser(nextUser)
    setAccessToken(nextToken)
    setStatus("authenticated")
  }, [])

  const clearSession = React.useCallback(() => {
    setUser(null)
    setAccessToken(null)
    setStatus("unauthenticated")
  }, [])

  const silentRefresh = React.useCallback(async () => {
    try {
      const { accessToken: newToken } = await refreshRequest()
      const freshUser = await meRequest(newToken)
      applySession(freshUser, newToken)
      return newToken
    } catch {
      clearSession()
      return null
    }
  }, [applySession, clearSession])

  React.useEffect(() => {
    silentRefresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetcher = React.useCallback(
    async <T,>(path: string, options: RequestOptions = {}): Promise<T> => {
      try {
        return await apiFetch<T>(path, { ...options, token: tokenRef.current })
      } catch (err) {
        if (err instanceof ApiError && err.status === 401 && tokenRef.current) {
          const newToken = await silentRefresh()
          if (newToken) {
            return apiFetch<T>(path, { ...options, token: newToken })
          }
        }
        throw err
      }
    },
    [silentRefresh]
  )

  const fetcherPaged = React.useCallback(
    async <T,>(path: string, options: RequestOptions = {}) => {
      try {
        return await apiFetchPaged<T>(path, { ...options, token: tokenRef.current })
      } catch (err) {
        if (err instanceof ApiError && err.status === 401 && tokenRef.current) {
          const newToken = await silentRefresh()
          if (newToken) {
            return apiFetchPaged<T>(path, { ...options, token: newToken })
          }
        }
        throw err
      }
    },
    [silentRefresh]
  )

  const login = React.useCallback(
    async (email: string, password: string) => {
      const { user: loggedUser, accessToken: token } = await loginRequest({ email, password })
      applySession(loggedUser, token)
    },
    [applySession]
  )

  const register = React.useCallback(
    async (name: string, email: string, password: string) => {
      const { user: newUser, accessToken: token } = await registerRequest({ name, email, password })
      applySession(newUser, token)
    },
    [applySession]
  )

  const logout = React.useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const refreshUser = React.useCallback(async () => {
    if (!tokenRef.current) return
    const freshUser = await fetcher<User>("/auth/me")
    setUser(freshUser)
  }, [fetcher])

  const isAdmin = user?.role.name === "admin"

  const hasPermission = React.useCallback(
    (permission: Permission | string) => {
      if (!user) return false
      if (isAdmin) return true
      return user.role.permissions.includes(permission)
    },
    [user, isAdmin]
  )

  const hasAnyPermission = React.useCallback(
    (permissions: (Permission | string)[]) => permissions.some((p) => hasPermission(p)),
    [hasPermission]
  )

  const value: AuthContextValue = {
    user,
    status,
    accessToken,
    login,
    register,
    logout,
    refreshUser,
    hasPermission,
    hasAnyPermission,
    isAdmin,
    fetcher,
    fetcherPaged,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}
