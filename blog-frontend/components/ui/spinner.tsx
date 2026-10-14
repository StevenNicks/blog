import { cn } from "cn"
import { Loader2Icon } from "lucide-react"

// Dentro de un botón (data-icon) es decorativo: el propio botón comunica el estado.
// Suelto, se anuncia como "Cargando".
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const inButton = "data-icon" in props
  return (
    <Loader2Icon
      data-slot="spinner"
      {...(inButton ? { "aria-hidden": true } : { role: "status", "aria-label": "Cargando" })}
      className={cn("size-4 animate-spin motion-reduce:animate-none", className)}
      {...props}
    />
  )
}

export { Spinner }
