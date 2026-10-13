---
name: access-control-rbac
description: Diseña e implementa usuarios, autenticación, roles y permisos (RBAC) de forma genérica para cualquier software (blog, ERP, SaaS, e-commerce, app interna). Úsalo cuando haya que modelar quién es un usuario, qué puede hacer, cómo se protegen endpoints/pantallas y cómo se administran roles y permisos.
---

# Skill: Usuarios, Roles y Permisos (RBAC genérico)

Guía agnóstica de dominio y de stack. Los ejemplos usan pseudocódigo/JS, pero los conceptos aplican a cualquier lenguaje, framework o base de datos.

> Referencia real: esta lógica está implementada en este repo en `blog-api/src/middlewares/auth.middleware.js`, `authorize.middleware.js` y `models/Role.js`.

---

## 1. Cuándo usar esta skill

- Un proyecto nuevo necesita login + control de acceso.
- Se quiere pasar de `if (user.isAdmin)` dispersos a un modelo ordenado.
- Se quiere que los roles sean editables en runtime desde un panel (no hardcodeados).
- Se debe auditar o endurecer la seguridad de autorización existente.

## 2. Conceptos y vocabulario

| Concepto | Pregunta que responde | Ejemplo |
|---|---|---|
| **Autenticación (AuthN)** | ¿Quién eres? | Login con email + contraseña, token |
| **Autorización (AuthZ)** | ¿Qué puedes hacer? | Puede `invoice:create`, no `invoice:delete` |
| **Usuario** | La identidad (persona o servicio) | `ana@empresa.com` |
| **Rol** | Agrupación nombrada de permisos | `admin`, `editor`, `viewer` |
| **Permiso** | Una acción atómica sobre un recurso | `resource:action` |
| **Recurso** | La entidad protegida | `post`, `invoice`, `user` |
| **Alcance (scope)** | Sobre cuáles instancias aplica | `own` (propias) vs `any` (todas) |

**Regla de oro:** el código pregunta por **permisos**, nunca por **nombres de rol**. Los roles son solo un contenedor configurable de permisos.

```
Usuario ──(tiene 1..N)──▶ Rol ──(contiene N)──▶ Permiso ──(actúa sobre)──▶ Recurso
```

## 3. Modelo de datos

### 3.1 Mínimo viable (1 rol por usuario)

```
User
  id, email (único), passwordHash, name
  roleId → Role
  isActive (bool)            // desactivar sin borrar
  createdAt, updatedAt, lastLoginAt

Role
  id, name (único, normalizado), description
  permissions: string[]      // ["post:create", "post:update:own", ...]
  isSystem (bool)            // protegido: no renombrar ni eliminar
```

### 3.2 Normalizado (relacional, más flexible)

```
users(id, email, password_hash, is_active, ...)
roles(id, name, description, is_system)
permissions(id, key UNIQUE, description, group)
role_permissions(role_id, permission_id)        -- N:M
user_roles(user_id, role_id)                    -- N:M (si multi-rol)
```

### 3.3 ¿Cuál elegir?

| Situación | Modelo |
|---|---|
| Apps pequeñas/medianas, roles claros | 1 rol por usuario, permisos como array |
| Un usuario necesita combinar perfiles | Multi-rol (`user_roles`); permisos efectivos = unión |
| Multi-tenant (usuario con distinto rol por organización) | `memberships(user_id, org_id, role_id)` |
| Reglas por atributo (hora, monto, departamento) | Añadir ABAC encima (ver §9) |

## 4. Catálogo de permisos

### 4.1 Convención de nombres

```
<recurso>:<acción>[:<alcance>]
```

- Recurso en singular, minúsculas: `post`, `user`, `invoice`.
- Acciones estándar: `read`, `create`, `update`, `delete`, y específicas del dominio (`publish`, `approve`, `export`, `assign`).
- Alcance opcional: `own` (solo lo propio) / `any` (cualquiera). Si se omite, se asume `any`.

Ejemplos: `post:create`, `post:update:own`, `post:update:any`, `user:manage`, `invoice:approve`, `report:export`.

### 4.2 Reglas del catálogo

1. **Fuente única de verdad:** define todos los permisos en un solo archivo/tabla (constantes), no strings sueltos por el código.
2. **Granularidad útil:** ni `everything` ni 300 permisos. Una acción de negocio que se pueda otorgar/negar por separado = un permiso.
3. **Agrupa por recurso** para poder pintarlos ordenados en la UI del panel de roles.
4. **Nunca renombres** un permiso en producción sin migración de los roles que lo usan.

