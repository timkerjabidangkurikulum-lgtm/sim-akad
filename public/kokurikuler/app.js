// Copied from app-kokurikuler-man-banggai-main/app.js
// NOTE: This file is intended to run in the standalone kokurikuler static page inside public/kokurikuler.

// Konstanta Panca Cinta KBC
const PANCA_CINTA_KBC = [
    'Cinta Allah',
    'Cinta Diri',
    'Cinta Sesama',
    'Cinta Alam/Lingkungan',
    'Cinta Ilmu & Karya/Bangsa'
];

// State management
const appState = {
    formData: {},
    isGenerated: false,
    selectedTheme: '',
    currentUser: null
};

// Form elements
const form = {
    namaMadrasah: document.getElementById('namaMadrasah'),
    fase: document.getElementById('fase'),
    kelas: document.getElementById('kelas'),
    tahunAjaran: document.getElementById('tahunAjaran'),
    tema: document.getElementById('tema'),
    pokokBahasan: document.getElementById('pokokBahasan'),
    mapelKolaboratif: document.getElementById('mapelKolaboratif'),
    topikKBC: document.getElementById('topikKBC'),
    dimensiProfilLulusan: document.getElementById('dimensiProfilLulusan'),
    strategi: document.getElementById('strategi'),
    alokasi: document.getElementById('alokasi'),
    tujuan: document.getElementById('tujuan'),
    kegiatan: document.getElementById('kegiatan'),
    integrasiNilai: document.getElementById('integrasiNilai'),
    penilaian: document.getElementById('penilaian'),
    catatan: document.getElementById('catatan')
};

// Preview element
const previewContent = document.getElementById('previewContent');
const btnGenerate = document.getElementById('btnGenerate');
const btnDownload = document.getElementById('btnDownload');
const authForms = document.getElementById('authForms');
const authStatus = document.getElementById('authStatus');
const authUserText = document.getElementById('authUserText');
const mainContent = document.querySelector('.main-content');
const lockMessage = document.getElementById('lockMessage');
const authButtonsContainer = document.querySelector('.auth-buttons');

const SSO_USER_KEY = 'sim_akad_sso_user';
const KOKURIKULER_ACTIVE_USER_KEY = 'akademikmanbanggai_user';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set default academic year
    const currentYear = new Date().getFullYear();
    form.tahunAjaran.value = `${currentYear}/${currentYear + 1}`;
    
    // Add event listeners
    form.tema.addEventListener('change', handleThemeChange);
    form.pokokBahasan.addEventListener('change', handlePokokBahasanChange);
    form.alokasi.addEventListener('input', handleAlokasiChange);
    btnGenerate.addEventListener('click', generatePreview);
    btnDownload.addEventListener('click', downloadDocument);

    // Inisialisasi status login dari localStorage
    initAuthState();
});

// Handle theme change - update all related dropdowns
function handleThemeChange() {
    const selectedTheme = form.tema.value;
    appState.selectedTheme = selectedTheme;
    
    if (!selectedTheme || !learningDatabase[selectedTheme]) {
        // Reset all dropdowns
        resetAllSelects();
        return;
    }
    
    const themeData = learningDatabase[selectedTheme];
    
    // Update Pokok Bahasan
    updateSelect(form.pokokBahasan, themeData.pokok_bahasan);
    
    // Update Mapel Kolaboratif
    updateSelect(form.mapelKolaboratif, themeData.mapel_kolaboratif);
    
    // Update Topik KBC menggunakan 5 Panca Cinta sebagai standar
    updateSelect(form.topikKBC, PANCA_CINTA_KBC);
    
    // Update Dimensi Profil Lulusan (multi-select)
    updateMultiSelect(form.dimensiProfilLulusan, themeData.profil_lulusan);

    // Update Tujuan Pembelajaran (auto-generated text)
    updateTujuanText();

    // Update Aktivitas Pembelajaran Utama (auto-generated text)
    updateKegiatanText();
    
    // Update Integrasi KBC (auto-generated text)
    updateIntegrasiText();
    
    // Update Penilaian (auto-generated text)
    updatePenilaianText();
}

function handlePokokBahasanChange() {
    updateKegiatanText();
    updateTujuanText();
    updateIntegrasiText();
    updatePenilaianText();
}

function handleAlokasiChange() {
    // Jika alokasi JP berubah, detail pembelajaran ikut menyesuaikan.
    updateKegiatanText();
    updateTujuanText();
    updateIntegrasiText();
    updatePenilaianText();
}

function parseJPCount(alokasiText) {
    const raw = String(alokasiText || '').trim();
    if (!raw) return 0;
    const m = raw.match(/(\d{1,3})\s*(jp|jam\s*pelajaran)?/i);
    if (!m) return 0;
    const n = parseInt(m[1], 10);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.min(Math.max(n, 1), 40);
}

function joinBullets(arr) {
    const safe = Array.isArray(arr) ? arr.filter(Boolean).map(String) : [];
    return safe.length ? safe.map((t) => `- ${t}`).join('\n') : '';
}

