"use client"

import { type ReactTable, type RowData } from "@tanstack/react-table"
import { Settings2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { type DataTableFeatures } from "./data-table-features"

/** Menú para mostrar u ocultar columnas. Usa `meta.label` como nombre visible. */
export function DataTableViewOptions<TData extends RowData>({ table }: { table: ReactTable<DataTableFeatures, TData> }) {
  const columns = table.getAllLeafColumns().filter((column) => column.getCanHide())
  if (columns.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* En móvil queda solo el ícono para dejar el ancho a los filtros */}
        <Button variant="outline" size="sm" className="max-sm:size-8 max-sm:p-0!" aria-label="Columnas">
          <Settings2Icon data-icon="inline-start" />
          <span className="max-sm:sr-only">Columnas</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
              // Mantiene el menú abierto para ocultar varias columnas seguidas
              onSelect={(e) => e.preventDefault()}
            >
              {column.columnDef.meta?.label ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
