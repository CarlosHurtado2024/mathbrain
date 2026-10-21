# MathBrain

Sitio en español para explorar cursos de matemáticas y estadística. HTML, CSS y JavaScript sin dependencias de compilación.

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

## Publicación

El alojamiento está configurado en `.openai/hosting.json`; `dist/` es el directorio de publicación. Se deben volver a sincronizar y publicar los cambios para actualizar el sitio alojado. El acceso inicial del sitio es privado.
