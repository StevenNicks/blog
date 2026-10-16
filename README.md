# Blog

Blog full-stack con contenido enriquecido, comentarios, roles/permisos e imágenes.

## Estructura

- [`blog-api/`](./blog-api) — API REST en Node.js/Express + MongoDB (posts, comentarios, usuarios, roles, imágenes).
- [`blog-frontend/`](./blog-frontend) — Frontend en Next.js + shadcn/ui (sitio público + panel de administración).
- [`blog-frontend/design/`](./blog-frontend/design) — Documentos de identidad visual (logo, sistema de diseño, direcciones de estilo).

## Arranque rápido

```bash
# Backend
cd blog-api
npm install
cp .env.example .env   # completar variables (Mongo URI, secretos JWT, etc.)
npm run seed             # crea roles base + usuario admin
npm run dev

# Frontend (en otra terminal)
cd blog-frontend
npm install
npm run dev
```

Backend en `http://localhost:4000`, frontend en `http://localhost:3000`. Cada carpeta tiene su propio README con más detalle.

### Ejecutar todo con un solo comando

Desde la raíz se levantan backend y frontend a la vez, en una sola terminal (salida etiquetada `[api]` y `[web]`):

```bash
npm install          # solo la primera vez (instala concurrently)
npm run dev
```

`npm run install:all` instala las dependencias de la raíz y de ambas carpetas.

### Puertos ocupados (`EADDRINUSE`)

Si al arrancar aparece `address already in use` en el puerto 4000 o 3000, es que queda un `npm run dev` anterior vivo (por ejemplo en otra terminal). Para cerrarlo en Windows (PowerShell):

```powershell
Get-NetTCPConnection -LocalPort 3000,4000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```
