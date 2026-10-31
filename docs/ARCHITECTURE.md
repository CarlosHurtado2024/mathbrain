# Arquitectura

Zuka es una aplicación de una sola página (SPA) estática: HTML, CSS y JavaScript sin frameworks ni dependencias en el navegador. Node.js se usa solo para compilar el contenido, preparar la PWA y ejecutar las pruebas.

## Carpetas

```
mathbrain/
├── src/                     Código de la app (se edita aquí)
│   ├── index.html           Estructura de todas las vistas
│   ├── styles.css           Base y diseño general
│   ├── space.css            Tema oscuro (fondo espacial)
│   ├── themes.css           Variables de cada tema
│   ├── explore.css          Catálogo, cursos, lecciones, perfil
│   ├── fresh.css            Tema claro (por defecto)
│   ├── zuka.css             Panel del estudiante, camino, lección y catálogo
│   ├── marketing.css        Landing, programas, escuelas y presentación de la empresa
│   ├── landing.js           Oferta pública, plantillas y contacto (window.ZUKA_MARKETING)
│   ├── theme.js             Aplica el tema antes de pintar la página
│   ├── courses.js           Programas de los cursos y sus módulos
│   ├── library.js           Catálogo: simulaciones, ejercicios resueltos y búsqueda
│   ├── mascot.js            El zorro en SVG y sus estados de ánimo
│   ├── app.js               Rutas, vistas, lecciones, progreso y perfil
│   ├── space.js             Animación del fondo del tema oscuro
│   ├── install.js           Instalación, modo sin conexión y actualizaciones
│   ├── config.js            URL y clave publicable de Supabase
│   ├── cloud.js             Cuenta y sincronización con Supabase
│   ├── sw.js                Service worker
│   ├── manifest.webmanifest Nombre, colores e iconos de la app instalada
│   ├── assets/              Iconos, logo, fotos
│   └── vendor/              KaTeX (estilos y fuentes) y supabase-js 2.117.3
├── content/<curso>/NN-tema.md   Lecciones en Markdown + LaTeX
├── scripts/
│   ├── build.cjs            Compila todo: src/ → dist/ + contenido + versión PWA
│   ├── build-content.cjs    Markdown → pasos HTML con KaTeX (validaciones)
│   ├── build-pwa.cjs        Calcula la versión de la caché del service worker
│   ├── check.cjs            Comprueba la sintaxis del JavaScript
│   └── generate-icons.cjs   PNG de los iconos a partir del SVG (requiere sharp)
├── tests/                   Pruebas con node:test
├── vendor/katex/            KaTeX para compilar (no se publica)
├── docs/                    Documentación
├── server.cjs               Servidor local de desarrollo
├── vercel.json              Configuración de Vercel
├── supabase/migrations/     Esquema de la base de datos (SQL)
└── dist/                    Salida compilada (generada, ignorada por Git)
```

## Compilación

`node scripts/build.cjs` (lo ejecutan `npm run dev`, `npm test` y `npm run build`):

1. Borra `dist/` y copia `src/` dentro.
2. Compila `content/**/*.md` a `dist/content.js` (`window.MATHBRAIN_CONTENT`). Cada lección se divide en pasos; las fórmulas salen ya convertidas a HTML + MathML. Se detiene con el archivo y la línea si hay un error de LaTeX, un ejercicio mal escrito o una lección que no corresponde a un módulo de `src/courses.js`.
3. Calcula un hash de todos los archivos de `dist/` y lo escribe en `CACHE_NAME` de `dist/sw.js`. Si nada cambió, la versión no cambia.

`npm run build` además ejecuta `npm run check` antes.

## Ejecución en el navegador

Orden de carga en `index.html`:

1. `theme.js` (sin `defer`): aplica el tema guardado antes de pintar.
2. Con `defer`, en orden: `courses.js` → `content.js` → `library.js` (une lecciones, simulaciones y ejercicios en `window.MATHBRAIN_LIBRARY`) → `mascot.js` → `config.js` → `vendor/supabase/supabase.js` → `cloud.js` (cuenta y sincronización, `window.ZUKA_CLOUD`) → `landing.js` (`window.ZUKA_MARKETING`) → `app.js` → `space.js` → `install.js`.

`app.js` es un módulo autoejecutable que lee el estado guardado, dibuja la vista según la dirección y escucha `hashchange`.

### Rutas

`landing.js` separa la oferta comercial de los cursos con lecciones. Las páginas públicas usan `marketing.css` y `marketing-mode` para mostrar una cabecera y un pie de empresa. Los cursos se agrupan mediante `course.school`, conservando identificadores y progreso. Los cursos con acompañamiento se consultan al WhatsApp `+57 324 354 6355`; no simulan lecciones ni matrículas. Los nuevos recursos se incluyen en el precaché de la PWA.