function buildTujuanRuntut(theme, pokokBahasan) {
    const themeData = learningDatabase[theme];
    if (!themeData) return '';
    const tujuan = Array.isArray(themeData.tujuan_pembelajaran) ? themeData.tujuan_pembelajaran : [];
    const picked = tujuan.slice(0, 4);
    const alokasiText = (form.alokasi.value || '').trim();
    const jpCount = parseJPCount(alokasiText);
    return (
`TUJUAN PEMBELAJARAN KOKURIKULER (RUNTUT)
Tema: ${theme}
Pokok Bahasan: ${pokokBahasan}
Alokasi Waktu: ${alokasiText || '-'}

Setelah kegiatan, peserta didik diharapkan mampu:
${joinBullets(picked) || '- Memahami dan menerapkan konsep sesuai tema.'}

Indikator keberhasilan (ringkas):
- Menjawab pertanyaan pemantik dengan argumen berbasis data.
- Menghasilkan produk/aksi yang relevan dan dapat dipertanggungjawabkan.
- Menunjukkan sikap kolaboratif dan reflektif selama proses.
${jpCount > 1 ? `- Menyelesaikan rangkaian kegiatan hingga JP ${jpCount} sesuai rencana.` : ''}
`);
}

function buildIntegrasiRuntut(theme, pokokBahasan) {
    const themeData = learningDatabase[theme];
    if (!themeData) return '';
    const integrasi = Array.isArray(themeData.integrasi_kbc) ? themeData.integrasi_kbc : [];
    const picked = integrasi.slice(0, 4);
    const alokasiText = (form.alokasi.value || '').trim();
    return (
`INTEGRASI NILAI-NILAI KBC (TERHUBUNG KE AKTIVITAS)
Tema: ${theme}
Pokok Bahasan: ${pokokBahasan}
Alokasi Waktu: ${alokasiText || '-'}

Nilai yang dikuatkan dan contohnya dalam kegiatan:
${(picked.length ? picked : ['Nilai KBC sesuai tema']).map((v) => `- ${v}: diwujudkan melalui sikap, keputusan, dan aksi nyata selama pembelajaran.`).join('\n')}
`);
}

function buildPenilaianRuntut(theme, pokokBahasan) {
    const themeData = learningDatabase[theme];
    if (!themeData) return '';
    const penilaian = Array.isArray(themeData.penilaian) ? themeData.penilaian : [];
    const picked = penilaian.slice(0, 5);
    const alokasiText = (form.alokasi.value || '').trim();
    const jpCount = parseJPCount(alokasiText);
    return (
`ASESMEN/PENILAIAN HOLISTIK (DIAGNOSTIK–FORMATIF–SUMATIF)
Tema: ${theme}
Pokok Bahasan: ${pokokBahasan}
Alokasi Waktu: ${alokasiText || '-'}

Rangkuman aspek yang dinilai:
${joinBullets(picked) || '- Pengetahuan, keterampilan, dan sikap sesuai tema.'}

Rencana asesmen:
1) Diagnostik: cek pemahaman awal melalui tanya-jawab pemantik/kuis singkat.
2) Formatif: observasi proses (kolaborasi, berpikir kritis), cek kemajuan produk, umpan balik tiap JP.
3) Sumatif/Produk: penilaian akhir pada JP terakhir (produk/aksi + presentasi + refleksi).
${jpCount > 1 ? `\nCatatan: Rangkaian dirancang untuk ${jpCount} JP.` : ''}
`);
}

function updateTujuanText() {
    const selectedTheme = form.tema.value;
    const selectedPokok = form.pokokBahasan.value;
    if (!selectedTheme || !learningDatabase[selectedTheme]) {
        form.tujuan.value = '';
        form.tujuan.disabled = true;
        return;
    }
    form.tujuan.disabled = false;
    if (!selectedPokok) {
        form.tujuan.value = 'Pilih Pokok Bahasan terlebih dahulu agar tujuan tersusun otomatis.';
        return;
    }
    form.tujuan.value = buildTujuanRuntut(selectedTheme, selectedPokok);
}

function updateIntegrasiText() {
    const selectedTheme = form.tema.value;
    const selectedPokok = form.pokokBahasan.value;
    if (!selectedTheme || !learningDatabase[selectedTheme]) {
        form.integrasiNilai.value = '';
        form.integrasiNilai.disabled = true;
        return;
    }
    form.integrasiNilai.disabled = false;
    if (!selectedPokok) {
        form.integrasiNilai.value = 'Pilih Pokok Bahasan terlebih dahulu agar integrasi KBC tersusun otomatis.';
        return;
    }
    form.integrasiNilai.value = buildIntegrasiRuntut(selectedTheme, selectedPokok);
}

function updatePenilaianText() {
    const selectedTheme = form.tema.value;
    const selectedPokok = form.pokokBahasan.value;
    if (!selectedTheme || !learningDatabase[selectedTheme]) {
        form.penilaian.value = '';
        form.penilaian.disabled = true;
        return;
    }
    form.penilaian.disabled = false;
    if (!selectedPokok) {
        form.penilaian.value = 'Pilih Pokok Bahasan terlebih dahulu agar rencana asesmen tersusun otomatis.';
        return;
    }
    form.penilaian.value = buildPenilaianRuntut(selectedTheme, selectedPokok);
}

function pickProdukByTheme(theme) {
    const t = String(theme || '').toLowerCase();
    if (t.includes('digital') || t.includes('kecerdasan buatan') || t.includes('teknologi')) return 'infografis/slide digital (atau poster digital)';
    if (t.includes('lingkungan') || t.includes('energi')) return 'rencana aksi + poster kampanye (atau dokumentasi aksi)';
    if (t.includes('kewirausahaan')) return 'proposal usaha sederhana + display produk';
    if (t.includes('literasi') || t.includes('bahasa') || t.includes('kebudayaan')) return 'artikel/esai + presentasi';
    return 'poster/lembar kerja + presentasi';
}

