import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Download,
  Globe,
  GraduationCap,
  Heart,
  Library,
  Loader2,
  RefreshCw,
  ScrollText,
  Settings,
  Sparkles,
  Table as TableIcon,
  FileText,
  Award,
} from 'lucide-react';

import { apiGeminiGenerate } from './apiClient.js';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';

const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (retries > 0 && (response.status === 429 || response.status >= 500)) {
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>
);

const Badge = ({ children, type = 'default' }) => {
  const styles = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    primary: 'bg-teal-100 text-teal-800',
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || styles.default}`}
    >
      {children}
    </span>
  );
};

const REFERENCE_DATA = {
  subjects: [
    "Al-Qur'an Hadis",
    'Akidah Akhlak',
    'Fikih',
    'Sejarah Kebudayaan Islam (SKI)',
    'Bahasa Arab',
    'Bahasa Indonesia',
    'Matematika',
    'IPA (Fisika/Kimia/Biologi)',
    'IPS (Sejarah/Geografi/Ekonomi/Sosiologi)',
    'Pendidikan Pancasila',
    'Bahasa Inggris',
    'Informatika',
    'PJOK',
    'Seni Budaya',
    'Prakarya',
  ],
  phases: [
    { id: 'Fase A', label: 'Fase A (Kelas 1-2 MI)', classes: ['Kelas 1', 'Kelas 2'] },
    { id: 'Fase B', label: 'Fase B (Kelas 3-4 MI)', classes: ['Kelas 3', 'Kelas 4'] },
    { id: 'Fase C', label: 'Fase C (Kelas 5-6 MI)', classes: ['Kelas 5', 'Kelas 6'] },
    { id: 'Fase D', label: 'Fase D (Kelas 7-9 MTs)', classes: ['Kelas 7', 'Kelas 8', 'Kelas 9'] },
    { id: 'Fase E', label: 'Fase E (Kelas 10 MA)', classes: ['Kelas 10'] },
    { id: 'Fase F', label: 'Fase F (Kelas 11-12 MA)', classes: ['Kelas 11', 'Kelas 12'] },
  ],
  types: [
    { id: 'Pilihan Ganda', label: 'Pilihan Ganda (PG)' },
    { id: 'Pilihan Ganda Kompleks', label: 'PG Kompleks' },
    { id: 'Benar - Salah', label: 'Benar - Salah' },
    { id: 'Menjodohkan', label: 'Menjodohkan' },
    { id: 'Uraian Singkat', label: 'Isian/Uraian Singkat' },
    { id: 'Essai', label: 'Uraian Bebas (Essai)' },
  ],
  assessments: [
    { id: 'Formatif', label: 'Formatif (Diagnostik/Proses)' },
    { id: 'Sumatif Lingkup Materi', label: 'Sumatif Lingkup Materi' },
    { id: 'Sumatif Akhir Semester', label: 'Sumatif Akhir Semester (SAS/PAS)' },
  ],
};

const safeText = (value, fallback = '-') => {
  const text = (value ?? '').toString().trim();
  return text.length ? text : fallback;
};

const BANK_STORAGE_KEY = 'simakad.bankPaketAsesmen.v1';

const loadBankPackages = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BANK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const downloadTextFile = (filename, mimeType, content) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function AsesmenMadrasah() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const absoluteLogoUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${baseUrl}logo-kemenag.png`
      : `${baseUrl}logo-kemenag.png`;
  const [mode, setMode] = useState('generator'); // generator | bank
  const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Result
  const [activeTab, setActiveTab] = useState('soal'); // soal, kunci, kisi
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    subject: '',
    phase: '',
    classLevel: '',
    assessmentType: 'Sumatif Lingkup Materi',
    topic: '',
    stimulusImageUrl: '',
    stimulusImageCaption: '',
    stimulusImageDataUrl: '',
    type: 'Pilihan Ganda',
    easy: 2,
    medium: 2,
    hard: 1,
  });

  const [generatedData, setGeneratedData] = useState([]);

  const [bankPackages, setBankPackages] = useState(() => loadBankPackages());
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(bankPackages));
    } catch {
      // ignore storage errors (quota, disabled storage)
    }
  }, [bankPackages]);

  const selectedPackage = useMemo(() => {
    return bankPackages.find((p) => p?.id === selectedPackageId) || null;
  }, [bankPackages, selectedPackageId]);

  const totalQuestions = useMemo(() => {
    return (
      (parseInt(formData.easy, 10) || 0) +
      (parseInt(formData.medium, 10) || 0) +
      (parseInt(formData.hard, 10) || 0)
    );
  }, [formData.easy, formData.medium, formData.hard]);

  const handlePhaseChange = (e) => {
    const selectedPhase = e.target.value;
    setFormData((prev) => ({
      ...prev,
      phase: selectedPhase,
      classLevel: '',
    }));
  };

  const availableClasses = useMemo(() => {
    const phaseData = REFERENCE_DATA.phases.find((p) => p.id === formData.phase);
    return phaseData ? phaseData.classes : [];
  }, [formData.phase]);

  const handleReset = () => {
    setStep(1);
    setGeneratedData([]);
    setActiveTab('soal');
    setErrorMsg('');
  };

  const handleSaveToBank = () => {
    setErrorMsg('');
    if (!generatedData || generatedData.length === 0) {
      setErrorMsg('Belum ada soal untuk disimpan. Silakan generate terlebih dahulu.');
      return;
    }

    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const createdAt = new Date().toISOString();
    const meta = {
      subject: formData.subject,
      phase: formData.phase,
      classLevel: formData.classLevel,
      assessmentType: formData.assessmentType,
      topic: formData.topic,
      type: formData.type,
      easy: formData.easy,
      medium: formData.medium,
      hard: formData.hard,
    };

    const pkg = {
      id,
      createdAt,
      meta,
      items: generatedData,
    };

    setBankPackages((prev) => [pkg, ...prev]);
    setSelectedPackageId(id);
    setMode('bank');
  };

  const handleDeletePackage = (id) => {
    if (!window.confirm('Hapus paket asesmen ini dari Bank?')) return;
    setBankPackages((prev) => prev.filter((p) => p?.id !== id));
    setSelectedPackageId((prev) => (prev === id ? null : prev));
  };

  const generateQuestionsWithAI = async () => {
    setErrorMsg('');

    if (!formData.subject || !formData.phase || !formData.classLevel || !formData.topic) {
      setErrorMsg('Mohon lengkapi Mata Pelajaran, Fase, Kelas, dan Materi Pokok.');
      return;
    }

    if (totalQuestions <= 0) {
      setErrorMsg('Total butir soal harus lebih dari 0.');
      return;
    }

    setStep(2);

    const systemInstruction = `
Anda adalah "Sobat Madrasah AI", ahli asesmen pendidikan Kemenag RI.
Filosofi anda menggabungkan dua pilar utama:
1) Kurikulum Berbasis Cinta (KMA 1503 Th 2025)
2) Deep Learning (Pembelajaran Mendalam) 6C

Tugas: Susun soal valid secara akademik, santun, dan kontekstual.
`;

    const userPrompt = `
Buatkan ${totalQuestions} butir soal untuk Madrasah.

KONTEKS IMPLEMENTASI:
- Mapel: ${formData.subject}
- Jenjang: ${formData.phase} - ${formData.classLevel}
- Materi Pokok: "${formData.topic}"
- Jenis Asesmen: ${formData.assessmentType}

STIMULUS GAMBAR (OPSIONAL):
${formData.stimulusImageDataUrl ? `- Ada 1 gambar stimulus terlampir dengan caption: "${safeText(formData.stimulusImageCaption, 'Gambar stimulus')}".\n- WAJIB: setiap butir soal harus relevan dan merujuk gambar stimulus ini (mis. gunakan frasa "Perhatikan gambar stimulus berikut" pada stimulus).` : '- Tidak ada gambar stimulus.'}

SPESIFIKASI SOAL:
1) Tipe Soal: ${formData.type}
2) Sebaran Kognitif:
   - L1 (Pemahaman): ${formData.easy}
   - L2 (Penerapan): ${formData.medium}
   - L3 (Penalaran/Deep Learning): ${formData.hard}

PERSYARATAN WAJIB (STRICT):
1) Jika tipe soal Pilihan Ganda, sertakan 5 opsi A-E.
2) Setiap soal wajib ada stimulus yang relevan.
2a) Jika ada gambar stimulus, stimulus teks harus mengarahkan peserta didik untuk mengamati gambar (mis. "Perhatikan gambar stimulus berikut") dan pertanyaan harus menggunakan informasi/konteks yang sesuai gambar.
3) Bahasa santun, inklusif, tidak menghakimi.
4) Tentukan Dimensi Cinta (KMA 1503) dan Kompetensi 6C untuk kisi-kisi.
5) Output: JSON Array murni.

Struktur object JSON:
{
  "no": number,
  "type": "${formData.type}",
  "difficulty": "L1" | "L2" | "L3 (Deep Learning)",
  "content": {
    "stimulus": "...",
    "question": "...",
    "options": ["A", "B", "C", "D", "E"]
  },
  "key": "Kunci Jawaban",
  "explanation": "Pembahasan",
  "grid": {
    "competency": "TP (Tujuan Pembelajaran)",
    "indicator": "Indikator Soal",
    "dimension": "Dimensi Cinta & 6C"
  }
}
`;

    try {
      // Panggil proxy PHP (API key disimpan di server, bukan di perangkat guru)
      const response = await apiGeminiGenerate({
        userPrompt,
        systemInstruction,
        model: DEFAULT_GEMINI_MODEL,
      });

      const textResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) throw new Error('Tidak ada respons dari AI.');

      const parsed = JSON.parse(textResponse);
      if (!Array.isArray(parsed)) throw new Error('Format AI tidak sesuai (bukan JSON Array).');

      setGeneratedData(parsed);
      setStep(3);
    } catch (err) {
      console.error('Gagal generate:', err);
      setErrorMsg(
        err?.message ||
          'Gagal menyusun soal. Pastikan Anda login, server PHP aktif, dan admin sudah mengatur API key di server.'
      );
      setStep(1);
    }
  };

  const handleDownloadDoc = (itemsOverride, metaOverride) => {
    const items = Array.isArray(itemsOverride) ? itemsOverride : generatedData;
    const meta = metaOverride || formData;
    if (!items || items.length === 0) return;

    const stimulusImageHtml = meta?.stimulusImageDataUrl
      ? `
<div style="margin: 6px 0 8px 0;">
  <div style="font-weight:bold; color:#000; margin-bottom:4px;">Gambar Stimulus</div>
  <img src="${meta.stimulusImageDataUrl}" alt="${safeText(
          meta.stimulusImageCaption,
          'Gambar stimulus'
        )}" style="max-width: 320px; height: auto; border:1px solid #000;" />
  <div style="font-size:10pt; font-style:italic; margin-top:4px;">${safeText(
          meta.stimulusImageCaption,
          ''
        )}</div>
</div>
`
      : '';

    const content = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Sobat Madrasah - ${safeText(meta.subject)}</title>
<style>
  @page { size: A4; margin: 2.54cm; }
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.15; color: #000; }
  p { margin: 0 0 6pt 0; text-align: justify; text-indent: 1.25cm; }
  .no-indent { text-indent: 0; }
  .header-table { width: 100%; border-bottom: 3px double #000; margin-bottom: 14pt; }
  .header-table td { border: none; padding: 5px; vertical-align: middle; }
  .header-table p { text-indent: 0; text-align: center; }
  .identity-table { width: 100%; border: none; margin-bottom: 10pt; font-size: 11pt; }
  .identity-table td { border: none; padding: 2px 5px; vertical-align: top; }
  .content-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11pt; }
  .content-table th, .content-table td { border: 1px solid #000; padding: 5px; vertical-align: top; }
  .content-table th { background: none; text-align: center; font-weight: bold; }
  .question-item-table { width: 100%; border: none; margin-bottom: 12pt; page-break-inside: avoid; }
  .question-item-table td { border: none; padding: 2px; vertical-align: top; }
  .stimulus-box { border: 1px solid #000; padding: 8px; background: none; margin-bottom: 8px; font-style: italic; font-size: 11pt; }
  h1 { font-size: 12pt; text-transform: uppercase; margin: 0; text-align: center; color: #000; }
  h2 { font-size: 12pt; text-transform: uppercase; margin: 4pt 0 0 0; text-align: center; color: #000; }
  h3 { font-size: 12pt; margin: 12pt 0 6pt 0; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4pt; color: #000; }
  .page-break { page-break-before: always; }
  .tag-dimensi { font-size: 9pt; color: #000; font-style: italic; }
</style>
</head>
<body>

<table class="header-table">
<tr>
<td width="15%" align="left" style="vertical-align: top;">
  <img src="${absoluteLogoUrl}" alt="Logo Kemenag" style="width: 70px; height: auto;" />
</td>
<td width="85%" align="center">
  <h1>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h1>
  <h2>INSTRUMEN ASESMEN MADRASAH</h2>
  <p style="margin:0; font-size:10pt;">${safeText(meta.assessmentType).toUpperCase()}</p>
</td>
</tr>
</table>

<table class="identity-table">
<tr>
<td width="20%"><strong>Mata Pelajaran</strong></td><td width="2%">:</td><td width="48%">${safeText(
      meta.subject
    )}</td>
<td width="15%"><strong>Fase/Kelas</strong></td><td width="2%">:</td><td width="13%">${safeText(
      meta.phase
    )}</td>
</tr>
<tr>
<td><strong>Materi Pokok</strong></td><td>:</td><td colspan="4">${safeText(meta.topic)}</td>
</tr>
</table>

<h3>A. SOAL DAN STIMULUS</h3>

${stimulusImageHtml}

${items
  .map((item) => {
    const stimulus = item?.content?.stimulus ? String(item.content.stimulus) : '';
    const question = item?.content?.question ? String(item.content.question) : '';
    const options = Array.isArray(item?.content?.options) ? item.content.options : [];

    const perItemImage = meta?.stimulusImageDataUrl
      ? `
<div style="margin: 6px 0 8px 0;">
  <img src="${meta.stimulusImageDataUrl}" alt="${safeText(
          meta.stimulusImageCaption,
          'Gambar stimulus'
        )}" style="max-width: 280px; height: auto; border:1px solid #000;" />
</div>
`
      : '';

    return `
<table class="question-item-table">
<tr>
<td width="5%" valign="top"><strong>${safeText(item?.no, '')}.</strong></td>
<td width="95%" valign="top">
${stimulus ? `<div class="stimulus-box">${stimulus.replace(/\n/g, '<br/>')}${perItemImage}</div>` : meta?.stimulusImageDataUrl ? `<div class="stimulus-box">Perhatikan gambar stimulus berikut.${perItemImage}</div>` : ''}
<div style="margin-bottom: 10px;">${question.replace(/\n/g, '<br/>')}</div>
${options.length > 0
      ? `
<table style="width:100%; border:none; border-collapse: collapse;">
${options
  .map((opt, idx) => {
    const cleanOpt = String(opt || '').replace(/^[A-E]\.\s*/i, '');
    const label = String.fromCharCode(65 + idx);
    return `
<tr>
<td style="border:none; padding:4px; vertical-align:top;" width="30"><strong>${label}.</strong></td>
<td style="border:none; padding:4px; vertical-align:top;">${cleanOpt}</td>
</tr>
`;
  })
  .join('')}
</table>
`
      : ''}
</td>
</tr>
</table>
`;
  })
  .join('')}

<div class="page-break"></div>

<h3>B. KISI-KISI & INTEGRASI NILAI (Deep Learning)</h3>
<table class="content-table">
<thead>
<tr>
<th width="5%">No</th>
<th width="30%">Tujuan Pembelajaran</th>
<th width="40%">Indikator & Dimensi</th>
<th width="10%">Level</th>
<th width="15%">Bentuk</th>
</tr>
</thead>
<tbody>
${items
  .map((item) => {
    return `
<tr>
<td align="center">${safeText(item?.no, '')}</td>
<td>${safeText(item?.grid?.competency)}</td>
<td>${safeText(item?.grid?.indicator)}<br/><span class="tag-dimensi">[${safeText(
      item?.grid?.dimension,
      ''
    )}]</span></td>
<td align="center">${safeText(item?.difficulty, '').replace('Deep Learning', 'DL')}</td>
<td align="center">${safeText(item?.type)}</td>
</tr>
`;
  })
  .join('')}
</tbody>
</table>

<div class="page-break"></div>

<h3>C. KUNCI JAWABAN & PEMBAHASAN</h3>
<table class="content-table">
<thead>
<tr>
<th width="5%">No</th>
<th width="25%">Kunci Jawaban</th>
<th width="70%">Pembahasan</th>
</tr>
</thead>
<tbody>
${items
  .map((item) => {
    return `
<tr>
<td align="center"><strong>${safeText(item?.no, '')}</strong></td>
<td>${safeText(item?.key)}</td>
<td>${safeText(item?.explanation)}</td>
</tr>
`;
  })
  .join('')}
</tbody>
</table>

</body>
</html>
`;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeSubject = safeText(meta.subject, 'mapel').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `SobatMadrasah_${safeSubject}_${new Date().getTime()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* ignore */
      }
    }, 2000);
  };

  const readBlobAsDataUrl = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.readAsDataURL(blob);
    });

  const handleStimulusImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readBlobAsDataUrl(file);
      setFormData((prev) => ({
        ...prev,
        stimulusImageDataUrl: dataUrl,
        stimulusImageUrl: '',
        stimulusImageCaption:
          prev.stimulusImageCaption || `Gambar stimulus: ${prev.topic || 'Materi'}`,
      }));
    } catch {
      // eslint-disable-next-line no-alert
      window.alert('Gagal memuat gambar. Coba pilih file gambar lain.');
    }
  };

  const convertStimulusImageUrlToDataUrl = async () => {
    const url = String(formData.stimulusImageUrl || '').trim();
    if (!url) return;
    try {
      let response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Direct fetch failed');
      const blob = await response.blob();
      if (!blob || blob.size === 0) throw new Error('Empty blob');
      const dataUrl = await readBlobAsDataUrl(blob);
      setFormData((prev) => ({
        ...prev,
        stimulusImageDataUrl: dataUrl,
        stimulusImageCaption:
          prev.stimulusImageCaption || `Gambar stimulus: ${prev.topic || 'Materi'}`,
      }));
    } catch {
      try {
        const proxyUrl = `${baseUrl}api/image-proxy.php?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);
        if (!proxyResponse.ok) throw new Error('Proxy failed');
        const blob = await proxyResponse.blob();
        if (!blob || blob.size === 0) throw new Error('Empty proxy blob');
        const dataUrl = await readBlobAsDataUrl(blob);
        setFormData((prev) => ({
          ...prev,
          stimulusImageDataUrl: dataUrl,
          stimulusImageCaption:
            prev.stimulusImageCaption || `Gambar stimulus: ${prev.topic || 'Materi'}`,
        }));
      } catch {
        // eslint-disable-next-line no-alert
        window.alert(
          'Tidak bisa mengkonversi gambar dari URL. Penyebab umum: CORS, URL bukan gambar langsung, ukuran terlalu besar, atau server tidak aktif. Solusi paling aman: Upload gambar dari perangkat.'
        );
      }
    }
  };

  const handleDownloadJson = (pkg) => {
    if (!pkg) return;
    const subject = safeText(pkg?.meta?.subject, 'mapel').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `BankSoal_${subject}_${safeText(pkg?.meta?.assessmentType, 'asesmen')}_${safeText(
      pkg?.id,
      'paket'
    )}.json`;
    downloadTextFile(fileName, 'application/json;charset=utf-8', JSON.stringify(pkg, null, 2));
  };

  const openPackage = (pkg) => {
    if (!pkg?.id) return;
    setSelectedPackageId(pkg.id);
    setActiveTab('soal');
  };

  return (
    <div className="bg-white rounded-xl shadow border border-emerald-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50 flex items-center justify-between">
        <div className="flex items-center gap-3 text-emerald-900">
          <div className="bg-emerald-700 text-white p-2 rounded-lg">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold leading-none">Sobat Madrasah AI</div>
            <div className="text-xs text-emerald-700">Generator Asesmen (Formatif/Sumatif)</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-700">
          <span className="inline-flex items-center gap-1">
            <Heart className="w-3 h-3" /> KMA 1503
          </span>
          <span className="inline-flex items-center gap-1">
            <Globe className="w-3 h-3" /> Deep Learning
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200"
            title="Generator memakai proxy server (PHP). API key disimpan di server."
          >
            API: Server
          </span>
        </div>
      </div>

      <div className="p-6">
        {mode === 'generator' && (
          <div className="mb-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="text-sm font-semibold text-emerald-900 mb-1">Catatan</div>
            <div className="text-xs text-emerald-800">
              Generator ini memakai <strong>proxy server PHP</strong>, jadi guru tidak perlu mengisi API key.
              Jika gagal generate, biasanya admin belum mengisi API key di server.
            </div>
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('generator')}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                mode === 'generator'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Generator
            </button>
            <button
              type="button"
              onClick={() => setMode('bank')}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                mode === 'bank'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Bank Paket <span className="ml-1 text-xs opacity-90">({bankPackages.length})</span>
            </button>
          </div>

          {mode === 'generator' && generatedData?.length > 0 && (
            <button
              type="button"
              onClick={handleSaveToBank}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-emerald-200 text-emerald-800 hover:bg-emerald-50"
            >
              Simpan hasil ke Bank
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5" />
            {errorMsg}
          </div>
        )}

        {mode === 'bank' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              {bankPackages.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800">
                  Bank masih kosong. Buat soal di tab Generator lalu klik <strong>Simpan hasil ke Bank</strong>.
                </div>
              ) : (
                bankPackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`p-4 border ${
                      selectedPackageId === pkg.id ? 'border-emerald-400' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {safeText(pkg?.meta?.assessmentType)} • {safeText(pkg?.meta?.subject)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {safeText(pkg?.meta?.phase)} {safeText(pkg?.meta?.classLevel)} • {safeText(pkg?.items?.length, 0)} butir
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          Materi: {safeText(pkg?.meta?.topic)}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Badge type={selectedPackageId === pkg.id ? 'success' : 'default'}>
                          {selectedPackageId === pkg.id ? 'Dipilih' : 'Paket'}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openPackage(pkg)}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Buka
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(pkg.items, pkg.meta)}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        Download Word
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadJson(pkg)}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        Download JSON
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                      >
                        Hapus
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>

            <div className="lg:col-span-2">
              {!selectedPackage ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
                  Pilih salah satu paket di sebelah kiri untuk preview (Soal / Kunci / Kisi-kisi).
                </div>
              ) : (
                <div>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {safeText(selectedPackage?.meta?.assessmentType)} • {safeText(selectedPackage?.meta?.subject)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Materi: {safeText(selectedPackage?.meta?.topic)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(selectedPackage.items, selectedPackage.meta)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                      >
                        <Download className="w-4 h-4" /> Download Word
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadJson(selectedPackage)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <FileText className="w-4 h-4" /> Download JSON
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('soal')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === 'soal'
                            ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100 ring-1 ring-emerald-200'
                            : 'text-gray-600 hover:bg-emerald-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <FileText className="w-4 h-4" /> Butir Soal
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${activeTab === 'soal' ? 'rotate-90' : ''}`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('kunci')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === 'kunci'
                            ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100 ring-1 ring-emerald-200'
                            : 'text-gray-600 hover:bg-emerald-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4" /> Kunci & Skor
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${activeTab === 'kunci' ? 'rotate-90' : ''}`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('kisi')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === 'kisi'
                            ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100 ring-1 ring-emerald-200'
                            : 'text-gray-600 hover:bg-emerald-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <TableIcon className="w-4 h-4" /> Kisi-kisi (6C)
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${activeTab === 'kisi' ? 'rotate-90' : ''}`}
                        />
                      </button>
                    </div>

                    <div className="lg:col-span-3 min-h-[300px]">
                      {activeTab === 'soal' && (
                        <div className="space-y-6">
                          {selectedPackage?.meta?.stimulusImageDataUrl ? (
                            <Card className="p-4 border border-emerald-200 bg-emerald-50">
                              <div className="text-xs font-bold text-emerald-800 mb-2">Gambar Stimulus</div>
                              <img
                                src={selectedPackage.meta.stimulusImageDataUrl}
                                alt={safeText(selectedPackage?.meta?.stimulusImageCaption, 'Gambar stimulus')}
                                style={{ maxWidth: '320px', height: 'auto', border: '1px solid #333' }}
                              />
                              {selectedPackage?.meta?.stimulusImageCaption ? (
                                <div className="text-xs text-emerald-900 italic mt-2">
                                  {selectedPackage.meta.stimulusImageCaption}
                                </div>
                              ) : null}
                            </Card>
                          ) : null}

                          {(selectedPackage?.items || []).map((item) => (
                            <Card key={item?.no} className="p-0 overflow-hidden border-l-4 border-l-emerald-600">
                              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-gray-700">Soal No. {safeText(item?.no, '')}</span>
                                <Badge
                                  type={
                                    String(item?.difficulty || '').includes('L3')
                                      ? 'danger'
                                      : String(item?.difficulty || '').includes('L2')
                                        ? 'warning'
                                        : 'success'
                                  }
                                >
                                  {safeText(item?.difficulty, '-')}
                                </Badge>
                              </div>
                              <div className="p-6">
                                {item?.content?.stimulus && (
                                  <div className="mb-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg text-sm text-gray-700 italic">
                                    <div className="flex gap-2 mb-2 text-emerald-700 text-[10px] not-italic uppercase font-bold tracking-wider items-center">
                                      <ScrollText className="w-3 h-3" /> Stimulus
                                    </div>
                                    {String(item.content.stimulus)}
                                    {selectedPackage?.meta?.stimulusImageDataUrl ? (
                                      <div style={{ marginTop: '10px' }}>
                                        <img
                                          src={selectedPackage.meta.stimulusImageDataUrl}
                                          alt={safeText(selectedPackage?.meta?.stimulusImageCaption, 'Gambar stimulus')}
                                          style={{ maxWidth: '280px', height: 'auto', border: '1px solid #333' }}
                                        />
                                      </div>
                                    ) : null}
                                  </div>
                                )}

                                <div className="text-gray-900 font-medium text-base mb-4 leading-relaxed">
                                  {safeText(item?.content?.question, '-')}
                                </div>

                                {Array.isArray(item?.content?.options) && item.content.options.length > 0 && (
                                  <div className="space-y-2 ml-1">
                                    {item.content.options.map((opt, idx) => {
                                      const cleanOpt = String(opt || '').replace(/^[A-E]\.\s*/i, '');
                                      return (
                                        <div
                                          key={idx}
                                          className="flex items-start gap-3 text-sm text-gray-700 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100"
                                        >
                                          <div className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-0.5 shadow-sm">
                                            {String.fromCharCode(65 + idx)}
                                          </div>
                                          <span className="pt-0.5">{cleanOpt}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}

                      {activeTab === 'kunci' && (
                        <Card className="overflow-hidden">
                          <div className="divide-y divide-gray-100">
                            {(selectedPackage?.items || []).map((item) => (
                              <div key={item?.no} className="p-5 flex flex-col gap-3 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-emerald-700 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                                    {safeText(item?.no, '')}
                                  </div>
                                  <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">
                                    {safeText(item?.difficulty, '-')}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900 mb-1">
                                    Kunci Jawaban:{' '}
                                    <span className="text-emerald-800 bg-emerald-50 px-2 rounded border border-emerald-100">
                                      {safeText(item?.key, '-')}
                                    </span>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                    <strong className="text-yellow-800">Pembahasan:</strong>
                                    <br />
                                    {safeText(item?.explanation, '-')}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}

                      {activeTab === 'kisi' && (
                        <Card className="overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-emerald-50 text-emerald-900 font-semibold border-b border-emerald-100">
                                <tr>
                                  <th className="px-4 py-3 w-12 text-center">No</th>
                                  <th className="px-4 py-3 min-w-[220px]">Tujuan Pembelajaran</th>
                                  <th className="px-4 py-3 min-w-[240px]">Indikator & Integrasi</th>
                                  <th className="px-4 py-3 w-24 text-center">Level</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {(selectedPackage?.items || []).map((item) => (
                                  <tr key={item?.no} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center text-gray-500 font-medium">
                                      {safeText(item?.no, '')}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 align-top text-xs">
                                      {safeText(item?.grid?.competency)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 align-top text-xs">
                                      <div className="mb-2">{safeText(item?.grid?.indicator)}</div>
                                      {item?.grid?.dimension && (
                                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded w-fit border border-emerald-100">
                                          <Globe className="w-3 h-3" /> {String(item.grid.dimension)}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 align-top text-center">
                                      <Badge
                                        type={
                                          String(item?.difficulty || '').includes('L3')
                                            ? 'danger'
                                            : String(item?.difficulty || '').includes('L2')
                                              ? 'warning'
                                              : 'success'
                                        }
                                      >
                                        {safeText(item?.difficulty, '-')}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'generator' && step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
                <div className="flex items-center gap-3 mb-6 border-b border-emerald-50 pb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-emerald-900">Perancangan Asesmen</h2>
                    <p className="text-xs text-gray-500">
                      Integrasi <strong>Deep Learning (6C)</strong> & <strong>Kurikulum Berbasis Cinta</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                      <input
                        list="subjects"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5 px-3 bg-gray-50"
                        value={formData.subject}
                        onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                        placeholder="Contoh: Akidah Akhlak, Matematika, IPS..."
                      />
                      <datalist id="subjects">
                        {REFERENCE_DATA.subjects.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fase (Jenjang)</label>
                      <select
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5 px-3 bg-gray-50"
                        value={formData.phase}
                        onChange={handlePhaseChange}
                      >
                        <option value="">Pilih Fase...</option>
                        {REFERENCE_DATA.phases.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                      <select
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5 px-3 bg-gray-50 disabled:bg-gray-100"
                        value={formData.classLevel}
                        onChange={(e) => setFormData((prev) => ({ ...prev, classLevel: e.target.value }))}
                        disabled={!formData.phase}
                      >
                        <option value="">{formData.phase ? 'Pilih Kelas...' : '-'}</option>
                        {availableClasses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Asesmen</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {REFERENCE_DATA.assessments.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, assessmentType: a.id }))}
                            className={`p-2 text-xs font-medium rounded-lg border text-center transition-all ${
                              formData.assessmentType === a.id
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                            }`}
                          >
                            {a.id}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Materi Pokok (KMA 183)</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3 px-3 bg-gray-50 text-sm"
                      placeholder="Contoh: Mengamalkan Adab Bertetangga (Cinta Sesama)"
                      value={formData.topic}
                      onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
                    />
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Gambar Stimulus (Opsional)</div>
                        <div className="text-xs text-gray-500">
                          Jika diisi, gambar akan ditempel pada stimulus soal & ikut ke Word.
                        </div>
                      </div>
                      {formData.stimulusImageDataUrl ? <Badge type="success">Siap</Badge> : <Badge>Belum</Badge>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Upload Gambar</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleStimulusImageFileChange}
                          className="w-full rounded-lg border-gray-300 shadow-sm py-2.5 px-3 bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">URL Gambar</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5 px-3 bg-gray-50 text-sm"
                            placeholder="https://.../gambar.png"
                            value={formData.stimulusImageUrl}
                            onChange={(e) => setFormData((prev) => ({ ...prev, stimulusImageUrl: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={convertStimulusImageUrlToDataUrl}
                            className="px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                            title="Ambil gambar dari URL dan ubah menjadi data URL"
                          >
                            Konversi
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Caption</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5 px-3 bg-gray-50 text-sm"
                        placeholder="Contoh: Gambar stimulus adab bertetangga"
                        value={formData.stimulusImageCaption}
                        onChange={(e) => setFormData((prev) => ({ ...prev, stimulusImageCaption: e.target.value }))}
                      />
                    </div>

                    {formData.stimulusImageDataUrl ? (
                      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-xs font-semibold text-gray-600 mb-2">Preview</div>
                        <img
                          src={formData.stimulusImageDataUrl}
                          alt={formData.stimulusImageCaption || 'Gambar stimulus'}
                          style={{ maxWidth: '220px', height: 'auto', border: '1px solid #333' }}
                        />
                        {formData.stimulusImageCaption ? (
                          <div className="text-xs text-gray-600 italic mt-2">
                            {formData.stimulusImageCaption}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">Proporsi Kognitif & Deep Learning</label>
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        Total: {totalQuestions} Butir
                      </span>
                    </div>

                    <div className="mb-4">
                      <select
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 py-2 px-3 text-sm bg-white"
                        value={formData.type}
                        onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                      >
                        {REFERENCE_DATA.types.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Level 1</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          className="w-full text-center rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                          value={formData.easy}
                          onChange={(e) => setFormData((prev) => ({ ...prev, easy: e.target.value }))}
                        />
                        <span className="text-[10px] text-gray-400">Pemahaman</span>
                      </div>
                      <div className="text-center">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Level 2</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          className="w-full text-center rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                          value={formData.medium}
                          onChange={(e) => setFormData((prev) => ({ ...prev, medium: e.target.value }))}
                        />
                        <span className="text-[10px] text-gray-400">Penerapan</span>
                      </div>
                      <div className="text-center">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Level 3</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          className="w-full text-center rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                          value={formData.hard}
                          onChange={(e) => setFormData((prev) => ({ ...prev, hard: e.target.value }))}
                        />
                        <span className="text-[10px] text-gray-400">Deep Learning</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={generateQuestionsWithAI}
                      disabled={totalQuestions === 0}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl"
                    >
                      <Sparkles className="w-5 h-5" />
                      Buat Asesmen Madrasah
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <h3 className="font-bold text-md mb-3 relative z-10 flex items-center gap-2 border-b border-emerald-500 pb-2">
                  <Award className="w-5 h-5" /> Keunggulan Sobat Madrasah
                </h3>
                <div className="space-y-4 text-xs relative z-10">
                  <div className="flex gap-2">
                    <Heart className="w-4 h-4 shrink-0 text-emerald-200" />
                    <div>
                      <strong className="text-emerald-100 block mb-1">Kurikulum Berbasis Cinta (KMA 1503):</strong>
                      Pendidikan yang memanusiakan, berbasis kasih sayang dan keadaban.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Globe className="w-4 h-4 shrink-0 text-emerald-200" />
                    <div>
                      <strong className="text-emerald-100 block mb-1">Deep Learning (6C):</strong>
                      Character, Citizenship, Collaboration, Communication, Creativity, Critical Thinking.
                    </div>
                  </div>
                </div>
              </div>

              <Card className="p-5 bg-white border-emerald-100 shadow-sm">
                <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2 text-sm">
                  <Library className="w-4 h-4" /> Tips Soal Deep Learning
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Soal Deep Learning menghubungkan materi dengan <strong>kehidupan nyata (Citizenship)</strong> dan
                  stimulus yang membangun <strong>character</strong>.
                </p>
                <div className="mt-2 text-xs bg-emerald-50 p-3 rounded text-emerald-800 italic border border-emerald-100">
                  "Daripada sekadar menghitung zakat, ajak siswa menganalisis dampaknya pada lingkungan sekitar."
                </div>
              </Card>
            </div>
          </div>
        )}

        {mode === 'generator' && step === 2 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="relative mb-6">
              <div className="relative bg-white p-4 rounded-2xl shadow-lg border border-emerald-100">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Sobat Madrasah bekerja...</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              Meramu soal dengan sentuhan <span className="text-emerald-700 font-semibold">Deep Learning</span> dan{' '}
              <span className="text-emerald-700 font-semibold">Cinta</span> untuk siswa Madrasah.
            </p>
          </div>
        )}

        {mode === 'generator' && step === 3 && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Asesmen Siap <Badge type="primary">Dokumen</Badge>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-semibold text-emerald-700">{formData.assessmentType}</span> • {formData.subject}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" /> Buat Baru
                </button>
                <button
                  type="button"
                  onClick={handleSaveToBank}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                >
                  Simpan ke Bank
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDoc(generatedData, formData)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                >
                  <Download className="w-4 h-4" /> Download Word
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('soal')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'soal'
                      ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100 ring-1 ring-emerald-200'
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <FileText className="w-4 h-4" /> Butir Soal
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'soal' ? 'rotate-90' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('kunci')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'kunci'
                      ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100 ring-1 ring-emerald-200'
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4" /> Kunci & Skor
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'kunci' ? 'rotate-90' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('kisi')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'kisi'
                      ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100 ring-1 ring-emerald-200'
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <TableIcon className="w-4 h-4" /> Kisi-kisi (6C)
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'kisi' ? 'rotate-90' : ''}`} />
                </button>
              </div>

              <div className="lg:col-span-3 min-h-[300px]">
                {activeTab === 'soal' && (
                  <div className="space-y-6">
                    {generatedData.map((item) => (
                      <Card key={item?.no} className="p-0 overflow-hidden border-l-4 border-l-emerald-600">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                          <span className="font-bold text-gray-700">Soal No. {safeText(item?.no, '')}</span>
                          <Badge
                            type={
                              String(item?.difficulty || '').includes('L3')
                                ? 'danger'
                                : String(item?.difficulty || '').includes('L2')
                                  ? 'warning'
                                  : 'success'
                            }
                          >
                            {safeText(item?.difficulty, '-')}
                          </Badge>
                        </div>
                        <div className="p-6">
                          {item?.content?.stimulus && (
                            <div className="mb-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg text-sm text-gray-700 italic">
                              <div className="flex gap-2 mb-2 text-emerald-700 text-[10px] not-italic uppercase font-bold tracking-wider items-center">
                                <ScrollText className="w-3 h-3" /> Stimulus
                              </div>
                              {String(item.content.stimulus)}
                            </div>
                          )}

                          <div className="text-gray-900 font-medium text-base mb-4 leading-relaxed">
                            {safeText(item?.content?.question, '-')}
                          </div>

                          {Array.isArray(item?.content?.options) && item.content.options.length > 0 && (
                            <div className="space-y-2 ml-1">
                              {item.content.options.map((opt, idx) => {
                                const cleanOpt = String(opt || '').replace(/^[A-E]\.\s*/i, '');
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-3 text-sm text-gray-700 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100"
                                  >
                                    <div className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-0.5 shadow-sm">
                                      {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="pt-0.5">{cleanOpt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {activeTab === 'kunci' && (
                  <Card className="overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {generatedData.map((item) => (
                        <div key={item?.no} className="p-5 flex flex-col gap-3 hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-700 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                              {safeText(item?.no, '')}
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">
                              {safeText(item?.difficulty, '-')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 mb-1">
                              Kunci Jawaban:{' '}
                              <span className="text-emerald-800 bg-emerald-50 px-2 rounded border border-emerald-100">
                                {safeText(item?.key, '-')}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                              <strong className="text-yellow-800">Pembahasan:</strong>
                              <br />
                              {safeText(item?.explanation, '-')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {activeTab === 'kisi' && (
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-emerald-50 text-emerald-900 font-semibold border-b border-emerald-100">
                          <tr>
                            <th className="px-4 py-3 w-12 text-center">No</th>
                            <th className="px-4 py-3 min-w-[220px]">Tujuan Pembelajaran</th>
                            <th className="px-4 py-3 min-w-[240px]">Indikator & Integrasi</th>
                            <th className="px-4 py-3 w-24 text-center">Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {generatedData.map((item) => (
                            <tr key={item?.no} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-center text-gray-500 font-medium">{safeText(item?.no, '')}</td>
                              <td className="px-4 py-3 text-gray-700 align-top text-xs">{safeText(item?.grid?.competency)}</td>
                              <td className="px-4 py-3 text-gray-600 align-top text-xs">
                                <div className="mb-2">{safeText(item?.grid?.indicator)}</div>
                                {item?.grid?.dimension && (
                                  <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded w-fit border border-emerald-100">
                                    <Globe className="w-3 h-3" /> {String(item.grid.dimension)}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 align-top text-center">
                                <Badge
                                  type={
                                    String(item?.difficulty || '').includes('L3')
                                      ? 'danger'
                                      : String(item?.difficulty || '').includes('L2')
                                        ? 'warning'
                                        : 'success'
                                  }
                                >
                                  {safeText(item?.difficulty, '-')}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
