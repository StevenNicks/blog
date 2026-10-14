import { cn } from "@/lib/utils"

// Fondo fijo a pantalla completa: cuadrícula de líneas finas con un punto en
// cada intersección. Usa `currentColor`, así que sigue el modo claro/oscuro
// como el resto de la app. Es decorativo (`aria-hidden`), queda detrás de todo
// (`-z-10`) y nunca intercepta eventos del puntero.
// `contained` lo posiciona dentro de su contenedor (para vistas previas).
const CELL = 80

// Desvanece la cuadrícula hacia los bordes y esquinas (opaca en el centro,
// invisible en el borde) en lugar de cortarla en seco en el borde del viewport.
const EDGE_FADE_MASK = "radial-gradient(ellipse 80% 80% at 50% 50%, black 35%, transparent 85%)"

// Bloques de celdas contiguas resaltados en color primary (líneas y puntos),
// como secuencias rectangulares y no celdas sueltas. `col`/`row` es la celda de
// la esquina superior izquierda; `cols`/`rows`, cuántas celdas abarca. Posiciones
// fijas para que el fondo sea estable entre renders (sin diferencias de
// hidratación); la máscara los atenúa hacia los bordes.
const ACCENT_BLOCKS = [
  { col: 3, row: 2, cols: 3, rows: 1 },
  { col: 16, row: 9, cols: 4, rows: 2 },
]

// Segmentos sueltos de la rejilla pintados en primary (solo línea, sin tinte),
// que prolongan los bloques. Coordenadas en puntos de la rejilla [x1, y1, x2, y2];
// cada segmento es horizontal (y1 === y2) o vertical (x1 === x2).
const ACCENT_LINES: [number, number, number, number][] = [
  // Arriba a la izquierda: encima y debajo del bloque.
  [4, 1, 6, 1],
  [4, 1, 4, 2],
  [5, 1, 5, 2],
  [3, 4, 5, 4],
  [4, 3, 4, 4],
  [5, 3, 5, 4],
  // Abajo a la derecha: encima del bloque y un tramo a su izquierda.
  [17, 8, 19, 8],
  [17, 8, 17, 9],
  [18, 8, 18, 9],
  [19, 7, 19, 9],
  [15, 10, 16, 10],
]

// Celdas que las líneas anteriores cierran por completo (con el borde del bloque
// como cuarto lado) y que llevan el mismo tinte que los bloques. [col, fila, columnas, filas].
const ACCENT_FILLS: [number, number, number, number][] = [
  [4, 1, 1, 1],
  [4, 3, 1, 1],
  [17, 8, 2, 1],
]

// Tinte de relleno (primary) de los bloques y las celdas cerradas.
const TINT = "color-mix(in oklab, currentColor 14%, transparent)"

// Margen para que los puntos (radio 2px) de los bordes del bloque no se recorten.
const PAD = 2

export function DotGridBackground({ contained = false }: { contained?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none inset-0 overflow-hidden bg-background",
        contained ? "absolute" : "fixed -z-10"
      )}
    >
      <div
        className="absolute inset-0 text-foreground/10"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px),
            radial-gradient(circle, currentColor 2px, transparent 2px)
          `,
          backgroundSize: `${CELL}px ${CELL}px`,
          // Un radial-gradient se centra en su propia celda, no en la esquina:
          // se desplaza media celda para alinear el punto con las intersecciones
          // (+0.5px porque el trazo de 1px está centrado en el punto de la rejilla).
          backgroundPosition: `0 0, 0 0, ${-CELL / 2 + 0.5}px ${-CELL / 2 + 0.5}px`,
          maskImage: EDGE_FADE_MASK,
          WebkitMaskImage: EDGE_FADE_MASK,
        }}
      />
      <div
        className="absolute inset-0 text-primary"
        style={{ maskImage: EDGE_FADE_MASK, WebkitMaskImage: EDGE_FADE_MASK }}
      >
        {ACCENT_BLOCKS.map(({ col, row, cols, rows }) => (
          <div
            key={`${col}-${row}`}
            className="absolute"
            // Repite la misma rejilla que el fondo, pero solo dentro del bloque.
            // El +1 deja sitio a la última línea (derecha/inferior). Las líneas se
            // recortan a la caja de contenido (sin sobresalir) y los puntos usan
            // el padding (PAD) para no cortarse en los bordes.
            style={{
              left: col * CELL - PAD,
              top: row * CELL - PAD,
              width: cols * CELL + 1 + PAD * 2,
              height: rows * CELL + 1 + PAD * 2,
              padding: PAD,
              backgroundOrigin: "content-box, content-box, padding-box, content-box",
              backgroundClip: "content-box, content-box, padding-box, content-box",
              // La última capa es el tinte (`TINT`) que rellena el bloque
              // por dentro de sus líneas, como el `bg-primary/5` de otras variantes.
              backgroundImage: `
                linear-gradient(to right, color-mix(in oklab, currentColor 45%, transparent) 1px, transparent 1px),
                linear-gradient(to bottom, color-mix(in oklab, currentColor 45%, transparent) 1px, transparent 1px),
                radial-gradient(circle, color-mix(in oklab, currentColor 80%, transparent) 2px, transparent 2px),
                linear-gradient(${TINT}, ${TINT})
              `,
              backgroundSize: `${CELL}px ${CELL}px, ${CELL}px ${CELL}px, ${CELL}px ${CELL}px, 100% 100%`,
              backgroundPosition: `0 0, 0 0, ${PAD - CELL / 2 + 0.5}px ${PAD - CELL / 2 + 0.5}px, 0 0`,
            }}
          />
        ))}
        {ACCENT_FILLS.map(([col, row, cols, rows]) => (
          <div
            key={`fill-${col}-${row}`}
            className="absolute"
            // Rellena por dentro de las líneas (sin pisarlas): +1/-1 salta el trazo.
            style={{
              left: col * CELL + 1,
              top: row * CELL + 1,
              width: cols * CELL - 1,
              height: rows * CELL - 1,
              backgroundColor: TINT,
            }}
          />
        ))}
        {ACCENT_LINES.map(([x1, y1, x2, y2]) => (
          <div
            key={`${x1}-${y1}-${x2}-${y2}`}
            className="absolute"
            // Trazo de 1px que arranca en la línea de la rejilla ([n·CELL, n·CELL + 1)).
            style={{
              left: x1 * CELL,
              top: y1 * CELL,
              width: (x2 - x1) * CELL + 1,
              height: (y2 - y1) * CELL + 1,
              backgroundColor: "color-mix(in oklab, currentColor 45%, transparent)",
            }}
          />
        ))}
      </div>
    </div>
  )
}
