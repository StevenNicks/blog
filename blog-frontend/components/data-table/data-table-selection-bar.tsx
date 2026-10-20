"use client"

import type * as React from "react"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface DataTableSelectionBarProps {
  count: number
  onClear: () => void
  /** Acciones en lote (botones o menús). */
  children: React.ReactNode
}

/**
 * Barra de acciones en lote: solo aparece con filas seleccionadas.
 *
 * Queda fija bajo el header del dashboard (h-14) para que las acciones sigan a mano al bajar por
 * la tabla. En móvil: contador y botón de limpiar arriba, acciones a todo el ancho debajo.
 * Desde sm: todo en una fila (contador · acciones · limpiar).
 */
export function DataTableSelectionBar({ count, onClear, children }: DataTableSelectionBarProps) {
  if (count === 0) return null

  return (
    <div
      role="region"
      aria-label="Acciones para los elementos seleccionados"
      className="sticky top-16 z-20 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 shadow-sm"
    >
      <p className="mr-auto text-sm font-medium" aria-live="polite">
        {count} seleccionado{count === 1 ? "" : "s"}
      </p>
      <div className="order-last flex w-full gap-2 *:flex-1 sm:order-none sm:w-auto sm:*:flex-none">{children}</div>
      <Button variant="ghost" size="sm" onClick={onClear} className="max-sm:size-8 max-sm:p-0!" aria-label="Limpiar selección">
        <XIcon data-icon="inline-start" />
        <span className="max-sm:sr-only">Limpiar selección</span>
      </Button>
    </div>
  )
}
