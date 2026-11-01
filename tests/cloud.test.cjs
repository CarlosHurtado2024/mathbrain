const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../src/cloud.js'), 'utf8');
const USER = { id: 'u-1', email: 'ana@ejemplo.com' };

// Supabase falso en memoria: tablas por usuario, funciones RPC y un auth mínimo.
function fakeSupabase(initial = {}, { confirmEmail = true, initialSession = null, anonymous = true } = {}) {
  const db = { profiles: [], lesson_progress: [], saved_resources: [], study_days: [], unit_reviews: [], lesson_sessions: [], ...initial };
  const calls = [];
  let authListener = null;
  let online = true;
  class Query {
    constructor(table) { this.table = table; this.filters = []; this.action = 'select'; }
    select() { if (this.action === 'select') this.action = 'select'; return this; }
    eq(column, value) { this.filters.push([column, value]); return this; }
    in(column, values) { this.filters.push([column, values, 'in']); return this; }
    order() { return this; }
    limit() { return this; }
    maybeSingle() { this.single = true; return this; }
    upsert(rows, options) { this.action = 'upsert'; this.rows = [].concat(rows); this.options = options; return this; }
    insert(rows) { this.action = 'insert'; this.rows = [].concat(rows); return this; }
    update(values) { this.action = 'update'; this.values = values; return this; }
    delete() { this.action = 'delete'; return this; }
    run() {
      if (!online) return { data: null, error: { message: 'Failed to fetch' } };
      calls.push({ table: this.table, action: this.action, rows: this.rows, values: this.values, filters: this.filters });
      const table = db[this.table];
      const matches = row => this.filters.every(([column, value, kind]) => kind === 'in' ? value.includes(row[column]) : row[column] === value);
      if (this.action === 'select') {
        const rows = table.filter(matches);
        return { data: this.single ? rows[0] || null : rows, error: null };
      }
      if (this.action === 'upsert' || this.action === 'insert') {
        const keys = (this.options?.onConflict || 'id').split(',');
        for (const row of this.rows) {
          const existing = table.find(entry => keys.every(key => entry[key] === row[key]));
          if (!existing) table.push({ ...row });
          else if (!this.options?.ignoreDuplicates) Object.assign(existing, row);
        }
        return { data: null, error: null };
      }
      if (this.action === 'update') { table.filter(matches).forEach(row => Object.assign(row, this.values)); return { data: null, error: null }; }
      db[this.table] = table.filter(row => !matches(row));
      return { data: null, error: null };
    }
    then(resolve, reject) { return Promise.resolve(this.run()).then(resolve, reject); }
  }
  const client = {
    from: table => new Query(table),
    rpc: async (name, args) => {
      if (!online) return { data: null, error: { message: 'Failed to fetch' } };
      calls.push({ rpc: name, args });
      let profile = db.profiles.find(row => row.id === USER.id);
      if (!profile) db.profiles.push(profile = { id: USER.id, display_name: '', weekly_goal: 0, xp: 0 });
      if (name === 'add_xp') profile.xp += args.amount;
      if (name === 'merge_xp') profile.xp = Math.max(profile.xp, args.total);
      return { data: profile.xp, error: null };
    },
    auth: {
      onAuthStateChange: callback => { authListener = callback; return { data: { subscription: { unsubscribe() {} } } }; },
      getSession: async () => ({ data: { session: initialSession } }),
      signUp: async options => {
        calls.push({ signup: options });
        const session = confirmEmail ? null : { user: USER };
        if (session) authListener('SIGNED_IN', session);
        return { data: { session, user: session?.user || { id: 'nuevo' } }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        calls.push({ signin: { email, password } });
        return email === USER.email && password === 'correcta-123' ? (authListener('SIGNED_IN', { user: USER }), { error: null }) : { error: { code: 'invalid_credentials', message: 'Invalid login credentials' } };
      },
      signInAnonymously: async options => {
        calls.push({ anonymous: options });
        if (!anonymous) return { data: null, error: { code: 'anonymous_provider_disabled', message: 'Anonymous sign-ins are disabled' } };
        authListener('SIGNED_IN', { user: { ...USER, email: '', is_anonymous: true } });
        return { data: {}, error: null };
      },
      signOut: async () => { authListener('SIGNED_OUT', null); return { error: null }; },
      resetPasswordForEmail: async (email, options) => { calls.push({ reset: { email, ...options } }); return { error: null }; },
      updateUser: async options => { calls.push({ updateUser: options }); return { error: null }; }
    }
  };
  return { db, calls, client, setOnline: value => { online = value; }, signIn: () => authListener('SIGNED_IN', { user: USER }), recoverPassword: () => authListener('PASSWORD_RECOVERY', { user: USER }) };
}

function environment({ supabase = fakeSupabase(), storage = {}, emailAccounts = true } = {}) {
  const stored = new Map(Object.entries(storage).map(([key, value]) => [key, JSON.stringify(value)]));
  const events = [];
  const listeners = {};
  const navigator = { onLine: true };
  let clientsCreated = 0;
  const window = {
    ZUKA_CONFIG: { supabaseUrl: 'https://ejemplo.supabase.co', supabaseKey: 'sb_publishable_prueba', emailAccounts },
    supabase: supabase && { createClient: () => { clientsCreated++; return supabase.client; } },
    dispatchEvent: event => events.push(event.detail.reason),
    addEventListener: (name, callback) => { listeners[name] = callback; }
  };
  const context = vm.createContext({
    window, navigator, URL, setTimeout, Promise,
    location: { href: 'https://zuka.app/#perfil', origin: 'https://zuka.app', pathname: '/' },
    history: { state: null, replaceState() {} },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } },
    localStorage: { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) }
  });
  vm.runInContext(source, context);
  const read = key => JSON.parse(stored.get(key) ?? 'null');
  return { cloud: window.ZUKA_CLOUD, supabase, events, navigator, listeners, read, get clientsCreated() { return clientsCreated; } };
}

