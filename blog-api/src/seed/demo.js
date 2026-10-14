require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Role = require('../models/Role');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { sanitizeRichContent, stripToExcerpt } = require('../utils/sanitize');

// Datos de ejemplo para validar el blog de punta a punta.
//   npm run seed:demo          -> crea (o recrea) los datos de ejemplo
//   npm run seed:demo -- --clean -> elimina todo lo creado por este script
// Todo lo demo se identifica por el dominio de email @demo.blog.
const DEMO_DOMAIN = '@demo.blog';
const DEMO_PASSWORD = 'Demo12345!';

const daysAgo = (d, h = 0) => new Date(Date.now() - d * 86400000 - h * 3600000);

const users = [
  { key: 'lucia', name: 'Lucía Fernández', role: 'author', bio: 'Desarrolladora frontend. Escribo sobre React, CSS y accesibilidad.' },
  { key: 'martin', name: 'Martín Ortega', role: 'author', bio: 'Backend dev y entusiasta de las bases de datos. Café, Node.js y mucho Mongo.' },
  { key: 'sofia', name: 'Sofía Ramírez', role: 'editor', bio: 'Editora del blog. Me encargo de que todo se lea bien.' },
  { key: 'carlos', name: 'Carlos Mendoza', role: 'reader', bio: 'Estudiante de ingeniería de sistemas.' },
  { key: 'valentina', name: 'Valentina Cruz', role: 'reader', bio: 'Diseñadora UX en transición a código.' },
  { key: 'diego', name: 'Diego Salazar', role: 'reader', bio: '' },
  { key: 'camila', name: 'Camila Herrera', role: 'reader', bio: 'Freelance. Siempre aprendiendo algo nuevo.' },
  { key: 'andres', name: 'Andrés Paredes', role: 'reader', bio: 'DevOps por el día, gamer por la noche.' },
  { key: 'paula', name: 'Paula Giménez', role: 'reader', bio: 'Product manager curiosa.' },
];

