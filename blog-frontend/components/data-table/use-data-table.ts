"use client"

import * as React from "react"
import {
  useTable,
  type ColumnDef,
  type ColumnVisibilityState,
  type PaginationState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from "@tanstack/react-table"

import { features, type DataTableFeatures } from "./data-table-features"

type ScreenSize = "mobile" | "medium" | "wide"

// Mismos cortes que meta.hideBelow: md (768px) y xl (1280px). undefined hasta montar.
function useScreenSize(): ScreenSize | undefined {
  const [size, setSize] = React.useState<ScreenSize>()

  React.useEffect(() => {
    const md = window.matchMedia("(min-width: 768px)")
    const xl = window.matchMedia("(min-width: 1280px)")
    const update = () => setSize(xl.matches ? "wide" : md.matches ? "medium" : "mobile")
    update()
    md.addEventListener("change", update)
    xl.addEventListener("change", update)
    // Algunos entornos (emulación de viewport) no emiten "change": resize lo cubre; si el nivel
    // no cambia, setSize recibe el mismo valor y no hay render extra
    window.addEventListener("resize", update)
    return () => {
      md.removeEventListener("change", update)
      xl.removeEventListener("change", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return size
}

export const DEFAULT_PAGE_SIZE = 10

interface UseDataTableOptions<TData extends RowData> {
  data: TData[]
  columns: ColumnDef<DataTableFeatures, TData>[]
  /** Total de filas en el servidor (meta.total); con él se calcula el número de páginas. */
  rowCount: number
  getRowId: (row: TData) => string
  /** Qué filas se pueden seleccionar (por defecto, todas). */
  enableRowSelection?: boolean | ((row: Row<DataTableFeatures, TData>) => boolean)
  /** Clave para recordar en este navegador qué columnas se ocultaron (por separado en cada tamaño de pantalla). */
  storageKey?: string
  initialPageSize?: number
}

function resolve<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function" ? (updater as (old: T) => T)(previous) : updater
}

function readVisibility(storageKey?: string): ColumnVisibilityState | null {
  if (!storageKey) return null
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as ColumnVisibilityState) : null
  } catch {
    return null
  }
}

/** Convierte el estado de orden de la tabla al parámetro `sort` de la API ("campo" o "-campo"). */
export function toSortParam(sorting: SortingState): string | undefined {
  const first = sorting[0]
  if (!first) return undefined
  return first.desc ? `-${first.id}` : first.id
}

/**
 * Tabla de TanStack v9 conectada a una API paginada en el servidor.
 *
 * La tabla no pagina ni ordena filas: solo guarda el estado (página, tamaño, orden, selección,
 * columnas visibles) y la página lo usa para pedir los datos. Cambiar de página u orden limpia la
 * selección, porque las filas seleccionadas dejarían de estar a la vista.
 */
export function useDataTable<TData extends RowData>({
  data,
  columns,
  rowCount,
  getRowId,
  enableRowSelection = true,
  storageKey,
  initialPageSize = DEFAULT_PAGE_SIZE,
}: UseDataTableOptions<TData>) {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: initialPageSize })
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})

  // Cada tamaño de pantalla guarda su propia configuración de columnas: lo que se oculta en el
  // teléfono para que la tabla quepa no debe desaparecer en la pantalla grande, ni al revés
  const screen = useScreenSize()
  const visibilityKey = storageKey && screen ? `${storageKey}:${screen}` : undefined

  // Columnas ocultas por defecto en este tamaño (meta.hideBelow)
  const defaultHiddenIds = screen
    ? columns
        .filter((column) => {
          const below = column.meta?.hideBelow
          return below === "xl" ? screen !== "wide" : below === "md" ? screen === "mobile" : false
        })
        .map((column) => column.id ?? ("accessorKey" in column ? String(column.accessorKey) : ""))
        .filter(Boolean)
        .join(",")
    : ""

  // Se lee después de montar (en el servidor no existe localStorage ni matchMedia) y al cruzar un breakpoint
  React.useEffect(() => {
    if (!screen) return
    const stored = readVisibility(visibilityKey)
    if (stored) setColumnVisibility(stored)
    else setColumnVisibility(Object.fromEntries(defaultHiddenIds.split(",").filter(Boolean).map((id) => [id, false])))
  }, [screen, visibilityKey, defaultHiddenIds])

  const handlePaginationChange = React.useCallback((updater: Updater<PaginationState>) => {
    setPagination((prev) => {
      const next = resolve(updater, prev)
      // Al cambiar el tamaño de página se vuelve a la primera
      return next.pageSize !== prev.pageSize ? { ...next, pageIndex: 0 } : next
    })
    setRowSelection({})
  }, [])

  const handleSortingChange = React.useCallback((updater: Updater<SortingState>) => {
    setSorting((prev) => resolve(updater, prev))
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setRowSelection({})
  }, [])

  const handleVisibilityChange = React.useCallback(
    (updater: Updater<ColumnVisibilityState>) => {
      setColumnVisibility((prev) => {
        const next = resolve(updater, prev)
        if (visibilityKey) {
          try {
            window.localStorage.setItem(visibilityKey, JSON.stringify(next))
          } catch {
            // Sin almacenamiento (modo privado, bloqueado): la preferencia dura solo esta visita
          }
        }
        return next
      })
    },
    [visibilityKey]
  )

  const table = useTable({
    features,
    data,
    columns,
    state: { pagination, sorting, rowSelection, columnVisibility },
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: handleVisibilityChange,
    manualPagination: true,
    manualSorting: true,
    rowCount,
    getRowId,
    enableRowSelection,
    enableMultiSort: false,
  })

  /** Vuelve a la primera página y limpia la selección (p. ej. al cambiar un filtro). */
  const resetPage = React.useCallback(() => {
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }))
    setRowSelection({})
  }, [])

  const clearSelection = React.useCallback(() => setRowSelection({}), [])

  const selectedIds = React.useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection]
  )

  return { table, pagination, sorting, sortParam: toSortParam(sorting), selectedIds, resetPage, clearSelection }
}
