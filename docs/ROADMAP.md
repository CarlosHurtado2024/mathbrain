# Hoja de ruta

Zuka avanza por etapas pequeñas: cada una se termina, se prueba en el celular y se publica antes de empezar la siguiente.

## ✅ Etapa 0 · Base (MathBrain → Euly)

- App web estática con cursos, catálogo, búsqueda y biblioteca.
- Lecciones en Markdown + LaTeX (KaTeX) con video opcional.
- Fundamentos de Matemáticas según su programa académico (31 lecciones, 5 unidades).
- Lecciones paso a paso, 155 retos, repasos por nivel, XP y racha.
- Mascota (destello verde), tema claro por defecto, icono propio, PWA instalable y sin conexión.
- Primer video incrustado (lección 1.1).

## ✅ Etapa 1 · Zuka profesional (versión 1.1)

- Nuevo nombre: **Zuka**.
- Proyecto reorganizado: `src/` (código) y `dist/` (compilado, fuera de Git), un solo comando de compilación.
- Documentación: `CLAUDE.md` y `docs/`.
- **Perfil del estudiante**: nombre, nivel por XP, racha y mejor racha, semana de estudio, avance por curso, copia de seguridad y borrado del progreso.
- Saludo por nombre en el inicio.
- Pruebas en el celular Android por USB (`adb reverse`), Wi-Fi o Vercel (`docs/PRUEBAS_ANDROID.md`).

## ✅ Etapa 1.2 · Rediseño de aprendizaje

- Inicio convertido en panel: saludo, siguiente lección, un único botón «Continuar aprendiendo» y la unidad en curso.
- Camino de unidades con lecciones completadas, actual, disponibles y bloqueadas.
- Retroalimentación que explica: al acertar se abre la solución y tras un error, la pista.
- Pantalla final sencilla con un solo botón «Continuar».
- Catálogo con tarjetas simples (nivel, duración, unidades, lecciones y progreso).
- Gamificación moderada: el contador de racha y XP se oculta hasta empezar, logros ocasionales y meta semanal opcional en el perfil.
- Videos verticales 9:16 (`formato: vertical`) y subtítulos en español activados.

## ✅ Etapa 1.3 · Paleta cobalto y ámbar y app de práctica activa

- Nueva paleta sin morado ni verde: azul cobalto para elegir y acertar, ámbar para avanzar, XP y racha; colores propios por curso. Mascota, logo e iconos en ámbar y cobalto.
- Inicio con carrusel de cursos (unidad, ilustración, lección actual y siguiente, botón «Empezar/Continuar»).
- Lección con barra inferior: «Comprobar», «¡Correcto! +XP · ¿Por qué?» y «Casi. · Intentar de nuevo».
- Catálogo con categorías en fila y cursos conectados; perfil con inicial y cifras en tarjetas.
- Pulido con Impeccable (crítica 25/40): fuera el fondo espacial animado del tema oscuro (tapaba «Continuar»); «Ver solución» pide confirmación y no salta el reto por accidente; contrastes AA, sin restos de verde azulado y textos funcionales de 11 px o más. Pendiente (P2): progreso y accesibilidad del carrusel, y lecciones con pasos más cortos y retroalimentación que diagnostica errores típicos.

## ✅ Etapa 1.4 · Entrada local sin registro

- Bienvenida con mascota y entrada mediante deslizamiento, toque o teclado.
- Perfil local «Estudiante», editable, con acceso completo y conservación del progreso.
- Landing comercial en `#conoce`; enlaces de lecciones y repasos conservan su destino al entrar.
- Cuentas en pausa mediante `emailAccounts: false`: sin inicializar el cliente de Supabase.
- Gestos cancelables y cancelación de la entrada pendiente al visitar otra página.

## ✅ Etapa 1.5 · Portada e instalación por dispositivo

- Portada de cursos de ingeniería y ciencias, asesorías y tutorías al abrir desde navegador; la PWA instalada conserva la bienvenida y el panel.
- QR local en computador y botón de instalación en celular o tableta, con instrucciones según el navegador.
- Tema claro/oscuro y menú Inicio, Cursos, Entrenamiento, Tutorías y Perfil.
- Cuatro parciales de práctica por materia y simulacros por unidad usando el contenido publicado.

## ✅ Plataforma modular · Fase 1: motor de lecciones por bloques

