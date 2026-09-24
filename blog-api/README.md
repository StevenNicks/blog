# Blog API

API REST en Node.js/Express + MongoDB para administrar un blog: posts con
contenido enriquecido, comentarios, usuarios, roles/permisos e imágenes.

## Stack

- Express 4 + Mongoose 8
- Autenticación JWT (access token + refresh token rotado, en cookie httpOnly)
- RBAC basado en roles con permisos configurables (colección `Role`)
- `sanitize-html` para limpiar el contenido enriquecido de los posts (XSS)
- `multer` para subida de imágenes a disco (`/uploads`, servido como estático)
- `express-validator`, `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `hpp`

## Instalación

```bash
cd blog-api
npm install
cp .env.example .env   # y edita los secretos/URI
npm run seed            # crea los roles base y un usuario admin
npm run dev              # o: npm start
```

El seed crea 4 roles del sistema (`admin`, `editor`, `author`, `reader`) y un
usuario administrador (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` en `.env`,
por defecto `admin@blog.com` / `Admin12345!`).

## Modelo de roles y permisos

Los roles no están fijados en código: son documentos en Mongo (`Role`) con un
arreglo `permissions`. Un usuario con rol `admin` siempre pasa cualquier
chequeo de permisos. Los demás roles se evalúan contra permisos concretos:

| Permiso | Descripción |
|---|---|
| `posts:create` | Crear posts |
| `posts:edit:own` / `posts:edit:any` | Editar posts propios / de cualquiera |
| `posts:delete:own` / `posts:delete:any` | Eliminar posts propios / de cualquiera |
| `comments:create` | Comentar |
| `comments:moderate` | Ver/aprobar/marcar como spam cualquier comentario |
| `comments:delete:own` / `comments:delete:any` | Eliminar comentarios propios / de cualquiera |
| `users:manage` | Listar, editar rol, activar/desactivar y eliminar usuarios |
| `roles:manage` | CRUD de roles |
| `images:upload` | Subir imágenes |
| `images:delete:own` / `images:delete:any` | Eliminar imágenes propias / de cualquiera |

Se pueden crear roles nuevos (p. ej. `moderador`) combinando estos permisos
vía `POST /api/roles`.

## Endpoints

Base URL: `/api`

### Auth
- `POST /auth/register` — registro público (rol `reader` por defecto)
- `POST /auth/login`
- `POST /auth/refresh-token` — rota el refresh token (cookie httpOnly)
- `POST /auth/logout`
- `GET /auth/me` — requiere token

### Usuarios (requiere `users:manage` salvo edición del propio perfil)
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id` — el propio usuario o un admin
- `PATCH /users/:id/role`
- `PATCH /users/:id/active`
- `DELETE /users/:id`

### Roles (requiere `roles:manage`)
- `GET /roles`
- `GET /roles/:id`
- `POST /roles`
- `PATCH /roles/:id`
- `DELETE /roles/:id`

### Posts
- `GET /posts` — público (solo `published`); autenticado con permiso de
  edición ve además `draft`/`archived` y puede filtrar por `status`.
  Filtros: `page`, `limit`, `status`, `author`, `category`, `tag`, `search`.
- `GET /posts/:slug`
- `POST /posts` — requiere `posts:create`
- `PATCH /posts/:id` — dueño (con `posts:edit:own`) o `posts:edit:any`.
  Cambiar `status` a `published` publica el post.
- `DELETE /posts/:id`

El `content` se envía como HTML (desde cualquier editor WYSIWYG en el
frontend) y el servidor lo sanea con `sanitize-html` antes de guardarlo.

### Comentarios
- `GET /posts/:postId/comments`
- `POST /posts/:postId/comments` — requiere sesión; soporta `parentComment`
  para respuestas anidadas
- `PATCH /comments/:id` — solo el autor
- `PATCH /comments/:id/moderate` — requiere `comments:moderate`
- `DELETE /comments/:id`

### Imágenes
- `POST /images` — `multipart/form-data`, campo `images` (hasta 10 archivos),
  requiere `images:upload`
- `GET /images`
- `DELETE /images/:id`

Las imágenes se sirven en `/uploads/<filename>`. El `_id` de una imagen puede
usarse como `coverImage` o dentro de `images` al crear/editar un post.

## Ejemplo de flujo

```bash
# 1. Login como admin
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blog.com","password":"Admin12345!"}'

# 2. Subir una imagen (usa el accessToken de la respuesta anterior)
curl -X POST http://localhost:4000/api/images \
  -H "Authorization: Bearer <accessToken>" \
  -F "images=@./portada.jpg"

# 3. Crear un post
curl -X POST http://localhost:4000/api/posts \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi primer post",
    "content": "<h1>Hola</h1><p>Contenido <b>enriquecido</b></p>",
    "status": "published",
    "coverImage": "<idDeLaImagen>",
    "tags": ["nodejs", "api"]
  }'
```

## Estructura del proyecto

```
src/
  config/db.js
  constants/permissions.js
  models/           User, Role, Post, Comment, Image, Token
  middlewares/       auth, authorize (RBAC), upload (multer), validate, error
  controllers/
  routes/
  validators/         express-validator
  seed/seed.js        roles base + usuario admin
  app.js
  server.js
uploads/               archivos subidos (servidos como estáticos)
```
