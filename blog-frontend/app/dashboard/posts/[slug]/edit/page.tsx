"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { LoadError } from "@/components/loading/load-error"
import { LoadingGate } from "@/components/loading/loading-gate"
import { PostFormSkeleton } from "@/components/loading/post-form-skeleton"
import { PostForm } from "@/components/posts/post-form"
import { ApiError } from "@/lib/api/client"
import * as postsApi from "@/lib/api/posts"
import type { Post } from "@/lib/types"

function EditPostContent() {
  const { slug } = useParams<{ slug: string }>()
  const { fetcher } = useAuth()
  const router = useRouter()
  const [post, setPost] = React.useState<Post | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState(false)
  // Cambiar este valor vuelve a lanzar la carga (botón "Reintentar")
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError(false)
    postsApi
      .getPost(fetcher, slug)
      .then((data) => {
        if (active) setPost(data)
      })
      .catch((err) => {
        if (!active) return
        if (err instanceof ApiError && err.status === 404) {
          // El post ya no existe: no hay nada que reintentar
          toast.error(err.message)
          router.push("/dashboard/posts")
          return
        }
        toast.error(err instanceof ApiError ? err.message : "No se pudo cargar el post")
        setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug, fetcher, router, attempt])

  const retry = () => setAttempt((n) => n + 1)

  return (
    <LoadingGate loading={loading} skeleton={<PostFormSkeleton />} onRetry={retry}>
      {loadError ? (
        <LoadError title="No se pudo cargar el post" onRetry={retry} />
      ) : post ? (
        <PostForm mode="edit" initialPost={post} />
      ) : null}
    </LoadingGate>
  )
}

export default function EditPostPage() {
  return (
    <RequireAuth anyPermission={["posts:edit:own", "posts:edit:any"]}>
      <EditPostContent />
    </RequireAuth>
  )
}