```js
// permissions.js — fuente única
export const PERMISSIONS = {
  POST_READ: 'post:read',
  POST_CREATE: 'post:create',
  POST_UPDATE_OWN: 'post:update:own',
  POST_UPDATE_ANY: 'post:update:any',
  POST_DELETE_ANY: 'post:delete:any',
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
};
```

## 5. Roles

### 5.1 Roles de sistema (semilla)

Crea al inicializar (seed idempotente) un conjunto base marcado `isSystem = true`:

| Rol | Intención típica |
|---|---|
| `superadmin` | Acceso total (ver bypass en §6.3) |
| `manager` | Gestiona contenido/operación, no seguridad (usuarios y roles) |
| `viewer` | Solo lectura |
| *(sin sesión)* `guest` | Acceso público, no es un rol almacenado |

Con solo estos tres roles no hace falta el alcance `own`/`any` por defecto: los permisos pueden ser simples (`recurso:acción`). Los alcances de §4 y §7.3 quedan como opción si más adelante se necesitan.

### 5.2 Reglas de gestión de roles

- Los roles de sistema **no se pueden eliminar ni renombrar** (sí se pueden ajustar sus permisos, salvo `superadmin`).
- **No se puede eliminar un rol con usuarios asignados** (o exige reasignación previa).
- Nombres únicos y normalizados (minúsculas, trim).
- Todo usuario nuevo recibe un **rol por defecto de mínimo privilegio** (`viewer`), nunca uno alto.
- Siempre debe existir **al menos un administrador activo**: bloquea degradar/desactivar/eliminar al último.

## 6. Flujo de autenticación

### 6.1 Registro y login

1. Validar entrada (email válido, contraseña con política mínima).
2. Guardar **hash** con algoritmo lento y con sal (`argon2id` o `bcrypt`, coste ≥ 10). Jamás texto plano ni MD5/SHA simple.
3. Login: comparar hash en tiempo constante; ante fallo, mensaje **genérico** ("Credenciales inválidas") para no revelar si el email existe.
4. Verificar `isActive` antes de emitir sesión.
5. Limitar intentos (rate limiting por IP + cuenta) para frenar fuerza bruta.

### 6.2 Sesión/tokens

| Estrategia | Úsala cuando | Notas |
|---|---|---|
| Cookie de sesión (server-side) | Apps web tradicionales/SSR | `HttpOnly`, `Secure`, `SameSite`; revocación inmediata |
| JWT access + refresh | APIs, SPAs, móvil | Access corto (5–15 min), refresh largo y **rotativo**, guardado hasheado en BD para poder revocar |

Buenas prácticas JWT:
- El token lleva solo `sub` (id de usuario) y expiración; **no** metas permisos dentro si necesitas que los cambios de rol apliquen al instante.
- En cada request, **recarga usuario + rol desde la BD (o caché con TTL corto)** y rechaza si `isActive = false`. Así desactivar a alguien o cambiar un rol surte efecto de inmediato.
- Refresh token en cookie `HttpOnly`; access token en memoria (no `localStorage` si se puede evitar).
- Logout = invalidar el refresh token en servidor.

### 6.3 Bypass del administrador

Dos enfoques válidos, elige uno y documéntalo:

- **Por nombre de rol** (`if role == 'superadmin' → permitir`): simple, pero acopla código al nombre. Aceptable para un único rol superusuario protegido (`isSystem`).
- **Por comodín de permiso** (`*` o `admin:all`): más limpio; el chequeo es uniforme y no hay casos especiales.

## 7. Autorización: el pipeline de una petición

```
Request
  │
  ▼
[1] Autenticar     → ¿token/sesión válidos? usuario existe y activo?   → si no: 401
  │
  ▼
[2] Autorizar      → ¿el rol tiene el permiso requerido?              → si no: 403
  │
  ▼
[3] Propiedad      → si el permiso es ':own', ¿el recurso es suyo?    → si no: 403
  │
  ▼
[4] Validar/ejecutar la lógica de negocio
```

### 7.1 Códigos de respuesta

