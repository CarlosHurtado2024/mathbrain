-- Zuka · motor de lecciones por bloques
--
-- 1. Contenido: curso → unidad → lección → bloques. Cada bloque es independiente y reutilizable
--    (concepto, ejemplo resuelto, ejercicio, video…). La app lee esta jerarquía con la clave publicable:
--    solo ve lo publicado y no puede escribirlo.
-- 2. Sesiones de lección: dónde quedó cada estudiante dentro de una lección (bloque, respuestas y XP
--    de esa pasada) para retomarla exactamente ahí, en este u otro dispositivo.
-- 3. Importador: copia a estas tablas las lecciones publicadas en content.js (compiladas desde
--    content/*.md). Las lecciones creadas directamente en la base de datos (source = 'database') no se tocan.

create table if not exists public.courses (
  id text primary key check (id ~ '^[a-z0-9-]{2,60}$'),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 600),
  position integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.units (
  id text primary key check (id ~ '^[a-z0-9-]{2,80}$'),
  course_id text not null references public.courses (id) on delete cascade,
  position integer not null check (position >= 0),
  title text not null check (char_length(title) between 1 and 160),
  summary text not null default '' check (char_length(summary) <= 1000),
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (course_id, position)
);

create table if not exists public.lessons (
  id text primary key check (id ~ '^[a-z0-9-]{2,80}$'),
  course_id text not null references public.courses (id) on delete cascade,
  unit_id text references public.units (id) on delete set null,
  position integer not null check (position >= 0),
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 600),
  minutes smallint not null default 3 check (minutes between 1 and 120),
  video text check (video is null or video ~ '^(https://|assets/videos/)'),
  video_format text check (video_format is null or video_format in ('vertical', 'horizontal')),
  tags text not null default '' check (char_length(tags) <= 400),
  key_idea text not null default '' check (char_length(key_idea) <= 2000),
  source text not null default 'database' check (source in ('markdown', 'database')),
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id text not null references public.lessons (id) on delete cascade,
  position integer not null check (position >= 0),
  type text not null check (type in ('challenge', 'video', 'concept', 'formula', 'worked_example', 'interactive_graph', 'simulation', 'exercise', 'step_by_step', 'visual_proof', 'application', 'assessment', 'summary', 'spaced_review')),
  html text not null default '' check (char_length(html) <= 200000),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  unique (lesson_id, position)
);

create index if not exists units_course_idx on public.units (course_id);
create index if not exists lessons_course_idx on public.lessons (course_id, position);
create index if not exists lessons_unit_idx on public.lessons (unit_id);

create table if not exists public.lesson_sessions (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id text not null check (char_length(lesson_id) between 1 and 80),
  block_index integer not null check (block_index >= 0),
  block_count integer not null check (block_count between 1 and 500 and block_index <= block_count),
  state jsonb not null default '{}'::jsonb check (jsonb_typeof(state) = 'object' and pg_column_size(state) <= 8192),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

drop trigger if exists courses_updated_at on public.courses;
create trigger courses_updated_at before update on public.courses for each row execute function public.touch_updated_at();
drop trigger if exists units_updated_at on public.units;
create trigger units_updated_at before update on public.units for each row execute function public.touch_updated_at();
drop trigger if exists lessons_updated_at on public.lessons;
create trigger lessons_updated_at before update on public.lessons for each row execute function public.touch_updated_at();
drop trigger if exists lesson_blocks_updated_at on public.lesson_blocks;
create trigger lesson_blocks_updated_at before update on public.lesson_blocks for each row execute function public.touch_updated_at();

-- Seguridad: el contenido publicado se lee sin sesión; se escribe desde el panel de Supabase o con el
-- importador. Cada sesión de lección pertenece a su estudiante (también a las sesiones anónimas).
alter table public.courses enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_blocks enable row level security;
alter table public.lesson_sessions enable row level security;

drop policy if exists "Cursos publicados" on public.courses;
create policy "Cursos publicados" on public.courses for select to anon, authenticated using (published);
drop policy if exists "Unidades publicadas" on public.units;
create policy "Unidades publicadas" on public.units for select to anon, authenticated using (published);
drop policy if exists "Lecciones publicadas" on public.lessons;
create policy "Lecciones publicadas" on public.lessons for select to anon, authenticated using (published);
drop policy if exists "Bloques de lecciones publicadas" on public.lesson_blocks;
create policy "Bloques de lecciones publicadas" on public.lesson_blocks for select to anon, authenticated
  using (exists (select 1 from public.lessons lesson where lesson.id = lesson_id and lesson.published));
drop policy if exists "Sesiones propias" on public.lesson_sessions;
create policy "Sesiones propias" on public.lesson_sessions for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.courses, public.units, public.lessons, public.lesson_blocks, public.lesson_sessions from anon, authenticated;
grant select on public.courses, public.units, public.lessons, public.lesson_blocks to anon, authenticated;
grant select, insert, update, delete on public.lesson_sessions to authenticated;

-- «Borrar mi progreso» también olvida dónde quedó cada lección.
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
  update public.profiles set xp = 0 where id = auth.uid();
end;
$$;

-- Cursos y unidades actuales (src/courses.js). Las lecciones llegan con el importador.
insert into public.courses (id, title, description, position) values
  ('fundamentos-matematicas', 'Fundamentos de Matemáticas', 'De los números reales a los números complejos. Aritmética, álgebra, funciones y trigonometría: la base para el cálculo y las ciencias.', 0),
  ('calculo-diferencial', 'Cálculo diferencial', 'El cambio tiene su propio lenguaje. Descubre los límites, las derivadas y las ideas que les dan sentido.', 1),
  ('probabilidad', 'Probabilidad', 'Dale sentido al azar. Una forma visual de pensar en la incertidumbre y los eventos que nos rodean.', 2),
  ('inferencia-estadistica', 'Inferencia estadística', 'De una muestra a una conclusión. Aprende a escuchar lo que los datos pueden decir y lo que no.', 3),
  ('calculo-integral', 'Cálculo integral', 'El poder de sumar lo pequeño. Descubre cómo las áreas nos ayudan a entender la acumulación.', 4)
on conflict (id) do update set title = excluded.title, description = excluded.description, position = excluded.position;

insert into public.units (id, course_id, position, title, summary) values
  ('fundamentos-matematicas-u1', 'fundamentos-matematicas', 0, 'Unidad 1 · Números reales y aritmética', 'Construye el piso sobre el que descansa todo el curso: los sistemas numéricos, el razonamiento proporcional, los porcentajes, las progresiones y la notación de sumatoria.'),
  ('fundamentos-matematicas-u2', 'fundamentos-matematicas', 1, 'Unidad 2 · Álgebra fundamental', 'El álgebra es el lenguaje con el que se escribe el resto de la matemática: exponentes, radicales, polinomios, factorización, expresiones racionales, ecuaciones y desigualdades.'),
  ('fundamentos-matematicas-u3', 'fundamentos-matematicas', 2, 'Unidad 3 · Funciones', 'La función describe cómo una cantidad depende de otra. Del plano cartesiano a las familias que usarás en cálculo: cuadráticas, polinómicas, racionales, exponenciales y logarítmicas.'),
  ('fundamentos-matematicas-u4', 'fundamentos-matematicas', 3, 'Unidad 4 · Trigonometría', 'De la medición indirecta de distancias al lenguaje de los fenómenos periódicos: ángulos, triángulos, la circunferencia unitaria, gráficas, identidades y ecuaciones.'),
  ('fundamentos-matematicas-u5', 'fundamentos-matematicas', 4, 'Unidad 5 · Números complejos', 'La unidad final completa los sistemas numéricos: los complejos resuelven toda ecuación polinómica y su forma trigonométrica une el álgebra con la trigonometría.'),
  ('calculo-diferencial-u1', 'calculo-diferencial', 0, 'Módulo 1 · El cambio y los límites', 'Del cambio medio a la idea de límite: la base para definir la derivada.'),
  ('calculo-diferencial-u2', 'calculo-diferencial', 1, 'Módulo 2 · La derivada y sus aplicaciones', 'Construye la derivada, aprende sus reglas y úsala para encontrar máximos y mínimos.'),
  ('probabilidad-u1', 'probabilidad', 0, 'Módulo 1 · Contar y medir el azar', 'Experimentos, espacios muestrales y técnicas de conteo para asignar probabilidades.'),
  ('probabilidad-u2', 'probabilidad', 1, 'Módulo 2 · Información, evidencia y variables', 'Cómo cambia la probabilidad con nueva información y cómo resumir el azar con números.'),
  ('inferencia-estadistica-u1', 'inferencia-estadistica', 0, 'Módulo 1 · De la muestra a la población', 'Cómo se eligen los datos y cuánto varían las medias de una muestra a otra.'),
  ('inferencia-estadistica-u2', 'inferencia-estadistica', 1, 'Módulo 2 · Estimar y contrastar', 'Intervalos de confianza, valores p y tamaño del efecto: decir con datos lo que se puede decir.'),
  ('calculo-integral-u1', 'calculo-integral', 0, 'Módulo 1 · Acumular y medir áreas', 'De los rectángulos a la integral definida como área con signo.'),
  ('calculo-integral-u2', 'calculo-integral', 1, 'Módulo 2 · El teorema fundamental y sus aplicaciones', 'La conexión entre derivar e integrar, las primitivas y sus usos en distancia y promedios.')
on conflict (id) do update set course_id = excluded.course_id, position = excluded.position, title = excluded.title, summary = excluded.summary;

-- Importador: lee content.js publicado (window.MATHBRAIN_CONTENT = [...]) y reemplaza las lecciones de
-- origen Markdown con sus bloques. El video de una lección pasa a ser su primer bloque, y las lecciones
-- Markdown que ya no existen se despublican. Solo lo ejecuta el dueño del proyecto, en el editor SQL:
--   select public.import_published_content();
create extension if not exists http with schema extensions;

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
      step.value ->> 'html',
      case step.value ->> 'type' when 'idea' then '{"variant":"key"}'::jsonb when 'note' then '{"variant":"note"}'::jsonb else '{}'::jsonb end
    from jsonb_array_elements(entry -> 'steps') with ordinality as step (value, ordinal)
  ) block;

  update public.lessons set published = false
  where source = 'markdown' and id not in (select entry ->> 'id' from jsonb_array_elements(payload) entry);

  select count(*) into total from public.lessons where source = 'markdown' and published;
  return total;
end;
$$;

revoke execute on function public.import_published_content(text) from public, anon, authenticated;
