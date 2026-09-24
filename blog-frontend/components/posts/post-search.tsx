"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { SearchIcon, XIcon } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"

export function PostSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = React.useState(searchParams.get("search") ?? "")

  React.useEffect(() => {
    setValue(searchParams.get("search") ?? "")
  }, [searchParams])

  function updateSearch(next: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (next) {
      params.set("search", next)
    } else {
      params.delete("search")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        updateSearch(value.trim())
      }}
    >
      <InputGroup>
        <InputGroupInput
          placeholder="Buscar posts por título, contenido o etiqueta…"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        {value ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-xs"
              onClick={() => {
                setValue("")
                updateSearch("")
              }}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </form>
  )
}
