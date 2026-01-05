// Database struktur tema dan opsi pembelajaran - EXPANDED VERSION
const learningDatabase = {
    "Aku Cinta Alam Ciptaan Allah": {
        pokok_bahasan: ["Asmaul Husna: Al-Rahman, Al-Wadud, Al-Karim", "Pelestarian Lingkungan sebagai Bentuk Syukur", "Ekosistem dan Keseimbangan Alam"],
        mapel_kolaboratif: ["PAI, IPAS, Bahasa Indonesia, Seni Budaya"],
        topik_kbc: ["Cinta Allah dan Rasul-Nya", "Cinta kepada Lingkungan (Ekosistem)"],
        profil_lulusan: ["Beriman dan Bertakwa", "Peduli Lingkungan", "Berpikir Kritis"],
        tujuan_pembelajaran: ["Memahami konsep kasih sayang Allah melalui ciptaan-Nya", "Menganalisis hubungan manusia dengan lingkungan dari perspektif spiritual", "Merancang solusi pelestarian lingkungan berbasis nilai-nilai keislaman", "Mengembangkan sikap tanggung jawab terhadap ciptaan Allah"],
        aktivitas_pembelajaran: ["Studi lapangan observasi ekosistem lokal", "Diskusi kelompok tentang Asmaul Husna dan alam", "Project konservasi sekolah", "Refleksi spiritual melalui journaling"],
        integrasi_kbc: ["Cinta kepada Allah melalui keindahan ciptaan-Nya", "Cinta kepada Lingkungan dengan aksi nyata", "Cinta kepada Masyarakat melalui edukasi lingkungan"],
        penilaian: ["Pengetahuan tentang pelestarian lingkungan", "Keterampilan merancang proyek konservasi", "Sikap komitmen terhadap program lingkungan", "Produk laporan dan dokumentasi", "Refleksi perubahan pribadi"]
    },
    "Bhineka Tunggal Ika": {
        pokok_bahasan: ["Kearifan Lokal dan Budaya Daerah", "Toleransi dan Keberagaman dalam Islam", "Persatuan dalam Perbedaan"],
        mapel_kolaboratif: ["PAI, PKn, Bahasa Indonesia, Seni Budaya, IPS"],
        topik_kbc: ["Mencintai Keragaman Budaya", "Persatuan dan Kesatuan"],
        profil_lulusan: ["Berkebhinekaan Global", "Bernalar Kritis", "Bergotong Royong"],
        tujuan_pembelajaran: ["Menghargai keberagaman budaya dan agama", "Memahami nilai-nilai kearifan lokal", "Menganalisis kehidupan multikultural", "Membangun kolaborasi antar budaya"],
        aktivitas_pembelajaran: ["Pameran budaya lokal", "Kolaborasi lintas budaya", "Proyek perayaan kebersamaan", "Wawancara tokoh masyarakat"],
        integrasi_kbc: ["Cinta kepada Masyarakat melalui keragaman", "Cinta kepada Diri dengan identitas plural", "Cinta kepada Allah melalui keberagaman"],
        penilaian: ["Pengetahuan tentang kearifan lokal", "Keterampilan komunikasi lintas budaya", "Sikap menghormati perbedaan", "Produk pameran budaya", "Refleksi pentingnya keragaman"]
    },
    "Bangunlah Jiwa dan Raganya": {
        pokok_bahasan: ["Kesehatan Jasmani dan Mental", "Pendidikan Jasmani dan Olahraga", "Kesejahteraan Integral Manusia"],
        mapel_kolaboratif: ["PAI, PJOK, IPA, BK, Bahasa Indonesia"],
        topik_kbc: ["Cinta kepada Diri Sendiri: Kesehatan dan Kesejahteraan", "Kepedulian terhadap Kesehatan Masyarakat"],
        profil_lulusan: ["Sehat Jasmani dan Rohani", "Mandiri", "Tanggung Jawab"],
        tujuan_pembelajaran: ["Memahami kesehatan jasmani-mental dari perspektif Islam", "Menganalisis faktor kesejahteraan pribadi", "Merancang gaya hidup sehat", "Mengembangkan keterampilan olahraga"],
        aktivitas_pembelajaran: ["Program wellness komprehensif", "Workshop kesehatan dan nutrisi", "Proyek personal wellness", "Peer education tentang kesehatan"],
        integrasi_kbc: ["Cinta kepada Diri menjaga kesehatan", "Cinta kepada Allah menjaga tubuh", "Cinta kepada Masyarakat berbagi kesehatan"],
        penilaian: ["Pengetahuan kesehatan holistik", "Keterampilan aktivitas fisik", "Sikap komitmen gaya hidup sehat", "Produk program wellness", "Refleksi perubahan gaya hidup"]
    },
    "Suara Demokrasi": {
        pokok_bahasan: ["Prinsip-prinsip Demokrasi dalam Islam", "Kepemimpinan dan Advokasi", "Partisipasi Aktif Warga Negara"],
        mapel_kolaboratif: ["PKn, PAI, Bahasa Indonesia, IPS"],
        topik_kbc: ["Kepemimpinan yang Amanah", "Tanggung Jawab Sosial dan Kewarganegaraan"],
        profil_lulusan: ["Bernalar Kritis", "Bergotong Royong", "Aktif Berpartisipasi"],
        tujuan_pembelajaran: ["Memahami demokrasi dari perspektif Islam", "Menganalisis isu sosial secara kritis", "Mengembangkan keterampilan advokasi", "Berpartisipasi dalam pengambilan keputusan"],
        aktivitas_pembelajaran: ["Debat dan forum diskusi", "Proyek civic engagement", "Kepemimpinan organisasi siswa", "Kampanye advokasi"],
        integrasi_kbc: ["Cinta kepada Allah dalam kepemimpinan", "Cinta kepada Masyarakat melalui advokasi", "Cinta kepada Negara"],
        penilaian: ["Pengetahuan demokrasi dan kepemimpinan", "Keterampilan argumentasi", "Sikap tanggung jawab", "Produk hasil kampanye", "Refleksi peran dalam demokrasi"]
    },
    "Gaya Hidup Berkelanjutan": {
        pokok_bahasan: ["Sustainable Development Goals (SDGs)", "Ekonomi Sirkular", "Konsumsi dan Produksi Berkelanjutan"],
        mapel_kolaboratif: ["IPAS, Ekonomi, Prakarya, PAI"],
        topik_kbc: ["Cinta kepada Lingkungan dan Generasi Mendatang", "Tanggung Jawab Ekonomi Berkelanjutan"],
        profil_lulusan: ["Peduli Lingkungan", "Berpikir Kritis", "Kreatif dan Inovatif"],
        tujuan_pembelajaran: ["Memahami konsep pembangunan berkelanjutan", "Menganalisis dampak gaya hidup konsumtif", "Merancang solusi inovatif", "Mengimplementasikan praktik berkelanjutan"],
        aktivitas_pembelajaran: ["Audit konsumsi dan limbah", "Inovasi produk ramah lingkungan", "Proyek 3R (Reduce, Reuse, Recycle)", "Edukasi komunitas"],
        integrasi_kbc: ["Cinta kepada Lingkungan untuk generasi mendatang", "Cinta kepada Masyarakat keadilan sosial", "Cinta kepada Allah penyelamatan bumi"],
        penilaian: ["Pengetahuan SDGs dan ekonomi berkelanjutan", "Keterampilan inovasi", "Sikap komitmen berkelanjutan", "Produk inovasi berkelanjutan", "Refleksi perspektif konsumsi"]
    },
    "Teknologi untuk Kemanusiaan": {
        pokok_bahasan: ["Etika Penggunaan Teknologi", "Digital Literacy", "Teknologi dan Pemberdayaan Masyarakat"],
        mapel_kolaboratif: ["Informatika, Bahasa Indonesia, PAI, IPS"],
        topik_kbc: ["Cinta dalam Penggunaan Teknologi Bertanggung Jawab", "Manfaat Teknologi untuk Kehidupan Lebih Baik"],
        profil_lulusan: ["Literasi Digital", "Kreatif", "Tanggung Jawab Sosial"],
        tujuan_pembelajaran: ["Memahami etika teknologi dalam Islam", "Menganalisis dampak teknologi", "Merancang solusi teknologi sosial", "Menggunakan teknologi secara etis"],
        aktivitas_pembelajaran: ["Workshop digital literacy", "Proyek teknologi sosial", "Program edukasi digital", "Diskusi dampak teknologi"],
        integrasi_kbc: ["Cinta kepada Allah dalam penggunaan teknologi", "Cinta kepada Diri digital wellness", "Cinta kepada Masyarakat melalui teknologi"],
        penilaian: ["Pengetahuan etika teknologi", "Keterampilan menggunakan teknologi", "Sikap tanggung jawab digital", "Produk aplikasi/website sosial", "Refleksi penggunaan bertanggung jawab"]
    },
    "Kewirausahaan Sosial": {
        pokok_bahasan: ["Model Bisnis Sosial", "Entrepreneurship dan Tanggung Jawab Sosial", "Ekonomi Kreatif dan Berkelanjutan"],
        mapel_kolaboratif: ["Prakarya, Ekonomi, PAI, Bahasa Indonesia"],
        topik_kbc: ["Kepemimpinan Bisnis yang Beretika", "Memberikan Manfaat kepada Masyarakat Luas"],
        profil_lulusan: ["Kreatif dan Inovatif", "Mandiri", "Tanggung Jawab Sosial"],
        tujuan_pembelajaran: ["Memahami konsep kewirausahaan sosial", "Menganalisis peluang usaha sosial", "Merancang dan melaksanakan proyek usaha sosial", "Mengembangkan keterampilan entrepreneurship"],
        aktivitas_pembelajaran: ["Studi kasus bisnis sosial", "Business planning", "Inkubasi bisnis", "Networking dengan praktisi"],
        integrasi_kbc: ["Cinta kepada Masyarakat memberdayakan", "Cinta kepada Allah berbisnis halal", "Cinta kepada Diri pengembangan kepemimpinan"],
        penilaian: ["Pengetahuan model bisnis sosial", "Keterampilan entrepreneurship", "Sikap tanggung jawab sosial", "Produk usaha sosial berjalan", "Refleksi dampak sosial"]
    },
    "Sistem Tubuh Manusia": {
        pokok_bahasan: ["Kesehatan: Sistem Tubuh dan Keseimbangan", "Nutrisi dan Metabolisme", "Pencegahan Penyakit"],
        mapel_kolaboratif: ["IPA, PAI, Bahasa Indonesia, PJOK"],
        topik_kbc: ["Cinta kepada Diri: Menjaga Kesehatan Tubuh", "Cinta kepada Masyarakat: Promosi Kesehatan"],
        profil_lulusan: ["Peduli Kesehatan", "Berpikir Kritis", "Literasi Sains"],
        tujuan_pembelajaran: ["Memahami sistem tubuh dari perspektif sains dan agama", "Menganalisis faktor kesehatan dan penyakit", "Merancang program promosi kesehatan", "Mengembangkan kebiasaan hidup sehat"],
        aktivitas_pembelajaran: ["Eksperimen sistem tubuh", "Diskusi nutrisi sehat", "Proyek kampanye kesehatan", "Studi kasus penyakit sosial"],
        integrasi_kbc: ["Cinta kepada Diri melalui perawatan tubuh", "Cinta kepada Allah menjaga amanah", "Cinta kepada Masyarakat promosi kesehatan"],
        penilaian: ["Pengetahuan sistem tubuh", "Keterampilan analisis kesehatan", "Sikap peduli kesehatan", "Produk kampanye promosi", "Refleksi gaya hidup sehat"]
    },
    "Kearifan Lokal dan Agribisnis": {
        pokok_bahasan: ["Kearifan Lokal Pertanian", "Agribisnis Berkelanjutan", "Pertanian Organik dan Modern"],
        mapel_kolaboratif: ["IPAS, Prakarya, Ekonomi, PAI"],
        topik_kbc: ["Cinta kepada Lingkungan: Pertanian Berkelanjutan", "Cinta kepada Masyarakat: Pemberdayaan Petani"],
        profil_lulusan: ["Peduli Lingkungan", "Kreatif dan Inovatif", "Mandiri Ekonomi"],
        tujuan_pembelajaran: ["Memahami kearifan lokal pertanian", "Menganalisis praktik agribisnis berkelanjutan", "Merancang usaha agribisnis", "Mengembangkan inovasi pertanian"],
        aktivitas_pembelajaran: ["Studi lapangan ke pertanian lokal", "Workshop agribisnis berkelanjutan", "Proyek demonstrasi pertanian", "Inkubasi bisnis pertanian"],
        integrasi_kbc: ["Cinta kepada Lingkungan melestarikan alam", "Cinta kepada Masyarakat pemberdayaan ekonomi", "Cinta kepada Diri kemandirian"],
        penilaian: ["Pengetahuan kearifan pertanian", "Keterampilan agribisnis", "Sikap peduli lingkungan", "Produk usaha agribisnis", "Refleksi dampak ekonomi"]
    },
    "Seni dan Budaya Digital": {
        pokok_bahasan: ["Seni Digital dan Multimedia", "Pelestarian Budaya melalui Teknologi", "Kreativitas Digital"],
        mapel_kolaboratif: ["Seni Budaya, Informatika, Bahasa Indonesia"],
        topik_kbc: ["Cinta kepada Budaya Lokal melalui Media Modern", "Cinta kepada Kreativitas dan Inovasi"],
        profil_lulusan: ["Kreatif dan Inovatif", "Literasi Digital", "Apresiasi Budaya"],
        tujuan_pembelajaran: ["Memahami seni digital dan multimedia", "Menganalisis pelestarian budaya digital", "Merancang karya seni digital", "Mengembangkan skill kreativitas"],
        aktivitas_pembelajaran: ["Workshop seni digital", "Proyek multimedia budaya lokal", "Pameran karya digital", "Kolaborasi seni antar budaya"],
        integrasi_kbc: ["Cinta kepada Budaya melalui medium modern", "Cinta kepada Kreativitas", "Cinta kepada Masyarakat berbagi seni"],
        penilaian: ["Pengetahuan seni digital", "Keterampilan multimedia", "Sikap apresiasi budaya", "Produk karya seni digital", "Refleksi ekspresi kreatif"]
    },
    "Literasi dan Penguatan Bahasa": {
        pokok_bahasan: ["Literasi Tingkat Lanjut", "Bahasa sebagai Identitas Budaya", "Komunikasi Efektif"],
        mapel_kolaboratif: ["Bahasa Indonesia, PAI, Bahasa Daerah"],
        topik_kbc: ["Cinta kepada Bahasa dan Budaya", "Cinta kepada Komunikasi yang Jujur"],
        profil_lulusan: ["Literasi Tinggi", "Komunikator Efektif", "Apresiasi Budaya"],
        tujuan_pembelajaran: ["Meningkatkan literasi tingkat lanjut", "Memahami bahasa sebagai identitas", "Mengembangkan komunikasi efektif", "Melestarikan bahasa daerah"],
        aktivitas_pembelajaran: ["Workshop penulisan kreatif", "Proyek preservasi bahasa daerah", "Debat dan diskusi persuasif", "Program mentoring literasi"],
        integrasi_kbc: ["Cinta kepada Bahasa dan budaya", "Cinta kepada Komunikasi jujur", "Cinta kepada Masyarakat melalui edukasi"],
        penilaian: ["Pengetahuan literasi lanjutan", "Keterampilan komunikasi", "Sikap apresiasi bahasa", "Produk karya tulis", "Refleksi identitas budaya"]
    },
    "Gerakan Filantropi Sosial": {
        pokok_bahasan: ["Kepedulian Sosial dan Kemanusiaan", "Program Bantuan Masyarakat", "Kemitraan Sosial"],
        mapel_kolaboratif: ["PAI, IPS, PKn, Bahasa Indonesia"],
        topik_kbc: ["Cinta kepada Sesama dalam Berbuat Baik", "Cinta kepada Masyarakat melalui Aksi"],
        profil_lulusan: ["Bergotong Royong", "Kepedulian Sosial", "Aksi nyata"],
        tujuan_pembelajaran: ["Memahami filantropi dari perspektif agama", "Menganalisis kebutuhan sosial", "Merancang program bantuan", "Melaksanakan aksi sosial nyata"],
        aktivitas_pembelajaran: ["Pemetaan kebutuhan sosial", "Proyek program filantropi", "Mobilisasi sumber daya", "Evaluasi dampak sosial"],
        integrasi_kbc: ["Cinta kepada Sesama dalam aksi nyata", "Cinta kepada Masyarakat peduli", "Cinta kepada Diri berbagi"],
        penilaian: ["Pengetahuan filantropi sosial", "Keterampilan program sosial", "Sikap kepedulian", "Produk program bantuan", "Refleksi impact sosial"]
    },
    "Mitigasi dan Adaptasi Bencana Alam": {
        pokok_bahasan: ["Jenis-jenis Bencana Alam", "Kesiapsiagaan Bencana", "Pemulihan Pasca Bencana"],
        mapel_kolaboratif: ["IPAS, PAI, PKn, Bahasa Indonesia"],
        topik_kbc: ["Cinta kepada Lingkungan dalam Mitigasi", "Cinta kepada Masyarakat dalam Kesiapan"],
        profil_lulusan: ["Peduli Lingkungan", "Siap Siaga", "Tanggung Jawab Sosial"],
        tujuan_pembelajaran: ["Memahami bencana dan mitigasi", "Menganalisis faktor risiko", "Merancang sistem kesiapsiagaan", "Mengembangkan skill penyelamatan"],
        aktivitas_pembelajaran: ["Workshop mitigasi bencana", "Simulasi tanggap darurat", "Proyek sistem peringatan dini", "Edukasi masyarakat"],
        integrasi_kbc: ["Cinta kepada Lingkungan pencegahan", "Cinta kepada Masyarakat kesiapan", "Cinta kepada Diri keselamatan"],
        penilaian: ["Pengetahuan mitigasi bencana", "Keterampilan tanggap darurat", "Sikap kesiapan", "Produk sistem mitigasi", "Refleksi kesadaran risiko"]
    },
    "Robot Sederhana & Mekanisme Gerak": {
        pokok_bahasan: ["Prinsip Mekanika dan Gerak", "Robotika Sederhana", "Inovasi Teknologi Tepat Guna"],
        mapel_kolaboratif: ["Matematika, IPA, Prakarya, Informatika"],
        topik_kbc: ["Cinta kepada Inovasi dan Kreativitas", "Cinta kepada Ilmu Pengetahuan"],
        profil_lulusan: ["Kreatif dan Inovatif", "Berpikir Kritis", "Literasi STEM"],
        tujuan_pembelajaran: ["Memahami prinsip mekanika dasar", "Menganalisis sistem gerak robot", "Merancang robot sederhana", "Mengembangkan kemampuan problem solving"],
        aktivitas_pembelajaran: ["Eksperimen mekanika gerak", "Workshop robotika", "Proyek pembuatan robot", "Kompetisi robotika"],
        integrasi_kbc: ["Cinta kepada Ilmu melalui eksplorasi", "Cinta kepada Kreativitas dalam desain", "Cinta kepada Kolaborasi dalam tim"],
        penilaian: ["Pengetahuan mekanika dan robotika", "Keterampilan desain dan konstruksi", "Sikap inovatif", "Produk robot fungsional", "Refleksi proses pembuatan"]
    },
    "Belajar dari Alam dan Ilmu": {
        pokok_bahasan: ["Fenomena Alam sebagai Sumber Ilmu", "Biomimikri dan Inovasi", "Sains dalam Kehidupan Sehari-hari"],
        mapel_kolaboratif: ["IPAS, PAI, Matematika, Bahasa Indonesia"],
        topik_kbc: ["Cinta kepada Alam sebagai Guru", "Cinta kepada Ilmu Pengetahuan"],
        profil_lulusan: ["Berpikir Kritis", "Literasi Sains", "Peduli Lingkungan"],
        tujuan_pembelajaran: ["Mengamati fenomena alam secara ilmiah", "Menganalisis pola dan hukum alam", "Menerapkan prinsip biomimikri", "Mengembangkan rasa ingin tahu"],
        aktivitas_pembelajaran: ["Observasi lapangan alam", "Eksperimen sains sederhana", "Proyek biomimikri", "Presentasi penemuan"],
        integrasi_kbc: ["Cinta kepada Alam sebagai pembelajaran", "Cinta kepada Allah melalui ciptaan", "Cinta kepada Ilmu eksplorasi"],
        penilaian: ["Pengetahuan fenomena alam", "Keterampilan observasi ilmiah", "Sikap rasa ingin tahu", "Produk laporan penelitian", "Refleksi pembelajaran dari alam"]
    },
    "Sahabat di Sekitar Kita": {
        pokok_bahasan: ["Membangun Persahabatan Positif", "Empati dan Kepedulian Sosial", "Resolusi Konflik"],
        mapel_kolaboratif: ["PAI, PKn, Bahasa Indonesia, BK"],
        topik_kbc: ["Cinta kepada Sesama dalam Persahabatan", "Cinta kepada Keberagaman"],
        profil_lulusan: ["Berempati", "Bergotong Royong", "Komunikator Baik"],
        tujuan_pembelajaran: ["Memahami nilai persahabatan dalam Islam", "Mengembangkan empati sosial", "Mengelola konflik interpersonal", "Membangun relasi positif"],
        aktivitas_pembelajaran: ["Diskusi kelompok persahabatan", "Role play resolusi konflik", "Proyek kolaborasi", "Refleksi hubungan sosial"],
        integrasi_kbc: ["Cinta kepada Sesama dalam persahabatan", "Cinta kepada Diri mengenal emosi", "Cinta kepada Keberagaman menghargai"],
        penilaian: ["Pengetahuan persahabatan sehat", "Keterampilan komunikasi", "Sikap empati", "Produk dokumentasi kolaborasi", "Refleksi kualitas relasi"]
    },
    "Hemat Energi, Wujud Syukur pada Allah": {
        pokok_bahasan: ["Sumber Energi dan Konservasi", "Hemat Energi sebagai Ibadah", "Teknologi Energi Terbarukan"],
        mapel_kolaboratif: ["PAI, IPAS, Matematika, Prakarya"],
        topik_kbc: ["Cinta kepada Lingkungan melalui Konservasi", "Cinta kepada Allah dalam Syukur"],
        profil_lulusan: ["Peduli Lingkungan", "Tanggung Jawab", "Inovatif"],
        tujuan_pembelajaran: ["Memahami konservasi energi dari perspektif Islam", "Menganalisis konsumsi energi", "Merancang solusi hemat energi", "Mengembangkan kesadaran syukur"],
        aktivitas_pembelajaran: ["Audit energi sekolah/rumah", "Workshop energi terbarukan", "Proyek inovasi hemat energi", "Kampanye konservasi"],
        integrasi_kbc: ["Cinta kepada Allah dengan bersyukur", "Cinta kepada Lingkungan konservasi", "Cinta kepada Generasi Mendatang"],
        penilaian: ["Pengetahuan konservasi energi", "Keterampilan audit energi", "Sikap syukur dan hemat", "Produk inovasi hemat energi", "Refleksi perubahan perilaku"]
    },
    "Aku dan Profesi di Sekitarku": {
        pokok_bahasan: ["Eksplorasi Karir dan Profesi", "Etos Kerja dalam Islam", "Perencanaan Masa Depan"],
        mapel_kolaboratif: ["BK, PAI, Bahasa Indonesia, IPS"],
        topik_kbc: ["Cinta kepada Diri: Mengenal Potensi", "Cinta kepada Masyarakat: Memberikan Manfaat"],
        profil_lulusan: ["Mandiri", "Berorientasi Masa Depan", "Bertanggung Jawab"],
        tujuan_pembelajaran: ["Mengenal berbagai profesi", "Menganalisis minat dan bakat", "Merancang rencana karir", "Mengembangkan etos kerja"],
        aktivitas_pembelajaran: ["Wawancara profesi", "Job shadowing", "Career day", "Proyek portofolio karir"],
        integrasi_kbc: ["Cinta kepada Diri eksplorasi potensi", "Cinta kepada Masyarakat profesi bermanfaat", "Cinta kepada Allah bekerja sebagai ibadah"],
        penilaian: ["Pengetahuan profesi dan karir", "Keterampilan perencanaan", "Sikap etos kerja", "Produk rencana karir", "Refleksi potensi diri"]
    },
    "Berbeda Itu Indah": {
        pokok_bahasan: ["Keberagaman sebagai Rahmat", "Inklusivitas dan Toleransi", "Menghargai Perbedaan"],
        mapel_kolaboratif: ["PAI, PKn, Bahasa Indonesia, Seni Budaya"],
        topik_kbc: ["Cinta kepada Keberagaman", "Cinta kepada Sesama tanpa Diskriminasi"],
        profil_lulusan: ["Berkebhinekaan Global", "Berempati", "Menghargai Perbedaan"],
        tujuan_pembelajaran: ["Memahami keberagaman dari perspektif Islam", "Menganalisis praktik inklusivitas", "Mengembangkan sikap toleran", "Membangun harmoni sosial"],
        aktivitas_pembelajaran: ["Diskusi keberagaman", "Proyek inklusivitas", "Perayaan keberagaman", "Kampanye anti-diskriminasi"],
        integrasi_kbc: ["Cinta kepada Keberagaman menghargai", "Cinta kepada Sesama tanpa sekat", "Cinta kepada Allah yang menciptakan"],
        penilaian: ["Pengetahuan keberagaman", "Keterampilan komunikasi inklusif", "Sikap toleransi", "Produk kampanye inklusivitas", "Refleksi sikap terhadap perbedaan"]
    },
    "Inovasi Daur Ulang di Kampungku": {
        pokok_bahasan: ["Pengelolaan Sampah Kreatif", "Ekonomi Sirkular Lokal", "Inovasi Produk Daur Ulang"],
        mapel_kolaboratif: ["Prakarya, IPAS, Ekonomi, Seni Budaya"],
        topik_kbc: ["Cinta kepada Lingkungan melalui Daur Ulang", "Cinta kepada Masyarakat: Pemberdayaan Ekonomi"],
        profil_lulusan: ["Kreatif dan Inovatif", "Peduli Lingkungan", "Entrepreneurship"],
        tujuan_pembelajaran: ["Memahami konsep daur ulang dan ekonomi sirkular", "Menganalisis potensi sampah", "Merancang produk inovatif", "Mengembangkan usaha daur ulang"],
        aktivitas_pembelajaran: ["Workshop daur ulang kreatif", "Proyek produk inovatif", "Pameran produk daur ulang", "Inkubasi bisnis daur ulang"],
        integrasi_kbc: ["Cinta kepada Lingkungan mengurangi sampah", "Cinta kepada Masyarakat pemberdayaan", "Cinta kepada Kreativitas inovasi"],
        penilaian: ["Pengetahuan daur ulang", "Keterampilan desain produk", "Sikap peduli lingkungan", "Produk inovatif daur ulang", "Refleksi impact lingkungan"]
    },
    "Bangga Jadi Anak Indonesia": {
        pokok_bahasan: ["Identitas Nasional", "Sejarah Perjuangan Bangsa", "Kontribusi untuk Negeri"],
        mapel_kolaboratif: ["PKn, IPS, PAI, Bahasa Indonesia"],
        topik_kbc: ["Cinta Tanah Air", "Cinta kepada Sejarah dan Budaya Bangsa"],
        profil_lulusan: ["Nasionalisme", "Berkebhinekaan Global", "Tanggung Jawab Sosial"],
        tujuan_pembelajaran: ["Memahami identitas nasional", "Menganalisis sejarah perjuangan", "Menghargai keragaman Indonesia", "Berkontribusi untuk bangsa"],
        aktivitas_pembelajaran: ["Studi sejarah lokal", "Proyek pelestarian budaya", "Kampanye nasionalisme", "Karya cinta tanah air"],
        integrasi_kbc: ["Cinta Tanah Air dalam aksi nyata", "Cinta kepada Budaya melestarikan", "Cinta kepada Masyarakat berkontribusi"],
        penilaian: ["Pengetahuan sejarah dan budaya", "Keterampilan pelestarian", "Sikap nasionalisme", "Produk karya cinta tanah air", "Refleksi identitas nasional"]
    },
    "Teknologi untuk Kebaikan": {
        pokok_bahasan: ["Teknologi Digital Positif", "Cyber Ethics dan Keamanan", "Inovasi Teknologi Sosial"],
        mapel_kolaboratif: ["Informatika, PAI, Bahasa Indonesia"],
        topik_kbc: ["Cinta dalam Teknologi yang Bertanggung Jawab", "Cinta kepada Kebaikan melalui Digital"],
        profil_lulusan: ["Literasi Digital", "Etika Digital", "Inovatif"],
        tujuan_pembelajaran: ["Memahami etika digital dalam Islam", "Menganalisis dampak teknologi", "Merancang solusi teknologi sosial", "Menggunakan teknologi untuk kebaikan"],
        aktivitas_pembelajaran: ["Workshop cyber ethics", "Proyek aplikasi sosial", "Kampanye digital positif", "Mentoring literasi digital"],
        integrasi_kbc: ["Cinta dalam Teknologi etis", "Cinta kepada Kebaikan digital", "Cinta kepada Masyarakat melalui teknologi"],
        penilaian: ["Pengetahuan etika digital", "Keterampilan teknologi", "Sikap tanggung jawab digital", "Produk aplikasi sosial", "Refleksi penggunaan teknologi"]
    },
    "Gotong Royong Membangun Sekolahku": {
        pokok_bahasan: ["Nilai Gotong Royong", "Kolaborasi dan Teamwork", "Proyek Pengembangan Sekolah"],
        mapel_kolaboratif: ["PKn, PAI, Prakarya, Bahasa Indonesia"],
        topik_kbc: ["Cinta kepada Komunitas Sekolah", "Cinta dalam Kolaborasi"],
        profil_lulusan: ["Bergotong Royong", "Kolaboratif", "Tanggung Jawab"],
        tujuan_pembelajaran: ["Memahami nilai gotong royong dalam Islam", "Mengembangkan keterampilan kolaborasi", "Merancang proyek pengembangan sekolah", "Melaksanakan aksi bersama"],
        aktivitas_pembelajaran: ["Diskusi gotong royong", "Proyek kolaboratif sekolah", "Kerja bakti", "Evaluasi bersama"],
        integrasi_kbc: ["Cinta kepada Komunitas dalam gotong royong", "Cinta dalam Kolaborasi", "Cinta kepada Lingkungan Sekolah"],
        penilaian: ["Pengetahuan gotong royong", "Keterampilan kolaborasi", "Sikap tanggung jawab", "Produk proyek sekolah", "Refleksi kerja tim"]
    },
    "Robot Cerdas & Sensor Lingkungan": {
        pokok_bahasan: ["Sensor dan IoT", "Programming Robot", "Teknologi Lingkungan"],
        mapel_kolaboratif: ["Informatika, IPAS, Matematika"],
        topik_kbc: ["Cinta kepada Inovasi Teknologi", "Cinta kepada Lingkungan melalui Teknologi"],
        profil_lulusan: ["Literasi Teknologi", "Kreatif", "Problem Solver"],
        tujuan_pembelajaran: ["Memahami sensor dan IoT", "Menganalisis data lingkungan", "Merancang robot sensor", "Mengembangkan solusi teknologi lingkungan"],
        aktivitas_pembelajaran: ["Workshop sensor IoT", "Programming robot", "Proyek monitoring lingkungan", "Kompetisi robot cerdas"],
        integrasi_kbc: ["Cinta kepada Teknologi inovatif", "Cinta kepada Lingkungan monitoring", "Cinta kepada Ilmu eksplorasi"],
        penilaian: ["Pengetahuan sensor dan IoT", "Keterampilan programming", "Sikap inovatif", "Produk robot sensor", "Refleksi teknologi lingkungan"]
    },
    "Hidup Bersih, Hati Jernih": {
        pokok_bahasan: ["Kebersihan sebagai Ibadah", "Kesehatan dan Sanitasi", "Lingkungan Sehat"],
        mapel_kolaboratif: ["PAI, IPAS, PJOK, PKn"],
        topik_kbc: ["Cinta kepada Kebersihan", "Cinta kepada Kesehatan"],
        profil_lulusan: ["Peduli Kesehatan", "Tanggung Jawab", "Disiplin"],
        tujuan_pembelajaran: ["Memahami kebersihan dalam perspektif Islam", "Menganalisis hubungan kebersihan dan kesehatan", "Merancang program kebersihan", "Mengembangkan kebiasaan bersih"],
        aktivitas_pembelajaran: ["Kampanye kebersihan", "Proyek sanitasi sekolah", "Workshop kesehatan", "Monitoring kebersihan"],
        integrasi_kbc: ["Cinta kepada Allah melalui kebersihan", "Cinta kepada Diri menjaga kesehatan", "Cinta kepada Lingkungan peduli"],
        penilaian: ["Pengetahuan kebersihan dan kesehatan", "Keterampilan sanitasi", "Sikap disiplin bersih", "Produk program kebersihan", "Refleksi perubahan kebiasaan"]
    },
    "Menjaga Tradisi, Merangkai Inovasi": {
        pokok_bahasan: ["Pelestarian Tradisi Lokal", "Inovasi Berbasis Kearifan Lokal", "Modernisasi Tradisi"],
        mapel_kolaboratif: ["Seni Budaya, Prakarya, IPS, Bahasa Daerah"],
        topik_kbc: ["Cinta kepada Tradisi dan Budaya", "Cinta kepada Inovasi"],
        profil_lulusan: ["Apresiasi Budaya", "Kreatif", "Inovatif"],
        tujuan_pembelajaran: ["Memahami nilai tradisi lokal", "Menganalisis potensi inovasi tradisi", "Merancang produk inovasi berbasis tradisi", "Melestarikan budaya lokal"],
        aktivitas_pembelajaran: ["Studi tradisi lokal", "Workshop inovasi budaya", "Proyek modernisasi tradisi", "Pameran karya inovatif"],
        integrasi_kbc: ["Cinta kepada Tradisi melestarikan", "Cinta kepada Inovasi mengembangkan", "Cinta kepada Budaya menghargai"],
        penilaian: ["Pengetahuan tradisi lokal", "Keterampilan inovasi", "Sikap apresiasi budaya", "Produk inovasi tradisi", "Refleksi pelestarian budaya"]
    },
    "Berani Jujur Hebat": {
        pokok_bahasan: ["Kejujuran sebagai Fondasi Karakter", "Integritas dalam Kehidupan", "Membangun Kepercayaan"],
        mapel_kolaboratif: ["PAI, PKn, Bahasa Indonesia, BK"],
        topik_kbc: ["Cinta kepada Kejujuran", "Cinta kepada Integritas"],
        profil_lulusan: ["Berakhlak Mulia", "Jujur", "Dapat Dipercaya"],
        tujuan_pembelajaran: ["Memahami kejujuran dalam Islam", "Menganalisis dampak kejujuran", "Mengembangkan integritas pribadi", "Membangun kepercayaan sosial"],
        aktivitas_pembelajaran: ["Diskusi dilema moral", "Role play kejujuran", "Proyek kampanye integritas", "Refleksi kejujuran"],
        integrasi_kbc: ["Cinta kepada Allah dengan jujur", "Cinta kepada Diri integritas", "Cinta kepada Sesama kepercayaan"],
        penilaian: ["Pengetahuan nilai kejujuran", "Keterampilan pengambilan keputusan moral", "Sikap integritas", "Produk kampanye kejujuran", "Refleksi komitmen jujur"]
    },
    "Menanam, Merawat, dan Bersyukur": {
        pokok_bahasan: ["Pertanian dan Ketahanan Pangan", "Urban Farming", "Syukur atas Rezeki Allah"],
        mapel_kolaboratif: ["IPAS, PAI, Prakarya, Matematika"],
        topik_kbc: ["Cinta kepada Lingkungan melalui Pertanian", "Cinta kepada Allah dengan Bersyukur"],
        profil_lulusan: ["Peduli Lingkungan", "Mandiri", "Bersyukur"],
        tujuan_pembelajaran: ["Memahami pertanian dari perspektif Islam", "Menganalisis ketahanan pangan", "Merancang sistem urban farming", "Mengembangkan sikap syukur"],
        aktivitas_pembelajaran: ["Proyek urban farming", "Workshop pertanian organik", "Pemeliharaan kebun sekolah", "Refleksi syukur atas hasil panen"],
        integrasi_kbc: ["Cinta kepada Allah bersyukur", "Cinta kepada Lingkungan menanam", "Cinta kepada Kemandirian bercocok tanam"],
        penilaian: ["Pengetahuan pertanian", "Keterampilan bercocok tanam", "Sikap syukur dan sabar", "Produk hasil pertanian", "Refleksi proses menanam"]
    },
    "Bersahabat dengan Perbedaan": {
        pokok_bahasan: ["Diversitas dan Inklusivitas", "Empati terhadap Perbedaan", "Harmoni Sosial"],
        mapel_kolaboratif: ["PAI, PKn, BK, Bahasa Indonesia"],
        topik_kbc: ["Cinta kepada Keberagaman", "Cinta kepada Sesama dengan Empati"],
        profil_lulusan: ["Berkebhinekaan Global", "Berempati", "Inklusif"],
        tujuan_pembelajaran: ["Memahami diversitas dari perspektif Islam", "Mengembangkan empati sosial", "Mengelola interaksi dengan perbedaan", "Membangun harmoni"],
        aktivitas_pembelajaran: ["Workshop empati", "Proyek inklusivitas", "Dialog antarbudaya", "Kampanye anti-bullying"],
        integrasi_kbc: ["Cinta kepada Keberagaman menghargai", "Cinta kepada Sesama berempati", "Cinta kepada Harmoni membangun"],
        penilaian: ["Pengetahuan diversitas", "Keterampilan empati", "Sikap inklusif", "Produk kampanye inklusivitas", "Refleksi sikap terhadap perbedaan"]
    },
    "Madrasahku Rumah Belajarku yang Bahagia": {
        pokok_bahasan: ["Lingkungan Belajar Positif", "Well-being di Sekolah", "Komunitas Madrasah"],
        mapel_kolaboratif: ["BK, PAI, PKn, Seni Budaya"],
        topik_kbc: ["Cinta kepada Madrasah", "Cinta kepada Komunitas Belajar"],
        profil_lulusan: ["Bahagia Belajar", "Bergotong Royong", "Peduli Lingkungan Sekolah"],
        tujuan_pembelajaran: ["Memahami konsep well-being sekolah", "Menganalisis faktor lingkungan belajar positif", "Merancang program sekolah bahagia", "Membangun komunitas madrasah"],
        aktivitas_pembelajaran: ["Survey well-being siswa", "Proyek sekolah bahagia", "Dekorasi kelas kreatif", "Program peer support"],
        integrasi_kbc: ["Cinta kepada Madrasah peduli", "Cinta kepada Komunitas gotong royong", "Cinta kepada Kebahagiaan menciptakan"],
        penilaian: ["Pengetahuan well-being", "Keterampilan menciptakan lingkungan positif", "Sikap peduli madrasah", "Produk program sekolah bahagia", "Refleksi kebahagiaan belajar"]
    },
    "Bijak Bermedia Digital": {
        pokok_bahasan: ["Literasi Media Digital", "Hoaks dan Disinformasi", "Jejak Digital Positif"],
        mapel_kolaboratif: ["Informatika, Bahasa Indonesia, PAI, PKn"],
        topik_kbc: ["Cinta kepada Kebenaran", "Cinta dalam Media yang Bertanggung Jawab"],
        profil_lulusan: ["Literasi Digital", "Berpikir Kritis", "Tanggung Jawab Digital"],
        tujuan_pembelajaran: ["Memahami literasi media dari perspektif Islam", "Menganalisis hoaks dan disinformasi", "Merancang konten digital positif", "Mengembangkan jejak digital baik"],
        aktivitas_pembelajaran: ["Workshop cek fakta", "Proyek konten positif", "Kampanye anti-hoaks", "Diskusi etika digital"],
        integrasi_kbc: ["Cinta kepada Kebenaran verifikasi", "Cinta dalam Media etis", "Cinta kepada Masyarakat edukasi digital"],
        penilaian: ["Pengetahuan literasi media", "Keterampilan cek fakta", "Sikap kritis terhadap informasi", "Produk konten digital positif", "Refleksi jejak digital"]
    },
    "AI dan Kemanusiaan: Belajar dengan Hati": {
        pokok_bahasan: ["Artificial Intelligence dan Etika", "AI untuk Kemanusiaan", "Teknologi dan Nilai Kemanusiaan"],
        mapel_kolaboratif: ["Informatika, PAI, Matematika, Bahasa Indonesia"],
        topik_kbc: ["Cinta kepada Teknologi yang Humanis", "Cinta kepada Kemanusiaan"],
        profil_lulusan: ["Literasi Teknologi", "Etika Digital", "Berpikir Kritis"],
        tujuan_pembelajaran: ["Memahami AI dari perspektif etika", "Menganalisis dampak AI pada kemanusiaan", "Merancang aplikasi AI humanis", "Mengembangkan kesadaran etika AI"],
        aktivitas_pembelajaran: ["Workshop AI ethics", "Proyek AI sosial", "Diskusi dampak AI", "Eksperimen machine learning sederhana"],
        integrasi_kbc: ["Cinta kepada Teknologi humanis", "Cinta kepada Kemanusiaan prioritas", "Cinta kepada Etika dalam AI"],
        penilaian: ["Pengetahuan AI dan etika", "Keterampilan analisis dampak", "Sikap kritis terhadap teknologi", "Produk konsep AI sosial", "Refleksi teknologi dan kemanusiaan"]
    },
    "Bumi Memanas, Kita Beraksil": {
        pokok_bahasan: ["Perubahan Iklim Global", "Aksi Mitigasi dan Adaptasi", "Generasi Climate Action"],
        mapel_kolaboratif: ["IPAS, PAI, PKn, Matematika"],
        topik_kbc: ["Cinta kepada Bumi", "Cinta kepada Generasi Mendatang"],
        profil_lulusan: ["Peduli Lingkungan", "Climate Activist", "Bertanggung Jawab Global"],
        tujuan_pembelajaran: ["Memahami perubahan iklim", "Menganalisis dampak climate change", "Merancang aksi mitigasi", "Mengembangkan kesadaran climate action"],
        aktivitas_pembelajaran: ["Workshop perubahan iklim", "Proyek carbon footprint", "Kampanye climate action", "Advokasi kebijakan lingkungan"],
        integrasi_kbc: ["Cinta kepada Bumi aksi nyata", "Cinta kepada Generasi Mendatang tanggung jawab", "Cinta kepada Allah menjaga ciptaan"],
        penilaian: ["Pengetahuan perubahan iklim", "Keterampilan analisis carbon footprint", "Sikap climate awareness", "Produk kampanye climate action", "Refleksi komitmen lingkungan"]
    },
    "Teknologi Cerdas, Generasi Beretika": {
        pokok_bahasan: ["Smart Technology dan Aplikasinya", "Etika dalam Era Digital", "Inovasi Teknologi Berkelanjutan"],
        mapel_kolaboratif: ["Informatika, PAI, IPAS, Bahasa Indonesia"],
        topik_kbc: ["Cinta kepada Teknologi Etis", "Cinta kepada Generasi Beretika"],
        profil_lulusan: ["Literasi Digital", "Beretika", "Inovatif"],
        tujuan_pembelajaran: ["Memahami teknologi cerdas", "Menganalisis etika digital", "Merancang inovasi teknologi etis", "Mengembangkan karakter digital beretika"],
        aktivitas_pembelajaran: ["Workshop smart technology", "Proyek inovasi teknologi", "Diskusi dilema etika digital", "Kampanye teknologi beretika"],
        integrasi_kbc: ["Cinta kepada Teknologi bertanggung jawab", "Cinta kepada Etika prioritas", "Cinta kepada Inovasi berkelanjutan"],
        penilaian: ["Pengetahuan teknologi cerdas", "Keterampilan inovasi", "Sikap etika digital", "Produk teknologi etis", "Refleksi tanggung jawab digital"]
    },
    "Bersuara dengan Akhlak, Berpartisipasi dengan Bijak": {
        pokok_bahasan: ["Partisipasi Demokrasi Berakhlak", "Advokasi dengan Etika", "Kepemimpinan Berbasis Nilai"],
        mapel_kolaboratif: ["PKn, PAI, Bahasa Indonesia, IPS"],
        topik_kbc: ["Cinta kepada Demokrasi Berakhlak", "Cinta kepada Kebenaran dalam Bersuara"],
        profil_lulusan: ["Berakhlak Mulia", "Partisipatif", "Pemimpin Etis"],
        tujuan_pembelajaran: ["Memahami demokrasi dari perspektif akhlak", "Menganalisis partisipasi etis", "Mengembangkan keterampilan advokasi berakhlak", "Berpartisipasi dengan bijaksana"],
        aktivitas_pembelajaran: ["Forum diskusi demokrasi", "Proyek advokasi berakhlak", "Leadership training", "Simulasi pengambilan keputusan etis"],
        integrasi_kbc: ["Cinta kepada Akhlak dalam bersuara", "Cinta kepada Demokrasi partisipatif", "Cinta kepada Kebenaran advokasi"],
        penilaian: ["Pengetahuan demokrasi berakhlak", "Keterampilan advokasi etis", "Sikap bijaksana", "Produk kampanye berakhlak", "Refleksi kepemimpinan etis"]
    },
    "Anti Hoaks & Literasi Politik": {
        pokok_bahasan: ["Hoaks dan Manipulasi Informasi", "Literasi Politik Kritis", "Partisipasi Politik Cerdas"],
        mapel_kolaboratif: ["PKn, Bahasa Indonesia, Informatika, PAI"],
        topik_kbc: ["Cinta kepada Kebenaran", "Cinta kepada Demokrasi yang Sehat"],
        profil_lulusan: ["Berpikir Kritis", "Literasi Informasi", "Partisipatif Cerdas"],
        tujuan_pembelajaran: ["Memahami hoaks dan disinformasi politik", "Menganalisis informasi politik secara kritis", "Merancang strategi verifikasi", "Berpartisipasi politik secara cerdas"],
        aktivitas_pembelajaran: ["Workshop fact-checking", "Proyek anti-hoaks", "Analisis berita politik", "Kampanye literasi politik"],
        integrasi_kbc: ["Cinta kepada Kebenaran verifikasi", "Cinta kepada Demokrasi partisipasi cerdas", "Cinta kepada Masyarakat edukasi"],
        penilaian: ["Pengetahuan literasi politik", "Keterampilan verifikasi informasi", "Sikap kritis", "Produk kampanye anti-hoaks", "Refleksi partisipasi politik"]
    },
    "Sains Terpadu: Menyelami Rahasia Alam": {
        pokok_bahasan: ["Integrasi Sains (Fisika, Kimia, Biologi)", "Fenomena Alam Kompleks", "Metode Ilmiah Terpadu"],
        mapel_kolaboratif: ["IPAS, Matematika, PAI, Bahasa Indonesia"],
        topik_kbc: ["Cinta kepada Ilmu Pengetahuan", "Cinta kepada Alam Ciptaan Allah"],
        profil_lulusan: ["Literasi Sains", "Berpikir Kritis", "Rasa Ingin Tahu Tinggi"],
        tujuan_pembelajaran: ["Memahami integrasi konsep sains", "Menganalisis fenomena alam kompleks", "Menerapkan metode ilmiah", "Mengembangkan rasa ingin tahu"],
        aktivitas_pembelajaran: ["Eksperimen sains terpadu", "Proyek penelitian fenomena alam", "Science fair", "Presentasi penemuan"],
        integrasi_kbc: ["Cinta kepada Ilmu eksplorasi", "Cinta kepada Alam observasi", "Cinta kepada Allah melalui sains"],
        penilaian: ["Pengetahuan sains terpadu", "Keterampilan metode ilmiah", "Sikap rasa ingin tahu", "Produk penelitian", "Refleksi pembelajaran sains"]
    },
    "Eksperimen Sains: Menyelidiki Fenomena Alam": {
        pokok_bahasan: ["Desain Eksperimen Ilmiah", "Fenomena Alam yang Menakjubkan", "Analisis Data dan Kesimpulan"],
        mapel_kolaboratif: ["IPAS, Matematika, Bahasa Indonesia, PAI"],
        topik_kbc: ["Cinta kepada Metode Ilmiah", "Cinta kepada Kebenaran Empiris"],
        profil_lulusan: ["Berpikir Ilmiah", "Problem Solver", "Teliti"],
        tujuan_pembelajaran: ["Memahami desain eksperimen", "Menganalisis fenomena alam", "Mengolah dan menginterpretasi data", "Mengembangkan sikap ilmiah"],
        aktivitas_pembelajaran: ["Eksperimen laboratorium", "Observasi fenomena alam", "Analisis data", "Presentasi hasil"],
        integrasi_kbc: ["Cinta kepada Ilmu melalui eksperimen", "Cinta kepada Kebenaran verifikasi", "Cinta kepada Alam investigasi"],
        penilaian: ["Pengetahuan metode eksperimen", "Keterampilan eksperimen", "Sikap teliti", "Produk laporan penelitian", "Refleksi proses ilmiah"]
    },
    "Bioteknologi Sederhana: Manfaat Mikroorganisme": {
        pokok_bahasan: ["Mikroorganisme Bermanfaat", "Bioteknologi Tradisional dan Modern", "Fermentasi dan Produk Bioteknologi"],
        mapel_kolaboratif: ["IPAS, Prakarya, PAI, Matematika"],
        topik_kbc: ["Cinta kepada Ilmu Bioteknologi", "Cinta kepada Inovasi Berkelanjutan"],
        profil_lulusan: ["Literasi Sains", "Kreatif", "Inovatif"],
        tujuan_pembelajaran: ["Memahami peran mikroorganisme", "Menganalisis proses bioteknologi", "Merancang produk fermentasi", "Mengembangkan inovasi bioteknologi sederhana"],
        aktivitas_pembelajaran: ["Eksperimen fermentasi", "Workshop bioteknologi", "Proyek produksi bioteknologi", "Presentasi inovasi"],
        integrasi_kbc: ["Cinta kepada Ilmu bioteknologi", "Cinta kepada Inovasi produk", "Cinta kepada Kebermanfaatan mikroorganisme"],
        penilaian: ["Pengetahuan bioteknologi", "Keterampilan eksperimen", "Sikap inovatif", "Produk bioteknologi", "Refleksi manfaat mikroorganisme"]
    },
    "Kecerdasan Buatan & Eksperimen Algoritma": {
        pokok_bahasan: ["Pengenalan Kecerdasan Buatan", "Algoritma Machine Learning Sederhana", "Eksperimen Model AI"],
        mapel_kolaboratif: ["Informatika, Matematika, IPAS, Bahasa Indonesia"],
        topik_kbc: ["Cinta kepada Teknologi AI", "Cinta kepada Pembelajaran Mesin"],
        profil_lulusan: ["Literasi AI", "Computational Thinking", "Inovatif"],
        tujuan_pembelajaran: ["Memahami konsep AI dan machine learning", "Menganalisis algoritma sederhana", "Merancang eksperimen AI", "Mengembangkan model sederhana"],
        aktivitas_pembelajaran: ["Workshop AI basics", "Coding algoritma ML", "Eksperimen model AI", "Proyek aplikasi AI sederhana"],
        integrasi_kbc: ["Cinta kepada Teknologi AI eksplorasi", "Cinta kepada Ilmu algoritma", "Cinta kepada Inovasi aplikasi"],
        penilaian: ["Pengetahuan AI dan ML", "Keterampilan coding", "Sikap eksploratif", "Produk model AI sederhana", "Refleksi potensi AI"]
    },
    "Membangun Peradaban: Sains, Sosial, Ekonomi, dan Spiritualitas": {
        pokok_bahasan: ["Integrasi Sains, Sosial, Ekonomi, dan Spiritualitas", "Pembangunan Berkelanjutan Holistik", "Peradaban Berbasis Nilai"],
        mapel_kolaboratif: ["IPAS, IPS, PAI, Ekonomi, PKn"],
        topik_kbc: ["Cinta kepada Peradaban Holistik", "Cinta kepada Pembangunan Berkelanjutan"],
        profil_lulusan: ["Berpikir Holistik", "Visioner", "Berakhlak Mulia"],
        tujuan_pembelajaran: ["Memahami integrasi ilmu untuk peradaban", "Menganalisis pembangunan holistik", "Merancang model peradaban berbasis nilai", "Mengembangkan visi peradaban"],
        aktivitas_pembelajaran: ["Diskusi interdisipliner", "Proyek model peradaban", "Studi kasus peradaban", "Refleksi peradaban Islami"],
        integrasi_kbc: ["Cinta kepada Peradaban membangun", "Cinta kepada Ilmu integrasi", "Cinta kepada Allah dalam peradaban"],
        penilaian: ["Pengetahuan pembangunan holistik", "Keterampilan berpikir integratif", "Sikap visioner", "Produk model peradaban", "Refleksi visi peradaban"]
    }
};

// Export untuk digunakan
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { learningDatabase };
}
