<?php
// Data mockup SIM-AKAD (bisa diganti database MySQL nantinya)

$USERS = [
    [
        'username' => 'admin',
        'password' => 'admin123', // catatan: untuk produksi wajib di-hash
        'role' => 'admin',
        'name' => 'Admin SIM-AKAD',
    ],
    // Akun guru demo utama
    [
        'username' => 'akad1',
        'password' => 'akad1',
        'role' => 'guru',
        'name' => 'Muhammad Basri, S.Pd., M.Pd',
    ],
    // Tambahan akun guru 02 - 50 (username & password sama untuk memudahkan distribusi)
    [
        'username' => 'akad2',
        'password' => 'akad2',
        'role' => 'guru',
        'name' => 'Hasran S. Abadja, S.Ag., MH',
    ],
    [
        'username' => 'akad3',
        'password' => 'akad3',
        'role' => 'guru',
        'name' => 'Muhammad Yusuf, S.Pd.I',
    ],
    [
        'username' => 'akad4',
        'password' => 'akad4',
        'role' => 'guru',
        'name' => 'Sukriadi, S.Pd.I',
    ],
    [
        'username' => 'akad5',
        'password' => 'akad5',
        'role' => 'guru',
        'name' => 'Ika Rahayu, S.Pd',
    ],
    [
        'username' => 'akad6',
        'password' => 'akad6',
        'role' => 'guru',
        'name' => 'Fandi Idham, S.Pd.I',
    ],
    [
        'username' => 'akad7',
        'password' => 'akad7',
        'role' => 'guru',
        'name' => 'Eko Purwanto, S.Q',
    ],
    [
        'username' => 'akad8',
        'password' => 'akad8',
        'role' => 'guru',
        'name' => 'Sudirman Madukalang, S.Pd.I',
    ],
    [
        'username' => 'akad9',
        'password' => 'akad9',
        'role' => 'guru',
        'name' => 'Harun Mauke, S.Pd.I',
    ],
    [
        'username' => 'akad10',
        'password' => 'akad10',
        'role' => 'guru',
        'name' => 'Idhar Ladjihan, S.Pd.I',
    ],
    [
        'username' => 'akad11',
        'password' => 'akad11',
        'role' => 'guru',
        'name' => 'Farha, S.Pd.I',
    ],
    [
        'username' => 'akad12',
        'password' => 'akad12',
        'role' => 'guru',
        'name' => 'Lisanwati Hamzah, S.Pd.I',
    ],
    [
        'username' => 'akad13',
        'password' => 'akad13',
        'role' => 'guru',
        'name' => 'Lilik Yulianti, S.Pd.I',
    ],
    [
        'username' => 'akad14',
        'password' => 'akad14',
        'role' => 'guru',
        'name' => 'Habsyiah Alhabsyi, S.Pd.',
    ],
    [
        'username' => 'akad15',
        'password' => 'akad15',
        'role' => 'guru',
        'name' => 'Abdul Razak, S.Pd',
    ],
    [
        'username' => 'akad16',
        'password' => 'akad16',
        'role' => 'guru',
        'name' => 'H. Awaluddin, S.Pd',
    ],
    [
        'username' => 'akad17',
        'password' => 'akad17',
        'role' => 'guru',
        'name' => 'Hj. Siti Aisyah, S.S., M.Pd',
    ],
    [
        'username' => 'akad18',
        'password' => 'akad18',
        'role' => 'guru',
        'name' => 'Wiwik Widyawati, S.Pd',
    ],
    [
        'username' => 'akad19',
        'password' => 'akad19',
        'role' => 'guru',
        'name' => 'Nur Aini Labani, S.Pd',
    ],
    [
        'username' => 'akad20',
        'password' => 'akad20',
        'role' => 'guru',
        'name' => 'Claudia Arivana, S.Pd',
    ],
    [
        'username' => 'akad21',
        'password' => 'akad21',
        'role' => 'guru',
        'name' => 'Flirtah Halim, S.Pd',
    ],
    [
        'username' => 'akad22',
        'password' => 'akad22',
        'role' => 'guru',
        'name' => 'Yusra Abdullah, S.Pd',
    ],
    [
        'username' => 'akad23',
        'password' => 'akad23',
        'role' => 'guru',
        'name' => 'Nur’aisa, S.Pd',
    ],
    [
        'username' => 'akad24',
        'password' => 'akad24',
        'role' => 'guru',
        'name' => 'Betty Ardianrini, S.Si',
    ],
    [
        'username' => 'akad25',
        'password' => 'akad25',
        'role' => 'guru',
        'name' => 'Nurahnun, S.Pd',
    ],
    [
        'username' => 'akad26',
        'password' => 'akad26',
        'role' => 'guru',
        'name' => 'Reni Wirawati Hasan, S.Pd',
    ],
    [
        'username' => 'akad27',
        'password' => 'akad27',
        'role' => 'guru',
        'name' => 'Hartati, S.Pd.I',
    ],
    [
        'username' => 'akad28',
        'password' => 'akad28',
        'role' => 'guru',
        'name' => 'Ferry Tjahya Kusnadi, S.Pd',
    ],
    [
        'username' => 'akad29',
        'password' => 'akad29',
        'role' => 'guru',
        'name' => 'Arlina Mointi, S.Pd',
    ],
    [
        'username' => 'akad30',
        'password' => 'akad30',
        'role' => 'guru',
        'name' => 'Hj. Mariani Mustamin, S.Pd',
    ],
    [
        'username' => 'akad31',
        'password' => 'akad31',
        'role' => 'guru',
        'name' => 'Karsia Malotes, S.Pd',
    ],
    [
        'username' => 'akad32',
        'password' => 'akad32',
        'role' => 'guru',
        'name' => 'Ramlan Labay, S.Pd., M.Pd',
    ],
    [
        'username' => 'akad33',
        'password' => 'akad33',
        'role' => 'guru',
        'name' => 'Ibrahim, S.Pd',
    ],
    [
        'username' => 'akad34',
        'password' => 'akad34',
        'role' => 'guru',
        'name' => 'Rizal, S.Pd',
    ],
    [
        'username' => 'akad35',
        'password' => 'akad35',
        'role' => 'guru',
        'name' => 'Abd. Manan M. Usman, S.Pd.I',
    ],
    [
        'username' => 'akad36',
        'password' => 'akad36',
        'role' => 'guru',
        'name' => 'Nurhaeda, S.Pd',
    ],
    [
        'username' => 'akad37',
        'password' => 'akad37',
        'role' => 'guru',
        'name' => 'Nurialla MS. Mappa, S.Pd',
    ],
    [
        'username' => 'akad38',
        'password' => 'akad38',
        'role' => 'guru',
        'name' => 'Zikran Lawenga, S.Pd',
    ],
    [
        'username' => 'akad39',
        'password' => 'akad39',
        'role' => 'guru',
        'name' => 'Bukhori Fillalhi, S.Pd',
    ],
    [
        'username' => 'akad40',
        'password' => 'akad40',
        'role' => 'guru',
        'name' => 'Sandra Nova Praditha, S.Pd',
    ],
    [
        'username' => 'akad41',
        'password' => 'akad41',
        'role' => 'guru',
        'name' => 'Abdul Rahman S. Tatu, S.Pd',
    ],
    [
        'username' => 'akad42',
        'password' => 'akad42',
        'role' => 'guru',
        'name' => 'Muhammad Syawal, S.Pd',
    ],
    [
        'username' => 'akad43',
        'password' => 'akad43',
        'role' => 'guru',
        'name' => 'Ida Priati Matiro, S.Pd',
    ],
    [
        'username' => 'akad44',
        'password' => 'akad44',
        'role' => 'guru',
        'name' => 'Guru 44',
    ],
    [
        'username' => 'akad45',
        'password' => 'akad45',
        'role' => 'guru',
        'name' => 'Guru 45',
    ],
    [
        'username' => 'akad46',
        'password' => 'akad46',
        'role' => 'guru',
        'name' => 'Guru 46',
    ],
    [
        'username' => 'akad47',
        'password' => 'akad47',
        'role' => 'guru',
        'name' => 'Guru 47',
    ],
    [
        'username' => 'akad48',
        'password' => 'akad48',
        'role' => 'guru',
        'name' => 'Guru 48',
    ],
    [
        'username' => 'akad49',
        'password' => 'akad49',
        'role' => 'guru',
        'name' => 'Guru 49',
    ],
    [
        'username' => 'akad50',
        'password' => 'akad50',
        'role' => 'guru',
        'name' => 'Guru 50',
    ],
];

