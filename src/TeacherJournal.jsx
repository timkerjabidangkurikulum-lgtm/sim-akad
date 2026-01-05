import React, { useEffect, useMemo, useState } from 'react';
import { apiJournalDelete, apiJournalExportUrl, apiJournalList, apiJournalUpsert } from './apiClient';

const emptyForm = {
  id: '',
  date: '',
  kelas: '',
  mapel: '',
  materi: '',
  metode: '',
  asesmen: '',
  catatan: '',
  tindakLanjut: '',
  createdAt: '',
};

function toDateInputValue(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toMonthInputValue(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export default function TeacherJournal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ ...emptyForm, date: toDateInputValue() });
  const [mode, setMode] = useState('list'); // list | form
  const [exportMonth, setExportMonth] = useState(toMonthInputValue());

  const canSave = useMemo(() => {
    return (
      String(form.date || '').trim() &&
      String(form.kelas || '').trim() &&
      String(form.mapel || '').trim() &&
      String(form.materi || '').trim()
    );
  }, [form]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await apiJournalList();
      setEntries(Array.isArray(res.entries) ? res.entries : []);
    } catch (e) {
      setError(e?.message || 'Gagal memuat jurnal');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setForm({ ...emptyForm, date: toDateInputValue() });
    setMode('form');
  }

  function startEdit(entry) {
    setForm({
      ...emptyForm,
      ...entry,
    });
    setMode('form');
  }

  function cancelEdit() {
    setForm({ ...emptyForm, date: toDateInputValue() });
    setMode('list');
  }

  async function onSave(e) {
    e.preventDefault();
    if (!canSave) return;

    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        createdAt: form.createdAt || undefined,
      };
      const res = await apiJournalUpsert({ entry: payload });
      const saved = res.entry;
      setEntries((prev) => {
        const next = [...prev];
        const idx = next.findIndex((x) => x.id === saved.id);
        if (idx >= 0) next[idx] = saved;
        else next.unshift(saved);
        return next;
      });
      setMode('list');
    } catch (e2) {
      setError(e2?.message || 'Gagal menyimpan jurnal');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (!id) return;
    const ok = confirm('Hapus entri jurnal ini?');
    if (!ok) return;

    setLoading(true);
    setError('');
    try {
      await apiJournalDelete({ id });
      setEntries((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setError(e?.message || 'Gagal menghapus jurnal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Jurnal Mengajar</h2>
          <p className="text-sm opacity-80">Wajib: Tanggal, Kelas, Mapel, Materi.</p>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'list' ? (
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
                href={apiJournalExportUrl({ month: exportMonth })}
                className={`px-3 py-2 rounded text-white ${
                  exportMonth ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-300 pointer-events-none'
                }`}
              >
                Download Word
              </a>
            </div>
          ) : null}
          {mode === 'list' ? (
            <button
              type="button"
              onClick={startNew}
              className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              + Entri Baru
            </button>
          ) : (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={loading}
            >
              Kembali
            </button>
          )}
          <button
            type="button"
            onClick={load}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="p-3 rounded bg-red-50 text-red-700">{error}</div> : null}

      {mode === 'form' ? (
        <form onSubmit={onSave} className="space-y-3 p-4 rounded border bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="space-y-1">
              <div className="text-sm font-medium">Tanggal *</div>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2 rounded border"
                required
              />
            </label>
            <label className="space-y-1">
              <div className="text-sm font-medium">Kelas *</div>
              <input
                type="text"
                value={form.kelas}
                onChange={(e) => setForm((p) => ({ ...p, kelas: e.target.value }))}
                className="w-full px-3 py-2 rounded border"
                placeholder="contoh: X IPA 1"
                required
              />
            </label>
            <label className="space-y-1">
              <div className="text-sm font-medium">Mapel *</div>
              <input
                type="text"
                value={form.mapel}
                onChange={(e) => setForm((p) => ({ ...p, mapel: e.target.value }))}
                className="w-full px-3 py-2 rounded border"
                placeholder="contoh: Matematika"
                required
              />
            </label>
            <label className="space-y-1">
              <div className="text-sm font-medium">Metode</div>
              <input
                type="text"
                value={form.metode}
                onChange={(e) => setForm((p) => ({ ...p, metode: e.target.value }))}
                className="w-full px-3 py-2 rounded border"
                placeholder="contoh: Diskusi, Ceramah, Praktik"
              />
            </label>
          </div>

          <label className="space-y-1 block">
            <div className="text-sm font-medium">Materi *</div>
            <textarea
              value={form.materi}
              onChange={(e) => setForm((p) => ({ ...p, materi: e.target.value }))}
              className="w-full px-3 py-2 rounded border min-h-[90px]"
              placeholder="Ringkasan materi yang diajarkan"
              required
            />
          </label>

          <label className="space-y-1 block">
            <div className="text-sm font-medium">Asesmen</div>
            <textarea
              value={form.asesmen}
              onChange={(e) => setForm((p) => ({ ...p, asesmen: e.target.value }))}
              className="w-full px-3 py-2 rounded border min-h-[70px]"
              placeholder="contoh: kuis 10 menit, tanya jawab, tugas"
            />
          </label>

          <label className="space-y-1 block">
            <div className="text-sm font-medium">Catatan</div>
            <textarea
              value={form.catatan}
              onChange={(e) => setForm((p) => ({ ...p, catatan: e.target.value }))}
              className="w-full px-3 py-2 rounded border min-h-[70px]"
              placeholder="kendala, kehadiran, suasana kelas, dll"
            />
          </label>

          <label className="space-y-1 block">
            <div className="text-sm font-medium">Tindak Lanjut</div>
            <textarea
              value={form.tindakLanjut}
              onChange={(e) => setForm((p) => ({ ...p, tindakLanjut: e.target.value }))}
              className="w-full px-3 py-2 rounded border min-h-[70px]"
              placeholder="remedial, pengayaan, tugas lanjutan"
            />
          </label>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={loading}
            >
              Batal
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
      ) : (
        <div className="space-y-3">
          {loading ? <div className="text-sm opacity-80">Memuat...</div> : null}

          {entries.length === 0 && !loading ? (
            <div className="p-4 rounded border bg-white">
              <div className="font-medium">Belum ada entri jurnal.</div>
              <div className="text-sm opacity-80">Klik “Entri Baru” untuk mulai.</div>
            </div>
          ) : null}

          {entries.map((e) => (
            <div key={e.id} className="p-4 rounded border bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {e.date} — {e.mapel} ({e.kelas})
                  </div>
                  <div className="text-sm opacity-80">Materi: {e.materi}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(e)}
                    className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(e.id)}
                    className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                    disabled={loading}
                  >
                    Hapus
                  </button>
                </div>
              </div>

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
