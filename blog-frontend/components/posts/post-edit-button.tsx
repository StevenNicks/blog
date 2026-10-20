"use client"

import Link from "next/link"
import { PenLineIcon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"

interface PostEditButtonProps {
  slug: string
  authorId?: string
}

/** Acceso directo a la edicion del post; solo se muestra a quien el backend le permitiria editarlo. */
export function PostEditButton({ slug, authorId }: PostEditButtonProps) {
  const { user, hasPermission } = useAuth()

  const canEdit =
    hasPermission("posts:edit:any") || (hasPermission("posts:edit:own") && !!authorId && user?._id === authorId)
  if (!canEdit) return null

  return (
    <Button variant="outline" size="sm" className="shrink-0 max-sm:size-8 max-sm:p-0!" asChild>
      <Link href={`/dashboard/posts/${slug}/edit`} aria-label="Editar post">
        <PenLineIcon data-icon="inline-start" />
        <span className="max-sm:sr-only">Editar</span>
      </Link>
    </Button>
  )
}