| Código | Significado | Cuándo |
|---|---|---|
| `401 Unauthorized` | No autenticado | Sin token, token inválido/expirado, usuario inactivo |
| `403 Forbidden` | Autenticado pero sin permiso | Falta permiso o no es dueño del recurso |
| `404 Not Found` | (opcional) Ocultar existencia | Para recursos privados, evita filtrar que existen |

### 7.2 Middleware / guard genérico

```js
// 1) Autenticación
function requireAuth(req, res, next) {
  const user = resolveUserFromToken(req);        // carga usuario + rol
  if (!user || !user.isActive) return res.status(401).end();
  req.user = user;
  next();
}

// 2) Autorización por permiso (cualquiera de los indicados)
const requirePermission = (...needed) => (req, res, next) => {
  if (!req.user) return res.status(401).end();
  const granted = req.user.role.permissions;
  if (granted.includes('*')) return next();                  // superadmin
  if (!needed.some(p => granted.includes(p))) return res.status(403).end();
  next();
};

// Uso en rutas
router.post('/invoices',     requireAuth, requirePermission('invoice:create'), createInvoice);
router.delete('/invoices/:id', requireAuth, requirePermission('invoice:delete:any'), removeInvoice);
```

### 7.3 Permisos con alcance `own` vs `any`

El middleware no conoce el recurso; el chequeo de propiedad va en el controlador/servicio:

```js
async function updatePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).end();

  const perms = req.user.role.permissions;
  const canAny = perms.includes('post:update:any') || perms.includes('*');
  const canOwn = perms.includes('post:update:own') && post.authorId === req.user.id;

  if (!canAny && !canOwn) return res.status(403).end();
  // ... actualizar
}
```

Centraliza esto en una función reutilizable `can(user, action, resource?)` para no duplicar la lógica.

```js
function can(user, permission, resource) {
  const p = user.role.permissions;
  if (p.includes('*') || p.includes(`${permission}:any`) || p.includes(permission)) return true;
  if (resource && p.includes(`${permission}:own`)) return resource.ownerId === user.id;
  return false;
}
```

### 7.4 Rutas públicas con contenido enriquecido

Usa una autenticación **opcional**: si hay token válido se adjunta el usuario (para mostrar borradores propios, por ejemplo); si no, se continúa como anónimo. Un token inválido en ruta opcional se ignora, no devuelve 401.

## 8. Frontend: control de interfaz

> **La UI solo oculta; el backend decide.** Ocultar un botón NO es seguridad. Toda regla debe reforzarse en el servidor.

- Al iniciar sesión, expón al cliente `user` + `permissions` (endpoint `/me`).
- Helper reutilizable:

```js
const can = (permission) =>
  me.permissions.includes('*') || me.permissions.includes(permission);

// Componente / directiva
<Can permission="invoice:delete:any"><DeleteButton/></Can>
```

- **Guard de rutas/páginas:** redirige a login si no hay sesión; muestra "Sin permiso" (403) si falta el permiso.
- **Menú dinámico:** filtra los ítems de navegación según permisos.
- Maneja globalmente `401` (refrescar token o ir a login) y `403` (aviso de acceso denegado).

## 9. Extensiones (cuando RBAC simple no alcanza)

| Necesidad | Técnica |
|---|---|
| Distinto rol por organización/proyecto | Roles con *scope* de tenant (`membership`) |
| Reglas por atributo (monto < X, mismo departamento, horario) | **ABAC**: policy con condiciones sobre usuario/recurso/contexto |
| Jerarquía de roles (`manager` hereda de `member`) | Herencia de roles; permisos efectivos = propios + heredados |
| Permisos por registro concreto (compartir documento con X) | **ACL** por recurso (`resource_shares`) o ReBAC |
| Denegaciones explícitas | Lista `deny` que gana sobre `allow` (usar con cuidado) |
| Acceso temporal / elevación | Asignación con `expiresAt`, con registro de auditoría |

Orden de evaluación recomendado: **deny explícito → allow explícito → denegar por defecto.**

## 10. Seguridad: principios obligatorios