const settle = () => new Promise(resolve => setTimeout(resolve, 5));

test('La sesión guardada se restaura antes de dar la cuenta por preparada', async () => {
  const env = environment({ supabase: fakeSupabase({}, { initialSession: { user: USER } }) });
  assert.equal(env.cloud.state.ready, false);
  await settle();
  assert.equal(env.cloud.state.ready, true);
  assert.equal(env.cloud.state.user.id, USER.id);
  await env.cloud.syncNow();
  assert.equal(env.cloud.state.status, 'synced');
});

test('La unión conserva todo el progreso de ambos lados y recalcula la racha', () => {
  const { cloud } = environment();
  const merged = cloud.mergeState(
    { progress: ['a', 'b'], saved: ['s1'], days: ['2026-10-29', '2026-10-30'], reviews: ['curso:0'], xp: 120, name: 'Ana', goal: 3 },
    { progress: ['b', 'c'], saved: ['s2'], days: ['2026-10-31', '2026-10-20'], reviews: [], xp: 90, name: '', goal: 0 }
  );
  assert.deepEqual(Array.from(merged.progress), ['a', 'b', 'c']);
  assert.deepEqual(Array.from(merged.saved), ['s1', 's2']);
  assert.deepEqual(Array.from(merged.days), ['2026-10-20', '2026-10-29', '2026-10-30', '2026-10-31']);
  assert.equal(merged.xp, 120);
  assert.equal(merged.name, 'Ana');
  assert.equal(merged.goal, 3);
  assert.equal(merged.streak, 3);
  assert.equal(merged.lastDay, '2026-10-31');
  assert.deepEqual({ ...cloud.streakFrom([]) }, { streak: 0, lastDay: null });
});

