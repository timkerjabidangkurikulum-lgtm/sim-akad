import React, { useEffect, useMemo, useState } from 'react';
import { apiJournalExportUrl, apiJournalList } from './apiClient';

function toMonthInputValue(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export default function AdminJournal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entriesByUser, setEntriesByUser] = useState({});
  const [usersMeta, setUsersMeta] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [exportMonth, setExportMonth] = useState(toMonthInputValue());

  const userMetaByUsername = useMemo(() => {
    const map = {};
    for (const u of Array.isArray(usersMeta) ? usersMeta : []) {
      if (u && typeof u === 'object' && typeof u.username === 'string') {
        map[u.username] = u;
      }
    }
    return map;
  }, [usersMeta]);

  const usernames = useMemo(() => {
    const keys = Object.keys(entriesByUser || {});
    keys.sort((a, b) => {
      const na = (userMetaByUsername[a]?.name || a || '').toString();
      const nb = (userMetaByUsername[b]?.name || b || '').toString();
      const cmp = na.localeCompare(nb);
      if (cmp !== 0) return cmp;
      return a.localeCompare(b);
    });
    return keys;
  }, [entriesByUser, userMetaByUsername]);

  const selectedEntries = useMemo(() => {
    if (!selectedUsername) return [];
    const list = entriesByUser?.[selectedUsername];
    return Array.isArray(list) ? list : [];
  }, [entriesByUser, selectedUsername]);

  const selectedTeacher = useMemo(() => {
    if (!selectedUsername) return null;
    return userMetaByUsername[selectedUsername] || {
      username: selectedUsername,
      name: selectedUsername,
      nip: '',
    };
  }, [selectedUsername, userMetaByUsername]);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const res = await apiJournalList();
      const map = res.entriesByUser && typeof res.entriesByUser === 'object' ? res.entriesByUser : {};
      setEntriesByUser(map);
      const metaList = Array.isArray(res.users) ? res.users : [];
      setUsersMeta(metaList);

      if (!selectedUsername) {
        const metaByU = {};
        for (const u of metaList) {
          if (u && typeof u === 'object' && typeof u.username === 'string') {
            metaByU[u.username] = u;
          }
        }
        const keys = Object.keys(map);
        keys.sort((a, b) => {
          const na = (metaByU[a]?.name || a || '').toString();
          const nb = (metaByU[b]?.name || b || '').toString();
          const cmp = na.localeCompare(nb);
          if (cmp !== 0) return cmp;
          return a.localeCompare(b);
        });
        setSelectedUsername(keys[0] || '');
      } else if (!(selectedUsername in map)) {
        setSelectedUsername('');
      }
    } catch (e) {
      setError(e?.message || 'Gagal memuat jurnal guru');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Jurnal Guru (Admin)</h2>
          <p className="text-sm opacity-80">Lihat jurnal mengajar semua guru (read-only).</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={exportMonth}
            onChange={(e) => setExportMonth(e.target.value)}
            className="px-3 py-2 rounded border bg-white"
            disabled={loading}
            title="Pilih bulan untuk download Word"
          />
          <a
            href={selectedUsername ? apiJournalExportUrl({ month: exportMonth, username: selectedUsername }) : '#'}
            className={`px-3 py-2 rounded text-white ${
              selectedUsername && exportMonth
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-emerald-300 pointer-events-none'
            }`}
            title={
              selectedTeacher && exportMonth
                ? `Download Word jurnal ${selectedTeacher.name} (${selectedTeacher.username}) untuk ${exportMonth}`
                : 'Pilih guru dan bulan'
            }
          >
            {selectedTeacher ? `Download Word — ${selectedTeacher.name}` : 'Download Word'}
          </a>
          <button
            type="button"
            onClick={loadAll}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="p-3 rounded bg-red-50 text-red-700">{error}</div> : null}

      <div className="p-4 rounded border bg-white space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <label className="space-y-1">
            <div className="text-sm font-medium">Pilih Username Guru</div>
            <select
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
              className="w-full px-3 py-2 rounded border"
              disabled={loading}
            >
              <option value="">-- Pilih --</option>
              {usernames.map((u) => (
                <option key={u} value={u}>
                  {(userMetaByUsername[u]?.name ? `${userMetaByUsername[u].name} (${u})` : u)}
                </option>
              ))}
            </select>
          </label>

          <div className="text-sm opacity-80">
            Total guru: <span className="font-medium">{usernames.length}</span>
            <br />
            Entri: <span className="font-medium">{selectedEntries.length}</span>
          </div>
        </div>

        {selectedTeacher ? (
          <div className="text-sm">
            <span className="font-medium">Guru terpilih:</span> {selectedTeacher.name} ({selectedTeacher.username})
            {selectedTeacher.nip ? <> — NIP: {selectedTeacher.nip}</> : null}
          </div>
        ) : null}
      </div>

      {!selectedUsername ? (
        <div className="p-4 rounded border bg-white">
          <div className="font-medium">Pilih guru untuk melihat jurnal.</div>
        </div>
      ) : selectedEntries.length === 0 ? (
        <div className="p-4 rounded border bg-white">
          <div className="font-medium">Belum ada entri jurnal.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {loading ? <div className="text-sm opacity-80">Memuat...</div> : null}

          {selectedEntries.map((e) => (
            <div key={e.id} className="p-4 rounded border bg-white">
              <div className="font-semibold">
                {e.date} — {e.mapel} ({e.kelas})
              </div>
              <div className="text-sm opacity-80">Materi: {e.materi}</div>

              {(e.metode || e.asesmen || e.catatan || e.tindakLanjut) ? (
                <div className="mt-3 text-sm space-y-1">
                  {e.metode ? (
                    <div>
                      <span className="font-medium">Metode:</span> {e.metode}
                    </div>
                  ) : null}
                  {e.asesmen ? (
                    <div>
                      <span className="font-medium">Asesmen:</span> {e.asesmen}
                    </div>
                  ) : null}
                  {e.catatan ? (
                    <div>
                      <span className="font-medium">Catatan:</span> {e.catatan}
                    </div>
                  ) : null}
                  {e.tindakLanjut ? (
                    <div>
                      <span className="font-medium">Tindak lanjut:</span> {e.tindakLanjut}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
