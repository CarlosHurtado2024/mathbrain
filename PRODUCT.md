# Zuka

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Estudiantes que se preparan para ingresar a la universidad o necesitan fortalecer sus conocimientos para avanzar y culminar su carrera. La plataforma se utiliza desde computadores, celulares y tabletas.

## Product Purpose

Ayudar a comprender las materias, preparar evaluaciones y superar dificultades académicas mediante cursos, práctica y acompañamiento. La meta es apoyar el ingreso, la permanencia y la culminación de los estudios.

## Operating Context

La visita desde el navegador comienza en una portada con los servicios de cursos de ingeniería y ciencias, asesoría en trabajos y exámenes y tutorías. En computador se ofrece un QR para llevar la app al celular; en móviles y tabletas se ofrece la instalación del navegador. También se puede continuar en la web.

La PWA instalada abre la bienvenida o el panel de aprendizaje. El menú principal contiene Inicio, Cursos, Entrenamiento, Tutorías y Perfil. Entrenamiento ofrece cuatro parciales de práctica por materia y simulacros por unidad, usando los ejercicios publicados.

## Capabilities and Constraints

- PWA estática en español, sin frameworks ni dependencias npm en el navegador. Se edita `src/` y el contenido se compila desde `content/`.
- Lecciones cortas, fórmulas, videos opcionales, ejercicios con pistas y soluciones, XP y progreso local.
- Las cuentas de correo y contraseña están en pausa mediante `emailAccounts: false`; la entrada crea o conserva un perfil local. Los identificadores y claves históricas `mathbrain-*` se conservan.
- Dos temas: claro y oscuro. Instalación y funcionamiento sin conexión tras preparar el contenido, excepto los videos externos.
- Los servicios con acompañamiento se consultan por WhatsApp al +57 324 354 6355. Precios, horarios y disponibilidad se consultan; no están definidos en el proyecto.
- Se conservan los programas PreICFES, preuniversitario y preingeniero y las escuelas de Matemáticas, Física, Estadística y Programación.

## Brand Commitments

Nombre visible: Zuka. Logo y mascota existentes: un destello con ojos. Tono cercano y profesional, sin infantilismos ni promesas de resultados garantizados.

## Evidence on Hand

El contenido real está en `content/` y los programas, escuelas y servicios en `src/courses.js` y `src/landing.js`. `docs/VISION.md` y `docs/DESIGN_SYSTEM.md` documentan el propósito y la identidad existente. Los simulacros son práctica con ese contenido; no se presentan como parciales oficiales de una universidad.

## Accessibility & Inclusion

Uso por toque y teclado, controles etiquetados, foco visible, contraste AA, respeto a movimiento reducido y vistas adaptables sin desplazamiento horizontal.
