import React, { useEffect, useMemo, useState } from 'react';
import { apiMe, apiProfileGet, apiProfileUpdate } from './apiClient';

export default function TeacherProfile({ onUserUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    nip: '',
  });

  const canSave = useMemo(() => {
    return String(form.name || '').trim().length > 0;
  }, [form.name]);

  async function load() {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiProfileGet();
      const profile = res.profile || {};
      setForm({
        name: profile.name || '',
        nip: profile.nip || '',
      });
    } catch (e) {
      setError(e?.message || 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSave(e) {
    e.preventDefault();
    if (!canSave) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiProfileUpdate({
        name: form.name,
        nip: form.nip,
      });

      // Refresh session user name on server and update UI state
      const me = await apiMe().catch(() => null);
      if (me?.user && typeof onUserUpdate === 'function') {
        onUserUpdate(me.user);
      }

      setSuccess('Profil tersimpan.');
    } catch (e2) {
      setError(e2?.message || 'Gagal menyimpan profil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Profil Guru</h2>
        <p className="text-sm opacity-80">Lengkapi data untuk kebutuhan dokumen (export Word).</p>
      </div>

      {error ? <div className="p-3 rounded bg-red-50 text-red-700">{error}</div> : null}
      {success ? <div className="p-3 rounded bg-emerald-50 text-emerald-800">{success}</div> : null}

      <form onSubmit={onSave} className="p-4 rounded border bg-white space-y-3">
        <label className="space-y-1 block">
          <div className="text-sm font-medium">Nama Lengkap *</div>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 rounded border"
            placeholder="contoh: Muhammad Basri, S.Pd., M.Pd"
            required
            disabled={loading}
          />
        </label>

        <label className="space-y-1 block">
          <div className="text-sm font-medium">NIP</div>
          <input
            type="text"
            value={form.nip}
            onChange={(e) => setForm((p) => ({ ...p, nip: e.target.value }))}
            className="w-full px-3 py-2 rounded border"
            placeholder="contoh: 19xxxxxxxxxxxxxxx"
            disabled={loading}
          />
          <div className="text-xs opacity-70">Boleh kosong jika belum ada.</div>
        </label>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={load}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            className={`px-3 py-2 rounded text-white ${
              canSave ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
            }`}
            disabled={loading || !canSave}
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
