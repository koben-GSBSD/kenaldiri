# oneforlife.id — Website

Website resmi oneforlife.id, Mitra Resmi Prudential Indonesia. Static site (HTML/CSS/JS murni, tanpa framework/build step) — di-hosting di Vercel, terhubung ke repo GitHub ini untuk auto-deploy setiap push ke `main`.

## Struktur
```
/
├── index.html        # Halaman Beranda
├── vercel.json        # Konfigurasi header keamanan & routing
├── images/
│   ├── proteksipru1.png   # Gambar hero (upload manual dari Koben)
│   ├── tombolwa.png       # Ikon tombol WhatsApp mengambang (upload manual dari Koben)
│   └── favicon.png        # Favicon situs (belum ada, perlu ditambahkan)
└── README.md
```

## Sebelum Deploy Pertama Kali
1. Tambahkan file `proteksipru1.png`, `tombolwa.png`, dan `favicon.png` ke folder `/images/` (belum ada di repo ini — upload manual).
2. Pastikan nomor WhatsApp di `index.html` (`6281285724093`) sudah benar.

## Deploy
Push ke branch `main` → Vercel otomatis build & deploy (tidak perlu build step, murni file statis).

## Domain
Domain `oneforlife.id` perlu diarahkan (DNS) ke Vercel — lihat panduan terpisah dari Claude untuk langkah-langkahnya.

## Halaman Selanjutnya
Baru halaman **Beranda** yang final. Halaman Tentang Kami, Produk Proteksi, Edukasi, dan Kontak masih dalam bentuk draft terpisah dan perlu dikerjakan menyusul dengan pola yang sama (file HTML terpisah per halaman, bukan satu file SPA).
