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
│   ├── theme.js             Aplica el tema antes de pintar la página
│   ├── courses.js           Programas de los cursos y sus módulos
│   ├── library.js           Catálogo: simulaciones, ejercicios resueltos y búsqueda
│   ├── mascot.js            El zorro en SVG y sus estados de ánimo
│   ├── app.js               Rutas, vistas, lecciones, progreso y perfil
│   ├── space.js             Animación del fondo del tema oscuro
│   ├── install.js           Instalación, modo sin conexión y actualizaciones
│   ├── sw.js                Service worker
│   ├── manifest.webmanifest Nombre, colores e iconos de la app instalada
│   ├── assets/              Iconos, logo, fotos
│   └── vendor/katex/        Hoja de estilos y fuentes de KaTeX
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
2. Con `defer`, en orden: `courses.js` → `content.js` → `library.js` (une lecciones, simulaciones y ejercicios en `window.MATHBRAIN_LIBRARY`) → `mascot.js` → `app.js` → `space.js` → `install.js`.

`app.js` es un módulo autoejecutable que lee el estado guardado, dibuja la vista según la dirección y escucha `hashchange`.

### Rutas

| Dirección | Vista |
| --- | --- |
| `#` o `#inicio` | Portada (primera visita) o panel del día |
| `#explorar`, `#cursos` | Catálogo de cursos |
| `#explorar?q=…&tipo=…&tema=…&nivel=…` | Búsqueda de contenidos |
| `#simulaciones`, `#ejercicios` | Contenidos de ese formato |
| `#biblioteca` | Guardados |
| `#perfil` | Perfil del estudiante |
| `#nosotros` | Sobre Zuka y su autor |
| `#curso/<id>` | Camino de niveles del curso |
| `#contenido/<id>` | Lección paso a paso, simulación o ejercicio resuelto |
| `#contenido/<id>?vista=lectura` | Lección completa en una página |
| `#repaso/<curso>/<nivel>` | Repaso del nivel |

Los enlaces antiguos de Álgebra y Trigonometría redirigen a Fundamentos de Matemáticas (`legacyHash` en `app.js`).

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

## Despliegue

Vercel está conectado al repositorio `CarlosHurtado2024/mathbrain`. Con cada push a `main` ejecuta `npm run build` y publica `dist/` (ver `vercel.json`: sin framework, sin comando de instalación, `sw.js` sin caché HTTP). Las ramas distintas de `main` generan vistas previas con su propia dirección HTTPS. No hay variables de entorno.

`.openai/hosting.json` es la configuración del alojamiento original y no interviene en Vercel.
