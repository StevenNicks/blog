"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  id?: string
}

export function TagInput({ value, onChange, placeholder, id }: TagInputProps) {
  const [draft, setDraft] = React.useState("")

  function commit(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/^#/, "")
    if (!tag || value.includes(tag)) return
    onChange([...value, tag])
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      commit(draft)
      setDraft("")
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30"
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          #{tag}
          <button
            type="button"
            aria-label={`Quitar etiqueta ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="ml-0.5 rounded-full hover:text-destructive"
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (draft) {
            commit(draft)
            setDraft("")
          }
        }}
        placeholder={value.length ? "" : placeholder}
        className="h-6 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
      />
    </div>
  )
}
