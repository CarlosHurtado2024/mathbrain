---
name: Zuka
description: Negro y verde menta para aprender, practicar y avanzar.
colors:
  primary: "#59f7bd"
  primary-hover: "#83ffd2"
  on-primary: "#03180c"
  primary-soft: "#102b1e"
  primary-line: "#28573f"
  accent-text: "#7af6c3"
  accent-soft: "#0d261a"
  canvas: "#050807"
  surface: "#0b120e"
  inset: "#111c15"
  ink: "#f0f7f2"
  secondary: "#b7c9bd"
  tertiary: "#9cb3a5"
  line: "#213b2c"
  line-strong: "#345540"
  danger: "#ffaaa1"
  danger-soft: "#311916"
  light-primary: "#087b4e"
  light-primary-hover: "#05603a"
  light-on-primary: "#ffffff"
  light-primary-soft: "#e8f7ef"
  light-canvas: "#f4f8f5"
  light-inset: "#edf3ef"
  light-ink: "#0c1a12"
  light-secondary: "#465d50"
  light-line: "#dce8e0"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(48px, 5.1vw, 74px)"
    fontWeight: 550
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(32px, 3.4vw, 46px)"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  control: "10px"
  catalog-card: "14px"
  card: "16px"
  panel: "20px"
  large-panel: "24px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  control: "20px"
  lg: "24px"
  xl: "32px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-success:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  input:
    backgroundColor: "{colors.inset}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
  course-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.catalog-card}"
    padding: "20px 24px"
---

# Design System: Zuka

## Overview

**Creative North Star: "Matemáticas que conectan"**

La identidad une una base casi negra con verde menta, tipografía amplia y geometría matemática. La dirección elegida a partir de Sumz se adapta al propósito de Zuka: comprender las materias y avanzar con cursos, práctica y acompañamiento. Manrope y el destello existente conectan la portada con el producto.

La portada deja espacio al texto y a una figura paramétrica; el aprendizaje conserva una densidad más compacta, controles claros y una acción principal por reto. Este registro describe el código del rediseño. Se revisaron portada, servicios, escuelas, bienvenida, catálogo, entrenamiento y lectura en ambos temas, con vistas de escritorio, tableta y celular. Los pares principales de texto y botón cumplen 4,5:1; la instalación en un dispositivo físico no forma parte de esta comprobación.

**Key Characteristics:**

- Negro y menta compartidos por toda la experiencia.
- Manrope local, títulos amplios y contenido académico legible.
- Profundidad tonal, bordes discretos y geometría matemática local.
- Mascota cercana y profesional, con movimiento adaptable.

## Colors

La paleta tiene un acento verde y neutrales de matiz verde; error y advertencia mantienen su significado semántico.

### Primary

- **Menta:** marca, selección, acciones principales y avance en el tema oscuro; el hover aclara el mismo tono.
- **Verde de lectura:** variante principal del tema claro para texto y acciones con contraste. El acento de recompensas conserva la menta y usa su tinta oscura correspondiente.

### Neutral

- **Negro vegetal:** canvas y superficies oscuras, separados por luminosidad y bordes.
- **Tinta y niebla:** texto principal y secundario; sus roles se invierten en el tema claro.
- **Papel verde:** canvas claro, superficies blancas y campos suavemente teñidos.

**The One Green Rule.** Los cursos comparten la identidad verde; sus nombres de clase históricos no definen paletas independientes.

Los valores del frontmatter describen el tema oscuro salvo los nombres `light-*`. `src/identity.css` conserva el conjunto completo y las asignaciones de ambos temas. Las visitas nuevas empiezan en oscuro; una preferencia clara guardada se respeta.

## Typography

**Display Font:** Manrope, con Arial y sans-serif de respaldo.
**Body Font:** Manrope, con los mismos respaldos. KaTeX conserva las fuentes locales de las fórmulas.

**Character:** sans geométrica de lectura clara. La portada usa pesos medios y escala amplia; el producto usa títulos más compactos y fuertes.

### Hierarchy

- **Display:** título de portada; en móvil se adapta a `clamp(39px, 11.6vw, 56px)` con interlineado 1,16.
- **Headline:** títulos de secciones públicas; en móvil bajan a 30 px.
- **Title:** títulos de tarjeta de curso; las vistas de servicio y entrenamiento tienen su propia escala de 20–42 px según jerarquía.
- **Body:** base del producto; la introducción de portada usa 17 px/1,8 y un ancho máximo de 490 px, y 16 px en móvil.
- **Label:** controles de acción; los campos usan 16 px. Progreso y XP usan cifras tabulares.

