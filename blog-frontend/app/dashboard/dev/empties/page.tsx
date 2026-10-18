import { notFound } from "next/navigation"

import { EmptiesGallery } from "./empties-gallery"

// Galería de estados vacíos para revisarlos sin depender de los datos. Solo existe en desarrollo.
export default function EmptiesPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return <EmptiesGallery />
}
