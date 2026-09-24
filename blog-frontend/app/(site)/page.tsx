import { FileTextIcon } from "lucide-react"

import { listPostsPublic } from "@/lib/api/posts"
import { PostCard } from "@/components/posts/post-card"
import { PostSearch } from "@/components/posts/post-search"
import { PostPagination } from "@/components/posts/post-pagination"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

interface HomeSearchParams {
  page?: string
  search?: string
  tag?: string
  category?: string
  [key: string]: string | undefined
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>
}) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1) || 1

  const { data: posts, meta } = await listPostsPublic({
    page,
    limit: 9,
    search: sp.search,
    tag: sp.tag,
    category: sp.category,
  })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="mb-10 flex flex-col gap-6 text-center sm:mb-14">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Historias, ideas y aprendizajes
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-muted-foreground sm:text-lg">
          Un espacio para explorar artículos escritos por nuestra comunidad de autores.
        </p>
        <div className="mx-auto w-full max-w-md">
          <PostSearch />
        </div>
      </section>

      {sp.search || sp.tag || sp.category ? (
        <p className="mb-6 text-sm text-muted-foreground">
          {meta?.total ?? posts.length} resultado{(meta?.total ?? posts.length) === 1 ? "" : "s"}
          {sp.search ? (
            <>
              {" "}para <span className="font-medium text-foreground">&quot;{sp.search}&quot;</span>
            </>
          ) : null}
          {sp.tag ? (
            <>
              {" "}en <span className="font-medium text-foreground">#{sp.tag}</span>
            </>
          ) : null}
        </p>
      ) : null}

      {posts.length === 0 ? (
        <Empty className="min-h-[40vh]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>No hay posts todavía</EmptyTitle>
            <EmptyDescription>
              {sp.search || sp.tag || sp.category
                ? "Prueba con otros términos de búsqueda."
                : "Vuelve pronto, estamos preparando contenido nuevo."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <PostCard key={post._id} post={post} priority={index === 0} />
            ))}
          </div>

          <div className="mt-10">
            <PostPagination
              page={meta?.page ?? 1}
              pages={meta?.pages ?? 1}
              basePath="/"
              searchParams={sp}
            />
          </div>
        </>
      )}
    </div>
  )
}
