import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  BookOpen,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Plus,
  Edit3,
  Trash2,
} from 'lucide-react';

import {
  apiAgenda,
  apiDashboard,
  apiEvaluasiDelete,
  apiEvaluasiList,
  apiEvaluasiUpsert,
  apiKma1503,
  apiNilaiDelete,
  apiNilaiExportUrl,
  apiNilaiGet,
  apiNilaiList,
  apiNilaiUpsert,
  apiRosterGet,
  apiRosterUpsert,
  apiTeachers,
} from './apiClient.js';
import RppModulAjar from './RppModulAjar.jsx';
import GuruMenu from './GuruMenu.jsx';
import AsesmenMadrasah from './AsesmenMadrasah.jsx';
import AdminJournal from './AdminJournal.jsx';
import AdminTeacherAccounts from './AdminTeacherAccounts.jsx';

const SimAkadDashboard = ({ user, onLogout, onUserUpdate }) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  // Cache buster for static HTML embedded via iframe (helpful on hosting with aggressive caching).
  const staticIframeVersion = '20251231-2';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [agendaSemesterGenap, setAgendaSemesterGenap] = useState([]);
  const [teacherEvaluationData, setTeacherEvaluationData] = useState([]);
  const [kma1503, setKma1503] = useState(null);
  const [problemStudents, setProblemStudents] = useState([
    {
      id: 1,
      name: 'Fulan A',
      kelas: 'XI IPA 1',
      masalah: 'Sering terlambat dan tidak mengumpulkan tugas',
      tindakLanjut: 'Pembinaan wali kelas dan pemanggilan orang tua',
    },
    {
      id: 2,
      name: 'Fulanah B',
      kelas: 'X IPS 2',
      masalah: 'Nilai PAI dan Matematika di bawah KKM',
      tindakLanjut: 'Program remedial terstruktur dan bimbingan belajar',
    },
  ]);
  const [scoreEntries, setScoreEntries] = useState([]);
  const [nilaiLoading, setNilaiLoading] = useState(false);
  const [nilaiError, setNilaiError] = useState('');
  const [reports, setReports] = useState([
    {
      id: 1,
      jenis: 'Laporan Implementasi KMA 1503',
      periode: 'Semester Ganjil 2025/2026',
      status: 'Draft',
    },
    {
      id: 2,
      jenis: 'Rekap Kinerja Guru',
      periode: 'Semester Ganjil 2025/2026',
      status: 'Final',
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingProblemStudent, setEditingProblemStudent] = useState(null);
  const [editingScoreEntry, setEditingScoreEntry] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState('');

  const computeNilaiAverage = (students) => {
    if (!Array.isArray(students) || students.length === 0) return null;
    let sum = 0;
    let count = 0;
    for (const s of students) {
      const v = s?.score;
      if (v === null || v === undefined || v === '') continue;
      const n = Number(v);
      if (Number.isFinite(n)) {
        sum += n;
        count += 1;
      }
    }
    if (count === 0) return null;
    return Math.round((sum / count) * 100) / 100;
  };

  const loadNilaiPackages = async () => {
    setNilaiLoading(true);
    setNilaiError('');
    try {
      const res = await apiNilaiList();
      setScoreEntries(Array.isArray(res.packages) ? res.packages : []);
    } catch (err) {
      setNilaiError(err?.message || 'Gagal memuat paket nilai');
    } finally {
      setNilaiLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (activeTab !== 'nilai') return;
    loadNilaiPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.username, user?.role]);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const teachersPromise = user?.role === 'admin' ? apiEvaluasiList() : apiTeachers();
        const [dashRes, teachersRes, agendaRes, kmaRes] = await Promise.all([
          apiDashboard(),
          teachersPromise,
          apiAgenda(),
          apiKma1503(),
        ]);
        if (cancelled) return;
        setStats(dashRes.stats);
        setTeacherEvaluationData(teachersRes.teachers);
        setAgendaSemesterGenap(agendaRes.agenda);
        setKma1503(kmaRes.kma1503);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Gagal memuat data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  useEffect(() => {
    // SSO for static apps embedded via iframe (kokurikuler).
    if (user?.username) {
      try {
        localStorage.setItem('sim_akad_sso_user', String(user.username));
      } catch {
        // ignore storage errors
      }
    }
  }, [user?.username]);

  useEffect(() => {
    // Safety: if any modal overlay gets stuck/invisible, allow closing via ESC.
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setEditingTeacher(null);
      setEditingProblemStudent(null);
      setEditingScoreEntry(null);
      setEditingReport(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleAddTeacher = () => {
    setEditingTeacher({
      id: Date.now(),
      name: '',
      kelas: '',
      mapel: '',
      kehadiran: 100,
      modul: 'Lengkap',
      metode: '',
      status: 'Aman',
      adminScore: 3,
      pelaksanaanScore: 3,
      penilaianScore: 3,
      kompetensiScore: 3,
      teknik: 'Dokumen, Observasi',
    });
  };

  const handleEditTeacher = (id) => {
    const guru = teacherEvaluationData.find((g) => g.id === id);
    if (!guru) return;
    setEditingTeacher({
      ...guru,
      adminScore: guru.adminScore ?? 3,
      pelaksanaanScore: guru.pelaksanaanScore ?? 3,
      penilaianScore: guru.penilaianScore ?? 3,
      kompetensiScore: guru.kompetensiScore ?? 3,
      teknik: guru.teknik || 'Dokumen, Observasi',
    });
  };

  const handleChangeEditingTeacherField = (field, value) => {
    setEditingTeacher((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveEditingTeacher = async () => {
    if (!editingTeacher) return;

    const base = {
      id: editingTeacher.id || Date.now(),
      name: (editingTeacher.name || '').trim() || 'Tanpa Nama',
      kelas: (editingTeacher.kelas || '').trim() || '-',
      mapel: (editingTeacher.mapel || '').trim() || '-',
      kehadiran: Number(editingTeacher.kehadiran) || 0,
      modul: (editingTeacher.modul || '').trim() || 'Belum diatur',
      metode: (editingTeacher.metode || '').trim() || '-',
      status: (editingTeacher.status || '').trim() || 'Aman',
      adminScore: Number(editingTeacher.adminScore) || 3,
      pelaksanaanScore: Number(editingTeacher.pelaksanaanScore) || 3,
      penilaianScore: Number(editingTeacher.penilaianScore) || 3,
      kompetensiScore: Number(editingTeacher.kompetensiScore) || 3,
      teknik: (editingTeacher.teknik || '').trim() || 'Dokumen, Observasi',
    };

    if (user?.role === 'admin') {
      try {
        const res = await apiEvaluasiUpsert(base);
        setTeacherEvaluationData(res.teachers || []);
        setEditingTeacher(null);
        return;
      } catch (err) {
        setError(err.message || 'Gagal menyimpan evaluasi guru');
        return;
      }
    }

    // fallback (non-admin demo)
    setTeacherEvaluationData((prev) => {
      const exists = prev.some((g) => g.id === base.id);
      if (exists) return prev.map((g) => (g.id === base.id ? { ...g, ...base } : g));
      return [...prev, base];
    });
    setEditingTeacher(null);
  };

  const handleCancelEditingTeacher = () => {
    setEditingTeacher(null);
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Hapus data guru ini?')) return;
    if (user?.role === 'admin') {
      try {
        const res = await apiEvaluasiDelete(String(id));
        setTeacherEvaluationData(res.teachers || []);
        return;
      } catch (err) {
        setError(err.message || 'Gagal menghapus evaluasi guru');
        return;
      }
    }

    setTeacherEvaluationData((prev) => prev.filter((g) => g.id !== id));
  };

  const handleAddProblemStudent = () => {
    setEditingProblemStudent({
      id: Date.now(),
      name: '',
      kelas: '',
      masalah: '',
      tindakLanjut: '',
    });
  };

  const handleEditProblemStudent = (id) => {
    const siswa = problemStudents.find((s) => s.id === id);
    if (!siswa) return;

    setEditingProblemStudent({ ...siswa });
  };

  const handleSaveEditingProblemStudent = () => {
    if (!editingProblemStudent) return;

    setProblemStudents((prev) => {
      const exists = prev.some((s) => s.id === editingProblemStudent.id);

      const base = {
        id: editingProblemStudent.id || Date.now(),
        name: (editingProblemStudent.name || '').trim() || 'Tanpa Nama',
        kelas: (editingProblemStudent.kelas || '').trim() || '-',
        masalah: (editingProblemStudent.masalah || '').trim() || '-',
        tindakLanjut: (editingProblemStudent.tindakLanjut || '').trim() || '-',
      };

      if (exists) {
        return prev.map((s) => (s.id === editingProblemStudent.id ? { ...s, ...base } : s));
      }

      return [...prev, base];
    });

    setEditingProblemStudent(null);
  };

  const handleCancelEditingProblemStudent = () => {
    setEditingProblemStudent(null);
  };

  const handleDeleteProblemStudent = (id) => {
    if (!window.confirm('Hapus data siswa bermasalah ini?')) return;
    setProblemStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddScoreEntry = () => {
    setEditingScoreEntry({
      id: '',
      mapel: '',
      kelas: '',
      sumber: 'Formatif',
      kompetensi: '',
      tanggal: new Date().toISOString().slice(0, 10),
      status: 'Draft',
      students: [],
    });
  };

  const handleEditScoreEntry = async (id, owner) => {
    if (!id) return;
    setNilaiError('');
    setNilaiLoading(true);
    try {
      const res = await apiNilaiGet({ id: String(id), username: owner });
      const pkg = res.package;
      if (pkg && typeof pkg === 'object') {
        setEditingScoreEntry({
          ...pkg,
          students: Array.isArray(pkg.students) ? pkg.students : [],
        });
      }
    } catch (err) {
      setNilaiError(err?.message || 'Gagal membuka paket nilai');
    } finally {
      setNilaiLoading(false);
    }
  };

  const handleSaveEditingScoreEntry = async () => {
    if (!editingScoreEntry) return;

    setNilaiError('');
    setNilaiLoading(true);
    try {
      const res = await apiNilaiUpsert({ package: editingScoreEntry });
      if (Array.isArray(res.packages)) {
        setScoreEntries(res.packages);
      } else {
        await loadNilaiPackages();
      }
      const saved = res.package;
      if (saved && typeof saved === 'object') {
        setEditingScoreEntry({
          ...saved,
          students: Array.isArray(saved.students) ? saved.students : [],
        });
      } else {
        setEditingScoreEntry(null);
      }
    } catch (err) {
      setNilaiError(err?.message || 'Gagal menyimpan paket nilai');
    } finally {
      setNilaiLoading(false);
    }
  };

  const handleCancelEditingScoreEntry = () => {
    setEditingScoreEntry(null);
    setRosterError('');
  };

  const handleSaveRosterTemplate = async () => {
    if (!editingScoreEntry) return;
    const kelas = (editingScoreEntry.kelas || '').trim();
    if (!kelas) {
      setRosterError('Kelas wajib diisi dulu untuk menyimpan template.');
      return;
    }
    setRosterError('');
    setRosterLoading(true);
    try {
      const students = Array.isArray(editingScoreEntry.students) ? editingScoreEntry.students : [];
      await apiRosterUpsert({ kelas, students });
    } catch (err) {
      setRosterError(err?.message || 'Gagal menyimpan template kelas');
    } finally {
      setRosterLoading(false);
    }
  };

  const handleLoadRosterTemplate = async () => {
    if (!editingScoreEntry) return;
    const kelas = (editingScoreEntry.kelas || '').trim();
    if (!kelas) {
      setRosterError('Kelas wajib diisi dulu untuk memuat template.');
      return;
    }
    setRosterError('');
    setRosterLoading(true);
    try {
      const res = await apiRosterGet({ kelas });
      const students = Array.isArray(res.students) ? res.students : [];
      // Merge by NIS if possible; otherwise by name.
      setEditingScoreEntry((prev) => {
        if (!prev) return prev;
        const current = Array.isArray(prev.students) ? prev.students : [];
        const indexByNis = new Map();
        const indexByName = new Map();
        current.forEach((s, idx) => {
          const nis = (s?.nis || '').trim();
          const name = (s?.name || '').trim().toLowerCase();
          if (nis) indexByNis.set(nis, idx);
          if (name) indexByName.set(name, idx);
        });

        const merged = [...current];
        for (const s of students) {
          const nis = (s?.nis || '').trim();
          const nameKey = (s?.name || '').trim().toLowerCase();
          const hitIdx = nis ? indexByNis.get(nis) : indexByName.get(nameKey);
          if (hitIdx === undefined) {
            merged.push({
              id: s?.id || String(Date.now()) + Math.random().toString(16).slice(2),
              name: s?.name || '',
              nis: s?.nis || '',
              score: '',
              note: '',
            });
          } else {
            // Fill identity fields only, keep existing score/note
            merged[hitIdx] = {
              ...merged[hitIdx],
              name: merged[hitIdx]?.name || s?.name || '',
              nis: merged[hitIdx]?.nis || s?.nis || '',
            };
          }
        }
        return { ...prev, students: merged };
      });
    } catch (err) {
      setRosterError(err?.message || 'Gagal memuat template kelas');
    } finally {
      setRosterLoading(false);
    }
  };

  const handleDeleteScoreEntry = async (id, owner) => {
    if (!window.confirm('Hapus paket nilai ini?')) return;
    setNilaiError('');
    setNilaiLoading(true);
    try {
      await apiNilaiDelete({ id: String(id), username: owner });
      await loadNilaiPackages();
    } catch (err) {
      setNilaiError(err?.message || 'Gagal menghapus paket nilai');
    } finally {
      setNilaiLoading(false);
    }
  };

  const handleAddReport = () => {
    setEditingReport({
      id: Date.now(),
      jenis: '',
      periode: '',
      status: 'Draft',
    });
  };

  const handleEditReport = (id) => {
    const lap = reports.find((r) => r.id === id);
    if (!lap) return;

    setEditingReport({ ...lap });
  };

  const handleSaveEditingReport = () => {
    if (!editingReport) return;

    setReports((prev) => {
      const exists = prev.some((r) => r.id === editingReport.id);

      const base = {
        id: editingReport.id || Date.now(),
        jenis: (editingReport.jenis || '').trim() || 'Laporan Baru',
        periode: (editingReport.periode || '').trim() || '-',
        status: (editingReport.status || '').trim() || 'Draft',
      };

      if (exists) {
        return prev.map((r) => (r.id === editingReport.id ? { ...r, ...base } : r));
      }

      return [...prev, base];
    });

    setEditingReport(null);
  };

  const handleCancelEditingReport = () => {
    setEditingReport(null);
  };

  const handleDeleteReport = (id) => {
    if (!window.confirm('Hapus laporan ini?')) return;
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Kesiapan Modul Ajar (Genap)</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats?.modulAjarSiap ?? '-'} / {stats?.guruTotal ?? '-'}
            </h3>
          </div>
          <BookOpen className="text-emerald-500 w-8 h-8" />
        </div>
        <div className="mt-2 text-xs text-gray-600">Deadline: 5 Januari 2026</div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Prestasi OMI 2025</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats?.siswaOmi ?? '-'} Siswa</h3>
          </div>
          <BarChart2 className="text-emerald-500 w-8 h-8" />
        </div>
        <div className="mt-2 text-xs text-gray-600">Lolos ke Tingkat Provinsi</div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Guru Terlambat (Minggu Ini)</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats?.guruTelat ?? '-'} Orang</h3>
          </div>
          <AlertTriangle className="text-red-500 w-8 h-8" />
        </div>
        <div className="mt-2 text-xs text-gray-600">Perlu pembinaan disiplin</div>
      </div>

      <div className="col-span-1 md:col-span-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-bold text-yellow-800 flex items-center mb-2">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Perhatian: Persiapan Semester Genap
        </h4>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>Segera bentuk Tim Pengembang Kurikulum untuk bedah KMA 1503 Tahun 2025.</li>
          <li>
            Pastikan Modul Ajar Semester Genap memuat nilai <strong>Kurikulum Berbasis Cinta (KBC)</strong>.
          </li>
          <li>Jadwal Intensif Kelas XII harus dimulai minggu ke-3 Januari.</li>
        </ul>
      </div>
    </div>
  );

  const renderEvaluasiGuru = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-700">Data Evaluasi Kinerja Guru (Semester Ganjil)
        </h3>
        <div className="space-x-2 flex items-center">
          <button
            className="inline-flex items-center bg-emerald-600 text-white px-3 py-2 rounded text-xs hover:bg-emerald-700"
            onClick={handleAddTeacher}
          >
            <Plus className="w-3 h-3 mr-1" /> Tambah Guru
          </button>
          <button
            className="inline-flex items-center bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700"
            onClick={() => window.alert('Fitur download laporan akan dihubungkan ke backend SIM-AKAD.')}
          >
            Download Laporan
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">Nama Guru</th>
              <th className="px-6 py-3">Kelas/Rombel</th>
              <th className="px-6 py-3">Mata Pelajaran</th>
              <th className="px-6 py-3">Kehadiran (%)</th>
              <th className="px-6 py-3">Status Modul</th>
              <th className="px-6 py-3">Metode Ajar</th>
              <th className="px-6 py-3">Adm</th>
              <th className="px-3 py-3">Pelaks.</th>
              <th className="px-3 py-3">Penil.</th>
              <th className="px-3 py-3">Kompet.</th>
              <th className="px-6 py-3">Teknik Data</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {teacherEvaluationData.map((guru) => (
              <tr key={guru.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{guru.name}</td>
                <td className="px-6 py-4">{guru.kelas || '-'}</td>
                <td className="px-6 py-4">{guru.mapel}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div
                        className={`h-2.5 rounded-full ${
                          guru.kehadiran < 85 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${guru.kehadiran}%` }}
                      />
                    </div>
                    {guru.kehadiran}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      guru.modul === 'Lengkap'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {guru.modul}
                  </span>
                </td>
                <td className="px-6 py-4">{guru.metode}</td>
                <td className="px-6 py-4 text-center text-gray-900 font-semibold">
                  {guru.adminScore ?? '-'}
                </td>
                <td className="px-3 py-4 text-center text-gray-900 font-semibold">
                  {guru.pelaksanaanScore ?? '-'}
                </td>
                <td className="px-3 py-4 text-center text-gray-900 font-semibold">
                  {guru.penilaianScore ?? '-'}
                </td>
                <td className="px-3 py-4 text-center text-gray-900 font-semibold">
                  {guru.kompetensiScore ?? '-'}
                </td>
                <td className="px-6 py-4 text-xs text-gray-700 max-w-[160px] truncate" title={guru.teknik}>
                  {guru.teknik || '-'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`font-bold ${
                      guru.status === 'Aman' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {guru.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => handleEditTeacher(guru.id)}
                  >
                    <Edit3 className="w-3 h-3 mr-1" /> Edit
                  </button>
                  <button
                    className="inline-flex items-center text-xs text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteTeacher(guru.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 space-y-2">
        <p className="font-semibold text-gray-700">Ringkasan Instrumen Evaluasi Guru:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <span className="font-semibold">Administrasi Pembelajaran:</span> RPP/Modul Ajar, Prota/Promes,
            Silabus/ATP, dan perangkat asesmen (diagnostik, formatif, sumatif).
          </li>
          <li>
            <span className="font-semibold">Pelaksanaan Pembelajaran:</span> variasi metode, manajemen kelas,
            interaksi guru-siswa, dan penerapan penilaian di kelas.
          </li>
          <li>
            <span className="font-semibold">Penilaian Hasil Belajar:</span> aspek kognitif, afektif, dan psikomotorik
            melalui tes, observasi sikap, dan penilaian kinerja/produk.
          </li>
          <li>
            <span className="font-semibold">Kompetensi Lainnya:</span> wawancara, angket, penilaian diri, dan
            portofolio guru sebagai bukti pengembangan profesional.
          </li>
          <li>
            <span className="font-semibold">Teknik Pengumpulan Data:</span> analisis dokumen, observasi kelas,
            wawancara, angket, serta penilaian proyek/produk/portofolio.
          </li>
        </ul>
      </div>
    </div>
  );

  const renderSiswaBermasalah = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-700">Data Siswa Bermasalah</h3>
          <p className="text-xs text-gray-500">
            Berdasarkan jurnal BK, laporan wali kelas, dan catatan kedisiplinan.
          </p>
        </div>
        <button
          className="inline-flex items-center bg-emerald-600 text-white px-3 py-2 rounded text-xs hover:bg-emerald-700"
          onClick={handleAddProblemStudent}
        >
          <Plus className="w-3 h-3 mr-1" /> Tambah Siswa
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">Nama Siswa</th>
              <th className="px-6 py-3">Kelas</th>
              <th className="px-6 py-3">Masalah</th>
              <th className="px-6 py-3">Tindak Lanjut</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {problemStudents.map((siswa) => (
              <tr key={siswa.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{siswa.name}</td>
                <td className="px-6 py-4">{siswa.kelas}</td>
                <td className="px-6 py-4">{siswa.masalah}</td>
                <td className="px-6 py-4">{siswa.tindakLanjut}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => handleEditProblemStudent(siswa.id)}
                  >
                    <Edit3 className="w-3 h-3 mr-1" /> Edit
                  </button>
                  <button
                    className="inline-flex items-center text-xs text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteProblemStudent(siswa.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderKalender = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-bold text-gray-800 mb-4 text-lg">
        Agenda Akademik Semester Genap 2025/2026
      </h3>
      <div className="relative border-l border-gray-200 ml-3 space-y-8">
        {agendaSemesterGenap.map((item, index) => (
          <div key={index} className="mb-8 ml-6">
            <span
              className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white ${
                item.type === 'urgent'
                  ? 'bg-red-500'
                  : item.type === 'exam'
                  ? 'bg-purple-500'
                  : item.type === 'holiday'
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }`}
            >
              <Calendar className="w-3 h-3 text-white" />
            </span>
            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
              {item.event}
              {item.type === 'urgent' && (
                <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded ml-3">
                  Penting
                </span>
              )}
            </h3>
            <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
              {item.date}
            </time>
            <p className="mb-4 text-base font-normal text-gray-500">
              {item.type === 'exam'
                ? 'Pastikan soal Ujian Madrasah sudah siap H-7 pelaksanaan. Gunakan mode CBT.'
                : ''}
              {item.type === 'urgent'
                ? ' Wajib diselesaikan sebelum kegiatan belajar mengajar dimulai.'
                : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInputNilai = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-700">Input & Rekap Nilai</h3>
          <p className="text-xs text-gray-500">
            Daftar paket penilaian per mapel/kelas yang siap diisi atau sudah dikirim.
          </p>
        </div>
        <button
          className="inline-flex items-center bg-emerald-600 text-white px-3 py-2 rounded text-xs hover:bg-emerald-700"
          onClick={handleAddScoreEntry}
        >
          <Plus className="w-3 h-3 mr-1" /> Tambah Paket Nilai
        </button>
      </div>

      {(nilaiError || nilaiLoading) && (
        <div className="px-4 py-3 border-b text-sm">
          {nilaiLoading && <div className="text-gray-600">Memuat / menyimpan data nilai...</div>}
          {nilaiError && <div className="text-red-600">{nilaiError}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              {user?.role === 'admin' && <th className="px-6 py-3">Guru</th>}
              <th className="px-6 py-3">Mapel</th>
              <th className="px-6 py-3">Kelas</th>
              <th className="px-6 py-3">Sumber</th>
              <th className="px-6 py-3">Kompetensi</th>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Siswa</th>
              <th className="px-6 py-3">Rata-rata</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {scoreEntries.map((entry) => (
              <tr key={entry.id} className="bg-white border-b hover:bg-gray-50">
                {user?.role === 'admin' && (
                  <td className="px-6 py-4">{entry.owner || '-'}</td>
                )}
                <td className="px-6 py-4 font-medium text-gray-900">{entry.mapel}</td>
                <td className="px-6 py-4">{entry.kelas}</td>
                <td className="px-6 py-4">{entry.sumber || '-'}</td>
                <td className="px-6 py-4">{entry.kompetensi}</td>
                <td className="px-6 py-4">{entry.tanggal}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      entry.status === 'Terkirim'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {entry.status}
                  </span>
                </td>
                <td className="px-6 py-4">{entry.studentCount ?? 0}</td>
                <td className="px-6 py-4">{entry.average ?? '-'}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => handleEditScoreEntry(entry.id, entry.owner)}
                  >
                    <Edit3 className="w-3 h-3 mr-1" /> Isi / Edit
                  </button>
                  <a
                    className="inline-flex items-center text-xs text-emerald-700 hover:text-emerald-900"
                    href={apiNilaiExportUrl({ id: String(entry.id), username: entry.owner })}
                    target="_blank"
                    rel="noreferrer"
                    title="Download rekap nilai (Word)"
                  >
                    <FileText className="w-3 h-3 mr-1" /> Word
                  </a>
                  <button
                    className="inline-flex items-center text-xs text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteScoreEntry(entry.id, entry.owner)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Hapus
                  </button>
                </td>
              </tr>
            ))}

            {(!scoreEntries || scoreEntries.length === 0) && (
              <tr>
                <td
                  className="px-6 py-6 text-center text-sm text-gray-500"
                  colSpan={user?.role === 'admin' ? 10 : 9}
                >
                  Belum ada paket nilai. Klik “Tambah Paket Nilai”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRppModulAjar = () => (
    <div className="space-y-6">
      <RppModulAjar />
    </div>
  );

  const renderKurikulum = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Transformasi KMA 1503 Tahun 2025</h3>
        <p className="opacity-90">
          {kma1503?.ringkasan ||
            'Panduan singkat implementasi kurikulum baru untuk Semester Genap.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
            Deep Learning (Pembelajaran Mendalam)
          </h4>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-1" />
              <span>
                <strong>Mindful (Berkesadaran):</strong> Siswa mengerti tujuan belajar untuk dunia dan
                akhirat.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-1" />
              <span>
                <strong>Meaningful (Bermakna):</strong> Materi dikaitkan dengan konteks nyata (cth:
                Mitigasi bencana Banggai).
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-1" />
              <span>
                <strong>Joyful (Menyenangkan):</strong> Hindari tekanan berlebih, gunakan gamifikasi.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center">
            <Users className="w-5 h-5 mr-2 text-pink-600" />
            Kurikulum Berbasis Cinta (KBC)
          </h4>
          <div className="bg-pink-50 p-4 rounded border border-pink-100 text-sm text-gray-700">
            <p className="font-semibold mb-2">Panca Cinta yang wajib diintegrasikan:</p>
            <ol className="list-decimal list-inside space-y-1">
              {(kma1503?.pancaCinta || [
                'Cinta kepada Allah & Rasul',
                'Cinta Diri Sendiri (Jauhi Narkoba/Bullying)',
                'Cinta Sesama (Toleransi & Inklusi)',
                'Cinta Ilmu (Budaya Riset/Olimpiade)',
                'Cinta Lingkungan (Adiwiyata)',
              ]).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="font-bold text-gray-800 mb-3">Checklist Implementasi KMA 1503 di MAN Banggai
        </h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
          {(kma1503?.checklistImplementasiCepat || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-3">
          Disarikan dari dokumen sosialisasi KMA 1503/2025 untuk MAN Banggai.
        </p>
      </div>
    </div>
  );

  const renderLaporan = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-700">Laporan Akademik & Implementasi KMA 1503</h3>
          <p className="text-xs text-gray-500">
            Daftar laporan yang siap dicetak atau dikirim ke Kanwil/Kemenag.
          </p>
        </div>
        <button
          className="inline-flex items-center bg-emerald-600 text-white px-3 py-2 rounded text-xs hover:bg-emerald-700"
          onClick={handleAddReport}
        >
          <Plus className="w-3 h-3 mr-1" /> Tambah Laporan
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">Jenis Laporan</th>
              <th className="px-6 py-3">Periode</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((lap) => (
              <tr key={lap.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{lap.jenis}</td>
                <td className="px-6 py-4">{lap.periode}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      lap.status === 'Final'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {lap.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => handleEditReport(lap.id)}
                  >
                    <FileText className="w-3 h-3 mr-1" /> Edit
                  </button>
                  <button
                    className="inline-flex items-center text-xs text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteReport(lap.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderKokurikuler = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-[80vh]">
      <iframe
        src={`${baseUrl}kokurikuler/index.html`}
        title="Perencanaan Kokurikuler DL & KBC"
        className="w-full h-full border-0"
      />
    </div>
  );

  const renderBkSystem = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-[80vh]">
      <iframe
        src={`${baseUrl}penanganan-siswa-bk.html?v=${staticIframeVersion}`}
        title="Sistem Penanganan Siswa & BK"
        className="w-full h-full border-0"
      />
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center text-emerald-600">
            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">Memuat dashboard...</p>
          </div>
        </div>
      );
    }

    // Jangan mengunci seluruh aplikasi hanya karena 1 endpoint gagal.
    // Ini sering terjadi bila hosting masih memakai API lama (sebagian action belum ada).
    // Tampilkan error hanya pada tab Dashboard; tab lain tetap bisa dibuka.
    if (error && activeTab === 'dashboard') {
      return (
        <div className="flex flex-1 items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-4 max-w-md text-center">
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <button
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === 'dashboard') return renderDashboard();
    if (activeTab === 'evaluasi') return renderEvaluasiGuru();
    if (activeTab === 'siswa') return renderSiswaBermasalah();
    if (activeTab === 'kalender') return renderKalender();
    if (activeTab === 'nilai') return renderInputNilai();
    if (activeTab === 'rpp') return renderRppModulAjar();
    if (activeTab === 'asesmen') {
      if (user?.role !== 'admin') return null;
      return <AsesmenMadrasah />;
    }
    if (activeTab === 'jurnal') {
      if (user?.role !== 'admin') return null;
      return <AdminJournal />;
    }
    if (activeTab === 'akun_guru') {
      if (user?.role !== 'admin') return null;
      return <AdminTeacherAccounts />;
    }
    if (activeTab === 'kurikulum') return renderKurikulum();
    if (activeTab === 'laporan') return renderLaporan();
    if (activeTab === 'kokurikuler') return renderKokurikuler();
    if (activeTab === 'bk') return renderBkSystem();
    if (activeTab === 'guru') {
      if (user?.role !== 'guru') return null;
      return <GuruMenu user={user} onUserUpdate={onUserUpdate} onNavigate={setActiveTab} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex bg-emerald-50 font-sans overflow-hidden">
      <aside className="w-16 sm:w-72 bg-emerald-600 text-emerald-50 flex flex-col shadow-lg shrink-0">
        <div className="px-3 sm:px-6 py-4 sm:py-5 border-b border-emerald-500 flex items-center justify-center sm:justify-start space-x-0 sm:space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
            <span className="text-2xl font-bold">S</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight">SIM-AKAD</h1>
            <p className="text-xs text-emerald-100">Monitoring Akademik</p>
          </div>
        </div>

        <div className="hidden sm:flex px-6 py-4 border-b border-emerald-500 items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500" />
          <div className="flex-1">
            <div className="h-2.5 bg-emerald-500/60 rounded-full mb-1.5" />
            <div className="h-2 bg-emerald-500/40 rounded-full w-3/4" />
          </div>
        </div>

        <nav className="flex-1 px-2 sm:px-3 py-3 sm:py-4 space-y-1 text-sm overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
              activeTab === 'dashboard'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-emerald-50 hover:bg-emerald-500/40'
            }`}
          >
            <span className="mr-0 sm:mr-2 text-lg">🏠</span>
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('evaluasi')}
              className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
                activeTab === 'evaluasi'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-emerald-50 hover:bg-emerald-500/40'
              }`}
            >
              <span className="mr-0 sm:mr-2 text-lg">👩‍🏫</span>
              <span className="hidden sm:inline">Evaluasi Guru</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('asesmen')}
              className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
                activeTab === 'asesmen'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-emerald-50 hover:bg-emerald-500/40'
              }`}
            >
              <span className="mr-0 sm:mr-2 text-lg">🧠</span>
              <span className="hidden sm:inline">Soal / Asesmen</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('jurnal')}
              className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
                activeTab === 'jurnal'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-emerald-50 hover:bg-emerald-500/40'
              }`}
            >
              <span className="mr-0 sm:mr-2 text-lg">📒</span>
              <span className="hidden sm:inline">Jurnal Guru</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('akun_guru')}
              className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
                activeTab === 'akun_guru'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-emerald-50 hover:bg-emerald-500/40'
              }`}
            >
              <span className="mr-0 sm:mr-2 text-lg">👥</span>
              <span className="hidden sm:inline">Akun Guru</span>
            </button>
          )}

          {user?.role === 'guru' && (
            <button
              onClick={() => setActiveTab('guru')}
              className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
                activeTab === 'guru'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-emerald-50 hover:bg-emerald-500/40'
              }`}
            >
              <span className="mr-0 sm:mr-2 text-lg">👨‍🏫</span>
              <span className="hidden sm:inline">Menu Guru</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('siswa')}
            className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
              activeTab === 'siswa'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-emerald-50 hover:bg-emerald-500/40'
            }`}
          >
            <span className="mr-0 sm:mr-2 text-lg">⚠️</span>
            <span className="hidden sm:inline">Siswa Bermasalah</span>
          </button>

          <button
            onClick={() => setActiveTab('kalender')}
            className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
              activeTab === 'kalender'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-emerald-50 hover:bg-emerald-500/40'
            }`}
          >
            <span className="mr-0 sm:mr-2 text-lg">📅</span>
            <span className="hidden sm:inline">Kalender Genap</span>
          </button>

          <button
            onClick={() => setActiveTab('bk')}
            className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
              activeTab === 'bk'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-emerald-50 hover:bg-emerald-500/40'
            }`}
          >
            <span className="mr-0 sm:mr-2 text-lg">📑</span>
            <span className="hidden sm:inline">Sistem BK & Siswa</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('nilai')}
              className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
                activeTab === 'nilai'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-emerald-50 hover:bg-emerald-500/40'
              }`}
            >
              <span className="mr-0 sm:mr-2 text-lg">📝</span>
              <span className="hidden sm:inline">Input Nilai</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('rpp')}
              className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
                activeTab === 'rpp'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-emerald-50 hover:bg-emerald-500/40'
              }`}
            >
              <span className="mr-0 sm:mr-2 text-lg">📚</span>
              <span className="hidden sm:inline">RPP / Modul Ajar</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('kurikulum')}
            className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
              activeTab === 'kurikulum'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-emerald-50 hover:bg-emerald-500/40'
            }`}
          >
            <span className="mr-0 sm:mr-2 text-lg">📘</span>
            <span className="hidden sm:inline">Panduan KMA 1503</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('kokurikuler')}
              className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
                activeTab === 'kokurikuler'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-emerald-50 hover:bg-emerald-500/40'
              }`}
            >
              <span className="mr-0 sm:mr-2 text-lg">🎯</span>
              <span className="hidden sm:inline">Kokurikuler</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('laporan')}
            className={`w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 rounded-lg font-medium transition ${
              activeTab === 'laporan'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-emerald-50 hover:bg-emerald-500/40'
            }`}
          >
            <span className="mr-0 sm:mr-2 text-lg">📊</span>
            <span className="hidden sm:inline">Laporan</span>
          </button>
        </nav>

        <div className="px-3 sm:px-6 py-4 border-t border-emerald-500 text-xs text-emerald-100">
          <div className="hidden sm:block">
            <p className="mb-1">{user?.name || 'Pengguna SIM-AKAD'}</p>
            <p className="mb-2">Role: {user?.role === 'admin' ? 'Admin' : 'Guru'}</p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-emerald-200 rounded-md text-emerald-50 hover:bg-emerald-500/40 text-xs"
          >
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-semibold text-emerald-900">
              {activeTab === 'dashboard' && 'Dashboard Akademik'}
              {activeTab === 'evaluasi' && 'Evaluasi Guru'}
              {activeTab === 'asesmen' && 'Soal / Asesmen'}
              {activeTab === 'guru' && 'Menu Guru'}
              {activeTab === 'siswa' && 'Siswa Bermasalah'}
              {activeTab === 'kalender' && 'Kalender Genap'}
              {activeTab === 'nilai' && 'Input & Rekap Nilai'}
              {activeTab === 'rpp' && 'Penyusunan RPP / Modul Ajar'}
              {activeTab === 'kurikulum' && 'Panduan KMA 1503'}
              {activeTab === 'kokurikuler' && 'Penyusunan Program Kokurikuler'}
              {activeTab === 'laporan' && 'Laporan Akademik'}
              {activeTab === 'bk' && 'Sistem Penanganan Siswa & BK'}
            </h2>
            <p className="text-xs text-emerald-700 mt-1">
              SIM-AKAD MAN Banggai · Berbasis KMA 1503 Tahun 2025
            </p>
          </div>
        </div>

        {renderContent()}
      </main>

      {editingTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleCancelEditingTeacher();
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Edit Evaluasi Guru - {editingTeacher.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Lengkapi komponen instrumen evaluasi dalam satu tampilan, lalu simpan sekali klik.
                </p>
              </div>
              <button
                onClick={handleCancelEditingTeacher}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nama Guru
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingTeacher.name || ''}
                  onChange={(e) => handleChangeEditingTeacherField('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingTeacher.mapel || ''}
                  onChange={(e) => handleChangeEditingTeacherField('mapel', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Kelas/Rombel (Instrumen Kelas)
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingTeacher.kelas || ''}
                  onChange={(e) => handleChangeEditingTeacherField('kelas', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Kehadiran (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingTeacher.kehadiran ?? ''}
                  onChange={(e) => handleChangeEditingTeacherField('kehadiran', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Status Modul (Lengkap/Belum Lengkap)
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingTeacher.modul || ''}
                  onChange={(e) => handleChangeEditingTeacherField('modul', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Metode Ajar
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingTeacher.metode || ''}
                  onChange={(e) => handleChangeEditingTeacherField('metode', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Status (Aman/Perlu Pembinaan)
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingTeacher.status || ''}
                  onChange={(e) => handleChangeEditingTeacherField('status', e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-2 mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-3">
                Skor Instrumen (1 = Kurang, 4 = Sangat Baik)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Administrasi
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    className="w-full border rounded px-3 py-2 text-sm text-center"
                    value={editingTeacher.adminScore ?? ''}
                    onChange={(e) =>
                      handleChangeEditingTeacherField('adminScore', e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Pelaksanaan
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    className="w-full border rounded px-3 py-2 text-sm text-center"
                    value={editingTeacher.pelaksanaanScore ?? ''}
                    onChange={(e) =>
                      handleChangeEditingTeacherField('pelaksanaanScore', e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Penilaian
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    className="w-full border rounded px-3 py-2 text-sm text-center"
                    value={editingTeacher.penilaianScore ?? ''}
                    onChange={(e) =>
                      handleChangeEditingTeacherField('penilaianScore', e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Kompetensi Lainnya
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    className="w-full border rounded px-3 py-2 text-sm text-center"
                    value={editingTeacher.kompetensiScore ?? ''}
                    onChange={(e) =>
                      handleChangeEditingTeacherField('kompetensiScore', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Teknik Pengumpulan Data (Dokumen, Observasi, Wawancara, Angket, Portofolio)
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm"
                value={editingTeacher.teknik || ''}
                onChange={(e) => handleChangeEditingTeacherField('teknik', e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleCancelEditingTeacher}
                className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditingTeacher}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProblemStudent && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleCancelEditingProblemStudent();
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {problemStudents.some((s) => s.id === editingProblemStudent.id)
                    ? 'Edit Siswa Bermasalah'
                    : 'Tambah Siswa Bermasalah'}
                </h3>
                <p className="text-xs text-gray-500">
                  Lengkapi identitas siswa, masalah utama, dan rencana tindak lanjut pembinaan.
                </p>
              </div>
              <button
                onClick={handleCancelEditingProblemStudent}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Siswa</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingProblemStudent.name || ''}
                  onChange={(e) =>
                    setEditingProblemStudent((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev,
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kelas</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingProblemStudent.kelas || ''}
                  onChange={(e) =>
                    setEditingProblemStudent((prev) =>
                      prev ? { ...prev, kelas: e.target.value } : prev,
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Masalah Utama</label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm min-h-[70px]"
                  value={editingProblemStudent.masalah || ''}
                  onChange={(e) =>
                    setEditingProblemStudent((prev) =>
                      prev ? { ...prev, masalah: e.target.value } : prev,
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Tindak Lanjut / Rencana Pembinaan
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm min-h-[70px]"
                  value={editingProblemStudent.tindakLanjut || ''}
                  onChange={(e) =>
                    setEditingProblemStudent((prev) =>
                      prev ? { ...prev, tindakLanjut: e.target.value } : prev,
                    )
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleCancelEditingProblemStudent}
                className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditingProblemStudent}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {editingScoreEntry && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleCancelEditingScoreEntry();
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {scoreEntries.some((n) => n.id === editingScoreEntry.id)
                    ? 'Edit Paket Penilaian'
                    : 'Tambah Paket Penilaian'}
                </h3>
                <p className="text-xs text-gray-500">
                  Atur mapel, kelas, kompetensi yang dinilai, tanggal, dan status pengiriman.
                </p>
              </div>
              <button
                onClick={handleCancelEditingScoreEntry}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingScoreEntry.mapel || ''}
                  onChange={(e) =>
                    setEditingScoreEntry((prev) =>
                      prev ? { ...prev, mapel: e.target.value } : prev,
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kelas</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingScoreEntry.kelas || ''}
                  onChange={(e) =>
                    setEditingScoreEntry((prev) =>
                      prev ? { ...prev, kelas: e.target.value } : prev,
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Sumber Nilai</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingScoreEntry.sumber || ''}
                  onChange={(e) =>
                    setEditingScoreEntry((prev) =>
                      prev ? { ...prev, sumber: e.target.value } : prev,
                    )
                  }
                >
                  <option value="">-- Pilih --</option>
                  <option value="Formatif">Formatif</option>
                  <option value="Sumatif">Sumatif</option>
                  <option value="Akumulasi">Akumulasi</option>
                  <option value="Projek">Projek</option>
                  <option value="Praktik">Praktik</option>
                  <option value="Ulangan Harian">Ulangan Harian</option>
                  <option value="PTS">PTS</option>
                  <option value="PAS">PAS</option>
                  <option value="PAT">PAT</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kompetensi</label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm min-h-[70px]"
                  value={editingScoreEntry.kompetensi || ''}
                  onChange={(e) =>
                    setEditingScoreEntry((prev) =>
                      prev ? { ...prev, kompetensi: e.target.value } : prev,
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Tanggal (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={editingScoreEntry.tanggal || ''}
                    onChange={(e) =>
                      setEditingScoreEntry((prev) =>
                        prev ? { ...prev, tanggal: e.target.value } : prev,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={editingScoreEntry.status || 'Draft'}
                    onChange={(e) =>
                      setEditingScoreEntry((prev) =>
                        prev ? { ...prev, status: e.target.value } : prev,
                      )
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Terkirim">Terkirim</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-700">Daftar Siswa</div>
                    <div className="text-xs text-gray-500">
                      Isi nama/NIS lalu masukkan nilai (0-100).
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-2 rounded text-xs hover:bg-gray-200"
                      onClick={handleLoadRosterTemplate}
                      disabled={rosterLoading}
                      title="Muat daftar siswa template untuk kelas ini"
                    >
                      <Users className="w-3 h-3 mr-1" /> Muat Template
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-2 rounded text-xs hover:bg-gray-200"
                      onClick={handleSaveRosterTemplate}
                      disabled={rosterLoading}
                      title="Simpan daftar siswa saat ini sebagai template kelas"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Simpan Template
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-2 rounded text-xs hover:bg-gray-200"
                      onClick={() =>
                        setEditingScoreEntry((prev) => {
                          if (!prev) return prev;
                          const list = Array.isArray(prev.students) ? prev.students : [];
                          return {
                            ...prev,
                            students: [
                              ...list,
                              {
                                id: String(Date.now()),
                                name: '',
                                nis: '',
                                score: '',
                                note: '',
                              },
                            ],
                          };
                        })
                      }
                    >
                      <Plus className="w-3 h-3 mr-1" /> Tambah Siswa
                    </button>
                  </div>
                </div>

                {(rosterError || rosterLoading) && (
                  <div className="mb-2 text-xs">
                    {rosterLoading && <div className="text-gray-600">Memproses template kelas...</div>}
                    {rosterError && <div className="text-red-600">{rosterError}</div>}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-600 border">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-2 py-2 w-10">No</th>
                        <th className="px-2 py-2">Nama</th>
                        <th className="px-2 py-2 w-28">NIS</th>
                        <th className="px-2 py-2 w-20">Nilai</th>
                        <th className="px-2 py-2">Catatan</th>
                        <th className="px-2 py-2 w-16 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(editingScoreEntry.students)
                        ? editingScoreEntry.students
                        : []
                      ).map((s, idx) => (
                        <tr key={s.id || idx} className="border-t">
                          <td className="px-2 py-2 text-center">{idx + 1}</td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={s.name || ''}
                              onChange={(e) =>
                                setEditingScoreEntry((prev) => {
                                  if (!prev) return prev;
                                  const list = Array.isArray(prev.students) ? [...prev.students] : [];
                                  list[idx] = { ...list[idx], name: e.target.value };
                                  return { ...prev, students: list };
                                })
                              }
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={s.nis || ''}
                              onChange={(e) =>
                                setEditingScoreEntry((prev) => {
                                  if (!prev) return prev;
                                  const list = Array.isArray(prev.students) ? [...prev.students] : [];
                                  list[idx] = { ...list[idx], nis: e.target.value };
                                  return { ...prev, students: list };
                                })
                              }
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="w-full border rounded px-2 py-1"
                              value={s.score ?? ''}
                              onChange={(e) =>
                                setEditingScoreEntry((prev) => {
                                  if (!prev) return prev;
                                  const list = Array.isArray(prev.students) ? [...prev.students] : [];
                                  list[idx] = { ...list[idx], score: e.target.value };
                                  return { ...prev, students: list };
                                })
                              }
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={s.note || ''}
                              onChange={(e) =>
                                setEditingScoreEntry((prev) => {
                                  if (!prev) return prev;
                                  const list = Array.isArray(prev.students) ? [...prev.students] : [];
                                  list[idx] = { ...list[idx], note: e.target.value };
                                  return { ...prev, students: list };
                                })
                              }
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            <button
                              type="button"
                              className="inline-flex items-center text-red-600 hover:text-red-800"
                              onClick={() =>
                                setEditingScoreEntry((prev) => {
                                  if (!prev) return prev;
                                  const list = Array.isArray(prev.students) ? [...prev.students] : [];
                                  list.splice(idx, 1);
                                  return { ...prev, students: list };
                                })
                              }
                              title="Hapus siswa"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {(!Array.isArray(editingScoreEntry.students) ||
                        editingScoreEntry.students.length === 0) && (
                        <tr>
                          <td className="px-2 py-4 text-center text-gray-500" colSpan={6}>
                            Belum ada siswa di paket ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-2 text-xs text-gray-600">
                  Rata-rata (yang terisi):{' '}
                  <span className="font-semibold">
                    {computeNilaiAverage(editingScoreEntry.students) ?? '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleCancelEditingScoreEntry}
                className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Batal
              </button>
              {editingScoreEntry?.id && String(editingScoreEntry.id).trim() !== '' && (
                <a
                  className="px-4 py-2 text-xs font-semibold text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-50 inline-flex items-center"
                  href={apiNilaiExportUrl({
                    id: String(editingScoreEntry.id),
                    username: editingScoreEntry.owner,
                  })}
                  target="_blank"
                  rel="noreferrer"
                  title="Download rekap nilai (Word)"
                >
                  <FileText className="w-3 h-3 mr-1" /> Download Word
                </a>
              )}
              <button
                onClick={handleSaveEditingScoreEntry}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {editingReport && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleCancelEditingReport();
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {reports.some((r) => r.id === editingReport.id)
                    ? 'Edit Laporan Akademik'
                    : 'Tambah Laporan Akademik'}
                </h3>
                <p className="text-xs text-gray-500">
                  Lengkapi jenis laporan, periode, dan status (Draft/Final) sesuai kebutuhan pelaporan.
                </p>
              </div>
              <button
                onClick={handleCancelEditingReport}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Laporan</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingReport.jenis || ''}
                  onChange={(e) =>
                    setEditingReport((prev) =>
                      prev ? { ...prev, jenis: e.target.value } : prev,
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Periode</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingReport.periode || ''}
                  onChange={(e) =>
                    setEditingReport((prev) =>
                      prev ? { ...prev, periode: e.target.value } : prev,
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingReport.status || 'Draft'}
                  onChange={(e) =>
                    setEditingReport((prev) =>
                      prev ? { ...prev, status: e.target.value } : prev,
                    )
                  }
                >
                  <option value="Draft">Draft</option>
                  <option value="Final">Final</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleCancelEditingReport}
                className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditingReport}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimAkadDashboard;
