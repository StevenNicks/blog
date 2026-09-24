"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ExternalLinkIcon, ImageIcon, Trash2Icon, XIcon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { ImagePickerDialog } from "@/components/images/image-picker-dialog"
import { TagInput } from "@/components/posts/tag-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ApiError } from "@/lib/api/client"
import * as postsApi from "@/lib/api/posts"
import type { ImageAsset, Post, PostStatus } from "@/lib/types"

interface PostFormProps {
  mode: "create" | "edit"
  initialPost?: Post
}

export function PostForm({ mode, initialPost }: PostFormProps) {
  const { fetcher, hasPermission } = useAuth()
  const router = useRouter()

  const [title, setTitle] = React.useState(initialPost?.title ?? "")
  const [content, setContent] = React.useState(initialPost?.content ?? "")
  const [excerpt, setExcerpt] = React.useState(initialPost?.excerpt ?? "")
  const [category, setCategory] = React.useState(initialPost?.category ?? "general")
  const [tags, setTags] = React.useState<string[]>(initialPost?.tags ?? [])
  const [status, setStatus] = React.useState<PostStatus>(initialPost?.status ?? "draft")
  const [coverImage, setCoverImage] = React.useState<ImageAsset | null>(initialPost?.coverImage ?? null)
  const [submitting, setSubmitting] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const canDelete =
    mode === "edit" &&
    initialPost &&
    (hasPermission("posts:delete:any") || hasPermission("posts:delete:own"))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error("El título y el contenido son obligatorios")
      return
    }

    setSubmitting(true)
    const payload = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || undefined,
      category: category.trim() || "general",
      tags,
      status,
      coverImage: coverImage?._id ?? null,
    }

    try {
      if (mode === "create") {
        const created = await postsApi.createPost(fetcher, payload)
        toast.success("Post creado")
        router.push(`/dashboard/posts/${created.slug}/edit`)
      } else if (initialPost) {
        const updated = await postsApi.updatePost(fetcher, initialPost._id, payload)
        toast.success("Post actualizado")
        if (updated.slug !== initialPost.slug) {
          router.replace(`/dashboard/posts/${updated.slug}/edit`)
        } else {
          router.refresh()
        }
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el post")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!initialPost) return
    setDeleting(true)
    try {
      await postsApi.deletePost(fetcher, initialPost._id)
      toast.success("Post eliminado")
      router.push("/dashboard/posts")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar el post")
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Nuevo post" : "Editar post"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create" ? "Redacta y publica un nuevo artículo." : `Actualizando "${initialPost?.title}"`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && initialPost?.status === "published" ? (
            <Button variant="outline" asChild type="button">
              <Link href={`/posts/${initialPost.slug}`} target="_blank">
                <ExternalLinkIcon data-icon="inline-start" />
                Ver post
              </Link>
            </Button>
          ) : null}
          {canDelete ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" type="button">
                  <Trash2Icon data-icon="inline-start" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar este post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El post se eliminará permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                    {deleting ? <Spinner data-icon="inline-start" /> : null}
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner data-icon="inline-start" /> : null}
            {mode === "create" ? "Crear post" : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Un título claro y atractivo"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="content">Contenido</FieldLabel>
              <RichTextEditor content={content} onChange={setContent} />
            </Field>

            <Field>
              <FieldLabel htmlFor="excerpt">Extracto</FieldLabel>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Resumen breve para las tarjetas del blog (opcional, se genera automáticamente si se deja vacío)"
                rows={3}
              />
            </Field>
          </FieldGroup>
        </div>

        <div className="flex flex-col gap-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="status">Estado</FieldLabel>
              <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>Solo los posts publicados son visibles en el blog.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Categoría</FieldLabel>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </Field>

            <Field>
              <FieldLabel htmlFor="tags">Etiquetas</FieldLabel>
              <TagInput id="tags" value={tags} onChange={setTags} placeholder="Escribe y presiona Enter" />
            </Field>

            <Field>
              <FieldLabel>Imagen de portada</FieldLabel>
              {coverImage ? (
                <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
                  <Image src={coverImage.url} alt={coverImage.alt || title} fill className="object-cover" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className="absolute top-2 right-2"
                    onClick={() => setCoverImage(null)}
                  >
                    <XIcon />
                  </Button>
                </div>
              ) : (
                <ImagePickerDialog
                  onSelect={setCoverImage}
                  trigger={
                    <Button type="button" variant="outline" className="w-full justify-center">
                      <ImageIcon data-icon="inline-start" />
                      Elegir portada
                    </Button>
                  }
                />
              )}
            </Field>
          </FieldGroup>
        </div>
      </div>
    </form>
  )
}
