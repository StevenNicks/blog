"use client"

import { type Column, type RowData } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, EyeOffIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { type DataTableFeatures } from "./data-table-features"

interface DataTableColumnHeaderProps<TData extends RowData, TValue> {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
  className?: string
}

/** Encabezado con menú para ordenar (asc/desc) y ocultar la columna. */
export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={className}>{title}</div>
  }

  const sorted = column.getIsSorted()

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="-ml-2.5">
            {title}
            {sorted === "desc" ? (
              <ArrowDownIcon data-icon="inline-end" />
            ) : sorted === "asc" ? (
              <ArrowUpIcon data-icon="inline-end" />
            ) : column.getCanSort() ? (
              <ChevronsUpDownIcon data-icon="inline-end" className="text-muted-foreground" />
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {column.getCanSort() ? (
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <ArrowUpIcon data-icon="inline-start" />
                Ascendente
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <ArrowDownIcon data-icon="inline-start" />
                Descendente
              </DropdownMenuItem>
              {sorted ? (
                <DropdownMenuItem onClick={() => column.clearSorting()}>
                  <XIcon data-icon="inline-start" />
                  Quitar orden
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
          ) : null}
          {column.getCanSort() && column.getCanHide() ? <DropdownMenuSeparator /> : null}
          {column.getCanHide() ? (
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOffIcon data-icon="inline-start" />
                Ocultar columna
              </DropdownMenuItem>
            </DropdownMenuGroup>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
