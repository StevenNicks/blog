"use client"

import { type ReactTable, type RowData } from "@tanstack/react-table"
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { type DataTableFeatures } from "./data-table-features"

const PAGE_SIZE_OPTIONS = [10, 20, 50]

/**
 * Filas por página y navegación. El total ya lo muestra la cabecera de cada módulo y la
 * selección, DataTableSelectionBar. Cabe en una fila desde 320px: en móvil la etiqueta se
 * acorta a "Filas" y los saltos a la primera/última página se ocultan.
 */
export function DataTablePagination<TData extends RowData>({ table }: { table: ReactTable<DataTableFeatures, TData> }) {
  const { pageIndex, pageSize } = table.state.pagination
  const pageCount = Math.max(table.getPageCount(), 1)

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <p aria-hidden className="text-sm font-medium whitespace-nowrap">
          Filas<span className="max-sm:hidden"> por página</span>
        </p>
        <Select value={`${pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
          <SelectTrigger size="sm" className="w-18" aria-label="Filas por página">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectGroup>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <p className="text-sm font-medium whitespace-nowrap tabular-nums">
          Página {pageIndex + 1} de {pageCount}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            className="max-lg:hidden"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Primera página"
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Página siguiente"
          >
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="max-lg:hidden"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Última página"
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
