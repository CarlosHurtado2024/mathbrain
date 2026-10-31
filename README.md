# Zuka

**Tus sueños merecen un camino.** Zuka presenta programas de PreICFES, preuniversitario, preingeniero y cursos de ingeniería organizados por escuelas, además de tutorías y asesorías en trabajos y exámenes. Su plataforma de aprendizaje es una PWA con lecciones cortas de matemáticas y estadística, retos con respuesta inmediata, XP y rachas. Se instala en el celular o el computador y sigue disponible sin conexión.

Está pensada para estudiantes de secundaria, preuniversitarios y primeros semestres. Autor: Carlos Hurtado. (El proyecto se llamó antes MathBrain y luego Euly; el repositorio y los identificadores internos conservan el nombre original).

## Empezar

Necesitas [Node.js](https://nodejs.org) 20 o superior. No hay dependencias que instalar.

```bash
npm run dev
```

Abre `http://localhost:4173`. Para verla en tu celular Android, sigue [docs/PRUEBAS_ANDROID.md](docs/PRUEBAS_ANDROID.md).

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Compila y sirve la app en este equipo |
| `npm run dev:movil` | Igual, accesible desde el celular por Wi-Fi |
| `npm test` | Compila y ejecuta las pruebas |
| `npm run build` | Comprueba la sintaxis y genera `dist/` para publicar |

## Qué incluye

- **5 cursos:** Fundamentos de Matemáticas (31 lecciones en 5 unidades), Cálculo diferencial, Probabilidad, Inferencia estadística y Cálculo integral.
- **51 lecciones** escritas en Markdown con LaTeX (KaTeX), video opcional de YouTube y **155 retos** interactivos.
- **Lecciones paso a paso:** un concepto o un reto por pantalla, con retroalimentación de la mascota y la opción de leer la lección completa.
- **Camino de niveles** por curso, repasos de cada nivel, 6 simulaciones y 6 ejercicios resueltos.
- **Progreso:** XP, niveles, racha diaria y **perfil del estudiante** con su semana, sus cursos y sus logros.
- **Bienvenida:** explorar la plataforma o crear una cuenta con correo y contraseña. Sin cuenta se puede probar la primera lección de cada curso; con una sesión activa se accede a todas las lecciones, repasos, simulaciones y ejercicios, y el progreso se sincroniza con Supabase.
- **PWA:** instalable, sin conexión tras la primera visita y con aviso de actualización.
- Tema claro (por defecto), oscuro o del sistema.

## Estructura

```
src/       código de la app        content/  lecciones (.md)
scripts/   compilación             tests/    pruebas
docs/      documentación           dist/     salida compilada (generada)
```

## Documentación

- [Visión](docs/VISION.md) · [Requisitos](docs/REQUIREMENTS.md) · [Hoja de ruta](docs/ROADMAP.md)
- [Arquitectura](docs/ARCHITECTURE.md) · [Datos](docs/DATABASE.md) · [Sistema de diseño](docs/DESIGN_SYSTEM.md)
- [Escribir lecciones y programas](docs/CONTENIDO.md)
- [Probar en un celular Android](docs/PRUEBAS_ANDROID.md)
- [Cuentas y base de datos (Supabase)](docs/SUPABASE.md)
- [CLAUDE.md](CLAUDE.md): reglas para trabajar en el proyecto con Claude Code

## Publicación

Cada push a `main` en [CarlosHurtado2024/mathbrain](https://github.com/CarlosHurtado2024/mathbrain) se publica en Vercel, que ejecuta `npm run build` y sirve `dist/` (configurado en `vercel.json`). Detalles en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#despliegue).

KaTeX 0.16.22 (`vendor/katex/`, `src/vendor/katex/`) y supabase-js 2.117.3 (`src/vendor/supabase/`) se distribuyen con licencia MIT.
