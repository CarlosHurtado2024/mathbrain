# Sistema de diseño de Zuka

Zuka transmite claridad, rigor académico y acompañamiento. La identidad compartida usa negro y verde menta en la portada y en el producto. La referencia elegida es [Sumz](https://sumz.co/): fondo oscuro, tipografía amplia y texto junto a una figura matemática. Zuka la adapta a su contenido y conserva Manrope, su destello y sus rutas. `DESIGN.md` registra los tokens y reglas visuales; `.impeccable/design.json` contiene extensiones y muestras de componentes.

## Identidad y tokens

`src/identity.css` concentra ambos temas y conecta los nombres anteriores (`--z-*`, `--fun-*`, `--m-*`) con la identidad compartida. Se carga después de las hojas históricas; `src/app-ui.css` se carga al final para patrones de producto. Los componentes nuevos usan los tokens compartidos. Las clases históricas de los cursos conservan sus nombres, pero comparten la paleta verde.

| Token | Oscuro | Claro | Uso |
| --- | --- | --- | --- |
| `--brand-primary` | `#59f7bd` | `#087b4e` | Marca, selección y acción principal |
| `--brand-primary-hover` | `#83ffd2` | `#05603a` | Acción principal al pasar el cursor |
| `--brand-on-primary` | `#03180c` | `#ffffff` | Texto sobre la acción principal |
| `--brand-primary-soft` | `#102b1e` | `#e8f7ef` | Selección y contexto de marca |
| `--brand-primary-line` | `#28573f` | `#b1dfc8` | Bordes de selección |
| `--brand-accent` | `#59f7bd` | `#59f7bd` | Avance, XP y recompensas |
| `--brand-on-accent` | `#03180c` | `#031b10` | Texto sobre menta |
| `--brand-accent-text` | `#7af6c3` | `#076b42` | Avance como texto |
| `--brand-accent-soft` | `#0d261a` | `#e4f9ed` | Recompensas y estados suaves |
| `--brand-canvas` | `#050807` | `#f4f8f5` | Fondo de la plataforma |
| `--brand-surface` | `#0b120e` | `#ffffff` | Tarjetas y cabecera |
| `--brand-inset` | `#111c15` | `#edf3ef` | Campos y controles |
| `--brand-ink` | `#f0f7f2` | `#0c1a12` | Texto principal |
| `--brand-secondary` | `#b7c9bd` | `#465d50` | Explicaciones y contexto |
| `--brand-tertiary` | `#9cb3a5` | `#50685a` | Metadatos |
| `--brand-line` | `#213b2c` | `#dce8e0` | Separación de superficies |
| `--brand-line-strong` | `#345540` | `#bdcec3` | Bordes de campos |

Error y advertencia conservan tokens semánticos propios. El color acompaña etiquetas y estados; no es la única señal. El requisito de contraste es AA (4,5:1 para texto normal), que debe verificarse en ambos temas y estados.

## Tipografía, superficies y espacio

- **Manrope**, pesos 400–800, con Arial como respaldo. La fuente variable latina y su licencia SIL OFL se distribuyen en `src/assets/fonts/`; la fuente funciona sin conexión.
- Texto base de 14,5 px/1,6; formularios de 16 px. La portada usa títulos amplios de peso 550 y el producto títulos de 700–800. Fórmulas con KaTeX local; símbolos académicos con la tipografía ya existente.
- Ritmo de 4 px con pasos habituales de 8, 12, 16, 20, 24, 32 y 48 px. El producto es más compacto que la portada.
- Profundidad principalmente tonal y bordes discretos. Botones y tarjetas de catálogo sin sombra. El diálogo de instalación conserva una sombra ambiental; sombras locales heredadas no constituyen una regla para nuevas superficies.
- Radios habituales: 10 px en controles; 14–16 px en tarjetas; 20–24 px en contenedores amplios. La acción de lección y la del carrusel usan 16 px y altura mínima de 54 px.

## Componentes y navegación

| Componente | Patrón |
| --- | --- |
| Acción principal | Verde principal, texto de contraste, altura mínima de 44 px y radio de 10 px |
| Avanzar / consultar | Menta; WhatsApp conserva el destino y mensaje existentes |
| Acción secundaria | Fondo de superficie, borde de marca suave y texto verde |
| Campo | Fondo inset, borde neutral, radio de 10 px y etiqueta visible |
| Selección de escuela | Filtros horizontales, altura de 44 px; borde y fondo suave para la selección |
| Curso | Título, descripción y metadatos reales, tarjeta con borde discreto y progreso etiquetado |
| Inicio | Carrusel de cursos con una acción «Empezar/Continuar» y puntos para cambiar de curso |
| Lección | Un concepto o reto a la vez; mascota y acción «Comprobar»; feedback, reintento y solución disponibles según el estado |
| Recompensa | Mascota, XP reales y siguiente acción |
| Perfil | Inicial o mascota, nivel y cuatro cifras: racha, XP total, racha máxima y lecciones |

Los controles son HTML nativo, con hover, pulsación, foco y deshabilitado. El foco compartido tiene contorno de 2 px y separación de 3 px. El movimiento reducido elimina las transiciones y animaciones correspondientes. La navegación de producto conserva cinco destinos: Inicio, Cursos, Entrenamiento, Tutorías y Perfil; en móvil usa la barra inferior y da más espacio a Entrenamiento.

## Portada, mascota e instalación

La portada del navegador presenta el propósito, los servicios, las cuatro escuelas y las acciones para probar o descargar Zuka. En escritorio combina el texto a la izquierda con una superficie matemática paramétrica a la derecha. El canvas se apila bajo el texto en pantallas compactas y conserva enlaces a las cuatro escuelas. `src/network-hero.js` dibuja la geometría localmente: movimiento reducido deja una imagen estática, se pausa fuera de pantalla o con la pestaña oculta y libera observadores y animación al cambiar de ruta. Hay un fallback SVG.

La mascota es un destello verde con dos trazos para los ojos y detalles verde oscuro. Conserva `MATHBRAIN_MASCOT.svg(estado)` y `MATHBRAIN_MASCOT.say(estado, html)` y los estados `saluda`, `feliz`, `piensa`, `animo` y `celebra`. El logo combina el destello menta y una Z oscura sobre negro. Los iconos PWA se generan desde `src/assets/icons/app-icon.svg` mediante `scripts/generate-icons.cjs`.

Las visitas nuevas empiezan en oscuro. `src/theme.js` conserva las preferencias guardadas, incluido el tema claro; el botón indica el tema al que cambiará y conserva el foco. La instalación en computador usa un QR oscuro sobre blanco, con cuatro módulos de margen, dirigido siempre a `https://mathbrain-psi.vercel.app/#descargar`, también desde localhost o una vista previa.

## Hechos y verificación

Se conservan los cinco cursos publicados, sus 51 lecciones y 155 ejercicios, las cuatro escuelas, los programas y el entrenamiento. Los simulacros son práctica con el contenido publicado; no son exámenes oficiales. El acompañamiento se consulta por WhatsApp al **+57 324 354 6355**. No se inventan precios, horarios, reseñas o resultados. Con `emailAccounts: false`, la bienvenida crea o conserva un perfil local y habilita el contenido completo; las cuentas de correo están en pausa.

Verificación del rediseño: 159 pruebas automatizadas correctas y compilación de los 16 archivos JavaScript. Se inspeccionaron vistas con anchos CSS de 320, 375, 768, 1280 y 1440 px, ambos temas, la navegación y los estados de foco e instalación. Las capturas nativas pueden excluir las barras de desplazamiento y tener otras dimensiones de imagen. Se comprobaron contraste de los pares principales, movimiento reducido, limpieza de la animación y QR público. La instalación en un celular físico queda fuera de esta verificación.

Los recuadros de conceptos, ejemplos y notas usan superficie verde y borde uniforme de 1 px en lectura y en el reproductor. El contexto de unidad y nivel aparece debajo del título. Los alias heredados se resuelven a los tokens de marca también en el tema claro.
