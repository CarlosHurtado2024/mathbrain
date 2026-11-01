# Arquitectura

Zuka es una aplicación de una sola página (SPA) estática: HTML, CSS y JavaScript sin frameworks ni dependencias en el navegador. Node.js se usa solo para compilar el contenido, preparar la PWA y ejecutar las pruebas.

## Carpetas

```
mathbrain/
├── src/                     Código de la app (se edita aquí)
│   ├── index.html           Estructura de todas las vistas
│   ├── styles.css           Base y diseño general
│   ├── space.css            Tema oscuro: colores base (fondo azul marino liso)
│   ├── themes.css           Variables de cada tema
│   ├── explore.css          Catálogo, cursos, lecciones, perfil
│   ├── fresh.css            Tema claro (por defecto)
│   ├── zuka.css             Panel del estudiante, camino, lección y catálogo
│   ├── marketing.css        Landing, programas, escuelas y presentación de la empresa
│   ├── identity.css         Identidad cobalto y ámbar, tokens compartidos y ambos temas
│   ├── app-ui.css           Inicio en carrusel, barra de lección, catálogo, perfil y colores de los cursos
│   ├── landing.js           Oferta pública, plantillas y contacto (window.ZUKA_MARKETING)
│   ├── theme.js             Aplica el tema antes de pintar la página
│   ├── courses.js           Programas de los cursos y sus módulos
│   ├── library.js           Catálogo: simulaciones, ejercicios resueltos y búsqueda
│   ├── exercises.js         Sistema de ejercicios: 12 tipos, validación, pistas y desempeño (window.ZUKA_EXERCISES)
│   ├── lesson-engine.js     Motor de lecciones: un componente por tipo de bloque (window.ZUKA_ENGINE)
│   ├── content-source.js    Lecciones y bloques desde Supabase, con respaldo local (window.ZUKA_CONTENT)
│   ├── mascot.js            El destello ámbar en SVG y sus estados de ánimo
│   ├── app.js               Rutas, vistas, lecciones, progreso y perfil
│   ├── install.js           Instalación, modo sin conexión y actualizaciones
│   ├── config.js            URL y clave publicable de Supabase
│   ├── cloud.js             Sesión (correo o anónima) y sincronización con Supabase
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
3. Publica los iconos de instalación con un hash de su contenido en el nombre (`icon-192.<hash>.png`, etc.) y actualiza sus referencias en el HTML, el manifiesto, los accesos directos y el shell del service worker. Los PNG originales se conservan para las direcciones antiguas. Así, cambiar el logo también cambia su URL y el navegador puede detectar la nueva identidad.
4. Calcula un hash de todos los archivos de `dist/` y lo escribe en `CACHE_NAME` de `dist/sw.js`. Si nada cambió, la versión no cambia.

`npm run build` además ejecuta `npm run check` antes.

## Ejecución en el navegador

Orden de carga en `index.html`:

1. `theme.js` (sin `defer`): aplica el tema guardado antes de pintar.
2. Con `defer`, en orden: `courses.js` → `content.js` → `config.js` → `exercises.js` (`window.ZUKA_EXERCISES`) → `lesson-engine.js` (`window.ZUKA_ENGINE`) → `content-source.js` (aplica el índice de lecciones guardado de Supabase sobre `content.js`) → `library.js` (une lecciones, simulaciones y ejercicios en `window.MATHBRAIN_LIBRARY`) → `mascot.js` → `vendor/supabase/supabase.js` → `cloud.js` → `vendor/qrcode/qrcodegen.js` → `install.js` (`window.ZUKA_INSTALL`) → `landing.js` (`window.ZUKA_MARKETING`) → `app.js`.

`app.js` es un módulo autoejecutable que lee el estado guardado, dibuja la vista según la dirección y escucha `hashchange`.

### Motor de lecciones

Una lección es una secuencia de bloques `{ type, html, data }`. `lesson-engine.js` tiene un componente por tipo: su etiqueta, cómo se dibuja y, si hace falta, su comportamiento (`mount`). El reproductor de `app.js` no conoce los tipos: pide al motor el HTML, la etiqueta y si el bloque se califica (`graded`). Los tipos que acepta la base de datos son `challenge`, `video`, `concept`, `formula`, `worked_example`, `interactive_graph`, `simulation`, `exercise`, `step_by_step`, `visual_proof`, `application`, `assessment`, `summary` y `spaced_review`. Hoy tienen componente todos menos `interactive_graph`, `simulation`, `assessment` y `spaced_review`, que llegan en las fases 2 y 3 con `ZUKA_ENGINE.register()`; mientras tanto, un bloque de esos tipos sin HTML no se muestra.

Los ejercicios son bloques `exercise` con su especificación en `data.exercise`. `exercises.js` define cada tipo con `render`, `mount`, `read` y `check`; `check` no toca el DOM, se prueba en `tests/exercises.test.cjs` y el compilador del contenido lo usa para validar. Cada intento llama a `onAttempt`, que `app.js` guarda en el dispositivo y envía a `exercise_attempts`.

`content-source.js` entrega los bloques al abrir una lección: primero los que hay en el dispositivo (los últimos de Supabase o los compilados) y, en segundo plano, los actuales de Supabase. Si cambiaron y la persona no ha avanzado, se muestran de inmediato. La posición dentro de la lección se guarda en `zuka-lecciones-en-curso` y en `lesson_sessions`, y la lección se retoma en ese bloque.

### Rutas

`landing.js` separa la oferta comercial de los cursos con lecciones. Las páginas públicas usan `marketing.css` y `marketing-mode` para mostrar una cabecera y un pie de empresa. Los cursos se agrupan mediante `course.school`, conservando identificadores y progreso. Los cursos con acompañamiento se consultan al WhatsApp `+57 324 354 6355`; no simulan lecciones ni matrículas. Los nuevos recursos se incluyen en el precaché de la PWA.

| Dirección | Vista |
| --- | --- |
| Raíz o `#` | Navegador: portada de servicios, aunque exista un perfil. PWA en modo standalone: bienvenida o panel |
| `#inicio` | Bienvenida o panel de aprendizaje, también desde el navegador |
| `#descargar` | Portada y guía de instalación en móvil/tableta, o QR en computador |
| `#conoce` | Landing de programas, escuelas y servicios |
| `#programas`, `#programa/<id>` | Oferta y detalle de PreICFES, preuniversitario, preingeniero, ingeniería, tutorías y asesorías |
| `#escuelas`, `#escuela/<id>` | Escuelas de Matemáticas, Física, Estadística y Programación, y sus cursos |
| `#explorar`, `#cursos` | Catálogo de cursos |
| `#explorar?q=…&tipo=…&tema=…&nivel=…` | Búsqueda de contenidos |
| `#simulaciones`, `#ejercicios` | Contenidos de ese formato |
| `#biblioteca` | Guardados |
| `#perfil` | Perfil del estudiante |
| `#entrenamiento?curso=<id>` | Selector de materia, cuatro parciales de práctica y simulacros por unidad |
| `#entrenamiento/<id>/parcial-<1-4>` | Simulacro con un cuarto de los ejercicios del curso, en orden |
| `#entrenamiento/<id>/unidad-<n>` | Simulacro de la unidad, con los retos del repaso existente |
| `#tutorias` | Acompañamiento y contacto de tutorías dentro de la app |
| `#ingreso` | Bienvenida de entrada local con retorno a la lección solicitada |
| `#registro`, `#ingresar` | Cuentas si emailAccounts está activo; en modo local conservan el destino y llevan a la bienvenida o al panel |
| `#nosotros` | Visión y objetivo de Zuka: ingreso, permanencia y culminación de los estudios |
| `#curso/<id>` | Camino de niveles del curso |
| `#contenido/<id>` | Lección paso a paso, simulación o ejercicio resuelto |
| `#contenido/<id>?vista=lectura` | Lección completa en una página |
| `#repaso/<curso>/<nivel>` | Repaso del nivel |

