import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const SOURCES = ['keluarga','teman','tetangga','media_sosial','komunitas','lainnya']
const SOURCE_LABEL = { keluarga:'Keluarga', teman:'Teman', tetangga:'Tetangga', media_sosial:'Media Sosial', komunitas:'Komunitas', lainnya:'Lainnya' }
const OCCUPATIONS = ['karyawan','executive_manajer','pedagang','online_shop','pensiunan','lainnya']
const OCC_LABEL = { karyawan:'Karyawan', executive_manajer:'Executive / Manajer', pedagang:'Pedagang', online_shop:'Online Shop', pensiunan:'Pensiunan', lainnya:'Lainnya' }
const STAGES = ['fact_finding','fu1','fu2','presentasi','closing']
const STAGE_LABEL = { fact_finding:'Fact Finding', fu1:'FU 1', fu2:'FU 2', presentasi:'Presentasi', closing:'Closing' }

export default function ProspekModal({ agent, onClose, onSaved, initial = null }) {
  const isEdit = !!initial
  const [form, setForm] = useState({
    prospect_type:  initial?.prospect_type  || 'nasabah',
    full_name:      initial?.full_name      || '',
    dob:            initial?.dob            || '',
    marital_status: initial?.marital_status || 'single',
    occupation:     initial?.occupation     || 'karyawan',
    whatsapp:       initial?.whatsapp       || '',
    source:         initial?.source         || 'teman',
    stage:          initial?.stage          || 'fact_finding',
    notes:          initial?.notes          || '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.full_name.trim()) { setError('Nama wajib diisi'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, agent_id: agent.id }
      let err
      if (isEdit) {
        ;({ error: err } = await supabase.from('prospects').update(payload).eq('id', initial.id))
        if (!err) {
          // Log stage change jika berubah
          if (form.stage !== initial.stage) {
            await supabase.from('followup_logs').insert({
              prospect_id: initial.id,
              agent_id: agent.id,
              from_stage: initial.stage,
              to_stage: form.stage,
              notes: 'Update via edit prospek',
            })
          }
        }
      } else {
        ;({ error: err } = await supabase.from('prospects').insert(payload))
      }
      if (err) throw err
      onSaved()
    } catch (e) {
      setError(e.message || 'Gagal menyimpan')
      setSaving(false)
    }
  }

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={s.modal}>
        <div style={s.head}>
          <span style={s.headTitle}>{isEdit ? '✏️ Edit Prospek' : '+ Tambah Prospek Baru'}</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={s.body}>
          {/* TIPE */}
          <div style={s.group}>
            <label style={s.label}>Tipe Prospek</label>
            <div style={s.typeGrid}>
              {['nasabah','rekrutan'].map(t => (
                <div key={t} style={{ ...s.typeOpt, ...(form.prospect_type === t ? (t === 'nasabah' ? s.typeSelNasabah : s.typeSelRekrutan) : {}) }} onClick={() => set('prospect_type', t)}>
                  <div style={{ fontSize:'20px', marginBottom:'4px' }}>{t === 'nasabah' ? '🏦' : '🤝'}</div>
                  <div style={{ fontSize:'12px', fontWeight:'700', color: form.prospect_type === t ? (t === 'nasabah' ? '#ED1B2E' : '#2563EB') : '#343A40' }}>
                    {t === 'nasabah' ? 'Calon Nasabah' : 'Calon Rekrutan'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NAMA & DOB */}
          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Nama Lengkap *</label>
              <input style={s.input} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Contoh: Budi Santoso" autoFocus />
            </div>
            <div style={s.group}>
              <label style={s.label}>Tanggal Lahir</label>
              <input style={s.input} type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
            </div>
          </div>

          {/* STATUS & PEKERJAAN */}
          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Status Pernikahan</label>
              <select style={s.input} value={form.marital_status} onChange={e => set('marital_status', e.target.value)}>
                <option value="single">Single</option>
                <option value="menikah">Menikah</option>
              </select>
            </div>
            <div style={s.group}>
              <label style={s.label}>Pekerjaan</label>
              <select style={s.input} value={form.occupation} onChange={e => set('occupation', e.target.value)}>
                {OCCUPATIONS.map(o => <option key={o} value={o}>{OCC_LABEL[o]}</option>)}
              </select>
            </div>
          </div>

          {/* SUMBER & WA */}
          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Sumber Nama</label>
              <select style={s.input} value={form.source} onChange={e => set('source', e.target.value)}>
                {SOURCES.map(src => <option key={src} value={src}>{SOURCE_LABEL[src]}</option>)}
              </select>
            </div>
            <div style={s.group}>
              <label style={s.label}>Nomor WhatsApp</label>
              <input style={s.input} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="08123456789" />
            </div>
          </div>

          {/* TAHAP */}
          <div style={s.group}>
            <label style={s.label}>Tahap Saat Ini</label>
            <select style={s.input} value={form.stage} onChange={e => set('stage', e.target.value)}>
              {STAGES.map(st => <option key={st} value={st}>{STAGE_LABEL[st]}</option>)}
            </select>
          </div>

          {/* HINT */}
          <div style={s.hint}>
            📅 <strong>Tanggal Follow-up</strong> diatur sendiri oleh kamu sesuai kesepakatan dengan prospek. Setelah simpan, atur jadwal di menu <strong>Reminder</strong>.
          </div>

          {/* KETERANGAN */}
          <div style={s.group}>
            <label style={s.label}>Keterangan <span style={{ fontWeight:400, color:'#ADB5BD' }}>(opsional)</span></label>
            <textarea style={{ ...s.input, minHeight:'70px', resize:'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Profil singkat, kebutuhan, hasil fact finding, atau catatan penting..." />
          </div>

          {error && <div style={s.error}>{error}</div>}
        </div>

        <div style={s.foot}>
          <button style={{ ...s.btn, ...s.btnOutline }} onClick={onClose}>Batal</button>
          <button style={{ ...s.btn, ...s.btnRed, opacity: saving ? .7 : 1 }} onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Prospek')}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' },
  modal: { background:'white', borderRadius:'14px', width:'100%', maxWidth:'480px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,.2)' },
  head: { padding:'16px 18px', borderBottom:'1px solid #E9ECEF', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'white', zIndex:1 },
  headTitle: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'14px', fontWeight:'700', color:'#1A1A2E' },
  closeBtn: { width:'26px', height:'26px', borderRadius:'6px', border:'none', background:'#F1F3F5', cursor:'pointer', fontSize:'13px', display:'flex', alignItems:'center', justifyContent:'center' },
  body: { padding:'16px 18px' },
  foot: { padding:'14px 18px', borderTop:'1px solid #E9ECEF', display:'flex', justifyContent:'flex-end', gap:'8px', position:'sticky', bottom:0, background:'white' },
  group: { marginBottom:'12px' },
  label: { display:'block', fontSize:'11px', fontWeight:'600', color:'#343A40', marginBottom:'5px' },
  input: { width:'100%', padding:'8px 11px', border:'1.5px solid #E9ECEF', borderRadius:'8px', fontSize:'12px', fontFamily:"'Inter',sans-serif", outline:'none', color:'#1A1A2E', background:'white', transition:'border-color .15s' },
  row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  typeGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' },
  typeOpt: { padding:'10px', borderRadius:'8px', border:'2px solid #E9ECEF', cursor:'pointer', textAlign:'center', transition:'all .15s' },
  typeSelNasabah: { borderColor:'#ED1B2E', background:'#FFF0F1' },
  typeSelRekrutan: { borderColor:'#2563EB', background:'#EFF6FF' },
  hint: { background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:'8px', padding:'9px 11px', fontSize:'11px', color:'#92400E', lineHeight:'1.5', marginBottom:'12px' },
  error: { background:'#FFF0F1', border:'1px solid #FDDDE0', borderRadius:'8px', padding:'9px 11px', fontSize:'12px', color:'#C0141F', marginTop:'8px' },
  btn: { display:'inline-flex', alignItems:'center', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer', border:'none', fontFamily:"'Inter',sans-serif" },
  btnRed: { background:'#ED1B2E', color:'white' },
  btnOutline: { background:'white', border:'1px solid #E9ECEF', color:'#343A40' },
}
