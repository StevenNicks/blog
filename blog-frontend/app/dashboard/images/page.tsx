"use client"

import * as React from "react"
import Image from "next/image"
import { toast } from "sonner"
import { ChevronLeftIcon, ChevronRightIcon, ImageOffIcon, Trash2Icon, UploadIcon } from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { ApiError } from "@/lib/api/client"
import * as imagesApi from "@/lib/api/images"
import type { ImageAsset } from "@/lib/types"

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(value))
}

function uploaderName(image: ImageAsset) {
  return typeof image.uploadedBy === "string" ? null : image.uploadedBy.name
}

function ImagesLibrary() {
  const { fetcher, fetcherPaged, hasPermission } = useAuth()
  const [images, setImages] = React.useState<ImageAsset[]>([])
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [pages, setPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [deleteTarget, setDeleteTarget] = React.useState<ImageAsset | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const canSeeAll = hasPermission("images:delete:any")

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const { data, meta } = await imagesApi.listImages(fetcherPaged, { page, limit: 24 })
      setImages(data)
      setPages(meta?.pages ?? 1)
      setTotal(meta?.total ?? data.length)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudieron cargar las imágenes")
    } finally {
      setLoading(false)
    }
  }, [fetcherPaged, page])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return
    setUploading(true)
    try {
      await imagesApi.uploadImages(fetcher, Array.from(fileList))
      toast.success(fileList.length > 1 ? "Imágenes subidas" : "Imagen subida")
      setPage(1)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo subir la imagen")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await imagesApi.deleteImage(fetcher, deleteTarget._id)
      toast.success("Imagen eliminada")
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar la imagen")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Imágenes</h1>
          <p className="text-sm text-muted-foreground">
            {total} imagen{total === 1 ? "" : "es"} {canSeeAll ? "en la biblioteca" : "subidas por ti"}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
          Subir imágenes
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <Empty className="min-h-[40vh]">
          <EmptyMedia variant="icon">
            <ImageOffIcon />
          </EmptyMedia>
          <EmptyTitle>Sin imágenes</EmptyTitle>
          <EmptyDescription>Sube tu primera imagen para usarla en tus posts.</EmptyDescription>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {images.map((image) => (
            <div key={image._id} className="group relative overflow-hidden rounded-xl border border-border">
              <div className="relative aspect-square bg-muted">
                <Image src={image.url} alt={image.alt || image.originalName} fill sizes="200px" className="object-cover" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/70 to-transparent p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs font-medium">{image.originalName}</p>
                <p className="text-[10px] text-white/80">
                  {formatBytes(image.size)} · {formatShortDate(image.createdAt)}
                </p>
                {uploaderName(image) ? <p className="text-[10px] text-white/80">Por {uploaderName(image)}</p> : null}
              </div>
              <Button
                variant="destructive"
                size="icon-sm"
                className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => setDeleteTarget(image)}
              >
                <Trash2Icon />
              </Button>
            </div>
          ))}
        </div>
      )}

      {pages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {pages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeftIcon data-icon="inline-start" />
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Siguiente
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      ) : null}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              No podrás eliminarla si está siendo usada como portada o dentro del contenido de algún post.
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
    </div>
  )
}

export default function DashboardImagesPage() {
  return (
    <RequireAuth anyPermission={["images:upload"]}>
      <ImagesLibrary />
    </RequireAuth>
  )
}
