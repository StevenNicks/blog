"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Etiqueta de cada segmento conocido; los que no estén aquí (p. ej. el slug de un post) se omiten
const LABELS: Record<string, string> = {
  posts: "Posts",
  new: "Nuevo post",
  edit: "Editar post",
  comments: "Comentarios",
  images: "Imágenes",
  users: "Usuarios",
  roles: "Roles",
  settings: "Ajustes",
  profile: "Mi perfil",
}

interface Crumb {
  label: string
  href: string
}

function buildCrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Panel", href: "/dashboard" }]
  const segments = pathname.split("/").filter(Boolean).slice(1) // quita "dashboard"
  let href = "/dashboard"
  for (const segment of segments) {
    href += `/${segment}`
    const label = LABELS[segment]
    if (label) crumbs.push({ label, href })
  }
  return crumbs
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)
  // En /dashboard solo hay un nivel: se muestra como página actual "Resumen"
  const items = crumbs.length === 1 ? [{ label: "Resumen", href: "/dashboard" }] : crumbs
  const last = items.length - 1

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className={i < last ? "hidden md:inline-flex" : undefined}>
              {i === last ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
