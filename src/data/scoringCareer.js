import { CAREER_QUESTIONS } from './questionsCareer.js'

// 4 profil hasil survey karir
// Dirancang agar SEMUA profil mengarah ke peluang sales/konsultan dengan cara berbeda
const CAREER_PROFILES = {
  connector: {
    type: 'connector',
    label: 'Si Penghubung Alami',
    icon: '🤝',
    tagline: 'Bakat terbesarmu adalah membuat orang merasa dipahami',
    description: `Kamu adalah tipe orang yang secara alami membangun kepercayaan dengan cepat. Orang-orang di sekitarmu nyaman berbagi cerita, meminta saran, dan mempercayai rekomendasimu — bukan karena kamu memaksakan diri, tapi karena kamu memang tulus mendengarkan dan peduli.

Bakat ini lebih langka dari yang kamu kira. Di dunia yang semakin transaksional, kemampuan membangun koneksi yang tulus adalah aset yang sangat berharga — baik dalam kehidupan pribadi maupun profesional.

Yang menarik: orang seperti kamu justru paling efektif dalam peran di mana kepercayaan adalah kunci. Bukan karena harus "menjual" dalam arti tradisional — tapi karena kamu membantu orang membuat keputusan yang tepat untuk mereka. Dan itu nilai yang sangat dibutuhkan.`,
    insight: 'Kamu sudah melakukan "pekerjaan seorang konsultan" setiap hari tanpa menyadarinya — dan selama ini kamu melakukannya secara gratis.',
    opportunity: `Bayangkan jika setiap kali kamu berhasil membantu seseorang membuat keputusan penting, ada nilai finansial yang mengalir kembali kepadamu. Bukan dari menipu atau memaksa — tapi dari genuinely membantu dan dipercaya. Itulah yang membuat karir sebagai konsultan keuangan berbeda dari "jualan biasa."`,
    readinessNote: (score) => score <= 3
      ? 'Kamu terbuka untuk mendengar lebih jauh — dan itu sudah menjadi langkah pertama yang tepat.'
      : 'Keterbukaan dan kesiapanmu adalah modal besar. Selangkah lagi untuk mengubah bakat naturalmu menjadi penghasilan nyata.',
  },
  achiever: {
    type: 'achiever',
    label: 'Si Pencetak Hasil',
    icon: '🎯',
    tagline: 'Kamu termotivasi oleh hasil nyata, bukan sekadar proses',
    description: `Kamu bukan tipe yang puas dengan rutinitas tanpa arah. Ada dorongan kuat dalam dirimu untuk melihat angka yang bergerak, target yang tercapai, dan dampak yang nyata dari apa yang kamu kerjakan.

Energi kompetitif ini sering terpendam jika tempatmu bekerja sekarang tidak memberikan ruang untuk benar-benar "menentukan hasilmu sendiri." Dan itu bukan kelemahan — itu sinyal bahwa kamu belum berada di lingkungan yang tepat untuk tipe kepribadianmu.

Orang seperti kamu biasanya tidak perlu dimotivasi dari luar. Yang dibutuhkan adalah sistem yang memberikan reward setara dengan usaha yang dikeluarkan. Sayangnya, tidak semua karir didesain seperti itu.`,
    insight: 'Selama ini penghasilanmu mungkin belum mencerminkan seberapa besar sebenarnya kontribusi dan kemampuanmu.',
    opportunity: `Karir berbasis komisi bukan untuk semua orang — tapi untuk tipe seperti kamu, ini bisa menjadi medan yang paling adil. Hasilmu berbanding lurus dengan usahamu. Tidak ada "plafon karir" yang menghambat. Dan tidak ada yang bisa membatasi potensi penghasilanmu kecuali kamu sendiri.`,
    readinessNote: (score) => score <= 3
      ? 'Rasa penasaranmu adalah sinyal yang tepat untuk dijelajahi lebih dalam.'
      : 'Kombinasi antara karakter pencetak hasil dan kesiapan bertindakmu membuat kamu berada di posisi yang sangat kuat untuk memulai.',
  },
  empath: {
    type: 'empath',
    label: 'Si Pembawa Makna',
    icon: '💡',
    tagline: 'Kamu ingin pekerjaan yang terasa bermakna, bukan sekadar menghasilkan',
    description: `Di tengah tekanan finansial sehari-hari, kamu tetap menjaga nilai penting: pekerjaan harus bermakna. Bukan hanya tentang angka, tapi tentang dampak nyata pada kehidupan orang lain.

Ini bukan idealisme yang naif — ini adalah sistem nilai yang sangat kuat. Orang seperti kamu justru paling tahan banting dalam jangka panjang, karena motivasinya datang dari dalam, bukan dari luar.

Yang sering tidak disadari tipe seperti kamu: ada karir yang bisa memberikan keduanya sekaligus — penghasilan yang signifikan DAN dampak yang nyata pada kehidupan orang lain. Tidak harus memilih salah satu.`,
    insight: 'Dilema antara "penghasilan lebih" dan "pekerjaan bermakna" sebenarnya tidak selalu harus ada.',
    opportunity: `Membantu seseorang memproteksi masa depan keluarganya, memastikan anak-anak mereka tetap bisa sekolah meski orang tuanya tidak ada, memberikan ketenangan pikiran di saat paling rentan — itu adalah pekerjaan yang sangat bermakna. Dan kebetulan, itu juga pekerjaan yang bisa memberikan penghasilan tak terbatas.`,
    readinessNote: (score) => score <= 3
      ? 'Tidak perlu buru-buru. Yang penting adalah mendapatkan informasi yang tepat sebelum memutuskan.'
      : 'Nilai yang kamu pegang dan kesiapanmu untuk bertindak adalah kombinasi yang jarang dan sangat berharga.',
  },
  explorer: {
    type: 'explorer',
    label: 'Si Penjelajah Peluang',
    icon: '🧭',
    tagline: 'Kamu punya naluri kuat untuk tidak berhenti di zona nyaman',
    description: `Ada bagian dari dirimu yang selalu mencari — peluang baru, cara yang lebih baik, atau sesuatu yang memberikan lebih dari yang sudah ada. Kamu bukan tipe yang puas dengan "cukup" jika ada kemungkinan untuk "lebih baik."

Kegelisahan positif ini adalah driver yang sangat kuat untuk pertumbuhan. Tapi tanpa arah yang tepat, ia bisa berubah menjadi frustrasi. Kamu sudah tahu kamu ingin sesuatu yang berbeda — yang belum ditemukan adalah saluran yang tepat untuk energi dan ambisimu.

Tipe sepertimu paling cepat berkembang ketika menemukan lingkungan yang menghargai inisiatif, memberikan kebebasan bertindak, dan tidak membatasi potensimu dengan struktur yang kaku.`,
    insight: 'Kamu sudah setengah jalan — kamu tahu kamu butuh lebih. Yang tersisa adalah menemukan jalurnya.',
    opportunity: `Karir sebagai konsultan keuangan independen adalah salah satu dari sedikit pilihan yang memberikan kebebasan penuh: waktu, cara kerja, dan potensi penghasilan. Tidak ada atasan yang membatasi. Tidak ada plafon karir. Dan setiap langkah yang kamu ambil adalah milikmu sepenuhnya.`,
    readinessNote: (score) => score <= 3
      ? 'Naluri eksplorasimu sudah aktif. Langkah berikutnya adalah mendapatkan lebih banyak informasi.'
      : 'Energimu untuk menjelajahi peluang baru, dikombinasikan dengan kesiapan bertindak, adalah formula yang tepat untuk memulai sesuatu yang nyata.',
  },
}

