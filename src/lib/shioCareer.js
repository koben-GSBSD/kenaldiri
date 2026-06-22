// Shio mapped to career personality - kelebihan dan kekurangan dalam konteks karir & sales
// Data sebenarnya kini disatukan di lib/shio.js (sumber tunggal/canonical).
// File ini dipertahankan sebagai wrapper supaya signature getShioCareer() tetap sama
// untuk kode lain yang sudah memakainya (mis. SurveyDonePage.jsx).
import { getShioByName } from './shio.js'

export function getShioCareer(shioName) {
  const s = getShioByName(shioName)
  return {
    careerTrait: s.careerTrait,
    strength: s.strength,
    weakness: s.weakness,
    jobs: s.jobs,
    salesFit: s.salesFit,
    emoji: s.emoji,
  }
}
