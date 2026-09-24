import { Badge } from "@/components/ui/badge"
import type { CommentStatus, PostStatus } from "@/lib/types"

const postStatusMap: Record<PostStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  published: { label: "Publicado", variant: "default" },
  draft: { label: "Borrador", variant: "secondary" },
  archived: { label: "Archivado", variant: "outline" },
}

const commentStatusMap: Record<CommentStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  approved: { label: "Aprobado", variant: "default" },
  pending: { label: "Pendiente", variant: "secondary" },
  spam: { label: "Spam", variant: "destructive" },
}

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const { label, variant } = postStatusMap[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function CommentStatusBadge({ status }: { status: CommentStatus }) {
  const { label, variant } = commentStatusMap[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function RoleBadge({ role }: { role: string }) {
  const variant = role === "admin" ? "default" : "outline"
  return <Badge variant={variant}>{role}</Badge>
}