## Layout

La portada usa un contenedor de hasta 1248 px, con margen lateral de 56 px en escritorio, 32 px bajo 1100 px y 18 px bajo 650 px. El hero combina dos columnas de proporciones 0,96/1,12; bajo 900 px se apila y conserva la figura matemática. Las secciones amplias usan 104 px de espacio vertical en escritorio y 48 px en móvil.

Servicios y escuelas usan filas separadas por bordes; las escuelas pasan de dos columnas a una. El producto conserva navegación lateral en escritorio y barra inferior en móvil, con cinco destinos. El carrusel de inicio usa una tarjeta por vista y desplazamiento táctil. La escala de espacio se apoya en múltiplos de 4 px; no todos los módulos tienen la misma densidad.

## Elevation & Depth

La separación principal procede de superficies tonales y bordes. Botones, tarjetas de catálogo y navegación activa no dependen de sombras. El diálogo de instalación mantiene una sombra ambiental (`0 24px 80px rgb(8 15 32 / .3)`). Sombras y colores residuales de módulos anteriores no se convierten en reglas para nuevas superficies.

**The Tonal Surface Rule.** Distinguir canvas, superficie y campo con los tokens compartidos antes de añadir elevación.

## Shapes

Controles con esquinas suaves; tarjetas compactas y paneles algo más redondeados. La tarjeta de catálogo usa radio de 14 px; controles generales, 10 px; acciones grandes de lección y carrusel, 16 px. Círculos y cápsulas aparecen en avatar, progreso y recompensas. El destello verde sigue siendo la silueta de identidad.

## Components

### Buttons

Una acción clara, fácil de tocar. Altura mínima general de 44 px, relleno de 12 × 20 px y radio de control. El primario usa menta y tinta oscura en oscuro, verde de lectura y blanco en claro. El secundario usa superficie, texto de marca y borde suave. Hover cambia el tono; foco visible de 3 px con separación de 3 px; deshabilitado al 50% de opacidad. Lección y carrusel usan acciones de al menos 54 px y tipografía de 17 px/800. El movimiento reducido suprime la respuesta animada.

### Chips

Las etiquetas de avance usan fondo de acento suave y texto de acento legible. Los filtros de escuela son controles de al menos 44 px, radio de 14 px y borde de 2 px; su selección cambia borde, fondo y texto y conserva `aria-pressed`.

### Cards / Containers

Las tarjetas de catálogo usan superficie, borde discreto y relleno de 20 × 24 px, reducido a 16 px en móvil. Hover destaca el borde. Título, descripción y progreso conservan los datos reales. Las filas de servicios y escuelas de la portada usan divisores y espacio, sin encerrar cada bloque en otra tarjeta.

### Inputs / Fields

Campos con etiqueta visible, fondo inset, borde fuerte neutral y radio de control. Los de perfil usan una altura mínima de 46 px, relleno horizontal de 14 px y texto de 16 px. El foco toma el color principal. Error y deshabilitado deben seguir identificándose mediante texto o estado además del color.

### Navigation

Texto secundario en reposo, tinta principal y fondo inset en hover, verde sobre fondo suave en selección. Controles de al menos 44 px. La navegación pública cambia a menú compacto bajo 850 px; la de producto conserva Inicio, Cursos, Entrenamiento, Tutorías y Perfil.

### Mathematical Surface

Canvas local de partículas y conexiones sobre una curva paramétrica, con fallback SVG y enlaces HTML independientes a las cuatro escuelas. Se adapta al tema, respeta movimiento reducido, se pausa fuera de pantalla o con la pestaña oculta y limpia su animación y observadores al cambiar de ruta. La figura comunica el mundo académico sin depender de imágenes remotas.

## Do's and Don'ts

### Do:

- **Do** usar los tokens compartidos de `src/identity.css` en ambos temas.
- **Do** conservar Manrope local, las fórmulas legibles y las cifras reales de progreso.
- **Do** mantener foco visible, etiquetas, estados accesibles y movimiento reducido.
- **Do** verificar móvil, tableta y escritorio antes de cerrar una entrega visual.

### Don't:

- **Don't** reintroducir cobalto y ámbar como identidad paralela por curso o componente.
- **Don't** sustituir la geometría matemática por una imagen remota sin una nueva decisión de diseño.
- **Don't** colorear ni deformar el QR de instalación.
- **Don't** añadir reseñas, cifras o resultados de aprendizaje inventados.