| Dirección | Vista |
| --- | --- |
| `#` o `#inicio` | Sin sesión: landing de programas y servicios, con acceso para explorar o registrarse. Con sesión: panel de aprendizaje |
| `#programas`, `#programa/<id>` | Oferta y detalle de PreICFES, preuniversitario, preingeniero, ingeniería, tutorías y asesorías |
| `#escuelas`, `#escuela/<id>` | Escuelas de Matemáticas, Física, Estadística y Programación, y sus cursos |
| `#explorar`, `#cursos` | Catálogo de cursos |
| `#explorar?q=…&tipo=…&tema=…&nivel=…` | Búsqueda de contenidos |
| `#simulaciones`, `#ejercicios` | Contenidos de ese formato |
| `#biblioteca` | Guardados |
| `#perfil` | Perfil del estudiante |
| `#registro`, `#ingresar` | Registro con correo y contraseña, inicio de sesión y recuperación de contraseña |
| `#nosotros` | Visión y objetivo de Zuka: ingreso, permanencia y culminación de los estudios |
| `#curso/<id>` | Camino de niveles del curso |
| `#contenido/<id>` | Lección paso a paso, simulación o ejercicio resuelto |
| `#contenido/<id>?vista=lectura` | Lección completa en una página |
| `#repaso/<curso>/<nivel>` | Repaso del nivel |

Los enlaces antiguos de Álgebra y Trigonometría redirigen a Fundamentos de Matemáticas (`legacyHash` en `app.js`).

`app.js` comprueba la sesión antes de abrir contenido: sin cuenta permite la primera lección de cada curso y sus retos; las demás lecciones, simulaciones, ejercicios independientes y repasos piden registro o acceso. La misma comprobación se aplica a enlaces directos, lectura y alias antiguos. Con sesión no hay bloqueos por progreso. Al cerrar sesión se vuelve a evaluar la vista activa, incluso dentro de una lección. Durante la restauración inicial se muestra un estado de espera.

Las pantallas de cuenta aceptan `continuar` con una ruta interna; `sessionStorage` conserva el destino durante la confirmación de correo. El contenido sigue empaquetado en archivos estáticos y en la caché offline; el control descrito limita la navegación y no convierte esos archivos en privados (ver `SUPABASE.md`).

## PWA

- **Manifiesto** (`src/manifest.webmanifest`): nombre Zuka, `display: standalone`, colores, iconos (incluido el adaptable de Android) y accesos directos.
- **Service worker** (`src/sw.js`): al instalarse guarda en caché todos los `SHELL_FILES`; responde primero desde la caché y, si falta algo, va a la red y lo guarda. Las navegaciones sirven `index.html`. Al activarse borra las cachés anteriores con el prefijo `mathbrain-shell-`. Se actualiza solo cuando la persona acepta el aviso (`ACTIVATE_UPDATE`).
- **Instalación** (`src/install.js`): usa `beforeinstallprompt` cuando el navegador lo ofrece y, si no, muestra los pasos del dispositivo.

Si se añade un archivo que la app necesita sin conexión, hay que agregarlo a `SHELL_FILES`.

## Pruebas

`npm test` compila y ejecuta `tests/*.test.cjs` con `node:test`, sin navegador:

| Archivo | Qué cubre |
| --- | --- |
| `content.test.cjs` | Compilación de Markdown/LaTeX, validaciones, módulos y que `dist/content.js` está al día |
| `explore.test.cjs` | Rutas, catálogo, cursos, lecciones paso a paso, repasos, progreso y perfil (con un DOM simulado) |
| `library.test.cjs` | Búsqueda, filtros y cálculos de las simulaciones |
| `pwa.test.cjs` | Manifiesto, iconos, service worker, caché sin conexión y versión estable |
| `install.test.cjs` | Flujo de instalación por plataforma |
| `theme.test.cjs` | Tema claro por defecto y sincronización entre pestañas |
| `space.test.cjs` | Fondo animado y movimiento reducido |
| `cloud.test.cjs` | Cuenta y sincronización con un Supabase simulado: unión, envíos, sin conexión y errores |

## Despliegue

Vercel está conectado al repositorio `CarlosHurtado2024/mathbrain`. Con cada push a `main` ejecuta `npm run build` y publica `dist/` (ver `vercel.json`: sin framework, sin comando de instalación, `sw.js` sin caché HTTP). Las ramas distintas de `main` generan vistas previas con su propia dirección HTTPS. No hay variables de entorno.

`.openai/hosting.json` es la configuración del alojamiento original y no interviene en Vercel.