test('Al iniciar sesión, el progreso del dispositivo y el de la cuenta se unen en ambos lados', async () => {
  const supabase = fakeSupabase({
    profiles: [{ id: USER.id, display_name: 'Ana', weekly_goal: 5, xp: 30 }],
    lesson_progress: [{ user_id: USER.id, lesson_id: 'probabilidad-1' }],
    saved_resources: [{ user_id: USER.id, resource_id: 'sim-azar' }]
  });
  const env = environment({ supabase, storage: { 'mathbrain-progress': ['fundamentos-matematicas-1'], 'mathbrain-stats': { xp: 50, streak: 1, lastDay: '2026-10-31', days: ['2026-10-31'], reviews: [] } } });
  await settle();
  assert.equal(env.cloud.state.available, true);
  assert.equal(env.cloud.state.ready, true);
  await env.cloud.signIn(USER.email, 'correcta-123');
  await settle();
  await env.cloud.syncNow();
  assert.deepEqual(env.read('mathbrain-progress'), ['fundamentos-matematicas-1', 'probabilidad-1']);
  assert.deepEqual(env.read('mathbrain-saved'), ['sim-azar']);
  assert.deepEqual(env.read('mathbrain-profile'), { name: 'Ana', goal: 5 });
  assert.equal(env.read('mathbrain-stats').xp, 50);
  assert.deepEqual(supabase.db.lesson_progress.map(row => row.lesson_id).sort(), ['fundamentos-matematicas-1', 'probabilidad-1']);
  assert.deepEqual(supabase.db.study_days.map(row => row.day), ['2026-10-31']);
  assert.equal(supabase.db.profiles[0].xp, 50, 'Los XP quedan en el mayor valor');
  assert.equal(env.cloud.state.status, 'synced');
  assert.ok(env.events.includes('sync'));
});

test('Con sesión, cada avance se envía al momento y quitar un guardado lo borra de la cuenta', async () => {
  const supabase = fakeSupabase({ profiles: [{ id: USER.id, display_name: '', weekly_goal: 0, xp: 0 }] });
  const env = environment({ supabase });
  await settle();
  supabase.signIn();
  await settle();
  await env.cloud.syncNow();
  await env.cloud.record('lesson', { id: 'calculo-integral-1', done: true });
  await env.cloud.record('saved', { id: 'sim-riemann', on: true });
  await env.cloud.record('xp', { amount: 10 });
  await env.cloud.record('day', { day: '2026-10-31' });
  await env.cloud.record('review', { key: 'calculo-integral:0' });
  await env.cloud.record('profile', { name: 'Leo', goal: 3 });
  assert.deepEqual(supabase.db.lesson_progress.map(row => row.lesson_id), ['calculo-integral-1']);
  assert.deepEqual(supabase.db.saved_resources.map(row => row.resource_id), ['sim-riemann']);
  assert.equal(supabase.db.profiles[0].xp, 10);
  assert.deepEqual(supabase.db.unit_reviews.map(row => row.review_key), ['calculo-integral:0']);
  assert.equal(supabase.db.profiles[0].display_name, 'Leo');
  await env.cloud.record('saved', { id: 'sim-riemann', on: false });
  await env.cloud.record('lesson', { id: 'calculo-integral-1', done: false });
  assert.equal(supabase.db.saved_resources.length, 0);
  assert.equal(supabase.db.lesson_progress.length, 0);
  assert.equal(env.read('zuka-sync-pending').xp, 0);
});

test('Sin conexión los cambios esperan y se sincronizan al volver a estar en línea', async () => {
  const supabase = fakeSupabase({ profiles: [{ id: USER.id, display_name: '', weekly_goal: 0, xp: 0 }] });
  const env = environment({ supabase, storage: { 'mathbrain-stats': { xp: 0, days: [], reviews: [] } } });
  await settle();
  supabase.signIn();
  await settle();
  await env.cloud.syncNow();
  supabase.setOnline(false);
  env.navigator.onLine = false;
  await env.cloud.record('xp', { amount: 15 });
  await env.cloud.record('lesson', { id: 'probabilidad-2', done: true });
  assert.equal(env.cloud.state.status, 'offline');
  assert.equal(supabase.db.lesson_progress.length, 0);
  assert.deepEqual({ ...env.read('zuka-sync-pending') }, { xp: 15, full: true });
  // Vuelve la conexión: se envían los XP pendientes y se sincroniza todo.
  supabase.setOnline(true);
  env.navigator.onLine = true;
  env.listeners.online();
  await settle();
  await env.cloud.syncNow();
  assert.equal(supabase.db.profiles[0].xp, 15);
  assert.deepEqual({ ...env.read('zuka-sync-pending') }, { xp: 0, full: false });
  assert.equal(env.cloud.state.status, 'synced');
});