Los enlaces antiguos de Álgebra y Trigonometría redirigen a Fundamentos de Matemáticas (`legacyHash` en `app.js`).

`app.js` decide el acceso según `emailAccounts` en `src/config.js`. Con el valor actual `false`, la persona entra mediante la bienvenida y se guarda la marca `zuka-ingreso`; su perfil y progreso siguen usando las claves `mathbrain-*`. Antes de entrar puede probar la primera lección de cada curso. Con el valor `true`, el acceso completo requiere una sesión de correo; la marca local no la sustituye. La misma comprobación se aplica a enlaces directos, lectura y alias antiguos. En ambos modos el acceso completo no depende del progreso. En el modo de cuentas, al cerrar sesión se vuelve a evaluar la vista activa, incluso dentro de una lección. Durante la restauración inicial se muestra un estado de espera.

La bienvenida permite deslizar, tocar el botón o usar el teclado. Cancelar el gesto no entra, y cambiar de página cancela una entrada pendiente.

Las pantallas de cuenta y la bienvenida aceptan `continuar` con una ruta interna; `sessionStorage` conserva el destino durante la confirmación de correo. El contenido sigue empaquetado en archivos estáticos y en la caché offline; el control descrito limita la navegación y no convierte esos archivos en privados (ver `SUPABASE.md`).

