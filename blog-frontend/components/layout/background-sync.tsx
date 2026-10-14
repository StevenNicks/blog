"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

const CHANNEL = "site-settings"

/** Avisa a las demás pestañas abiertas de que el patrón de fondo cambió. */
export function notifyBackgroundChanged() {
  try {
    const channel = new BroadcastChannel(CHANNEL)
    channel.postMessage("background")
    channel.close()
  } catch {
    // BroadcastChannel no disponible: las otras pestañas se actualizan al recuperar el foco
  }
}

// Mantiene el fondo al día en las pestañas ya abiertas: se refresca cuando otra
// pestaña guarda el ajuste y cuando esta pestaña vuelve a estar visible (cubre
// también cambios hechos desde otro navegador o dispositivo).
export function BackgroundSync() {
  const router = useRouter()

  React.useEffect(() => {
    const refresh = () => router.refresh()
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh()
    }

    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel(CHANNEL)
      channel.onmessage = refresh
    } catch {
      channel = null
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      channel?.close()
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [router])

  return null
}
