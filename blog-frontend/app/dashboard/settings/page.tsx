"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckIcon } from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { notifyBackgroundChanged } from "@/components/layout/background-sync"
import { BackgroundPatternView } from "@/components/layout/site-background"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api/client"
import * as settingsApi from "@/lib/api/settings"
import { cn } from "@/lib/utils"
import type { BackgroundPattern } from "@/lib/types"

const PATTERN_OPTIONS: { value: BackgroundPattern; title: string; description: string }[] = [
  {
    value: "dot-grid",
    title: "Cuadrícula con puntos",
    description: "Líneas finas con un punto en cada intersección, en toda la pantalla.",
  },
  {
    value: "grid",
    title: "Cuadrícula suave",
    description: "Cuadrícula fina que se desvanece hacia el centro de la pantalla.",
  },
  {
    value: "dots",
    title: "Puntos",
    description: "Trama de puntos discretos que se desvanece hacia el centro.",
  },
  {
    value: "spotlight",
    title: "Foco de luz",
    description: "Un haz de luz animado sobre una cuadrícula tenue.",
  },
  { value: "none", title: "Sin patrón", description: "Fondo liso." },
]

function AppearanceSettings() {
  const { fetcher } = useAuth()
  const router = useRouter()
  const [pattern, setPattern] = React.useState<BackgroundPattern | null>(null)
  const [saving, setSaving] = React.useState<BackgroundPattern | null>(null)

  React.useEffect(() => {
    settingsApi
      .getSettingsPublic()
      .then((s) => setPattern(s.backgroundPattern))
      .catch(() => toast.error("No se pudieron cargar los ajustes"))
  }, [])

  async function handleSelect(value: BackgroundPattern) {
    if (value === pattern || saving) return
    setSaving(value)
    try {
      const updated = await settingsApi.updateSettings(fetcher, { backgroundPattern: value })
      setPattern(updated.backgroundPattern)
      router.refresh()
      notifyBackgroundChanged()
      toast.success("Patrón de fondo actualizado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el ajuste")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Ajustes</h1>
        <p className="text-sm text-muted-foreground">Apariencia del sitio público.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patrón de fondo</CardTitle>
          <CardDescription>
            Se muestra en las páginas de acceso (iniciar sesión, registro y recuperación de contraseña), en Mi perfil y en estos ajustes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pattern === null ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {PATTERN_OPTIONS.map((o) => (
                <Skeleton key={o.value} className="h-52 w-full" />
              ))}
            </div>
          ) : (
            <div role="radiogroup" aria-label="Patrón de fondo" className="grid gap-4 sm:grid-cols-3">
              {PATTERN_OPTIONS.map((option) => {
                const selected = option.value === pattern
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={saving !== null}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "overflow-hidden rounded-xl border text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70",
                      selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/30"
                    )}
                  >
                    <div className="relative isolate h-32 overflow-hidden border-b border-border bg-background">
                      <BackgroundPatternView pattern={option.value} contained />
                    </div>
                    <div className="flex items-start justify-between gap-2 p-3">
                      <div>
                        <p className="text-sm font-medium">{option.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
                      </div>
                      {selected ? <CheckIcon className="size-4 shrink-0 text-primary" /> : null}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardSettingsPage() {
  // "settings:manage" no se asigna a ningún rol: solo el admin pasa este chequeo
  return (
    <RequireAuth anyPermission={["settings:manage"]}>
      <AppearanceSettings />
    </RequireAuth>
  )
}
