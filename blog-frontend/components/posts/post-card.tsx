import Link from "next/link"
import Image from "next/image"
import { EyeIcon, ImageIcon } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"
import { formatDate, readingTime } from "@/lib/format"
import type { Post } from "@/lib/types"

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <Card className="group overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="relative aspect-1200/630 overflow-hidden bg-muted">
          {post.coverImage ? (
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={90}
              priority={priority}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-8" />
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="pt-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{post.category}</Badge>
          {post.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
        <Link href={`/posts/${post.slug}`}>
          <h3 className="mt-2 line-clamp-2 font-heading text-lg leading-snug font-semibold tracking-tight transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3 border-t py-4 text-sm text-muted-foreground">
        {/* min-w-0 deja que el nombre se recorte; los datos de la derecha nunca se parten */}
        <div className="flex min-w-0 items-center gap-2">
          <UserAvatar name={post.author?.name ?? "Usuario eliminado"} avatar={post.author?.avatar} size="sm" />
          <span className="truncate font-medium text-foreground">{post.author?.name ?? "Usuario eliminado"}</span>
        </div>
        <div className="flex shrink-0 flex-col items-end text-xs whitespace-nowrap">
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          <span className="flex items-center gap-1.5">
            {readingTime(post.content)}
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1" title={`${post.views} vistas`}>
              <EyeIcon aria-hidden className="size-3.5" />
              {post.views}
              <span className="sr-only">vistas</span>
            </span>
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
