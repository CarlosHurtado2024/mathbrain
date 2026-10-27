# MathBrain

Biblioteca visual en español de matemáticas y estadística, con un catálogo inspirado en plataformas de contenido y un fondo espacial animado. HTML, CSS y JavaScript sin dependencias de compilación.

## Explorar la biblioteca

La portada organiza los contenidos en filas horizontales de explicaciones, simulaciones y ejercicios resueltos. El buscador encuentra conceptos individuales y acepta búsquedas sin tildes, plurales y preguntas como «¿qué es una derivada?». Se pueden combinar los filtros de tema, formato y nivel. Las búsquedas quedan en el enlace para poder compartirlas.

«Explorar» abre primero una colección de cursos con portadas, nivel y cantidades reales de explicaciones, simulaciones y ejercicios. Los filtros por tema y nivel permiten elegir una ruta; cada portada abre su programa y sus lecciones. El buscador global y «Buscar un contenido» conservan el acceso directo a los recursos individuales. Los filtros de cursos se guardan en el enlace y funcionan con la navegación atrás y adelante.

El catálogo tiene cinco cursos. **Fundamentos de Matemáticas** (código MB-FM-101) sigue el programa académico del mismo nombre: 31 lecciones, una por módulo, organizadas en cinco unidades (números reales y aritmética, álgebra fundamental, funciones, trigonometría y números complejos), todas con fórmulas LaTeX y ejercicios interactivos. Este curso sustituye a los anteriores de Álgebra y Trigonometría, y sus enlaces antiguos (`#contenido/algebra-2`, `#curso/trigonometria`, `tema=algebra`…) redirigen al módulo equivalente. Los guardados y el historial de esos cursos se conservan. Los otros cuatro cursos son Cálculo diferencial, Probabilidad, Inferencia estadística y Cálculo integral.

La biblioteca incluye 51 explicaciones con ejemplos, seis ejercicios resueltos con soluciones desplegables y seis simulaciones, al menos una por curso: la derivada, las sumas de Riemann, el círculo unitario, lanzamientos de moneda, la intersección de dos rectas (sistemas de ecuaciones) e intervalos de confianza del 95 % construidos con muestras aleatorias. Los controles modifican las gráficas y los cálculos reales.

Cada ejercicio permite comprobar el resultado antes de abrir la solución. La respuesta acepta enteros, decimales con coma o punto, fracciones como `8/3`, porcentajes y unidades sencillas; el valor esperado y su tolerancia se definen en el campo `check` de cada ejercicio en `dist/library.js`. Los videos se muestran cuando se incorpora una URL compatible; no son necesarios para leer las explicaciones.

Los marcadores guardan contenidos en «Mi biblioteca» mediante el almacenamiento del navegador. La portada muestra los contenidos consultados recientemente, sin simular porcentajes de progreso. Los guardados y el historial son locales al navegador; no hay cuentas ni sincronización entre dispositivos. Si el almacenamiento está bloqueado, el catálogo y los guardados de la visita siguen funcionando.

El selector de tema de la cabecera permite elegir Oscuro, Claro o Sistema. La preferencia se conserva en el mismo navegador y se sincroniza entre sus pestañas; Sistema sigue los cambios de apariencia del dispositivo. Sin una preferencia guardada se mantiene el aspecto oscuro original. El tema claro conserva las constelaciones, las estrellas y las estelas con una paleta azul y petróleo visible sobre el fondo claro, y los diagramas sobre sus paneles de contraste. El fondo adapta su paleta al cambiar de tema incluso cuando está pausado o se utiliza movimiento reducido. La elección se aplica antes de mostrar la página y funciona también sin conexión en la aplicación instalada.

Las lecciones (texto, fórmulas LaTeX, video y ejercicios de práctica) se escriben en Markdown dentro de `content/`; consulta «Escribir lecciones». En `dist/library.js` se editan las simulaciones, los ejercicios resueltos y sus etiquetas de búsqueda, y `dist/courses.js` conserva los datos de cada ruta. Los enlaces `#contenido/identificador` abren cada recurso; `#curso/identificador` abre su ruta. Los enlaces anteriores `#curso/identificador/número` siguen abriendo la explicación correspondiente.

## Desplegar en Vercel desde GitHub

