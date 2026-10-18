"use client"

import type { ReactNode } from "react"
import { CircleAlertIcon } from "lucide-react"

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
  title: ReactNode
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  deleting?: boolean
  onConfirm: () => void
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  deleting = false,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent>
        <div className="flex items-start gap-3 py-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <CircleAlertIcon className="size-5 text-destructive" />
          </div>
          <div className="flex min-w-0 flex-col justify-center gap-1">
            <AlertDialogTitle className="text-sm font-semibold">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {description}
            </AlertDialogDescription>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              // Mantiene el diálogo abierto mientras se elimina
              e.preventDefault()
              onConfirm()
            }}
            disabled={deleting}
          >
            {deleting ? <Spinner data-icon="inline-start" /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