function pickFromList(list, index, fallback) {
     const arr = Array.isArray(list) ? list.filter(Boolean).map(String) : [];
     if (!arr.length) return fallback;
     return arr[index % arr.length] || fallback;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function textToHtmlBlocks(text) {
    const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
    let html = '';
    let inUl = false;
    let inOl = false;

    const closeLists = () => {
        if (inUl) { html += '</ul>'; inUl = false; }
        if (inOl) { html += '</ol>'; inOl = false; }
    };

    for (const rawLine of lines) {
        const line = String(rawLine ?? '');
        const trimmed = line.trim();
        if (!trimmed) {
            closeLists();
            html += '<div class="spacer"></div>';
            continue;
        }

        const bulletMatch = trimmed.match(/^[-•]\s+(.*)$/);
        const numberMatch = trimmed.match(/^\d+[\).]\s+(.*)$/);

        if (bulletMatch) {
            if (inOl) { html += '</ol>'; inOl = false; }
            if (!inUl) { html += '<ul class="list">'; inUl = true; }
            html += `<li>${escapeHtml(bulletMatch[1])}</li>`;
            continue;
        }

        if (numberMatch) {
            if (inUl) { html += '</ul>'; inUl = false; }
            if (!inOl) { html += '<ol class="list">'; inOl = true; }
            html += `<li>${escapeHtml(numberMatch[1])}</li>`;
            continue;
        }

        closeLists();
        html += `<p class="para">${escapeHtml(trimmed)}</p>`;
    }

    closeLists();
    return html;
}

function renderKeyValueTable(rows) {
        const safeRows = Array.isArray(rows) ? rows.filter((r) => r && r.length >= 2) : [];
        if (!safeRows.length) return '';
        return `
<table class="kv">
    <tbody>
        ${safeRows
            .map(([k, v]) => {
                return `
        <tr>
            <td class="kv-key">${escapeHtml(k)}</td>
            <td class="kv-sep">:</td>
            <td class="kv-val">${escapeHtml(v)}</td>
        </tr>`;
            })
            .join('')}
    </tbody>
</table>`;
}

function buildKegiatanIntiPerJpDetailHtml(themeData, theme, pokokBahasan, jpCount) {
    if (!jpCount || jpCount <= 0) return '';

    const aktivitas = Array.isArray(themeData.aktivitas_pembelajaran) ? themeData.aktivitas_pembelajaran : [];
    const tujuan = Array.isArray(themeData.tujuan_pembelajaran) ? themeData.tujuan_pembelajaran : [];
    const integrasi = Array.isArray(themeData.integrasi_kbc) ? themeData.integrasi_kbc : [];
    const penilaian = Array.isArray(themeData.penilaian) ? themeData.penilaian : [];

    const blocks = [];

    for (let i = 1; i <= jpCount; i++) {
        const aktivitasUtama = pickFromList(aktivitas, i - 1, 'Eksplorasi sumber belajar/lingkungan sekitar');
        const aktivitasKolab = pickFromList(aktivitas, i, 'Diskusi kelompok dengan peran yang jelas');
        const tujuanFokus = pickFromList(tujuan, i - 1, 'Mencapai tujuan pembelajaran sesuai tema');
        const nilaiFokus = pickFromList(integrasi, i - 1, 'Nilai KBC sesuai tema');
        const asesmenFokus = pickFromList(penilaian, i - 1, 'Observasi proses & kualitas produk');

        const isFirst = i === 1;
        const isLast = i === jpCount;
        const fokus = isFirst
            ? 'Pemantik & Perumusan Masalah'
            : isLast
                ? 'Presentasi, Refleksi, Tindak Lanjut'
                : 'Investigasi & Pengembangan Produk/Aksi';

        const steps = [
            {
                title: 'Orientasi singkat',
                guru: 'Menyampaikan tujuan JP, aturan kolaborasi, dan kriteria sukses.',
                siswa: 'Menyiapkan alat/bahan dan membagi peran (ketua, penulis, pencari data, penyaji).'
            },
            {
                title: 'Pemantik kontekstual',
                guru: `Menyajikan pertanyaan/kasus terkait "${pokokBahasan}" (berbasis contoh nyata di sekitar siswa).`,
                siswa: 'Menuliskan 2–3 pertanyaan kunci dan dugaan jawaban (hipotesis awal).'
            },
            {
                title: 'Eksplorasi/Investigasi',
                guru: 'Memberi sumber (teks/gambar/video/observasi) dan panduan pengumpulan data.',
                siswa: `Melakukan ${aktivitasUtama}; mencatat temuan penting dan bukti (foto/catatan).`
            },
            {
                title: 'Kolaborasi & elaborasi',
                guru: 'Memandu diskusi terarah (mengapa, bagaimana, apa buktinya).',
                siswa: `Melakukan ${aktivitasKolab}; menyusun simpulan sementara dan memperbaiki ide.`
            },
            {
                title: 'Produksi/aksi bertahap',
                guru: 'Memberi format produk (outline/rubrik) dan contoh standar minimal.',
                siswa: 'Menyusun bagian produk JP ini (draf/komponen/aksi) yang mendukung produk akhir.'
            },
            {
                title: 'Cek pemahaman & umpan balik',
                guru: 'Mengecek kemajuan tiap kelompok, memberi umpan balik spesifik.',
                siswa: 'Merevisi hasil kerja berdasarkan umpan balik.'
            },
            {
                title: 'Penguatan nilai KBC',
                guru: `Menautkan kegiatan JP dengan nilai: ${nilaiFokus}.`,
                siswa: 'Menuliskan 1 tindakan nyata yang mencerminkan nilai tersebut.'
            },
            {
                title: 'Asesmen JP (bukti yang dikumpulkan)',
                guru: 'Mengumpulkan bukti belajar dan mencatat capaian tiap kelompok.',
                siswa: 'Mengumpulkan bukti: catatan observasi, foto/lembar kerja, draf produk, refleksi singkat.'
            }
        ];

        const stepItems = steps
            .map((s) => {
                return `
<li>
    <div class="step-title">${escapeHtml(s.title)}</div>
    <div class="step-body">
        <p class="para no-indent"><strong>Guru:</strong> ${escapeHtml(s.guru)}</p>
        <p class="para no-indent"><strong>Siswa:</strong> ${escapeHtml(s.siswa)}</p>
    </div>
</li>`;
            })
            .join('');

        const lastNote = isLast
            ? `
<p class="para no-indent"><strong>Catatan JP terakhir:</strong> Fasilitasi presentasi, tanya-jawab, penilaian produk akhir, refleksi, dan tindak lanjut.</p>`
            : '';

                blocks.push(`
<div class="jp-block">
    <div class="jp-title">JP ${i} — Fokus: ${escapeHtml(fokus)}</div>
    <p class="para no-indent"><strong>Target JP:</strong> ${escapeHtml(tujuanFokus)}</p>
    <p class="para no-indent"><strong>Asesmen fokus:</strong> ${escapeHtml(asesmenFokus)}</p>
    <div class="subhead">Langkah Kegiatan Inti (detail)</div>
    <ol class="steps">
        ${stepItems}
    </ol>
    ${lastNote}
</div>`);
    }

    return `
<div>
    <p class="para no-indent"><strong>Rincian kegiatan inti per JP</strong> (otomatis dari Tema: ${escapeHtml(
        theme
    )} dan Pokok Bahasan: ${escapeHtml(pokokBahasan)}).</p>
  ${blocks.join('')}
</div>`;
}

