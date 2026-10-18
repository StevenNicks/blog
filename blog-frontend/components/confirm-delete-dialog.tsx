"use client"

import { useRef } from "react"
import type { ReactNode } from "react"
import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"

interface ConfirmDeleteDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Elemento que abre el diálogo (modo no controlado). */
  trigger?: ReactNode
  /** Nombre de lo que se va a eliminar; se muestra citado bajo la descripción. */
  itemName?: string
  /** Tipo de elemento en minúscula y singular: "post", "usuario", "imagen"… */
  itemType: string
  /** Qué se pierde y si se puede deshacer. */
  description: ReactNode
  /** Detalle extra bajo el nombre (miniatura, extracto, etc.). */
  children?: ReactNode
  /** Reemplaza el título por defecto "¿Eliminar {itemType}?". */
  title?: ReactNode
  /** Estado de la mutación (por ejemplo `mutation.isPending`). */
  isPending?: boolean
  onConfirm: () => void
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  trigger,
  itemName,
  itemType,
  description,
  children,
  title,
  isPending = false,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const hasDetail = !!itemName || !!children

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent
        // El foco inicial va en "Cancelar", nunca en la acción destructiva
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          cancelRef.current?.focus()
        }}
        // No se puede cerrar con Escape a mitad de la eliminación
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault()
        }}
      >
        <div className="flex items-start gap-3 py-1">
          <div
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.52_0.19_27)]/15 text-[oklch(0.7_0.17_27)] ring-1 ring-[oklch(0.52_0.19_27)]/30"
          >
            <Trash2Icon className="size-4" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <AlertDialogTitle className="text-base font-semibold">
              {title ?? `¿Eliminar ${itemType}?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-pretty text-muted-foreground">
              {description}
            </AlertDialogDescription>
            {hasDetail ? (
              <div className="mt-1 flex min-w-0 flex-col gap-2 rounded-md border-l-2 border-[oklch(0.52_0.19_27)] bg-muted/50 px-3 py-2">
                {itemName ? (
                  <p className="line-clamp-2 text-sm font-medium break-words text-foreground">{itemName}</p>
                ) : null}
                {children}
              </div>
            ) : null}
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef} disabled={isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              // Mantiene el diálogo abierto mientras se elimina
              e.preventDefault()
              onConfirm()
            }}
            disabled={isPending}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            <span aria-live="polite">{isPending ? "Eliminando…" : `Eliminar ${itemType}`}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
