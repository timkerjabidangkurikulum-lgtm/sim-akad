import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Printer,
  Sparkles,
  School,
  GraduationCap,
  Heart,
  User,
  Layout,
  ClipboardList,
  Wand2,
  Download,
  Table as TableIcon,
} from 'lucide-react';

const INPUT_CLASS =
  'w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-400 transition-all';
const TEXTAREA_CLASS =
  'w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-400 transition-all resize-none';

const RppModulAjar = () => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const absoluteLogoUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${baseUrl}logo-kemenag.png`
      : `${baseUrl}logo-kemenag.png`;
  const [formData, setFormData] = useState({
    jenjang: '',
    school: '',
    subject: '',
    material: '',
    phase: '',
    grade: '',
    semester: '',
    timeAllocation: '',
    meetingCount: 1,
    meetings: [],
    materialImageUrl: '',
    materialImageCaption: '',
    materialImageDataUrl: '',
    year: '',
    author: '',
    city: '',
    nipHead: '',
    nipTeacher: '',
    headMaster: '',

    kbcThemes: [],
    insertionMaterial: '',

    studentId: '',
    materialAnalysis: '',
    dpl: [],

    cp: '',
    crossDiscipline: '',
    tp: '',
    topic: '',
    pedagogy: '',
    partnership: '',
    environment: '',
    digital: '',

    stepInitial: '',
    stepCoreUnderstand: '',
    stepCoreApply: '',
    stepCoreReflect: '',
    stepClosing: '',

    timeInitial: '',
    timeCore: '',
    timeClosing: '',

    meaningInitial: '',
    meaningCore: '',
    meaningClosing: '',

    assessmentInitial: '',
    assessmentProcess: '',
    assessmentFinal: '',

    reflectionMeaningful: '',
    reflectionMindful: '',
    reflectionJoyful: '',
  });

  const [activeTab, setActiveTab] = useState('general');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const kbcOptions = [
    'Cinta Kepada Allah SWT & Rasulullah SAW',
    'Cinta Kepada Diri Sendiri',
    'Cinta Kepada Sesama',
    'Cinta Kepada Lingkungan',
    'Cinta Kepada Bangsa dan Negara',
  ];

  const dplOptions = [
    'DPL1 Keimanan dan Ketakwaan terhadap Tuhan YME',
    'DPL2 Kewargaan',
    'DPL3 Penalaran Kritis',
    'DPL4 Kreativitas',
    'DPL5 Kolaborasi',
    'DPL6 Kemandirian',
    'DPL7 Kesehatan',
    'DPL8 Komunikasi',
  ];

  const clampMeetingCount = (value) => {
    const parsed = Number.parseInt(String(value || ''), 10);
    if (!Number.isFinite(parsed)) return 1;
    return Math.max(1, Math.min(12, parsed));
  };

  const ensureMeetings = (meetingCount, prevMeetings, seed) => {
    const safeCount = clampMeetingCount(meetingCount);
    const current = Array.isArray(prevMeetings) ? prevMeetings : [];
    const next = [];

    for (let i = 0; i < safeCount; i += 1) {
      const existing = current[i] || {};
      next.push({
        title: existing.title || `Pertemuan ${i + 1}`,
        allocation: existing.allocation || '',
        objectives:
          existing.objectives ||
          `Peserta didik mampu ${
            i === 0
              ? 'memahami'
              : i === 1
                ? 'menganalisis'
                : 'menerapkan dan merefleksikan'
          } materi ${seed?.material || seed?.topic || 'pembelajaran'} secara bertahap.`,
        focus:
          existing.focus ||
          `${seed?.material || seed?.topic || 'Materi'} (Fokus ${i + 1})`,
        assessment:
          existing.assessment ||
          (i === 0
            ? 'Diagnostik + tanya jawab berbasis gambar/teks.'
            : i === safeCount - 1
              ? 'Sumatif singkat + refleksi komitmen aksi.'
              : 'Formatif: observasi, produk, presentasi.'),
      });
    }
    return next;
  };

  const readBlobAsDataUrl = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.readAsDataURL(blob);
    });

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readBlobAsDataUrl(file);
      setFormData((prev) => ({
        ...prev,
        materialImageDataUrl: dataUrl,
        materialImageUrl: '',
        materialImageCaption:
          prev.materialImageCaption ||
          `Ilustrasi materi: ${prev.material || prev.topic || 'Pembelajaran'}`,
      }));
    } catch (err) {
      // eslint-disable-next-line no-alert
      window.alert('Gagal memuat gambar. Coba pilih file gambar lain.');
    }
  };

  const convertImageUrlToDataUrl = async () => {
    const url = String(formData.materialImageUrl || '').trim();
    if (!url) return;
    try {
      let response = await fetch(url, { mode: 'cors' });

      // If blocked by CORS or non-OK, fall back to same-origin proxy.
      if (!response.ok) {
        throw new Error('Direct fetch failed');
      }

      let blob = await response.blob();

      // Sometimes CORS blocks reading the body; fallback to proxy.
      if (!blob || blob.size === 0) {
        throw new Error('Empty blob');
      }

      const dataUrl = await readBlobAsDataUrl(blob);

      setFormData((prev) => ({
        ...prev,
        materialImageDataUrl: dataUrl,
        materialImageCaption:
          prev.materialImageCaption ||
          `Ilustrasi materi: ${prev.material || prev.topic || 'Pembelajaran'}`,
      }));
    } catch (err) {
      try {
        const proxyUrl = `${baseUrl}api/image-proxy.php?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);
        if (!proxyResponse.ok) throw new Error('Proxy failed');
        const blob = await proxyResponse.blob();
        if (!blob || blob.size === 0) throw new Error('Empty proxy blob');
        const dataUrl = await readBlobAsDataUrl(blob);
        setFormData((prev) => ({
          ...prev,
          materialImageDataUrl: dataUrl,
          materialImageCaption:
            prev.materialImageCaption ||
            `Ilustrasi materi: ${prev.material || prev.topic || 'Pembelajaran'}`,
        }));
      } catch (proxyErr) {
        // eslint-disable-next-line no-alert
        window.alert(
          'Tidak bisa mengkonversi gambar dari URL. Penyebab umum: CORS, URL bukan gambar, ukuran terlalu besar, atau host diblokir. Solusi paling aman: Upload gambar dari perangkat.'
        );
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'meetingCount') {
      const count = clampMeetingCount(value);
      setFormData((prev) => ({
        ...prev,
        meetingCount: count,
        meetings: ensureMeetings(count, prev.meetings, prev),
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const list = prev[field];
      if (checked) {
        return { ...prev, [field]: [...list, value] };
      }
      return { ...prev, [field]: list.filter((item) => item !== value) };
    });
  };

  const handleMeetingFieldChange = (index, field, value) => {
    setFormData((prev) => {
      const normalizedMeetings = ensureMeetings(prev.meetingCount || 1, prev.meetings, prev);
      const nextMeetings = normalizedMeetings.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      );
      return { ...prev, meetings: nextMeetings };
    });
  };

  const generateAutoContent = (currentData) => {
    const newData = { ...currentData };
    const topic = newData.material || 'Materi Pembelajaran';
    const kbc = newData.kbcThemes.length > 0 ? newData.kbcThemes[0] : kbcOptions[0];

    const normalizeJenjang = (j) => {
      const v = (j || '').toLowerCase();
      if (v.includes('mi') || v.includes('sd')) return 'MI/SD';
      if (v.includes('mts') || v.includes('smp')) return 'MTs/SMP';
      if (v.includes('ma') || v.includes('sma') || v.includes('smk')) return 'MA/SMA';
      return '';
    };

    const inferJenjangFromPhase = (phase) => {
      const p = (phase || '').toUpperCase();
      if (['A', 'B', 'C'].includes(p)) return 'MI/SD';
      if (p === 'D') return 'MTs/SMP';
      if (['E', 'F'].includes(p)) return 'MA/SMA';
      return '';
    };

    const parseTotalMinutes = (timeAllocation) => {
      const raw = `${timeAllocation || ''}`.toLowerCase();
      // common patterns: "2 x 35", "2x45", "70 menit"
      const matchTimes = raw.match(/(\d+)\s*x\s*(\d+)/);
      if (matchTimes) {
        const a = Number(matchTimes[1]);
        const b = Number(matchTimes[2]);
        if (Number.isFinite(a) && Number.isFinite(b)) return a * b;
      }
      const matchMinutes = raw.match(/(\d+)\s*menit/);
      if (matchMinutes) {
        const m = Number(matchMinutes[1]);
        if (Number.isFinite(m)) return m;
      }
      const matchNumber = raw.match(/\b(\d{2,3})\b/);
      if (matchNumber) {
        const m = Number(matchNumber[1]);
        if (Number.isFinite(m)) return m;
      }
      return null;
    };

    const studentDesc = (newData.studentId || '').toLowerCase();
    const materialDesc = (newData.material || '').toLowerCase();

    if (newData.kbcThemes.length === 0) newData.kbcThemes = [kbcOptions[2]];
    if (!newData.insertionMaterial)
      newData.insertionMaterial = `Insersi KBC pada materi "${topic}":\n1) Mengaitkan konsep utama materi dengan nilai ${kbc}.\n2) Memberi contoh tindakan nyata di lingkungan madrasah/rumah sebagai manifestasi nilai cinta.\n3) Refleksi komitmen: peserta didik menuliskan 1 aksi konkret yang akan dilakukan selama 1 minggu ke depan.`;
    const jenjangResolved = normalizeJenjang(newData.jenjang) || inferJenjangFromPhase(newData.phase);
    if (!newData.jenjang && jenjangResolved) newData.jenjang = jenjangResolved;
    if (!newData.timeAllocation) {
      if (jenjangResolved === 'MI/SD') newData.timeAllocation = '2 x 35 Menit';
      else if (jenjangResolved === 'MTs/SMP') newData.timeAllocation = '2 x 40 Menit';
      else newData.timeAllocation = '2 x 45 Menit';
    }
    if (!newData.city) newData.city = 'Banggai';
    if (!newData.semester) newData.semester = 'Ganjil';
    if (!newData.headMaster) newData.headMaster = '............................';
    if (!newData.nipHead) newData.nipHead = '............................';
    if (!newData.nipTeacher) newData.nipTeacher = '............................';

    if (!newData.studentId) {
      newData.studentId =
        'Pengetahuan Awal: Peserta didik memiliki pengetahuan dasar sesuai jenjangnya, namun tingkat penguasaan beragam.\n'
        + 'Minat: Sebagian tertarik belajar melalui cerita/visual/video, sebagian melalui aktivitas kelompok interaktif.\n'
        + 'Latar Belakang: Berasal dari lingkungan keluarga yang beragam sehingga pembiasaan nilai juga bervariasi.\n'
        + 'Kebutuhan Belajar (Diferensiasi):\n'
        + '• Visual: kartu konsep/infografis/slide.\n'
        + '• Auditori: diskusi lisan, pembacaan/pemaparan guru.\n'
        + '• Kinestetik: praktik, simulasi peran, produk karya.';
    }
    if (!newData.materialAnalysis) {
      newData.materialAnalysis = `Materi "${topic}" merupakan materi esensial yang mencakup pemahaman konsep (knowledge), penghayatan nilai (afektif), dan penerapan perilaku (psikomotorik) dalam kehidupan sehari-hari.`;
    }
    if (newData.dpl.length === 0)
      newData.dpl = [dplOptions[0], dplOptions[2], dplOptions[4]];

    let smartPedagogy = '';

    if (
      studentDesc.includes('kinestetik') ||
      materialDesc.includes('sholat') ||
      materialDesc.includes('praktik')
    ) {
      smartPedagogy =
        'Model Demonstration & Performance (Praktik Langsung) terintegrasi Deep Learning. Metode ini dipilih untuk memfasilitasi gaya belajar kinestetik siswa, di mana siswa tidak hanya memahami teori tetapi langsung mempraktikkannya.';
    } else if (
      materialDesc.includes('akhlak') ||
      materialDesc.includes('sejarah') ||
      materialDesc.includes('kisah')
    ) {
      smartPedagogy =
        'Model Role Playing (Bermain Peran) dan Storytelling terintegrasi Deep Learning. Metode ini efektif untuk menanamkan empati dan penghayatan nilai melalui simulasi kejadian nyata atau historis.';
    } else if (
      materialDesc.includes('hukum') ||
      materialDesc.includes('dalil') ||
      studentDesc.includes('kritis')
    ) {
      smartPedagogy =
        'Model Problem Based Learning (PBL) dan Inquiry terintegrasi Deep Learning. Siswa diajak berpikir kritis menganalisis kasus atau masalah nyata untuk menemukan solusi berdasarkan dalil yang valid.';
    } else {
      smartPedagogy =
        'Pendekatan Deep Learning (Memahami, Mengaplikasi, Merefleksi) dengan metode Cooperative Learning (Diskusi Kelompok) dan Pemanfaatan Multimedia Interaktif untuk mengakomodasi gaya belajar visual.';
    }

    if (!newData.cp)
      newData.cp =
        'Peserta didik mampu memahami, menganalisis, dan mengaplikasikan konsep materi sesuai fase perkembangannya untuk memecahkan masalah dalam kehidupan sehari-hari.';
    if (!newData.crossDiscipline)
      newData.crossDiscipline =
        'Pendidikan Kewarganegaraan (Nilai Sosial), Bahasa Indonesia (Literasi).';
    if (!newData.tp)
      newData.tp = `Melalui pendekatan Deep Learning, peserta didik dapat memahami konsep ${topic}, menganalisis dampaknya, dan menerapkannya dengan penuh kesadaran diri.`;
    if (!newData.topic) newData.topic = topic;

    if (!newData.pedagogy) newData.pedagogy = smartPedagogy;

    if (!newData.partnership)
      newData.partnership =
        'Orang tua/wali (pemantauan praktik di rumah), guru mapel lain (integrasi nilai lintas mapel), dan mitra digital (sumber belajar online).';
    if (!newData.environment)
      newData.environment =
        'Ruang kelas nyaman (diskusi/kelompok), ruang ibadah/area praktik (jika relevan), dan ruang virtual (grup belajar) untuk pengayaan.';

    if (!newData.timeInitial || !newData.timeCore || !newData.timeClosing) {
      const total = parseTotalMinutes(newData.timeAllocation);
      const is70 = total === 70;
      const is80 = total === 80;
      const is90 = total === 90;
      if (!newData.timeInitial) newData.timeInitial = is70 || is80 ? '10 Menit' : is90 ? '15 Menit' : '15 Menit';
      if (!newData.timeCore) newData.timeCore = is70 ? '50 Menit' : is80 ? '60 Menit' : is90 ? '60 Menit' : '60 Menit';
      if (!newData.timeClosing) newData.timeClosing = is70 || is80 ? '10 Menit' : is90 ? '15 Menit' : '15 Menit';
    }

    let smartDigital = '';
    let recommendedImages = [];

    if (materialDesc.includes('fitnah') || materialDesc.includes('akhlak')) {
      smartDigital =
        '1. Video Kasus: Menayangkan cuplikan berita/film pendek tentang dampak hoax/fitnah.\n2. Platform Padlet/Jamboard: Untuk curah pendapat online.\n3. Artikel Berita Digital: Sebagai bahan analisis studi kasus.';
      recommendedImages = ['[Ilustrasi dampak fitnah/hoax]', '[Emoji sedih/konflik]', '[Poster anti hoax]'];
    } else if (materialDesc.includes('alam') || materialDesc.includes('lingkungan')) {
      smartDigital =
        '1. Video Dokumenter: Keindahan alam atau kerusakan lingkungan.\n2. Google Earth: Mengamati kondisi geografis.\n3. Infografis Digital: Data statistik lingkungan.';
      recommendedImages = [
        '[Foto keindahan alam]',
        '[Gambar kerusakan lingkungan]',
        '[Infografis perubahan iklim]',
      ];
    } else {
      smartDigital = `1. Slide Presentasi Interaktif (Canva/PPT) yang memuat visual menarik.\n2. Quizizz/Kahoot: Untuk asesmen awal yang menyenangkan.\n3. YouTube: Video penjelasan materi ${topic}.`;
      recommendedImages = [
        '[Cover visual topik]',
        '[Diagram alur konsep]',
        '[Poster nilai KBC terkait]',
      ];
    }

    if (!newData.digital) {
      newData.digital = `${smartDigital}\n\nMedia Visual Pendukung:\n${recommendedImages.join(', ')}`;
    }

    const mediaRefText = newData.materialImageDataUrl
      ? 'Gambar materi (terlampir)'
      : recommendedImages[0] || '[Image]';

    // Multi-pertemuan: siapkan rencana per pertemuan (tujuan + fokus + alokasi + asesmen)
    const meetingCountResolved = clampMeetingCount(newData.meetingCount || 1);
    newData.meetingCount = meetingCountResolved;
    newData.meetings = ensureMeetings(meetingCountResolved, newData.meetings, newData);

    const totalMinutes = parseTotalMinutes(newData.timeAllocation);
    if (totalMinutes && meetingCountResolved > 0) {
      const baseMinutes = Math.floor(totalMinutes / meetingCountResolved);
      const remainder = totalMinutes % meetingCountResolved;
      newData.meetings = newData.meetings.map((m, idx) => {
        if (m.allocation) return m;
        const minutes = baseMinutes + (idx < remainder ? 1 : 0);
        return { ...m, allocation: `${minutes} Menit` };
      });
    }

    if (!newData.materialImageCaption) {
      newData.materialImageCaption = `Ilustrasi materi: ${topic}`;
    }

    if (!newData.stepInitial) {
      newData.stepInitial = `1. Orientasi: Guru membuka kelas dengan salam, doa, dan "Morning Check-in" perasaan siswa.\n2. Mindful Opening: Latihan napas singkat (mindfulness) untuk membantu fokus.\n3. Apersepsi & Koneksi (KBC): Guru menayangkan ${mediaRefText} dan bertanya: "Apa hubungan topik ini dengan nilai ${kbc} dalam kehidupan sehari-hari?"\n4. Pre-Assessment: Kuis lisan singkat/kuis digital untuk memetakan pengetahuan awal.`;
    }
    if (!newData.stepCoreUnderstand) {
      newData.stepCoreUnderstand = `1. Eksplorasi: Siswa mengamati tayangan video atau slide presentasi yang memuat ${
        mediaRefText || ''
      }.\n2. Elaborasi: Guru memberikan pertanyaan pemantik untuk menggali pemahaman awal.\n3. Literasi: Siswa membaca referensi digital/buku paket untuk menemukan kata kunci konsep.`;
    }
    if (!newData.stepCoreApply) {
      newData.stepCoreApply = `1. Kolaborasi: Siswa dibagi dalam kelompok. Setiap kelompok menerima LKPD berisi masalah nyata.\n2. Analisis: Siswa menghubungkan masalah dengan nilai ${
        kbc
      } dan mencari solusi.\n3. Kreasi: Siswa membuat produk sederhana (Poster Digital/Mind Map) yang memuat ilustrasi seperti ${
        recommendedImages[2] || ''
      }.`;
    }
    if (!newData.stepCoreReflect) {
      newData.stepCoreReflect = `1. Tularkan: Kelompok mempresentasikan hasil kerja secara singkat.\n2. Inovasi: Kelas menyepakati 1 rencana aksi sederhana berbasis ${kbc}.\n3. Refleksi: Siswa menuliskan "Satu hal baru yang saya pelajari" dan "Satu aksi nyata yang akan saya lakukan minggu ini".`;
    }
    if (!newData.stepClosing) {
      newData.stepClosing =
        '1. Post-Assessment: 3–5 pertanyaan singkat/lembar refleksi untuk mengukur pemahaman akhir.\n2. Kesimpulan: Bersama-sama merangkum poin utama materi.\n3. Tindak Lanjut: Penugasan proyek pengamatan/aksi nyata di rumah.\n4. Doa Penutup.';
    }

    if (!newData.meaningInitial) {
      newData.meaningInitial = `Mindful & Joyful: membangun fokus dan suasana positif.\nMeaningful: mengaitkan ${topic} dengan konteks nyata serta nilai ${kbc}.`;
    }
    if (!newData.meaningCore) {
      newData.meaningCore =
        'Meaningful: pendalaman konsep secara kritis dan kontekstual.\nMindful: menumbuhkan kesadaran nilai (cinta) dalam pilihan tindakan.\nJoyful: kolaborasi & kreasi produk membuat belajar lebih menggembirakan.';
    }
    if (!newData.meaningClosing) {
      newData.meaningClosing =
        'Tularkan: berbagi pemahaman dan menginspirasi aksi nyata.\nRefleksi: menyimpulkan makna pembelajaran dan komitmen tindakan.';
    }

    if (!newData.assessmentInitial)
      newData.assessmentInitial = `Kuis interaktif menggunakan aplikasi (Quizizz) atau tanya jawab lisan menggunakan bantuan ${mediaRefText}.`;
    if (!newData.assessmentProcess)
      newData.assessmentProcess =
        '1. Observasi Kinerja: Menilai kemampuan kolaborasi dan komunikasi saat diskusi.\n2. Penilaian Produk: Menilai kreativitas dan kesesuaian konten pada hasil karya siswa.';
    if (!newData.assessmentFinal)
      newData.assessmentFinal =
        'Tes Tertulis (Uraian) untuk mengukur kedalaman pemahaman konsep dan analisis kasus.';

    if (!newData.reflectionMeaningful) {
      newData.reflectionMeaningful = `1) Materi "${topic}" dikaitkan dengan konteks kehidupan peserta didik.\n2) Nilai ${kbc} diterjemahkan menjadi tindakan nyata yang terukur.`;
    }
    if (!newData.reflectionMindful) {
      newData.reflectionMindful =
        '1) Pembelajaran diawali latihan mindfulness singkat untuk membangun kesadaran.\n2) Peserta didik merefleksikan pilihan sikap dan komitmen tindakan di akhir pembelajaran.';
    }
    if (!newData.reflectionJoyful) {
      newData.reflectionJoyful =
        '1) Aktivitas kolaboratif dan produk kreatif membuat belajar lebih menarik.\n2) Pemanfaatan media digital/visual membantu mengurangi kebosanan dan meningkatkan partisipasi.';
    }

    return newData;
  };

  const handleGenerate = () => {
    setLoading(true);
    const finalData = generateAutoContent(formData);
    setFormData(finalData);
    setTimeout(() => {
      setResult(finalData);
      setLoading(false);
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        const el = document.getElementById('preview-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 800);
  };

  const exportToWord = () => {
    if (!result) return;
    const styles = `
      <style>
        @page { size: A4; margin: 2.54cm; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.15; color: #000; }
        p { margin: 0 0 6pt 0; text-align: justify; text-indent: 1.25cm; }
        .no-indent { text-indent: 0; }
        table { width: 100%; border-collapse: collapse; }
        .border-table, .border-table th, .border-table td { border: 1px solid #000; padding: 5px; }
        .border-table th { background: none; text-align: center; font-weight: bold; }
        .no-border-table, .no-border-table td { border: none; padding: 2px; }
        .title { text-align: center; font-weight: bold; text-transform: uppercase; font-size: 12pt; margin: 0 0 12pt 0; }
        .section-title { font-weight: bold; text-transform: uppercase; padding: 0; margin: 12pt 0 6pt 0; border: 0; }
        .signature-table td { vertical-align: top; text-align: center; padding-top: 20px; }
      </style>
    `;
    const header = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <title>Modul Ajar</title>
          ${styles}
        </head>
        <body>
    `;
    const footer = '</body></html>';
    const contentElement = document.getElementById('document-content');
    if (!contentElement) return;
    const content = contentElement.innerHTML;
    const sourceHTML = header + content + footer;

    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/vnd.ms-word;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const fileDownload = document.createElement('a');
    document.body.appendChild(fileDownload);
    fileDownload.href = url;
    fileDownload.download = `Modul_Ajar_${result.subject || 'Lengkap'}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    // Revoke ditunda agar beberapa browser tidak membatalkan download.
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* ignore */
      }
    }, 2000);
  };

  const printPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const tabs = [
    { id: 'general', label: '1. Info Umum', icon: <School size={16} /> },
    { id: 'identifikasi', label: '2. Identifikasi', icon: <User size={16} /> },
    { id: 'desain', label: '3. Desain', icon: <Layout size={16} /> },
    { id: 'langkah', label: '4. Langkah', icon: <ClipboardList size={16} /> },
    { id: 'asesmen', label: '5. Asesmen', icon: <TableIcon size={16} /> },
  ];

  return (
    <div className="bg-white text-gray-900 font-sans p-4 md:p-6 lg:p-8 rounded-lg shadow-md">
      <style>{`
        @media print {
          @page { size: auto; margin: 15mm; }
          body { visibility: hidden; background: white; -webkit-print-color-adjust: exact; }
          #preview-section { 
            visibility: visible; 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            margin: 0; 
            padding: 0;
            background: white;
            color: black;
          }
          #preview-section button, #preview-section .preview-header { display: none !important; }
          .no-print { display: none !important; }
          .text-slate-100, .text-slate-400 { color: black !important; }
          .bg-slate-950, .bg-slate-900 { background: white !important; }
          table { width: 100% !important; }
        }
        .border-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
        .border-table th, .border-table td { border: 1px solid black; padding: 8px; vertical-align: top; }
        .no-border-table { width: 100%; border-collapse: collapse; }
        .no-border-table td { border: none; padding: 4px; vertical-align: top; }
      `}</style>

      <header className="mb-6 flex flex-col md:flex-row items-center justify-between border-b border-gray-200 pb-4 gap-4 no-print">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-xl shadow-lg shadow-emerald-500/20">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight uppercase">
              RPP - MODUL AJAR KURMER <span className="text-emerald-600">DL & KBC 2025</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Sistem Perancang Kurikulum Deep Learning & Berbasis Cinta
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-block px-3 py-1 bg-emerald-50 rounded-full text-xs font-mono text-emerald-700 border border-emerald-200">
            Smart Generator
          </span>
        </div>
      </header>

      <main className="flex flex-col gap-6">
        <section className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col no-print">
          <div className="flex border-b border-gray-200 bg-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 overflow-y-auto flex-grow">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup label="Jenjang">
                    <select
                      name="jenjang"
                      value={formData.jenjang}
                      onChange={handleChange}
                      className={`${INPUT_CLASS} appearance-none`}
                    >
                      <option value="" disabled className="bg-slate-900">
                        Pilih Jenjang
                      </option>
                      <option value="MI/SD" className="bg-slate-900">
                        MI / SD
                      </option>
                      <option value="MTs/SMP" className="bg-slate-900">
                        MTs / SMP
                      </option>
                      <option value="MA/SMA" className="bg-slate-900">
                        MA / SMA
                      </option>
                    </select>
                  </InputGroup>
                  <InputGroup label="Kota (Tempat TTD)">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                      placeholder="Contoh: Banggai"
                    />
                  </InputGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup label="Nama Sekolah/Madrasah">
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                      placeholder="MAN Banggai"
                    />
                  </InputGroup>
                  <InputGroup label="Mata Pelajaran">
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                      placeholder="Akidah Akhlak"
                    />
                  </InputGroup>
                </div>

                <InputGroup label="Materi Pokok">
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                    placeholder="Contoh: Menghindari Fitnah"
                  />
                </InputGroup>

                <div className="grid grid-cols-2 gap-5">
                  <InputGroup label="Fase">
                    <select
                      name="phase"
                      value={formData.phase}
                      onChange={handleChange}
                      className={`${INPUT_CLASS} appearance-none`}
                    >
                      <option value="" disabled className="bg-slate-900">
                        Pilih Fase
                      </option>
                      <option value="A" className="bg-slate-900">
                        Fase A (Kelas 1-2)
                      </option>
                      <option value="B" className="bg-slate-900">
                        Fase B (Kelas 3-4)
                      </option>
                      <option value="C" className="bg-slate-900">
                        Fase C (Kelas 5-6)
                      </option>
                      <option value="D" className="bg-slate-900">
                        Fase D (Kelas 7-9)
                      </option>
                      <option value="E" className="bg-slate-900">
                        Fase E (Kelas 10)
                      </option>
                      <option value="F" className="bg-slate-900">
                        Fase F (Kelas 11-12)
                      </option>
                    </select>
                  </InputGroup>
                  <InputGroup label="Kelas">
                    <input
                      type="text"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                      placeholder="12"
                    />
                  </InputGroup>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <InputGroup label="Semester">
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className={`${INPUT_CLASS} appearance-none`}
                    >
                      <option value="" disabled className="bg-slate-900">
                        Pilih Semester
                      </option>
                      <option value="Ganjil" className="bg-slate-900">
                        Ganjil
                      </option>
                      <option value="Genap" className="bg-slate-900">
                        Genap
                      </option>
                    </select>
                  </InputGroup>
                  <InputGroup label="Tahun Pelajaran">
                    <input
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                      placeholder="2025/2026"
                    />
                  </InputGroup>
                </div>

                <InputGroup label="Alokasi Waktu">
                  <input
                    type="text"
                    name="timeAllocation"
                    value={formData.timeAllocation}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                    placeholder="2 x 45 menit"
                  />
                </InputGroup>

                <InputGroup label="Jumlah Pertemuan" hint="1-12 pertemuan">
                  <input
                    type="number"
                    name="meetingCount"
                    value={formData.meetingCount}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                    min={1}
                    max={12}
                    step={1}
                  />
                </InputGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup label="Nama Guru (Penyusun)">
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                      placeholder="Nama Lengkap & Gelar"
                    />
                  </InputGroup>
                  <InputGroup label="NIP Guru">
                    <input
                      type="text"
                      name="nipTeacher"
                      value={formData.nipTeacher}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                      placeholder="NIP..."
                    />
                  </InputGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup label="Nama Kepala Madrasah">
                    <input
                      type="text"
                      name="headMaster"
                      value={formData.headMaster}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                      placeholder="Nama Lengkap & Gelar"
                    />
                  </InputGroup>
                  <InputGroup label="NIP Kepala">
                    <input
                      type="text"
                      name="nipHead"
                      value={formData.nipHead}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                      placeholder="NIP..."
                    />
                  </InputGroup>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mt-4">
                  <h3 className="text-emerald-700 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                    <Heart size={16} className="text-emerald-500" /> Tema KBC (Pilih Minimal 1)
                  </h3>
                  <div className="space-y-2 mb-4">
                    {kbcOptions.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-start gap-3 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            value={opt}
                            checked={formData.kbcThemes.includes(opt)}
                            onChange={(e) => handleCheckbox(e, 'kbcThemes')}
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-400 bg-white transition-all checked:border-emerald-600 checked:bg-emerald-600"
                          />
                          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                  <InputGroup label="Materi Insersi KBC (Kontekstual & Aksi Nyata)">
                    <textarea
                      name="insertionMaterial"
                      rows={4}
                      value={formData.insertionMaterial}
                      onChange={handleChange}
                      className={TEXTAREA_CLASS}
                      placeholder="Otomatis jika kosong"
                    />
                  </InputGroup>
                </div>
              </div>
            )}

            {activeTab === 'identifikasi' && (
              <div className="space-y-6">
                <InputGroup
                  label="Identifikasi Peserta Didik"
                  hint="Kesiapan, minat, latar belakang"
                >
                  <textarea
                    name="studentId"
                    rows={4}
                    value={formData.studentId}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                    placeholder="Contoh: Siswa aktif, gaya belajar kinestetik..."
                  />
                </InputGroup>
                <InputGroup
                  label="Analisis Materi Pelajaran"
                  hint="Jenis pengetahuan, relevansi"
                >
                  <textarea
                    name="materialAnalysis"
                    rows={4}
                    value={formData.materialAnalysis}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                    placeholder="Contoh: Materi Fiqih Ibadah..."
                  />
                </InputGroup>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <h3 className="text-gray-800 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                    <GraduationCap size={16} /> Dimensi Profil Lulusan
                  </h3>
                  <div className="space-y-2">
                    {dplOptions.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-start gap-3 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            value={opt}
                            checked={formData.dpl.includes(opt)}
                            onChange={(e) => handleCheckbox(e, 'dpl')}
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-400 bg-white transition-all checked:border-emerald-600 checked:bg-emerald-600"
                          />
                          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'desain' && (
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-700 mb-2 flex gap-2">
                  <Wand2 size={16} className="mt-0.5 text-blue-500" />
                  Bagian yang dikosongkan akan diisi otomatis dengan metode yang disesuaikan.
                </div>
                <InputGroup label="Capaian Pembelajaran (CP)">
                  <textarea
                    name="cp"
                    rows={3}
                    value={formData.cp}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                  />
                </InputGroup>
                <InputGroup label="Lintas Disiplin Ilmu">
                  <input
                    type="text"
                    name="crossDiscipline"
                    value={formData.crossDiscipline}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                    placeholder="Kosongkan untuk otomatis..."
                  />
                </InputGroup>
                <InputGroup label="Tujuan Pembelajaran (TP)">
                  <textarea
                    name="tp"
                    rows={3}
                    value={formData.tp}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                    placeholder="Kosongkan untuk otomatis..."
                  />
                </InputGroup>
                <InputGroup label="Topik Pembelajaran">
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                  />
                </InputGroup>
                <InputGroup label="Praktik Pedagogis">
                  <textarea
                    name="pedagogy"
                    rows={2}
                    value={formData.pedagogy}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                    placeholder="Contoh: Role Playing, PBL..."
                  />
                </InputGroup>
                <InputGroup label="Kemitraan Pembelajaran">
                  <input
                    type="text"
                    name="partnership"
                    value={formData.partnership}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                  />
                </InputGroup>
                <InputGroup label="Lingkungan Pembelajaran">
                  <input
                    type="text"
                    name="environment"
                    value={formData.environment}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                  />
                </InputGroup>
                <InputGroup label="Pemanfaatan Digital">
                  <textarea
                    name="digital"
                    rows={3}
                    value={formData.digital}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                    placeholder="Contoh: Quizizz, Video..."
                  />
                </InputGroup>

                <div className="border-t border-slate-700 pt-4">
                  <h3 className="font-bold text-slate-200 mb-3">Gambar Materi (Opsional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Upload Gambar Materi" hint="agar ikut di Word">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className={INPUT_CLASS}
                      />
                    </InputGroup>
                    <InputGroup label="URL Gambar Materi" hint="klik Konversi">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="materialImageUrl"
                          value={formData.materialImageUrl}
                          onChange={handleChange}
                          className={INPUT_CLASS}
                          placeholder="https://.../gambar.png"
                        />
                        <button
                          type="button"
                          onClick={convertImageUrlToDataUrl}
                          className="px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
                          title="Ambil gambar dari URL dan ubah menjadi data URL"
                        >
                          Konversi
                        </button>
                      </div>
                    </InputGroup>
                  </div>

                  <InputGroup label="Caption Gambar" hint="judul singkat">
                    <input
                      type="text"
                      name="materialImageCaption"
                      value={formData.materialImageCaption}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                      placeholder="Ilustrasi materi: ..."
                    />
                  </InputGroup>

                  {formData.materialImageDataUrl ? (
                    <div className="mt-3 bg-slate-900/40 border border-slate-700 rounded-lg p-3">
                      <div className="text-xs text-slate-300 font-semibold mb-2">Preview Gambar</div>
                      <img
                        src={formData.materialImageDataUrl}
                        alt={formData.materialImageCaption || 'Gambar Materi'}
                        style={{ maxWidth: '240px', height: 'auto', border: '1px solid #444' }}
                      />
                      <div className="text-xs text-slate-300 mt-2 italic">
                        {formData.materialImageCaption || '—'}
                      </div>
                    </div>
                  ) : null}
                </div>

                {Number(formData.meetingCount || 1) > 1 ? (
                  <div className="border-t border-slate-700 pt-4">
                    <h3 className="font-bold text-slate-200 mb-3">Rencana Pertemuan (Ringkas)</h3>
                    <div className="space-y-4">
                      {ensureMeetings(formData.meetingCount || 1, formData.meetings, formData).map(
                        (m, idx) => (
                          <div
                            key={`${idx}-${m.title}`}
                            className="bg-slate-900/30 border border-slate-700 rounded-lg p-4"
                          >
                            <div className="font-semibold text-slate-200 mb-3">{m.title}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputGroup label="Alokasi (menit)">
                                <input
                                  type="text"
                                  value={m.allocation}
                                  onChange={(e) =>
                                    handleMeetingFieldChange(idx, 'allocation', e.target.value)
                                  }
                                  className={INPUT_CLASS}
                                  placeholder="Contoh: 45 Menit"
                                />
                              </InputGroup>
                              <InputGroup label="Fokus Materi">
                                <input
                                  type="text"
                                  value={m.focus}
                                  onChange={(e) =>
                                    handleMeetingFieldChange(idx, 'focus', e.target.value)
                                  }
                                  className={INPUT_CLASS}
                                />
                              </InputGroup>
                            </div>
                            <div className="mt-3">
                              <InputGroup label="Tujuan Pertemuan">
                                <textarea
                                  rows={2}
                                  value={m.objectives}
                                  onChange={(e) =>
                                    handleMeetingFieldChange(idx, 'objectives', e.target.value)
                                  }
                                  className={TEXTAREA_CLASS}
                                />
                              </InputGroup>
                            </div>
                            <div className="mt-3">
                              <InputGroup label="Asesmen Pertemuan">
                                <textarea
                                  rows={2}
                                  value={m.assessment}
                                  onChange={(e) =>
                                    handleMeetingFieldChange(idx, 'assessment', e.target.value)
                                  }
                                  className={TEXTAREA_CLASS}
                                />
                              </InputGroup>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === 'langkah' && (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex gap-2">
                  <Wand2 size={20} className="mt-0.5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <strong>Fitur Otomatis:</strong> Kosongkan bagian ini jika ingin sistem
                    membuatkan skenario pembelajaran yang dilengkapi dengan rekomendasi
                    <strong> [Image]</strong>.
                  </div>
                </div>
                <InputGroup label="AWAL (Pembuka)">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        Alokasi Tahap Awal
                      </label>
                      <input
                        type="text"
                        name="timeInitial"
                        value={formData.timeInitial}
                        onChange={handleChange}
                        className={INPUT_CLASS}
                        placeholder="Contoh: 10 Menit"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        Alokasi Tahap Inti
                      </label>
                      <input
                        type="text"
                        name="timeCore"
                        value={formData.timeCore}
                        onChange={handleChange}
                        className={INPUT_CLASS}
                        placeholder="Contoh: 50 Menit"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        Alokasi Tahap Penutup
                      </label>
                      <input
                        type="text"
                        name="timeClosing"
                        value={formData.timeClosing}
                        onChange={handleChange}
                        className={INPUT_CLASS}
                        placeholder="Contoh: 10 Menit"
                      />
                    </div>
                  </div>
                  <textarea
                    name="stepInitial"
                    rows={4}
                    value={formData.stepInitial}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                    placeholder="(Otomatis terisi jika kosong) Kegiatan pembuka..."
                  />
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Makna Pembelajaran (Mindful, Meaningful, Joyful)
                    </label>
                    <textarea
                      name="meaningInitial"
                      rows={2}
                      value={formData.meaningInitial}
                      onChange={handleChange}
                      className={TEXTAREA_CLASS}
                      placeholder="(Otomatis) Makna tahap awal..."
                    />
                  </div>
                </InputGroup>
                <div className="border-t border-slate-700 pt-4">
                  <h3 className="font-bold text-slate-200 mb-4">INTI (Deep Learning)</h3>
                  <div className="space-y-4 pl-4 border-l-2 border-teal-500/30">
                    <InputGroup label="1. Memahami">
                      <textarea
                        name="stepCoreUnderstand"
                        rows={4}
                        value={formData.stepCoreUnderstand}
                        onChange={handleChange}
                        className={TEXTAREA_CLASS}
                        placeholder="(Otomatis terisi jika kosong) Kegiatan memahami..."
                      />
                    </InputGroup>
                    <InputGroup label="2. Mengaplikasi">
                      <textarea
                        name="stepCoreApply"
                        rows={4}
                        value={formData.stepCoreApply}
                        onChange={handleChange}
                        className={TEXTAREA_CLASS}
                        placeholder="(Otomatis terisi jika kosong) Kegiatan aplikasi..."
                      />
                    </InputGroup>
                    <InputGroup label="3. Merefleksi">
                      <textarea
                        name="stepCoreReflect"
                        rows={4}
                        value={formData.stepCoreReflect}
                        onChange={handleChange}
                        className={TEXTAREA_CLASS}
                        placeholder="(Otomatis terisi jika kosong) Kegiatan refleksi..."
                      />
                    </InputGroup>
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        Makna Pembelajaran Tahap Inti (Mindful, Meaningful, Joyful)
                      </label>
                      <textarea
                        name="meaningCore"
                        rows={3}
                        value={formData.meaningCore}
                        onChange={handleChange}
                        className={TEXTAREA_CLASS}
                        placeholder="(Otomatis) Makna tahap inti..."
                      />
                    </div>
                  </div>
                </div>
                <InputGroup label="PENUTUP">
                  <textarea
                    name="stepClosing"
                    rows={3}
                    value={formData.stepClosing}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                    placeholder="(Otomatis terisi jika kosong) Kegiatan penutup..."
                  />
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Makna Pembelajaran Tahap Penutup
                    </label>
                    <textarea
                      name="meaningClosing"
                      rows={2}
                      value={formData.meaningClosing}
                      onChange={handleChange}
                      className={TEXTAREA_CLASS}
                      placeholder="(Otomatis) Makna tahap penutup..."
                    />
                  </div>
                </InputGroup>
              </div>
            )}

            {activeTab === 'asesmen' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-700 mb-2 flex gap-2">
                  <TableIcon size={16} className="mt-0.5 text-blue-500" />
                  Selain deskripsi, sistem akan otomatis melampirkan
                  <strong> Tabel Instrumen Penilaian (Sikap, Pengetahuan, Keterampilan)</strong> pada
                  dokumen akhir.
                </div>
                <InputGroup label="Asesmen Awal">
                  <textarea
                    name="assessmentInitial"
                    rows={3}
                    value={formData.assessmentInitial}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                    placeholder="Deskripsi asesmen awal..."
                  />
                </InputGroup>
                <InputGroup label="Asesmen Proses">
                  <textarea
                    name="assessmentProcess"
                    rows={3}
                    value={formData.assessmentProcess}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                    placeholder="Deskripsi asesmen proses..."
                  />
                </InputGroup>
                <InputGroup label="Asesmen Akhir">
                  <textarea
                    name="assessmentFinal"
                    rows={3}
                    value={formData.assessmentFinal}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                    placeholder="Deskripsi asesmen akhir..."
                  />
                </InputGroup>

                <div className="border-t border-slate-700 pt-4">
                  <h3 className="font-bold text-slate-200 mb-3">Refleksi Mendalam (Mindful, Meaningful, Joyful)</h3>
                  <InputGroup label="Meaningful (Bermakna)">
                    <textarea
                      name="reflectionMeaningful"
                      rows={3}
                      value={formData.reflectionMeaningful}
                      onChange={handleChange}
                      className={TEXTAREA_CLASS}
                      placeholder="(Otomatis) Penjelasan meaningful..."
                    />
                  </InputGroup>
                  <InputGroup label="Mindful (Berkesadaran)">
                    <textarea
                      name="reflectionMindful"
                      rows={3}
                      value={formData.reflectionMindful}
                      onChange={handleChange}
                      className={TEXTAREA_CLASS}
                      placeholder="(Otomatis) Penjelasan mindful..."
                    />
                  </InputGroup>
                  <InputGroup label="Joyful (Menggembirakan)">
                    <textarea
                      name="reflectionJoyful"
                      rows={3}
                      value={formData.reflectionJoyful}
                      onChange={handleChange}
                      className={TEXTAREA_CLASS}
                      placeholder="(Otomatis) Penjelasan joyful..."
                    />
                  </InputGroup>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyusun Dokumen...
                    </span>
                  ) : (
                    <>
                      <Sparkles size={20} className="text-yellow-200" />
                      <span className="tracking-wide">Buat RPP / Modul Ajar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        <section
          id="preview-section"
          className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col"
        >
          <div className="preview-header bg-gray-50 rounded-t-xl p-4 flex items-center justify-between border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-emerald-600" />
              Pratinjau Dokumen
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={printPDF}
                className="flex items-center gap-2 bg-gray-800 text-white hover:bg-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                title="Cetak atau Simpan sebagai PDF"
              >
                <Printer size={16} /> <span className="hidden sm:inline">PDF / Cetak</span>
              </button>
              <button
                type="button"
                onClick={exportToWord}
                disabled={!result}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download file .doc yang rapi"
              >
                <Download size={16} /> <span className="hidden sm:inline">Word</span>
              </button>
            </div>
          </div>

          <div className="flex-grow bg-slate-800/50 p-4 md:p-5 overflow-hidden overflow-y-auto">
            <div
              id="document-content"
              className="bg-white text-black w-full min-h-[900px] shadow-2xl mx-auto p-8 md:p-10 font-serif text-[11pt] leading-relaxed"
            >
              {!result ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <Layout size={64} className="mb-4 text-slate-300" />
                  <p className="text-center">
                    Isi formulir di sebelah kiri untuk
                    <br />
                    melihat hasil Modul Ajar di sini.
                  </p>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                      borderBottom: '2px solid black',
                      paddingBottom: '8px',
                    }}
                  >
                    <img
                      src={absoluteLogoUrl}
                      alt="Logo Kemenag"
                      style={{ width: '70px', height: '70px', marginRight: '16px' }}
                    />
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <div
                        style={{
                          fontFamily: '"Times New Roman", serif',
                          fontSize: '12pt',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        KEMENTERIAN AGAMA REPUBLIK INDONESIA
                      </div>
                      <div
                        style={{
                          fontFamily: '"Times New Roman", serif',
                          fontSize: '14pt',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        MADRASAH ALIYAH NEGERI BANGGAI
                      </div>
                      <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>
                        Jl. Pulau Irian RT 004 RW 006 Kel. Kompo, Kec. Luwuk Selatan
                      </div>
                      <div style={{ fontSize: '9pt' }}>
                        Website: man1banggai.sch.id 
                      </div>
                    </div>
                  </div>

                  <div
                    className="title"
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '13.5pt',
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      lineHeight: 1.25,
                    }}
                  >
                    RENCANA PELAKSANAAN PEMBELAJARAN (RPP) MENDALAM
                    <br />
                    DAN INSERSI KURIKULUM BERBASIS CINTA (KBC)
                  </div>

                  <table className="no-border-table">
                    <tbody>
                      <tr>
                        <td style={{ width: '200px', fontWeight: 'bold' }}>Sekolah/Madrasah</td>
                        <td>: {result.school}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Jenjang</td>
                        <td>: {result.jenjang || '-'}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Mata Pelajaran</td>
                        <td>: {result.subject}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Materi Pokok</td>
                        <td>: {result.material}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Fase/Kelas</td>
                        <td>
                          : {result.phase} / {result.grade}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Semester</td>
                        <td>: {result.semester}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Alokasi Waktu</td>
                        <td>: {result.timeAllocation}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Jumlah Pertemuan</td>
                        <td>: {result.meetingCount || 1}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Tahun Pelajaran</td>
                        <td>: {result.year}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Tema KBC</td>
                        <td>: {result.kbcThemes.join(', ')}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Materi Insersi KBC</td>
                        <td style={{ whiteSpace: 'pre-wrap' }}>: {result.insertionMaterial}</td>
                      </tr>
                    </tbody>
                  </table>

                  <SectionHeader title="I. IDENTIFIKASI" />
                  <ContentBox title="Karakteristik Peserta Didik">{result.studentId}</ContentBox>
                  <ContentBox title="Materi Pembelajaran">{result.materialAnalysis}</ContentBox>
                  <p className="font-bold mb-1">Dimensi Profil Lulusan:</p>
                  <ul className="list-disc ml-5 mb-4">
                    {result.dpl.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>

                  <SectionHeader title="II. DESAIN PEMBELAJARAN" />
                  <ContentBox title="Capaian Pembelajaran (CP)">{result.cp}</ContentBox>
                  <ContentBox title="Topik Pembelajaran">{result.topic}</ContentBox>
                  <ContentBox title="Tujuan Pembelajaran (TP)">{result.tp}</ContentBox>

                  {result.materialImageDataUrl ? (
                    <div className="mb-3">
                      <p className="font-bold mb-1">Gambar Materi:</p>
                      <div>
                        <img
                          src={result.materialImageDataUrl}
                          alt={result.materialImageCaption || 'Gambar Materi'}
                          style={{ maxWidth: '280px', height: 'auto', border: '1px solid black' }}
                        />
                        <div style={{ fontSize: '10pt', fontStyle: 'italic', marginTop: '4px' }}>
                          {result.materialImageCaption || ''}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {Number(result.meetingCount || 1) > 1 && Array.isArray(result.meetings) ? (
                    <div className="mb-4">
                      <p className="font-bold mb-2">Rencana Pembelajaran per Pertemuan (Ringkas):</p>
                      <table className="border-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f9f9f9' }}>
                            <th style={{ border: '1px solid black', padding: '6px', width: '16%' }}>Pertemuan</th>
                            <th style={{ border: '1px solid black', padding: '6px', width: '14%' }}>Alokasi</th>
                            <th style={{ border: '1px solid black', padding: '6px' }}>Fokus Materi</th>
                            <th style={{ border: '1px solid black', padding: '6px' }}>Tujuan</th>
                            <th style={{ border: '1px solid black', padding: '6px', width: '22%' }}>Asesmen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.meetings.map((m, idx) => (
                            <tr key={`${idx}-${m.title || 'ptm'}`}>
                              <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>
                                {m.title || `Pertemuan ${idx + 1}`}
                              </td>
                              <td style={{ border: '1px solid black', padding: '6px' }}>{m.allocation || '-'}</td>
                              <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                                {m.focus || '-'}
                              </td>
                              <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                                {m.objectives || '-'}
                              </td>
                              <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                                {m.assessment || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  <ContentBox title="Lintas Disiplin Ilmu">{result.crossDiscipline}</ContentBox>
                  <ContentBox title="Praktik Pedagogis (Model Pembelajaran)">{result.pedagogy}</ContentBox>
                  <ContentBox title="Lingkungan Pembelajaran">{result.environment}</ContentBox>
                  <ContentBox title="Pemanfaatan Digital">{result.digital}</ContentBox>
                  <ContentBox title="Kemitraan Pembelajaran">{result.partnership}</ContentBox>

                  <SectionHeader title="III. PENGALAMAN BELAJAR (PEDATTI)" />
                  <table className="border-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9f9f9' }}>
                        <th style={{ border: '1px solid black', padding: '6px', width: '18%' }}>Tahap</th>
                        <th style={{ border: '1px solid black', padding: '6px', width: '14%' }}>Alokasi</th>
                        <th style={{ border: '1px solid black', padding: '6px' }}>
                          Aktivitas Pembelajaran Interaktif & Inovatif
                        </th>
                        <th style={{ border: '1px solid black', padding: '6px', width: '26%' }}>
                          Makna Pembelajaran (Mindful, Meaningful, Joyful)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>
                          Tahap Awal (Pendahuluan)
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px' }}>{result.timeInitial}</td>
                        <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                          {result.stepInitial}
                          {result.materialImageDataUrl ? (
                            <div style={{ marginTop: '10px' }}>
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                Media Visual:
                              </div>
                              <img
                                src={result.materialImageDataUrl}
                                alt={result.materialImageCaption || 'Gambar Materi'}
                                style={{ maxWidth: '260px', height: 'auto', border: '1px solid black' }}
                              />
                              {result.materialImageCaption ? (
                                <div style={{ fontSize: '10pt', fontStyle: 'italic', marginTop: '4px' }}>
                                  {result.materialImageCaption}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                          {result.meaningInitial}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>
                          Tahap Inti (Dalami, Terapkan, Tularkan)
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px' }}>{result.timeCore}</td>
                        <td style={{ border: '1px solid black', padding: '6px' }}>
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>DALAMI (Memahami)</p>
                            {result.stepCoreUnderstand}
                            {result.materialImageDataUrl ? (
                              <div style={{ marginTop: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                  Media Visual (Pendalaman):
                                </div>
                                <img
                                  src={result.materialImageDataUrl}
                                  alt={result.materialImageCaption || 'Gambar Materi'}
                                  style={{ maxWidth: '260px', height: 'auto', border: '1px solid black' }}
                                />
                              </div>
                            ) : null}
                            <p style={{ fontWeight: 'bold', margin: '8px 0 4px' }}>TERAPKAN (Mengaplikasi)</p>
                            {result.stepCoreApply}
                            <p style={{ fontWeight: 'bold', margin: '8px 0 4px' }}>TULARKAN (Merefleksi)</p>
                            {result.stepCoreReflect}
                          </div>
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                          {result.meaningCore}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>
                          Tahap Penutup (Inovasi & Asesmen Akhir)
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px' }}>{result.timeClosing}</td>
                        <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                          {result.stepClosing}
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                          {result.meaningClosing}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <SectionHeader title="IV. ASESMEN PEMBELAJARAN" />
                  <table className="border-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9f9f9' }}>
                        <th style={{ border: '1px solid black', padding: '6px', width: '25%' }}>
                          Jenis Asesmen
                        </th>
                        <th style={{ border: '1px solid black', padding: '6px' }}>Bentuk Instrumen</th>
                        <th style={{ border: '1px solid black', padding: '6px', width: '30%' }}>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>
                          Awal Pembelajaran (Diagnostik)
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                          {result.assessmentInitial}
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px' }}>
                          Mengukur pengetahuan awal dan kesiapan belajar.
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>
                          Proses Pembelajaran (Formatif)
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                          {result.assessmentProcess}
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px' }}>
                          Menilai proses: kolaborasi, penalaran kritis, dan komunikasi.
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>
                          Akhir Pembelajaran (Sumatif)
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                          {result.assessmentFinal}
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px' }}>
                          Mengukur pemahaman inti dan komitmen penerapan insersi KBC.
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <SectionHeader title="V. REFLEKSI MENDALAM (Mindful, Meaningful, Joyful)" />
                  <table className="border-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9f9f9' }}>
                        <th style={{ border: '1px solid black', padding: '6px', width: '28%' }}>Dimensi</th>
                        <th style={{ border: '1px solid black', padding: '6px' }}>Penjelasan dalam RPP ini</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>
                          Meaningful (Bermakna)
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                          {result.reflectionMeaningful}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>
                          Mindful (Berkesadaran)
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                          {result.reflectionMindful}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>
                          Joyful (Menggembirakan)
                        </td>
                        <td style={{ border: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>
                          {result.reflectionJoyful}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div
                    className="page-break"
                    style={{ marginTop: '30px', pageBreakBefore: 'always' }}
                  >
                    <div
                      className="section-title text-center"
                      style={{
                        fontWeight: 'bold',
                        border: '1px solid black',
                        backgroundColor: '#eee',
                        padding: '5px',
                        marginBottom: '15px',
                      }}
                    >
                      LAMPIRAN INSTRUMEN PENILAIAN
                    </div>

                    <p className="font-bold mt-4">1. Rubrik Penilaian Sikap (Observasi)</p>
                    <table
                      className="border-table"
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: '5px',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#f9f9f9' }}>
                          <th style={{ border: '1px solid black', padding: '5px', width: '5%' }}>
                            No
                          </th>
                          <th
                            style={{ border: '1px solid black', padding: '5px', width: '30%' }}
                          >
                            Nama Siswa
                          </th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>
                            Aspek 1: Beriman
                          </th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>
                            Aspek 2: Jujur
                          </th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>
                            Aspek 3: Santun
                          </th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>
                            Total Skor
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4, 5].map((row) => (
                          <tr key={row}>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '15px',
                                textAlign: 'center',
                              }}
                            >
                              {row}
                            </td>
                            <td
                              style={{ border: '1px solid black', padding: '15px' }}
                            />
                            <td
                              style={{ border: '1px solid black', padding: '15px' }}
                            />
                            <td
                              style={{ border: '1px solid black', padding: '15px' }}
                            />
                            <td
                              style={{ border: '1px solid black', padding: '15px' }}
                            />
                            <td
                              style={{ border: '1px solid black', padding: '15px' }}
                            />
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <p className="font-bold mt-4">2. Instrumen Penilaian Pengetahuan</p>
                    <table
                      className="border-table"
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: '5px',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#f9f9f9' }}>
                          <th style={{ border: '1px solid black', padding: '5px', width: '5%' }}>
                            No
                          </th>
                          <th
                            style={{ border: '1px solid black', padding: '5px', width: '60%' }}
                          >
                            Soal / Indikator
                          </th>
                          <th
                            style={{ border: '1px solid black', padding: '5px', width: '20%' }}
                          >
                            Kunci Jawaban
                          </th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>
                            Skor (1-10)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td
                            style={{
                              border: '1px solid black',
                              padding: '10px',
                              textAlign: 'center',
                            }}
                          >
                            1
                          </td>
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          >
                            Jelaskan pengertian dari {result.topic || 'topik ini'}?
                          </td>
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          >
                            Terlampir
                          </td>
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          />
                        </tr>
                        <tr>
                          <td
                            style={{
                              border: '1px solid black',
                              padding: '10px',
                              textAlign: 'center',
                            }}
                          >
                            2
                          </td>
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          >
                            Bagaimana cara menerapkan nilai KBC dalam materi ini?
                          </td>
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          >
                            Terlampir
                          </td>
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          />
                        </tr>
                      </tbody>
                    </table>

                    <p className="font-bold mt-4">
                      3. Rubrik Penilaian Keterampilan (Presentasi/Produk)
                    </p>
                    <table
                      className="border-table"
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: '5px',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#f9f9f9' }}>
                          <th style={{ border: '1px solid black', padding: '5px', width: '5%' }}>
                            No
                          </th>
                          <th
                            style={{ border: '1px solid black', padding: '5px', width: '25%' }}
                          >
                            Aspek yang Dinilai
                          </th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>
                            Sangat Baik (4)
                          </th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>
                            Baik (3)
                          </th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>
                            Cukup (2)
                          </th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>
                            Kurang (1)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td
                            style={{
                              border: '1px solid black',
                              padding: '10px',
                              textAlign: 'center',
                            }}
                          >
                            1
                          </td>
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          >
                            Penguasaan Materi
                          </td>
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          />
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          />
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          />
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          />
                        </tr>
                        <tr>
                          <td
                            style={{
                              border: '1px solid black',
                              padding: '10px',
                              textAlign: 'center',
                            }}
                          >
                            2
                          </td>
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          >
                            Kreativitas Penyajian
                          </td>
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          />
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          />
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          />
                          <td
                            style={{ border: '1px solid black', padding: '10px' }}
                          />
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <table
                    className="signature-table"
                    style={{ width: '100%', marginTop: '40px', border: 'none' }}
                  >
                    <tbody>
                      <tr>
                        <td
                          style={{
                            width: '50%',
                            textAlign: 'center',
                            border: 'none',
                          }}
                        >
                          Mengetahui,
                          <br />
                          Kepala Madrasah
                          <br />
                          <br />
                          <br />
                          <br />
                          <br />
                          <span
                            style={{
                              fontWeight: 'bold',
                              textDecoration: 'underline',
                            }}
                          >
                            {result.headMaster}
                          </span>
                          <br />
                          NIP. {result.nipHead}
                        </td>
                        <td
                          style={{
                            width: '50%',
                            textAlign: 'center',
                            border: 'none',
                          }}
                        >
                          {result.city},{' '}
                          {new Date().toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                          <br />
                          Guru Mata Pelajaran
                          <br />
                          <br />
                          <br />
                          <br />
                          <br />
                          <span
                            style={{
                              fontWeight: 'bold',
                              textDecoration: 'underline',
                            }}
                          >
                            {result.author}
                          </span>
                          <br />
                          NIP. {result.nipTeacher}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const InputGroup = ({ label, hint, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
      {label}{' '}
      {hint && (
        <span className="normal-case font-normal text-slate-500 ml-2 italic">
          ({hint})
        </span>
      )}
    </label>
    {children}
  </div>
);

const SectionHeader = ({ title }) => (
  <div
    className="section-title"
    style={{
      fontWeight: 'bold',
      backgroundColor: '#eee',
      border: '1px solid black',
      padding: '5px',
      marginTop: '15px',
      marginBottom: '10px',
    }}
  >
    {title}
  </div>
);

const ContentBox = ({ title, children }) => (
  <div className="mb-3">
    <p className="font-bold mb-1">{title}:</p>
    <div className="text-justify whitespace-pre-wrap">
      {children || '................................................................'}
    </div>
  </div>
);

export default RppModulAjar;
