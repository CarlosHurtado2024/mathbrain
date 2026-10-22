# MathBrain

Sitio en español para explorar cursos de matemáticas y estadística. HTML, CSS y JavaScript sin dependencias de compilación.

## Desplegar en Vercel desde GitHub

Repositorio: [CarlosHurtado2024/mathbrain](https://github.com/CarlosHurtado2024/mathbrain).

1. Entra en [Vercel](https://vercel.com/new) con tu cuenta y elige importar un repositorio de GitHub.
2. Selecciona `CarlosHurtado2024/mathbrain`.
3. Deja **Root Directory** en la raíz del repositorio (`./`). El archivo `vercel.json` ya configura el proyecto:

   | Ajuste | Valor |
   | --- | --- |
   | Framework Preset | Other |
   | Build Command | `npm run check` |
   | Output Directory | `dist` |
   | Install Command | Vacío; no hay dependencias que instalar |

4. Pulsa **Deploy**. Este proyecto no necesita variables de entorno.

La comprobación valida la sintaxis de JavaScript; los archivos del sitio ya están en `dist/`. Los cursos usan enlaces con `#`, por lo que no requieren reglas de reescritura. `server.cjs` sirve únicamente para la vista previa local.

Cuando el repositorio esté conectado a Vercel, los cambios en la rama de producción configurada generarán nuevos despliegues. Para un proyecto nuevo, usa `main` como rama de producción. Consulta la [documentación de la integración con GitHub](https://vercel.com/docs/git/vercel-for-github) y la [configuración de Vercel](https://vercel.com/docs/project-configuration/vercel-json).

## Vista local

Desde esta carpeta, ejecuta `npm run dev` y abre `http://127.0.0.1:4173`.

## Incorporar videos

Edita `dist/courses.js`. Cada curso tiene una lista `lessons`; sustituye `video: null` por un enlace, por ejemplo:

```js
video: 'https://www.youtube.com/watch?v=ID_DE_11_CAR'
// También admite https://vimeo.com/ID_NUMERICO
// O un archivo: video: 'assets/videos/mi-leccion.mp4'
```

El identificador de YouTube del ejemplo es un marcador: reemplázalo por el enlace real. Se admiten enlaces de YouTube, YouTube Shorts, Vimeo público y archivos `.mp4` o `.webm` (locales o HTTPS). Los videos externos deben permitir inserción. Los archivos con pista de audio deben incluir subtítulos accesibles antes de publicarse. Para archivos grandes, conviene utilizar un proveedor de video y pegar su URL compatible. Este sitio no incluye un panel de subida ni un servidor de almacenamiento de videos.

Los archivos MP4/WebM locales pueden guardarse dentro de `dist/assets/videos/`. El sitio mostrará automáticamente el reproductor en las lecciones con URL compatible. Hasta entonces muestra «En preparación», la descripción y una idea clave. Las duraciones, el progreso de reproducción y los certificados no se simulan.

## Editar los programas

En `dist/courses.js` se modifican los títulos, descripciones, nivel, prerrequisitos, lecciones e ideas clave. Hay seis programas preliminares con cinco lecciones cada uno. Los filtros, la búsqueda sin distinción de tildes, los enlaces directos a las lecciones y la descarga del programa se generan a partir de estos datos.

## Identidad visual

`dist/assets/mark.svg` es una adaptación vectorial del símbolo geométrico facilitado por el usuario. `dist/assets/mathbrain-original.png` conserva el logo original. La paleta utiliza azul y turquesa con fondos claros y diagramas SVG propios. La estructura de exploración se inspira en https://www.3blue1brown.com/; el contenido y las ilustraciones de este sitio son propios.

## Comprobaciones

`npm run check` comprueba la sintaxis de los scripts. La vista local permite verificar navegación, filtros, búsqueda, programa de lecciones, descarga y el laboratorio interactivo de derivadas. No hay videos suministrados: la reproducción real se debe verificar al incorporar los primeros enlaces.

## Alojamiento original en Sites

El alojamiento original está configurado en `.openai/hosting.json`; `dist/` es el directorio de publicación. Esta configuración no interviene en Vercel. Se deben volver a sincronizar y publicar los cambios por separado para actualizar el sitio alojado en Sites. Su acceso inicial es privado; la protección de acceso de Vercel se configura en Vercel.
