"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, MoreHorizontalIcon, PenLineIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { PostStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadError } from "@/components/loading/load-error"
import { LoadingGate } from "@/components/loading/loading-gate"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { EmptyPosts } from "@/components/empty/empty-posts"
import { EmptySearch } from "@/components/empty/empty-search"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDate } from "@/lib/format"
import { ApiError } from "@/lib/api/client"
import * as postsApi from "@/lib/api/posts"
import type { Post, PostStatus } from "@/lib/types"

const statusOptions: { value: PostStatus | "all"; label: string }[] = [
   { value: "all", label: "Todos los estados" },
   { value: "draft", label: "Borrador" },
   { value: "published", label: "Publicado" },
   { value: "archived", label: "Archivado" },
]

function PostsTable() {
   const { fetcherPaged, fetcher, hasPermission, user } = useAuth()
   const canSeeAll = hasPermission("posts:edit:any")

   const [posts, setPosts] = React.useState<Post[]>([])
   // loading: primera carga (skeleton). refreshing: recargas con datos ya visibles (spinner discreto)
   const [loading, setLoading] = React.useState(true)
   const [refreshing, setRefreshing] = React.useState(false)
   const [loadError, setLoadError] = React.useState(false)
   const [search, setSearch] = React.useState("")
   const [status, setStatus] = React.useState<PostStatus | "all">("all")
   const [page, setPage] = React.useState(1)
   const [pages, setPages] = React.useState(1)
   const [total, setTotal] = React.useState<number | null>(null)
   const [deleteTarget, setDeleteTarget] = React.useState<Post | null>(null)
   const [deleting, setDeleting] = React.useState(false)
   const loadedRef = React.useRef(false)
   const requestRef = React.useRef(0)

   const load = React.useCallback(async () => {
      const requestId = ++requestRef.current
      if (loadedRef.current) setRefreshing(true)
      else {
         setLoading(true)
         setLoadError(false)
      }
      try {
         const { data, meta } = await postsApi.listPosts(fetcherPaged, {
            page,
            limit: 10,
            search: search || undefined,
            status: status === "all" ? undefined : status,
            author: canSeeAll ? undefined : user?._id,
         })
         if (requestId !== requestRef.current) return
         setPosts(data)
         setPages(meta?.pages ?? 1)
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
   }, [fetcherPaged, page, search, status, canSeeAll, user?._id])

   React.useEffect(() => {
      load()
   }, [load])

   async function handleDelete() {
      if (!deleteTarget || deleting) return
      setDeleting(true)
      try {
         await postsApi.deletePost(fetcher, deleteTarget._id)
         toast.success("Post eliminado")
         setDeleteTarget(null)
         load()
      } catch (err) {
         toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar el post")
      } finally {
         setDeleting(false)
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
                     <span>{total} post{total === 1 ? "" : "s"} en total</span>
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

         <div className="flex flex-wrap items-center gap-3">
            <Input
               placeholder="Buscar por título o contenido…"
               value={search}
               onChange={(e) => {
                  setPage(1)
                  setSearch(e.target.value)
               }}
               className="max-w-xs"
            />
            <Select
               value={status}
               onValueChange={(v) => {
                  setPage(1)
                  setStatus(v as PostStatus | "all")
               }}
            >
               <SelectTrigger className="w-48">
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
         </div>

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
                     setPage(1)
                     setSearch("")
                     setStatus("all")
                  }}
               />
            ) : (
               <EmptyPosts />
            )
         ) : (
            <div className="overflow-hidden rounded-xl border border-border">
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Estado</TableHead>
                        {canSeeAll ? <TableHead>Autor</TableHead> : null}
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Vistas</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="w-10" />
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {posts.map((post) => (
                        <TableRow key={post._id}>
                           <TableCell className="max-w-xs">
                              <Link href={`/dashboard/posts/${post.slug}/edit`} className="line-clamp-1 font-medium hover:underline">
                                 {post.title}
                              </Link>
                           </TableCell>
                           <TableCell>
                              <PostStatusBadge status={post.status} />
                           </TableCell>
                           {canSeeAll ? <TableCell>{post.author?.name ?? "Usuario eliminado"}</TableCell> : null}
                           <TableCell className="text-muted-foreground">{post.category}</TableCell>
                           <TableCell className="text-right text-muted-foreground">{post.views}</TableCell>
                           <TableCell className="text-muted-foreground">{formatDate(post.createdAt)}</TableCell>
                           <TableCell>
                              <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon-sm">
                                       <MoreHorizontalIcon />
                                    </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
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
                                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(post)}>
                                       <Trash2Icon data-icon="inline-start" />
                                       Eliminar
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                              </DropdownMenu>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         )}
         </LoadingGate>

         {pages > 1 ? (
            <div className="flex items-center justify-between">
               <p className="text-sm text-muted-foreground">
                  Página {page} de {pages}
               </p>
               <div className="flex gap-2">
                  <Button
                     variant="outline"
                     size="sm"
                     disabled={page <= 1}
                     onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                     <ChevronLeftIcon data-icon="inline-start" />
                     Anterior
                  </Button>
                  <Button
                     variant="outline"
                     size="sm"
                     disabled={page >= pages}
                     onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  >
                     Siguiente
                     <ChevronRightIcon data-icon="inline-end" />
                  </Button>
               </div>
            </div>
         ) : null}

         <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar &quot;{deleteTarget?.title}&quot;?</AlertDialogTitle>
                  <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={(e) => {
                        // Mantiene el diálogo abierto mientras se elimina
                        e.preventDefault()
                        handleDelete()
                     }}
                     disabled={deleting}
                  >
                     {deleting ? <Spinner data-icon="inline-start" /> : null}
                     Eliminar
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
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
