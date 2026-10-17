---
name: loading-states
description: Reglas para elegir e implementar estados de carga (spinner, barra de progreso, skeleton, dots) en la app del blog. Usar siempre que se cree o modifique una página, componente, formulario, subida de archivos, loading.tsx o cualquier flujo asíncrono en blog-frontend.
---

# Estados de carga en blog-frontend

Aplica estas reglas al crear o cambiar cualquier página, módulo o componente que espere datos o ejecute una acción asíncrona. Basado en la guía "Using Loaders" de Nina Skrbic, adaptada a este proyecto.

## 1. Qué loader usar

Pregúntate en este orden:

| Situación | Loader | Componente del proyecto |
|---|---|---|
| Se carga **contenido** de una página o lista (posts, usuarios, perfil, imágenes) | **Skeleton** | `@/components/ui/skeleton` |
| El usuario ejecutó una **acción** (login, guardar, enviar, borrar) | **Spinner inline** en el botón + `disabled` | `@/components/ui/spinner` |
| El avance es **medible** (subida de imagen/avatar) | **Barra determinada** | `ui/progress` (shadcn) |
| Proceso activo de duración desconocida a nivel de ruta | Barra fina **indeterminada** (opcional) | — |
| Resolver la sesión (guard de auth) | Loader a pantalla completa, con retraso | `@/components/loader` |
| "Alguien está escribiendo" (chat/comentarios en vivo) | **Dots** | solo si existe esa funcionalidad |

Nunca uses un overlay de pantalla completa para cargar contenido de una página.

## 2. Patrones del proyecto (mantenerlos)

- **Botón con acción:** `disabled={loading}` y `{loading ? <Spinner data-icon="inline-start" /> : null}` dentro del `Button`. El texto del botón puede cambiar ("Guardando…"), pero el ancho no debe saltar.
- **Listas del dashboard:** `loading ? <Skeleton key={i} className="h-N w-full" /> ×N : contenido`, con la misma altura aproximada que el elemento real.
- **Recarga con datos ya visibles:** no volver a mostrar el skeleton; mantener el contenido y mostrar un indicador pequeño (spinner discreto) mientras se actualiza.
- **`loading.tsx` del sitio público:** devolver un skeleton con la forma del contenido final, dentro del layout (header y footer visibles). No usar `<Loader />` aquí.
- **`Loader`** (`fixed inset-0`) queda reservado para `require-auth`.

## 3. Reglas de calidad

1. **El skeleton debe parecerse al resultado final** (mismas alturas, columnas y número de filas aproximado). Si no coincide, genera saltos de layout (CLS).
2. **Reserva espacio** mientras carga: no devolver `null` donde luego aparecerá contenido (ej. botones de sesión en el header). Usa un `Skeleton` del mismo tamaño.
3. **Tiempos:** no mostrar nada en cargas < ~200 ms (evita parpadeos) y, una vez visible, mantenerlo un mínimo (~400 ms). Para guards globales, retrasa la aparición.
4. **Escalada:** si la espera pasa de unos segundos, añadir mensaje ("Sigue cargando…") o permitir cancelar/reintentar.
5. **Todo loader necesita estados finales:** éxito (toast o contenido), error (mensaje + reintento) y vacío. Nunca dejar al usuario atascado en un loader sin salida.
6. **Honestidad:** nada de barras falsas, ni que se estanquen en 99 % ni retrocedan. Si no se puede medir, usar indeterminada o spinner.
7. **Una sola fuente de verdad por patrón:** reutiliza `Spinner`, `Skeleton`, `Loader`; no crees spinners ad hoc ni dupliques estilos.
8. **No bloquear de más:** deshabilita solo el control que ejecuta la acción, no toda la pantalla.

## 4. Accesibilidad (obligatoria)

- Contenedor con skeletons: `aria-busy="true"` y los placeholders con `aria-hidden`.
- Spinner suelto: `role="status"` con texto en **español** (`aria-label="Cargando"`). Dentro de un botón, `aria-hidden`: el propio botón comunica el estado.
- Barras: `role="progressbar"` con `aria-valuemin/max/now` (omitir `aria-valuenow` si es indeterminada).
- Dots/"escribiendo": región `aria-live="polite"` con texto.
- Toda animación (`animate-spin`, `animate-pulse`, shimmer, dots) debe respetar `prefers-reduced-motion` (`motion-reduce:animate-none`).

## 5. Checklist antes de dar por terminado un cambio

- [ ] ¿Elegí el loader correcto según la tabla de la sección 1?
- [ ] ¿Hay estado de carga, de error y vacío?
- [ ] ¿Mi skeleton coincide con el layout final y no hay saltos?
- [ ] ¿En recargas mantuve el contenido visible en vez de volver al skeleton?
- [ ] ¿Los botones de acción se deshabilitan y muestran `Spinner`?
- [ ] ¿Cumple la sección de accesibilidad (aria, español, reduced-motion)?
- [ ] ¿Reutilicé los componentes existentes en vez de crear nuevos?

## Decisiones tomadas

- **Barra de progreso en subidas: descartada por ahora.** La única subida es `uploadImages` (`images/page.tsx` y `image-picker-dialog.tsx`), con archivos de máx. 5 MB (`UPLOAD_MAX_MB`) en servidor local: dura menos de un segundo, así que basta el spinner en el botón. `fetch` no expone progreso de subida; habría que usar `XMLHttpRequest`/axios y adaptar `lib/api/client.ts`. Reconsiderar solo si sube el límite de tamaño, se permiten vídeos/PDF, hay usuarios con conexiones lentas o subidas masivas.
- **Dots:** no aplican mientras no exista chat ni comentarios en vivo.
- **Exentos de las reglas de tiempo (§3.3):** los placeholders con espacio reservado (p. ej. el `Skeleton` del header, de las estadísticas de la home o del formulario de comentarios) y el `Loader` de `require-auth`. Los primeros ya ocupan su sitio, así que mostrarlos al instante no provoca parpadeo ni saltos; el `Loader` solo tiene retraso de aparición, sin duración mínima, porque se desmonta en cuanto se resuelve la sesión. Los skeletons de contenido de listas y páginas sí usan `LoadingGate` (retraso ~200 ms, mínimo ~400 ms), que mantiene la altura del contenedor durante el retraso.
- **Ya aplicado:** skeletons en `loading.tsx` del sitio (`components/loading/`), espacio reservado en el header y en comentarios, `Spinner` accesible y `Loader` con retraso (solo `require-auth`).

## Nota sobre Next.js

Este proyecto usa una versión de Next.js con cambios incompatibles (ver `AGENTS.md`). Antes de escribir o modificar `loading.tsx`, `Suspense` o streaming, consulta `node_modules/next/dist/docs/`.