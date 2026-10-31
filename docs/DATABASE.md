# Datos y almacenamiento

Zuka **no tiene servidor ni base de datos**. Hay dos tipos de datos:

1. **Contenido** (cursos, lecciones, simulaciones): se escribe en el repositorio y se publica con la app.
2. **Datos del estudiante** (progreso, XP, racha, perfil): se guardan en el `localStorage` del navegador, solo en ese dispositivo.

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

## Futuro: cuentas y sincronización

Si se añaden cuentas (etapa 4 de `ROADMAP.md`), el modelo propuesto es:

| Tabla | Campos principales |
| --- | --- |
| `usuarios` | id, nombre, correo, creado_en |
| `progreso_lecciones` | usuario_id, leccion_id, completada_en |
| `eventos_estudio` | usuario_id, fecha, xp, tipo (reto, lección, repaso) |
| `guardados` | usuario_id, recurso_id, guardado_en |

Mientras tanto, la app debe seguir funcionando sin cuenta y sin conexión, y al iniciar sesión por primera vez debe subir el progreso local.
