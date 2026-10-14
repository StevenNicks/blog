import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.3.70", "192.168.1.*"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "192.168.3.70", port: "4000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "192.168.1.*", port: "4000", pathname: "/uploads/**" },
      { protocol: "https", hostname: "**", pathname: "/uploads/**" },
    ],
    // El backend vive en localhost durante desarrollo; Next.js bloquea por defecto
    // optimizar imágenes de IPs privadas/loopback como protección SSRF.
    dangerouslyAllowLocalIP: true,
  },
}

export default nextConfig
