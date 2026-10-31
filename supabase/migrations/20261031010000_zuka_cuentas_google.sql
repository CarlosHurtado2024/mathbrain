-- Zuka · cuentas con Google y permisos mínimos
--
-- 1. Perfil con foto: al entrar con Google se guardan el nombre y la foto de la cuenta.
-- 2. Permisos mínimos: en las tablas de progreso, quien tiene sesión solo puede leer, añadir y
--    borrar sus filas (Row Level Security ya limita las filas). Se quitan los permisos que Supabase
--    concede por defecto y la app no usa (UPDATE, TRUNCATE, REFERENCES, TRIGGER).

alter table public.profiles
  add column if not exists avatar_url text check (avatar_url is null or (char_length(avatar_url) <= 500 and avatar_url like 'https://%'));

-- El nombre llega de Zuka (display_name) o de Google: de su nombre completo se usa el primero, para saludar
-- con naturalidad («Hola, Carlos»); la persona puede cambiarlo en su perfil. La foto llega de Google (avatar_url / picture).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  photo text := coalesce(meta ->> 'avatar_url', meta ->> 'picture');
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(trim(coalesce(nullif(meta ->> 'display_name', ''), split_part(trim(coalesce(meta ->> 'full_name', meta ->> 'name', '')), ' ', 1))), 40),
    case when photo like 'https://%' and char_length(photo) <= 500 then photo end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on public.lesson_progress, public.study_days, public.unit_reviews, public.saved_resources from authenticated;
grant select, insert, delete on public.lesson_progress, public.study_days, public.unit_reviews, public.saved_resources to authenticated;
