"use client"

import Link from "next/link"
import { ChevronRightIcon, type LucideIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export interface NavMainItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  /** Contador (p. ej. pendientes de moderar); no se muestra si es 0. */
  badge?: number
  /** Si tiene sub-elementos, el ítem se muestra como grupo desplegable. */
  items?: { title: string; url: string; isActive?: boolean }[]
}

// Barra de acento a la izquierda + icono en color primario para el ítem activo
// El botón se encoge a 200ms lineal (como el panel). La etiqueta se desvanece rápido (100ms) al contraer, antes de
// que el botón la recorte, y espera a que el botón crezca (delay 100ms) al expandir
const fold =
  "transition-opacity duration-100 ease-out delay-100 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:delay-0 motion-reduce:transition-none"

const activeStyles =
  "duration-200 ease-linear motion-reduce:transition-none relative data-active:before:absolute data-active:before:inset-y-1.5 data-active:before:left-0 data-active:before:w-0.5 data-active:before:rounded-full data-active:before:bg-sidebar-primary data-active:[&>svg]:text-sidebar-primary"

function ItemBadge({ count }: { count?: number }) {
  if (!count) return null
  return (
    <>
      <SidebarMenuBadge className="bg-primary text-primary-foreground! peer-hover/menu-button:text-primary-foreground! peer-data-active/menu-button:text-primary-foreground!">{count > 99 ? "99+" : count}</SidebarMenuBadge>
      {/* Con la barra contraída el contador se oculta: punto indicador */}
      <span className="pointer-events-none absolute top-1.5 right-1.5 hidden size-2 rounded-full bg-primary ring-2 ring-sidebar group-data-[collapsible=icon]:block" />
    </>
  )
}

export function NavMain({ label, items }: { label: string; items: NavMainItem[] }) {
  const { state, isMobile } = useSidebar()
  // Con la barra contraída los sub-ítems no caben en el sidebar: se abren en un menú flotante
  const iconMode = state === "collapsed" && !isMobile

  if (items.length === 0) return null

  return (
    <SidebarGroup>
      {/* Opacidad en 100ms (el margen sigue a 200ms con el panel): el texto desaparece antes de subir */}
      <SidebarGroupLabel className="whitespace-nowrap [transition-duration:200ms,100ms] ease-out">{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items?.length && iconMode ? (
            <SidebarMenuItem key={item.title}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton isActive={item.isActive} className={activeStyles}>
                    <item.icon />
                    <span className={fold}>{item.title}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" sideOffset={8} className="min-w-44">
                  <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {item.items.map((subItem) => (
                    <DropdownMenuItem key={subItem.url} asChild className={subItem.isActive ? "bg-accent" : undefined}>
                      <Link href={subItem.url}>{subItem.title}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ) : item.items?.length ? (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={item.isActive} className={activeStyles}>
                    <item.icon />
                    <span className={fold}>{item.title}</span>
                    <ChevronRightIcon className="ml-auto transition-[transform,opacity] duration-200 ease-linear group-data-[collapsible=icon]:opacity-0 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.url}>
                        <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive} className={activeStyles}>
                <Link href={item.url}>
                  <item.icon />
                  <span className={fold}>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              <ItemBadge count={item.badge} />
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
