# SIM-AKAD MAN Banggai

Aplikasi frontend sederhana untuk **Sistem Informasi Monitoring Akademik (SIM-AKAD)** berbasis React + Vite + Tailwind CSS.

## 1. Prasyarat

- Node.js (disarankan versi LTS terbaru)
- npm (terpasang bersama Node.js)

## 2. Cara Menjalankan di Lokal

Dari folder proyek:

```bash
cd c:/xampp/htdocs/SIM_AKAD
npm install
npm run dev
```

Lalu buka alamat yang muncul di terminal (biasanya `http://localhost:5173/`).

### (Opsional) Aktifkan fitur "Soal / Asesmen" (Gemini)

#### Rekomendasi untuk dibagikan ke banyak guru (tanpa API key per perangkat)

Simpan API key di **server PHP** (lebih aman dan tidak merepotkan guru):

1. Buka folder `api/`
2. Salin file contoh:
   - `api/secret.example.php` → `api/secret.php`
3. Edit `api/secret.php` lalu isi:
   - `$GEMINI_API_KEY = 'ISI_API_KEY_ANDA';`

Setelah itu, semua akun guru/admin yang sudah login bisa memakai menu **Soal / Asesmen** tanpa mengisi API key di browser.

#### Alternatif (untuk development saja)

Jika Anda hanya ingin uji coba lokal di Vite, bisa memakai environment variable Vite:

1. Salin file contoh:
   ```bash
   copy .env.example .env
   ```
   (Jika pakai Git Bash / Linux / macOS: `cp .env.example .env`)

2. Isi API key di file `.env`:
   ```
   VITE_GEMINI_API_KEY=ISI_API_KEY_ANDA
   ```

3. Restart server dev jika sudah berjalan:
   - Stop (`Ctrl+C`) lalu jalankan lagi `npm run dev`.

Tanpa API key, menu "Soal / Asesmen" tetap muncul namun akan menampilkan pesan bahwa API key belum diset.

## 3. Build untuk Produksi

```bash
cd c:/xampp/htdocs/SIM_AKAD
npm run build
```

Hasil build akan ada di folder `dist/`.

## 4. Upload ke Hosting (cPanel / Shared Hosting)

1. Jalankan build produksi:
   ```bash
   npm run build
   ```
2. Buka file manager di cPanel (atau FTP).
3. Masuk ke folder domain Anda, misalnya:
   - `public_html/` (untuk domain utama), atau
   - `public_html/sim-akad/` (jika ingin di subfolder).
4. Upload **seluruh isi** folder `dist/` ke sana (bukan folder `dist`-nya, tetapi isinya):
   - `index.html`
   - `assets/` (dan file-file lain yang dihasilkan Vite)
5. Pastikan file `index.html` berada langsung di dalam folder tujuan (misalnya `public_html/index.html`).
6. Akses melalui browser:
   - `https://nama-domain-anda.com` atau
   - `https://nama-domain-anda.com/sim-akad` (jika di subfolder).

> Catatan: Aplikasi ini **tidak** menggunakan React Router saat ini, jadi tidak perlu pengaturan khusus `.htaccess`. Cukup pastikan hasil build ditempatkan di folder web root yang benar.

## 5. Integrasi dengan Backend (Opsional)

Jika nanti ingin dihubungkan dengan backend PHP/Laravel di XAMPP atau hosting:

- Endpoint API (misalnya `api/guru`, `api/agenda`) bisa dibuat di sisi server.
- Komponen React di `src/SimAkadDashboard.jsx` dapat diubah untuk mengambil data dari API menggunakan `fetch` atau `axios`.
- Untuk lingkungan produksi, sesuaikan base URL API melalui variabel lingkungan Vite (`.env` / `import.meta.env`).
