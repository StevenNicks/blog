"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { CheckIcon, MessageSquareIcon, MoreVerticalIcon, ReplyIcon, ShieldIcon, Trash2Icon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { UserAvatar } from "@/components/user-avatar"
import { CommentStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
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
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { formatRelativeDate } from "@/lib/format"
import { ApiError } from "@/lib/api/client"
import * as commentsApi from "@/lib/api/comments"
import type { Comment } from "@/lib/types"

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
}

interface CommentNode extends Comment {
  replies: Comment[]
}

function groupComments(comments: Comment[]): CommentNode[] {
  const topLevel = comments.filter((c) => !c.parentComment)
  return topLevel.map((c) => ({
    ...c,
    replies: comments.filter((r) => r.parentComment === c._id),
  }))
}

interface CommentRowProps {
  comment: Comment
  isReply?: boolean
  currentUserId?: string
  isAuthenticated: boolean
  canModerate: boolean
  isReplying: boolean
  replyText: string
  submitting: boolean
  onReplyTextChange: (value: string) => void
  onToggleReply: () => void
  onCancelReply: () => void
  onSubmitReply: () => void
  onModerate: (id: string, status: "approved" | "spam") => void
  onRequestDelete: (id: string) => void
}

function CommentRow({
  comment,
  isReply = false,
  currentUserId,
  isAuthenticated,
  canModerate,
  isReplying,
  replyText,
  submitting,
  onReplyTextChange,
  onToggleReply,
  onCancelReply,
  onSubmitReply,
  onModerate,
  onRequestDelete,
}: CommentRowProps) {
  const isOwner = currentUserId === comment.author._id
  const canDelete = isOwner || canModerate
  const showModerationBadge = canModerate && comment.status !== "approved"

  return (
    <div className={isReply ? "ml-10 border-l border-border pl-4" : ""}>
      <div className="flex gap-3">
        <UserAvatar name={comment.author.name} avatar={comment.author.avatar} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.createdAt)}</span>
            {showModerationBadge ? <CommentStatusBadge status={comment.status} /> : null}
          </div>
          <p className="mt-1 text-sm break-words whitespace-pre-wrap text-foreground/90">{comment.content}</p>

          <div className="mt-2 flex items-center gap-1">
            {!isReply && isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={onToggleReply}
              >
                <ReplyIcon data-icon="inline-start" />
                Responder
              </Button>
            ) : null}

            {canDelete || canModerate ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {canModerate && comment.status !== "approved" ? (
                    <DropdownMenuItem onClick={() => onModerate(comment._id, "approved")}>
                      <CheckIcon data-icon="inline-start" />
                      Aprobar
                    </DropdownMenuItem>
                  ) : null}
                  {canModerate && comment.status !== "spam" ? (
                    <DropdownMenuItem onClick={() => onModerate(comment._id, "spam")}>
                      <ShieldIcon data-icon="inline-start" />
                      Marcar como spam
                    </DropdownMenuItem>
                  ) : null}
                  {canDelete ? (
                    <DropdownMenuItem variant="destructive" onClick={() => onRequestDelete(comment._id)}>
                      <Trash2Icon data-icon="inline-start" />
                      Eliminar
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>

          {isReplying ? (
            <div className="mt-3 flex flex-col gap-2">
              <Textarea
                autoFocus
                placeholder={`Responder a ${comment.author.name}…`}
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={onCancelReply}>
                  Cancelar
                </Button>
                <Button size="sm" disabled={submitting || !replyText.trim()} onClick={onSubmitReply}>
                  Responder
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { user, status, hasPermission, fetcher } = useAuth()
  const [comments, setComments] = React.useState(initialComments)
  const [newComment, setNewComment] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [replyTo, setReplyTo] = React.useState<string | null>(null)
  const [replyText, setReplyText] = React.useState("")
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)

  const canModerate = hasPermission("comments:moderate")

  React.useEffect(() => {
    if (status === "authenticated" && canModerate) {
      commentsApi.listComments(fetcher, postId).then(setComments).catch(() => {})
    }
  }, [status, canModerate, fetcher, postId])

  async function submitComment(content: string, parentComment: string | null) {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const created = await commentsApi.createComment(fetcher, postId, {
        content: content.trim(),
        parentComment,
      })
      setComments((prev) => [...prev, created])
      if (parentComment) {
        setReplyTo(null)
        setReplyText("")
      } else {
        setNewComment("")
      }
      toast.success("Comentario publicado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo publicar el comentario")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleModerate(id: string, moderateStatus: "approved" | "spam") {
    try {
      const updated = await commentsApi.moderateComment(fetcher, id, moderateStatus)
      setComments((prev) => prev.map((c) => (c._id === id ? updated : c)))
      toast.success(moderateStatus === "approved" ? "Comentario aprobado" : "Comentario marcado como spam")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar el comentario")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await commentsApi.deleteComment(fetcher, deleteTarget)
      setComments((prev) => prev.filter((c) => c._id !== deleteTarget))
      toast.success("Comentario eliminado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar el comentario")
    } finally {
      setDeleteTarget(null)
    }
  }

  const grouped = groupComments(comments)

  const commentRowSharedProps = {
    currentUserId: user?._id,
    isAuthenticated: status === "authenticated",
    canModerate,
    replyText,
    submitting,
    onReplyTextChange: setReplyText,
    onCancelReply: () => setReplyTo(null),
    onModerate: handleModerate,
    onRequestDelete: setDeleteTarget,
  }

  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight">
        <MessageSquareIcon className="size-5" />
        Comentarios
        <span className="text-muted-foreground">({comments.length})</span>
      </h2>

      <div className="mt-6">
        {status === "authenticated" ? (
          <Field>
            <FieldLabel htmlFor="new-comment" className="sr-only">
              Escribe un comentario
            </FieldLabel>
            <Textarea
              id="new-comment"
              placeholder="Comparte tu opinión sobre este post…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                className="mt-2"
                disabled={submitting || !newComment.trim()}
                onClick={() => submitComment(newComment, null)}
              >
                {submitting ? <Spinner data-icon="inline-start" /> : null}
                Comentar
              </Button>
            </div>
          </Field>
        ) : status === "loading" ? null : (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary underline underline-offset-4">
              Inicia sesión
            </Link>{" "}
            para dejar un comentario.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {grouped.length === 0 ? (
          <Empty className="py-10">
            <EmptyMedia variant="icon">
              <MessageSquareIcon />
            </EmptyMedia>
            <EmptyTitle>Sé el primero en comentar</EmptyTitle>
            <EmptyDescription>Aún no hay comentarios en este post.</EmptyDescription>
          </Empty>
        ) : (
          grouped.map((comment) => (
            <div key={comment._id} className="flex flex-col gap-4">
              <CommentRow
                comment={comment}
                isReplying={replyTo === comment._id}
                onToggleReply={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                onSubmitReply={() => submitComment(replyText, comment._id)}
                {...commentRowSharedProps}
              />
              {comment.replies.map((reply) => (
                <CommentRow
                  key={reply._id}
                  comment={reply}
                  isReply
                  isReplying={false}
                  onToggleReply={() => {}}
                  onSubmitReply={() => {}}
                  {...commentRowSharedProps}
                />
              ))}
            </div>
          ))
        )}
      </div>

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
    </section>
  )
}
