import React, { useEffect, useMemo, useState } from 'react';
import { apiUserResetPassword, apiUserUpsert, apiUsersList } from './apiClient.js';

export default function AdminTeacherAccounts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');

  const teacherUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return list.filter((u) => (u?.role || 'guru') !== 'admin');
  }, [users]);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const res = await apiUsersList();
      setUsers(Array.isArray(res.users) ? res.users : []);
    } catch (e) {
      setError(e?.message || 'Gagal memuat akun');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCreate = () => {
    setNotice('');
    setEditing({ mode: 'create', username: '', name: '', password: '' });
  };

  const startEdit = (u) => {
    setNotice('');
    setEditing({
      mode: 'edit',
      username: String(u?.username || ''),
      oldUsername: String(u?.username || ''),
      name: String(u?.name || ''),
      password: '',
    });
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setLoading(true);
    setError('');
    setNotice('');

    try {

      const payload = {
        username: String(editing.username || '').trim(),
        name: String(editing.name || '').trim(),
      };
      if (editing.mode === 'edit' && editing.oldUsername && editing.oldUsername !== editing.username) {
        payload.oldUsername = String(editing.oldUsername);
      }
      const pwd = String(editing.password || '').trim();
      if (pwd) payload.password = pwd;

      const res = await apiUserUpsert(payload);
      if (res?.tempPassword) {
        setNotice(`Password sementara untuk ${payload.username}: ${res.tempPassword}`);
      } else {
        setNotice(editing.mode === 'create' ? 'Akun berhasil dibuat.' : 'Akun berhasil diperbarui.');
      }

      setEditing(null);
      await loadAll();
    } catch (e) {
      setError(e?.message || 'Gagal menyimpan akun');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (username) => {
    if (!username) return;
    if (!window.confirm(`Reset password untuk ${username}?`)) return;

    setLoading(true);
    setError('');
    setNotice('');
    try {
      const res = await apiUserResetPassword(username);
      if (res?.tempPassword) {
        setNotice(`Password baru untuk ${username}: ${res.tempPassword}`);
      } else {
        setNotice(`Password ${username} berhasil di-reset.`);
      }
      await loadAll();
    } catch (e) {
      setError(e?.message || 'Gagal reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Akun Guru</h2>
          <p className="text-sm opacity-80">Buat, edit nama, dan reset password akun guru.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAll}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={loading}
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={startCreate}
            className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={loading}
          >
            Tambah Akun
          </button>
        </div>
      </div>

      {error ? <div className="p-3 rounded bg-red-50 text-red-700">{error}</div> : null}
      {notice ? <div className="p-3 rounded bg-yellow-50 text-yellow-800 border border-yellow-200">{notice}</div> : null}

      {editing ? (
        <div className="p-4 rounded border bg-white space-y-3">
          <div className="font-medium">{editing.mode === 'create' ? 'Tambah Akun Guru' : 'Edit Akun Guru'}</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="space-y-1">
              <div className="text-sm font-medium">Username</div>
              <input
                type="text"
                value={editing.username}
                disabled={loading}
                onChange={(e) => setEditing((p) => ({ ...p, username: e.target.value }))}
                className="w-full px-3 py-2 rounded border"
                placeholder="mis: akad51"
              />
              {editing.mode === 'edit' && (
                <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mt-1">
                  Jika username diubah, data lama akan dipindahkan ke username baru.
                </div>
              )}
              <div className="text-xs opacity-70">3-32 karakter: A-Z a-z 0-9 . _ -</div>
            </label>

            <label className="space-y-1 md:col-span-2">
              <div className="text-sm font-medium">Nama</div>
              <input
                type="text"
                value={editing.name}
                disabled={loading}
                onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded border"
                placeholder="Nama guru"
              />
            </label>

            <label className="space-y-1 md:col-span-3">
              <div className="text-sm font-medium">Password (opsional)</div>
              <input
                type="text"
                value={editing.password}
                disabled={loading}
                onChange={(e) => setEditing((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2 rounded border"
                placeholder={editing.mode === 'create' ? 'Kosongkan untuk password otomatis' : 'Isi jika ingin ganti password'}
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveEdit}
              className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading}
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={loading}
            >
              Batal
            </button>
          </div>
        </div>
      ) : null}

      <div className="p-4 rounded border bg-white">
        <div className="text-sm opacity-80 mb-3">
          Total akun guru: <span className="font-medium">{teacherUsers.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Username</th>
                <th className="py-2 pr-3">Nama</th>
                <th className="py-2 pr-3 w-56">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {teacherUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-3 text-gray-500">
                    Belum ada akun guru.
                  </td>
                </tr>
              ) : (
                teacherUsers.map((u) => (
                  <tr key={u.username} className="border-b last:border-b-0">
                    <td className="py-2 pr-3 font-medium">{u.username}</td>
                    <td className="py-2 pr-3">{u.name || '-'}</td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 rounded bg-gray-100 hover:bg-gray-200"
                          onClick={() => startEdit(u)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="px-2.5 py-1.5 rounded bg-orange-100 hover:bg-orange-200 text-orange-900"
                          onClick={() => resetPassword(u.username)}
                          disabled={loading}
                        >
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
