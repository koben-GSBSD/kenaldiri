import { QUESTIONS } from './questions.js'
import { getShio, getAgeFromDob } from '../lib/shio.js'

// Catatan penamaan (atas arahan Koben): hanya nama tampilan profil yang dibuat
// dalam Bahasa Inggris. Slug internal (type) TIDAK diubah supaya kompatibel
// dengan data yang sudah tersimpan di database. Semua deskripsi tetap
// menggunakan Bahasa Indonesia yang santai dan mudah dimengerti.
export const PERSONALITY_TYPES = {
  P: {
    type: 'pelindung',
    label: 'The Guardian',
    icon: '🛡️',
    description: 'Keluarga adalah segalanya bagimu. Kamu rela berkorban demi memastikan orang-orang yang kamu cintai tidak kekurangan apapun — bahkan saat kamu tidak ada. Inilah kekuatanmu yang sesungguhnya.',
    insight: 'Yang sering luput dari perhatian tipe sepertimu: justru si pelindung sendiri yang paling butuh perlindungan. Karena kamu adalah fondasi keluarga.',
  },
  R: {
    type: 'perencana',
    label: 'The Architect',
    icon: '🧭',
    description: 'Kamu tidak suka ketidakpastian. Setiap keputusan dipikirkan matang, setiap risiko diperhitungkan. Orang-orang di sekitarmu merasa aman karena ada kamu yang selalu berpikir ke depan.',
    insight: 'Perencana terbaik tahu bahwa ada satu risiko yang tidak bisa dijadwalkan: kesehatan dan kehidupan. Di sinilah proteksi melengkapi perencanaan yang sudah matang.',
  },
  E: {
    type: 'penikmat',
    label: 'The Explorer',
    icon: '✨',
    description: 'Hidup untuk dijalani sepenuhnya — bukan ditakuti. Kamu spontan, ekspresif, dan tahu cara menikmati momen. Energimu menular dan membuat orang di sekitarmu lebih bersemangat.',
    insight: 'Justru karena kamu menikmati hidup begitu penuh, satu gangguan besar bisa menghentikan segalanya. Proteksi bukan tentang takut — tapi tentang memastikan kamu bisa terus menikmati hidup.',
  },
  A: {
    type: 'pencari_aman',
    label: 'The Builder',
    icon: '🌿',
    description: 'Ketenangan dan stabilitas adalah prioritasmu. Kamu tidak mencari risiko, tapi memastikan semua hal berjalan dengan teratur dan aman. Orang-orang di sekitarmu merasa nyaman bersamamu.',
    insight: 'Ketenangan sejati bukan hanya dari tabungan yang cukup — tapi dari kepastian bahwa kondisi finansial keluarga terjaga bahkan saat hal tak terduga terjadi.',
  },
}

function getAnswerText(qid, answerId) {
  const q = QUESTIONS.find(q => q.id === qid)
  const opt = q?.options.find(o => o.id === answerId)
  return opt?.text || ''
}

// === Financial Readiness Score (FRS) — skala 0–100 ===
// Setiap komponen ditautkan ke pertanyaan spesifik supaya hasilnya bisa
// dijelaskan ke prospek ("ini kenapa skormu segini") oleh agen.
function calculateFRS(answers) {
  const breakdown = []

  // 1) Keyakinan diri (q23, skala 1-5) -> 0-25
  const q23Val = parseInt(answers.q23) || 1
  const confidencePts = Math.round(((q23Val - 1) / 4) * 25)
  breakdown.push({
    key: 'confidence',
    label: 'Keyakinan Diri',
    question: 'Seberapa yakin kondisi keuanganmu aman kalau terjadi hal tak terduga?',
    answer: getAnswerText('q23', answers.q23),
    points: confidencePts,
    max: 25,
  })

  // 2) Cadangan dana darurat (q14) -> 0-25
  const bufferMap = { a: 25, b: 15, c: 5, d: 0 }
  const bufferPts = bufferMap[answers.q14] ?? 0
  breakdown.push({
    key: 'emergency_buffer',
    label: 'Cadangan Dana Darurat',
    question: 'Kalau tidak bisa bekerja selama 3 bulan, bagaimana kondisi finansial keluarga?',
    answer: getAnswerText('q14', answers.q14),
    points: bufferPts,
    max: 25,
  })

  // 3) Kebiasaan evaluasi/planning (q22) -> 0-20
  const planningMap = { a: 20, b: 12, c: 5, d: 0 }
  const planningPts = planningMap[answers.q22] ?? 0
  breakdown.push({
    key: 'planning_habit',
    label: 'Kebiasaan Evaluasi Keuangan',
    question: 'Seberapa sering duduk dan mengevaluasi kondisi finansial keluarga?',
    answer: getAnswerText('q22', answers.q22),
    points: planningPts,
    max: 20,
  })

  // 4) Orientasi masa depan (q9) -> 0-15
  const futureMap = { a: 15, b: 9, c: 4, d: 0 }
  const futurePts = futureMap[answers.q9] ?? 0
  breakdown.push({
    key: 'future_orientation',
    label: 'Orientasi Masa Depan',
    question: 'Kalau ada rencana besar 6–12 bulan ke depan, biasanya kamu bersiap dengan cara apa?',
    answer: getAnswerText('q9', answers.q9),
    points: futurePts,
    max: 15,
  })

  // 5) Kesiapan proteksi (q17) -> 0-15
  const protectionMap = { d: 15, b: 8, a: 5, c: 3 }
  const protectionPts = protectionMap[answers.q17] ?? 0
  breakdown.push({
    key: 'protection_readiness',
    label: 'Kesiapan Proteksi',
    question: 'Seberapa sering kepikiran soal kondisi keluarga kalau tiba-tiba kamu tidak ada?',
    answer: getAnswerText('q17', answers.q17),
    points: protectionPts,
    max: 15,
  })

  const total = confidencePts + bufferPts + planningPts + futurePts + protectionPts
  return { score: total, breakdown }
}

