# React SCORM Player Component
Komponen React untuk memuat dan menjalankan paket SCORM 1.2 dan SCORM 2004. Komponen ini menyediakan runtime environment yang dibutuhkan oleh konten SCORM untuk berkomunikasi dengan Learning Management System (LMS), serta menyediakan UI navigasi kustom untuk SCORM file tertentu , seperti dari eXeLearning.

## Fitur

- Kompability: Mendukung SCORM 1.2 dan SCORM 2004 secara otomatis.
- Manifest Parsing: Secara otomatis membaca dan mem-parsing file imsmanifest.xml untuk mendapatkan struktur kursus (SCOs).
- Manajemen Progress: Menyimpan dan melanjutkan progres pembelajaran pengguna (saat ini menggunakan localStorage, yang nantinya silahkan disesuaikan dengan backend).


## Struktur
```
src/
└── components/
    └── ScormPlayer/
        ├── index.jsx           # Komponen utama 
        ├── components/
        │   ├── NavigationBar.jsx    # UI Navigasi (Next, Prev, Progress Bar)
        │   ├── QuizResultPage.jsx   # Halaman hasil saat kuis tidak bisa diulang
        │   └── QuizScoreDisplay.jsx # Menampilkan skor di bar navigasi
        ├── hooks/
        │   ├── useScormManifest.js  # Logic untuk fetch & parse manifest
        │   └── useScormProgress.js  # Logic untuk memuat progress awal
        ├── lib/
        │   └── utils.js             # Kumpulan fungsi helper
        └── actions.js               # Fungsi terpusat untuk menyimpan progress
```

## Dokumentasi Props Scormplayer
Ini adalah properti (props) yang dapat diteruskan ke komponen <ScormPlayer />.

| Prop | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| **`courseId`** | `string` | **Wajib** | ID unik untuk kursus, digunakan sebagai kunci utama untuk menyimpan progres. |
| **`userId`** | `string` | **Wajib** | ID unik untuk pengguna, digunakan sebagai kunci utama untuk menyimpan progres. |
| **`manifestUrl`** | `string` | **Wajib** | URL lengkap menuju file `imsmanifest.xml` dari paket SCORM. |
| `playerBehavior` | `string` | `'NORMAL'` | Mengatur mode navigasi. `'NORMAL'`: SCO mengontrol navigasi. `'LMS_HANDLE_NAVIGATION'`: Player menampilkan UI navigasi (contohnya eXeLearning wajib pakai ini). |
| `quizPage` | `number` | `false` | Nomor urutan SCO yang merupakan halaman kuis (dimulai dari 1). Contoh: `3` jika SCO ketiga adalah kuis. |
| `isQuizRepeatable`| `boolean`| `true` | Menentukan apakah kuis dapat diulang. Jika `false`, setelah percobaan habis, halaman hasil akhir akan ditampilkan. |
| `quizAttempt` | `number` | `0` | (Belum diimplementasikan penuh) Batas maksimal percobaan untuk mengerjakan kuis. |


## Contoh Penggunaan
```JS
// src/pages/CourseDetailPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import ScormPlayer from "components/ScormPlayer";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  
  // Hardcoded user, idealnya dari state/auth context
  const userId = "user-123";

  // Data kursus, idealnya dari API call
  const course = {
    id: courseId,
    manifestUrl: `/scorm-courses/${courseId}/imsmanifest.xml`,
    playerBehavior: "LMS_HANDLE_NAVIGATION", // atau 'NORMAL'
    quizPage: 4, // SCO ke-4 adalah kuis
    isQuizRepeatable: true,
  };

  if (!course) {
    return <div>Loading course...</div>;
  }

  return (
    <div className="w-screen h-screen">
      <ScormPlayer
        courseId={course.id}
        userId={userId}
        manifestUrl={course.manifestUrl}
        playerBehavior={course.playerBehavior}
        quizPage={course.quizPage}
        isQuizRepeatable={course.isQuizRepeatable}
      />
    </div>
  );
}
```

## Cara Kerja

1.  **Inisialisasi**: Saat `ScormPlayer` di-mount, ia menerima `props` seperti `courseId`, `userId`, dan `manifestUrl`.

2.  **Memuat Manifest**: `useScormManifest` melakukan `fetch` ke `manifestUrl`. XML yang diterima kemudian di-parsing untuk mendeteksi versi SCORM (1.2 atau 2004) dan mengekstrak daftar SCOs (item-item pembelajaran).

3.  **Memuat Progres**: `useScormProgress` membaca `localStorage` untuk mencari data progres yang cocok dengan `courseId` dan `userId`. Jika ada, *state* progres akan diatur, dan player akan membuka SCO terakhir yang diakses pengguna.

4.  **Menyiapkan API SCORM**: Berdasarkan versi yang terdeteksi, instance `Scorm12API` atau `Scorm2004API` dari library `scorm-again` dibuat dan ditempelkan ke objek `window` (`window.API` atau `window.API_1484_11`). Ini memungkinkan konten SCORM di dalam `<iframe>` untuk berkomunikasi.

5.  **Render Konten**: Konten SCO yang aktif ditampilkan di dalam sebuah `<iframe>`.

6.  **Komunikasi & Penyimpanan**:
    * Konten di dalam `<iframe>` memanggil fungsi-fungsi SCORM API (misalnya `LMSSetValue`, `LMSCommit`, `LMSFinish`).
    * Library `scorm-again` menangkap panggilan ini. Saat event `Commit` (simpan) atau `Terminate` (selesai) terpicu, fungsi `actionSaveProgress` akan dijalankan.
    * `actionSaveProgress` mengambil semua data CMI terbaru dari API, menggabungkannya dengan data progres yang sudah

## Penting!
- Sesuaikan Proxy utuk CDN, karena ini pakai Netlify, settingan proxy CDN ada `netlify.toml` & cara menyajikan URL data seperti di `src/hardCodeData.js`