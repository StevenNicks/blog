"use client"

import { createColumnHelper, type RowData } from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"

import { type DataTableFeatures } from "./data-table-features"

/** Columna de casillas para seleccionar filas (la de la cabecera selecciona toda la página). */
export function createSelectColumn<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>().display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todas las filas de la página"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { headerClassName: "w-10", cellClassName: "w-10" },
  })
}
