export function apiUserDelete(username) {
  return request('users_delete', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}
// Basis URL API.
// - Development (npm run dev): pakai Apache lokal
// - Web produksi: relative ke BASE_URL (mis. '/sim_akad/api/index.php')
// - Android/Capacitor: HARUS pakai URL absolut ke server (set lewat VITE_API_URL),
//   karena aplikasi berjalan dari file:// / capacitor:// sehingga relative URL tidak akan menemukan PHP API.
const isDev = import.meta.env.MODE === 'development';
const apiFromEnv = (import.meta.env.VITE_API_URL || '').trim();
const apiFromBase = `${import.meta.env.BASE_URL}api/index.php`;
const isCapacitorRuntime =
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.Capacitor != null);

export const API_BASE = isDev
  ? 'http://localhost/SIM_AKAD/api/index.php'
  : apiFromEnv || (isCapacitorRuntime ? '' : apiFromBase);

function requireApiBase() {
  if (API_BASE) return;
  throw new Error(
    'API server belum dikonfigurasi untuk Android. Set VITE_API_URL (contoh: https://domain-anda/sim_akad/api/index.php), lalu build ulang.'
  );
}

async function request(path, options = {}) {
  requireApiBase();
  const res = await fetch(`${API_BASE}?action=${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (res.status === 401 && typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('simakad:unauthorized'));
    } catch {
      // ignore
    }
  }

  if (!res.ok || data === null) {
    throw new Error(data?.error || 'Terjadi kesalahan pada server');
  }

  return data;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => null);
  if (res.status === 401 && typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('simakad:unauthorized'));
    } catch {
      // ignore
    }
  }
  if (!res.ok || data === null) {
    throw new Error(data?.error || 'Terjadi kesalahan pada server');
  }
  return data;
}

export function apiLogin(username, password) {
  return request('login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function apiLogout() {
  return request('logout', { method: 'POST' });
}

export function apiMe() {
  return request('me');
}

export function apiDashboard() {
  return request('dashboard');
}

export function apiTeachers() {
  return request('teachers');
}

export function apiUsersList() {
  return request('users_list');
}

export function apiUserUpsert(user) {
  return request('users_upsert', {
    method: 'POST',
    body: JSON.stringify({ user }),
  });
}

export function apiUserResetPassword(username) {
  return request('users_reset_password', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export function apiEvaluasiList() {
  return request('evaluasi_list');
}

export function apiEvaluasiUpsert(teacher) {
  return request('evaluasi_upsert', {
    method: 'POST',
    body: JSON.stringify({ teacher }),
  });
}

export function apiEvaluasiDelete(id) {
  return request('evaluasi_delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export function apiAgenda() {
  return request('agenda');
}

export function apiKma1503() {
  return request('kma1503');
}

export async function apiJournalList(params = {}) {
  requireApiBase();
  const qs = new URLSearchParams();
  if (params.username) qs.set('username', params.username);
  const url = `${API_BASE}?action=journal_list${qs.toString() ? `&${qs.toString()}` : ''}`;
  const res = await fetch(url, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function apiJournalUpsert({ entry, username } = {}) {
  requireApiBase();
  const res = await fetch(`${API_BASE}?action=journal_upsert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ entry, username }),
  });
  return handleResponse(res);
}

export async function apiJournalDelete({ id, username } = {}) {
  requireApiBase();
  const res = await fetch(`${API_BASE}?action=journal_delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id, username }),
  });
  return handleResponse(res);
}

export function apiJournalExportUrl({ month, username } = {}) {
  requireApiBase();
  const qs = new URLSearchParams();
  if (month) qs.set('month', month);
  if (username) qs.set('username', username);
  return `${API_BASE}?action=journal_export&${qs.toString()}`;
}

export function apiGeminiGenerate({ userPrompt, systemInstruction, model } = {}) {
  return request('gemini', {
    method: 'POST',
    body: JSON.stringify({
      userPrompt,
      systemInstruction,
      model,
    }),
  });
}

export function apiProfileGet() {
  return request('profile_get');
}

export function apiProfileUpdate({ name, nip } = {}) {
  return request('profile_update', {
    method: 'POST',
    body: JSON.stringify({ name, nip }),
  });
}

export async function apiNilaiList(params = {}) {
  requireApiBase();
  const qs = new URLSearchParams();
  if (params.username) qs.set('username', params.username);
  const url = `${API_BASE}?action=nilai_list${qs.toString() ? `&${qs.toString()}` : ''}`;
  const res = await fetch(url, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function apiNilaiGet(params = {}) {
  requireApiBase();
  const qs = new URLSearchParams();
  if (params.id) qs.set('id', params.id);
  if (params.username) qs.set('username', params.username);
  const url = `${API_BASE}?action=nilai_get&${qs.toString()}`;
  const res = await fetch(url, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export function apiNilaiUpsert({ package: pkg } = {}) {
  return request('nilai_upsert', {
    method: 'POST',
    body: JSON.stringify({ package: pkg }),
  });
}

export function apiNilaiDelete({ id, username } = {}) {
  return request('nilai_delete', {
    method: 'POST',
    body: JSON.stringify({ id, username }),
  });
}

export function apiNilaiExportUrl({ id, username } = {}) {
  requireApiBase();
  const qs = new URLSearchParams();
  if (id) qs.set('id', id);
  if (username) qs.set('username', username);
  return `${API_BASE}?action=nilai_export&${qs.toString()}`;
}

export async function apiRosterGet({ kelas } = {}) {
  requireApiBase();
  const qs = new URLSearchParams();
  if (kelas) qs.set('kelas', kelas);
  const url = `${API_BASE}?action=roster_get&${qs.toString()}`;
  const res = await fetch(url, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export function apiRosterUpsert({ kelas, students } = {}) {
  return request('roster_upsert', {
    method: 'POST',
    body: JSON.stringify({ kelas, students }),
  });
}
