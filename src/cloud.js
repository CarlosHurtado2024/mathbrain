// Zuka en la nube (Supabase): cuentas opcionales y sincronización del progreso entre dispositivos.
// La app sigue siendo local primero: la interfaz lee localStorage y funciona sin cuenta ni conexión.
// Al iniciar sesión se unen los datos del dispositivo con los de la cuenta; después, cada cambio se envía
// al momento y, si no hay conexión, se sincroniza todo al volver.
(() => {
  'use strict';

  const KEYS = { progress: 'mathbrain-progress', stats: 'mathbrain-stats', saved: 'mathbrain-saved', recent: 'mathbrain-recent', profile: 'mathbrain-profile', pending: 'zuka-sync-pending' };
  const GOALS = [0, 2, 3, 5, 7];
  const state = { available: false, ready: false, user: null, status: 'idle', lastSync: null, message: '', recovery: false };
  let client = null;
  let syncing = null;
  let pending = readJson(KEYS.pending, null) || { xp: 0, full: false };

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Sin almacenamiento, la sesión sigue en memoria. */ }
  }

  function savePending() { writeJson(KEYS.pending, pending); }

  const strings = value => Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
  const isDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

  // Racha: días seguidos con estudio que terminan en el último día estudiado (la app la da por viva si fue hoy o ayer).
  function streakFrom(days) {
    const sorted = [...new Set(days.filter(isDay))].sort();
    if (!sorted.length) return { streak: 0, lastDay: null };
    let streak = 1;
    for (let index = sorted.length - 1; index > 0; index -= 1) {
      const gap = Math.round((new Date(`${sorted[index]}T12:00:00`) - new Date(`${sorted[index - 1]}T12:00:00`)) / 86400000);
      if (gap !== 1) break;
      streak += 1;
    }
    return { streak, lastDay: sorted[sorted.length - 1] };
  }

  // Une el progreso del dispositivo con el de la cuenta: nada se pierde. Los conjuntos se unen, los XP toman
  // el mayor valor y el nombre y la meta de la cuenta mandan si existen.
  function mergeState(local, remote) {
    const days = [...new Set([...local.days, ...remote.days].filter(isDay))].sort().slice(-120);
    return {
      progress: [...new Set([...local.progress, ...remote.progress])],
      saved: [...new Set([...local.saved, ...remote.saved])].slice(0, 200),
      reviews: [...new Set([...local.reviews, ...remote.reviews])],
      days,
      xp: Math.max(local.xp || 0, remote.xp || 0),
      name: remote.name || local.name || '',
      goal: remote.goal || local.goal || 0,
      ...streakFrom(days)
    };
  }

  function readLocal() {
    const stats = readJson(KEYS.stats, {}) || {};
    const profile = readJson(KEYS.profile, {}) || {};
    return {
      progress: strings(readJson(KEYS.progress, [])),
      saved: strings(readJson(KEYS.saved, [])),
      days: strings(stats.days).filter(isDay),
      reviews: strings(stats.reviews),
      xp: Number.isFinite(stats.xp) ? Math.max(0, Math.round(stats.xp)) : 0,
      name: typeof profile.name === 'string' ? profile.name.trim().slice(0, 40) : '',
      goal: GOALS.includes(profile.goal) ? profile.goal : 0
    };
  }

  function writeLocal(merged) {
    writeJson(KEYS.progress, merged.progress);
    writeJson(KEYS.saved, merged.saved);
    writeJson(KEYS.stats, { xp: merged.xp, streak: merged.streak, lastDay: merged.lastDay, days: merged.days, reviews: merged.reviews });
    writeJson(KEYS.profile, { name: merged.name, goal: merged.goal });
  }

  // Al cerrar sesión o eliminar la cuenta, el progreso sale de este dispositivo (queda en la cuenta). El tema se conserva.
  function clearLocal() {
    try { for (const key of Object.values(KEYS)) localStorage.removeItem(key); } catch { /* Nada que borrar. */ }
    pending = { xp: 0, full: false };
  }

  function emit(reason) {
    try { window.dispatchEvent(new CustomEvent('zuka:cloud', { detail: { reason } })); } catch { /* Entornos sin eventos (pruebas). */ }
  }

  function setStatus(status, message = '') {
    state.status = status;
    if (message) state.message = message;
    emit('status');
  }

  function fail(result) {
    if (result?.error) throw result.error;
    return result;
  }

  async function readRemote() {
    const [profile, progress, saved, days, reviews] = await Promise.all([
      client.from('profiles').select('display_name, weekly_goal, xp').eq('id', state.user.id).maybeSingle(),
      client.from('lesson_progress').select('lesson_id'),
      client.from('saved_resources').select('resource_id'),
      client.from('study_days').select('day').order('day', { ascending: false }).limit(120),
      client.from('unit_reviews').select('review_key')
    ]).then(results => results.map(fail));
    return {
      exists: Boolean(profile.data),
      name: profile.data?.display_name || '',
      goal: GOALS.includes(profile.data?.weekly_goal) ? profile.data.weekly_goal : 0,
      xp: profile.data?.xp || 0,
      progress: (progress.data || []).map(row => row.lesson_id),
      saved: (saved.data || []).map(row => row.resource_id),
      days: (days.data || []).map(row => row.day),
      reviews: (reviews.data || []).map(row => row.review_key)
    };
  }

  const missing = (items, existing) => items.filter(item => !existing.includes(item));

  async function pushMerged(merged, remote) {
    const user_id = state.user.id;
    const insert = (table, column, values, conflict) => values.length ? client.from(table).upsert(values.map(value => ({ user_id, [column]: value })), { onConflict: conflict, ignoreDuplicates: true }) : null;
    const profile = !remote.exists
      ? client.from('profiles').insert({ id: user_id, display_name: merged.name, weekly_goal: merged.goal })
      : merged.name !== remote.name || merged.goal !== remote.goal ? client.from('profiles').update({ display_name: merged.name, weekly_goal: merged.goal }).eq('id', user_id) : null;
    await profile?.then(fail);
    await Promise.all([
      insert('lesson_progress', 'lesson_id', missing(merged.progress, remote.progress), 'user_id,lesson_id'),
      insert('saved_resources', 'resource_id', missing(merged.saved, remote.saved), 'user_id,resource_id'),
      insert('study_days', 'day', missing(merged.days, remote.days), 'user_id,day'),
      insert('unit_reviews', 'review_key', missing(merged.reviews, remote.reviews), 'user_id,review_key'),
      merged.xp > remote.xp ? client.rpc('merge_xp', { total: merged.xp }) : null
    ].filter(Boolean).map(request => request.then(fail)));
  }

  // Sincronización completa: envía los XP pendientes, trae la cuenta, une con el dispositivo y sube lo que falte.
  function syncNow() {
    if (!client || !state.user) return Promise.resolve();
    if (syncing) return syncing;
    syncing = (async () => {
      setStatus('syncing');
      try {
        if (pending.xp > 0) {
          const amount = pending.xp;
          fail(await client.rpc('add_xp', { amount }));
          pending.xp -= amount;
          savePending();
        }
        const remote = await readRemote();
        const merged = mergeState(readLocal(), remote);
        writeLocal(merged);
        await pushMerged(merged, remote);
        pending.full = false;
        savePending();
        state.lastSync = Date.now();
        state.message = '';
        setStatus('synced');
        emit('sync');
      } catch (error) {
        pending.full = true;
        savePending();
        setStatus(navigator.onLine === false ? 'offline' : 'error', describe(error));
      } finally {
        syncing = null;
      }
    })();
    return syncing;
  }

  async function send(kind, data) {
    const user_id = state.user.id;
    const upsert = (table, row, conflict) => client.from(table).upsert({ user_id, ...row }, { onConflict: conflict, ignoreDuplicates: true });
    if (kind === 'lesson') return fail(await (data.done ? upsert('lesson_progress', { lesson_id: data.id }, 'user_id,lesson_id') : client.from('lesson_progress').delete().eq('lesson_id', data.id)));
    if (kind === 'saved') return fail(await (data.on ? upsert('saved_resources', { resource_id: data.id }, 'user_id,resource_id') : client.from('saved_resources').delete().eq('resource_id', data.id)));
    if (kind === 'day') return fail(await upsert('study_days', { day: data.day }, 'user_id,day'));
    if (kind === 'review') return fail(await upsert('unit_reviews', { review_key: data.key }, 'user_id,review_key'));
    if (kind === 'profile') return fail(await client.from('profiles').update({ display_name: data.name, weekly_goal: data.goal }).eq('id', user_id));
    if (kind === 'xp') {
      fail(await client.rpc('add_xp', { amount: data.amount }));
      pending.xp = Math.max(0, pending.xp - data.amount);
      savePending();
    }
  }

  // La app avisa de cada cambio. Sin sesión no hace nada; sin conexión, queda para la próxima sincronización.
  function record(kind, data = {}) {
    if (!client || !state.user) return Promise.resolve();
    if (kind === 'xp') { pending.xp += data.amount; savePending(); }
    if (pending.full || navigator.onLine === false) {
      pending.full = true;
      savePending();
      setStatus('offline');
      return Promise.resolve();
    }
    return send(kind, data).then(() => {
      state.lastSync = Date.now();
      if (state.status !== 'synced') setStatus('synced');
    }).catch(error => {
      pending.full = true;
      savePending();
      setStatus(navigator.onLine === false ? 'offline' : 'error', describe(error));
    });
  }

  // Mensajes en español para los errores de Supabase más comunes.
  function describe(error) {
    const code = String(error?.code || '');
    const message = String(error?.message || '');
    if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) return 'El correo o la contraseña no coinciden.';
    if (code === 'email_not_confirmed' || /not confirmed/i.test(message)) return 'Primero confirma tu correo con el enlace que te enviamos.';
    if (code === 'user_already_exists' || /already registered/i.test(message)) return 'Ya hay una cuenta con ese correo. Inicia sesión.';
    if (code === 'same_password') return 'La nueva contraseña debe ser distinta de la anterior.';
    if (code === 'weak_password' || /password should|weak password/i.test(message)) return 'Usa una contraseña más segura, de al menos 8 caracteres.';
    if (/rate_limit/.test(code) || /rate limit|too many/i.test(message)) return 'Demasiados intentos seguidos. Espera unos minutos.';
    if (code === 'validation_failed' || /invalid.*email|unable to validate email/i.test(message)) return 'Revisa que el correo esté bien escrito.';
    if (error?.name === 'AuthRetryableFetchError' || /failed to fetch|network|load failed/i.test(message) || navigator.onLine === false) return 'No hay conexión. Inténtalo cuando vuelvas a estar en línea.';
    return 'No se pudo completar. Inténtalo de nuevo en un momento.';
  }

  const redirectTo = () => `${location.origin}${location.pathname}#perfil`;

  async function signUp(email, password) {
    const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo(), data: { display_name: readLocal().name } } });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  }

  async function signIn(email, password) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function requestPasswordReset(email) {
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: redirectTo() });
    if (error) throw error;
  }

  async function updatePassword(password) {
    const { error } = await client.auth.updateUser({ password });
    if (error) throw error;
    state.recovery = false;
    emit('auth');
  }

  // Cierra la sesión después de enviar lo pendiente; el progreso queda en la cuenta y sale de este dispositivo.
  async function signOut() {
    if (pending.full || pending.xp) await syncNow();
    await client.auth.signOut();
    clearLocal();
  }

  async function resetProgress() {
    fail(await client.rpc('reset_progress'));
    pending = { xp: 0, full: false };
    savePending();
  }

  async function deleteAccount() {
    fail(await client.rpc('delete_account'));
    await client.auth.signOut({ scope: 'local' }).catch(() => {});
    clearLocal();
  }

  function cleanUrl() {
    const url = new URL(location.href);
    for (const name of ['code', 'error', 'error_code', 'error_description']) url.searchParams.delete(name);
    history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function handleAuth(event, session) {
    const meta = session?.user?.user_metadata || {};
    const photo = meta.avatar_url || meta.picture || '';
    const user = session?.user ? { id: session.user.id, email: session.user.email || '', avatar: photo.startsWith('https://') ? photo : '' } : null;
    const changed = user?.id !== state.user?.id;
    state.user = user;
    if (event === 'PASSWORD_RECOVERY') state.recovery = true;
    if (!user) { state.status = 'idle'; state.recovery = false; }
    emit('auth');
    if (user && (changed || event === 'INITIAL_SESSION')) syncNow();
  }

  function init() {
    const config = window.ZUKA_CONFIG || {};
    if (!window.supabase?.createClient || !config.supabaseUrl || !config.supabaseKey) {
      state.ready = true;
      return;
    }
    client = window.supabase.createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'zuka-auth' }
    });
    state.available = true;
    const url = new URL(location.href);
    const linkError = url.searchParams.get('error_code') || url.searchParams.get('error');
    const fromEmail = url.searchParams.has('code');
    // Supabase recomienda no llamar a la API dentro de este aviso: se procesa en el siguiente ciclo.
    client.auth.onAuthStateChange((event, session) => { setTimeout(() => handleAuth(event, session), 0); });
    client.auth.getSession().then(({ data }) => {
      handleAuth('INITIAL_SESSION', data.session);
      if (linkError) state.message = /expired/.test(linkError) ? 'El enlace del correo expiró. Pide uno nuevo.' : 'No se pudo usar el enlace del correo. Pide uno nuevo.';
      else if (fromEmail && !data.session) state.message = 'Tu correo quedó confirmado. Inicia sesión para continuar.';
      if (linkError || fromEmail) cleanUrl();
    }).catch(() => {}).finally(() => {
      state.ready = true;
      emit('auth');
    });
    window.addEventListener('online', () => { if (state.user && (pending.full || pending.xp)) syncNow(); });
  }

  window.ZUKA_CLOUD = { state, record, syncNow, signUp, signIn, signOut, requestPasswordReset, updatePassword, resetProgress, deleteAccount, describe, mergeState, streakFrom };
  init();
})();