// === 4 Area Proteksi — dipetakan dari productSignals yang sudah dihitung ===
function buildProtectionAreas(productSignals, answers) {
  function statusFromSignal(signal, urgentAt, moderateAt) {
    if (signal >= urgentAt) return 'urgent'
    if (signal >= moderateAt) return 'moderate'
    return 'good'
  }

  const bufferStatusMap = { a: 'good', b: 'moderate', c: 'urgent', d: 'urgent' }

  return [
    {
      key: 'income_life',
      icon: '🛡️',
      label: 'Proteksi Pendapatan & Jiwa',
      status: statusFromSignal(productSignals.PCB88, 9, 5),
      note: 'Seberapa siap keluarga jika kamu tiba-tiba kehilangan kemampuan untuk mencari nafkah.',
    },
    {
      key: 'future_education',
      icon: '🎓',
      label: 'Masa Depan & Pendidikan Keluarga',
      status: statusFromSignal(productSignals.PRUFuture, 4, 2),
      note: 'Seberapa terjamin rencana jangka panjang dan pendidikan anak/keluarga.',
    },
    {
      key: 'health',
      icon: '❤️‍🩹',
      label: 'Kesehatan Keluarga',
      status: statusFromSignal(productSignals.PRUWellMedical, 4, 2),
      note: 'Seberapa siap menghadapi biaya pengobatan yang datang tiba-tiba.',
    },
    {
      key: 'emergency_fund',
      icon: '💰',
      label: 'Dana Darurat',
      status: bufferStatusMap[answers.q14] || 'moderate',
      note: 'Seberapa kuat cadangan kas keluarga untuk menahan kondisi darurat.',
    },
  ]
}

function buildKeyMoments(answers) {
  return [
    {
      question: 'Kekhawatiran soal keluarga',
      answer: getAnswerText('q17', answers.q17),
      insight: (answers.q17 === 'a' || answers.q17 === 'b')
        ? 'Jawaban ini menunjukkan rasa tanggung jawab yang besar — sinyal kuat bahwa proteksi jiwa relevan untuk dibahas.'
        : 'Ketenangan yang sudah ada bisa makin nyata kalau didukung jaminan konkret untuk keluarga.',
    },
    {
      question: 'Cadangan dana darurat',
      answer: getAnswerText('q14', answers.q14),
      insight: (answers.q14 === 'c' || answers.q14 === 'd')
        ? 'Ini adalah celah yang paling mendesak untuk segera diisi — kondisi finansial keluarga rentan kalau pendapatan berhenti tiba-tiba.'
        : 'Cadangan yang sudah ada adalah fondasi bagus — proteksi tinggal melengkapi supaya makin kuat.',
    },
    {
      question: 'Tingkat keyakinan diri',
      answer: getAnswerText('q23', answers.q23),
      insight: (parseInt(answers.q23) <= 2)
        ? 'Self-rating yang rendah ini sering jadi titik pembuka percakapan paling jujur — prospek sendiri yang merasa belum siap.'
        : 'Keyakinan yang cukup tinggi ini bisa dijadikan modal percakapan: bagaimana mempertahankan rasa aman itu di masa depan.',
    },
  ]
}

