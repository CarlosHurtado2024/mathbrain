-- Zuka · funciones internas fuera de la API
--
-- handle_new_user (crea el perfil al registrarse) y rls_auto_enable (de Supabase: activa RLS en cada
-- tabla nueva) son disparadores: no deben poder llamarse desde la API. Los disparadores se ejecutan
-- igual sin este permiso.
--
-- add_xp, merge_xp, reset_progress y delete_account sí quedan disponibles para quien tiene sesión:
-- la app las usa y cada una solo actúa sobre la cuenta que la llama (auth.uid()).

revoke execute on function public.handle_new_user() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