const posts = [
  {
    key: 'hooks',
    title: 'Guía práctica de React Hooks: de useState a hooks personalizados',
    author: 'lucia',
    category: 'Frontend',
    tags: ['react', 'hooks', 'javascript'],
    status: 'published',
    daysAgo: 21,
    views: 842,
    content: `
<p>Desde que llegaron los hooks, escribir componentes en React cambió por completo. En esta guía repasamos los más importantes y terminamos creando uno propio.</p>
<h2>useState: el estado local</h2>
<p>Es el hook más básico. Devuelve el valor actual y una función para actualizarlo:</p>
<pre><code>const [count, setCount] = useState(0);</code></pre>
<p>Un error muy común es mutar el estado directamente. Siempre usa el setter y, si el nuevo valor depende del anterior, pasa una función.</p>
<h2>useEffect: efectos secundarios</h2>
<p>Se ejecuta después del render. El <strong>array de dependencias</strong> controla cuándo se vuelve a ejecutar:</p>
<ul>
  <li>Sin array: en cada render.</li>
  <li>Array vacío: solo al montar.</li>
  <li>Con valores: cuando alguno cambia.</li>
</ul>
<h2>Tu primer hook personalizado</h2>
<p>Un hook personalizado es solo una función que empieza con <em>use</em> y que reutiliza otros hooks. Por ejemplo, <code>useLocalStorage</code> o <code>useDebounce</code> te ahorran mucho código repetido.</p>
<blockquote>Si copias y pegas la misma lógica con hooks en dos componentes, ya tienes un hook personalizado esperando nacer.</blockquote>
<p>¿Qué hook personalizado usas más en tus proyectos? Cuéntamelo en los comentarios.</p>`,
    comments: [
      { a: 'carlos', c: 'Muy buena explicación del array de dependencias, por fin lo entendí. Siempre se me olvidaba qué pasaba con el array vacío.', d: 20 },
      { a: 'lucia', c: '¡Gracias Carlos! Es de los errores más comunes al empezar, pasa en todos lados.', d: 20, reply: 0 },
      { a: 'valentina', c: '¿Podrías hacer un post sobre useReducer? Siempre dudo cuándo conviene usarlo en lugar de useState.', d: 19 },
      { a: 'lucia', c: 'Anotado, Valentina. Lo tengo en la lista para el próximo mes. Regla rápida: si tienes varios valores que cambian juntos o la lógica de actualización es compleja, useReducer.', d: 19, reply: 2 },
      { a: 'diego', c: 'Yo uso useDebounce en todos mis buscadores, mejora muchísimo la experiencia y baja las peticiones al servidor.', d: 17 },
      { a: 'andres', c: 'Un detalle: en el ejemplo de useEffect conviene recordar la función de limpieza para suscripciones y timers. Sin eso aparecen fugas de memoria.', d: 15 },
      { a: 'lucia', c: 'Totalmente de acuerdo, Andrés. Me lo apunto para ampliar esa sección.', d: 15, reply: 5 },
      { a: 'camila', c: 'Compra barato SEO y gana dinero rápido en http://spam-example.invalid', d: 10, status: 'spam' },
    ],
  },
  {
    key: 'mongo',
    title: 'Cinco consejos para indexar MongoDB sin morir en el intento',
    author: 'martin',
    category: 'Backend',
    tags: ['mongodb', 'bases-de-datos', 'rendimiento'],
    status: 'published',
    daysAgo: 14,
    views: 615,
    content: `
<p>Los índices son la diferencia entre una consulta de 5 ms y una de 5 segundos. Después de varios años trabajando con MongoDB, estos son los consejos que más me han servido.</p>
<h2>1. Mide antes de indexar</h2>
<p>Usa <code>explain("executionStats")</code> para ver si tu consulta hace un <em>COLLSCAN</em>. Si examina miles de documentos para devolver diez, falta un índice.</p>
<h2>2. El orden en índices compuestos importa</h2>
<p>La regla <strong>ESR</strong> (Equality, Sort, Range) es un buen punto de partida: primero los campos con igualdad, luego los de ordenamiento y al final los de rango.</p>
<h2>3. No indexes todo</h2>
<p>Cada índice ocupa memoria y ralentiza las escrituras. Revisa periódicamente cuáles no se usan con <code>$indexStats</code>.</p>
<h2>4. Aprovecha los índices parciales</h2>
<p>Si solo consultas documentos publicados, indexa únicamente esos y ahorra espacio.</p>
<h2>5. Usa TTL para datos temporales</h2>
<p>Sesiones, tokens y logs pueden expirar solos con un índice TTL.</p>
<p>Si quieres que profundice en alguno de estos puntos, dímelo abajo.</p>`,
    comments: [
      { a: 'diego', c: 'El punto 3 me salvó. Tenía como 12 índices en una colección y la mitad no se usaba. Después de limpiar mejoraron las escrituras notablemente.', d: 13 },
      { a: 'martin', c: 'Qué bueno, Diego. $indexStats es de las herramientas más subestimadas.', d: 13, reply: 0 },
      { a: 'carlos', c: '¿La regla ESR aplica igual en Atlas o hay alguna diferencia?', d: 12 },
      { a: 'martin', c: 'Aplica igual, Carlos. Atlas además te sugiere índices con el Performance Advisor, aunque conviene revisarlos antes de crearlos a ciegas.', d: 12, reply: 2 },
      { a: 'paula', c: 'No soy técnica, pero me quedó clarísimo por qué a veces las búsquedas del producto se vuelven lentas. Se lo voy a pasar al equipo.', d: 9 },
      { a: 'andres', c: 'Sumo un consejo: crear índices en producción con la colección grande puede ser pesado. Mejor hacerlo en horas de poco tráfico.', d: 7 },
    ],
  },
  {
    key: 'a11y',
    title: 'Accesibilidad web: errores que cometemos sin darnos cuenta',
    author: 'lucia',
    category: 'Diseño',
    tags: ['accesibilidad', 'ux', 'html'],
    status: 'published',
    daysAgo: 8,
    views: 478,
    content: `
<p>Una web accesible no es un extra: es una web que funciona para más personas. Estos son los errores que más veo en revisiones de código.</p>
<h2>Imágenes sin texto alternativo</h2>
<p>Todo <code>&lt;img&gt;</code> informativo necesita un atributo <code>alt</code> que describa su contenido. Si es decorativa, déjalo vacío (<code>alt=""</code>).</p>
<h2>Contraste insuficiente</h2>
<p>El texto gris claro sobre fondo blanco se ve elegante, pero cuesta leerlo. Apunta a una relación de contraste mínima de <strong>4.5:1</strong>.</p>
<h2>Botones que no son botones</h2>
<p>Un <code>&lt;div onClick&gt;</code> no recibe foco con teclado ni lo anuncian los lectores de pantalla. Usa <code>&lt;button&gt;</code> y listo.</p>
<h2>Foco invisible</h2>
<p>Quitar el <em>outline</em> sin ofrecer una alternativa deja a los usuarios de teclado perdidos.</p>
<ol>
  <li>Prueba tu sitio navegando solo con Tab.</li>
  <li>Revisa el contraste con una herramienta automática.</li>
  <li>Activa un lector de pantalla al menos una vez.</li>
</ol>`,
    comments: [
      { a: 'valentina', c: 'Como diseñadora, el tema del contraste me dio un poco de vergüenza. Voy a revisar mis paletas esta semana.', d: 7 },
      { a: 'lucia', c: 'Nos pasa a todos, Valentina. Lo importante es empezar a medirlo.', d: 7, reply: 0 },
      { a: 'camila', c: 'Hice la prueba de navegar solo con Tab en el sitio de un cliente y fue un desastre. Gracias por el empujón.', d: 6 },
      { a: 'diego', c: '¿Qué lector de pantalla recomiendas para empezar? ¿NVDA?', d: 6 },
      { a: 'lucia', c: 'NVDA es gratuito y muy usado en Windows, buen punto de partida. En Mac puedes usar VoiceOver, que ya viene incluido.', d: 6, reply: 3 },
      { a: 'sofia', c: 'Excelente artículo. Lo dejamos destacado en la sección de Diseño.', d: 5 },
    ],
  },
  {
    key: 'productividad',
    title: 'Cómo organizo mi semana como desarrolladora freelance',
    author: 'sofia',
    category: 'Carrera',
    tags: ['productividad', 'freelance', 'carrera'],
    status: 'published',
    daysAgo: 4,
    views: 233,
    content: `
<p>Trabajar por tu cuenta da libertad, pero también exige disciplina. Este es el sistema sencillo que me funciona desde hace dos años.</p>
<h2>Bloques de trabajo profundo</h2>
<p>Reservo las mañanas para tareas que requieren concentración y dejo correos y reuniones para la tarde.</p>
<h2>Planificación semanal</h2>
<p>Cada lunes escribo tres objetivos para la semana. Si un día se complica, al menos sé qué es lo realmente importante.</p>
<h2>Decir que no</h2>
<p>Aprender a rechazar proyectos que no encajan te ahorra mucho estrés y mejora la calidad de lo que sí aceptas.</p>
<p>No hay un método perfecto: prueba, ajusta y quédate con lo que te sirva.</p>`,
    comments: [
      { a: 'camila', c: 'Lo de los tres objetivos semanales lo voy a probar desde el lunes. Siempre termino con listas eternas que nunca cierro.', d: 3 },
      { a: 'paula', c: 'Desde producto aplicamos algo parecido con las prioridades del sprint. Menos es más.', d: 3 },
      { a: 'carlos', c: '¿Cómo manejas a los clientes que te escriben fuera de horario?', d: 2 },
      { a: 'sofia', c: 'Les aviso desde el inicio mis horarios de respuesta. Casi todos lo respetan cuando está claro desde el primer día.', d: 2, reply: 2 },
      { a: 'andres', c: 'Muy útil. Decir que no es lo más difícil, pero tienes razón en que mejora todo lo demás.', d: 1 },
    ],
  },
  {
    key: 'docker',
    title: 'Docker para principiantes: tu primer contenedor en 10 minutos',
    author: 'martin',
    category: 'DevOps',
    tags: ['docker', 'devops', 'contenedores'],
    status: 'published',
    daysAgo: 2,
    views: 127,
    content: `
<p>Si alguna vez escuchaste "en mi máquina funciona", Docker es la respuesta. Vamos a construir y ejecutar un contenedor desde cero.</p>
<h2>Instalación</h2>
<p>Descarga Docker Desktop desde su sitio oficial y verifica la instalación con:</p>
<pre><code>docker --version</code></pre>
<h2>Un Dockerfile mínimo</h2>
<p>Para una app de Node.js, basta con unas pocas líneas: partir de una imagen base, copiar tu código, instalar dependencias y definir el comando de arranque.</p>
<h2>Construir y ejecutar</h2>
<ul>
  <li><code>docker build -t mi-app .</code> crea la imagen.</li>
  <li><code>docker run -p 3000:3000 mi-app</code> la ejecuta.</li>
</ul>
<p>En el próximo artículo veremos <strong>Docker Compose</strong> para levantar app y base de datos juntas.</p>`,
    comments: [
      { a: 'diego', c: 'Justo lo que necesitaba. Llevaba semanas posponiendo aprender Docker y esto lo hace ver mucho menos intimidante.', d: 1 },
      { a: 'carlos', c: '¿Hay diferencia entre imagen y contenedor? Me confundo con los términos.', d: 1 },
      { a: 'martin', c: 'Sí, Carlos: la imagen es la plantilla (de solo lectura) y el contenedor es una instancia en ejecución de esa imagen. Como clase y objeto.', d: 1, reply: 1 },
      { a: 'valentina', c: 'La analogía de clase y objeto me ayudó un montón, gracias.', d: 0, h: 20, reply: 1 },
      { a: 'andres', c: 'Para la parte 2, ojo con no meter secretos en la imagen. Mejor variables de entorno o secretos del orquestador.', d: 0, h: 9 },
      { a: 'paula', c: 'Pendiente de la segunda parte. ¿Para cuándo?', d: 0, h: 3, status: 'pending' },
    ],
  },
  {
    key: 'borrador',
    title: 'Borrador: tendencias de desarrollo web para el próximo año',
    author: 'lucia',
    category: 'Frontend',
    tags: ['tendencias', 'web'],
    status: 'draft',
    daysAgo: 1,
    views: 0,
    content: `
<p>Este artículo todavía está en preparación. Aquí iré reuniendo ideas sobre hacia dónde va el desarrollo web.</p>
<ul><li>Componentes de servidor</li><li>Herramientas de build más rápidas</li><li>IA en el flujo de trabajo</li></ul>`,
    comments: [],
  },
];

