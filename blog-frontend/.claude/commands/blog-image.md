---
description: Genera la imagen de portada para un post del blog
argument-hint: "<título del post>" <categoría>
---
Crea la imagen de portada para el post: $ARGUMENTS

1. Usa `templates/docker-cover.html` como plantilla base. No cambies
   colores, tipografía, fondo ni layout.
2. Cambia solo:
   - La etiqueta superior por la categoría del post
   - El título (máximo 3 líneas; resalta en verde la parte final)
   - El texto del recuadro de terminal por un comando o snippet
     relacionado con el tema
   - La ilustración de la derecha por formas simples relacionadas
     con el tema (no uses logos de marcas)
3. Guarda el HTML en `templates/covers/<slug>.html`.
4. Renderízalo a PNG de 1200x630 con Playwright y guárdalo en
   `public/blog/<slug>.png`.
5. Abre el PNG, verifica que el texto no se corte ni se salga,
   y corrige si hace falta.
6. Dime la ruta final de la imagen.