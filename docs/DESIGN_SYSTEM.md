# Sistema de diseño

Zuka es **moderna, sobria y profesional**: mucho blanco, un solo color de acento (el naranja del zorro), tipografía clara y componentes con bordes finos y sombras suaves. Los colores por curso se usan en tonos suaves para orientar, nunca para decorar.

El tema claro es el principal (`src/fresh.css`). El tema oscuro (`src/space.css`) conserva un fondo espacial con estrellas y acentos turquesa.

## Color

### Marca y neutros (tema claro)

| Token | Valor | Uso |
| --- | --- | --- |
| `--fun-violet` | `#e0601f` | Acento: botón principal, enlaces activos, barras de progreso |
| `--fun-violet-dark` | `#b9481a` | Texto sobre fondos claros, enlaces, etiquetas |
| `--fun-violet-soft` | `#fdeee4` | Fondos de elementos activos |
| `--fun-heading` | `#1f2328` | Títulos |
| `--ink` | `#2b2f36` | Texto |
| `--muted` | `#6b6f7a` | Texto secundario |
| `--line` | `#e7e5e1` | Bordes y divisores |
| Fondo | `#ffffff` / `#faf9f7` | Página / barra lateral |

(Los nombres `--fun-violet*` vienen de una versión anterior; hoy contienen el naranja de la marca).

### Estados

| Token | Valor | Uso |
| --- | --- | --- |
| `--fun-green` | `#2e9e6a` | Acierto, completado |
| `--fun-red` | `#d64545` | Error, acciones destructivas |
| `--fun-yellow` | `#d9a43b` | Logros, mejor racha |
| `--fun-orange` | `#d9822b` | Racha |

### Cursos

Cada curso tiene una clase de color que define `--fun`, `--fun-dark` y `--fun-soft`:

| Clase | Curso | Acento | Fondo |
| --- | --- | --- | --- |
| `.purple` | Fundamentos de Matemáticas | `#5b3fb3` | `#f1edfb` |
| `.blue` | Cálculo diferencial | `#1f63c2` | `#eaf2fd` |
| `.sand` | Probabilidad | `#a85f17` | `#fcf1e4` |
| `.green` | Inferencia estadística | `#1e7a50` | `#e9f6ef` |
| `.slate` | Cálculo integral | `#137684` | `#e6f5f7` |
| `.rose` | (reservado) | `#a8385e` | `#fbecf1` |

Todo texto debe cumplir contraste AA (4,5:1; 3:1 en textos grandes).

## Tipografía

- **Plus Jakarta Sans** (Google Fonts), pesos 400–800, con DM Sans y Arial como respaldo.
- Títulos en 700–800 con `letter-spacing: -0.02em`. Etiquetas superiores (`.eyebrow`) en mayúsculas, 700, `letter-spacing: 0.08em`, color `--fun-violet-dark`.
- Texto base de 14,5 px con interlineado 1,6. Los campos de texto usan 16 px en el celular para que el navegador no haga zoom.
- Fórmulas: KaTeX con sus propias fuentes, incluidas en la app.

## Espaciado y forma

- Escala de espaciado: 4, 8, 12, 16, 20, 24, 32 px. Margen lateral de 18 px en el celular.
- Radios: 8–10 px (controles pequeños, navegación), 12 px (campos, botones), 16–18 px (tarjetas), 50 % (avatares, días de la semana).
- Sombra de tarjeta: `0 1px 2px rgb(31 35 40 / .05)`. Botón principal: sombra naranja suave.

## Componentes

| Componente | Clase | Notas |
| --- | --- | --- |
| Botón principal | `.button.button-primary` | Naranja, texto blanco. Una acción principal por pantalla |
| Botón secundario | `.button.button-secondary` | Blanco con borde |
| Botón de texto | `.text-button` | Naranja oscuro, 600 |
| Tarjeta de curso | `.course-card`, `.continue-card` | Fondo blanco, color del curso en el icono |
| Barra de progreso | `.course-progress-track` | 6–8 px, con `role="progressbar"` |
| Chip de racha y XP | `.stats-chip` | En la cabecera; abre el perfil |
| Navegación | `.main-nav` | Lateral en escritorio (6 secciones y Materias), barra inferior de 5 accesos en el celular |
| Camino de niveles | `.path-node` | Nodos en zigzag: completado, actual, siguiente |
| Lección paso a paso | `.lesson-player` | Sin menús; barra inferior verde al acertar y roja tras un error |
| Perfil | `.profile-*` | Encabezado con la mascota, estadísticas en cuadrícula, semana y cursos |

