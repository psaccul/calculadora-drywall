'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PanelAdmin({ msg }: { msg:(m:string,t?:string)=>void }) {
  const [licencias, setLicencias] = useState<any[]>([])
  const [form, setForm] = useState({clave:'',usuario:'',rol:'user',vencimiento:''})
  const hoy = new Date().toISOString().slice(0,10)

  const cargar = async () => {
    const { data } = await supabase.from('licencias').select('*').order('created_at')
    if (data) setLicencias(data)
  }
  useEffect(() => { cargar() }, [])

  const agregar = async () => {
    if (!form.clave || !form.usuario) { msg('Clave y usuario requeridos','err'); return }
    await supabase.from('licencias').insert([{
      clave: form.clave.toUpperCase(),
      usuario: form.usuario,
      rol: form.rol,
      vencimiento: form.vencimiento || null,
      activa: true,
    }])
    msg('Licencia creada ✓')
    setForm({clave:'',usuario:'',rol:'user',vencimiento:''})
    cargar()
  }

  const toggleActiva = async (id: string, activa: boolean) => {
    await supabase.from('licencias').update({activa: !activa}).eq('id', id)
    cargar()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar licencia?')) return
    await supabase.from('licencias').delete().eq('id', id)
    msg('Eliminada')
    cargar()
  }

  const copiar = (clave: string) => {
    navigator.clipboard?.writeText(clave).then(() => msg('Clave copiada ✓'))
  }

  return (
    <div>
      <div className="admin-panel">
        <h3>🔐 Licencias activas</h3>
        {licencias.map(l => {
          const vencida = l.vencimiento && hoy > l.vencimiento
          return (
            <div key={l.id} className="lic-row">
              <span className="lic-key">{l.clave}</span>
              <span className="lic-user">{l.usuario}</span>
              <span style={{color:l.rol==='admin'?'var(--acc)':'var(--t2)',fontSize:10,fontWeight:700,minWidth:50}}>{l.rol}</span>
              <span className="lic-exp">{l.vencimiento||'Sin vencimiento'}</span>
              <span className={`lic-status ${vencida||!l.activa?'lic-exp-badge':'lic-ok'}`}>
                {!l.activa?'Inactiva':vencida?'Vencida':'Activa'}
              </span>
              <button className="btn btn-sec btn-sm" onClick={()=>copiar(l.clave)}>⧉</button>
              <button className="btn btn-sec btn-sm" onClick={()=>toggleActiva(l.id,l.activa)}>{l.activa?'Desactivar':'Activar'}</button>
              <button className="btn btn-danger btn-sm" onClick={()=>eliminar(l.id)}>🗑</button>
            </div>
          )
        })}
      </div>
      <div className="admin-panel">
        <h3>➕ Nueva licencia</h3>
        <div className="grid4" style={{marginBottom:10}}>
          <div className="fg"><label>Clave</label><input value={form.clave} onChange={e=>setForm(f=>({...f,clave:e.target.value.toUpperCase()}))} style={{fontFamily:'monospace'}} placeholder="DRW-XXXX-2025"/></div>
          <div className="fg"><label>Usuario</label><input value={form.usuario} onChange={e=>setForm(f=>({...f,usuario:e.target.value}))}/></div>
          <div className="fg"><label>Rol</label>
            <select value={form.rol} onChange={e=>setForm(f=>({...f,rol:e.target.value}))}>
              <option value="user">user</option><option value="admin">admin</option>
            </select>
          </div>
          <div className="fg"><label>Vencimiento (opcional)</label><input type="date" value={form.vencimiento} onChange={e=>setForm(f=>({...f,vencimiento:e.target.value}))}/></div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end'}}>
          <button className="btn btn-acc" onClick={agregar}>Crear licencia</button>
        </div>
      </div>
    </div>
  )
}
