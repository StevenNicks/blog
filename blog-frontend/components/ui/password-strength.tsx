import { cn } from "@/lib/utils"

// Puntaje 0-3: largo mínimo, largo cómodo y variedad de caracteres.
export function passwordStrength(password: string) {
  if (password.length < 8) return 0
  let score = 1
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) score++
  return score
}

const LABELS = ["", "Débil", "Media", "Fuerte"]
const COLORS = ["", "bg-destructive", "bg-amber-500", "bg-primary"]

export function PasswordStrength({ password }: { password: string }) {
  const strength = passwordStrength(password)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3].map((segment) => (
          <div
            key={segment}
            className={cn(
              "h-1 flex-1 rounded-full bg-muted transition-colors",
              strength >= segment && COLORS[strength]
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {password && strength > 0 ? `Seguridad: ${LABELS[strength]}` : "Mínimo 8 caracteres."}
      </p>
    </div>
  )
}