1. **Denegar por defecto:** si una ruta no declara permiso, debe requerir al menos autenticación; nunca quedar abierta por olvido.
2. **Mínimo privilegio:** roles y rol por defecto con lo estrictamente necesario.
3. **Autorización siempre en servidor**, en cada request, no solo al login.
4. **Anti-escalada de privilegios:** un usuario no puede asignarse a sí mismo un rol/permiso superior ni editar roles con más poder que el suyo. Validar `role` en el payload de registro/perfil (mass assignment): ignorarlo salvo para quien tenga `user:manage`.
5. **Protege lo irreversible:** último admin, roles de sistema, auto-eliminación/desactivación de la propia cuenta admin.
6. **No filtres información:** mensajes genéricos en login; considera `404` en lugar de `403` para recursos privados.
7. **Nunca devuelvas** `passwordHash`, tokens de refresh ni datos internos en las respuestas (usa DTO/`select`).
8. **Auditoría:** registra quién cambió qué rol/permiso y cuándo (`audit_log`), además de logins fallidos y accesos denegados.
9. **Protege contra IDOR:** nunca confíes en un `id` de la URL; verifica pertenencia/permiso sobre ese recurso concreto.
10. **Sesiones:** expiración, rotación de refresh, revocación al cambiar contraseña o desactivar usuario.

## 11. Administración (panel)

Pantallas/endpoints típicos, cada uno protegido con su permiso:

| Módulo | Operaciones | Permiso sugerido |
|---|---|---|
| Usuarios | listar, ver, editar, activar/desactivar, asignar rol | `user:read`, `user:update`, `user:manage` |
| Roles | crear, editar permisos, eliminar (si no es sistema ni tiene usuarios) | `role:manage` |
| Permisos | listar catálogo agrupado (solo lectura; los define el código) | `role:manage` |
| Perfil propio | editar nombre/contraseña (nunca su rol) | autenticado |

UX del editor de roles: lista de permisos agrupados por recurso con checkboxes; deshabilitar edición en roles de sistema protegidos; mostrar cuántos usuarios tiene cada rol.

## 12. Estrategia de pruebas

Matriz mínima por cada endpoint protegido:

| Caso | Esperado |
|---|---|
| Sin token | 401 |
| Token expirado/inválido | 401 |
| Usuario inactivo | 401 |
| Usuario sin el permiso | 403 |
| Usuario con permiso `:own` sobre recurso ajeno | 403 |
| Usuario con permiso `:own` sobre recurso propio | 2xx |
| Usuario con permiso `:any` | 2xx |
| Superadmin | 2xx |
| Intento de asignarse rol por mass assignment | Ignorado/403 |
| Eliminar último admin / rol de sistema / rol con usuarios | Rechazado |

Prueba también que **cambiar los permisos de un rol afecta de inmediato** a los usuarios que lo tienen.

## 13. Checklist de implementación

- [ ] Catálogo de permisos centralizado y con convención `recurso:acción[:alcance]`
- [ ] Modelo `User` + `Role` (+ tablas puente si hay N:M)
- [ ] Seed idempotente de roles de sistema y primer admin
- [ ] Hash seguro de contraseñas + rate limiting en login
- [ ] Middleware `requireAuth` (carga usuario + rol, valida `isActive`)
- [ ] Middleware `requirePermission(...)` con 401 vs 403 correctos
- [ ] Función `can(user, permission, resource)` para alcance `own`/`any`
- [ ] Todas las rutas declaran permiso (denegar por defecto)
- [ ] Protecciones: último admin, roles de sistema, anti mass-assignment
- [ ] Endpoint `/me` que devuelve usuario + permisos
- [ ] Guards y helper `can` en el frontend (solo cosmético)
- [ ] Panel de usuarios y roles con permisos agrupados
- [ ] Auditoría de cambios de acceso
- [ ] Tests de la matriz del §12

## 14. Errores comunes (anti-patrones)

| ❌ Anti-patrón | ✅ Corrección |
|---|---|
| `if (user.role === 'admin')` repartido por todo el código | Preguntar por permisos con `can()` / middleware |
| Confiar en que la UI oculte botones | Validar siempre en el servidor |
| Meter el rol/permisos dentro del JWT y no recargar | Resolver rol desde BD/caché corta por request |
| Aceptar `role` desde el body de registro | Ignorarlo; asignar rol por defecto |
| Permisos como strings mágicos sueltos | Constantes en un catálogo único |
| Devolver 403 cuando no hay sesión | 401 sin sesión, 403 sin permiso |
| Borrar usuarios con datos relacionados | Desactivar (`isActive=false`) / soft delete |
| Rutas nuevas sin protección por olvido | Denegar por defecto + test que recorra las rutas |

