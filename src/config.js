// Conexión con Supabase (cuentas y sincronización del progreso).
// La clave publicable está pensada para ir en el navegador: los datos los protege Row Level Security
// (supabase/migrations). Nunca pongas aquí la clave secreta (sb_secret_…) ni la service_role.
window.ZUKA_CONFIG = {
  supabaseUrl: 'https://bzzzufyjhzjqawwrduom.supabase.co',
  supabaseKey: 'sb_publishable_g9nE6w3Da54IrmHbeKkXQg_iWR8eiAC'
};
