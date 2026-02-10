# SOP NBC Cloud (React + Google Sheets)

Aplikasi manajemen operasional Rumah Sehat Bekam NBC versi Cloud.

## Fitur
- **Dashboard**: Ringkasan status.
- **Operasional**: Checklist harian (Simpan ke Google Sheets).
- **Keuangan**: Laporan laba harian (Simpan ke Google Sheets).
- **Multi-User**: Login sederhana dengan data dari Sheet.

## Cara Install & Jalan

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

3. **Build untuk Produksi**
   ```bash
   npm run build
   ```

## Konfigurasi Database (Google Sheets)

Aplikasi ini menggunakan Google Sheets sebagai database.

1. Buka file `APPS_SCRIPT.md` untuk panduan lengkap membuat Google Sheet dan Script.
2. Setelah mendapatkan **Web App URL** dari Google Apps Script, buka file:
   `src/services/api.js`
3. Ganti variabel `GOOGLE_SCRIPT_URL` dengan URL anda:
   ```javascript
   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/...../exec";
   ```

## Struktur Project
- `src/components`: Komponen UI (Sidebar, Dashboard, dll).
- `src/services`: Logika API ke Google Sheets.
- `src/App.jsx`: Layout utama.