function buildAktivitasRuntut(theme, pokokBahasan) {
    const themeData = learningDatabase[theme];
    if (!themeData) return '';

    const aktivitas = Array.isArray(themeData.aktivitas_pembelajaran) ? themeData.aktivitas_pembelajaran : [];
    const integrasi = Array.isArray(themeData.integrasi_kbc) ? themeData.integrasi_kbc : [];
    const tujuan = Array.isArray(themeData.tujuan_pembelajaran) ? themeData.tujuan_pembelajaran : [];

    const produk = pickProdukByTheme(theme);
    const tujuanRingkas = tujuan.slice(0, 3).map((t) => `- ${t}`).join('\n');
    const integrasiRingkas = integrasi.slice(0, 3).map((t) => `- ${t}`).join('\n');

    const aktivitas1 = aktivitas[0] ? `Kegiatan inti: ${aktivitas[0]}.` : 'Kegiatan inti: eksplorasi sumber belajar/lingkungan sekitar.';
    const aktivitas2 = aktivitas[1] ? `Kegiatan kolaboratif: ${aktivitas[1]}.` : 'Kegiatan kolaboratif: diskusi kelompok dengan peran yang jelas.';
    const aktivitas3 = aktivitas[2] ? `Kegiatan produk/aksi: ${aktivitas[2]}.` : `Kegiatan produk/aksi: menghasilkan ${produk}.`;

    const alokasiText = (form.alokasi.value || '').trim();
    const jpCount = parseJPCount(alokasiText);

    const perJpLines = jpCount > 0
        ? (() => {
            const lines = [];
            for (let i = 1; i <= jpCount; i++) {
                if (i === 1) {
                    lines.push(`JP ${i}: Pendahuluan, apersepsi, pemantik, rumuskan pertanyaan kunci & rencana kerja.`);
                } else if (i === jpCount) {
                    lines.push(`JP ${i}: Presentasi produk/temuan, umpan balik, refleksi, penguatan nilai KBC, tindak lanjut.`);
                } else {
                    lines.push(`JP ${i}: Investigasi/eksplorasi, kolaborasi, elaborasi data, pengembangan produk/aksi.`);
                }
            }
            return lines.join('\n');
        })()
        : '';

    return (
`AKTIVITAS PEMBELAJARAN UTAMA (RUNTUT)
Tema: ${theme}
Pokok Bahasan: ${pokokBahasan}
Alokasi Waktu: ${alokasiText || '-'}

Rencana ringkas per JP:
${perJpLines || '- (Isi alokasi waktu, mis. 2 JP / 10 JP, agar rencana per JP tersusun otomatis)'}

Tujuan pembelajaran (ringkas):
${tujuanRingkas || '- (otomatis mengikuti tema)'}

A. PENDAHULUAN
1) Pembukaan: salam, doa, presensi, dan penguatan adab belajar.
2) Apersepsi: guru mengaitkan pengalaman siswa dengan tema "${theme}" dan pokok bahasan "${pokokBahasan}".
3) Kontrak belajar singkat: tujuan, alur kegiatan, dan kriteria keberhasilan.

B. KEGIATAN INTI (Deep Learning)
1) Pemantik (meaningful): guru menyajikan pertanyaan/kasus kontekstual terkait "${pokokBahasan}".
2) Rumuskan masalah & hipotesis awal (critical thinking): siswa menuliskan 2–3 pertanyaan kunci yang akan dijawab.
3) Eksplorasi/Investigasi (mindful): ${aktivitas1}
4) Kolaborasi & elaborasi: ${aktivitas2}
5) Produk/aksi (joyful): ${aktivitas3}
6) Presentasi & umpan balik: tiap kelompok mempresentasikan temuan/produk; kelompok lain memberi tanggapan berbasis data.

C. PENUTUP
1) Refleksi (mindful): apa yang dipahami, apa yang masih membingungkan, dan bagaimana menerapkannya.
2) Penguatan nilai KBC (ringkas):
${integrasiRingkas || '- (otomatis mengikuti tema)'}
3) Tindak lanjut: perbaikan produk/aksi dan rencana penerapan di rumah/madrasah.
`);
}

