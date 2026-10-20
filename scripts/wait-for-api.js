// Espera a que la API acepte conexiones antes de arrancar el frontend.
// La API solo escucha despues de conectar con MongoDB, y si Next arranca antes,
// las paginas que hacen fetch en el servidor fallan con ECONNREFUSED ("fetch failed").
const net = require("net")

const HOST = process.env.API_HOST || "localhost"
const PORT = Number(process.env.API_PORT || 4000)
const TIMEOUT_MS = 60_000
const INTERVAL_MS = 500

const start = Date.now()
let announced = false

function tryConnect() {
  const socket = net.connect({ host: HOST, port: PORT })
  socket.once("connect", () => {
    socket.end()
    console.log(`API disponible en ${HOST}:${PORT}, arrancando el frontend`)
    process.exit(0)
  })
  socket.once("error", () => {
    socket.destroy()
    if (Date.now() - start > TIMEOUT_MS) {
      console.error(`La API no respondio en ${HOST}:${PORT} tras ${TIMEOUT_MS / 1000}s`)
      process.exit(1)
    }
    if (!announced) {
      console.log(`Esperando a la API en ${HOST}:${PORT}...`)
      announced = true
    }
    setTimeout(tryConnect, INTERVAL_MS)
  })
}

tryConnect()
