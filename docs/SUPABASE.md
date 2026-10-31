# Configurar Supabase

Zuka usa [Supabase](https://supabase.com) para las cuentas de los estudiantes y para guardar su progreso en la nube. La cuenta es **opcional**: sin ella la app funciona igual y guarda el progreso en el dispositivo.

Proyecto: `https://bzzzufyjhzjqawwrduom.supabase.co`

## 1. Crear las tablas (una sola vez)

1. Entra a tu proyecto en [supabase.com/dashboard](https://supabase.com/dashboard).
2. Abre **SQL Editor → New query**.
3. Copia todo el contenido de [`supabase/migrations/20261031000000_zuka_inicial.sql`](../supabase/migrations/20261031000000_zuka_inicial.sql), pégalo y pulsa **Run**.
4. En **Table Editor** deben aparecer `profiles`, `lesson_progress`, `study_days`, `unit_reviews` y `saved_resources`, todas con el candado de **RLS enabled**.

El archivo se puede ejecutar de nuevo sin duplicar nada.

## 2. Direcciones permitidas

Los correos de confirmación y de nueva contraseña llevan de vuelta a la app. Supabase solo redirige a direcciones autorizadas.

**Authentication → URL Configuration**:

- **Site URL:** la dirección de Zuka en Vercel (por ejemplo `https://tu-proyecto.vercel.app`).
- **Redirect URLs**, añade:
  - `https://tu-proyecto.vercel.app/**`
  - `http://localhost:4173/**` (pruebas en el computador y en el celular con `adb reverse`)

## 3. Correos

Hoy está activa la **confirmación de correo** (quien se registra debe pulsar un enlace antes de entrar).

> **Importante:** el servicio de correo incluido en Supabase solo envía a los correos del equipo del proyecto y con un límite muy bajo por hora. Para que lleguen los correos a tus estudiantes, configura un SMTP propio en **Authentication → Emails → SMTP Settings** (por ejemplo [Resend](https://resend.com), [Brevo](https://www.brevo.com) o el correo de tu dominio).

Mientras no tengas SMTP propio, puedes desactivar la confirmación para hacer pruebas: **Authentication → Sign In / Providers → Email → Confirm email** (desactivado). Vuelve a activarla antes de abrir Zuka al público.

Para que los correos lleguen en español, edita las plantillas en **Authentication → Emails → Templates** («Confirm signup» y «Reset password»). Un ejemplo para la confirmación:

```html
<h2>Activa tu cuenta de Zuka</h2>
<p>Pulsa el enlace para confirmar tu correo y empezar a guardar tu progreso:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi correo</a></p>
```

## 4. Probar

1. `npm run dev` y abre `http://localhost:4173/#perfil`.
2. **Crear cuenta** con un correo tuyo. Abre el enlace del correo **en el mismo navegador** donde te registraste.
3. Completa una lección y revisa en **Table Editor → lesson_progress** que aparezca la fila.
4. Abre Zuka en otro dispositivo, inicia sesión y comprueba que llega el progreso.

## Cómo funciona

- `src/config.js` tiene la URL y la **clave publicable** (`sb_publishable_…`). Esa clave está hecha para ir en el navegador: lo que protege los datos es Row Level Security, que deja a cada persona leer y cambiar solo sus filas. **Nunca** pongas en la app la clave secreta (`sb_secret_…`) ni la `service_role`.
- `src/vendor/supabase/supabase.js` es la librería oficial `@supabase/supabase-js` 2.117.3 (licencia MIT), incluida en el proyecto para que funcione sin conexión y sin instalar nada.
- `src/cloud.js` maneja la sesión y la sincronización:
  - Al **iniciar sesión** (y cada vez que se abre la app con sesión) une el progreso del dispositivo con el de la cuenta: las lecciones, guardados, días y repasos se suman; los XP quedan en el mayor valor; el nombre y la meta de la cuenta mandan.
  - Con sesión, cada avance se envía al momento. **Sin conexión** queda pendiente y se sincroniza al volver.
  - **Cerrar sesión** sube lo pendiente y quita el progreso de ese dispositivo (sigue en la cuenta).
  - **Borrar mi progreso** lo borra también en la cuenta. **Eliminar mi cuenta** borra la cuenta y todos sus datos.
- El acceso usa el flujo PKCE: el enlace del correo vuelve a `/?code=…#perfil` y la app termina el inicio de sesión. Si se abre en otro navegador, la cuenta queda confirmada y la app pide iniciar sesión.

## Limitaciones conocidas

- Si quitas una lección o un guardado en un dispositivo sin conexión, puede volver a aparecer al sincronizar con otro dispositivo que aún lo tenga (la unión suma, no resta).
- Los XP ganados con sesión se suman en la cuenta, incluso sin conexión. Pero la primera vez que un dispositivo que ya tenía progreso se une a una cuenta que también tiene XP, se conserva el mayor de los dos totales (no se suman).
- Solo hay acceso con correo y contraseña. Google u otros proveedores se pueden añadir activándolos en **Authentication → Sign In / Providers**.