Repositorio: [CarlosHurtado2024/mathbrain](https://github.com/CarlosHurtado2024/mathbrain).

1. Entra en [Vercel](https://vercel.com/new) con tu cuenta y elige importar un repositorio de GitHub.
2. Selecciona `CarlosHurtado2024/mathbrain`.
3. Deja **Root Directory** en la raíz del repositorio (`./`). El archivo `vercel.json` ya configura el proyecto:

   | Ajuste | Valor |
   | --- | --- |
   | Framework Preset | Other |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | Vacío; no hay dependencias que instalar |

4. Pulsa **Deploy**. Este proyecto no necesita variables de entorno.

La compilación valida la sintaxis y genera automáticamente la versión de la caché de la aplicación a partir de los archivos de `dist/`. Los cursos usan enlaces con `#`, por lo que no requieren reglas de reescritura. `server.cjs` sirve únicamente para la vista previa local.

Cuando el repositorio esté conectado a Vercel, los cambios en la rama de producción configurada generarán nuevos despliegues. Para un proyecto nuevo, usa `main` como rama de producción. Consulta la [documentación de la integración con GitHub](https://vercel.com/docs/git/vercel-for-github) y la [configuración de Vercel](https://vercel.com/docs/project-configuration/vercel-json).

## Vista local

Desde esta carpeta, ejecuta `npm run dev` y abre `http://127.0.0.1:4173`.

## Instalar MathBrain como aplicación

El botón «Instalar app» de la cabecera y «Instalar MathBrain» del pie permiten añadir la aplicación con su propio icono. En navegadores compatibles, el botón abre la instalación del navegador cuando está disponible. Si no lo está, muestra pasos para el dispositivo. En iPhone/iPad se utiliza Compartir → Añadir a pantalla de inicio; en Safari para Mac, Añadir al Dock cuando el navegador lo admite. La instalación depende del navegador y del sistema operativo.

Para instalarla desde un teléfono, utiliza la dirección HTTPS publicada en Vercel. `localhost` y `127.0.0.1` permiten pruebas en el mismo equipo; una dirección HTTP de la red local no equivale a una publicación HTTPS.

`dist/manifest.webmanifest` define el nombre MathBrain, su ventana independiente, sus colores e iconos. `dist/assets/icons/` incluye los PNG de 192 y 512 píxeles, el icono adaptable de Android y el icono de Apple de 180 píxeles. El símbolo conserva el logo de MathBrain sobre azul noche. Los PNG están incluidos en el repositorio: no necesitan dependencias para desplegarse. Para regenerarlos a partir del SVG se puede ejecutar `scripts/generate-icons.cjs` con `sharp` disponible en el entorno de Node.

Después de completar la primera carga, el service worker conserva las explicaciones, ejercicios, simulaciones y recursos locales para usarlos sin conexión. Los vídeos y fuentes externas no se descargan: los vídeos necesitan internet y la tipografía dispone de alternativas locales. Los guardados permanecen en el almacenamiento del mismo navegador.

`npm run build` calcula una nueva versión cuando cambia cualquier archivo publicado. La aplicación muestra un aviso para actualizar cuando la nueva versión está preparada; se recarga al aceptar y no interrumpe automáticamente una simulación. El service worker solo elimina cachés anteriores de MathBrain. Durante el desarrollo, ejecuta `npm run build` después de cambiar archivos para generar la actualización; `npm run check` valida sintaxis sin cambiar la versión.

`npm test` también comprueba los flujos de instalación por plataforma, las cancelaciones, la preparación sin conexión, las actualizaciones con confirmación, los iconos y la estabilidad de las versiones de caché.

## Escribir lecciones

Cada lección es un archivo Markdown en `content/<id-del-curso>/NN-tema.md`. La lección de ejemplo completa es `content/calculo-diferencial/03-que-es-una-derivada.md`. El número inicial (`01`, `02`…) fija el orden y el identificador: la tercera lección de `calculo-diferencial` se abre en `#contenido/calculo-diferencial-3`. Para añadir una clase, crea el siguiente archivo numerado. Para un curso nuevo, añade sus datos en `dist/courses.js` y crea una carpeta con el mismo `id`.

````markdown
---
titulo: ¿Qué es una derivada?
descripcion: Construye la pendiente instantánea a partir de rectas secantes.
video: https://www.youtube.com/watch?v=XXXXXXXXXXX
etiquetas: derivada tangente pendiente limite
# Opcionales, para cursos organizados por unidades:
unidad: Unidad 2 · Álgebra fundamental
modulo: 2.1
---

## Primero, la intuición

Texto con fórmulas en línea como $f(x) = x^2$ y en bloque:

$$f'(a) = \lim_{h \to 0} \frac{f(a+h) - f(a)}{h}$$

:::idea
La idea clave de la lección (obligatoria). Aparece destacada y se usa en la búsqueda.
:::

:::ejemplo
Un ejemplo resuelto.
:::

:::nota
Una advertencia o un error frecuente.
:::

:::ejercicio
Si $f(x) = x^2$, ¿cuánto vale $f'(3)$?
respuesta: 6
pista: Usa $f'(x) = 2x$.
solucion: $f'(3) = 2 \cdot 3 = 6$.
:::

:::ejercicio
Si $f'(a) < 0$, la función cerca de $a$…
- [ ] crece
- [x] decrece
solucion: Una pendiente negativa indica que la gráfica baja.
:::
````

- **Texto:** subtítulos con `##` y `###`, listas con `-` o `1.`, `**negrita**`, `*cursiva*`, código entre comillas invertidas y enlaces `[texto](https://…)`. Para escribir un signo de dólar, usa `\$`.
- **LaTeX:** `$…$` en línea y `$$…$$` en bloque, en una o varias líneas. Las fórmulas se convierten con [KaTeX](https://katex.org) durante la compilación: el navegador recibe HTML ya preparado, con MathML para lectores de pantalla. Si una fórmula tiene un error, la compilación se detiene e indica el archivo y la línea. Además de los comandos de LaTeX, están disponibles `\sen`, `\arcsen`, `\cis`, `\gr`, `\Dom` y `\Ran` para la notación en español.
- **Unidades:** con `unidad:` y `modulo:`, la página del curso agrupa las lecciones bajo el título de cada unidad y muestra el número de módulo (por ejemplo, `2.1`) en lugar del número de orden. Las lecciones consecutivas con la misma `unidad` forman un grupo.
- **Ejercicios:** `respuesta:` comprueba un número, una fracción (`8/3`) o un porcentaje, y `tolerancia: 0,01` acepta aproximaciones. Si la respuesta se escribe con `%` (por ejemplo, `40%`), se acepta tanto `40 %` como `0,4`. Para cantidades grandes, pide la respuesta en miles o millones: un punto de miles como en `600.000` se leería como decimal. Con opciones `- [ ]` y una sola `- [x]`, el ejercicio es de opción múltiple. `pista:` y `solucion:` son opcionales y admiten LaTeX.
- **Video:** pega el enlace en `video:`. Se admiten YouTube (incluidos los videos «No listados» y los Shorts), Vimeo público y archivos `.mp4` o `.webm` en `dist/assets/videos/`. Para cursos completos se recomienda YouTube «No listado»: el alojamiento es gratuito y la calidad se adapta a la conexión. Los videos externos deben permitir la inserción y los archivos con audio deben incluir subtítulos. Si el campo está vacío, la lección muestra su ilustración.

Después de editar, ejecuta `npm run content` y revisa el resultado con `npm run dev`, o `npm run build` para preparar la publicación. `dist/content.js` es un archivo generado: no se edita a mano, pero se guarda en el repositorio y `npm test` comprueba que coincide con `content/`. Al hacer push, Vercel ejecuta `npm run build` y publica las lecciones.

KaTeX 0.16.22 (licencia MIT) está incluido en el proyecto. `vendor/katex/katex.min.js` se usa solo al compilar y `dist/vendor/katex/` contiene la hoja de estilos y las fuentes WOFF2, que también se guardan para usarlas sin conexión. Con 51 lecciones, `dist/content.js` pesa unos 2,2 MB sin comprimir y unos 145 KB con la compresión del servidor. El navegador lo descarga una vez y la aplicación instalada lo guarda para usarlo sin conexión. Si el catálogo sigue creciendo, conviene publicar cada lección en un archivo propio que se cargue al abrirla.

## Editar los programas

En `dist/courses.js` se modifican el título, la descripción, el nivel, los prerrequisitos y la presentación de cada ruta. Las lecciones de una ruta son los archivos de su carpeta en `content/`. El programa descargable se genera con los títulos, descripciones e ideas clave de esos archivos.

## Identidad visual

`dist/assets/mark.svg` es una adaptación vectorial del símbolo geométrico facilitado por el usuario. `dist/assets/mathbrain-original.png` conserva el logo original. El tema espacial utiliza fondos azul noche, estrellas y acentos azules y turquesa. Los estilos están en `dist/space.css`; `dist/space.js` añade nebulosas en movimiento, estrellas fugaces, profundidad al desplazarse y una estela de constelación que sigue el mouse. El campo estático de `dist/assets/stars.svg` sirve como respaldo.

El botón de la esquina inferior derecha permite pausar o reanudar el fondo y recuerda la preferencia en el navegador. Si el sistema solicita reducir movimiento, el fondo permanece estático. La animación se suspende cuando la página no está visible; en móviles reduce la cantidad de partículas y no activa la estela del mouse. No se necesitan dependencias externas. Las ilustraciones son diagramas SVG propios con paletas oscuras. El catálogo usa navegación lateral, filas de tarjetas y filtros de formato; en móviles la navegación principal pasa a una barra inferior.

## Comprobaciones

`npm run check` comprueba la sintaxis de todos los scripts. `npm test` verifica la compilación de las lecciones Markdown y sus fórmulas LaTeX, la integridad del catálogo, las búsquedas, los filtros combinados, la selección de guardados, los cálculos de Riemann y del círculo unitario, los lanzamientos de moneda, la intersección de rectas, la cobertura de los intervalos de confianza, la lectura de respuestas de los ejercicios y el comportamiento del fondo espacial. La vista local permite comprobar las filas de contenido, navegación, búsqueda, guardados, comprobación de respuestas, soluciones desplegables y controles de las seis simulaciones. No hay videos suministrados: la reproducción se debe verificar al incorporar los primeros enlaces.

## Alojamiento original en Sites

El alojamiento original está configurado en `.openai/hosting.json`; `dist/` es el directorio de publicación. Esta configuración no interviene en Vercel. Se deben volver a sincronizar y publicar los cambios por separado para actualizar el sitio alojado en Sites. Su acceso inicial es privado; la protección de acceso de Vercel se configura en Vercel.