const clean = async () => {
  const demoUsers = await User.find({ email: new RegExp(`${DEMO_DOMAIN.replace('.', '\\.')}$`) }).select('_id');
  const ids = demoUsers.map((u) => u._id);
  const demoPosts = await Post.find({ author: { $in: ids } }).select('_id');
  const postIds = demoPosts.map((p) => p._id);
  const c = await Comment.deleteMany({ $or: [{ post: { $in: postIds } }, { author: { $in: ids } }] });
  const p = await Post.deleteMany({ _id: { $in: postIds } });
  const u = await User.deleteMany({ _id: { $in: ids } });
  console.log(`Eliminados: ${u.deletedCount} usuarios, ${p.deletedCount} posts, ${c.deletedCount} comentarios.`);
};

const create = async () => {
  const roles = Object.fromEntries((await Role.find()).map((r) => [r.name, r._id]));
  if (!roles.author || !roles.reader || !roles.editor) {
    throw new Error('Faltan roles. Ejecuta primero: npm run seed');
  }

  // Recrear desde cero para que el script sea idempotente
  await clean();

  const byKey = {};
  for (const u of users) {
    // create() dispara el hook que hashea la contraseña
    // eslint-disable-next-line no-await-in-loop
    byKey[u.key] = await User.create({
      name: u.name,
      email: `${u.key}${DEMO_DOMAIN}`,
      password: DEMO_PASSWORD,
      bio: u.bio,
      role: roles[u.role],
      emailVerifiedAt: new Date(),
    });
  }
  console.log(`${users.length} usuarios creados.`);

  let commentCount = 0;
  for (const p of posts) {
    const content = sanitizeRichContent(p.content.trim());
    const published = p.status === 'published';
    const slug = p.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // eslint-disable-next-line no-await-in-loop
    const post = await Post.create({
      title: p.title,
      slug,
      content,
      excerpt: stripToExcerpt(content),
      author: byKey[p.author]._id,
      category: p.category,
      tags: p.tags,
      status: p.status,
      views: p.views,
      publishedAt: published ? daysAgo(p.daysAgo) : null,
      createdAt: daysAgo(p.daysAgo, 2),
    });

    const created = [];
    for (const cm of p.comments) {
      const when = daysAgo(cm.d, cm.h || 0);
      // eslint-disable-next-line no-await-in-loop
      const doc = await Comment.create({
        post: post._id,
        author: byKey[cm.a]._id,
        content: cm.c,
        parentComment: cm.reply !== undefined ? created[cm.reply]._id : null,
        status: cm.status || 'approved',
        createdAt: when,
        updatedAt: when,
      });
      created.push(doc);
      commentCount += 1;
    }
    console.log(`Post "${p.title}" (${p.status}) con ${p.comments.length} comentarios.`);
  }

  console.log(`\nListo: ${posts.length} posts y ${commentCount} comentarios.`);
  console.log(`Usuarios demo: <nombre>${DEMO_DOMAIN} (lucia, martin, sofia, carlos, valentina, diego, camila, andres, paula)`);
  console.log(`Contraseña de todos: ${DEMO_PASSWORD}`);
};

const run = async () => {
  await connectDB();
  if (process.argv.includes('--clean')) await clean();
  else await create();
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Error al ejecutar el seed demo:', err);
  process.exit(1);
});
