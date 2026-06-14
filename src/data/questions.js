// Setiap pilihan memiliki bobot untuk 4 dimensi:
// P = Pelindung Keluarga, R = Perencana Risiko, E = Penikmat Hidup, A = Pencari Aman
// Bobot digunakan scoring engine untuk menentukan tipe kepribadian
// Tag produk: 'PCB88' | 'PRUFuture' | 'PRUWellMedical'

export const QUESTIONS = [
  {
    id: 'q1',
    phase: 1,
    text: 'Kalau kamu punya satu hari libur penuh tanpa rencana, paling mungkin kamu akan...',
    note: 'Tidak ada jawaban benar atau salah — ini murni tentang kamu',
    options: [
      { id: 'a', text: 'Rebahan dan nonton series', weights: { P:1, R:1, E:3, A:1 } },
      { id: 'b', text: 'Jalan-jalan spontan', weights: { P:1, R:1, E:4, A:0 } },
      { id: 'c', text: 'Ketemuan sama orang-orang tersayang', weights: { P:4, R:1, E:2, A:1 } },
      { id: 'd', text: 'Beresin hal yang tertunda', weights: { P:1, R:4, E:0, A:3 } },
    ]
  },
  {
    id: 'q2',
    phase: 1,
    text: 'Teman-teman di sekitarmu biasanya mendeskripsikan kamu sebagai orang yang...',
    options: [
      { id: 'a', text: 'Selalu punya ide dan energi', weights: { P:1, R:1, E:4, A:1 } },
      { id: 'b', text: 'Bisa diandalkan dan konsisten', weights: { P:2, R:3, E:0, A:4 } },
      { id: 'c', text: 'Tenang dan tidak buru-buru', weights: { P:1, R:2, E:2, A:3 } },
      { id: 'd', text: 'Yang pertama diingat kalau ada masalah', weights: { P:4, R:2, E:0, A:2 } },
    ]
  },
  {
    id: 'q3',
    phase: 1,
    text: 'Dari keempat ini, mana yang paling sering bikin kamu semangat bangun pagi?',
    options: [
      { id: 'a', text: 'Ada yang ditunggu-tunggu hari ini', weights: { P:1, R:1, E:4, A:1 } },
      { id: 'b', text: 'Daftar tugas yang ingin diselesaikan', weights: { P:1, R:4, E:0, A:3 } },
      { id: 'c', text: 'Orang-orang yang akan kamu temui', weights: { P:4, R:1, E:2, A:1 } },
      { id: 'd', text: 'Perasaan bahwa hari ini bisa lebih baik dari kemarin', weights: { P:2, R:3, E:1, A:2 } },
    ]
  },
  {
    id: 'q4',
    phase: 1,
    text: 'Waktu kecil, kamu tipe anak yang...',
    note: 'Pertanyaan ini sering mengungkap banyak tentang karakter yang terbawa sampai dewasa',
    options: [
      { id: 'a', text: 'Suka eksplor dan coba hal baru', weights: { P:1, R:1, E:4, A:0 } },
      { id: 'b', text: 'Ikut aturan dan suka teratur', weights: { P:1, R:3, E:0, A:4 } },
      { id: 'c', text: 'Jagain adik atau teman yang lebih lemah', weights: { P:5, R:1, E:0, A:2 } },
      { id: 'd', text: 'Pemimpin kelompok bermain', weights: { P:3, R:2, E:2, A:1 } },
    ]
  },
  {
    id: 'q5',
    phase: 1,
    text: 'Kalau ada berita baik mendadak hari ini — misalnya dapat rezeki tidak terduga — reaksi pertamamu biasanya...',
    options: [
      { id: 'a', text: 'Langsung kepikiran mau dipakai buat apa', weights: { P:2, R:2, E:2, A:2 } },
      { id: 'b', text: 'Kabarin keluarga atau pasangan dulu', weights: { P:5, R:1, E:1, A:1 } },
      { id: 'c', text: 'Taruh ke tempat aman dulu, pikirin nanti', weights: { P:1, R:4, E:0, A:4 } },
      { id: 'd', text: 'Rayakan sama orang-orang terdekat', weights: { P:3, R:0, E:4, A:1 } },
    ]
  },
  {
    id: 'q6',
    phase: 2,
    text: 'Setelah gajian atau terima penghasilan, biasanya dalam beberapa hari pertama uang itu kemana duluan?',
    options: [
      { id: 'a', text: 'Bayar tagihan dan kewajiban', weights: { P:2, R:4, E:0, A:4 } },
      { id: 'b', text: 'Belanja kebutuhan bulanan', weights: { P:2, R:2, E:1, A:3 } },
      { id: 'c', text: 'Nabung atau transfer ke rekening lain', weights: { P:1, R:5, E:0, A:3 } },
      { id: 'd', text: 'Belum tentu, tergantung mood', weights: { P:1, R:0, E:4, A:1 } },
    ]
  },
  {
    id: 'q7',
    phase: 2,
    text: 'Kalau lagi jalan ke mal dan ketemu barang yang kamu suka tapi belum direncanakan, kamu biasanya...',
    options: [
      { id: 'a', text: 'Langsung beli — hidup terlalu singkat', weights: { P:0, R:0, E:5, A:0 } },
      { id: 'b', text: 'Foto dulu, pertimbangin semalam', weights: { P:1, R:2, E:2, A:2 } },
      { id: 'c', text: 'Tanya diri: ini butuh atau cuma mau?', weights: { P:2, R:4, E:0, A:3 } },
      { id: 'd', text: 'Skip — sudah ada budgetnya sendiri', weights: { P:1, R:5, E:0, A:4 } },
    ]
  },
  {
    id: 'q8',
    phase: 2,
    text: 'Dari keempat hal ini, mana yang paling susah kamu kurangi meski lagi harus lebih hemat?',
    options: [
      { id: 'a', text: 'Makan enak dan nongkrong', weights: { P:0, R:0, E:5, A:0 } },
      { id: 'b', text: 'Beli buku, kursus, atau upgrade skill', weights: { P:1, R:3, E:1, A:2 } },
      { id: 'c', text: 'Liburan atau pengalaman baru', weights: { P:0, R:1, E:5, A:0 } },
      { id: 'd', text: 'Kebutuhan dan keinginan anak atau keluarga', weights: { P:5, R:2, E:0, A:2 } },
    ]
  },
  {
    id: 'q9',
    phase: 2,
    text: 'Kalau kamu punya rencana besar 6–12 bulan ke depan, biasanya kamu...',
    options: [
      { id: 'a', text: 'Sudah mulai sisihkan dari sekarang', weights: { P:2, R:5, E:0, A:3 } },
      { id: 'b', text: 'Mulai nabung saat sudah dekat waktunya', weights: { P:1, R:2, E:1, A:2 } },
      { id: 'c', text: 'Andalkan tabungan yang ada saat ini', weights: { P:1, R:1, E:2, A:2 } },
      { id: 'd', text: 'Lihat kondisi nanti, belum terlalu kepikiran', weights: { P:0, R:0, E:4, A:1 } },
    ]
  },
  {
    id: 'q10',
    phase: 2,
    text: 'Menurut kamu, orang yang hidupnya "terasa tenang secara finansial" itu bedanya apa?',
    options: [
      { id: 'a', text: 'Punya penghasilan lebih besar', weights: { P:1, R:1, E:2, A:2 } },
      { id: 'b', text: 'Punya tabungan yang cukup', weights: { P:1, R:4, E:0, A:3 } },
      { id: 'c', text: 'Punya proteksi dari hal tak terduga', weights: { P:3, R:3, E:0, A:3 }, productHint: 'PCB88' },
      { id: 'd', text: 'Tidak punya hutang', weights: { P:1, R:3, E:0, A:4 } },
    ]
  },
  {
    id: 'q11',
    phase: 2,
    text: 'Di antara pengeluaran bulananmu, mana yang paling sering kamu anggap "sayang tapi perlu"?',
    options: [
      { id: 'a', text: 'Tagihan yang tidak terasa tapi rutin', weights: { P:1, R:2, E:1, A:3 } },
      { id: 'b', text: 'Kebutuhan anak dan keluarga', weights: { P:5, R:2, E:0, A:1 } },
      { id: 'c', text: 'Pengeluaran kesehatan', weights: { P:2, R:3, E:0, A:3 }, productHint: 'PRUWellMedical' },
      { id: 'd', text: 'Cicilan atau kewajiban finansial', weights: { P:1, R:3, E:0, A:3 } },
    ]
  },
  {
    id: 'q12',
    phase: 3,
    text: 'Dalam keluargamu, kamu lebih sering berperan sebagai...',
    options: [
      { id: 'a', text: 'Pengambil keputusan utama', weights: { P:3, R:2, E:1, A:2 } },
      { id: 'b', text: 'Yang memastikan semua orang baik-baik saja', weights: { P:5, R:2, E:0, A:1 } },
      { id: 'c', text: 'Penyeimbang suasana', weights: { P:2, R:1, E:3, A:2 } },
      { id: 'd', text: 'Sandaran saat ada masalah', weights: { P:4, R:2, E:0, A:2 } },
    ]
  },
  {
    id: 'q13',
    phase: 3,
    text: 'Kalau kamu tanya ke diri sendiri — siapa yang paling bergantung secara finansial padamu saat ini?',
    options: [
      { id: 'a', text: 'Pasangan dan anak', weights: { P:5, R:2, E:0, A:1 }, productHint: 'PCB88' },
      { id: 'b', text: 'Orang tua', weights: { P:4, R:2, E:0, A:2 }, productHint: 'PCB88' },
      { id: 'c', text: 'Belum ada — masih untuk diri sendiri', weights: { P:0, R:2, E:3, A:3 } },
      { id: 'd', text: 'Beberapa orang sekaligus', weights: { P:5, R:3, E:0, A:0 }, productHint: 'PCB88' },
    ]
  },
  {
    id: 'q14',
    phase: 3,
    text: 'Kalau kamu tidak bisa bekerja selama 3 bulan karena sesuatu, kira-kira kondisi finansial keluargamu...',
    options: [
      { id: 'a', text: 'Masih aman — ada cadangan cukup', weights: { P:2, R:5, E:1, A:4 } },
      { id: 'b', text: 'Lumayan ketat tapi masih bisa', weights: { P:2, R:2, E:1, A:2 } },
      { id: 'c', text: 'Mulai kesulitan setelah bulan pertama', weights: { P:3, R:1, E:0, A:1 }, productHint: 'PCB88' },
      { id: 'd', text: 'Langsung terasa berat dari hari pertama', weights: { P:4, R:0, E:0, A:0 }, productHint: 'PCB88' },
    ]
  },
  {
    id: 'q15',
    phase: 3,
    text: 'Sukses menurutmu itu seperti apa? Pilih yang paling dekat dengan definisimu',
    options: [
      { id: 'a', text: 'Punya kebebasan finansial dan waktu', weights: { P:1, R:3, E:3, A:2 } },
      { id: 'b', text: 'Keluarga sejahtera dan bahagia', weights: { P:5, R:2, E:0, A:1 }, productHint: 'PRUFuture' },
      { id: 'c', text: 'Pencapaian karir atau bisnis yang membanggakan', weights: { P:1, R:2, E:3, A:2 } },
      { id: 'd', text: 'Bisa bantu orang lain dan berkontribusi', weights: { P:4, R:1, E:1, A:2 } },
    ]
  },
  {
    id: 'q16',
    phase: 3,
    text: 'Apa hal yang paling ingin kamu pastikan sudah beres sebelum anak-anakmu dewasa?',
    note: 'Jika belum punya anak, bayangkan orang yang paling kamu sayangi',
    options: [
      { id: 'a', text: 'Pendidikan mereka terjamin', weights: { P:4, R:3, E:0, A:1 }, productHint: 'PRUFuture' },
      { id: 'b', text: 'Mereka punya karakter dan nilai yang kuat', weights: { P:3, R:1, E:1, A:2 } },
      { id: 'c', text: 'Kondisi finansial keluarga stabil', weights: { P:4, R:4, E:0, A:2 }, productHint: 'PCB88' },
      { id: 'd', text: 'Mereka tahu mereka dicintai dan didukung', weights: { P:3, R:1, E:2, A:2 } },
    ]
  },
  {
    id: 'q17',
    phase: 3,
    text: 'Seberapa sering kamu kepikiran soal "bagaimana kondisi keluarga kalau tiba-tiba aku tidak ada"?',
    options: [
      { id: 'a', text: 'Sering — ini yang paling bikin gelisah', weights: { P:5, R:3, E:0, A:1 }, productHint: 'PCB88' },
      { id: 'b', text: 'Kadang-kadang kepikiran', weights: { P:3, R:2, E:1, A:2 }, productHint: 'PCB88' },
      { id: 'c', text: 'Jarang, belum sampai ke sana', weights: { P:1, R:1, E:3, A:2 } },
      { id: 'd', text: 'Sudah punya gambaran dan sudah disiapkan', weights: { P:3, R:5, E:0, A:4 } },
    ]
  },
  {
    id: 'q18',
    phase: 4,
    text: 'Dari skenario berikut, mana yang paling bikin kamu tidak nyaman membayangkannya?',
    options: [
      { id: 'a', text: 'Tiba-tiba sakit parah dan butuh biaya besar', weights: { P:2, R:3, E:0, A:2 }, productHint: 'PRUWellMedical' },
      { id: 'b', text: 'Kehilangan penghasilan mendadak', weights: { P:3, R:3, E:0, A:2 }, productHint: 'PCB88' },
      { id: 'c', text: 'Tidak bisa biayai sekolah anak', weights: { P:5, R:2, E:0, A:1 }, productHint: 'PRUFuture' },
      { id: 'd', text: 'Meninggalkan keluarga tanpa persiapan', weights: { P:5, R:3, E:0, A:1 }, productHint: 'PCB88' },
    ]
  },
  {
    id: 'q19',
    phase: 4,
    text: 'Kalau ada tawaran investasi yang potensi untungnya 3x lipat dalam 3 tahun, tapi ada risiko rugi sebagian, sikapmu...',
    options: [
      { id: 'a', text: 'Langsung masuk — peluang harus diambil', weights: { P:0, R:0, E:4, A:0 } },
      { id: 'b', text: 'Masuk sebagian — tidak mau all-in', weights: { P:1, R:2, E:2, A:1 } },
      { id: 'c', text: 'Pelajari dulu sebelum memutuskan', weights: { P:1, R:4, E:1, A:3 } },
      { id: 'd', text: 'Hindari — tidak nyaman dengan risiko kehilangan', weights: { P:2, R:3, E:0, A:4 }, productHint: 'PCB88' },
    ]
  },
  {
    id: 'q20',
    phase: 4,
    text: 'Saat menghadapi keputusan besar, kamu biasanya mengandalkan...',
    options: [
      { id: 'a', text: 'Riset dan data — logika dulu', weights: { P:1, R:4, E:0, A:3 } },
      { id: 'b', text: 'Intuisi dan perasaan', weights: { P:2, R:0, E:4, A:1 } },
      { id: 'c', text: 'Pendapat orang yang dipercaya', weights: { P:2, R:2, E:1, A:3 } },
      { id: 'd', text: 'Kombinasi semuanya', weights: { P:2, R:3, E:1, A:2 } },
    ]
  },
  {
    id: 'q21',
    phase: 4,
    text: 'Menurut kamu, orang yang sudah punya perlindungan finansial lengkap biasanya karena...',
    options: [
      { id: 'a', text: 'Pernah kena musibah sebelumnya', weights: { P:2, R:2, E:0, A:2 } },
      { id: 'b', text: 'Memang dari awal tipe yang perencana', weights: { P:1, R:5, E:0, A:4 } },
      { id: 'c', text: 'Ada orang terpercaya yang membantu mereka sadar', weights: { P:2, R:2, E:1, A:2 } },
      { id: 'd', text: 'Mereka lebih mau berpikir jangka panjang', weights: { P:3, R:4, E:0, A:3 } },
    ]
  },
  {
    id: 'q22',
    phase: 4,
    text: 'Sejauh ini, seberapa sering kamu duduk dan benar-benar mengevaluasi kondisi finansial keluargamu?',
    options: [
      { id: 'a', text: 'Rutin — minimal setahun sekali', weights: { P:2, R:5, E:0, A:4 } },
      { id: 'b', text: 'Pernah, tapi tidak teratur', weights: { P:2, R:2, E:1, A:2 } },
      { id: 'c', text: 'Baru mulai kepikiran belakangan ini', weights: { P:2, R:1, E:1, A:1 }, productHint: 'PCB88' },
      { id: 'd', text: 'Belum pernah secara serius', weights: { P:1, R:0, E:3, A:0 }, productHint: 'PCB88' },
    ]
  },
  {
    id: 'q23',
    phase: 5,
    text: 'Dari skala 1–5, seberapa yakin kamu bahwa kondisi keuangan keluargamu aman kalau terjadi sesuatu yang tidak terduga hari ini?',
    note: '1 = Belum siap sama sekali  ·  5 = Sudah sangat siap',
    isScale: true,
    options: [
      { id: '1', text: '1 — Belum siap sama sekali', weights: { P:3, R:0, E:0, A:0 }, productHint: 'PCB88' },
      { id: '2', text: '2 — Belum terlalu siap', weights: { P:3, R:1, E:0, A:0 }, productHint: 'PCB88' },
      { id: '3', text: '3 — Lumayan, tapi masih ada celah', weights: { P:2, R:2, E:0, A:1 }, productHint: 'PCB88' },
      { id: '4', text: '4 — Cukup siap', weights: { P:1, R:3, E:1, A:3 } },
      { id: '5', text: '5 — Sudah sangat siap', weights: { P:0, R:4, E:2, A:4 } },
    ]
  },
  {
    id: 'q24',
    phase: 5,
    text: 'Kalau ada seseorang yang bisa tunjukkan cara konkret melindungi kondisi finansial keluargamu, kamu...',
    options: [
      { id: 'a', text: 'Sangat ingin tahu — ini yang sudah saya cari', weights: { P:4, R:3, E:0, A:2 }, productHint: 'PCB88' },
      { id: 'b', text: 'Tertarik, tapi ingin pahami dulu sebelum memutuskan', weights: { P:3, R:3, E:0, A:3 } },
      { id: 'c', text: 'Mungkin — tergantung apakah masuk akal', weights: { P:2, R:2, E:1, A:2 } },
      { id: 'd', text: 'Sudah punya rencana sendiri', weights: { P:2, R:4, E:1, A:4 } },
    ]
  },
  {
    id: 'q25',
    phase: 5,
    text: 'Satu hal yang paling ingin kamu pastikan terjaga untuk orang-orang yang kamu cintai, kalau boleh hanya pilih satu, adalah...',
    options: [
      { id: 'a', text: 'Kebutuhan hidup mereka terpenuhi', weights: { P:4, R:3, E:0, A:2 }, productHint: 'PCB88' },
      { id: 'b', text: 'Masa depan dan pendidikan terjamin', weights: { P:4, R:3, E:0, A:1 }, productHint: 'PRUFuture' },
      { id: 'c', text: 'Mereka sehat dan terlindungi', weights: { P:3, R:3, E:0, A:2 }, productHint: 'PRUWellMedical' },
      { id: 'd', text: 'Mereka bisa terus bermimpi dan berkembang', weights: { P:3, R:2, E:2, A:2 }, productHint: 'PRUFuture' },
    ]
  },
]
