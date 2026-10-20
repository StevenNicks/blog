import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { EyeIcon, ImageIcon } from "lucide-react"

import { getPostPublic } from "@/lib/api/posts"
import { listCommentsPublic } from "@/lib/api/comments"
import { ApiError } from "@/lib/api/client"
import { CommentSection } from "@/components/comments/comment-section"
import { PostEditButton } from "@/components/posts/post-edit-button"
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

      <div className="mt-6 flex items-center gap-3 border-y border-border py-4 text-sm text-muted-foreground">
        <UserAvatar name={post.author?.name ?? "Usuario eliminado"} avatar={post.author?.avatar} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-medium text-foreground">{post.author?.name ?? "Usuario eliminado"}</span>
          {/* En movil la fecha ocupa su propia linea para no dejar un separador colgando al envolver */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <time dateTime={post.publishedAt ?? post.createdAt} className="max-sm:w-full">
              {formatDate(post.publishedAt ?? post.createdAt)}
            </time>
            <span aria-hidden className="max-sm:hidden">
              ·
            </span>
            <span>{readingTime(post.content)}</span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              <EyeIcon className="size-3.5" />
              {post.views} vistas
            </span>
          </div>
        </div>
        <PostEditButton slug={post.slug} authorId={post.author?._id} />
      </div>

      {post.coverImage ? (
        <div className="relative mt-8 aspect-1200/630 overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            quality={90}
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="mt-8 flex aspect-1200/630 items-center justify-center rounded-xl border border-dashed border-border bg-muted text-muted-foreground">
          <ImageIcon className="size-10" />
        </div>
      )}

      {/* eslint-disable-next-line react/no-danger -- contenido saneado en el backend con sanitize-html antes de guardarse */}
      <div className="prose-content mt-8" dangerouslySetInnerHTML={{ __html: post.content }} />

      {post.author?.bio ? (
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