test('Los errores de acceso se explican en español y cerrar sesión deja el dispositivo limpio', async () => {
  const supabase = fakeSupabase({ profiles: [{ id: USER.id, display_name: 'Ana', weekly_goal: 0, xp: 40 }] });
  const env = environment({ supabase, storage: { 'mathbrain-theme': 'dark' } });
  await settle();
  await assert.rejects(env.cloud.signIn(USER.email, 'otra'), error => env.cloud.describe(error) === 'El correo o la contraseña no coinciden.');
  assert.equal(env.cloud.describe({ code: 'email_not_confirmed' }), 'Primero confirma tu correo con el enlace que te enviamos.');
  assert.equal(env.cloud.describe({ code: 'over_email_send_rate_limit' }), 'Demasiados intentos seguidos. Espera unos minutos.');
  assert.equal(env.cloud.describe({ message: 'Failed to fetch' }), 'No hay conexión. Inténtalo cuando vuelvas a estar en línea.');
  assert.deepEqual({ ...await env.cloud.signUp('nuevo@ejemplo.com', 'segura-123') }, { needsConfirmation: true });
  await env.cloud.signIn(USER.email, 'correcta-123');
  await settle();
  await env.cloud.syncNow();
  assert.equal(env.read('mathbrain-stats').xp, 40);
  await env.cloud.signOut();
  await settle();
  assert.equal(env.read('mathbrain-stats'), null);
  assert.equal(env.read('mathbrain-theme'), 'dark', 'El tema se conserva');
  assert.equal(env.cloud.state.user, null);
});

test('El registro envía correo y contraseña, conserva el nombre y devuelve la confirmación al perfil', async () => {
  const env = environment({ storage: { 'mathbrain-profile': { name: 'Ana', goal: 3 } } });
  const result = await env.cloud.signUp(USER.email, 'segura-123');
  assert.equal(result.needsConfirmation, true);
  assert.deepEqual(JSON.parse(JSON.stringify(env.supabase.calls.find(call => call.signup).signup)), {
    email: USER.email,
    password: 'segura-123',
    options: { emailRedirectTo: 'https://zuka.app/#perfil', data: { display_name: 'Ana' } }
  });
  assert.equal(env.cloud.state.user, null, 'Sin confirmar el correo no se inicia sesión');
  assert.equal(env.read('mathbrain-profile').name, 'Ana');
});

test('El registro inicia sesión si Supabase no exige confirmación de correo', async () => {
  const env = environment({ supabase: fakeSupabase({}, { confirmEmail: false }) });
  assert.equal((await env.cloud.signUp(USER.email, 'correcta-123')).needsConfirmation, false);
  await settle();
  await env.cloud.syncNow();
  assert.equal(env.cloud.state.user.email, USER.email);
  assert.equal(env.cloud.state.status, 'synced');
});

test('La recuperación envía un enlace al perfil y permite guardar una nueva contraseña', async () => {
  const env = environment();
  await env.cloud.requestPasswordReset(USER.email);
  assert.deepEqual(env.supabase.calls.find(call => call.reset).reset, { email: USER.email, redirectTo: 'https://zuka.app/#perfil' });
  env.supabase.recoverPassword();
  await settle();
  assert.equal(env.cloud.state.recovery, true);
  await env.cloud.updatePassword('nueva-segura-123');
  assert.equal(env.supabase.calls.find(call => call.updateUser).updateUser.password, 'nueva-segura-123');
  assert.equal(env.cloud.state.recovery, false);
  assert.equal(env.cloud.state.user.email, USER.email);
});

test('Sin Supabase la app sigue funcionando: la cuenta no está disponible y no se envía nada', async () => {
  const env = environment({ supabase: null });
  assert.equal(env.cloud.state.available, false);
  assert.equal(env.cloud.state.ready, true);
  await env.cloud.record('lesson', { id: 'probabilidad-1', done: true });
  assert.equal(env.read('zuka-sync-pending'), null);
});

