interface LogoProps {
  size?: number
  className?: string
}

/** Marca "hilo de conversación": líneas de contenido que terminan en una cola de globo. */
export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Blog"
    >
      <rect width="96" height="96" rx="22" fill="var(--primary)" />
      <rect x="24" y="30" width="48" height="10" rx="5" fill="var(--primary-foreground)" />
      <rect x="24" y="48" width="36" height="10" rx="5" fill="var(--primary-foreground)" />
      <path d="M24 58 v10 l10 -10 z" fill="var(--primary-foreground)" />
    </svg>
  )
}
