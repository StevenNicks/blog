"use client"

import Link from "next/link"
import { createColumnHelper } from "@tanstack/react-table"
import { ExternalLinkIcon, MoreHorizontalIcon, PenLineIcon, Trash2Icon } from "lucide-react"

import { PostStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { createSelectColumn } from "@/components/data-table/data-table-select-column"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import { formatDate } from "@/lib/format"
import type { Post } from "@/lib/types"

const columnHelper = createColumnHelper<DataTableFeatures, Post>()

interface PostColumnsOptions {
  /** Muestra la columna de autor (quien ve los posts de todos). */
  showAuthor: boolean
  /** Permite seleccionar filas para acciones en lote. */
  selectable: boolean
  onDelete: (post: Post) => void
}

// Los ids de las columnas ordenables coinciden con los campos que acepta ?sort= en la API
export function getPostColumns({ showAuthor, selectable, onDelete }: PostColumnsOptions) {
  return columnHelper.columns([
    ...(selectable ? [createSelectColumn<Post>()] : []),
    columnHelper.accessor("title", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Título" />,
      cell: ({ row }) => (
        <Link href={`/dashboard/posts/${row.original.slug}/edit`} className="line-clamp-2 font-medium hover:underline">
          {row.original.title}
        </Link>
      ),
      enableHiding: false,
      // whitespace-normal: TableCell no parte líneas por defecto; el título usa hasta 2
      meta: { label: "Título", cellClassName: "min-w-32 max-w-xs whitespace-normal sm:min-w-44" },
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => <PostStatusBadge status={row.original.status} />,
      meta: { label: "Estado" },
    }),
    ...(showAuthor
      ? [
          columnHelper.accessor((post) => post.author?.name ?? "Usuario eliminado", {
            id: "author",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Autor" />,
            // La API no ordena por autor: es una referencia a otra colección
            enableSorting: false,
            meta: { label: "Autor", hideBelow: "md" },
          }),
        ]
      : []),
    columnHelper.accessor("category", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Categoría" />,
      meta: { label: "Categoría", hideBelow: "xl", cellClassName: "text-muted-foreground" },
    }),
    columnHelper.accessor("views", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vistas" className="justify-end" />,
      cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
      sortDescFirst: true,
      meta: { label: "Vistas", hideBelow: "xl", headerClassName: "text-right", cellClassName: "text-right text-muted-foreground" },
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
      cell: ({ getValue }) => formatDate(getValue()),
      sortDescFirst: true,
      meta: { label: "Fecha", hideBelow: "md", cellClassName: "text-muted-foreground" },
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const post = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Acciones de ${post.title}`}>
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/posts/${post.slug}/edit`}>
                    <PenLineIcon data-icon="inline-start" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                {post.status === "published" ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/posts/${post.slug}`} target="_blank">
                      <ExternalLinkIcon data-icon="inline-start" />
                      Ver publicado
                    </Link>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(post)}>
                  <Trash2Icon data-icon="inline-start" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableHiding: false,
      meta: { headerClassName: "w-10" },
    }),
  ])
}