export function calculateCareerScore(answers) {
  const scores = { N: 0, S: 0, F: 0, R: 0 }
  let openness = 3
  let primaryWant = 'a'

  CAREER_QUESTIONS.forEach(q => {
    const answerId = answers[q.id]
    if (!answerId) return
    const option = q.options.find(o => o.id === answerId)
    if (!option) return
    Object.entries(option.weights).forEach(([dim, val]) => { scores[dim] += val })
    if (q.id === 'cq24') openness = parseInt(answerId)
    if (q.id === 'cq25') primaryWant = answerId
  })

  // Determine profile type based on dominant dimension
  // S high → connector or achiever depending on N
  // N high → achiever
  // F high → explorer
  // Balanced or low → empath (meaning-driven)
  let profileType
  const maxScore = Math.max(scores.N, scores.S, scores.F, scores.R)
  const dominant = Object.entries(scores).find(([k, v]) => v === maxScore)?.[0]

  if (dominant === 'S' && scores.N <= scores.S) {
    profileType = 'connector'
  } else if (dominant === 'N' || (dominant === 'R' && scores.N > scores.S)) {
    profileType = 'achiever'
  } else if (dominant === 'F') {
    profileType = 'explorer'
  } else {
    profileType = 'empath'
  }

  // Override based on cq25 primary want
  if (primaryWant === 'c' && scores.S >= 12) profileType = 'connector'
  if (primaryWant === 'a' && scores.N >= 15) profileType = 'achiever'
  if (primaryWant === 'b') profileType = 'explorer'

  const profile = CAREER_PROFILES[profileType]

  // Need signal strength (for narrative urgency)
  const needLevel = scores.N >= 20 ? 'high' : scores.N >= 10 ? 'medium' : 'low'

  const narrative = buildCareerNarrative(profile, needLevel, openness, scores, answers)

  return {
    profile_type: profileType,
    profile_label: profile.label,
    profile_icon: profile.icon,
    profile_tagline: profile.tagline,
    profile_description: profile.description,
    profile_insight: profile.insight,
    profile_opportunity: profile.opportunity,
    readiness_note: profile.readinessNote(openness),
    openness_score: openness,
    need_level: needLevel,
    scores,
    recommendation_narrative: narrative,
  }
}

function buildCareerNarrative(profile, needLevel, openness, scores, answers) {
  const needContext = needLevel === 'high'
    ? 'Ada tekanan finansial nyata yang kamu rasakan saat ini — dan itu bukan karena kamu kurang berusaha.'
    : needLevel === 'medium'
    ? 'Ada kesadaran bahwa kondisi finansial saat ini masih bisa ditingkatkan secara signifikan.'
    : 'Kondisi finansialmu relatif stabil — tapi selalu ada ruang untuk tumbuh lebih jauh.'

  const opennessContext = openness >= 4
    ? 'Keterbukaan dan kesiapanmu untuk mengeksplorasi peluang baru adalah modal yang sangat berharga.'
    : 'Kehati-hatianmu dalam mengeksplorasi hal baru adalah tanda kedewasaan — bukan hambatan.'

  return `${profile.icon} ${profile.label}

"${profile.tagline}"

${profile.description}

─

💡 Yang perlu kamu ketahui tentang dirimu:
${profile.insight}

${needContext}

${opennessContext}

─

🚪 Peluang yang relevan untukmu:
${profile.opportunity}`
}
