import { cn } from "cn"
import { FileTextIcon, ImageIcon, MessageSquareIcon, ShieldIcon } from "lucide-react"

import {
  LEVEL_LABEL,
  PERMISSION_AREAS,
  getRowLevel,
  type PermissionArea,
  type PermissionLevel,
} from "@/lib/permission-labels"

const AREA_ICON: Record<PermissionArea["icon"], React.ComponentType<{ className?: string }>> = {
  article: FileTextIcon,
  message: MessageSquareIcon,
  photo: ImageIcon,
  shield: ShieldIcon,
}

const LEVEL_STYLE: Record<PermissionLevel, string> = {
  yes: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  any: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  own: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  no: "bg-background text-muted-foreground",
  none: "bg-background text-muted-foreground",
}

export function RolePermissionSummary({ permissions }: { permissions: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      {PERMISSION_AREAS.map((area) => {
        const Icon = AREA_ICON[area.icon]
        return (
          <section key={area.id} className="rounded-lg bg-muted/50 px-3 py-2.5">
            <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <Icon className="size-4 text-muted-foreground" />
              {area.label}
            </h3>
            <dl className="flex flex-col">
              {area.rows.map((row) => {
                const level = getRowLevel(row, permissions)
                return (
                  <div key={row.label} className="flex items-center justify-between gap-2 py-0.5">
                    <dt className="text-xs text-muted-foreground">{row.label}</dt>
                    <dd className={cn("rounded-md px-2 py-px text-[11px] whitespace-nowrap", LEVEL_STYLE[level])}>
                      {LEVEL_LABEL[level]}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </section>
        )
      })}
    </div>
  )
}
