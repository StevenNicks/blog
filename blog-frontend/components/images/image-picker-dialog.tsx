"use client"

import * as React from "react"
import Image from "next/image"
import { toast } from "sonner"
import { ImageOffIcon, UploadIcon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ApiError } from "@/lib/api/client"
import * as imagesApi from "@/lib/api/images"
import type { ImageAsset } from "@/lib/types"

interface ImagePickerDialogProps {
  trigger: React.ReactNode
  onSelect: (image: ImageAsset) => void
}

export function ImagePickerDialog({ trigger, onSelect }: ImagePickerDialogProps) {
  const { fetcher, fetcherPaged } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [images, setImages] = React.useState<ImageAsset[]>([])
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadImages = React.useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await imagesApi.listImages(fetcherPaged, { limit: 60 })
      setImages(data)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudieron cargar las imágenes")
    } finally {
      setLoading(false)
    }
  }, [fetcherPaged])

  React.useEffect(() => {
    if (open) loadImages()
  }, [open, loadImages])

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return
    setUploading(true)
    try {
      const uploaded = await imagesApi.uploadImages(fetcher, Array.from(fileList))
      setImages((prev) => [...uploaded, ...prev])
      toast.success(uploaded.length > 1 ? "Imágenes subidas" : "Imagen subida")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo subir la imagen")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Biblioteca de imágenes</DialogTitle>
          <DialogDescription>Selecciona una imagen existente o sube una nueva desde tu equipo.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
            Subir imagen
          </Button>
        </div>

        <ScrollArea className="h-96">
          {loading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <Empty className="h-80">
              <EmptyMedia variant="icon">
                <ImageOffIcon />
              </EmptyMedia>
              <EmptyTitle>Sin imágenes</EmptyTitle>
              <EmptyDescription>Sube tu primera imagen para poder usarla en tus posts.</EmptyDescription>
            </Empty>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((image) => (
                <button
                  key={image._id}
                  type="button"
                  onClick={() => {
                    onSelect(image)
                    setOpen(false)
                  }}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Image
                    src={image.url}
                    alt={image.alt || image.originalName}
                    fill
                    sizes="140px"
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
