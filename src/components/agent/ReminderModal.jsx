import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const STAGE_LABEL = { fact_finding:'Fact Finding', fu1:'FU 1', fu2:'FU 2', presentasi:'Presentasi', closing:'Closing' }

export default function ReminderModal({ agent, prospect, onClose, onSaved }) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().slice(0, 10)
  const defaultTime = '09:00'

  const [date, setDate]   = useState(defaultDate)
  const [time, setTime]   = useState(defaultTime)
  const [label, setLabel] = useState(`FU ${prospect.stage.replace('_',' ')} - ${prospect.full_name}`)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function handleSave() {
    if (!date || !time) { setError('Tanggal dan jam wajib diisi'); return }
    setSaving(true); setError('')
    const remind_at = new Date(`${date}T${time}:00`).toISOString()
    const { error: err } = await supabase.from('reminders').insert({
      prospect_id: prospect.id,
      agent_id:    agent.id,
      remind_at,
      label:       label.trim() || null,
    })
    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={s.modal}>
        <div style={s.head}>
          <span style={s.headTitle}>🔔 Set Reminder</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={s.body}>
          {/* Prospect info */}
          <div style={s.prospectBadge}>
            <div style={{ fontWeight:'600', color:'#1A1A2E', fontSize:'14px' }}>{prospect.full_name}</div>
            <div style={{ fontSize:'11px', color:'#6C757D', marginTop:'2px' }}>
              Tahap: <strong>{STAGE_LABEL[prospect.stage]}</strong> · {prospect.prospect_type === 'nasabah' ? '🏦 Nasabah' : '🤝 Rekrutan'}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div style={s.group}>
              <label style={s.label}>Tanggal Follow-up *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={s.input} min={new Date().toISOString().slice(0,10)} />
            </div>
            <div style={s.group}>
              <label style={s.label}>Jam *</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={s.input} />
            </div>
          </div>

          <div style={s.group}>
            <label style={s.label}>Catatan Reminder <span style={{ fontWeight:400, color:'#ADB5BD' }}>(opsional)</span></label>
            <input style={s.input} value={label} onChange={e => setLabel(e.target.value)} placeholder="Contoh: FU1 - diskusi kebutuhan asuransi" />
          </div>

          <div style={s.hint}>
            💡 Reminder akan muncul di notifikasi dashboard pada tanggal yang kamu pilih.
          </div>

          {error && <div style={s.error}>{error}</div>}
        </div>
        <div style={s.foot}>
          <button style={{ ...s.btn, ...s.btnOutline }} onClick={onClose}>Batal</button>
          <button style={{ ...s.btn, ...s.btnRed, opacity: saving ? .7 : 1 }} onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : '🔔 Simpan Reminder'}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' },
  modal: { background:'white', borderRadius:'14px', width:'100%', maxWidth:'420px', boxShadow:'0 20px 60px rgba(0,0,0,.2)' },
  head: { padding:'16px 18px', borderBottom:'1px solid #E9ECEF', display:'flex', alignItems:'center', justifyContent:'space-between' },
  headTitle: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'14px', fontWeight:'700', color:'#1A1A2E' },
  closeBtn: { width:'26px', height:'26px', borderRadius:'6px', border:'none', background:'#F1F3F5', cursor:'pointer', fontSize:'13px' },
  body: { padding:'16px 18px' },
  foot: { padding:'14px 18px', borderTop:'1px solid #E9ECEF', display:'flex', justifyContent:'flex-end', gap:'8px' },
  prospectBadge: { background:'#F8F9FA', border:'1px solid #E9ECEF', borderRadius:'8px', padding:'10px 12px', marginBottom:'14px' },
  group: { marginBottom:'12px' },
  label: { display:'block', fontSize:'11px', fontWeight:'600', color:'#343A40', marginBottom:'5px' },
  input: { width:'100%', padding:'8px 11px', border:'1.5px solid #E9ECEF', borderRadius:'8px', fontSize:'12px', fontFamily:"'Inter',sans-serif", outline:'none', color:'#1A1A2E', background:'white' },
  hint: { background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'9px 11px', fontSize:'11px', color:'#1D4ED8', lineHeight:'1.5', marginBottom:'12px' },
  error: { background:'#FFF0F1', border:'1px solid #FDDDE0', borderRadius:'8px', padding:'9px 11px', fontSize:'12px', color:'#C0141F' },
  btn: { display:'inline-flex', alignItems:'center', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer', border:'none', fontFamily:"'Inter',sans-serif" },
  btnRed: { background:'#ED1B2E', color:'white' },
  btnOutline: { background:'white', border:'1px solid #E9ECEF', color:'#343A40' },
}