export function calculateScore(answers, prospectDob, smoker) {
  const scores = { P: 0, R: 0, E: 0, A: 0 }
  const productSignals = { PCB88: 0, PRUFuture: 0, PRUWellMedical: 0 }
  let readinessScore = 3

  QUESTIONS.forEach(q => {
    const answerId = answers[q.id]
    if (!answerId) return
    const option = q.options.find(o => o.id === answerId)
    if (!option) return

    Object.entries(option.weights).forEach(([dim, val]) => {
      scores[dim] += val
    })

    if (option.productHint) {
      productSignals[option.productHint] += 2
    }

    if (q.id === 'q23') {
      readinessScore = parseInt(answerId)
    }
  })

  // Readiness score amplifies product signals
  if (readinessScore <= 2) {
    productSignals.PCB88 += 4
  } else if (readinessScore <= 3) {
    productSignals.PCB88 += 2
  }

  // Smoker flag: significantly increase PCB88 signal
  if (smoker) {
    productSignals.PCB88 += 5
    productSignals.PRUWellMedical += 3
  }

  // Age factor
  const age = getAgeFromDob(prospectDob)
  if (age >= 35 && age <= 55) {
    productSignals.PCB88 += 3
  }
  if (age > 55) {
    productSignals.PRUWellMedical += 2
  }

  // PCB88 DEFAULT BIAS (as directed by Koben)
  productSignals.PCB88 += 3

  // Determine personality type
  const dominantType = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0]
  const personality = PERSONALITY_TYPES[dominantType]

  // Determine products
  const sortedProducts = Object.entries(productSignals).sort((a, b) => b[1] - a[1])
  const primaryProduct = sortedProducts[0][0]
  const secondaryProduct = sortedProducts[1][0] !== primaryProduct ? sortedProducts[1][0] : sortedProducts[2][0]

  // Generate shio (data terkonsolidasi: traits + spendingBehavior + emoji)
  const birthYear = new Date(prospectDob).getFullYear()
  const shioData = getShio(birthYear)

  // Financial Readiness Score (0-100) — fitur tambahan, tidak mengubah readiness_score lama
  const frs = calculateFRS(answers)
  const protectionAreas = buildProtectionAreas(productSignals, answers)
  const keyMoments = buildKeyMoments(answers)

  // Build narrative
  const narrative = buildNarrative(personality, shioData, primaryProduct, secondaryProduct, readinessScore, smoker, age, answers)

  return {
    personality_type: personality.type,
    personality_label: personality.label,
    personality_icon: personality.icon,
    personality_description: personality.description,
    personality_insight: personality.insight,
    shio: shioData.name,
    shio_traits: shioData.traits,
    shio_emoji: shioData.emoji,
    shio_spending_behavior: shioData.spendingBehavior,
    readiness_score: readinessScore,
    primary_product: primaryProduct,
    secondary_product: secondaryProduct,
    recommendation_narrative: narrative,
    scores,
    // --- field tambahan (tidak mengubah perilaku/skema lama) ---
    frs_score: frs.score,
    frs_breakdown: frs.breakdown,
    protection_areas: protectionAreas,
    key_moments: keyMoments,
  }
}

function buildNarrative(personality, shio, primary, secondary, readiness, smoker, age, answers) {
  const productNames = {
    PCB88: 'PRUCritical Benefit 88',
    PRUFuture: 'PRUFuture',
    PRUWellMedical: 'PRUWell Medical',
  }

  const smokingNote = smoker
    ? ' Dengan gaya hidup yang perlu dijaga ekstra, memiliki proteksi kondisi kritis menjadi semakin relevan.'
    : ''

  const readinessNote = readiness <= 2
    ? 'Berdasarkan penilaian sendiri, ada celah proteksi yang cukup signifikan yang perlu segera diperhatikan.'
    : readiness <= 3
    ? 'Masih ada ruang untuk memperkuat proteksi finansial keluarga agar lebih siap menghadapi situasi tak terduga.'
    : 'Fondasi finansial sudah cukup baik — yang perlu dilengkapi adalah lapisan proteksi untuk melindungi fondasi tersebut.'

  const q17 = answers['q17']
  const worryNote = (q17 === 'a' || q17 === 'b')
    ? 'Kekhawatiran tentang kondisi keluarga jika terjadi hal tak terduga menunjukkan betapa besar rasa tanggung jawabmu — dan ini adalah sinyal kuat bahwa proteksi jiwa adalah langkah yang tepat.'
    : 'Ketenangan yang kamu miliki bisa semakin nyata ketika ada jaminan konkret bahwa keluarga tetap terlindungi dalam kondisi apapun.'

  return `${personality.icon} Sebagai ${personality.label} dengan Shio ${shio.name} — ${shio.traits}

${personality.description}

${personality.insight}

${worryNote}${smokingNote}

${readinessNote}

Berdasarkan profil kepribadianmu, solusi yang paling sesuai adalah ${productNames[primary]} sebagai proteksi utama${secondary ? `, dilengkapi dengan ${productNames[secondary]}` : ''}. Kombinasi ini dirancang khusus untuk profil seperti kamu: seseorang yang peduli pada keamanan jangka panjang keluarganya.`
}