- Curso → unidad → lección → bloques en Supabase, con las 51 lecciones migradas.
- `lesson-engine.js`: un componente por tipo de bloque; el reproductor ya no depende de los tipos.
- Las lecciones se configuran desde la base de datos y conservan respaldo sin conexión.
- Cada lección se retoma en el bloque exacto, en el dispositivo y en `lesson_sessions` (sesión anónima).

## ✅ Plataforma modular · Fase 2: sistema de ejercicios

- 12 tipos de ejercicio con enunciado, visual opcional, respuesta esperada, validación, solución, pistas progresivas, intentos y retroalimentación que explica por qué.
- Diagnóstico automático de errores numéricos y simbólicos; explicaciones escritas para las 80 opciones incorrectas de opción múltiple.
- Registro de desempeño en el dispositivo y en `exercise_attempts`.
- Un ejercicio real de cada tipo nuevo en las lecciones.

## ✅ Plataforma modular · Fase 3: motores de visualización

- p5.js, JSXGraph y Three.js en `src/vendor/`, cargados solo cuando una lección los usa y guardados para usar sin conexión.
- 10 escenas: tablero de Galton, paseos aleatorios, Monte Carlo, secante y tangente, sumas de Riemann, límites, vectores, superficies, sólido de revolución y transformaciones lineales.
- Dos animaciones de Manim (49 y 42 s) con subtítulos en español y portada, generadas por `manim/render.py`.
- Controles HTML accesibles, lectura en vivo, pausa fuera de pantalla y movimiento reducido.

## 🔜 Plataforma modular · Fases siguientes

- Fase 4: unidades de microaprendizaje con secuencia flexible, `assessment` y `spaced_review`.
- Fase 5: rutas, metas diarias opcionales, habilidades, retos semanales, logros de dominio y recomendaciones de repaso.

## 🔜 Etapa 2 · Contenido completo

- Videos de todas las lecciones de Fundamentos de Matemáticas (YouTube «No listado»).
- Revisión pedagógica de las 51 lecciones y más retos en los cursos cortos.
- Ampliar Cálculo diferencial, Probabilidad, Inferencia y Cálculo integral a programas completos por unidades.
- Más simulaciones (funciones y transformaciones, distribución normal, regresión), incrustadas como pasos dentro de las lecciones.
- Nuevos tipos de reto: completar la expresión, relacionar conceptos, ordenar los pasos de una solución e interpretar una gráfica.
- Nuevas materias cuando haya contenido: ciencias, programación y preparación para exámenes de admisión.

## 🔜 Etapa 3 · Hábito y motivación

- Bienvenida guiada: elegir curso y meta diaria (5, 10 o 15 minutos).
- Meta diaria en minutos (además de la meta semanal en días que ya existe).
- **Practicar errores:** repaso espaciado de los retos fallados.
- Más logros, siempre discretos y ligados al aprendizaje.
- Recordatorios locales en la app instalada, si el navegador lo permite.

## ✅ Etapa 4 · Cuentas y sincronización (base, en pausa por configuración)

- Bienvenida para explorar o crear una cuenta con correo y contraseña: primera lección de cada curso sin cuenta; todo el contenido con sesión activa. Registro, acceso y recuperación tienen pantallas propias, además de la gestión de cuenta en el Perfil.
- Base de datos con Row Level Security: perfil, lecciones, días de estudio, repasos y guardados (`supabase/migrations/`).
- Sincronización entre dispositivos que une el progreso local con el de la cuenta y funciona sin conexión.

## 🔜 Etapa 4.1 · Cuentas: lo que sigue

- SMTP propio y plantillas de correo en español (ver `SUPABASE.md`).
- Evaluar el acceso con Google más adelante; la versión inicial solo usa correo electrónico y contraseña.
- Panel para docentes con el avance de un grupo.

## 🔜 Etapa 5 · Tiendas de aplicaciones

- Publicar en **Google Play** como Trusted Web Activity (con PWABuilder o Bubblewrap): la misma app web, sin reescribirla en Kotlin.
- Requisitos: dominio propio con HTTPS, `assetlinks.json`, capturas y ficha de la tienda, política de privacidad.
- Evaluar la App Store de iOS más adelante.

## Mejoras técnicas pendientes

- Publicar cada lección en su propio archivo y cargarla al abrirla (hoy `content.js` pesa unos 2,2 MB sin comprimir).
- Dominio propio para Zuka.
- Renombrar el repositorio de GitHub a `zuka` (Vercel sigue funcionando; hay que actualizar el remoto local).
- Pruebas de interfaz en un navegador real (por ejemplo, Playwright) para el flujo en el celular.
- Medir rendimiento y accesibilidad con Lighthouse en cada etapa.
