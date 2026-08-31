import { supabase } from './supabase'

const QUEUE_KEY = 'pruactive-offline-queue'
let listeners = []

function readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeQueueToStorage(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  listeners.forEach((cb) => cb(queue.length))
}

function isNetworkError(err) {
  if (!err) return false
  const msg = (err.message || String(err)).toLowerCase()
  return (
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('load failed') ||
    msg.includes('networkerror') ||
    err.name === 'TypeError'
  )
}

async function execute(item) {
  const { table, method, payload, match } = item
  let query = supabase.from(table)
  if (method === 'insert') {
    return await query.insert(payload)
  }
  if (method === 'update') {
    let q = query.update(payload)
    Object.entries(match || {}).forEach(([k, v]) => { q = q.eq(k, v) })
    return await q
  }
  if (method === 'delete') {
    let q = query.delete()
    Object.entries(match || {}).forEach(([k, v]) => { q = q.eq(k, v) })
    return await q
  }
  return { error: new Error('Unknown method: ' + method) }
}

/**
 * Pengganti pemanggilan supabase.from(table)... langsung.
 * Coba eksekusi ke server dulu; kalau gagal karena masalah jaringan,
 * simpan ke antrian lokal dan anggap berhasil (optimistic).
 * Error non-jaringan (validasi/permission) tetap dilempar seperti biasa.
 */
export async function writeWithQueue(table, method, payload = null, match = null) {
  const item = { table, method, payload, match }
  try {
    const { error } = await execute(item)
    if (error) {
      if (isNetworkError(error)) {
        queueItem(item)
        return { queued: true, data: payload }
      }
      throw error
    }
    return { queued: false, data: payload }
  } catch (err) {
    if (isNetworkError(err)) {
      queueItem(item)
      return { queued: true, data: payload }
    }
    throw err
  }
}

function queueItem(item) {
  const queue = readQueue()
  queue.push({
    id: crypto.randomUUID(),
    ...item,
    created_at: new Date().toISOString(),
  })
  writeQueueToStorage(queue)
}

/**
 * Coba kirim ulang semua item di antrian, satu per satu (FIFO).
 * Item yang berhasil dihapus dari antrian; yang masih gagal tetap ada.
 */
export async function flushQueue() {
  const queue = readQueue()
  if (queue.length === 0) return

  const remaining = []
  for (const item of queue) {
    try {
      const { error } = await execute(item)
      if (error && isNetworkError(error)) {
        remaining.push(item) // masih offline, coba lagi nanti
      }
      // error non-jaringan pada saat flush: item dibuang (data invalid,
      // tidak ada gunanya diulang terus) — bisa ditingkatkan nanti dengan
      // dead-letter log kalau diperlukan
    } catch (err) {
      if (isNetworkError(err)) remaining.push(item)
    }
  }
  writeQueueToStorage(remaining)
}

export function getQueueCount() {
  return readQueue().length
}

export function subscribeQueueChange(callback) {
  listeners.push(callback)
  callback(getQueueCount())
  return () => { listeners = listeners.filter((cb) => cb !== callback) }
}

// Auto-flush: begitu browser online, dan dicek ulang tiap 30 detik
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { flushQueue() })
  setInterval(() => { flushQueue() }, 30000)
}
