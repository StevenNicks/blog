import {
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table"

/** Datos extra por columna que leen los componentes de la tabla. */
export interface DataTableColumnMeta {
  /** Nombre visible de la columna (menú "Columnas"). Si falta se usa el id. */
  label?: string
  /**
   * Columna secundaria: oculta por defecto por debajo de ese breakpoint (se puede mostrar desde
   * "Columnas"). "md" = solo en móvil (< 768px); "xl" = también en pantallas medianas (< 1280px),
   * donde el sidebar del dashboard le quita ancho a la tabla.
   */
  hideBelow?: "md" | "xl"
  headerClassName?: string
  cellClassName?: string
}

// TanStack Table v9: solo se registran las características que usan las tablas del dashboard.
// Paginación y orden son del servidor (manualPagination / manualSorting en useDataTable), así que
// no hace falta registrar row models paginados u ordenados, ni funciones de orden o filtro.
export const features = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  columnMeta: {} as DataTableColumnMeta,
})

// Primer genérico de ColumnDef, Column, Table y Row: indica qué APIs de características existen
export type DataTableFeatures = typeof features
