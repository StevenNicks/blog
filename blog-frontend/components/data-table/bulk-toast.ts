import { toast } from "sonner"

import type { BulkResult } from "@/lib/types"

/**
 * Resume el resultado de una acción en lote en un solo toast.
 * `describe(n)` arma la frase de éxito, p. ej. (n) => `${n} posts eliminados`.
 */
export function toastBulkResult({ succeeded, failed }: BulkResult, describe: (count: number) => string) {
  if (failed.length === 0) {
    toast.success(describe(succeeded.length))
    return
  }
  // Se muestra el primer motivo: suele repetirse (p. ej. el mismo permiso) en todos los fallos
  const reason = failed[0].message
  if (succeeded.length === 0) {
    toast.error(`No se pudo aplicar a ninguno. ${reason}`)
    return
  }
  toast.warning(`${describe(succeeded.length)}. ${failed.length} no se ${failed.length === 1 ? "pudo" : "pudieron"} procesar: ${reason}`)
}