function updateKegiatanText() {
    const selectedTheme = form.tema.value;
    const selectedPokok = form.pokokBahasan.value;

    if (!selectedTheme || !learningDatabase[selectedTheme]) {
        form.kegiatan.value = '';
        form.kegiatan.disabled = true;
        return;
    }

    form.kegiatan.disabled = false;

    if (!selectedPokok) {
        form.kegiatan.value = 'Pilih Pokok Bahasan terlebih dahulu agar instruksi kegiatan tersusun otomatis.';
        return;
    }

    form.kegiatan.value = buildAktivitasRuntut(selectedTheme, selectedPokok);
}

// Update single-select dropdown
function updateSelect(selectElement, options) {
    selectElement.innerHTML = '<option value="">-- Pilih --</option>';
    selectElement.disabled = false;
    
    options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option;
        optionEl.textContent = option;
        selectElement.appendChild(optionEl);
    });
}

// Update multi-select dropdown
function updateMultiSelect(selectElement, options) {
    selectElement.innerHTML = '';
    selectElement.disabled = false;
    
    options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option;
        optionEl.textContent = option;
        selectElement.appendChild(optionEl);
    });
    
    // Auto-select all options
    for (let i = 0; i < selectElement.options.length; i++) {
        selectElement.options[i].selected = true;
    }
}

// Reset all selects
function resetAllSelects() {
    form.pokokBahasan.innerHTML = '<option value="">Pilih tema terlebih dahulu</option>';
    form.pokokBahasan.disabled = true;
    
    form.mapelKolaboratif.innerHTML = '<option value="">Pilih tema terlebih dahulu</option>';
    form.mapelKolaboratif.disabled = true;
    
    form.topikKBC.innerHTML = '<option value="">Pilih tema terlebih dahulu</option>';
    form.topikKBC.disabled = true;
    
    form.dimensiProfilLulusan.innerHTML = '<option value="">Pilih tema terlebih dahulu</option>';
    form.dimensiProfilLulusan.disabled = true;
    
    form.tujuan.value = 'Pilih Tema dan Pokok Bahasan terlebih dahulu.';
    form.tujuan.disabled = true;
    
    form.kegiatan.value = 'Pilih Tema dan Pokok Bahasan terlebih dahulu.';
    form.kegiatan.disabled = true;
    
    form.integrasiNilai.value = 'Pilih Tema dan Pokok Bahasan terlebih dahulu.';
    form.integrasiNilai.disabled = true;
    
    form.penilaian.value = 'Pilih Tema dan Pokok Bahasan terlebih dahulu.';
    form.penilaian.disabled = true;
}

// Get selected values from multi-select
function getSelectedValues(selectElement) {
    const selected = [];
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].selected) {
            selected.push(selectElement.options[i].value);
        }
    }
    return selected;
}

function buildRencanaPerJpTableHtml(jpCount) {
        if (!jpCount || jpCount <= 0) return '';

        const rows = [];
        for (let i = 1; i <= jpCount; i++) {
                let fokus = '';
                let aktivitas = '';
                let asesmen = '';

                if (i === 1) {
                        fokus = 'Pemantik & perumusan masalah';
                        aktivitas = 'Apersepsi, pertanyaan pemantik, rumuskan pertanyaan kunci, rencana kerja kelompok.';
                        asesmen = 'Diagnostik (cek pemahaman awal, pertanyaan kunci).';
                } else if (i === jpCount) {
                        fokus = 'Presentasi, refleksi, tindak lanjut';
                        aktivitas = 'Presentasi produk/temuan, umpan balik, refleksi, penguatan KBC, rencana tindak lanjut.';
                        asesmen = 'Sumatif/produk + refleksi.';
                } else {
                        fokus = 'Investigasi & pengembangan produk/aksi';
                        aktivitas = 'Eksplorasi sumber, pengolahan data, kolaborasi, pengembangan produk/aksi.';
                        asesmen = 'Formatif (observasi proses, cek kemajuan produk).';
                }

                rows.push(`
<tr>
    <td align="center">${i}</td>
    <td>${fokus}</td>
    <td>${aktivitas}</td>
    <td>${asesmen}</td>
</tr>`);
        }

        return `
    <div class="sec-title">E.1 RENCANA PEMBELAJARAN PER JP (RINGKAS)</div>
    <table class="tbl">
    <thead>
        <tr>
                <th width="8%">JP</th>
                <th width="25%">Fokus</th>
                <th>Aktivitas Kunci</th>
                <th width="22%">Asesmen</th>
        </tr>
    </thead>
    <tbody>
        ${rows.join('')}
    </tbody>
</table>`;
}

function collectFormData(activeUser) {
        const alokasiText = (form.alokasi.value || '').trim();
        const jpCount = parseJPCount(alokasiText);
        return {
                namaMadrasah: form.namaMadrasah.value || 'Nama Madrasah',
                penyusun: activeUser,
                fase: getFaseName(form.fase.value),
                kelas: form.kelas.value || 'Belum diisi',
                tahunAjaran: form.tahunAjaran.value,
                tema: form.tema.value || 'Belum dipilih',
                pokokBahasan: form.pokokBahasan.value || 'Belum dipilih',
                mapelKolaboratif: form.mapelKolaboratif.value || 'Belum dipilih',
                topikKBC: form.topikKBC.value || 'Belum dipilih',
                dimensiProfilLulusan: getSelectedValues(form.dimensiProfilLulusan).join('\n• ') || 'Belum dipilih',
                strategi: form.strategi.value || 'Belum dipilih',
                alokasi: form.alokasi.value || 'Belum ditentukan',
                jpCount,
                tujuan: (form.tujuan.value || '').trim() || 'Belum diisi',
                kegiatan: (form.kegiatan.value || '').trim() || 'Belum diisi',
                integrasiNilai: (form.integrasiNilai.value || '').trim() || 'Belum diisi',
                penilaian: (form.penilaian.value || '').trim() || 'Belum diisi',
                catatan: form.catatan.value || ''
        };
}


