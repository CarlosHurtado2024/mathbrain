# Datos y almacenamiento

Hay dos tipos de datos:

1. **Contenido** (cursos, lecciones, simulaciones): se escribe en el repositorio y se publica con la app. No está en la base de datos.
2. **Datos del estudiante** (progreso, XP, racha, perfil): se guardan en el `localStorage` del dispositivo y, si la persona tiene cuenta, también en **Supabase** (PostgreSQL), que los sincroniza entre dispositivos. La app lee siempre del dispositivo, así funciona sin conexión.

La configuración de Supabase está en [SUPABASE.md](SUPABASE.md).

## Datos del estudiante (`localStorage`)

Las claves conservan el prefijo `mathbrain-` del nombre original. **No se deben renombrar**: perderían el progreso de quienes ya usan la app.

| Clave | Tipo | Contenido |
| --- | --- | --- |
| `mathbrain-progress` | `string[]` | Identificadores de lecciones completadas, por ejemplo `"probabilidad-2"` |
| `mathbrain-stats` | objeto | Ver abajo |
| `mathbrain-saved` | `string[]` | Contenidos guardados en «Mi biblioteca» |
| `mathbrain-recent` | `string[]` | Contenidos abiertos recientemente (el más reciente primero) |
| `mathbrain-profile` | objeto | `{ "name": "Ana" }` (máximo 40 caracteres) |
| `mathbrain-theme` | `string` | `"light"`, `"dark"` o `"system"` |
| `mathbrain-space-paused` | `string` | `"true"` si se pausó el fondo animado |

`mathbrain-stats`:

```json
{
  "xp": 185,
  "streak": 3,
  "lastDay": "2026-10-31",
  "days": ["2026-10-25", "2026-10-29", "2026-10-30", "2026-10-31"],
  "reviews": ["fundamentos-matematicas:0"]
}
```

- `xp`: puntos acumulados. Reto acertado a la primera: 10; al segundo intento: 5; lección completada por primera vez: 20; repaso superado: 30.
- `streak` y `lastDay`: la racha sigue viva si `lastDay` es hoy o ayer.
- `days`: días con estudio (últimos 120), para la semana y la mejor racha del perfil.
- `reviews`: repasos superados, como `"<curso>:<índice del nivel desde 0>"`.
- **Nivel** (calculado, no se guarda): el nivel 2 pide 100 XP y cada nivel siguiente 50 XP más que el anterior (100, 150, 200…).

Todas las lecturas validan los datos: si están dañados o el almacenamiento está bloqueado, la app arranca con valores vacíos y sigue funcionando.

### Copia de seguridad

**Perfil → Descargar copia** genera `zuka-progreso-AAAA-MM-DD.json`:

```json
{
  "app": "zuka",
  "version": 1,
  "exportedAt": "2026-10-31T15:20:00.000Z",
  "data": { "mathbrain-progress": "[\"probabilidad-1\"]", "mathbrain-stats": "{…}" }
}
```

`data` guarda el texto original de cada clave. **Restaurar copia** acepta solo archivos con `"app": "zuka"` y claves conocidas, pide confirmación y recarga la app. **Borrar mi progreso** elimina todo menos el tema.

### Caché de la PWA

El service worker guarda los archivos de la app en Cache Storage con el nombre `mathbrain-shell-<hash>`. Al publicar una versión nueva se crea otra caché y la anterior se borra cuando la persona acepta actualizar.

## Modelo del contenido

### Curso (`src/courses.js`)

```js
{
  id: 'probabilidad',           // también nombra la carpeta content/probabilidad/
  title, description, intro, label, level, category, art, color,
  prerequisite, outcomes: [], skills: [],
  modules: [{ title: 'Módulo 1 · …', summary, objectives: [], extras: ['sim-azar'] }]
}
```

### Lección (`content/<curso>/NN-tema.md` → `dist/content.js`)

Identificador: `<curso>-<número de orden>` (por ejemplo `fundamentos-matematicas-1`). Campos compilados: `id`, `courseId`, `title`, `description`, `key` (la idea clave), `video`, `tags`, `unit`, `module`, `minutes`, `exercises`, `steps[]` (cada paso tiene `type` —`concept`, `idea`, `example`, `note` o `exercise`— y su HTML). El formato de escritura está en `CONTENIDO.md`.

### Recursos (`src/library.js`)

Simulaciones (`sim-*`) y ejercicios resueltos (`ej-*`) con tema, nivel, etiquetas de búsqueda y, en los ejercicios, la respuesta (`check`) con su tolerancia.

## Base de datos en la nube (Supabase)

Esquema: [`supabase/migrations/`](../supabase/migrations/) (aplicado en el proyecto `zuka`). Las cuentas las gestiona Supabase Auth (`auth.users`); al registrarse se crea su perfil. Borrar una cuenta borra en cascada todos sus datos.

| Tabla | Columnas | Equivale en el dispositivo a |
| --- | --- | --- |
| `profiles` | `id` (= `auth.users.id`), `display_name`, `avatar_url` (foto de Google), `weekly_goal` (0, 2, 3, 5, 7), `xp`, `created_at`, `updated_at` | `mathbrain-profile` y `xp` de `mathbrain-stats` |
| `lesson_progress` | `user_id`, `lesson_id`, `completed_at` | `mathbrain-progress` |
| `study_days` | `user_id`, `day` | `days` de `mathbrain-stats` (racha y semana) |
| `unit_reviews` | `user_id`, `review_key`, `passed_at` | `reviews` de `mathbrain-stats` |
| `saved_resources` | `user_id`, `resource_id`, `saved_at` | `mathbrain-saved` |

Las tablas de progreso usan la clave primaria `(user_id, …)`, así una lección o un día no se repiten.

**Seguridad.** Todas las tablas tienen Row Level Security: cada persona solo lee y cambia sus filas (`auth.uid() = user_id`). Los visitantes sin sesión no tienen acceso. Los XP no se escriben directamente: cambian con funciones.

| Función | Para qué |
| --- | --- |
| `add_xp(amount)` | Suma los XP ganados (retos, lecciones, repasos) |
| `merge_xp(total)` | Al unir un dispositivo con la cuenta, deja el mayor de los dos totales |
| `reset_progress()` | «Borrar mi progreso»: vacía el progreso y deja el perfil |
| `delete_account()` | «Eliminar mi cuenta»: borra la cuenta y todos sus datos |

**Sincronización** (`src/cloud.js`). Al iniciar sesión, y cada vez que se abre la app con sesión, el progreso del dispositivo y el de la cuenta se unen en ambos sentidos. Con sesión, cada avance se envía al momento; sin conexión queda pendiente en `zuka-sync-pending` (`{ xp, full }`) y se envía al volver. La sesión de Supabase se guarda en `zuka-auth`.

Cambiar el esquema: crea un archivo nuevo en `supabase/migrations/` (no edites el que ya se aplicó) y ejecútalo en el SQL Editor.
