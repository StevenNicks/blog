import Link from "next/link"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"
import { formatDate, readingTime } from "@/lib/format"
import type { Post } from "@/lib/types"

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <Card className="group overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="relative aspect-16/9 overflow-hidden bg-muted">
          {post.coverImage ? (
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
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

      <CardFooter className="flex items-center justify-between border-t py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <UserAvatar name={post.author.name} avatar={post.author.avatar} size="sm" />
          <span className="truncate font-medium text-foreground">{post.author.name}</span>
        </div>
        <div className="flex flex-col items-end text-xs">
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          <span>{readingTime(post.content)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