## 15. Aplicarlo a un software que ya existe (login y usuarios ya hechos)

Sí se puede, y es el caso más común. **No toques el login/signup**: la autenticación ya resuelve "quién eres"; solo se añade la capa de "qué puedes hacer" encima. Hazlo por fases para no romper a los usuarios actuales.

### Fase 0 — Inventario
- Lista las rutas/endpoints/pantallas y qué hace cada una (leer, crear, editar, borrar...).
- Identifica cómo el login deja disponible al usuario actual en cada request (`req.user`, sesión, token). Ese es tu punto de enganche.

### Fase 1 — Datos (aditivo, sin romper nada)
1. Crea la tabla/colección `Role` con `permissions` y `isSystem`.
2. Añade a `User` un campo `roleId`, **nullable al inicio**.
3. Siembra (seed idempotente) los roles `superadmin`, `manager`, `viewer` y el catálogo de permisos.

### Fase 2 — Migración de usuarios existentes
Decide una regla de mapeo y ejecútala en un script de migración **reversible** (haz backup antes):

| Usuarios actuales | Rol asignado |
|---|---|
| El/los dueños o administradores reales (los eliges a mano) | `superadmin` |
| Quienes ya gestionaban cosas | `manager` |
| Todos los demás | `viewer` (mínimo privilegio) |

Si ya tenías un flag tipo `isAdmin`/`type`, úsalo para el mapeo y luego déjalo de usar. Después de migrar, verifica que **no queden usuarios con `roleId` nulo** y entonces hazlo obligatorio. Asegura que quede al menos un `superadmin`.

### Fase 3 — Hacer cumplir en el backend
1. Asegura que el middleware de autenticación existente cargue el usuario **con su rol**.
2. Añade `requirePermission(...)` (§7.2) y aplícalo ruta por ruta, empezando por las más críticas (usuarios, roles, borrados).
3. Mientras migras puedes tener un modo "solo registrar": si faltaría el permiso, loguea la denegación pero deja pasar. Revisa los logs unos días para detectar permisos mal asignados y luego activa el bloqueo real.
4. Termina con denegar por defecto: ninguna ruta sin declarar permiso.

### Fase 4 — Frontend y administración
- Endpoint `/me` que devuelva usuario + permisos; helper `can()` y menú/botones condicionales (§8).
- Panel para asignar rol a usuarios y editar permisos de roles (§11).

### Fase 5 — Cierre
- Asignar rol por defecto `viewer` en el **signup existente** (y ignorar cualquier `role` que venga en el body).
- Ejecutar la matriz de pruebas (§12) y quitar el código viejo de chequeo por flags.

### Precauciones propias de software ya en producción
- **Compatibilidad de tokens:** si los JWT actuales no llevan rol, no hace falta invalidarlos: el rol se resuelve desde la BD en cada request.
- **Despliegue en orden:** primero migración de datos, luego código que lee roles, al final el bloqueo estricto.
- **Plan de reversa:** conserva el backup y el script inverso; mantén un `superadmin` de emergencia.
- **Comunica el cambio** a quienes puedan perder acceso (los que quedan como `viewer`).

## 16. Adaptación rápida a un nuevo dominio

1. Lista los **recursos** del sistema (ej. e-commerce: `product`, `order`, `customer`, `coupon`).
2. Para cada recurso define **acciones** y si necesitan alcance `own`/`any`.
3. Agrupa en **roles** por responsabilidad real. Base recomendada: `superadmin`, `manager`, `viewer`; añade más solo si hay una necesidad concreta.
4. Implementa el catálogo (§4), los modelos (§3) y el pipeline (§7).
5. Marca como `isSystem` los roles que el código da por sentados.
6. Aplica el checklist (§13) y la matriz de pruebas (§12).

Ejemplo de mapeo de dominios:

| Dominio | Recursos | Roles típicos |
|---|---|---|
| Blog / CMS | post, comment, media, user | superadmin, manager, viewer |
| E-commerce | product, order, customer, coupon | superadmin, manager, viewer |
| ERP / Facturación | invoice, client, report, payment | superadmin, manager, viewer |
| Salud | patient, record, appointment | superadmin, manager, viewer |
| SaaS multi-tenant | project, member, billing | superadmin, manager, viewer (por organización) |

Los tres roles base cubren la mayoría de casos; solo añade roles extra cuando un dominio lo exija de verdad.
