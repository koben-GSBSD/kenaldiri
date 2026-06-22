import { CAREER_QUESTIONS } from './questionsCareer.js'
import { getShio, getShioByName } from '../lib/shio.js'

// 4 profil hasil survey karir
// Dirancang agar SEMUA profil mengarah ke peluang sales/konsultan dengan cara berbeda
//
// Catatan penamaan (atas arahan Koben): hanya nama tampilan profil yang dibuat
// dalam Bahasa Inggris. Slug internal (type) TIDAK diubah supaya kompatibel
// dengan data yang sudah tersimpan di database. Semua deskripsi tetap
// menggunakan Bahasa Indonesia yang santai dan mudah dimengerti.
export const CAREER_PROFILES = {
  connector: {
    type: 'connector',
    label: 'The Connector',
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
    label: 'The Achiever',
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
    label: 'The Empath',
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
    label: 'The Explorer',
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

function getAnswerText(qid, answerId) {
  const q = CAREER_QUESTIONS.find(q => q.id === qid)
  const opt = q?.options.find(o => o.id === answerId)
  return opt?.text || ''
}

// === Career Readiness Index (CRI) — skala 0–100 ===
// Mirroring FRS di survey finansial: setiap komponen ditautkan ke pertanyaan
// spesifik supaya agen bisa menjelaskan ke prospek kenapa skornya segini.
function calculateCRI(answers) {
  const breakdown = []

  // 1) Keterbukaan terhadap peluang baru (cq24, skala 1-5) -> 0-25
  const opennessVal = parseInt(answers.cq24) || 1
  const opennessPts = Math.round(((opennessVal - 1) / 4) * 25)
  breakdown.push({
    key: 'openness',
    label: 'Keterbukaan Peluang Baru',
    question: 'Seberapa terbuka terhadap peluang karir atau penghasilan baru?',
    answer: getAnswerText('cq24', answers.cq24),
    points: opennessPts,
    max: 25,
  })

  // 2) Tekanan/kebutuhan finansial (cq3) -> 0-25
  const pressureMap = { a: 0, b: 8, c: 16, d: 25 }
  const pressurePts = pressureMap[answers.cq3] ?? 0
  breakdown.push({
    key: 'financial_pressure',
    label: 'Tekanan Kebutuhan Finansial',
    question: 'Kalau gaji tiba-tiba berhenti 2 bulan, bagaimana kondisi keuangan?',
    answer: getAnswerText('cq3', answers.cq3),
    points: pressurePts,
    max: 25,
  })

  // 3) Orientasi aksi terhadap peluang (cq19) -> 0-20
  const actionMap = { a: 20, b: 12, c: 6, d: 0 }
  const actionPts = actionMap[answers.cq19] ?? 0
  breakdown.push({
    key: 'action_orientation',
    label: 'Orientasi Aksi',
    question: 'Reaksi terhadap tawaran peluang bisnis sampingan yang meyakinkan?',
    answer: getAnswerText('cq19', answers.cq19),
    points: actionPts,
    max: 20,
  })

  // 4) Kenyamanan sosial / sales aptitude (cq11) -> 0-15
  const socialMap = { a: 15, b: 10, c: 5, d: 0 }
  const socialPts = socialMap[answers.cq11] ?? 0
  breakdown.push({
    key: 'people_aptitude',
    label: 'Kenyamanan Bertemu Orang Baru',
    question: 'Seberapa nyaman memulai percakapan dengan orang yang belum dikenal?',
    answer: getAnswerText('cq11', answers.cq11),
    points: socialPts,
    max: 15,
  })

  // 5) Mindset penghasilan tidak terbatas (cq16) -> 0-15
  const incomeMindsetMap = { a: 0, b: 15, c: 10, d: 15 }
  const incomeMindsetPts = incomeMindsetMap[answers.cq16] ?? 0
  breakdown.push({
    key: 'income_mindset',
    label: 'Mindset Penghasilan Fleksibel',
    question: 'Sistem penghasilan yang paling menarik menurutmu?',
    answer: getAnswerText('cq16', answers.cq16),
    points: incomeMindsetPts,
    max: 15,
  })

  const total = opennessPts + pressurePts + actionPts + socialPts + incomeMindsetPts
  return { score: total, breakdown }
}

function buildKeyMoments(answers) {
  return [
    {
      question: 'Tekanan finansial',
      answer: getAnswerText('cq3', answers.cq3),
      insight: (answers.cq3 === 'c' || answers.cq3 === 'd')
        ? 'Ini sinyal kuat ada kebutuhan nyata akan penghasilan tambahan — titik masuk paling jujur untuk percakapan.'
        : 'Kondisi yang relatif aman ini tetap bisa dibuka dengan ide "penghasilan tambahan untuk tujuan yang lebih besar."',
    },
    {
      question: 'Reaksi terhadap peluang baru',
      answer: getAnswerText('cq19', answers.cq19),
      insight: (answers.cq19 === 'a' || answers.cq19 === 'b')
        ? 'Keterbukaan ini adalah modal besar — prospek sudah punya kecenderungan mau mendengar lebih jauh.'
        : 'Butuh pendekatan yang lebih banyak bukti dan testimoni nyata sebelum prospek merasa yakin.',
    },
    {
      question: 'Tingkat keterbukaan (skala 1-5)',
      answer: getAnswerText('cq24', answers.cq24),
      insight: (parseInt(answers.cq24) >= 4)
        ? 'Skor keterbukaan yang tinggi ini adalah lampu hijau — saat yang tepat untuk mengajak ngobrol lebih detail.'
        : 'Skor ini menunjukkan perlu membangun kepercayaan dan informasi lebih dulu sebelum mengajak ke langkah berikutnya.',
    },
  ]
}

export function calculateCareerScore(answers, prospectDob) {
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

  // Compute shio dari data canonical (lib/shio.js)
  const shioName = prospectDob ? getCareerShio(prospectDob) : 'Tidak diketahui'
  const shioData = getShioByName(shioName)

  // Need signal strength (for narrative urgency)
  const needLevel = scores.N >= 20 ? 'high' : scores.N >= 10 ? 'medium' : 'low'

  const narrative = buildCareerNarrative(profile, needLevel, openness, scores, answers)

  // Career Readiness Index (0-100) — fitur tambahan, tidak mengubah field lama
  const cri = calculateCRI(answers)
  const keyMoments = buildKeyMoments(answers)

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
    shio: shioName,
    shio_strength: shioData.strength,
    shio_weakness: shioData.weakness,
    shio_career: shioData.salesFit,
    // --- field tambahan (tidak mengubah perilaku/skema lama) ---
    shio_emoji: shioData.emoji,
    shio_jobs: shioData.jobs,
    cri_score: cri.score,
    cri_breakdown: cri.breakdown,
    key_moments: keyMoments,
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

// Shio karir kini diambil dari sumber tunggal di lib/shio.js.
// Fungsi ini dipertahankan (signature sama) untuk kompatibilitas mundur.
export function getCareerShio(dobString) {
  const year = new Date(dobString).getFullYear()
  return getShio(year).name
}
