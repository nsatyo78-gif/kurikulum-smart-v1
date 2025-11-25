# Kurikulum Smart Innovative

Sistem Informasi Manajemen Sekolah Terpadu untuk SMK Negeri 1 Purbalingga. Aplikasi ini membantu pengelolaan data sekolah, jadwal pelajaran, dan administrasi secara efisien.

## Fitur Utama

*   **Dashboard Interaktif**: Statistik real-time siswa, guru, dan kegiatan sekolah.
*   **Manajemen Data Guru**: Kelola profil, beban mengajar, dan tugas tambahan.
*   **Manajemen Data Siswa**: Database siswa lengkap dengan fitur kenaikan kelas otomatis.
*   **Plotting Guru Mentor (Wali)**: Penugasan guru pembimbing secara individual atau massal.
*   **Jadwal Pelajaran Cerdas**: Pembuatan jadwal otomatis dibantu AI (Gemini) dan fitur manual drag-and-drop.
*   **Manajemen PKL**: Monitoring siswa PKL, plotting DUDI, dan cetak Surat Tugas/SK otomatis.
*   **Laporan & Supervisi**: Pengumpulan bukti fisik kinerja guru dan penilaian supervisi digital.

## Teknologi

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **Build Tool**: Vite
*   **AI Integration**: Google Gemini API
*   **Database**: Supabase (Optional/Hybrid)

## Cara Menjalankan (Local)

1.  Clone repository ini.
2.  Install dependencies: `npm install`
3.  Jalankan server development: `npm run dev`

## Deployment (Cloudflare Pages)

Aplikasi ini dioptimalkan untuk dideploy menggunakan **Cloudflare Pages** karena performanya yang cepat dan kuota gratis yang besar.

1.  Upload kode ke GitHub.
2.  Buka Dashboard Cloudflare Pages.
3.  Connect ke GitHub Repository ini.
4.  Set **Build Command**: `npm run build`
5.  Set **Output Directory**: `dist`
6.  Tambahkan Environment Variables (API Keys) di pengaturan Cloudflare.

---
&copy; 2025 SMK Negeri 1 Purbalingga