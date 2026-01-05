# Panduan Deploy ke Vercel

## Langkah-langkah Deployment:

### 1. Install Vercel CLI (jika belum)
```bash
npm install -g vercel
```

### 2. Login ke Vercel
```bash
vercel login
```
Ikuti instruksi untuk login menggunakan email atau GitHub.

### 3. Deploy Aplikasi
Dari folder `app-kokurikuler-man-banggai`, jalankan:
```bash
vercel
```

Jawab pertanyaan:
- **Set up and deploy?** → Yes (Y)
- **Which scope?** → Pilih akun Anda
- **Link to existing project?** → No (N)
- **Project name?** → app-kokurikuler-man-banggai (atau custom)
- **Directory?** → ./ (enter)
- **Override settings?** → No (N)

### 4. Deploy Production
Setelah preview berhasil, deploy ke production:
```bash
vercel --prod
```

### 5. Dapatkan URL
Setelah deployment selesai, Anda akan mendapat URL seperti:
```
https://app-kokurikuler-man-banggai.vercel.app
```

URL ini dapat dibagikan ke siapa saja dengan akses link!

---

## Cara Update Aplikasi

Jika ada perubahan, lakukan:

1. Commit perubahan:
```bash
git add .
git commit -m "Deskripsi perubahan"
```

2. Deploy ulang:
```bash
vercel --prod
```

---

## Troubleshooting

### Error: Command not found 'vercel'
Install Vercel CLI terlebih dahulu:
```bash
npm install -g vercel
```

### Error: No such file or directory
Pastikan Anda berada di folder yang benar:
```bash
cd c:\xampp\htdocs\KMA1503\app-kokurikuler-man-banggai
```

---

## Alternatif: Deploy via Vercel Dashboard

1. Buka https://vercel.com
2. Login dengan GitHub/GitLab/Bitbucket
3. Push repository ke GitHub
4. Import project dari Vercel dashboard
5. Vercel akan otomatis deploy

---

**Dibuat oleh:** MAN Banggai - 2025
