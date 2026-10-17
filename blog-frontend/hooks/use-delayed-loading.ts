import * as React from "react"

// Evita parpadeos: el loader aparece solo si la carga pasa de `delay` ms y, una vez visible,
// se mantiene al menos `minDuration` ms.
export function useDelayedLoading(loading: boolean, delay = 200, minDuration = 400) {
  const [visible, setVisible] = React.useState(false)
  const shownAt = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        shownAt.current = Date.now()
        setVisible(true)
      }, delay)
      return () => clearTimeout(timer)
    }
    if (shownAt.current === null) return
    const remaining = Math.max(0, minDuration - (Date.now() - shownAt.current))
    const timer = setTimeout(() => {
      shownAt.current = null
      setVisible(false)
    }, remaining)
    return () => clearTimeout(timer)
  }, [loading, delay, minDuration])

  return visible
}
