# Escribir lecciones y programas

## Lecciones

Cada lección es un archivo Markdown en `content/<id-del-curso>/NN-tema.md`. El número inicial (`01`, `02`…) fija el orden y el identificador: la tercera lección de `calculo-diferencial` se abre en `#contenido/calculo-diferencial-3`. Para añadir una clase, crea el siguiente archivo numerado. Para un curso nuevo, añade sus datos en `src/courses.js` y crea una carpeta con el mismo `id`.

La lección de ejemplo más completa es `content/calculo-diferencial/03-que-es-una-derivada.md`.

````markdown
---
titulo: ¿Qué es una derivada?
descripcion: Construye la pendiente instantánea a partir de rectas secantes.
video: https://youtu.be/XXXXXXXXXXX
formato: vertical
etiquetas: derivada tangente pendiente limite
unidad: Módulo 2 · La derivada y sus aplicaciones
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
- **LaTeX:** `$…$` en línea y `$$…$$` en bloque. Las fórmulas se convierten con KaTeX al compilar: el navegador recibe HTML ya preparado, con MathML para lectores de pantalla. Si una fórmula tiene un error, la compilación se detiene e indica el archivo y la línea. Además están `\sen`, `\arcsen`, `\cis`, `\gr`, `\Dom` y `\Ran` para la notación en español. En una fórmula en bloque, `\qquad` de primer nivel separa fórmulas que en el celular se apilan.
- **Unidad y módulo:** `unidad:` debe coincidir exactamente con el `title` de un módulo del curso en `src/courses.js`. `modulo:` (por ejemplo `2.1`) es opcional; sin él, las lecciones se numeran por módulo.
- **Ejercicios:** `respuesta:` comprueba un número, una fracción (`8/3`) o un porcentaje, y `tolerancia: 0,01` acepta aproximaciones. Si la respuesta se escribe con `%` (por ejemplo `40%`), se acepta tanto `40 %` como `0,4`. Para cantidades grandes, pide la respuesta en miles o millones: `600.000` se leería como decimal. Con opciones `- [ ]` y una sola `- [x]`, el ejercicio es de opción múltiple. `pista:` y `solucion:` son opcionales y admiten LaTeX.
- **Video:** pega el enlace en `video:`. Se admiten YouTube (también «No listado» y Shorts), Vimeo público y archivos `.mp4` o `.webm` en `src/assets/videos/`. Se recomienda YouTube «No listado»: es gratis y la calidad se adapta a la conexión. El video debe permitir la inserción. Si el campo está vacío, la lección muestra su ilustración. El video aparece como primer paso de la lección, con subtítulos en español activados (si el video los tiene en YouTube). Con `formato: vertical` se muestra en 9:16, ideal para shorts y clases cortas: en el celular (y en tabletas en vertical) el video ocupa toda la pantalla al entrar a la lección, con solo el botón de cerrar, el avance y «Continuar»; en el computador aparece en un marco 9:16 dentro de la tarjeta; sin ese campo (o con `formato: horizontal`) se muestra en 16:9. Los enlaces de YouTube Shorts se muestran en vertical automáticamente. Para que el video sea parte de la lección y no un video suelto, pon justo después un `:::ejercicio` sobre lo que explica.

### Cómo se divide en pasos

Cada subtítulo `##`, cada bloque `:::idea`, `:::ejemplo` y `:::nota`, y cada `:::ejercicio` forman un paso. Un subtítulo que queda solo, como `## Practica`, se une al paso siguiente. Para lecciones más interactivas, intercala ejercicios entre las explicaciones en lugar de dejarlos todos al final. Un ejercicio de opción múltiple con exactamente dos opciones (por ejemplo `Verdadero` y `Falso`) se muestra como dos botones lado a lado. Al acertar se abre la `solucion` (la explicación de por qué) y tras un error, la `pista`: escríbelas para enseñar, no solo para dar el resultado. Cada lección debe tener al menos dos ejercicios.

### Ver los cambios

Ejecuta `npm run dev` y abre la lección. `npm test` comprueba que todas las lecciones compilan y cumplen las reglas. Al hacer push, Vercel compila y publica.

## Programas de los cursos

Cada curso en `src/courses.js` declara una escuela en `school`: `matematicas`, `fisica`, `estadistica` o `programacion`. Esta agrupación no sustituye `category`, que conserva los filtros por tema, ni cambia los identificadores de las lecciones.

La oferta de servicios, los temas de PreICFES y los cursos con acompañamiento se editan en `src/landing.js`. Un curso con consulta por WhatsApp no es un curso interactivo publicado: para que se pueda estudiar en la plataforma necesita sus datos en `courses.js` y sus lecciones Markdown. El contacto actual es `+57 324 354 6355`.

En `src/courses.js` se editan el título, la descripción, el nivel, los prerrequisitos y la presentación de cada curso, además de:

- `outcomes`: la lista «Lo que aprenderás».
- `skills`: las habilidades que se muestran como etiquetas.
- `modules`: los módulos en orden. Cada uno tiene `title`, `summary`, `objectives` y `extras` (identificadores de simulaciones o ejercicios resueltos de `src/library.js` que se ofrecen en ese módulo).

La compilación se detiene si una lección nombra un módulo que no existe, si un módulo queda sin lecciones o si los archivos no siguen el orden de los módulos.

## Simulaciones y ejercicios resueltos

Se definen en `src/library.js`, con su tema, nivel, etiquetas de búsqueda y, en los ejercicios, la respuesta (`check`) con su tolerancia. Las simulaciones se dibujan en `bindSimulation` de `src/app.js`.
