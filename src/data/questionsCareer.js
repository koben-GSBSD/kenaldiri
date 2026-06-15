// 25 Pertanyaan Survey Karir - ProfilKu Peluang
// Tujuan: 1) Buka pikiran butuh penghasilan tambahan 2) Identifikasi cocok dengan sales/konsultan 3) Lead ke peluang agen
// Tidak menyebut "asuransi" atau "agen" secara langsung — narasi hasilnya yang mengarah ke sana

// Dimensi scoring:
// N = Kebutuhan income tambahan (Need)
// S = Karakter sales/influence (Sales fit)
// F = Kebebasan & fleksibilitas (Freedom mindset)
// R = Kesiapan bertindak (Readiness)

export const CAREER_QUESTIONS = [
  // ─── FASE 1: Situasi & rasa (Q1-5) ───
  {
    id: 'cq1',
    phase: 1,
    text: 'Kalau kamu jujur sama diri sendiri — penghasilanmu saat ini terasa...',
    note: 'Tidak ada jawaban yang lebih baik. Ini tentang kondisi nyata kamu sekarang.',
    options: [
      { id: 'a', text: 'Lebih dari cukup, tidak ada keluhan', weights: { N:0, S:1, F:2, R:2 } },
      { id: 'b', text: 'Cukup, tapi tidak ada ruang untuk lebih', weights: { N:2, S:1, F:2, R:2 } },
      { id: 'c', text: 'Sering terasa kurang, terutama di akhir bulan', weights: { N:4, S:2, F:2, R:3 } },
      { id: 'd', text: 'Tidak pernah cukup, selalu ada yang harus dikompromikan', weights: { N:5, S:2, F:3, R:4 } },
    ]
  },
  {
    id: 'cq2',
    phase: 1,
    text: 'Dalam 12 bulan terakhir, seberapa sering kamu menunda sesuatu karena alasan finansial?',
    note: 'Misalnya: liburan, renovasi, beli sesuatu, pendidikan anak, atau perawatan kesehatan.',
    options: [
      { id: 'a', text: 'Tidak pernah — keuangan selalu mendukung', weights: { N:0, S:1, F:1, R:1 } },
      { id: 'b', text: 'Sekali dua kali', weights: { N:2, S:1, F:1, R:2 } },
      { id: 'c', text: 'Cukup sering — hampir setiap kuartal', weights: { N:4, S:2, F:2, R:3 } },
      { id: 'd', text: 'Sangat sering — ini menjadi pola hidup saya', weights: { N:5, S:2, F:3, R:4 } },
    ]
  },
  {
    id: 'cq3',
    phase: 1,
    text: 'Kalau gajimu tiba-tiba berhenti 2 bulan, kondisi keuanganmu...',
    options: [
      { id: 'a', text: 'Aman — punya tabungan lebih dari 6 bulan', weights: { N:0, S:1, F:2, R:1 } },
      { id: 'b', text: 'Lumayan — bisa bertahan 3-4 bulan dengan ketat', weights: { N:2, S:1, F:2, R:2 } },
      { id: 'c', text: 'Mulai sulit di bulan kedua', weights: { N:4, S:2, F:2, R:3 } },
      { id: 'd', text: 'Langsung berat dari minggu pertama', weights: { N:5, S:3, F:3, R:4 } },
    ]
  },
  {
    id: 'cq4',
    phase: 1,
    text: 'Seberapa nyaman kamu dengan kondisi karir atau pekerjaan saat ini?',
    options: [
      { id: 'a', text: 'Sangat nyaman — tidak ingin berubah', weights: { N:0, S:0, F:0, R:0 } },
      { id: 'b', text: 'Nyaman tapi ada rasa penasaran tentang pilihan lain', weights: { N:1, S:2, F:3, R:2 } },
      { id: 'c', text: 'Cukup, tapi saya tahu potensi saya lebih dari ini', weights: { N:2, S:3, F:3, R:3 } },
      { id: 'd', text: 'Tidak nyaman — saya sedang mencari sesuatu yang lebih', weights: { N:3, S:3, F:4, R:4 } },
    ]
  },
  {
    id: 'cq5',
    phase: 1,
    text: 'Pernah tidak, kamu terbangun malam dan memikirkan tentang uang atau masa depan finansial?',
    options: [
      { id: 'a', text: 'Tidak pernah — urusan itu sudah terkontrol', weights: { N:0, S:1, F:1, R:1 } },
      { id: 'b', text: 'Sesekali saat ada pengeluaran besar', weights: { N:2, S:1, F:1, R:2 } },
      { id: 'c', text: 'Lumayan sering', weights: { N:3, S:2, F:2, R:3 } },
      { id: 'd', text: 'Sering — ini salah satu yang sering ada di pikiran saya', weights: { N:5, S:2, F:3, R:4 } },
    ]
  },

  // ─── FASE 2: Karakter & kemampuan (Q6-12) ───
  {
    id: 'cq6',
    phase: 2,
    text: 'Orang-orang di sekitarmu sering meminta pendapatmu tentang apa?',
    note: 'Pilih yang paling sering terjadi secara alami.',
    options: [
      { id: 'a', text: 'Produk atau layanan yang bagus untuk dibeli atau dicoba', weights: { N:1, S:4, F:2, R:2 } },
      { id: 'b', text: 'Keputusan penting dalam hidup mereka', weights: { N:1, S:3, F:1, R:2 } },
      { id: 'c', text: 'Referensi orang, tempat, atau solusi yang bisa dipercaya', weights: { N:1, S:4, F:2, R:2 } },
      { id: 'd', text: 'Saya lebih sering yang bertanya ke orang lain', weights: { N:1, S:0, F:1, R:1 } },
    ]
  },
  {
    id: 'cq7',
    phase: 2,
    text: 'Kalau kamu menemukan produk atau tempat yang bagus, reaksi pertamamu biasanya...',
    options: [
      { id: 'a', text: 'Langsung cerita ke teman atau keluarga', weights: { N:0, S:5, F:2, R:3 } },
      { id: 'b', text: 'Share di media sosial', weights: { N:0, S:4, F:2, R:2 } },
      { id: 'c', text: 'Simpan untuk diri sendiri dulu', weights: { N:0, S:1, F:1, R:1 } },
      { id: 'd', text: 'Tergantung — kadang cerita, kadang tidak', weights: { N:0, S:2, F:1, R:2 } },
    ]
  },
  {
    id: 'cq8',
    phase: 2,
    text: 'Dalam percakapan, kamu lebih sering berperan sebagai...',
    options: [
      { id: 'a', text: 'Yang banyak mendengar dan memahami orang lain', weights: { N:0, S:4, F:1, R:2 } },
      { id: 'b', text: 'Yang berbagi cerita dan pengalaman', weights: { N:0, S:3, F:2, R:2 } },
      { id: 'c', text: 'Yang bertanya untuk mengerti lebih dalam', weights: { N:0, S:4, F:1, R:3 } },
      { id: 'd', text: 'Yang menggerakkan diskusi ke arah solusi', weights: { N:0, S:5, F:2, R:4 } },
    ]
  },
  {
    id: 'cq9',
    phase: 2,
    text: 'Pernah tidak kamu berhasil membuat seseorang mengubah pendapat atau keputusannya karena penjelasanmu?',
    options: [
      { id: 'a', text: 'Sering — saya memang suka membantu orang melihat dari sudut lain', weights: { N:0, S:5, F:2, R:3 } },
      { id: 'b', text: 'Sesekali dan rasanya sangat memuaskan', weights: { N:0, S:3, F:2, R:2 } },
      { id: 'c', text: 'Jarang tapi pernah', weights: { N:0, S:2, F:1, R:2 } },
      { id: 'd', text: 'Saya tidak terlalu suka mempengaruhi orang', weights: { N:0, S:0, F:1, R:1 } },
    ]
  },
  {
    id: 'cq10',
    phase: 2,
    text: 'Kalau ada teman yang bercerita tentang masalah keuangan keluarganya, reaksimu...',
    options: [
      { id: 'a', text: 'Ikut merasakan dan ingin bantu cari solusinya', weights: { N:0, S:4, F:1, R:3 } },
      { id: 'b', text: 'Mendengarkan dan memberikan dukungan moral', weights: { N:0, S:3, F:1, R:2 } },
      { id: 'c', text: 'Berbagi pengalaman serupa dari diri sendiri', weights: { N:1, S:2, F:1, R:2 } },
      { id: 'd', text: 'Tidak tahu harus berkata apa — ini bukan bidang saya', weights: { N:0, S:1, F:0, R:1 } },
    ]
  },
  {
    id: 'cq11',
    phase: 2,
    text: 'Seberapa nyaman kamu memulai percakapan dengan orang yang belum kamu kenal?',
    options: [
      { id: 'a', text: 'Sangat nyaman — saya suka ketemu orang baru', weights: { N:0, S:5, F:3, R:4 } },
      { id: 'b', text: 'Cukup nyaman dengan sedikit persiapan', weights: { N:0, S:3, F:2, R:3 } },
      { id: 'c', text: 'Agak canggung di awal tapi bisa adaptasi', weights: { N:0, S:2, F:1, R:2 } },
      { id: 'd', text: 'Lebih suka kalau ada yang mengenalkan dulu', weights: { N:0, S:1, F:0, R:1 } },
    ]
  },
  {
    id: 'cq12',
    phase: 2,
    text: 'Ketika kamu meyakini sesuatu itu baik, kamu...',
    options: [
      { id: 'a', text: 'Tidak sungkan merekomendasikannya ke orang lain', weights: { N:0, S:5, F:2, R:4 } },
      { id: 'b', text: 'Merekomendasikan tapi tidak terlalu push', weights: { N:0, S:3, F:2, R:2 } },
      { id: 'c', text: 'Menunggu sampai orang bertanya', weights: { N:0, S:1, F:1, R:1 } },
      { id: 'd', text: 'Menikmati sendiri tanpa terlalu banyak cerita', weights: { N:0, S:0, F:1, R:1 } },
    ]
  },

  // ─── FASE 3: Mindset kebebasan & waktu (Q13-18) ───
  {
    id: 'cq13',
    phase: 3,
    text: 'Kalau kamu bisa merancang "pekerjaan ideal" dari nol, elemen mana yang paling penting?',
    options: [
      { id: 'a', text: 'Bisa kerja kapan saja dan dari mana saja', weights: { N:1, S:2, F:5, R:3 } },
      { id: 'b', text: 'Penghasilan tidak terbatas — semakin kerja semakin dapat', weights: { N:3, S:3, F:3, R:4 } },
      { id: 'c', text: 'Membantu orang dan terasa bermakna', weights: { N:1, S:4, F:2, R:3 } },
      { id: 'd', text: 'Stabilitas dan jaminan jangka panjang', weights: { N:2, S:1, F:1, R:2 } },
    ]
  },
  {
    id: 'cq14',
    phase: 3,
    text: 'Dalam seminggu, kamu punya waktu bebas di luar pekerjaan utama sekitar...',
    options: [
      { id: 'a', text: 'Hampir tidak ada — sangat sibuk', weights: { N:1, S:1, F:1, R:1 } },
      { id: 'b', text: '5-10 jam, tergantung minggu', weights: { N:2, S:2, F:2, R:3 } },
      { id: 'c', text: '10-20 jam yang bisa saya kelola', weights: { N:2, S:2, F:3, R:4 } },
      { id: 'd', text: 'Lebih dari 20 jam — saya punya cukup waktu kosong', weights: { N:3, S:2, F:4, R:5 } },
    ]
  },
  {
    id: 'cq15',
    phase: 3,
    text: 'Kalau ada peluang penghasilan tambahan tapi butuh belajar hal baru selama 1-2 bulan, sikapmu...',
    options: [
      { id: 'a', text: 'Langsung tertarik — belajar itu investasi', weights: { N:2, S:2, F:3, R:5 } },
      { id: 'b', text: 'Tertarik tapi perlu tahu lebih dulu sebelum komitmen', weights: { N:2, S:2, F:2, R:3 } },
      { id: 'c', text: 'Tergantung seberapa besar potensinya', weights: { N:2, S:1, F:2, R:3 } },
      { id: 'd', text: 'Ragu — tidak yakin punya waktu dan energi', weights: { N:1, S:0, F:1, R:1 } },
    ]
  },
  {
    id: 'cq16',
    phase: 3,
    text: 'Menurutmu, sistem penghasilan yang paling menarik adalah...',
    options: [
      { id: 'a', text: 'Gaji tetap — aman dan bisa diprediksi', weights: { N:0, S:0, F:0, R:1 } },
      { id: 'b', text: 'Komisi — semakin banyak usaha semakin banyak dapat', weights: { N:3, S:4, F:3, R:4 } },
      { id: 'c', text: 'Passive income — uang bekerja meski saya istirahat', weights: { N:3, S:2, F:5, R:3 } },
      { id: 'd', text: 'Kombinasi ketiganya — diversifikasi pendapatan', weights: { N:4, S:3, F:4, R:4 } },
    ]
  },
  {
    id: 'cq17',
    phase: 3,
    text: '5 tahun dari sekarang, kondisi finansialmu yang ideal adalah...',
    options: [
      { id: 'a', text: 'Sama seperti sekarang tapi lebih stabil', weights: { N:0, S:0, F:1, R:1 } },
      { id: 'b', text: 'Penghasilan naik signifikan dari jalur karir saat ini', weights: { N:2, S:1, F:1, R:2 } },
      { id: 'c', text: 'Punya lebih dari satu sumber penghasilan aktif', weights: { N:4, S:3, F:3, R:4 } },
      { id: 'd', text: 'Punya bisnis atau karir sendiri yang menghasilkan bebas', weights: { N:4, S:4, F:5, R:4 } },
    ]
  },
  {
    id: 'cq18',
    phase: 3,
    text: 'Ketika melihat orang lain yang sudah bebas finansial, perasaan pertamamu adalah...',
    options: [
      { id: 'a', text: 'Terinspirasi dan ingin tahu bagaimana mereka lakukan', weights: { N:2, S:2, F:3, R:4 } },
      { id: 'b', text: 'Kagum tapi sadar itu bukan jalur saya', weights: { N:1, S:1, F:1, R:1 } },
      { id: 'c', text: 'Sedikit cemburu dan bertanya-tanya kenapa bukan saya', weights: { N:3, S:2, F:3, R:3 } },
      { id: 'd', text: 'Biasa saja — setiap orang punya jalannya sendiri', weights: { N:0, S:1, F:1, R:1 } },
    ]
  },

  // ─── FASE 4: Nilai & keberanian bertindak (Q19-23) ───
  {
    id: 'cq19',
    phase: 4,
    text: 'Kalau seseorang kamu kenal menawarkan peluang bisnis sampingan yang meyakinkan, reaksimu...',
    options: [
      { id: 'a', text: 'Langsung mau dengar lebih lanjut', weights: { N:2, S:2, F:2, R:5 } },
      { id: 'b', text: 'Tertarik tapi ingin riset dulu sebelum memutuskan', weights: { N:2, S:2, F:2, R:3 } },
      { id: 'c', text: 'Skeptis tapi tidak menutup pintu', weights: { N:1, S:1, F:1, R:2 } },
      { id: 'd', text: 'Langsung hindari — tidak percaya peluang seperti itu', weights: { N:0, S:0, F:0, R:0 } },
    ]
  },
  {
    id: 'cq20',
    phase: 4,
    text: 'Seberapa besar keinginanmu untuk berkontribusi lebih dari sekadar pekerjaan rutin harianmu?',
    options: [
      { id: 'a', text: 'Sangat besar — saya ingin dampak yang lebih nyata', weights: { N:1, S:3, F:2, R:4 } },
      { id: 'b', text: 'Cukup besar tapi belum tahu caranya', weights: { N:2, S:2, F:2, R:3 } },
      { id: 'c', text: 'Ada sedikit tapi tidak terlalu mendesak', weights: { N:1, S:1, F:1, R:2 } },
      { id: 'd', text: 'Pekerjaan sekarang sudah cukup bermakna', weights: { N:0, S:1, F:0, R:1 } },
    ]
  },
  {
    id: 'cq21',
    phase: 4,
    text: 'Ketika menghadapi penolakan atau ketidaksetujuan dari orang lain, kamu biasanya...',
    options: [
      { id: 'a', text: 'Tetap pada pendirian jika yakin itu benar', weights: { N:0, S:4, F:2, R:4 } },
      { id: 'b', text: 'Mengevaluasi ulang dan cari cara yang berbeda', weights: { N:0, S:4, F:2, R:3 } },
      { id: 'c', text: 'Menerima dan menyesuaikan diri', weights: { N:0, S:2, F:1, R:2 } },
      { id: 'd', text: 'Cenderung mengalah agar tidak ada konflik', weights: { N:0, S:0, F:0, R:1 } },
    ]
  },
  {
    id: 'cq22',
    phase: 4,
    text: 'Kalau ada sistem yang terbukti berhasil, ada pelatihan, dan ada komunitas yang mendukung — hal apa yang paling bisa membuatmu ragu?',
    options: [
      { id: 'a', text: 'Waktu — saya tidak yakin bisa membaginya', weights: { N:2, S:2, F:2, R:2 } },
      { id: 'b', text: 'Keyakinan diri — belum yakin saya cocok untuk ini', weights: { N:2, S:2, F:2, R:2 } },
      { id: 'c', text: 'Tidak ada — kalau semua itu ada, saya mau coba', weights: { N:2, S:3, F:3, R:5 } },
      { id: 'd', text: 'Butuh bukti nyata dari orang yang sudah berhasil dulu', weights: { N:2, S:2, F:2, R:3 } },
    ]
  },
  {
    id: 'cq23',
    phase: 4,
    text: 'Kamu pernah membantu seseorang membuat keputusan besar — dan hasilnya baik untuk mereka. Perasaan itu...',
    options: [
      { id: 'a', text: 'Sangat memuaskan — itu salah satu yang paling berarti', weights: { N:0, S:5, F:2, R:3 } },
      { id: 'b', text: 'Senang tapi tidak terlalu saya pikirkan', weights: { N:0, S:2, F:1, R:2 } },
      { id: 'c', text: 'Baru sadar setelah ini bahwa saya pernah melakukannya', weights: { N:0, S:3, F:1, R:2 } },
      { id: 'd', text: 'Saya jarang di posisi seperti itu', weights: { N:0, S:1, F:0, R:1 } },
    ]
  },

  // ─── FASE 5: Penutup — sinyal kesiapan (Q24-25) ───
  {
    id: 'cq24',
    phase: 5,
    text: 'Dari skala 1–5, seberapa terbuka kamu terhadap peluang karir atau penghasilan baru yang belum pernah kamu coba sebelumnya?',
    note: '1 = Tertutup sepenuhnya  ·  5 = Sangat terbuka dan siap',
    isScale: true,
    options: [
      { id: '1', text: '1 — Tidak tertarik sama sekali', weights: { N:0, S:0, F:0, R:0 } },
      { id: '2', text: '2 — Belum terlalu terbuka', weights: { N:1, S:0, F:1, R:1 } },
      { id: '3', text: '3 — Terbuka tapi perlu diyakinkan', weights: { N:2, S:1, F:2, R:2 } },
      { id: '4', text: '4 — Cukup terbuka dan penasaran', weights: { N:3, S:2, F:3, R:3 } },
      { id: '5', text: '5 — Sangat terbuka dan siap mulai', weights: { N:4, S:3, F:4, R:5 } },
    ]
  },
  {
    id: 'cq25',
    phase: 5,
    text: 'Satu hal yang paling kamu inginkan dari sebuah peluang karir baru, kalau boleh hanya pilih satu...',
    options: [
      { id: 'a', text: 'Penghasilan yang jauh lebih besar', weights: { N:5, S:2, F:2, R:3 } },
      { id: 'b', text: 'Kebebasan waktu dan fleksibilitas', weights: { N:2, S:2, F:5, R:3 } },
      { id: 'c', text: 'Rasa bermakna — membantu orang lain secara nyata', weights: { N:1, S:5, F:2, R:3 } },
      { id: 'd', text: 'Pengakuan dan pertumbuhan pribadi', weights: { N:2, S:3, F:3, R:4 } },
    ]
  },
]
