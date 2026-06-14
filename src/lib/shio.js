const SHIO_LIST = [
  { name: 'Tikus', years: [1924,1936,1948,1960,1972,1984,1996,2008,2020], traits: 'Cerdas, adaptif, dan selalu punya rencana cadangan.' },
  { name: 'Kerbau', years: [1925,1937,1949,1961,1973,1985,1997,2009,2021], traits: 'Tekun, dapat diandalkan, dan sangat setia pada keluarga.' },
  { name: 'Harimau', years: [1926,1938,1950,1962,1974,1986,1998,2010,2022], traits: 'Berani, penuh semangat, dan selalu siap melindungi yang dicintai.' },
  { name: 'Kelinci', years: [1927,1939,1951,1963,1975,1987,1999,2011,2023], traits: 'Tenang, bijaksana, dan sangat menjaga keharmonisan.' },
  { name: 'Naga', years: [1928,1940,1952,1964,1976,1988,2000,2012,2024], traits: 'Karismatik, ambisius, dan lahir sebagai pemimpin.' },
  { name: 'Ular', years: [1929,1941,1953,1965,1977,1989,2001,2013,2025], traits: 'Intuitif, strategis, dan sangat protektif terhadap keluarga.' },
  { name: 'Kuda', years: [1930,1942,1954,1966,1978,1990,2002,2014,2026], traits: 'Energik, bebas, dan selalu bergerak menuju tujuan besar.' },
  { name: 'Kambing', years: [1931,1943,1955,1967,1979,1991,2003,2015], traits: 'Kreatif, empatik, dan sangat peduli pada orang-orang tersayang.' },
  { name: 'Monyet', years: [1932,1944,1956,1968,1980,1992,2004,2016], traits: 'Cerdik, fleksibel, dan selalu menemukan solusi dari setiap masalah.' },
  { name: 'Ayam', years: [1933,1945,1957,1969,1981,1993,2005,2017], traits: 'Perfeksionis, detail, dan sangat serius dalam memenuhi tanggung jawab.' },
  { name: 'Anjing', years: [1934,1946,1958,1970,1982,1994,2006,2018], traits: 'Setia, jujur, dan rela berkorban untuk keluarga.' },
  { name: 'Babi', years: [1935,1947,1959,1971,1983,1995,2007,2019], traits: 'Hangat, dermawan, dan selalu ingin yang terbaik untuk orang lain.' },
]

export function getShio(birthYear) {
  const year = typeof birthYear === 'string' ? parseInt(birthYear) : birthYear
  return SHIO_LIST.find(s => s.years.includes(year)) || { name: 'Tidak diketahui', traits: '' }
}

export function getAgeFromDob(dob) {
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}
