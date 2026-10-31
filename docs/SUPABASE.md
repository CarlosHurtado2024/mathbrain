# Configurar Supabase

Zuka usa [Supabase](https://supabase.com) para las cuentas de los estudiantes y para guardar su progreso en la nube. El registro y el inicio de sesión se hacen únicamente con **correo electrónico y contraseña**. Sin cuenta se puede explorar el catálogo y probar la primera lección de cada curso; una sesión activa habilita todas las lecciones, repasos, simulaciones y ejercicios.

Proyecto: `https://bzzzufyjhzjqawwrduom.supabase.co`

## 1. Base de datos ✅

Ya está aplicada en el proyecto (31 de octubre de 2026) con las migraciones de [`supabase/migrations/`](../supabase/migrations/), en este orden:

| Migración | Qué hace |
| --- | --- |
| `20261031000000_zuka_inicial.sql` | Tablas, Row Level Security, perfil al registrarse y funciones de XP, borrado de progreso y de cuenta |
| `20261031010000_zuka_cuentas_google.sql` | Foto del perfil y nombre tomados de Google; permisos mínimos (leer, añadir y borrar) en las tablas de progreso |
| `20261031020000_zuka_permisos_funciones.sql` | Los disparadores internos dejan de poder llamarse desde la API |

Comprobado en el proyecto: cada persona solo ve sus filas, los visitantes sin sesión no tienen acceso, los XP solo cambian con las funciones y el perfil de Google se crea con el primer nombre y la foto. El asesor de seguridad de Supabase solo avisa de `add_xp`, `merge_xp`, `reset_progress` y `delete_account`, que son intencionales: la app las usa y cada una solo actúa sobre la cuenta que la llama.

Para cambiar el esquema, añade una migración nueva (no edites las aplicadas). Con el conector de Supabase en Claude Code se aplica directamente; si no, pégala en **SQL Editor → Run**.

## 1b. Acceso con correo y contraseña

En **Authentication → Sign In / Providers → Email**, mantén activo el proveedor Email y permite crear cuentas. La app pide una contraseña de al menos 8 caracteres al registrarse o cambiarla; usa ese mismo mínimo en la configuración de contraseñas de Supabase.

Comprobado el 31 de octubre de 2026: Email está activo, el registro está permitido, la confirmación de correo está activa y Google está desactivado.

En **Perfil** se puede **Crear cuenta**, **Iniciar sesión** y recuperar la contraseña con **¿Olvidaste tu contraseña?**. La app no incluye botones ni flujo de acceso con Google, aunque ese proveedor se active en Supabase. Su integración queda para una etapa posterior.

La bienvenida enlaza también a las pantallas `#registro` y `#ingresar`. Registrarse no desbloquea contenido mientras falte confirmar el correo: hace falta una sesión activa. El destino solicitado se conserva en `sessionStorage` (`zuka-auth-return`) para retomarlo después de confirmar e iniciar sesión en el mismo navegador. Solo se admiten rutas internas de contenido, curso y repaso. No se guarda la contraseña en ese almacenamiento.

Las migraciones ya aplicadas se conservan, incluida la que añadió el campo opcional de foto de perfil. No hace falta cambiar la base de datos para usar solo correo y contraseña.

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
2. **Crear cuenta** con un correo tuyo y una contraseña de al menos 8 caracteres. Abre el enlace del correo **en el mismo navegador** donde te registraste.
3. Completa una lección y revisa en **Table Editor → lesson_progress** que aparezca la fila.
4. Abre Zuka en otro dispositivo, inicia sesión y comprueba que llega el progreso.
5. Cierra sesión, entra en **Iniciar sesión → ¿Olvidaste tu contraseña?** y comprueba que el enlace permite guardar una contraseña nueva.

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

- El acceso al contenido se limita en la navegación de la PWA (incluidos enlaces directos, buscador, temarios y cambios de sesión). El material sigue formando parte de archivos estáticos públicos y de la caché para uso sin conexión; esta limitación no equivale a servir contenido privado desde un servidor. Los datos personales del estudiante sí siguen protegidos por Row Level Security en Supabase.

- Si quitas una lección o un guardado en un dispositivo sin conexión, puede volver a aparecer al sincronizar con otro dispositivo que aún lo tenga (la unión suma, no resta).
- Los XP ganados con sesión se suman en la cuenta, incluso sin conexión. Pero la primera vez que un dispositivo que ya tenía progreso se une a una cuenta que también tiene XP, se conserva el mayor de los dos totales (no se suman).
- El único acceso implementado es correo electrónico y contraseña. Google y otros proveedores quedan fuera de esta versión.
