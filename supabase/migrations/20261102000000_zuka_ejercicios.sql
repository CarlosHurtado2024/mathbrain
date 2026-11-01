-- Zuka · sistema de ejercicios
--
-- 1. Registro de desempeño: cada intento de cada ejercicio (tipo, número de intento, acierto, pistas usadas,
--    tiempo y un resumen de la respuesta). Cada estudiante solo lee y añade sus filas; no se editan.
-- 2. Importador: los bloques de content.js traen ahora su especificación en data (data.exercise para los
--    ejercicios). Se copia completa, además de la variante de los conceptos.

create table if not exists public.exercise_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id text not null default '' check (char_length(lesson_id) <= 80),
  exercise_key text not null check (char_length(exercise_key) between 1 and 120),
  kind text not null check (kind in ('choice', 'numeric', 'symbolic', 'equation', 'order', 'classify', 'graph', 'parameters', 'proof', 'simulation', 'error', 'context')),
  attempt smallint not null default 0 check (attempt between 0 and 999),
  correct boolean not null default false,
  revealed boolean not null default false,
  hints_used smallint not null default 0 check (hints_used between 0 and 99),
  duration_ms integer not null default 0 check (duration_ms between 0 and 86400000),
  response text not null default '' check (char_length(response) <= 300),
  created_at timestamptz not null default now()
);

create index if not exists exercise_attempts_user_idx on public.exercise_attempts (user_id, created_at desc);
create index if not exists exercise_attempts_exercise_idx on public.exercise_attempts (user_id, exercise_key);

alter table public.exercise_attempts enable row level security;

drop policy if exists "Intentos propios: leer" on public.exercise_attempts;
create policy "Intentos propios: leer" on public.exercise_attempts for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Intentos propios: registrar" on public.exercise_attempts;
create policy "Intentos propios: registrar" on public.exercise_attempts for insert to authenticated with check ((select auth.uid()) = user_id);

revoke all on public.exercise_attempts from anon, authenticated;
grant select, insert on public.exercise_attempts to authenticated;

-- «Borrar mi progreso» también borra el registro de desempeño.
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
  delete from public.lesson_sessions where user_id = auth.uid();
  delete from public.exercise_attempts where user_id = auth.uid();
  update public.profiles set xp = 0 where id = auth.uid();
end;
$$;

create or replace function public.import_published_content(address text default 'https://mathbrain-psi.vercel.app/content.js')
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  response extensions.http_response;
  payload jsonb;
  total integer;
begin
  response := extensions.http_get(address);
  if response.status <> 200 then raise exception 'No se pudo leer % (HTTP %)', address, response.status; end if;
  payload := substring(response.content from '=\s*(\[.*\])\s*;\s*$')::jsonb;
  if payload is null or jsonb_typeof(payload) <> 'array' or jsonb_array_length(payload) = 0 then raise exception 'content.js no tiene lecciones'; end if;

  with items as (
    select item, row_number() over (partition by item ->> 'courseId' order by ordinal) - 1 as position
    from jsonb_array_elements(payload) with ordinality as entries (item, ordinal)
  )
  insert into public.lessons as lesson (id, course_id, unit_id, position, title, description, minutes, video, video_format, tags, key_idea, source, published)
  select item ->> 'id', item ->> 'courseId',
    (select unit.id from public.units unit where unit.course_id = item ->> 'courseId' and unit.title = item ->> 'unit'),
    position, item ->> 'title', coalesce(item ->> 'description', ''), coalesce((item ->> 'minutes')::smallint, 3),
    item ->> 'video', case when item ->> 'video' is not null then coalesce(item ->> 'videoFormat', 'horizontal') end,
    coalesce(item ->> 'tags', ''), coalesce(item ->> 'key', ''), 'markdown', true
  from items
  on conflict (id) do update set course_id = excluded.course_id, unit_id = excluded.unit_id, position = excluded.position,
    title = excluded.title, description = excluded.description, minutes = excluded.minutes, video = excluded.video,
    video_format = excluded.video_format, tags = excluded.tags, key_idea = excluded.key_idea, published = true
  where lesson.source = 'markdown';

  delete from public.lesson_blocks block using public.lessons lesson
  where block.lesson_id = lesson.id and lesson.source = 'markdown'
    and lesson.id in (select entry ->> 'id' from jsonb_array_elements(payload) entry);

  -- Tipos del compilador → tipos del motor: idea y nota son conceptos con variante; ejemplo es un ejemplo resuelto.
  insert into public.lesson_blocks (lesson_id, position, type, html, data)
  select lesson.id, block.position, block.type, block.html, block.data
  from jsonb_array_elements(payload) entry
  join public.lessons lesson on lesson.id = entry ->> 'id' and lesson.source = 'markdown'
  cross join lateral (
    select 0 as position, 'video' as type, '' as html,
      jsonb_build_object('src', entry ->> 'video', 'format', coalesce(entry ->> 'videoFormat', 'horizontal')) as data
    where entry ->> 'video' is not null
    union all
    select (step.ordinal - 1 + case when entry ->> 'video' is not null then 1 else 0 end)::integer,
      case step.value ->> 'type' when 'idea' then 'concept' when 'note' then 'concept' when 'example' then 'worked_example' else step.value ->> 'type' end,
      coalesce(step.value ->> 'html', ''),
      coalesce(step.value -> 'data', '{}'::jsonb)
        || case step.value ->> 'type' when 'idea' then '{"variant":"key"}'::jsonb when 'note' then '{"variant":"note"}'::jsonb else '{}'::jsonb end
    from jsonb_array_elements(entry -> 'steps') with ordinality as step (value, ordinal)
  ) block;

  update public.lessons set published = false
  where source = 'markdown' and id not in (select entry ->> 'id' from jsonb_array_elements(payload) entry);

  select count(*) into total from public.lessons where source = 'markdown' and published;
  return total;
end;
$$;

revoke execute on function public.import_published_content(text) from public, anon, authenticated;