$STATS = [
    'guruTotal' => 45,
    'guruTelat' => 5,
    'modulAjarSiap' => 32,
    'siswaOmi' => 5,
    'siswaRemedial' => 12,
    'hariEfektif' => 48,
];

$TEACHERS = [
    [
        'id' => 1,
        'name' => 'Ahmad Fauzi, S.Pd',
        'mapel' => 'Matematika',
        'kehadiran' => 96,
        'modul' => 'Lengkap',
        'metode' => 'Diskusi, Problem Based Learning',
        'status' => 'Aman',
    ],
    [
        'id' => 2,
        'name' => 'Nur Aini, S.Pd.I',
        'mapel' => "Qur'an Hadis",
        'kehadiran' => 92,
        'modul' => 'Lengkap',
        'metode' => 'Tahfiz, Talaqqi, Mind Mapping',
        'status' => 'Aman',
    ],
    [
        'id' => 3,
        'name' => 'M. Rizal, S.Pd',
        'mapel' => 'Fisika',
        'kehadiran' => 84,
        'modul' => 'Belum Lengkap',
        'metode' => 'Eksperimen, Project Based Learning',
        'status' => 'Perlu Pembinaan',
    ],
    [
        'id' => 4,
        'name' => 'Siti Khadijah, S.Pd',
        'mapel' => 'Bahasa Indonesia',
        'kehadiran' => 88,
        'modul' => 'Lengkap',
        'metode' => 'Literasi, Diskusi Kelompok',
        'status' => 'Aman',
    ],
    [
        'id' => 5,
        'name' => 'Rahmat Hidayat, S.Pd',
        'mapel' => 'Sejarah Kebudayaan Islam',
        'kehadiran' => 79,
        'modul' => 'Belum Lengkap',
        'metode' => 'Ceramah Interaktif, Role Play',
        'status' => 'Perlu Pembinaan',
    ],
];

