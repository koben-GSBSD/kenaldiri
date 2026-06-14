import { QUESTIONS } from './questions.js'
import { getShio, getAgeFromDob } from '../lib/shio.js'

const PERSONALITY_TYPES = {
  P: {
    type: 'pelindung',
    label: 'Si Pelindung Keluarga',
    icon: '🛡️',
    description: 'Keluarga adalah segalanya bagimu. Kamu rela berkorban demi memastikan orang-orang yang kamu cintai tidak kekurangan apapun — bahkan saat kamu tidak ada. Inilah kekuatanmu yang sesungguhnya.',
    insight: 'Yang sering luput dari perhatian tipe sepertimu: justru si pelindung sendiri yang paling butuh perlindungan. Karena kamu adalah fondasi keluarga.',
  },
  R: {
    type: 'perencana',
    label: 'Si Perencana Bijak',
    icon: '🧭',
    description: 'Kamu tidak suka ketidakpastian. Setiap keputusan dipikirkan matang, setiap risiko diperhitungkan. Orang-orang di sekitarmu merasa aman karena ada kamu yang selalu berpikir ke depan.',
    insight: 'Perencana terbaik tahu bahwa ada satu risiko yang tidak bisa dijadwalkan: kesehatan dan kehidupan. Di sinilah proteksi melengkapi perencanaan yang sudah matang.',
  },
  E: {
    type: 'penikmat',
    label: 'Si Penikmat Hidup',
    icon: '✨',
    description: 'Hidup untuk dijalani sepenuhnya — bukan ditakuti. Kamu spontan, ekspresif, dan tahu cara menikmati momen. Energimu menular dan membuat orang di sekitarmu lebih bersemangat.',
    insight: 'Justru karena kamu menikmati hidup begitu penuh, satu gangguan besar bisa menghentikan segalanya. Proteksi bukan tentang takut — tapi tentang memastikan kamu bisa terus menikmati hidup.',
  },
  A: {
    type: 'pencari_aman',
    label: 'Si Pencari Ketenangan',
    icon: '🌿',
    description: 'Ketenangan dan stabilitas adalah prioritasmu. Kamu tidak mencari risiko, tapi memastikan semua hal berjalan dengan teratur dan aman. Orang-orang di sekitarmu merasa nyaman bersamamu.',
    insight: 'Ketenangan sejati bukan hanya dari tabungan yang cukup — tapi dari kepastian bahwa kondisi finansial keluarga terjaga bahkan saat hal tak terduga terjadi.',
  },
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

  // Generate shio
  const birthYear = new Date(prospectDob).getFullYear()
  const shioData = getShio(birthYear)

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
    readiness_score: readinessScore,
    primary_product: primaryProduct,
    secondary_product: secondaryProduct,
    recommendation_narrative: narrative,
    scores,
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
