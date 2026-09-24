import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { EyeIcon, ImageIcon } from "lucide-react"

import { getPostPublic } from "@/lib/api/posts"
import { listCommentsPublic } from "@/lib/api/comments"
import { ApiError } from "@/lib/api/client"
import { CommentSection } from "@/components/comments/comment-section"
import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import { formatDate, readingTime } from "@/lib/format"
import type { Metadata } from "next"

interface PostPageProps {
  params: Promise<{ slug: string }>
}

async function loadPost(slug: string) {
  try {
    return await getPostPublic(slug)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) return { title: "Post no encontrado" }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) notFound()

  const comments = await listCommentsPublic(post._id)

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary">{post.category}</Badge>
        {post.tags.map((tag) => (
          <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`}>
            <Badge variant="outline">#{tag}</Badge>
          </Link>
        ))}
      </div>

      <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">{post.title}</h1>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <UserAvatar name={post.author.name} avatar={post.author.avatar} />
          <div className="flex flex-col leading-tight">
            <span className="font-medium text-foreground">{post.author.name}</span>
            <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          </div>
        </div>
        <span aria-hidden>·</span>
        <span>{readingTime(post.content)}</span>
        <span aria-hidden>·</span>
        <span className="flex items-center gap-1">
          <EyeIcon className="size-4" />
          {post.views} vistas
        </span>
      </div>

      {post.coverImage ? (
        <div className="relative mt-8 aspect-16/9 overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="mt-8 flex aspect-16/9 items-center justify-center rounded-xl border border-dashed border-border bg-muted text-muted-foreground">
          <ImageIcon className="size-10" />
        </div>
      )}

      {/* eslint-disable-next-line react/no-danger -- contenido saneado en el backend con sanitize-html antes de guardarse */}
      <div className="prose-content mt-8" dangerouslySetInnerHTML={{ __html: post.content }} />

      {post.author.bio ? (
        <div className="mt-10 flex items-start gap-4 rounded-xl border border-border bg-muted/40 p-5">
          <UserAvatar name={post.author.name} avatar={post.author.avatar} size="lg" />
          <div>
            <p className="font-heading font-semibold">{post.author.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{post.author.bio}</p>
          </div>
        </div>
      ) : null}

      <CommentSection postId={post._id} initialComments={comments} />
    </article>
  )
}