test('Con cuentas en pausa, quien ya entró recibe una sesión anónima y su progreso llega a la base de datos', async () => {
  const supabase = fakeSupabase();
  const env = environment({ emailAccounts: false, supabase, storage: {
    'zuka-ingreso': '2026-11-01T10:00:00.000Z',
    'mathbrain-profile': { name: 'Ana', goal: 3 },
    'mathbrain-progress': ['probabilidad-1']
  } });
  await settle();
  assert.equal(env.clientsCreated, 1);
  assert.equal(env.cloud.state.available, false, 'La interfaz de cuentas de correo sigue oculta');
  assert.equal(env.cloud.state.anonymous, true);
  assert.deepEqual(JSON.parse(JSON.stringify(supabase.calls.find(call => call.anonymous).anonymous)), { options: { data: { display_name: 'Ana' } } });
  assert.equal(env.cloud.state.user.id, USER.id);
  await env.cloud.syncNow();
  assert.deepEqual(supabase.db.lesson_progress.map(row => row.lesson_id), ['probabilidad-1']);
  await env.cloud.record('lesson', { id: 'probabilidad-2', done: true });
  assert.deepEqual(supabase.db.lesson_progress.map(row => row.lesson_id), ['probabilidad-1', 'probabilidad-2']);
});

test('Con cuentas en pausa no se crea una sesión anónima antes de entrar, y si Supabase no la permite todo sigue en el dispositivo', async () => {
  const visitor = fakeSupabase();
  const env = environment({ emailAccounts: false, supabase: visitor });
  await settle();
  assert.equal(visitor.calls.length, 0, 'Un visitante de la portada no crea usuarios');
  assert.equal(env.cloud.state.user, null);
  const disabled = fakeSupabase({}, { anonymous: false });
  const local = environment({ emailAccounts: false, supabase: disabled, storage: { 'zuka-ingreso': 'sí', 'mathbrain-progress': ['probabilidad-1'] } });
  await settle();
  assert.equal(local.cloud.state.user, null);
  assert.equal(local.cloud.state.status, 'local');
  await local.cloud.record('lesson', { id: 'probabilidad-2', done: true });
  assert.equal(disabled.calls.filter(call => call.table).length, 0);
  assert.deepEqual(local.read('mathbrain-progress'), ['probabilidad-1']);
});

test('Las lecciones a medias se unen por la pasada más reciente y viajan a la base de datos', async () => {
  const supabase = fakeSupabase({ lesson_sessions: [
    { user_id: USER.id, lesson_id: 'calculo-integral-2', block_index: 2, block_count: 8, state: { results: {}, gains: {}, xp: 0, firstTry: 0 }, updated_at: '2026-11-01T09:00:00.000Z' },
    { user_id: USER.id, lesson_id: 'probabilidad-1', block_index: 5, block_count: 9, state: { results: {}, gains: {}, xp: 10, firstTry: 1 }, updated_at: '2026-11-01T09:00:00.000Z' }
  ] }, { initialSession: { user: USER } });
  const env = environment({ supabase, storage: {
    'mathbrain-progress': ['probabilidad-1'],
    'zuka-lecciones-en-curso': { 'calculo-integral-2': { index: 4, count: 8, results: { 3: 'correct' }, gains: { 3: 10 }, xp: 10, firstTry: 1, at: '2026-11-01T10:00:00.000Z' } }
  } });
  await settle();
  await env.cloud.syncNow();
  assert.deepEqual(Object.keys(env.read('zuka-lecciones-en-curso')), ['calculo-integral-2'], 'Una lección completada no se retoma');
  assert.equal(env.read('zuka-lecciones-en-curso')['calculo-integral-2'].index, 4, 'Gana la pasada más reciente');
  assert.deepEqual(supabase.db.lesson_sessions.map(row => [row.lesson_id, row.block_index]), [['calculo-integral-2', 4]]);
  await env.cloud.record('session', { id: 'calculo-integral-2', index: 5, count: 8, results: {}, gains: {}, xp: 10, firstTry: 1, at: '2026-11-01T10:05:00.000Z' });
  assert.equal(supabase.db.lesson_sessions[0].block_index, 5);
  await env.cloud.record('session', { id: 'calculo-integral-2', clear: true });
  assert.equal(supabase.db.lesson_sessions.length, 0);
});
