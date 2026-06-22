// Sumber data shio tunggal (canonical) — dipakai oleh survey finansial maupun karir.
// Sebelumnya data ini terpecah di 3 tempat (shio.js, shioCareer.js, scoringCareer.js).
// Sekarang semua dikumpulkan di sini agar konsisten dan mudah dirawat.
//
// Setiap entri shio punya:
// - traits            : sifat umum (dipakai di survey finansial, narasi utama)
// - spendingBehavior   : kecenderungan kebiasaan belanja/menyimpan uang (konteks finansial)
// - strength/weakness  : kekuatan & celah dalam konteks karir/sales
// - jobs               : rekomendasi peran karir yang cocok (sales, marketing, edukasi, dll)
// - salesFit           : satu kalimat kesimpulan kecocokan dengan dunia sales/konsultan
// - careerTrait        : kalimat pembuka untuk konteks karir

const SHIO_LIST = [
  {
    name: 'Tikus',
    emoji: '🐭',
    years: [1924,1936,1948,1960,1972,1984,1996,2008,2020],
    traits: 'Cerdas, adaptif, dan selalu punya rencana cadangan.',
    spendingBehavior: 'Pintar berburu diskon dan tahu mana belanja yang benar-benar "worth it". Tapi gampang tergoda peluang atau penawaran baru, jadi anggaran bisa diam-diam bocor ke banyak hal kecil.',
    careerTrait: 'Cerdas membaca peluang dan sangat adaptif dalam situasi apapun.',
    strength: ['Mudah membangun koneksi dan jaringan luas', 'Cepat belajar hal baru', 'Pandai memanfaatkan momen yang tepat'],
    weakness: ['Kadang terlalu banyak mempertimbangkan sebelum bertindak', 'Mudah teralihkan oleh terlalu banyak peluang sekaligus'],
    jobs: ['Sales Consultant', 'Business Development', 'Digital Marketing', 'Trainer/Edukator'],
    salesFit: 'Cocok sebagai networker — kemampuan sosialmu adalah aset terbesar dalam karir konsultan.',
  },
  {
    name: 'Kerbau', emoji: '🐂', years: [1925,1937,1949,1961,1973,1985,1997,2009,2021],
    traits: 'Tekun, dapat diandalkan, dan sangat setia pada keluarga.',
    spendingBehavior: 'Hemat dan suka menabung secara rutin, jarang impulsif. Tapi kadang terlalu "pelit" untuk hal yang sebenarnya penting — termasuk proteksi untuk diri dan keluarga sendiri.',
    careerTrait: 'Tekun, konsisten, dan bisa diandalkan dalam jangka panjang.',
    strength: ['Sangat disiplin dan tidak mudah menyerah', 'Membangun kepercayaan klien secara solid dan tahan lama', 'Bekerja keras tanpa banyak drama'],
    weakness: ['Proses bisa terasa lambat di awal', 'Terkadang sulit beradaptasi dengan perubahan cepat'],
    jobs: ['Relationship Manager', 'Account Manager', 'Guru/Pelatih', 'Sales jangka panjang berbasis loyalitas'],
    salesFit: 'Cocok untuk membangun portofolio klien jangka panjang yang loyal.',
  },
  {
    name: 'Harimau', emoji: '🐯', years: [1926,1938,1950,1962,1974,1986,1998,2010,2022],
    traits: 'Berani, penuh semangat, dan selalu siap melindungi yang dicintai.',
    spendingBehavior: 'Berani mengambil risiko finansial besar — investasi atau usaha baru terasa menarik. Tapi kadang kurang sabar untuk menabung pelan-pelan demi tujuan jangka panjang.',
    careerTrait: 'Berani, penuh energi, dan tidak takut mengambil inisiatif.',
    strength: ['Percaya diri dalam presentasi dan pitching', 'Natural leader yang bisa menggerakkan tim', 'Tidak mudah menyerah meski ditolak'],
    weakness: ['Bisa terlalu agresif dalam pendekatan', 'Perlu belajar mendengarkan lebih dalam sebelum berbicara'],
    jobs: ['Sales Leader', 'Business Owner/Konsultan', 'Motivator/Public Speaker', 'Team Leader Rekrutmen'],
    salesFit: 'Sangat cocok — energi dan keberanian adalah modal utama di dunia sales.',
  },
  {
    name: 'Kelinci', emoji: '🐰', years: [1927,1939,1951,1963,1975,1987,1999,2011,2023],
    traits: 'Tenang, bijaksana, dan sangat menjaga keharmonisan.',
    spendingBehavior: 'Hati-hati dan suka rasa aman saat soal uang. Tapi kadang menghindari obrolan soal proteksi atau risiko karena merasa tidak nyaman membahasnya.',
    careerTrait: 'Tenang, bijaksana, dan selalu membuat orang merasa nyaman.',
    strength: ['Empati tinggi — klien merasa didengar dan dipahami', 'Pendekatan yang lembut tapi persuasif', 'Membangun atmosfer kepercayaan dengan cepat'],
    weakness: ['Terkadang terlalu berhati-hati hingga kehilangan momentum', 'Perlu lebih tegas dalam closing'],
    jobs: ['Customer Relations', 'Konsultan Personal', 'Guru/Pendidik', 'Sales dengan pendekatan konsultatif'],
    salesFit: 'Cocok untuk segmen klien yang butuh konsultasi mendalam dan hubungan jangka panjang.',
  },
  {
    name: 'Naga', emoji: '🐲', years: [1928,1940,1952,1964,1976,1988,2000,2012,2024],
    traits: 'Karismatik, ambisius, dan lahir sebagai pemimpin.',
    spendingBehavior: 'Pengeluaran besar dan percaya diri, suka yang berkelas dan prestisius. Perlu kontrol ekstra agar gaya hidup tidak melebihi kemampuan finansial sebenarnya.',
    careerTrait: 'Karismatik, ambisius, dan lahir sebagai pemimpin yang menginspirasi.',
    strength: ['Daya tarik alami yang membuat orang ingin mendengarkan', 'Ambisius dalam target dan tidak mudah puas', 'Mampu memotivasi diri sendiri dan orang lain'],
    weakness: ['Bisa terlalu idealistis', 'Perlu belajar manajemen harapan klien yang lebih realistis'],
    jobs: ['Sales Director', 'Public Speaker', 'Brand Ambassador', 'Trainer/Mentor'],
    salesFit: 'Sangat cocok — potensi menjadi top performer dan pemimpin tim.',
  },
  {
    name: 'Ular', emoji: '🐍', years: [1929,1941,1953,1965,1977,1989,2001,2013,2025],
    traits: 'Intuitif, strategis, dan sangat protektif terhadap keluarga.',
    spendingBehavior: 'Terencana dan matang — suka riset dulu sebelum keluar uang besar. Kadang terlalu lama menimbang sampai momentum yang tepat lewat begitu saja.',
    careerTrait: 'Intuitif, strategis, dan selalu selangkah lebih maju dalam membaca situasi.',
    strength: ['Analitis dan bisa mengidentifikasi kebutuhan klien yang tidak terucapkan', 'Strategi pendekatan yang terencana dan efektif', 'Tenang dalam tekanan'],
    weakness: ['Kadang terlalu lama di fase riset sebelum mengeksekusi', 'Perlu lebih spontan dalam mengambil peluang'],
    jobs: ['Financial Consultant', 'Strategic Sales', 'Edukator Keuangan', 'Advisor untuk klien kompleks'],
    salesFit: 'Cocok untuk segmen klien kompleks yang butuh solusi terstruktur.',
  },
  {
    name: 'Kuda', emoji: '🐴', years: [1930,1942,1954,1966,1978,1990,2002,2014,2026],
    traits: 'Energik, bebas, dan selalu bergerak menuju tujuan besar.',
    spendingBehavior: 'Spontan dan suka pengalaman — traveling, hobi, hal-hal baru. Butuh disiplin ekstra supaya pengeluaran tidak lebih cepat dari pemasukan.',
    careerTrait: 'Energik, bebas, dan selalu bergerak menuju tujuan besar.',
    strength: ['Sangat produktif dan bisa mengelola banyak klien sekaligus', 'Pantang menyerah dan terus bergerak maju', 'Antusias yang menular kepada orang lain'],
    weakness: ['Bisa kehilangan fokus karena terlalu banyak aktivitas', 'Perlu membangun rutinitas follow-up yang konsisten'],
    jobs: ['Field Sales/Marketing', 'Event & Community Lead', 'Educator/Coach', 'Networker aktif'],
    salesFit: 'Sangat cocok — produktivitas dan semangat adalah keunggulan utamamu.',
  },
  {
    name: 'Kambing', emoji: '🐐', years: [1931,1943,1955,1967,1979,1991,2003,2015],
    traits: 'Kreatif, empatik, dan sangat peduli pada orang-orang tersayang.',
    spendingBehavior: 'Royal untuk keluarga dan orang-orang tersayang. Kadang lupa mengalokasikan dana untuk proteksi atau kebutuhan diri sendiri.',
    careerTrait: 'Kreatif, empatik, dan sangat peduli pada kualitas hubungan.',
    strength: ['Sangat baik dalam memahami kebutuhan emosional klien', 'Kreatif dalam menemukan solusi yang tepat', 'Membangun hubungan yang tulus dan berkelanjutan'],
    weakness: ['Kadang terlalu sensitif terhadap penolakan', 'Perlu lebih fokus pada target daripada proses'],
    jobs: ['Konsultan Personal', 'Customer Care', 'Pendidik/Pengasuhan Anak', 'Sales konsultatif'],
    salesFit: 'Cocok untuk pendekatan konsultatif yang mengutamakan kebutuhan klien.',
  },
  {
    name: 'Monyet', emoji: '🐵', years: [1932,1944,1956,1968,1980,1992,2004,2016],
    traits: 'Cerdik, fleksibel, dan selalu menemukan solusi dari setiap masalah.',
    spendingBehavior: 'Kreatif mencari cara hemat dan suka punya beberapa sumber pemasukan. Tapi gampang pindah-pindah prioritas keuangan sebelum satu rencana benar-benar tuntas.',
    careerTrait: 'Cerdik, fleksibel, dan selalu menemukan cara kreatif untuk memecahkan masalah.',
    strength: ['Sangat adaptif dengan berbagai tipe klien', 'Kreatif dalam presentasi dan storytelling', 'Cepat menemukan angle yang tepat untuk setiap situasi'],
    weakness: ['Bisa terkesan kurang serius jika tidak dikontrol', 'Perlu konsistensi dalam proses kerja'],
    jobs: ['Digital Marketing', 'Sales Multi-channel', 'Content Creator/Edukator', 'Business Development'],
    salesFit: 'Sangat cocok — kreativitas dan fleksibilitas membuat setiap interaksi berkesan.',
  },
  {
    name: 'Ayam', emoji: '🐔', years: [1933,1945,1957,1969,1981,1993,2005,2017],
    traits: 'Perfeksionis, detail, dan sangat serius dalam memenuhi tanggung jawab.',
    spendingBehavior: 'Terencana sampai detail — suka mencatat setiap pengeluaran. Kadang jadi terlalu kaku atau khawatir berlebihan soal uang.',
    careerTrait: 'Perfeksionis, detail, dan sangat serius dalam menjalankan tanggung jawab.',
    strength: ['Sangat teliti dalam proses dan dokumentasi', 'Klien merasa aman karena profesionalisme tinggi', 'Tidak pernah setengah-setengah dalam mengerjakan sesuatu'],
    weakness: ['Bisa terlalu perfeksionis hingga terhambat memulai', 'Perlu lebih fleksibel dengan ketidakpastian'],
    jobs: ['Financial Planner', 'Quality/Compliance Specialist', 'Trainer Teknis', 'Sales segmen profesional'],
    salesFit: 'Cocok untuk segmen klien profesional yang menghargai presisi dan keandalan.',
  },
  {
    name: 'Anjing', emoji: '🐶', years: [1934,1946,1958,1970,1982,1994,2006,2018],
    traits: 'Setia, jujur, dan rela berkorban untuk keluarga.',
    spendingBehavior: 'Bertanggung jawab dan royal untuk keluarga. Cenderung kurang berani mengambil risiko finansial, termasuk risiko yang sebenarnya perlu diantisipasi.',
    careerTrait: 'Setia, jujur, dan selalu bisa diandalkan oleh siapapun.',
    strength: ['Kepercayaan klien dibangun dengan cepat karena integritas', 'Konsisten dan tidak pernah mengecewakan', 'Sangat baik dalam retention dan loyalitas klien'],
    weakness: ['Kadang terlalu loyal hingga sulit mengevaluasi situasi secara objektif', 'Perlu lebih proaktif dalam mencari klien baru'],
    jobs: ['Relationship Manager', 'Customer Retention', 'Guru/Pembimbing', 'Sales berbasis referral'],
    salesFit: 'Cocok untuk membangun basis klien setia yang memberikan referral secara natural.',
  },
  {
    name: 'Babi', emoji: '🐷', years: [1935,1947,1959,1971,1983,1995,2007,2019],
    traits: 'Hangat, dermawan, dan selalu ingin yang terbaik untuk orang lain.',
    spendingBehavior: 'Murah hati dan gampang tergerak membantu orang lain secara finansial. Perlu jaga batas supaya kebaikan ini tidak membuat keuangan sendiri "kebablasan".',
    careerTrait: 'Hangat, dermawan, dan selalu membuat orang merasa diterima.',
    strength: ['Sangat baik dalam membangun suasana yang nyaman saat bertemu klien', 'Murah hati dalam memberikan nilai tambah', 'Klien selalu merasa diperhatikan dan dihargai'],
    weakness: ['Terkadang terlalu banyak memberi hingga lupa batasan profesional', 'Perlu lebih tegas dalam proses closing'],
    jobs: ['Community Relations', 'Customer Experience', 'Fasilitator/Pendidik', 'Sales dengan pendekatan tulus'],
    salesFit: 'Sangat cocok — kehangatan dan ketulusan adalah nilai yang paling dibutuhkan dalam membangun kepercayaan klien.',
  },
]

const UNKNOWN_SHIO = {
  name: 'Tidak diketahui',
  emoji: '❔',
  traits: '',
  spendingBehavior: 'Setiap orang punya kecenderungan unik dalam mengatur uang — yang penting adalah kesadaran dan kebiasaan yang dibangun konsisten.',
  careerTrait: 'Karakter unik yang sulit dikategorikan.',
  strength: ['Fleksibel', 'Adaptif', 'Terbuka terhadap berbagai kemungkinan'],
  weakness: ['Masih dalam proses menemukan kekuatan terbesar'],
  jobs: ['Banyak peran cocok — tergantung minat dan pengalaman'],
  salesFit: 'Setiap tipe kepribadian bisa sukses dengan sistem dan dukungan yang tepat.',
}

export function getShio(birthYear) {
  const year = typeof birthYear === 'string' ? parseInt(birthYear) : birthYear
  return SHIO_LIST.find(s => s.years.includes(year)) || UNKNOWN_SHIO
}

export function getShioByName(name) {
  return SHIO_LIST.find(s => s.name === name) || UNKNOWN_SHIO
}

export function getAgeFromDob(dob) {
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export { SHIO_LIST }
