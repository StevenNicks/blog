const sanitizeHtml = require('sanitize-html');

// Contenido enriquecido: permite el set de etiquetas típico de un editor WYSIWYG
// (párrafos, títulos, listas, imágenes, enlaces, videos embebidos) sin abrir la
// puerta a scripts u otros vectores XSS.
const sanitizeRichContent = (dirty) =>
  sanitizeHtml(dirty, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'h1',
      'h2',
      'span',
      'u',
      'video',
      'iframe',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
      a: ['href', 'name', 'target', 'rel'],
      span: ['style'],
      video: ['src', 'controls', 'width', 'height'],
      iframe: ['src', 'allowfullscreen', 'frameborder', 'width', 'height'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
    allowedSchemes: ['http', 'https', 'data', 'mailto'],
  });

const stripToExcerpt = (html, length = 200) => {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > length ? `${text.slice(0, length)}…` : text;
};

module.exports = { sanitizeRichContent, stripToExcerpt };