## Camino de aprendizaje

Curso → unidades → lecciones → retos. Cada unidad tiene un encabezado con el color suave del curso, su objetivo y un contador `hechas/total`; debajo, sus lecciones como círculos unidos por una línea vertical (`.zunit`, `.znode` en `src/zuka.css`).

| Estado | Aspecto |
| --- | --- |
| Completada | Círculo pequeño con check en el color del curso, texto atenuado |
| Actual | Círculo naranja más grande con anillo suave y una tarjeta con «Empezar» o «Continuar» |
| Disponible | Círculo blanco con borde gris |
| Requiere cuenta | Círculo gris con candado y enlace al registro; el texto mantiene contraste legible |

Con sesión activa todas las unidades, lecciones y repasos están disponibles desde el comienzo. Sin cuenta se puede ver el temario y estudiar únicamente la primera lección de cada curso; los demás nodos y los recursos del buscador indican que requieren cuenta. Los enlaces directos a contenido restringido muestran una invitación a registrarse o iniciar sesión.

La bienvenida ofrece dos opciones: explorar la plataforma o crear una cuenta gratuita con correo y contraseña; debajo aparece el acceso para quienes ya tienen cuenta. En el catálogo se recuerda el alcance de la exploración. El registro y el acceso tienen una pantalla dedicada y, al entrar, devuelven a la lección que se quería abrir.

## Principios del rediseño

### Páginas públicas

La landing, los programas, las escuelas y «Sobre Zuka» usan `marketing.css` y los componentes `m-*`, con fondo cálido, naranja, verde oscuro y titulares con acentos en Lora. La ilustración del camino académico se construye con SVG y CSS. No se muestran testimonios, resultados ni cifras inventadas.

La cabecera pública enlaza a programas, escuelas, acompañamiento, ingreso y registro. En móvil ofrece un menú desplegable nativo. Estas páginas sustituyen el marco de estudio mediante `body.marketing-mode`; el catálogo, las lecciones y la cuenta conservan su navegación habitual. El tema oscuro usa los mismos componentes con sus variables de color.

Los cursos en plataforma y los cursos con acompañamiento tienen acciones diferentes: estudiar en la app o consultar por WhatsApp. «Sobre Zuka» presenta visión, objetivo y apoyo al ingreso y la permanencia, sin foto ni biografía del fundador.

### Plataforma de aprendizaje

- Una sola acción principal por sección. En el inicio del estudiante: «Continuar aprendiendo».
- Una actividad a la vez en la lección; la retroalimentación explica (abre la solución o la pista).
- Gamificación moderada: XP discretos, logros ocasionales y una meta semanal opcional. Sin vidas, rankings ni celebraciones ruidosas.
- Nada de tarjetas o estadísticas para rellenar espacio.

## Iconos

Trazo de 1,6 px, esquinas redondeadas, 24×24, color `currentColor`, definidos en `iconPaths` de `src/app.js` (`home`, `search`, `simulation`, `exercise`, `bookmark`, `user`, `flame`, `star`, `check`…). Siempre con `aria-hidden="true"` cuando acompañan a un texto.

## La mascota

Un zorro sentado de formas planas y geométricas: naranja `#e0601f`, sombra `#c24a14`, crema `#f7e4cb` y patas `#24262c`. Se dibuja en SVG (`src/mascot.js`) con cinco estados:

| Estado | Cuándo |
| --- | --- |
| `saluda` | Primera visita |
| `feliz` | Inicio, perfil |
| `piensa` | Contenido no encontrado, pistas |
| `animo` | Tras un error o para mantener la racha |
| `celebra` | Acierto, lección terminada, meta del día |

`MATHBRAIN_MASCOT.say(estado, html)` lo muestra con un globo de diálogo. Habla en frases cortas, cálidas y sin diminutivos.

## Icono de la app

Cabeza de zorro geométrica en crema sobre naranja. `src/assets/mark.svg` (logo y favicon) y `src/assets/icons/app-icon.svg` (fuente de los PNG de 192, 512, el adaptable de Android y el de Apple). Para regenerarlos: `node scripts/generate-icons.cjs` con `sharp` disponible.

## Movimiento

Transiciones de 150–300 ms. La mascota y el fondo se detienen con `prefers-reduced-motion: reduce`.
