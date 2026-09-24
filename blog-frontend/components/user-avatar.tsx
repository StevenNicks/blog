import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials } from "@/lib/format"

interface UserAvatarProps {
  name: string
  avatar?: string | null
  size?: "sm" | "default" | "lg"
  className?: string
}

export function UserAvatar({ name, avatar, size = "default", className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
      <AvatarFallback>{initials(name) || "?"}</AvatarFallback>
    </Avatar>
  )
}