## PWA

- **Manifiesto** (`src/manifest.webmanifest`): nombre Zuka, `display: standalone`, colores, iconos (incluido el adaptable de Android) y accesos directos.
- **Service worker** (`src/sw.js`): al instalarse guarda en caché todos los `SHELL_FILES`; responde primero desde la caché y, si falta algo, va a la red y lo guarda. Las navegaciones sirven `index.html`. Al activarse borra las cachés anteriores con el prefijo `mathbrain-shell-`. Se actualiza solo cuando la persona acepta el aviso (`ACTIVATE_UPDATE`).
- **Instalación** (`src/install.js`): usa `beforeinstallprompt` cuando el navegador lo ofrece y, si no, muestra los pasos del dispositivo. El botón público detecta Android e iOS, incluido iPad con agente de escritorio. En PC muestra un QR generado localmente con Nayuki 1.8.0 (MIT), sin servicios externos. Tanto la matriz QR como el enlace visible apuntan siempre a `https://mathbrain-psi.vercel.app/#descargar`, la dirección pública de producción. Nunca toman el dominio de localhost ni de una vista previa protegida de Vercel.

Los controles de tema e instalación usan eventos delegados para seguir funcionando al cambiar de página. `app.js` emite `zuka:routechange` después de renderizar; el refresco de botones de tema no vuelve a emitir un cambio de tema. La barra principal contiene Inicio, Cursos, Entrenamiento, Tutorías y Perfil; Biblioteca y Simulaciones están también en Perfil.

La identidad instalada es **Zuka** en `name`, `short_name`, `application-name` y `apple-mobile-web-app-title`. El manifiesto define los PNG de 192 y 512 px y el adaptable de Android; el HTML añade iconos PNG de compatibilidad y el de Apple de 180 px. La ayuda de instalación muestra el mismo icono y el nombre «Instalar Zuka». Se mantienen el `id`, `start_url`, `scope` y la URL del manifiesto para actualizar la misma app.

Una instalación existente puede pedir confirmar el cambio de nombre o icono desde el navegador. Cambiar solo los píxeles sin cambiar la URL no basta para actualizar el icono en Chrome actual; por eso el empaquetado versiona los archivos. Referencia: [actualizaciones de apps web en Chrome](https://developer.chrome.com/blog/improvements-to-web-app-updates).

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
| `cloud.test.cjs` | Cuenta y sincronización con un Supabase simulado: unión, envíos, sin conexión y errores |

## Despliegue

Vercel está conectado al repositorio `CarlosHurtado2024/mathbrain`. Con cada push a `main` ejecuta `npm run build` y publica `dist/` (ver `vercel.json`: sin framework, sin comando de instalación, `sw.js` sin caché HTTP). Las ramas distintas de `main` generan vistas previas con su propia dirección HTTPS. No hay variables de entorno.

`.openai/hosting.json` es la configuración del alojamiento original y no interviene en Vercel.
