# Zuka · guía para trabajar en este proyecto

Zuka es una **app web progresiva (PWA)** en español para aprender matemáticas y estadística paso a paso: cursos, lecciones cortas con LaTeX y video, retos interactivos, XP, rachas y un zorro como mascota. Se usa en el navegador y se instala en el celular desde Chrome. **No es una app nativa**: nada de Kotlin, Java ni Android Studio.

Antes de cambiar algo, lee el documento de `docs/` que corresponda:

| Documento | Para qué |
| --- | --- |
| `docs/VISION.md` | Qué es Zuka, para quién y qué no es |
| `docs/REQUIREMENTS.md` | Requisitos funcionales y no funcionales |
| `docs/ARCHITECTURE.md` | Carpetas, scripts, rutas, service worker y despliegue |
| `docs/DATABASE.md` | Qué se guarda en el dispositivo y el modelo del contenido |
| `docs/DESIGN_SYSTEM.md` | Colores, tipografía, componentes y la mascota |
| `docs/CONTENIDO.md` | Cómo escribir lecciones en Markdown y editar los programas |
| `docs/ROADMAP.md` | Etapas del proyecto y lo que sigue |
| `docs/PRUEBAS_ANDROID.md` | Probar la app en un celular Android |

## Comandos

```bash
npm run dev        # compila y sirve en http://localhost:4173
npm run dev:movil  # igual, pero accesible desde el celular por Wi-Fi
npm test           # compila y ejecuta todas las pruebas
npm run build      # comprueba sintaxis y compila dist/ (lo que hace Vercel)
```

Requiere Node.js 20 o superior. No hay dependencias de npm.

## Reglas del proyecto

1. **Se edita `src/` y `content/`, nunca `dist/`.** `dist/` se genera con `npm run build` y no se guarda en Git.
2. **Siempre debe seguir siendo PWA:** `src/manifest.webmanifest`, `src/sw.js` e `src/install.js` funcionando, y la app usable sin conexión tras la primera visita. Si añades un archivo que la app necesita, agrégalo a `SHELL_FILES` en `src/sw.js`.
3. **Mobile first.** Todo se comprueba a 375 px de ancho sin desplazamiento horizontal, y también en tableta y escritorio. En el celular la navegación es la barra inferior.
4. **No cambiar las claves `mathbrain-*`** de `localStorage` ni el prefijo de caché `mathbrain-shell-`: son el progreso guardado de los estudiantes (nombre interno heredado de cuando la app se llamaba MathBrain). El nombre visible es **Zuka**.
5. **Sin dependencias en tiempo de ejecución.** HTML, CSS y JavaScript sin frameworks. KaTeX se usa al compilar.
6. **Todo el texto visible en español**, con tono cercano y profesional, sin infantilismos.
7. **Accesibilidad:** etiquetas en controles, foco visible, `aria-*` correctos, contraste AA y respeto de `prefers-reduced-motion`.
8. **Pruebas:** `npm test` debe pasar antes de cada commit. Si cambias el comportamiento, añade o ajusta la prueba en `tests/`.
9. **Git:** commits pequeños con mensaje claro. No hacer `push` sin que Carlos lo pida: cada push a `main` publica en Vercel.
10. Trabajar por etapas (`docs/ROADMAP.md`): una funcionalidad a la vez, probarla en el celular y luego seguir.

## Estructura

```
src/          código de la app (HTML, CSS, JS, iconos, manifiesto, service worker)
content/      lecciones en Markdown + LaTeX, una carpeta por curso
scripts/      compilación (build, contenido, versión PWA, comprobación, iconos)
tests/        pruebas con node:test
vendor/       KaTeX para compilar las fórmulas
docs/         documentación del proyecto
dist/         salida compilada (generada, ignorada por Git)
server.cjs    servidor local de desarrollo
```
