"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, MessageSquareIcon, MoreHorizontalIcon, ShieldIcon, Trash2Icon } from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { UserAvatar } from "@/components/user-avatar"
import { CommentStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
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
import { formatRelativeDate } from "@/lib/format"
import { ApiError } from "@/lib/api/client"
import * as commentsApi from "@/lib/api/comments"
import type { CommentStatus } from "@/lib/types"

const statusOptions: { value: CommentStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobados" },
  { value: "spam", label: "Spam" },
]

function CommentsModerationTable() {
  const { fetcherPaged, fetcher } = useAuth()
  const [comments, setComments] = React.useState<commentsApi.CommentWithPost[]>([])
  const [loading, setLoading] = React.useState(true)
  const [status, setStatus] = React.useState<CommentStatus | "all">("all")
  const [page, setPage] = React.useState(1)
  const [pages, setPages] = React.useState(1)
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const { data, meta } = await commentsApi.listAllComments(fetcherPaged, {
        page,
        limit: 15,
        status: status === "all" ? undefined : status,
      })
      setComments(data)
      setPages(meta?.pages ?? 1)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudieron cargar los comentarios")
    } finally {
      setLoading(false)
    }
  }, [fetcherPaged, page, status])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleModerate(id: string, next: "approved" | "spam") {
    try {
      await commentsApi.moderateComment(fetcher, id, next)
      toast.success(next === "approved" ? "Comentario aprobado" : "Marcado como spam")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar el comentario")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await commentsApi.deleteComment(fetcher, deleteTarget)
      toast.success("Comentario eliminado")
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar el comentario")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Comentarios</h1>
        <p className="text-sm text-muted-foreground">Modera los comentarios publicados en el blog.</p>
      </div>

      <Select
        value={status}
        onValueChange={(v) => {
          setPage(1)
          setStatus(v as CommentStatus | "all")
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

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <Empty className="min-h-[40vh]">
          <EmptyMedia variant="icon">
            <MessageSquareIcon />
          </EmptyMedia>
          <EmptyTitle>No hay comentarios</EmptyTitle>
          <EmptyDescription>No se encontraron comentarios con este filtro.</EmptyDescription>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div key={comment._id} className="flex items-start gap-3 rounded-xl border border-border p-4">
              <UserAvatar name={comment.author.name} avatar={comment.author.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{comment.author.name}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.createdAt)}</span>
                  <CommentStatusBadge status={comment.status} />
                </div>
                <p className="mt-1 text-sm text-foreground/90">{comment.content}</p>
                <Link
                  href={`/posts/${comment.post.slug}`}
                  target="_blank"
                  className="mt-1 inline-block text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
                >
                  en &quot;{comment.post.title}&quot;
                </Link>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {comment.status !== "approved" ? (
                    <DropdownMenuItem onClick={() => handleModerate(comment._id, "approved")}>
                      <CheckIcon data-icon="inline-start" />
                      Aprobar
                    </DropdownMenuItem>
                  ) : null}
                  {comment.status !== "spam" ? (
                    <DropdownMenuItem onClick={() => handleModerate(comment._id, "spam")}>
                      <ShieldIcon data-icon="inline-start" />
                      Marcar como spam
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(comment._id)}>
                    <Trash2Icon data-icon="inline-start" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {pages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {pages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeftIcon data-icon="inline-start" />
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Siguiente
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      ) : null}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function DashboardCommentsPage() {
  return (
    <RequireAuth anyPermission={["comments:moderate"]}>
      <CommentsModerationTable />
    </RequireAuth>
  )
}
