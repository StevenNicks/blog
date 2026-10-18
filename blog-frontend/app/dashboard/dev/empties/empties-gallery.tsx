"use client"

import * as React from "react"

import { EmptyComments } from "@/components/empty/empty-comments"
import { EmptyImages } from "@/components/empty/empty-images"
import { EmptyPosts } from "@/components/empty/empty-posts"
import { EmptySearch } from "@/components/empty/empty-search"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
        <Separator />
      </div>
      {children}
    </section>
  )
}

function Showcase({
  title,
  where,
  narrow = false,
  children,
}: {
  title: string
  /** Pantalla donde se usa el vacío */
  where: string
  /** Imita un contenedor angosto real, como la página de un post */
  narrow?: boolean
  children: React.ReactNode
}) {
  return (
    <article className="flex flex-col gap-3">
      <header className="flex flex-col gap-0.5">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{where}</p>
      </header>
      <Card className={cn(narrow && "max-w-2xl")}>
        <CardContent>{children}</CardContent>
      </Card>
    </article>
  )
}

export function EmptiesGallery() {
  const [uploading, setUploading] = React.useState(false)

  // Simula una subida para ver el botón con su spinner
  function fakeUpload() {
    setUploading(true)
    window.setTimeout(() => setUploading(false), 1500)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Estados vacíos</h1>
          <Badge variant="outline">Solo desarrollo</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          La versión final de cada empty, sin depender de los datos. Cambia el tema desde el menú del usuario.
        </p>
      </header>

      <Group title="Imágenes">
        <Showcase title="EmptyImages" where="/dashboard/images">
          <EmptyImages onUpload={fakeUpload} uploading={uploading} />
        </Showcase>
      </Group>

      <Group title="Posts">
        <Showcase title="EmptyPosts · dashboard" where="/dashboard/posts · sin posts ni filtros">
          <EmptyPosts />
        </Showcase>
        <Showcase title="EmptyPosts · público" where="Home del blog · sin posts publicados">
          <EmptyPosts variant="public" />
        </Showcase>
      </Group>

      <Group title="Comentarios">
        <Showcase title="EmptyComments · moderación" where="/dashboard/comments · sin ningún comentario">
          <EmptyComments />
        </Showcase>
        <Showcase title="EmptyComments · todo al día" where="/dashboard/comments · filtro «Pendientes» vacío">
          <EmptyComments variant="caughtUp" />
        </Showcase>
        <Showcase title="EmptyComments · en un post" where="Página de un post · compacto, sin comentarios" narrow>
          <EmptyComments variant="post" className="py-4" />
        </Showcase>
      </Group>

      <Group title="Búsqueda sin resultados">
        <Showcase title="EmptySearch" where="Posts, usuarios y comentarios, y home público">
          <EmptySearch entity="posts" query="wireframe kit" onClear={() => {}} />
        </Showcase>
      </Group>
    </div>
  )
}
