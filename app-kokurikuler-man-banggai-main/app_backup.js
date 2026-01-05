// State management
const appState = {
    formData: {},
    isGenerated: false,
    selectedTheme: ''
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set default academic year
    const currentYear = new Date().getFullYear();
    form.tahunAjaran.value = `${currentYear}/${currentYear + 1}`;
    
    // Add event listeners
    form.tema.addEventListener('change', handleThemeChange);
    btnGenerate.addEventListener('click', generatePreview);
    btnDownload.addEventListener('click', downloadDocument);
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
    
    // Update Topik KBC
    updateSelect(form.topikKBC, themeData.topik_kbc);
    
    // Update Dimensi Profil Lulusan (multi-select)
    updateMultiSelect(form.dimensiProfilLulusan, themeData.profil_lulusan);
    
    // Update Tujuan Pembelajaran (multi-select)
    updateMultiSelect(form.tujuan, themeData.tujuan_pembelajaran);
    
    // Update Aktivitas Pembelajaran (multi-select)
    updateMultiSelect(form.kegiatan, themeData.aktivitas_pembelajaran);
    
    // Update Integrasi KBC (multi-select)
    updateMultiSelect(form.integrasiNilai, themeData.integrasi_kbc);
    
    // Update Penilaian (multi-select)
    updateMultiSelect(form.penilaian, themeData.penilaian);
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
    
    form.tujuan.innerHTML = '<option value="">Pilih tema terlebih dahulu</option>';
    form.tujuan.disabled = true;
    
    form.kegiatan.innerHTML = '<option value="">Pilih tema terlebih dahulu</option>';
    form.kegiatan.disabled = true;
    
    form.integrasiNilai.innerHTML = '<option value="">Pilih tema terlebih dahulu</option>';
    form.integrasiNilai.disabled = true;
    
    form.penilaian.innerHTML = '<option value="">Pilih tema terlebih dahulu</option>';
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

// Generate preview
function generatePreview() {
    // Collect form data
    appState.formData = {
        namaMadrasah: form.namaMadrasah.value || 'Nama Madrasah',
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
        tujuan: getSelectedValues(form.tujuan).join('\n• ') || 'Belum diisi',
        kegiatan: getSelectedValues(form.kegiatan).join('\n• ') || 'Belum diisi',
        integrasiNilai: getSelectedValues(form.integrasiNilai).join('\n• ') || 'Belum diisi',
        penilaian: getSelectedValues(form.penilaian).join('\n• ') || 'Belum diisi',
        catatan: form.catatan.value || ''
    };
    
    // Generate HTML preview
    const previewHTML = `
        <div style="padding: 15px; font-size: 13px;">
            <h2 style="text-align: center; color: #104E8B; margin-bottom: 20px; font-size: 16px; line-height: 1.4;">
                RENCANA PEMBELAJARAN KOKURIKULER<br>
                DENGAN PENDEKATAN DEEP LEARNING DAN KURIKULUM BERBASIS CINTA
            </h2>
            
            <h3 style="color: #104E8B; margin-top: 15px; margin-bottom: 10px; border-bottom: 2px solid #104E8B; padding-bottom: 5px; font-size: 14px;">
                A. INFORMASI DASAR
            </h3>
            <div style="line-height: 1.8; margin-bottom: 15px;">
                <strong>Nama Madrasah:</strong> ${appState.formData.namaMadrasah}<br>
                <strong>Fase:</strong> ${appState.formData.fase}<br>
                <strong>Kelas:</strong> ${appState.formData.kelas}<br>
                <strong>Tahun Ajaran:</strong> ${appState.formData.tahunAjaran}
            </div>
            
            <h3 style="color: #104E8B; margin-top: 15px; margin-bottom: 10px; border-bottom: 2px solid #104E8B; padding-bottom: 5px; font-size: 14px;">
                B. TEMA KOKURIKULER
            </h3>
            <p style="margin-bottom: 15px;"><strong>Tema:</strong> ${appState.formData.tema}</p>
            
            <h3 style="color: #104E8B; margin-top: 15px; margin-bottom: 10px; border-bottom: 2px solid #104E8B; padding-bottom: 5px; font-size: 14px;">
                C. KOMPONEN PEMBELAJARAN
            </h3>
            <p style="margin-bottom: 8px;"><strong>Pokok Bahasan:</strong> ${appState.formData.pokokBahasan}</p>
            <p style="margin-bottom: 8px;"><strong>Mata Pelajaran Kolaboratif:</strong> ${appState.formData.mapelKolaboratif}</p>
            <p style="margin-bottom: 8px;"><strong>Topik KBC:</strong> ${appState.formData.topikKBC}</p>
            
            <h3 style="color: #104E8B; margin-top: 15px; margin-bottom: 10px; border-bottom: 2px solid #104E8B; padding-bottom: 5px; font-size: 14px;">
                D. DIMENSI PROFIL LULUSAN (DPL)
            </h3>
            <p style="white-space: pre-wrap; line-height: 1.8; margin-bottom: 15px;">• ${appState.formData.dimensiProfilLulusan}</p>
            
            <h3 style="color: #104E8B; margin-top: 15px; margin-bottom: 10px; border-bottom: 2px solid #104E8B; padding-bottom: 5px; font-size: 14px;">
                E. KERANGKA DEEP LEARNING
            </h3>
            <p style="line-height: 1.8; margin-bottom: 15px;"><strong>Strategi Pembelajaran:</strong> ${appState.formData.strategi}<br>
            <strong>Alokasi Waktu:</strong> ${appState.formData.alokasi}</p>
            
            <h3 style="color: #104E8B; margin-top: 15px; margin-bottom: 10px; border-bottom: 2px solid #104E8B; padding-bottom: 5px; font-size: 14px;">
                F. TUJUAN PEMBELAJARAN
            </h3>
            <p style="white-space: pre-wrap; line-height: 1.8; margin-bottom: 15px;">• ${appState.formData.tujuan}</p>
            
            <h3 style="color: #104E8B; margin-top: 15px; margin-bottom: 10px; border-bottom: 2px solid #104E8B; padding-bottom: 5px; font-size: 14px;">
                G. AKTIVITAS PEMBELAJARAN UTAMA
            </h3>
            <p style="white-space: pre-wrap; line-height: 1.8; margin-bottom: 15px;">• ${appState.formData.kegiatan}</p>
            
            <h3 style="color: #104E8B; margin-top: 15px; margin-bottom: 10px; border-bottom: 2px solid #104E8B; padding-bottom: 5px; font-size: 14px;">
                H. INTEGRASI NILAI-NILAI KURIKULUM BERBASIS CINTA
            </h3>
            <p style="white-space: pre-wrap; line-height: 1.8; margin-bottom: 15px;">• ${appState.formData.integrasiNilai}</p>
            
            <h3 style="color: #104E8B; margin-top: 15px; margin-bottom: 10px; border-bottom: 2px solid #104E8B; padding-bottom: 5px; font-size: 14px;">
                I. ASESMEN/PENILAIAN HOLISTIK
            </h3>
            <p style="white-space: pre-wrap; line-height: 1.8; margin-bottom: 15px;">• ${appState.formData.penilaian}</p>
            
            ${appState.formData.catatan ? `
            <h3 style="color: #104E8B; margin-top: 15px; margin-bottom: 10px; border-bottom: 2px solid #104E8B; padding-bottom: 5px; font-size: 14px;">
                J. CATATAN/KETERANGAN TAMBAHAN
            </h3>
            <p style="white-space: pre-wrap; line-height: 1.8;">${appState.formData.catatan}</p>
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
    if (!appState.isGenerated) {
        alert('Silakan generate preview terlebih dahulu!');
        return;
    }
    
    const selectedTema = form.tema.value;
    const themeData = learningDatabase[selectedTema];
    const mapelArray = form.mapelKolaboratif.value ? form.mapelKolaboratif.value.split(',').map(m => m.trim()) : [];
    
    // Get selected values
    const dimensiDPL = getSelectedValues(form.dimensiProfilLulusan);
    const tujuanKBC = getSelectedValues(form.integrasiNilai);
    const tujuanPembelajaran = getSelectedValues(form.tujuan);
    const aktivitasList = getSelectedValues(form.kegiatan);
    const penilaianList = getSelectedValues(form.penilaian);
    
    // Create document content
    const documentContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>RPP ${selectedTema}</title>
    <style>
        @page { size: A4; margin: 2.5cm; }
        body { 
            font-family: 'Calibri', Arial, sans-serif; 
            font-size: 11pt; 
            line-height: 1.6; 
            color: #000;
        }
        .cover { 
            text-align: center; 
            padding: 60px 20px; 
            margin-bottom: 30px;
        }
        .cover h1 { 
            font-size: 16pt; 
            font-weight: bold; 
            margin: 15px 0; 
            line-height: 1.4;
        }
        .cover h2 { 
            font-size: 14pt; 
            font-weight: bold; 
            margin: 10px 0;
            text-transform: uppercase;
        }
        .cover p { 
            font-size: 12pt; 
            margin: 8px 0;
        }
        .section-title { 
            font-size: 11pt; 
            font-weight: bold; 
            margin-top: 20px; 
            margin-bottom: 12px;
            text-transform: uppercase;
        }
        .info-table { 
            margin-bottom: 15px;
            line-height: 1.9;
        }
        .info-table div {
            margin-bottom: 5px;
        }
        .content { 
            text-align: justify; 
            margin-bottom: 12px;
            line-height: 1.8;
        }
        .bullet-list {
            margin-left: 20px;
            line-height: 1.9;
        }
        .sub-section {
            margin-left: 0px;
            margin-top: 12px;
            margin-bottom: 15px;
        }
        .sub-section strong {
            font-weight: bold;
        }
        .activity-block {
            margin-top: 10px;
            margin-bottom: 10px;
            padding-left: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 20px;
        }
        table, th, td {
            border: 1px solid #000;
        }
        th, td {
            padding: 8px;
            text-align: left;
            font-size: 10pt;
        }
        th {
            background-color: #D3D3D3;
            font-weight: bold;
            text-align: center;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <!-- COVER PAGE -->
    <div class="cover">
        <h1>RENCANA KEGIATAN KOKURIKULER MADRASAH</h1>
        <p style="margin-top: 25px;">Pembelajaran Kolaboratif Lintas Disiplin Ilmu</p>
        <h2 style="margin-top: 40px;">${selectedTema.toUpperCase()}</h2>
        <p style="margin-top: 40px;">Tahun Ajaran ${form.tahunAjaran.value}</p>
        <p style="margin-top: 60px; font-size: 14pt; font-weight: bold;">${form.namaMadrasah.value}</p>
    </div>
    
    <div class="page-break"></div>
    
    <!-- MAIN CONTENT -->
    <h1 style="text-align: center; font-size: 13pt; font-weight: bold; margin-bottom: 25px;">RENCANA KEGIATAN KOKURIKULER MADRASAH</h1>
    
    <div class="section-title">A. IDENTITAS MADRASAH</div>
    <div class="info-table">
        <div><strong>Nama Madrasah</strong>   : ${form.namaMadrasah.value}</div>
        <div><strong>Fase</strong>            : ${form.fase.value}</div>
        <div><strong>Kelas</strong>           : ${form.kelas.value}</div>
        <div><strong>Tahun Ajaran</strong>    : ${form.tahunAjaran.value}</div>
        <div><strong>Total JP</strong>        : ${form.alokasi.value}</div>
    </div>
    
    <div class="section-title">B. TEMA PROJEK</div>
    <div class="content">
        <strong>Tema Projek:</strong> ${selectedTema}<br>
        <strong>Pokok Bahasan:</strong> ${form.pokokBahasan.value}<br>
        <strong>Mapel Kolaboratif:</strong> ${form.mapelKolaboratif.value}
    </div>
    
    <div class="section-title">C. TOPIK KBC</div>
    <div class="content">
        ${tujuanKBC.map(tk => `• ${tk}`).join('<br>\n        ')}
    </div>
    
    <div class="section-title">D. PROFIL LULUSAN</div>
    <div class="content">
        ${dimensiDPL.map(dpl => `• ${dpl}`).join('<br>\n        ')}
    </div>
    
    <div class="section-title">E. TUJUAN KBC</div>
    <div class="content">
        ${tujuanKBC.map(tj => `• ${tj.charAt(0).toUpperCase() + tj.slice(1)}.`).join('<br>\n        ')}
    </div>
    
    <div class="section-title">F. TUJUAN PEMBELAJARAN MENDALAM (PM)</div>
    <div class="content">
        ${tujuanPembelajaran.map((tp, idx) => {
            const mapel = mapelArray[idx] || mapelArray[0] || 'Pembelajaran';
            return `• ${tp} (mata pelajaran ${mapel})`;
        }).join('<br>\n        ')}
    </div>
    
    <div class="section-title">G. PRAKTEK PEDAGOGIK</div>
    <div class="content">
        <strong>Model Pembelajaran:</strong><br>
        Guru menerapkan pendekatan ${form.strategi.value} melalui kegiatan ${aktivitasList[0] ? aktivitasList[0].toLowerCase() : 'pembelajaran kolaboratif'}. Siswa diberikan kebebasan untuk mengeksplorasi, menganalisis, dan menemukan solusi secara mandiri maupun berkelompok. Guru berperan sebagai fasilitator yang membimbing proses berpikir kritis dan mendalam.<br><br>
        
        <strong>Lingkungan Belajar:</strong><br>
        Guru menyiapkan dan mengatur lingkungan belajar yang kondusif meliputi ruang kelas, laboratorium, area praktik, perpustakaan, serta lingkungan sekitar madrasah. Siswa diminta untuk memanfaatkan berbagai ruang belajar tersebut sesuai dengan kebutuhan eksplorasi dan pembelajaran kolaboratif. Guru memastikan setiap sudut belajar mendukung kreativitas dan kenyamanan siswa dalam belajar.<br><br>
        
        <strong>Kemitraan Pembelajaran:</strong><br>
        Guru ${form.mapelKolaboratif.value} melakukan koordinasi dan kolaborasi dalam merancang kegiatan pembelajaran yang terintegrasi. Guru-guru kolaboratif secara bersama-sama menyusun perencanaan, melakukan monitoring selama proses pembelajaran, dan melakukan evaluasi terhadap pencapaian tujuan pembelajaran. Siswa mendapatkan bimbingan dari berbagai perspektif keilmuan yang saling melengkapi dan terintegrasi dengan nilai-nilai Kurikulum Berbasis Cinta.<br><br>
        
        <strong>Pemanfaatan Digital:</strong><br>
        Guru mengarahkan siswa untuk memanfaatkan teknologi digital dalam proses pembelajaran. Siswa menggunakan internet untuk riset dan pencarian informasi, menggunakan aplikasi atau software untuk dokumentasi proses pembelajaran, membuat presentasi hasil karya dengan tools digital, serta menggunakan platform kolaborasi online untuk berdiskusi dan berbagi ide. Guru memberikan tutorial dan pendampingan dalam penggunaan teknologi secara etis dan bertanggung jawab.
    </div>
    
    <div class="page-break"></div>
    
    <div class="section-title">H. KEGIATAN PEMBELAJARAN</div>
    
    <div class="sub-section">
        <strong>1. Persiapan (${Math.ceil(parseInt(form.alokasi.value) * 0.15) || 2} JP)</strong><br><br>
        
        <strong>a. Pemahaman Konsep:</strong><br>
        <div class="activity-block">
            • Guru ${mapelArray[0] || 'mata pelajaran'} membuka pembelajaran dengan memberikan apersepsi dan motivasi kepada siswa tentang pentingnya tema "${selectedTema}".<br>
            • Guru menjelaskan tujuan pembelajaran yang akan dicapai dan kaitannya dengan kehidupan nyata serta nilai-nilai Islam.<br>
            • Guru melakukan brainstorming bersama siswa untuk menggali pengetahuan awal mereka tentang tema yang akan dipelajari.<br>
            • Siswa diminta untuk menyampaikan pengalaman atau pengetahuan yang mereka miliki terkait tema.<br>
            • Guru bersama guru kolaboratif lainnya menjelaskan peta konsep pembelajaran dan alur kegiatan yang akan dilaksanakan.
        </div>
        
        <strong>b. Penyiapan Alat & Bahan:</strong><br>
        <div class="activity-block">
            Guru menyiapkan dan memastikan ketersediaan:
            <div class="bullet-list" style="margin-top: 5px;">
                ${mapelArray.map(mapel => `• ${mapel}: Modul pembelajaran, alat peraga, bahan praktik, worksheet, dan referensi/literatur terkait`).join('<br>\n                ')}<br>
                • Media pembelajaran digital (video, slide presentasi, gambar, infografis)<br>
                • Lembar kerja siswa (LKS) dan instrumen penilaian<br>
                • Alat dokumentasi (kamera/smartphone untuk foto dan video)
            </div>
            <p style="margin-top: 8px; margin-left: 0px;">Siswa diminta untuk membawa perlengkapan pribadi yang dibutuhkan sesuai dengan rencana kegiatan yang telah disampaikan.</p>
        </div>
        
        <strong>c. Pengaturan Jadwal:</strong><br>
        <div class="activity-block">
            Guru menyusun dan mensosialisasikan jadwal kegiatan pembelajaran sebagai berikut:
            <div class="bullet-list" style="margin-top: 5px;">
                • <strong>Hari 1:</strong> Pengenalan tema, penguatan nilai, dan pembentukan kelompok belajar<br>
                • <strong>Hari 2:</strong> Eksplorasi konsep, riset, dan analisis masalah/fenomena<br>
                • <strong>Hari 3:</strong> Perancangan projek, desain, dan penyusunan rencana kerja<br>
                • <strong>Hari 4–5:</strong> Pelaksanaan projek utama dan pembuatan karya<br>
                • <strong>Hari 6:</strong> Presentasi hasil karya dan refleksi pembelajaran
            </div>
            <p style="margin-top: 8px; margin-left: 0px;">Siswa mencatat jadwal dan mempersiapkan diri untuk setiap tahapan kegiatan.</p>
        </div>
    </div>
    
    <div class="page-break"></div>
    
    <div class="sub-section">
        <strong>2. Pelaksanaan (${Math.ceil(parseInt(form.alokasi.value) * 0.60) || 6} JP)</strong><br><br>
        
        <strong>a. Pengenalan Tema dan Penguatan Nilai (Hari 1 - 2 JP)</strong><br>
        <div class="activity-block">
            <strong>Kegiatan Guru:</strong><br>
            • Guru membuka pembelajaran dengan salam, berdoa bersama, dan mengecek kehadiran siswa.<br>
            • Guru memperkenalkan tema "${selectedTema}" dengan mengaitkan pada kehidupan sehari-hari dan nilai-nilai keislaman melalui storytelling atau tayangan video inspiratif.<br>
            • Guru menjelaskan pokok bahasan: ${form.pokokBahasan.value}.<br>
            • Guru menyampaikan tujuan pembelajaran dan kompetensi yang akan dicapai.<br>
            • Guru memberikan penguatan nilai-nilai: ${tujuanKBC[0] || 'Penguatan nilai-nilai KBC'} sebagai landasan kegiatan.<br>
            • Guru membagi siswa ke dalam kelompok-kelompok kecil (4-5 orang) secara heterogen.<br>
            • Guru menjelaskan peran setiap anggota kelompok: ketua, sekretaris, koordinator, anggota.<br><br>
            
            <strong>Kegiatan Siswa:</strong><br>
            • Siswa menyimak penjelasan guru dengan penuh perhatian.<br>
            • Siswa berdiskusi dalam kelompok kecil tentang pemahaman awal mereka terhadap tema.<br>
            • Siswa menentukan peran masing-masing dalam kelompok.<br>
            • Siswa membuat kesepakatan kelompok tentang aturan kerja sama.<br>
            • Siswa mengajukan pertanyaan atau klarifikasi kepada guru jika ada yang belum dipahami.
        </div><br>
        
        <strong>b. Eksplorasi dan Riset (Hari 2 - 2 JP)</strong><br>
        <div class="activity-block">
            <strong>Kegiatan Guru:</strong><br>
            • Guru menjelaskan metode riset dan eksplorasi yang akan dilakukan: ${aktivitasList[0] || 'kegiatan eksplorasi dan penelitian'}.<br>
            • Guru ${mapelArray[0] || ''} memberikan arahan tentang sumber-sumber informasi yang dapat digunakan (buku, internet, narasumber).<br>
            • Guru membagikan lembar kerja (worksheet) untuk panduan riset siswa.<br>
            • Guru memfasilitasi siswa untuk mengakses perpustakaan, internet, atau melakukan observasi lapangan.<br>
            • Guru berkeliling memantau dan membimbing setiap kelompok dalam proses pencarian informasi.<br>
            • Guru memberikan scaffolding (bantuan bertahap) kepada kelompok yang mengalami kesulitan.<br><br>
            
            <strong>Kegiatan Siswa:</strong><br>
            • Siswa melakukan riset literatur dari buku, jurnal, atau artikel internet yang relevan.<br>
            • Siswa melakukan wawancara kepada narasumber jika diperlukan.<br>
            • Siswa melakukan observasi lapangan untuk mengumpulkan data primer.<br>
            • Siswa mencatat dan mendokumentasikan semua informasi yang diperoleh.<br>
            • Siswa berdiskusi dalam kelompok untuk menganalisis dan mensintesis informasi.<br>
            • Siswa menyusun rencana projek atau kegiatan yang akan dilaksanakan berdasarkan hasil riset.<br>
            • Siswa mempresentasikan hasil riset awal kepada guru untuk mendapatkan feedback.
        </div><br>
        
        <strong>c. Perancangan dan Desain (Hari 3 - 2 JP)</strong><br>
        <div class="activity-block">
            <strong>Kegiatan Guru:</strong><br>
            • Guru menjelaskan prinsip-prinsip desain dan perancangan projek yang baik.<br>
            • Guru ${mapelArray[1] || 'kolaboratif'} membimbing proses perancangan dengan pendekatan saintifik dan sistematis.<br>
            • Guru memberikan contoh-contoh blueprint, storyboard, atau rencana kerja yang efektif.<br>
            • Guru memfasilitasi diskusi antar kelompok untuk saling memberikan masukan.<br>
            • Guru mengarahkan siswa untuk mengidentifikasi tantangan dan menyiapkan solusi alternatif.<br>
            • Guru memberikan persetujuan terhadap rancangan yang telah dibuat siswa.<br><br>
            
            <strong>Kegiatan Siswa:</strong><br>
            • Siswa melaksanakan ${aktivitasList[1] || 'kegiatan perancangan dan desain'} berdasarkan hasil riset.<br>
            • Siswa merancang blueprint, storyboard, atau rencana detail kegiatan secara tertulis dan visual.<br>
            • Siswa menyusun timeline (jadwal kerja) untuk pelaksanaan projek.<br>
            • Siswa mengidentifikasi alat dan bahan yang dibutuhkan.<br>
            • Siswa berdiskusi dalam kelompok tentang pembagian tugas dan tanggung jawab.<br>
            • Siswa mengantisipasi tantangan yang mungkin muncul dan menyiapkan solusi.<br>
            • Siswa mempresentasikan rancangan kepada guru untuk mendapatkan validasi.
        </div><br>
        
        <div class="page-break"></div>
        
        <strong>d. Pelaksanaan Projek Utama (Hari 4-5 - 4 JP)</strong><br>
        <div class="activity-block">
            <strong>Kegiatan Guru:</strong><br>
            • Guru memberikan instruksi detail tentang pelaksanaan projek dan aspek keselamatan kerja.<br>
            • Guru memfasilitasi penyediaan alat, bahan, dan ruang kerja yang dibutuhkan.<br>
            • Guru berkeliling memantau proses kerja setiap kelompok secara berkala.<br>
            • Guru memberikan bimbingan teknis saat siswa mengalami kesulitan.<br>
            • Guru melakukan ${aktivitasList[3] || 'kegiatan monitoring dan evaluasi proses'} secara formatif.<br>
            • Guru mengamati dan mencatat sikap siswa: ketulusan, kerjasama, kreativitas, tanggung jawab, dan ketekunan.<br>
            • Guru memberikan motivasi dan apresiasi terhadap usaha siswa.<br>
            • Guru mengingatkan siswa untuk mendokumentasikan setiap tahap proses kerja.<br><br>
            
            <strong>Kegiatan Siswa:</strong><br>
            • Siswa melaksanakan ${aktivitasList[2] || 'kegiatan pelaksanaan projek utama'} sesuai dengan rancangan yang telah dibuat.<br>
            • Siswa bekerja secara kolaboratif dalam kelompok dengan pembagian tugas yang jelas.<br>
            • Siswa menerapkan konsep-konsep yang telah dipelajari dalam praktik nyata.<br>
            • Siswa melakukan problem solving ketika menemui hambatan atau tantangan.<br>
            • Siswa saling membantu dan berkomunikasi efektif dalam kelompok.<br>
            • Siswa mendokumentasikan proses pembelajaran melalui foto, video, atau catatan lapangan.<br>
            • Siswa melakukan evaluasi internal kelompok terhadap progress yang telah dicapai.<br>
            • Siswa memastikan hasil karya/projek sesuai dengan tujuan yang telah ditetapkan.
        </div><br>
        
        <strong>e. Presentasi dan Refleksi (Hari 6 - 2 JP)</strong><br>
        <div class="activity-block">
            <strong>Kegiatan Guru:</strong><br>
            • Guru mengatur setting ruang kelas untuk presentasi kelompok.<br>
            • Guru menjelaskan tata cara presentasi dan etika bertanya/menanggapi.<br>
            • Guru memfasilitasi jalannya presentasi setiap kelompok secara bergiliran.<br>
            • Guru memberikan kesempatan kepada kelompok lain untuk mengajukan pertanyaan dan memberikan feedback.<br>
            • Guru ${mapelArray[0] || 'mata pelajaran'} mengaitkan hasil pembelajaran dengan konsep teoritis yang telah dipelajari.<br>
            • Guru memberikan penguatan dan klarifikasi terhadap miskonsepsi yang muncul.<br>
            • Guru memfasilitasi refleksi pembelajaran dengan mengaitkannya pada ${tujuanKBC[0] || 'nilai-nilai KBC'}.<br>
            • Guru memberikan apresiasi dan penghargaan kepada semua kelompok atas usaha dan hasil karya mereka.<br><br>
            
            <strong>Kegiatan Siswa:</strong><br>
            • Siswa mempresentasikan hasil projek/karya di depan kelas dengan percaya diri.<br>
            • Siswa menjelaskan proses, tantangan, dan pembelajaran yang diperoleh.<br>
            • Siswa menjawab pertanyaan dari kelompok lain dengan argumentasi yang logis.<br>
            • Siswa memberikan peer feedback yang konstruktif kepada kelompok lain.<br>
            • Siswa melakukan refleksi pribadi tentang pengalaman belajar mereka.<br>
            • Siswa menuliskan pembelajaran bermakna yang mereka dapatkan.<br>
            • Siswa menyusun pesan inspiratif atau komitmen untuk menerapkan pembelajaran dalam kehidupan.<br>
            • Siswa mengisi lembar evaluasi diri dan evaluasi kelompok.
        </div>
    </div>
    
    <div class="page-break"></div>
    
    <div class="sub-section">
        <strong>3. Pembuatan Karya (${Math.ceil(parseInt(form.alokasi.value) * 0.15) || 2} JP)</strong><br><br>
        
        <div class="activity-block">
            <strong>Kegiatan Guru:</strong><br>
            • Guru menjelaskan kriteria dan standar produk karya yang harus dipenuhi siswa.<br>
            • Guru memberikan contoh-contoh produk karya yang berkualitas sebagai referensi.<br>
            • Guru membimbing siswa dalam proses finalisasi dan penyempurnaan karya.<br>
            • Guru memastikan setiap kelompok membuat dokumentasi lengkap dari proses pembelajaran.<br>
            • Guru memfasilitasi siswa dalam menyusun laporan tertulis dan portofolio digital.<br>
            • Guru memberikan feedback formatif untuk perbaikan karya siswa.<br><br>
            
            <strong>Kegiatan Siswa:</strong><br>
            • Siswa menyelesaikan dan menyempurnakan produk karya yang telah dibuat.<br>
            • Siswa menyusun dokumentasi lengkap meliputi:
            <div class="bullet-list" style="margin-left: 20px; margin-top: 5px;">
                ${mapelArray.map(mapel => `• Produk karya terkait ${mapel}: laporan, prototipe, model, karya seni, atau dokumentasi visual`).join('<br>\n                ')}<br>
                • Dokumentasi proses: foto, video, catatan lapangan, atau portofolio digital<br>
                • Refleksi pembelajaran: jurnal individu dan refleksi kelompok
            </div>
            • Siswa menyusun laporan tertulis yang sistematis dan rapi.<br>
            • Siswa melakukan quality check terhadap produk karya yang dihasilkan.<br>
            • Siswa mempersiapkan bahan presentasi (slide, poster, atau media lainnya).
        </div>
    </div>
    
    <div class="sub-section">
        <strong>4. Presentasi Karya (${Math.ceil(parseInt(form.alokasi.value) * 0.05) || 1} JP)</strong><br><br>
        
        <div class="activity-block">
            <strong>Kegiatan Guru:</strong><br>
            • Guru mengatur ruang presentasi dan showcase karya siswa.<br>
            • Guru membuka acara presentasi dan menjelaskan tata tertib.<br>
            • Guru memfasilitasi setiap kelompok untuk mempresentasikan hasil karya mereka.<br>
            • Guru mengajukan pertanyaan kritis untuk menggali pemahaman mendalam siswa.<br>
            • Guru mencatat poin-poin penting dari setiap presentasi.<br>
            • Guru memberikan apresiasi dan feedback yang membangun kepada setiap kelompok.<br><br>
            
            <strong>Kegiatan Siswa:</strong><br>
            • Siswa mempresentasikan hasil projek/karya di depan kelas secara sistematis.<br>
            • Siswa melakukan showcase (pameran) produk karya yang telah dibuat.<br>
            • Siswa memberikan demonstrasi cara kerja atau penggunaan produk karya.<br>
            • Siswa menjelaskan proses pembuatan, kendala yang dihadapi, dan solusi yang diterapkan.<br>
            • Siswa menjawab pertanyaan dari guru dan teman-teman dengan percaya diri.<br>
            • Siswa memberikan peer feedback yang konstruktif kepada kelompok lain.
        </div>
    </div>
    
    <div class="sub-section">
        <strong>5. Refleksi (${Math.ceil(parseInt(form.alokasi.value) * 0.05) || 1} JP)</strong><br><br>
        
        <div class="activity-block">
            <strong>Kegiatan Guru:</strong><br>
            • Guru memfasilitasi sesi refleksi dengan menciptakan suasana yang terbuka dan kondusif.<br>
            • Guru mengajukan pertanyaan-pertanyaan reflektif kepada siswa tentang pengalaman belajar mereka.<br>
            • Guru mendengarkan dengan empati setiap ungkapan dan perasaan siswa.<br>
            • Guru mengaitkan pengalaman belajar dengan nilai-nilai kehidupan dan keislaman.<br>
            • Guru memberikan penguatan terhadap pembelajaran bermakna yang telah terjadi.<br>
            • Guru meminta siswa untuk membuat komitmen penerapan ilmu dalam kehidupan.<br>
            • Guru menutup pembelajaran dengan doa dan salam.<br><br>
            
            <strong>Kegiatan Siswa:</strong><br>
            • Siswa melakukan refleksi pribadi tentang proses pembelajaran yang telah dilalui.<br>
            • Siswa menuliskan pembelajaran bermakna yang mereka dapatkan dalam jurnal refleksi.<br>
            • Siswa berbagi pengalaman, perasaan, dan insight yang diperoleh selama pembelajaran.<br>
            • Siswa mengidentifikasi nilai-nilai yang mereka pelajari dan bagaimana menerapkannya.<br>
            • Siswa menyampaikan apresiasi kepada teman-teman dan guru.<br>
            • Siswa membuat komitmen atau rencana aksi untuk menerapkan ilmu dalam kehidupan sehari-hari.<br>
            • Siswa mengisi lembar evaluasi pembelajaran dan memberikan feedback untuk perbaikan.
        </div>
    </div>
    
    <div class="page-break"></div>
    
    <div class="section-title">LAMPIRAN</div>
    
    <div class="sub-section">
        <strong>Lampiran 1. Lembar Observasi</strong><br>
        <strong>Instrumen Pengamatan Guru</strong>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 25%;">Nama Siswa</th>
                    <th style="width: 10%;">SB</th>
                    <th style="width: 10%;">B</th>
                    <th style="width: 10%;">C</th>
                    <th style="width: 10%;">K</th>
                    <th style="width: 30%;">Catatan Guru</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>1</td><td>Siswa 1</td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>2</td><td>Siswa 2</td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>3</td><td>Siswa 3</td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>4</td><td>Siswa 4</td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>5</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>6</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            </tbody>
        </table>
        <p style="font-size: 9pt; font-style: italic;">Berilah tanda (√) sesuai hasil pengamatan perilaku dan sikap anak dalam kegiatan.</p>
    </div>
    
    <div class="sub-section">
        <strong>Lampiran 2. Rubrik Penilaian Kinerja</strong>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 15%;">Aspek</th>
                    <th style="width: 21.25%;">SB</th>
                    <th style="width: 21.25%;">B</th>
                    <th style="width: 21.25%;">C</th>
                    <th style="width: 21.25%;">K</th>
                </tr>
            </thead>
            <tbody>
                ${dimensiDPL.map(dpl => `
                <tr>
                    <td><strong>${dpl}</strong></td>
                    <td>Menunjukkan ${dpl.toLowerCase()} dengan sangat baik; melampaui ekspektasi; konsisten dan mandiri.</td>
                    <td>Menunjukkan ${dpl.toLowerCase()} dengan baik; memenuhi ekspektasi; kadang perlu arahan.</td>
                    <td>Menunjukkan ${dpl.toLowerCase()} cukup; masih perlu bimbingan dan arahan guru.</td>
                    <td>Belum menunjukkan ${dpl.toLowerCase()}; perlu perhatian khusus dan bimbingan intensif.</td>
                </tr>
                `).join('')}
                <tr>
                    <td><strong>${form.topikKBC.value}</strong></td>
                    <td>Memiliki pemahaman mendalam; menerapkan nilai dengan konsisten; menjadi teladan.</td>
                    <td>Memahami nilai dengan baik; menerapkan dalam sebagian besar kegiatan.</td>
                    <td>Pemahaman dasar; penerapan masih perlu penguatan.</td>
                    <td>Belum memahami; tidak menunjukkan penerapan nilai.</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    ${appState.formData.catatan ? `
    <div class="page-break"></div>
    <div class="section-title">CATATAN KHUSUS</div>
    <div class="content">${appState.formData.catatan}</div>
    ` : ''}
    
</body>
</html>
    `;
    
    // Create blob and download
    const blob = new Blob([documentContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanedTheme = selectedTema.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    link.download = `RPP_${cleanedTheme}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('✅ Dokumen RPP berhasil diunduh!\n\nDokumen dapat dibuka dengan Microsoft Word.\nFormat dokumen sudah lengkap dengan:\n• Cover halaman\n• Identitas madrasah\n• Praktek pedagogik dengan bahasa instruksional\n• Kegiatan pembelajaran detail per hari\n• Kegiatan guru dan kegiatan siswa terpisah\n• Lampiran observasi dan rubrik penilaian');
}

// Authentication functions (placeholder)
function handleRegistrasi() {
    const username = document.getElementById('usernameReg').value;
    const password = document.getElementById('passwordReg').value;
    
    if (!username || !password) {
        alert('Silakan isi username dan password!');
        return;
    }
    
    alert('Fitur registrasi akan segera tersedia. Saat ini aplikasi dapat digunakan tanpa login.');
}

function handleLogin() {
    const username = document.getElementById('usernameLogin').value;
    const password = document.getElementById('passwordLogin').value;
    
    if (!username || !password) {
        alert('Silakan isi username dan password!');
        return;
    }
    
    alert('Fitur login akan segera tersedia. Saat ini aplikasi dapat digunakan tanpa login.');
}

