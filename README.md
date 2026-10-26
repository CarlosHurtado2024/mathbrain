# MathBrain

Biblioteca visual en español de matemáticas y estadística, con un catálogo inspirado en plataformas de contenido y un fondo espacial animado. HTML, CSS y JavaScript sin dependencias de compilación.

## Explorar la biblioteca

La portada organiza los contenidos en filas horizontales de explicaciones, simulaciones y ejercicios resueltos. El buscador encuentra conceptos individuales y acepta búsquedas sin tildes, plurales y preguntas como «¿qué es una derivada?». Se pueden combinar los filtros de tema, formato y nivel. Las búsquedas quedan en el enlace para poder compartirlas.

La biblioteca incluye 30 explicaciones con ejemplos, seis ejercicios con soluciones desplegables y cuatro simulaciones: la derivada, las sumas de Riemann, el círculo unitario y lanzamientos de moneda. Los controles modifican las gráficas y los cálculos reales. Los videos se muestran cuando se incorpora una URL compatible; no son necesarios para leer las explicaciones.

Los marcadores guardan contenidos en «Mi biblioteca» mediante el almacenamiento del navegador. La portada muestra los contenidos consultados recientemente, sin simular porcentajes de progreso. Los guardados y el historial son locales al navegador; no hay cuentas ni sincronización entre dispositivos. Si el almacenamiento está bloqueado, el catálogo y los guardados de la visita siguen funcionando.

En `dist/library.js` se editan las explicaciones, ejemplos, ejercicios, simulaciones y etiquetas de búsqueda. Las rutas de aprendizaje conservan sus datos en `dist/courses.js`. Los enlaces `#contenido/identificador` abren cada recurso; `#curso/identificador` abre su ruta. Los enlaces anteriores `#curso/identificador/número` siguen abriendo la explicación correspondiente.

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

Los archivos MP4/WebM locales pueden guardarse dentro de `dist/assets/videos/`. El sitio muestra automáticamente el reproductor en las explicaciones con URL compatible. Las explicaciones escritas y los ejemplos permanecen disponibles. Las duraciones, el progreso de reproducción y los certificados no se simulan.

## Editar los programas

En `dist/courses.js` se modifican los títulos, descripciones, nivel, prerrequisitos, lecciones e ideas clave. Hay seis rutas con cinco explicaciones cada una. Si se añaden lecciones, también deben incorporarse su explicación y ejemplo en `dist/library.js`. Los enlaces directos y la descarga del programa se generan a partir de estos datos.

## Identidad visual

`dist/assets/mark.svg` es una adaptación vectorial del símbolo geométrico facilitado por el usuario. `dist/assets/mathbrain-original.png` conserva el logo original. El tema espacial utiliza fondos azul noche, estrellas y acentos azules y turquesa. Los estilos están en `dist/space.css`; `dist/space.js` añade nebulosas en movimiento, estrellas fugaces, profundidad al desplazarse y una estela de constelación que sigue el mouse. El campo estático de `dist/assets/stars.svg` sirve como respaldo.

El botón de la esquina inferior derecha permite pausar o reanudar el fondo y recuerda la preferencia en el navegador. Si el sistema solicita reducir movimiento, el fondo permanece estático. La animación se suspende cuando la página no está visible; en móviles reduce la cantidad de partículas y no activa la estela del mouse. No se necesitan dependencias externas. Las ilustraciones son diagramas SVG propios con paletas oscuras. El catálogo usa navegación lateral, filas de tarjetas y filtros de formato; en móviles la navegación principal pasa a una barra inferior.

## Comprobaciones

`npm run check` comprueba la sintaxis de todos los scripts. `npm test` verifica la integridad del catálogo, las búsquedas, los filtros combinados, la selección de guardados, los cálculos de Riemann y del círculo unitario, los lanzamientos de moneda y el comportamiento del fondo espacial. La vista local permite comprobar las filas de contenido, navegación, búsqueda, guardados, soluciones desplegables y controles de las cuatro simulaciones. No hay videos suministrados: la reproducción se debe verificar al incorporar los primeros enlaces.

## Alojamiento original en Sites

El alojamiento original está configurado en `.openai/hosting.json`; `dist/` es el directorio de publicación. Esta configuración no interviene en Vercel. Se deben volver a sincronizar y publicar los cambios por separado para actualizar el sitio alojado en Sites. Su acceso inicial es privado; la protección de acceso de Vercel se configura en Vercel.
