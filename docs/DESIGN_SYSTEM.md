# Sistema de diseño de Zuka

La interfaz acompaña a estudiantes que se preparan para ingresar a la universidad o necesitan avanzar y permanecer en su carrera. Debe transmitir claridad, rigor académico y un impulso cercano. La dirección sigue la skill [interface-design](https://github.com/Dammyjay93/interface-design), con la referencia de un destello verde que celebra sobre una base morada.

## Identidad y jerarquía

El morado identifica la marca, las selecciones y las acciones de acceso. El verde identifica el avance, las respuestas correctas, los logros y las consultas de acompañamiento. Se evita colorear cada materia con un acento diferente. Los fondos recuerdan el papel y la cuadrícula de estudio: blanco, lavanda muy suave y tinta violeta oscura.

El destello es la firma de Zuka: aparece en el logo, el camino de la landing, el saludo del estudiante, el acceso, el perfil y la celebración de la lección. La mascota acompaña sin competir con el contenido.

| Vista | Foco |
| --- | --- |
| Landing | La meta del estudiante y las opciones para empezar |
| Inicio con cuenta | La siguiente lección y «Continuar aprendiendo» |
| Catálogo | Cursos agrupados por escuela y filtros claros |
| Lección | Un concepto o un reto a la vez; «Continuar» en verde |
| Final de lección | Celebración, XP ganados y siguiente paso |
| Perfil y acceso | Identidad, progreso y formulario de la cuenta |

## Tokens de color

`src/identity.css` concentra la identidad y sus dos temas. Se carga después de las hojas de componentes y conecta los nombres anteriores (`--z-*`, `--fun-*`, `--m-*`) con los tokens compartidos. Los componentes nuevos deben usar estos tokens, sin añadir colores independientes.

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--brand-primary` | `#6d43cf` | `#b69aef` | Marca, acción principal, selección |
| `--brand-primary-hover` | `#5832b5` | `#c8b0f6` | Acción principal al pasar el cursor |
| `--brand-on-primary` | `#ffffff` | `#241637` | Texto del botón morado |
| `--brand-primary-soft` | `#f0eafa` | `#2e2342` | Selecciones y superficies de marca |
| `--brand-green` | `#147b4f` | `#79dba4` | Avance y acciones de acompañamiento |
| `--brand-on-green` | `#ffffff` | `#122b20` | Texto del botón verde |
| `--brand-green-soft` | `#e9f7ee` | `#19372b` | Aciertos y recompensa |
| `--brand-canvas` | `#faf9fd` | `#13101d` | Fondo de la plataforma |
| `--brand-surface` | `#ffffff` | `#1c1729` | Tarjetas y cabecera |
| `--brand-inset` | `#f4f2f8` | `#241e32` | Campos y controles en reposo |
| `--brand-ink` | `#262338` | `#f1edf8` | Texto principal |
| `--brand-secondary` | `#686477` | `#c0b7ce` | Explicaciones y contexto |
| `--brand-tertiary` | `#726c80` | `#a99fb9` | Metadatos legibles |
| `--brand-line` | `#e7e3ee` | `#363044` | Separación de superficies |

Los estados de error y advertencia conservan sus tokens semánticos propios. Las clases históricas de los cursos se agrupan en dos familias: `.purple`, `.blue` y `.rose` usan morado; `.green`, `.sand` y `.slate` usan verde. No se cambian los identificadores ni los temas de los cursos.

Los botones principales alcanzan 6,26:1 de contraste en morado y 5,28:1 en verde en el tema claro. Todo texto normal debe alcanzar AA (4,5:1), también en fondos suaves y en el tema oscuro. El texto de los controles oscuros usa tinta oscura sobre los acentos claros.

## Tipografía, superficies y espacio

- **Manrope**, pesos 400–800, con Arial como respaldo. El archivo variable latino se incluye en `src/assets/fonts/manrope-latin.woff2`, se precarga y funciona sin conexión. Su licencia SIL OFL se distribuye al lado del archivo.
- Texto base de 14,5–16 px; lectura de lecciones de 16,5 px con interlineado amplio. Campos de al menos 16 px en móvil. Títulos de producto de 27–38 px; la landing usa una escala mayor.
- Jerarquía mediante tamaño, peso, color y espacio: títulos 700–800, controles 700, texto 400–500, metadatos secundarios. Números de progreso y XP tabulares.
- Fórmulas con KaTeX y sus fuentes locales. Los símbolos académicos decorativos pueden usar Georgia; no se necesitan servicios externos de fuentes.
- Unidad de espacio de 4 px: 8, 12, 16, 20, 24, 32, 48. Densidad media en catálogo y perfil; lectura más abierta en lecciones y landing.
- Profundidad mediante superficies y bordes discretos, sin sombras de color ni botones elevados. Fondo, tarjeta y campo mantienen el mismo matiz.
- Radios de 10 px en botones y campos, 14–16 px en tarjetas y 20–24 px en contenedores amplios. Círculos solo cuando la forma comunica progreso o avatar.

## Componentes

| Componente | Patrón |
| --- | --- |
| Acción principal | `.button-primary` / `.m-button.is-primary`: morado, mínimo 44 px, radio 10 px, texto 14 px/700 |
| Avanzar | `.button-success`, `.player-continue`, `.home-next-button`: verde con texto de contraste |
| Consultar | Los botones de WhatsApp usan `.m-button.is-success`; los enlaces conservan su destino y mensaje |
| Acción secundaria | Fondo de tarjeta, borde suave y texto morado |
| Campo | Fondo inset, borde neutral, radio 10 px, etiqueta visible y foco morado |
| Curso | Icono académico suave, título, descripción y metadatos reales; tarjeta con borde discreto |
| Camino | Nodo actual morado; completado verde; contenido que requiere cuenta con candado y texto legible |
| Progreso | Barra verde sobre una pista neutral, con etiqueta y `role="progressbar"` |
| Recompensa | Mascota celebrando, título principal, XP reales destacados en verde y acción para continuar |
| Retroalimentación | Mascota y explicación; verde al acertar y rojo al reintentar, además de texto explícito |

Los controles se construyen con HTML nativo. Las acciones tienen estados de reposo, hover, pulsación, foco y deshabilitado. Las transiciones nuevas animan solo transformaciones durante 160 ms; `prefers-reduced-motion` elimina el movimiento. El foco visible tiene un contorno de 3 px.

## Mascota y logo

Zuka es un destello de cuatro puntas suaves, verde, con expresión amable y una pequeña plataforma morada. Se dibuja en SVG en `src/mascot.js`; conserva `MATHBRAIN_MASCOT.svg(estado)` y `MATHBRAIN_MASCOT.say(estado, html)`. Los estados son `saluda`, `feliz`, `piensa`, `animo` y `celebra`. Cada SVG utiliza identificadores de gradiente independientes y escapa sus etiquetas accesibles.

El logo integra el destello y una Z sobre una base morada. `src/assets/mark.svg` sirve de logo y favicon. `src/assets/icons/app-icon.svg` genera los PNG de 192 y 512 px, el adaptable de Android y el de Apple mediante `node scripts/generate-icons.cjs`, con `sharp` disponible. Los PNG son opacos y el icono adaptable conserva su margen de seguridad.

## Comportamiento que debe conservarse

La landing presenta programas, escuelas, visión y acompañamiento. Los visitantes pueden explorar y probar la primera lección de cada curso; una cuenta con correo y contraseña habilita todas las lecciones. El rediseño conserva rutas, contacto, progreso, claves `mathbrain-*`, sincronización e instalación PWA. No se añaden cifras, reseñas o resultados inventados.

La revisión visual debe cubrir 375 px, tableta y escritorio, ambos temas, formularios, filtros, estados de práctica y final de lección, sin desplazamiento horizontal. Los assets de identidad y la fuente deben estar en el shell del service worker.