$AGENDA = [
    [
        'date' => '2-6 Januari 2026',
        'event' => 'Bedah KMA 1503 & Penyusunan Modul Ajar Genap',
        'type' => 'urgent',
    ],
    [
        'date' => '20-24 Januari 2026',
        'event' => 'Mulai Program Intensif Kelas XII',
        'type' => 'program',
    ],
    [
        'date' => '10-15 Februari 2026',
        'event' => 'Try Out Ujian Madrasah Berbasis CBT',
        'type' => 'exam',
    ],
    [
        'date' => '1 Maret 2026',
        'event' => 'Batas Akhir Pengumpulan Nilai Pengetahuan & Sikap',
        'type' => 'urgent',
    ],
    [
        'date' => '10-20 Maret 2026',
        'event' => 'Pelaksanaan Ujian Madrasah',
        'type' => 'exam',
    ],
    [
        'date' => 'Awal April 2026',
        'event' => 'Class Meeting & Pembinaan Karakter (KBC)',
        'type' => 'program',
    ],
];

$KMA1503 = [
    'ringkasan' => 'KMA Nomor 1503 Tahun 2025 memperkuat Pedoman Implementasi Kurikulum Madrasah dengan dua pijakan utama: Pembelajaran Mendalam dan Kurikulum Berbasis Cinta. Madrasah diminta menyesuaikan kurikulum, asesmen, muatan lokal, dan program pendampingan agar pembelajaran kontekstual, inklusif, dan berorientasi karakter.',
    'pancaCinta' => [
        'Cinta kepada Allah dan Rasul',
        'Cinta ilmu',
        'Cinta lingkungan',
        'Cinta diri dan sesama manusia',
        'Cinta tanah air',
    ],
    'pembelajaranMendalam' => [
        'Mindful (Berkesadaran): tujuan belajar jelas dan dimengerti siswa.',
        'Meaningful (Bermakna): materi dikaitkan dengan konteks nyata (kearifan lokal Banggai, mitigasi bencana, dll).',
        'Joyful (Menyenangkan): suasana belajar tidak menekan, menggunakan projek, diskusi, dan gamifikasi.',
    ],
    'checklistImplementasiCepat' => [
        'Bentuk Tim Kurikulum (wakamad, kepala, guru mapel inti, BK, komite).',
        'Lakukan sosialisasi internal ringkasan KMA 1503 kepada seluruh guru.',
        'Mapping kurikulum lama vs KMA 1503: muatan, jam pelajaran, asesmen, RPP.',
        'Revisi dokumen Kurikulum Madrasah dan buat contoh RPP Pembelajaran Mendalam.',
        'Susun dan jalankan pelatihan guru tentang Pembelajaran Mendalam & KBC.',
        'Pilot terbatas di beberapa kelas, kemudian evaluasi dan perluas.',
    ],
];
