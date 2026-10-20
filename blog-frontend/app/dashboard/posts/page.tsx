"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ChevronDownIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoadError } from "@/components/loading/load-error"
import { LoadingGate } from "@/components/loading/loading-gate"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { EmptyPosts } from "@/components/empty/empty-posts"
import { EmptySearch } from "@/components/empty/empty-search"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { DataTable } from "@/components/data-table/data-table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableSelectionBar } from "@/components/data-table/data-table-selection-bar"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { toastBulkResult } from "@/components/data-table/bulk-toast"
import { useDataTable } from "@/components/data-table/use-data-table"
import { ApiError } from "@/lib/api/client"
import * as postsApi from "@/lib/api/posts"
import type { Post, PostStatus } from "@/lib/types"

import { getPostColumns } from "./columns"

const statusOptions: { value: PostStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos los estados" },
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Archivado" },
]

// done(n) arma el toast; el plural va en el participio ("publicados", "pasados a borrador")
const bulkStatusOptions: { value: PostStatus; label: string; done: (n: number) => string }[] = [
  { value: "published", label: "Publicar", done: (n) => (n === 1 ? "1 post publicado" : `${n} posts publicados`) },
  {
    value: "draft",
    label: "Pasar a borrador",
    done: (n) => (n === 1 ? "1 post pasado a borrador" : `${n} posts pasados a borrador`),
  },
  { value: "archived", label: "Archivar", done: (n) => (n === 1 ? "1 post archivado" : `${n} posts archivados`) },
]

type DeleteTarget = { kind: "single"; post: Post } | { kind: "bulk"; ids: string[] }

