-- Zuka · base de datos inicial (Supabase / PostgreSQL)
--
-- Guarda los datos de cada estudiante para sincronizarlos entre dispositivos.
-- El contenido (cursos, lecciones, retos) vive en el repositorio y no se guarda aquí.
--
-- Seguridad: todas las tablas tienen Row Level Security. Cada persona solo puede leer y
-- cambiar sus propias filas (auth.uid()). La clave publicable de la app no da acceso a más.
--
-- Cómo aplicarla: Supabase → SQL Editor → pega este archivo completo → Run.
-- Se puede ejecutar más de una vez sin duplicar nada.

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

-- Perfil: nombre visible, meta semanal y XP acumulados.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  weekly_goal smallint not null default 0 check (weekly_goal in (0, 2, 3, 5, 7)),
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lecciones completadas (identificadores como «fundamentos-matematicas-1»).
create table if not exists public.lesson_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id text not null check (char_length(lesson_id) between 1 and 80),
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Días con estudio: con ellos se calculan la racha, la semana y la meta semanal.
create table if not exists public.study_days (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null check (day between date '2024-01-01' and date '2100-12-31'),
  primary key (user_id, day)
);

-- Repasos de unidad superados («<curso>:<índice de la unidad>»).
create table if not exists public.unit_reviews (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  review_key text not null check (char_length(review_key) between 1 and 100),
  passed_at timestamptz not null default now(),
  primary key (user_id, review_key)
);

-- Contenidos guardados en «Mi biblioteca».
create table if not exists public.saved_resources (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  resource_id text not null check (char_length(resource_id) between 1 and 80),
  saved_at timestamptz not null default now(),
  primary key (user_id, resource_id)
);

-- ---------------------------------------------------------------------------
-- Row Level Security: cada persona solo ve y cambia lo suyo
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.study_days enable row level security;
alter table public.unit_reviews enable row level security;
alter table public.saved_resources enable row level security;

drop policy if exists "Perfil propio: leer" on public.profiles;
create policy "Perfil propio: leer" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Perfil propio: crear" on public.profiles;
create policy "Perfil propio: crear" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "Perfil propio: actualizar" on public.profiles;
create policy "Perfil propio: actualizar" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Progreso propio" on public.lesson_progress;
create policy "Progreso propio" on public.lesson_progress
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Días propios" on public.study_days;
create policy "Días propios" on public.study_days
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Repasos propios" on public.unit_reviews;
create policy "Repasos propios" on public.unit_reviews
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Guardados propios" on public.saved_resources;
create policy "Guardados propios" on public.saved_resources
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Permisos explícitos: nada para visitantes sin sesión; los XP solo cambian con las funciones de abajo.
revoke all on public.profiles, public.lesson_progress, public.study_days, public.unit_reviews, public.saved_resources from anon;
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant insert (id, display_name, weekly_goal) on public.profiles to authenticated;
grant update (display_name, weekly_goal) on public.profiles to authenticated;
grant select, insert, delete on public.lesson_progress, public.study_days, public.unit_reviews, public.saved_resources to authenticated;

-- ---------------------------------------------------------------------------
-- Funciones y disparadores
-- ---------------------------------------------------------------------------

-- Crea el perfil al registrarse, con el nombre que la persona ya tenía en la app.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 40))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Suma XP ganados (por retos, lecciones y repasos). Devuelve el total.
create or replace function public.add_xp(amount integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  total integer;
begin
  if auth.uid() is null then raise exception 'Se necesita una sesión'; end if;
  if amount is null or amount < 0 or amount > 5000 then raise exception 'Cantidad de XP no válida'; end if;
  insert into public.profiles (id) values (auth.uid()) on conflict (id) do nothing;
  update public.profiles set xp = xp + amount where id = auth.uid() returning xp into total;
  return total;
end;
$$;

-- Al unir un dispositivo con la cuenta, los XP quedan en el mayor de los dos valores.
create or replace function public.merge_xp(total integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  result integer;
begin
  if auth.uid() is null then raise exception 'Se necesita una sesión'; end if;
  if total is null or total < 0 or total > 10000000 then raise exception 'Cantidad de XP no válida'; end if;
  insert into public.profiles (id) values (auth.uid()) on conflict (id) do nothing;
  update public.profiles set xp = greatest(xp, total) where id = auth.uid() returning xp into result;
  return result;
end;
$$;

-- «Borrar mi progreso»: vacía el progreso de la cuenta y conserva el perfil.
create or replace function public.reset_progress()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Se necesita una sesión'; end if;
  delete from public.lesson_progress where user_id = auth.uid();
  delete from public.study_days where user_id = auth.uid();
  delete from public.unit_reviews where user_id = auth.uid();
  delete from public.saved_resources where user_id = auth.uid();
  update public.profiles set xp = 0 where id = auth.uid();
end;
$$;

-- «Eliminar mi cuenta»: borra la cuenta y, en cascada, todos sus datos.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Se necesita una sesión'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.add_xp(integer), public.merge_xp(integer), public.reset_progress(), public.delete_account() from public, anon;
grant execute on function public.add_xp(integer), public.merge_xp(integer), public.reset_progress(), public.delete_account() to authenticated;
