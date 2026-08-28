import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const VAPID_PUBLIC_KEY = 'BDpvwGQVZix2dzC0F46SQn3JkUJ2FWNdf0Lc9v8SMcjtVjeu6skH7vlLJC11Lje9Y3AmaCHv6U3kOH_i7xQ4waw'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

const DISMISS_KEY = 'pruactive-notif-banner-dismissed'

export default function NotificationBanner() {
  const [status, setStatus] = useState('checking') // checking | hidden | needs-ios-install | can-enable | enabling | enabled | unsupported
  const [error, setError] = useState(null)

  useEffect(() => {
    async function check() {
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatus('unsupported')
        return
      }
      if (localStorage.getItem(DISMISS_KEY) === '1') {
        setStatus('hidden')
        return
      }
      if (Notification.permission === 'granted') {
        setStatus('enabled')
        return
      }
      if (isIos() && !isStandalone()) {
        setStatus('needs-ios-install')
        return
      }
      setStatus('can-enable')
    }
    check()
  }, [])

  async function handleEnable() {
    setStatus('enabling')
    setError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('can-enable')
        setError('Izin notifikasi tidak diberikan.')
        return
      }
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const json = subscription.toJSON()

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) throw new Error('Sesi tidak valid, silakan login ulang.')

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-push-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: json.keys,
            device_label: navigator.platform || navigator.userAgent.slice(0, 40),
          }),
        }
      )
      const result = await resp.json()
      if (!resp.ok || !result.success) throw new Error(result.error || 'Gagal menyimpan subscription.')

      setStatus('enabled')
    } catch (e) {
      setStatus('can-enable')
      setError(e.message || 'Terjadi kesalahan.')
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setStatus('hidden')
  }

  if (status === 'checking' || status === 'hidden' || status === 'enabled' || status === 'unsupported') {
    return null
  }

  const cardStyle = {
    background: '#EEEDFE',
    border: '1px solid #C4C0F5',
    borderRadius: '12px',
    padding: '14px 16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
  }

  if (status === 'needs-ios-install') {
    return (
      <div style={cardStyle}>
        <div style={{ fontSize: '22px' }}>📱</div>
        <div style={{ flex: 1, fontSize: '13px', color: '#3C3489', lineHeight: 1.6 }}>
          <strong>Khusus iPhone:</strong> install dulu supaya bisa terima notifikasi — tap tombol{' '}
          <strong>Share</strong> di Safari → <strong>Add to Home Screen</strong> → buka lagi dari ikon di layar utama.
        </div>
        <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6C757D', fontSize: '14px' }}>✕</button>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: '22px' }}>🔔</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', color: '#3C3489', fontWeight: 600 }}>
          Aktifkan notifikasi biar gak ketinggalan reminder & prospek baru
        </div>
        {error && <div style={{ fontSize: '12px', color: '#9B1C1C', marginTop: '4px' }}>{error}</div>}
      </div>
      <button
        onClick={handleEnable}
        disabled={status === 'enabling'}
        style={{
          background: status === 'enabling' ? '#C4C0F5' : '#7F77DD',
          color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px',
          fontSize: '13px', fontWeight: 700, cursor: status === 'enabling' ? 'not-allowed' : 'pointer',
          fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", whiteSpace: 'nowrap',
        }}
      >
        {status === 'enabling' ? 'Mengaktifkan...' : 'Aktifkan'}
      </button>
      <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6C757D', fontSize: '14px' }}>✕</button>
    </div>
  )
}
