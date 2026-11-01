# Sistema de diseño de Zuka

La interfaz acompaña a estudiantes que se preparan para ingresar a la universidad o necesitan avanzar y permanecer en su carrera. Debe transmitir claridad, rigor académico y un impulso cercano. La dirección sigue la skill [interface-design](https://github.com/Dammyjay93/interface-design), con un destello ámbar que celebra sobre una base azul cobalto. La experiencia de aprendizaje toma patrones de uso de apps de práctica activa (carrusel de cursos, barra inferior para comprobar, feedback inmediato) sin copiar su marca, ilustraciones ni código.

## Identidad y jerarquía

El **azul cobalto** identifica la marca, las selecciones, el acceso y las respuestas correctas. El **ámbar** identifica el avance, los XP, la racha, la celebración y «Intentar de nuevo». La paleta no usa morado ni verde. Cada curso tiene su color (cobalto, cielo, ámbar, coral y rosa) en su tarjeta, su botón «Empezar» y sus barras. Los fondos son blancos y gris azulado muy suave, con tinta azul marino.

El destello es la firma de Zuka: aparece en el logo, el camino de la landing, el saludo del estudiante, el acceso, el perfil y la celebración de la lección. La mascota acompaña sin competir con el contenido.

| Vista | Foco |
| --- | --- |
| Landing | La meta del estudiante y las opciones para empezar |
| Inicio con cuenta | Carrusel de cursos: título, unidad, ilustración, lección actual y siguiente, y un solo botón «Empezar/Continuar» |
| Catálogo | Cursos agrupados por escuela y filtros claros |
| Lección | Un concepto o un reto a la vez; barra inferior con la mascota y «Comprobar» |
| Final de lección | Celebración, XP ganados y siguiente paso |
| Perfil y acceso | Identidad, progreso y formulario de la cuenta |

## Tokens de color

`src/identity.css` concentra la identidad y sus dos temas. Se carga después de las hojas de componentes y conecta los nombres anteriores (`--z-*`, `--fun-*`, `--m-*`) con los tokens compartidos. Los componentes nuevos deben usar estos tokens, sin añadir colores independientes.

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--brand-primary` | `#2f5bea` | `#8aa8ff` | Marca, acción principal, selección, acierto |
| `--brand-primary-hover` | `#2149cf` | `#a8bfff` | Acción principal al pasar el cursor; relieve del botón |
| `--brand-on-primary` | `#ffffff` | `#0d1630` | Texto del botón cobalto |
| `--brand-primary-soft` | `#eaf0ff` | `#18264d` | Selecciones y barra de acierto |
| `--brand-accent` | `#f59e0b` | `#fbbf24` | Avance, XP, racha, «Intentar de nuevo» (fondos y botones) |
| `--brand-on-accent` | `#2b1a00` | `#2b1a00` | Texto sobre ámbar |
| `--brand-accent-text` | `#8a5300` | `#fbbf24` | Ámbar como texto (cumple AA) |
| `--brand-accent-soft` | `#fff5df` | `#3a2a0b` | Barra de «Casi.» y recompensas |
| `--brand-canvas` | `#f7f9fc` | `#0e1424` | Fondo de la plataforma |
| `--brand-surface` | `#ffffff` | `#161e33` | Tarjetas y cabecera |
| `--brand-inset` | `#eef2f8` | `#1c2640` | Campos y controles en reposo |
| `--brand-ink` | `#17203a` | `#eef2fb` | Texto principal |
| `--brand-secondary` | `#5e6678` | `#b4bccd` | Explicaciones y contexto |
| `--brand-tertiary` | `#6b7385` | `#9aa3b6` | Metadatos legibles |
| `--brand-line` | `#e2e7f0` | `#28324b` | Separación de superficies |

Los estados de error y advertencia conservan sus tokens semánticos propios. Las clases históricas de los cursos conservan su nombre, pero ya no su color (`src/app-ui.css`): `.purple` cobalto (Fundamentos), `.blue` cielo (Cálculo diferencial), `.sand` ámbar (Probabilidad), `.green` coral (Inferencia), `.slate` rosa intenso (Cálculo integral) y `.rose` fucsia. Cada clase define `--fun`, `--fun-dark`, `--fun-soft` y `--fun-ink` (texto del botón).

El botón cobalto con texto blanco alcanza 5,5:1; los botones ámbar y coral usan tinta oscura. Todo texto normal debe alcanzar AA (4,5:1), también en fondos suaves y en el tema oscuro. El texto de los controles oscuros usa tinta oscura sobre los acentos claros.

## Tipografía, superficies y espacio

- **Manrope**, pesos 400–800, con Arial como respaldo. El archivo variable latino se incluye en `src/assets/fonts/manrope-latin.woff2`, se precarga y funciona sin conexión. Su licencia SIL OFL se distribuye al lado del archivo.
- Texto base de 14,5–16 px; lectura de lecciones de 16,5 px con interlineado amplio. Campos de al menos 16 px en móvil. Títulos de producto de 27–38 px; la landing usa una escala mayor.
- Jerarquía mediante tamaño, peso, color y espacio: títulos 700–800, controles 700, texto 400–500, metadatos secundarios. Números de progreso y XP tabulares.
- Fórmulas con KaTeX y sus fuentes locales. Los símbolos académicos decorativos pueden usar Georgia; no se necesitan servicios externos de fuentes.
- Unidad de espacio de 4 px: 8, 12, 16, 20, 24, 32, 48. Densidad media en catálogo y perfil; lectura más abierta en lecciones y landing.
- Profundidad mediante superficies y bordes discretos. Los botones principales de la lección y del inicio tienen relieve de tecla (sombra inferior de 4 px del mismo color, que se hunde al pulsar). Fondo, tarjeta y campo mantienen el mismo matiz.
- Radios de 10 px en botones y campos, 14–16 px en tarjetas y 20–24 px en contenedores amplios. Círculos solo cuando la forma comunica progreso o avatar.

## Componentes

| Componente | Patrón |
| --- | --- |
| Acción principal | `.button-primary` / `.m-button.is-primary`: cobalto, mínimo 44 px, radio 10 px, texto 14 px/700 |
| Avanzar | `.button-success`, `.spotlight-start`: ámbar o el color del curso, con texto de contraste |
| Consultar | Los botones de WhatsApp usan `.m-button.is-success`; los enlaces conservan su destino y mensaje |
| Acción secundaria | Fondo de tarjeta, borde suave y texto cobalto |
| Campo | Fondo inset, borde neutral, radio 10 px, etiqueta visible y foco cobalto |
| Curso | Icono académico suave, título, descripción y metadatos reales; tarjeta con borde discreto |
| Carrusel de inicio | `.spotlight-slide`: un curso por tarjeta, desplazable con el dedo; puntos `.spotlight-dot` para cambiar de curso |
| Camino | Nodo actual cobalto; completado en ámbar suave; contenido que requiere cuenta con candado y texto legible |
| Progreso | Barra del color del curso sobre una pista neutral, con etiqueta y `role="progressbar"` |
| Recompensa | Mascota celebrando, título principal, XP reales destacados en ámbar y acción para continuar |
| Barra de la lección | Mascota a la izquierda y una acción: «Comprobar» (cobalto); «¡Correcto! +XP» con «¿Por qué?» y «Continuar» (barra cobalto suave); «Casi.» con la pista abierta e «Intentar de nuevo» (barra y botón ámbar); «Ver solución» siempre disponible |
| Perfil | Círculo ámbar con la inicial, nivel y cuatro cifras en tarjetas: racha, XP total, racha máxima y lecciones |

Los controles se construyen con HTML nativo. Las acciones tienen estados de reposo, hover, pulsación, foco y deshabilitado. Las transiciones nuevas animan solo transformaciones durante 160 ms; `prefers-reduced-motion` elimina el movimiento. El foco visible tiene un contorno de 3 px.

## Mascota y logo

Zuka es un destello ámbar con la silueta del logo, dos trazos para los ojos y un detalle cobalto según el estado. La figura prescinde de boca, mejillas y pedestal. Se dibuja en SVG en `src/mascot.js`; conserva `MATHBRAIN_MASCOT.svg(estado)` y `MATHBRAIN_MASCOT.say(estado, html)`. Los estados son `saluda`, `feliz`, `piensa`, `animo` y `celebra`. Cada SVG utiliza identificadores de gradiente independientes y escapa sus etiquetas accesibles.

El logo integra el destello ámbar y una Z azul marino sobre una base cobalto. `src/assets/mark.svg` sirve de logo y favicon. `src/assets/icons/app-icon.svg` genera los PNG de 192 y 512 px, el adaptable de Android y el de Apple mediante `node scripts/generate-icons.cjs`, con `sharp` disponible. Los PNG son opacos y el icono adaptable conserva su margen de seguridad.

## Comportamiento que debe conservarse

La landing presenta programas, escuelas, visión y acompañamiento. La bienvenida permite deslizar, tocar o usar el teclado para crear un perfil local y acceder a todas las lecciones. Antes de entrar se prueba la primera lección de cada curso; las cuentas de correo quedan disponibles mediante emailAccounts, en pausa por defecto. El rediseño conserva rutas, contacto, progreso, claves `mathbrain-*`, sincronización e instalación PWA. No se añaden cifras, reseñas o resultados inventados.

La revisión visual debe cubrir 375 px, tableta y escritorio, ambos temas, formularios, filtros, estados de práctica y final de lección, sin desplazamiento horizontal. Los assets de identidad y la fuente deben estar en el shell del service worker.

## Portada, instalación y entrenamiento

En una pestaña del navegador, la raíz siempre presenta los servicios y la acción para probar o descargar Zuka. La app instalada conserva la bienvenida y el panel del estudiante. La portada mantiene la identidad existente, con tres filas de servicios; en pantallas compactas se prioriza el texto y se oculta la ilustración del camino.

El cambio de tema es un botón con dos estados, claro y oscuro, una etiqueta que indica la siguiente acción y foco conservado tras el cambio. La instalación en computador muestra un QR oscuro sobre blanco con cuatro módulos de margen; no se colorea ni se deforma el código.

La navegación móvil tiene cinco destinos: Inicio, Cursos, Entrenamiento, Tutorías y Perfil. Entrenamiento recibe más espacio para mantener su etiqueta en una línea. Su contenido usa una selección de materia y listas de parciales y unidades, con cantidades de ejercicios reales y sin presentar los simulacros como exámenes oficiales.