function PostsTable() {
  const { fetcherPaged, fetcher, hasPermission, hasAnyPermission, user } = useAuth()
  const canSeeAll = hasPermission("posts:edit:any")
  // Las acciones en lote cambian estado o eliminan: con cualquiera de los dos permisos tiene sentido seleccionar
  const canBulk = hasAnyPermission(["posts:edit:own", "posts:edit:any", "posts:delete:own", "posts:delete:any"])

  const [posts, setPosts] = React.useState<Post[]>([])
  // loading: primera carga (skeleton). refreshing: recargas con datos ya visibles (spinner discreto)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [loadError, setLoadError] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<PostStatus | "all">("all")
  const [total, setTotal] = React.useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [bulkUpdating, setBulkUpdating] = React.useState(false)
  const loadedRef = React.useRef(false)
  const requestRef = React.useRef(0)

  const columns = React.useMemo(
    () =>
      getPostColumns({
        showAuthor: canSeeAll,
        selectable: canBulk,
        onDelete: (post) => setDeleteTarget({ kind: "single", post }),
      }),
    [canSeeAll, canBulk]
  )

  const { table, pagination, sortParam, selectedIds, resetPage, clearSelection } = useDataTable({
    data: posts,
    columns,
    rowCount: total ?? 0,
    getRowId: (post) => post._id,
    storageKey: "dashboard:posts:columns",
  })

  const load = React.useCallback(async () => {
    const requestId = ++requestRef.current
    if (loadedRef.current) setRefreshing(true)
    else {
      setLoading(true)
      setLoadError(false)
    }
    try {
      const { data, meta } = await postsApi.listPosts(fetcherPaged, {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sort: sortParam,
        search: search || undefined,
        status: status === "all" ? undefined : status,
        author: canSeeAll ? undefined : user?._id,
      })
      if (requestId !== requestRef.current) return
      // Si se borró la última fila de la última página, se retrocede a la que ahora es la última
      if (meta && meta.pages > 0 && pagination.pageIndex + 1 > meta.pages) {
        table.setPageIndex(meta.pages - 1)
        return
      }
      setPosts(data)
      setTotal(meta?.total ?? data.length)
      loadedRef.current = true
    } catch (err) {
      if (requestId !== requestRef.current) return
      toast.error(err instanceof ApiError ? err.message : "No se pudieron cargar los posts")
      if (!loadedRef.current) setLoadError(true)
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
    // table es estable entre renders; no se incluye para no recrear load en cada render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcherPaged, pagination.pageIndex, pagination.pageSize, sortParam, search, status, canSeeAll, user?._id])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      if (deleteTarget.kind === "single") {
        await postsApi.deletePost(fetcher, deleteTarget.post._id)
        toast.success("Post eliminado")
      } else {
        const result = await postsApi.bulkDeletePosts(fetcher, deleteTarget.ids)
        toastBulkResult(result, (n) => `${n} post${n === 1 ? "" : "s"} eliminado${n === 1 ? "" : "s"}`)
      }
      setDeleteTarget(null)
      clearSelection()
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar")
    } finally {
      setDeleting(false)
    }
  }

  async function handleBulkStatus(option: (typeof bulkStatusOptions)[number]) {
    if (bulkUpdating) return
    setBulkUpdating(true)
    try {
      const result = await postsApi.bulkUpdatePostStatus(fetcher, selectedIds, option.value)
      toastBulkResult(result, option.done)
      clearSelection()
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo cambiar el estado")
    } finally {
      setBulkUpdating(false)
    }
  }

  // Sin posts ni filtros, la acción vive en el vacío (EmptyPosts); el botón del módulo solo aparece cuando no se ve.
  // Con filtros activos el vacío es EmptySearch, que no crea nada: el botón del módulo se mantiene.
  // Mientras carga se reserva su espacio con un skeleton: aún no se sabe si habrá vacío y así no parpadea
  const hasFilters = search !== "" || status !== "all"
  const showEmpty = !loading && !loadError && posts.length === 0 && !hasFilters

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            {total === null ? (
              <span aria-hidden className="inline-block h-5 w-32" />
            ) : (
              <span>
                {total} post{total === 1 ? "" : "s"} en total
              </span>
            )}
            {/* Ancho reservado para que el texto no salte al aparecer el spinner */}
            <span className="flex size-4 items-center justify-center">{refreshing ? <Spinner /> : null}</span>
          </p>
        </div>
        {loading ? (
          <Skeleton aria-hidden className="h-8 w-28 rounded-lg" />
        ) : showEmpty ? null : (
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <PlusIcon data-icon="inline-start" />
              Nuevo post
            </Link>
          </Button>
        )}
      </div>

      {/* Móvil: buscador a todo el ancho; debajo, estado (estirado) y el ícono de columnas */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por título o contenido…"
          aria-label="Buscar posts"
          value={search}
          onChange={(e) => {
            resetPage()
            setSearch(e.target.value)
          }}
          className="w-full sm:max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(v) => {
            resetPage()
            setStatus(v as PostStatus | "all")
          }}
        >
          <SelectTrigger className="flex-1 sm:w-48 sm:flex-none" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="sm:ml-auto">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <DataTableSelectionBar count={selectedIds.length} onClear={clearSelection}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={bulkUpdating}>
              {bulkUpdating ? <Spinner data-icon="inline-start" /> : null}
              Cambiar estado
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {bulkStatusOptions.map((opt) => (
                <DropdownMenuItem key={opt.value} onClick={() => handleBulkStatus(opt)}>
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="destructive"
          size="sm"
          disabled={bulkUpdating}
          onClick={() => setDeleteTarget({ kind: "bulk", ids: selectedIds })}
        >
          <Trash2Icon data-icon="inline-start" />
          Eliminar
        </Button>
      </DataTableSelectionBar>

      <LoadingGate
        loading={loading}
        onRetry={load}
        skeleton={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        }
      >
        {loadError ? (
          <LoadError title="No se pudieron cargar los posts" onRetry={load} />
        ) : posts.length === 0 ? (
          hasFilters ? (
            <EmptySearch
              entity="posts"
              query={search}
              clearLabel="Limpiar filtros"
              onClear={() => {
                resetPage()
                setSearch("")
                setStatus("all")
              }}
            />
          ) : (
            <EmptyPosts />
          )
        ) : (
          <div className="flex flex-col gap-4">
            <DataTable table={table} />
            <DataTablePagination table={table} />
          </div>
        )}
      </LoadingGate>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        itemType="post"
        title={
          deleteTarget?.kind === "bulk"
            ? `¿Eliminar ${deleteTarget.ids.length} post${deleteTarget.ids.length === 1 ? "" : "s"}?`
            : undefined
        }
        itemName={deleteTarget?.kind === "single" ? deleteTarget.post.title : undefined}
        description={
          deleteTarget?.kind === "bulk"
            ? "Se perderán el contenido, la portada y los comentarios de los posts seleccionados. No se puede deshacer."
            : "Se perderán el contenido, la portada y los comentarios de este post. No se puede deshacer."
        }
        isPending={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default function DashboardPostsPage() {
  return (
    <RequireAuth anyPermission={["posts:create", "posts:edit:own", "posts:edit:any"]}>
      <PostsTable />
    </RequireAuth>
  )
}
