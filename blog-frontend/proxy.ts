import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Comprobación optimista en el servidor, antes de renderizar (sin parpadeos ni saltos):
// - Panel: sin la cookie de sesión de la API (`refreshToken`, httpOnly) redirige a /login.
// - Pantallas de acceso: con la cookie redirige fuera, a `next` o a "/".
// No valida el token ni los permisos: eso lo hacen RequireAuth en el cliente y la API.
// Una cookie caducada o revocada la borra la propia API al fallar el refresco.
// reset-password y verify-email quedan fuera: se abren desde un enlace de correo.
// Requiere que la API y la web compartan host (las cookies no distinguen puertos),
// como en desarrollo con localhost o la IP de la red local.
const SESSION_COOKIE = "refreshToken"

export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE)

  if (pathname.startsWith("/dashboard")) {
    if (hasSession) return NextResponse.next()
    const login = new URL("/login", request.url)
    login.searchParams.set("next", pathname + search)
    return NextResponse.redirect(login)
  }

  if (hasSession) {
    const next = searchParams.get("next")
    const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/"
    return NextResponse.redirect(new URL(target, request.url))
  }
  return NextResponse.next()
}

export const config = {
  // Debe ser estático (Next lo analiza al compilar): aquí van las pantallas de acceso: login, register y forgot-password.
  matcher: ["/dashboard/:path*", "/login", "/register", "/forgot-password"],
}