// Generate preview
function generatePreview() {
    // Wajib login sebelum generate
    const activeUser = localStorage.getItem('akademikmanbanggai_user');
    if (!activeUser) {
        alert('Silakan login terlebih dahulu untuk generate rencana kokurikuler.');
        return;
    }

    appState.currentUser = activeUser;
    // Collect form data
    appState.formData = collectFormData(activeUser);
    const themeData = learningDatabase[appState.formData.tema];
    const kegiatanDetailHtml =
        themeData && appState.formData.jpCount
            ? buildKegiatanIntiPerJpDetailHtml(
                  themeData,
                  appState.formData.tema,
                  appState.formData.pokokBahasan,
                  appState.formData.jpCount
              )
            : '';
    
    const dplAsBullets = String(appState.formData.dimensiProfilLulusan || '')
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith('•') ? t.replace(/^•\s*/, '- ') : t.startsWith('-') ? t : `- ${t}`))
        .join('\n');

    const previewHTML = `
        <div class="doc">
            <style>
              .doc { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.15; color: #000; }
              .title { text-align: center; font-weight: bold; text-transform: uppercase; margin: 0 0 6pt 0; }
              .subtitle { text-align: center; margin: 0 0 12pt 0; }
              .sec-title { font-weight: bold; text-transform: uppercase; margin: 12pt 0 6pt 0; }
              .para { margin: 0 0 6pt 0; text-align: justify; text-indent: 1.25cm; }
              .no-indent { text-indent: 0; }
              .spacer { height: 6pt; }
              .list { margin: 6pt 0 6pt 1.25cm; padding: 0; }
              .list li { margin: 2pt 0; text-align: justify; }
              .kv { width: 100%; border-collapse: collapse; margin: 0 0 6pt 0; }
              .kv td { border: none; padding: 1pt 0; vertical-align: top; }
              .kv-key { width: 28%; }
              .kv-sep { width: 2%; }
              .kv-val { width: 70%; }
              .tbl { width: 100%; border-collapse: collapse; margin: 6pt 0 12pt 0; }
              .tbl th, .tbl td { border: 1px solid #000; padding: 4pt; vertical-align: top; }
              .tbl th { text-align: center; font-weight: bold; }
              .jp-block { margin: 0 0 12pt 0; page-break-inside: avoid; }
              .jp-title { font-weight: bold; margin: 0 0 6pt 0; }
              .subhead { font-weight: bold; margin: 6pt 0 4pt 0; }
              .steps { margin: 0 0 0 1.25cm; padding: 0; }
              .steps li { margin: 0 0 6pt 0; }
              .step-title { font-weight: bold; margin: 0 0 2pt 0; }
              .step-body { margin-left: 0.4cm; }
            </style>

            <div class="title">RENCANA PEMBELAJARAN KOKURIKULER</div>
            <div class="subtitle">Pendekatan Deep Learning dan Kurikulum Berbasis Cinta</div>

            <div class="sec-title">A. INFORMASI DASAR</div>
            ${renderKeyValueTable([
                ['Nama Madrasah', appState.formData.namaMadrasah],
                ['Penyusun', appState.formData.penyusun],
                ['Fase', appState.formData.fase],
                ['Kelas', appState.formData.kelas],
                ['Tahun Ajaran', appState.formData.tahunAjaran]
            ])}

            <div class="sec-title">B. TEMA KOKURIKULER</div>
            ${renderKeyValueTable([
                ['Tema', appState.formData.tema],
                ['Pokok Bahasan', appState.formData.pokokBahasan]
            ])}

            <div class="sec-title">C. KOMPONEN PEMBELAJARAN</div>
            ${renderKeyValueTable([
                ['Mata Pelajaran Kolaboratif', appState.formData.mapelKolaboratif],
                ['Topik KBC', appState.formData.topikKBC],
                ['Strategi Deep Learning', appState.formData.strategi],
                ['Alokasi Waktu', appState.formData.alokasi]
            ])}

            <div class="sec-title">D. DIMENSI PROFIL LULUSAN (DPL)</div>
            <div>${textToHtmlBlocks(dplAsBullets || '- Belum dipilih')}</div>

            <div class="sec-title">E. RENCANA PEMBELAJARAN (KERANGKA)</div>
            ${renderKeyValueTable([
                ['Strategi Deep Learning', appState.formData.strategi],
                ['Alokasi Waktu', appState.formData.alokasi],
                ['Jumlah JP', appState.formData.jpCount ? `${appState.formData.jpCount} JP` : '-'],
                ['Arah Produk/Aksi', pickProdukByTheme(appState.formData.tema)]
            ])}
            <p class="para">Rencana pembelajaran dirancang bertahap per JP: diawali pemantik dan perumusan masalah, dilanjutkan investigasi/pengembangan produk atau aksi, dan ditutup presentasi, refleksi, serta tindak lanjut.</p>
            ${buildRencanaPerJpTableHtml(appState.formData.jpCount)}

            <div class="sec-title">F. TUJUAN PEMBELAJARAN</div>
            <div>${textToHtmlBlocks(appState.formData.tujuan)}</div>

            <div class="sec-title">G. AKTIVITAS PEMBELAJARAN UTAMA</div>
            <div>${textToHtmlBlocks(appState.formData.kegiatan)}</div>

            ${kegiatanDetailHtml ? `
            <div class="sec-title">G.1 RINCIAN KEGIATAN INTI PER JP (LANGKAH-LANGKAH)</div>
            <div>${kegiatanDetailHtml}</div>
            ` : ''}

            <div class="sec-title">H. INTEGRASI NILAI-NILAI KURIKULUM BERBASIS CINTA</div>
            <div>${textToHtmlBlocks(appState.formData.integrasiNilai)}</div>

            <div class="sec-title">I. ASESMEN/PENILAIAN HOLISTIK</div>
            <table class="tbl">
                <thead>
                    <tr>
                        <th>Tahap</th>
                        <th>Fokus</th>
                        <th>Teknik/Instrumen</th>
                        <th>Kriteria/Rubrik (ringkas)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Diagnostik</td>
                        <td>Pemahaman awal & pengalaman terkait pokok bahasan</td>
                        <td>Pertanyaan pemantik / kuis singkat / cek-list awal</td>
                        <td>Mampu menyebutkan ide awal dan pertanyaan kunci</td>
                    </tr>
                    <tr>
                        <td>Formatif</td>
                        <td>Proses belajar (kolaborasi, kritis, sikap)</td>
                        <td>Observasi, jurnal proses, umpan balik produk</td>
                        <td>Aktif, kolaboratif, bukti proses terdokumentasi</td>
                    </tr>
                    <tr>
                        <td>Sumatif/Produk</td>
                        <td>Kualitas produk/aksi & presentasi</td>
                        <td>Rubrik produk, rubrik presentasi, refleksi</td>
                        <td>Produk relevan, argumen berbasis data, refleksi jujur</td>
                    </tr>
                </tbody>
            </table>
            <div>${textToHtmlBlocks(appState.formData.penilaian)}</div>

            ${appState.formData.catatan ? `
            <div class="sec-title">J. CATATAN/KETERANGAN TAMBAHAN</div>
            <div>${textToHtmlBlocks(appState.formData.catatan)}</div>
            ` : ''}
        </div>
    `;
    
    previewContent.innerHTML = previewHTML;
    appState.isGenerated = true;
    btnDownload.disabled = false;
}

