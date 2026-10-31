# Requisitos

Estado: ✅ hecho · 🔜 planificado (ver `ROADMAP.md`).

## Requisitos funcionales

### Cursos y contenido

| Id | Requisito | Estado |
| --- | --- | --- |
| RF-01 | Catálogo de cursos agrupado por área, con nivel, descripción, módulos y progreso | ✅ |
| RF-02 | Página de curso con camino de niveles: lecciones completadas, actual y siguientes | ✅ |
| RF-03 | Programa del curso: objetivos, habilidades, requisitos y módulos; descargable en texto | ✅ |
| RF-04 | Lecciones escritas en Markdown con fórmulas LaTeX compiladas con KaTeX | ✅ |
| RF-05 | Video opcional por lección (YouTube, Vimeo o archivo propio) | ✅ |
| RF-06 | Simulaciones interactivas y ejercicios resueltos asociados a cada módulo | ✅ |
| RF-07 | Búsqueda de contenidos sin tildes, con filtros de tema, formato y nivel | ✅ |

### Aprendizaje

| Id | Requisito | Estado |
| --- | --- | --- |
| RF-10 | Lección paso a paso: un concepto o reto por pantalla y barra de avance | ✅ |
| RF-11 | Retos numéricos (enteros, decimales con coma o punto, fracciones, porcentajes) y de opción múltiple | ✅ |
| RF-12 | Retroalimentación inmediata con pista, solución y mensaje de la mascota | ✅ |
| RF-13 | Vista de lectura con la lección completa | ✅ |
| RF-14 | Repaso de cada nivel (se supera con el 70 %) | ✅ |
| RF-15 | Practicar de nuevo los retos fallados (repaso espaciado) | 🔜 |

### Progreso y perfil

| Id | Requisito | Estado |
| --- | --- | --- |
| RF-20 | XP por retos, lecciones y repasos; niveles según los XP | ✅ |
| RF-21 | Racha de días seguidos de estudio | ✅ |
| RF-22 | Perfil: nombre, nivel, racha actual y mejor racha, semana, avance por curso | ✅ |
| RF-23 | Copia de seguridad del progreso (descargar y restaurar) y borrado | ✅ |
| RF-24 | Guardados («Mi biblioteca») y contenidos recientes | ✅ |
| RF-25 | Meta semanal opcional y logros | ✅ |
| RF-26 | Cuenta opcional (correo y contraseña, o Google) y sincronización entre dispositivos con Supabase | ✅ |
| RF-27 | Recuperar contraseña, cerrar sesión y eliminar la cuenta con todos sus datos | ✅ |

### App instalable

| Id | Requisito | Estado |
| --- | --- | --- |
| RF-30 | Instalación como PWA con icono propio (Android, iOS, escritorio) | ✅ |
| RF-31 | Uso sin conexión tras la primera visita (excepto videos) | ✅ |
| RF-32 | Aviso de nueva versión con actualización a petición | ✅ |
| RF-33 | Tema claro, oscuro o del sistema | ✅ |
| RF-34 | Publicación en Google Play como Trusted Web Activity | 🔜 |

## Requisitos no funcionales

| Id | Requisito |
| --- | --- |
| RNF-01 | **Mobile first:** usable desde 320 px de ancho sin desplazamiento horizontal; barra de navegación inferior en el celular. |
| RNF-02 | **Rendimiento:** la primera carga en 4G debe mostrar el inicio en menos de 3 s; las visitas siguientes cargan desde la caché. |
| RNF-03 | **Accesibilidad:** WCAG 2.1 AA: contraste, foco visible, etiquetas, MathML para lectores de pantalla, `prefers-reduced-motion`. |
| RNF-04 | **Privacidad:** la cuenta es opcional; sin ella nada sale del dispositivo. Con cuenta solo se guardan el correo, el nombre visible y el progreso, protegidos por Row Level Security. Sin rastreadores. |
| RNF-05 | **Sin frameworks:** HTML, CSS y JavaScript; las librerías del navegador (supabase-js) van copiadas en `src/vendor/`. Node.js solo para compilar y probar. |
| RNF-06 | **Idioma:** toda la interfaz y el contenido en español. |
| RNF-07 | **Calidad:** `npm test` en verde antes de cada commit; el contenido no compila si una fórmula o un ejercicio tiene errores. |
| RNF-08 | **Compatibilidad:** Chrome y Edge recientes, Safari iOS 16+, Firefox reciente; Android 10 o superior. |
| RNF-09 | **Despliegue:** cada push a `main` publica automáticamente en Vercel. |
