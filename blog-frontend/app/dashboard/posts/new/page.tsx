import { RequireAuth } from "@/components/require-auth"
import { PostForm } from "@/components/posts/post-form"

export default function NewPostPage() {
  return (
    <RequireAuth anyPermission={["posts:create"]}>
      <PostForm mode="create" />
    </RequireAuth>
  )
}