// Get fase name
function getFaseName(fase) {
    const faseNames = {
        'A': 'Fase A (Kelas I dan II)',
        'B': 'Fase B (Kelas III dan IV)',
        'C': 'Fase C (Kelas V dan VI)',
        'D': 'Fase D (Kelas VII, VIII, dan IX)',
        'E': 'Fase E (Kelas X)',
        'F': 'Fase F (Kelas XI dan XII)'
    };
    return faseNames[fase] || fase;
}

// Open panduan
function openPanduan() {
    const panduan = `
    PANDUAN PEMBELAJARAN DEEP LEARNING DAN KURIKULUM BERBASIS CINTA (KBC)

    === DEEP LEARNING ===
    Deep Learning adalah pendekatan pembelajaran yang memfokuskan pada pemahaman mendalam siswa melalui:
    • Meaningful Learning (Pembelajaran Bermakna)
    • Active Learning (Pembelajaran Aktif)
    • Critical Thinking (Berpikir Kritis)
    • Problem-Based Learning (Pembelajaran Berbasis Masalah)
    • Collaborative Learning (Pembelajaran Kolaboratif)

    === KURIKULUM BERBASIS CINTA (KBC) ===
    KBC menempatkan cinta/kasih sayang sebagai nilai inti pendidikan dengan 5 dimensi:
    1. Cinta kepada Allah/Tuhan (Spiritual & Keimanan)
    2. Cinta kepada Diri Sendiri (Pengembangan Diri & Kesehatan Mental)
    3. Cinta kepada Keluarga (Hubungan Harmonis)
    4. Cinta kepada Masyarakat (Tanggung Jawab Sosial)
    5. Cinta kepada Lingkungan (Kesadaran Ekologis)

    === STRATEGI DEEP LEARNING ===
    • Problem-Based Learning (PBL): Pembelajaran dimulai dari masalah nyata
    • Project-Based Learning (PjBL): Siswa mengerjakan proyek yang menghasilkan produk
    • Collaborative Learning: Kerja sama kelompok dengan peran yang jelas
    • Critical Thinking: Analisis, diskusi, dan argumentasi

    === LANGKAH PERENCANAAN ===
    1. Pilih Tema yang relevan dengan kehidupan siswa
    2. Tema akan otomatis menampilkan komponen pembelajaran yang sesuai
    3. Pilih strategi Deep Learning yang sesuai
    4. Rancang aktivitas pembelajaran yang melibatkan siswa secara aktif
    5. Integrasikan nilai-nilai cinta dalam setiap kegiatan
    6. Tentukan penilaian yang holistik
    `;
    
    alert(panduan);
}

