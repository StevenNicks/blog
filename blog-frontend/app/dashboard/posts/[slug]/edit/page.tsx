"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { PostForm } from "@/components/posts/post-form"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api/client"
import * as postsApi from "@/lib/api/posts"
import type { Post } from "@/lib/types"

function EditPostContent() {
  const { slug } = useParams<{ slug: string }>()
  const { fetcher } = useAuth()
  const router = useRouter()
  const [post, setPost] = React.useState<Post | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true
    setLoading(true)
    postsApi
      .getPost(fetcher, slug)
      .then((data) => {
        if (active) setPost(data)
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo cargar el post")
        router.push("/dashboard/posts")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug, fetcher, router])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!post) return null

  return <PostForm mode="edit" initialPost={post} />
}

export default function EditPostPage() {
  return (
    <RequireAuth anyPermission={["posts:edit:own", "posts:edit:any"]}>
      <EditPostContent />
    </RequireAuth>
  )
}