// Download as Word document - UPDATED WITH INSTRUCTIONAL LANGUAGE
function downloadDocument() {
    const activeUser = localStorage.getItem('akademikmanbanggai_user');
    if (!activeUser) {
        alert('Silakan login terlebih dahulu untuk mengunduh dokumen.');
        return;
    }

    // Auto-generate preview agar tombol Download langsung berfungsi.
    if (!appState.isGenerated) {
        generatePreview();
        if (!appState.isGenerated) return;
    }
    
    const selectedTema = form.tema.value;
    
    // Ambil langsung isi preview agar dokumen Word sama persis dengan tampilan
    const content = previewContent.innerHTML;

    // Wrapper HTML minimal yang sudah terbukti bekerja di modul BK
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Rencana Kokurikuler</title>
    <style>
        @page { size: A4; margin: 2.54cm; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.15; }
        .doc { color: #000; }
        .title { text-align: center; font-weight: bold; text-transform: uppercase; margin: 0 0 6pt 0; }
        .subtitle { text-align: center; margin: 0 0 12pt 0; }
        .sec-title { font-weight: bold; text-transform: uppercase; margin: 12pt 0 6pt 0; }
        .para { margin: 0 0 6pt 0; text-align: justify; text-indent: 1.25cm; }
        .no-indent { text-indent: 0; }
        .spacer { height: 6pt; }
        .list { margin: 6pt 0 6pt 1.25cm; padding: 0; }
        .list li { margin: 2pt 0; text-align: justify; }
        .kv { width: 100%; border-collapse: collapse; margin: 0 0 6pt 0; }
        .kv td { border: none; padding: 1pt 0; vertical-align: top; }
        .kv-key { width: 28%; }
        .kv-sep { width: 2%; }
        .kv-val { width: 70%; }
        .tbl { width: 100%; border-collapse: collapse; margin: 6pt 0 12pt 0; }
        .tbl th, .tbl td { border: 1px solid #000; padding: 4pt; vertical-align: top; }
        .tbl th { text-align: center; font-weight: bold; }
        .jp-block { margin: 0 0 12pt 0; page-break-inside: avoid; }
        .jp-title { font-weight: bold; margin: 0 0 6pt 0; }
        .subhead { font-weight: bold; margin: 6pt 0 4pt 0; }
        .steps { margin: 0 0 0 1.25cm; padding: 0; }
        .steps li { margin: 0 0 6pt 0; }
        .step-title { font-weight: bold; margin: 0 0 2pt 0; }
        .step-body { margin-left: 0.4cm; }
    </style>
    </head><body>`;
    const postHtml = "</body></html>";

    const html = preHtml + content + postHtml;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const objectUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);

    const safeTema = selectedTema ? selectedTema.replace(/\s+/g, '_') : 'Tanpa_Tema';
    const filename = `Rencana_Kokurikuler_${safeTema}.doc`;

    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        downloadLink.href = objectUrl;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        downloadLink.click();
    }

    document.body.removeChild(downloadLink);
    // Revoke ditunda agar beberapa browser tidak membatalkan download.
    setTimeout(() => {
        try { URL.revokeObjectURL(objectUrl); } catch { /* ignore */ }
    }, 2000);
}

// ===== Sistem Autentikasi Sederhana Berbasis localStorage =====

function initAuthState() {
    // SSO from SIM-AKAD: if present, auto-set active user and hide standalone auth UI.
    const ssoUser = (localStorage.getItem(SSO_USER_KEY) || '').trim();
    if (ssoUser) {
        localStorage.setItem(KOKURIKULER_ACTIVE_USER_KEY, ssoUser);
        setAuthState(ssoUser);
        if (authButtonsContainer) authButtonsContainer.style.display = 'none';
        return;
    }

    const activeUser = localStorage.getItem(KOKURIKULER_ACTIVE_USER_KEY);
    if (activeUser) setAuthState(activeUser);
    else setAuthState(null);
}

function setAuthState(username) {
    if (username) {
        appState.currentUser = username;
        authForms.style.display = 'none';
        authStatus.style.display = 'flex';
        authUserText.textContent = `👤 Pengguna Aktif: ${username}`;
        mainContent.classList.remove('locked');
        lockMessage.style.display = 'none';
    } else {
        appState.currentUser = null;
        authForms.style.display = 'block';
        authStatus.style.display = 'none';
        authUserText.textContent = '';
        mainContent.classList.add('locked');
        lockMessage.style.display = 'block';
    }
}

function handleRegistrasi() {
    const username = document.getElementById('usernameReg').value.trim();
    const password = document.getElementById('passwordReg').value.trim();

    if (!username || !password) {
        alert('Mohon isi username dan password untuk registrasi.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('akademikmanbanggai_users') || '{}');

    if (users[username]) {
        alert('Username sudah terdaftar. Silakan pilih username lain.');
        return;
    }

    users[username] = { password };
    localStorage.setItem('akademikmanbanggai_users', JSON.stringify(users));
    alert('Registrasi berhasil! Silakan login dengan akun yang baru dibuat.');

    document.getElementById('usernameReg').value = '';
    document.getElementById('passwordReg').value = '';
}

function handleLogin() {
    const username = document.getElementById('usernameLogin').value.trim();
    const password = document.getElementById('passwordLogin').value.trim();

    if (!username || !password) {
        alert('Mohon isi username dan password untuk login.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('akademikmanbanggai_users') || '{}');
    const user = users[username];

    if (!user || user.password !== password) {
        alert('Username atau password salah.');
        return;
    }

    localStorage.setItem('akademikmanbanggai_user', username);
    setAuthState(username);

    document.getElementById('usernameLogin').value = '';
    document.getElementById('passwordLogin').value = '';

    alert(`Selamat datang, ${username}! Anda sekarang dapat menggunakan aplikasi ini.`);
}

function handleLogout() {
    // In SIM-AKAD mode, logout should be handled by the main app.
    const ssoUser = (localStorage.getItem(SSO_USER_KEY) || '').trim();
    if (ssoUser) {
        alert('Logout dilakukan dari aplikasi SIM-AKAD.');
        return;
    }

    localStorage.removeItem(KOKURIKULER_ACTIVE_USER_KEY);
    setAuthState(null);
    alert('Anda telah logout. Untuk mengakses kembali, silakan login.');
}
