'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Cotizador } from '@/types'

const DEF: Cotizador = {nombre:'',empresa:'',tel:'',mail:'',web:'',cuit:'',dir:'',logo:''}

export default function PagCotizador({ msg }: { msg:(m:string,t?:string)=>void }) {
  const [cotiz, setCotiz] = useState<Cotizador>(DEF)
  const [dbId, setDbId] = useState<string|null>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('cotizador').select('*').limit(1).then(({data}) => {
      if (data?.[0]) { setCotiz(data[0]); setDbId(data[0].id) }
    })
  }, [])

  const upd = (k: keyof Cotizador, v: string) => setCotiz(c => ({...c, [k]: v}))

  const guardar = async () => {
    const payload = {...cotiz, updated_at: new Date().toISOString()}
    if (dbId) {
      await supabase.from('cotizador').update(payload).eq('id', dbId)
    } else {
      const { data } = await supabase.from('cotizador').insert([payload]).select().single()
      if (data) setDbId(data.id)
    }
    msg('Datos guardados ✓')
  }

  return (
    <div className="card">
      <div className="card-title">🪪 Mis datos</div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:18,gap:8}}>
        <div style={{width:110,height:110,border:'2px dashed var(--b2)',borderRadius:10,background:'var(--bg2)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden'}}
          onClick={()=>logoRef.current?.click()}>
          {cotiz.logo
            ?<img src={cotiz.logo} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
            :<div style={{fontSize:11,color:'var(--t3)',textAlign:'center',padding:10}}>📷<br/>Logo de empresa<br/><span style={{fontSize:9}}>PNG, JPG, SVG</span></div>}
        </div>
        <input type="file" accept="image/*" ref={logoRef} style={{display:'none'}}
          onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>upd('logo',ev.target?.result as string);r.readAsDataURL(f)}}/>
        <div style={{display:'flex',gap:6}}>
          <button className="btn btn-sec btn-sm" onClick={()=>logoRef.current?.click()}>📷 {cotiz.logo?'Cambiar':'Subir'} logo</button>
          {cotiz.logo&&<button className="btn btn-danger btn-sm" onClick={()=>upd('logo','')}>✕ Quitar</button>}
        </div>
      </div>
      <div className="grid2" style={{marginBottom:10}}>
        <div className="fg"><label>Nombre / Razón social</label><input value={cotiz.nombre} onChange={e=>upd('nombre',e.target.value)}/></div>
        <div className="fg"><label>Empresa</label><input value={cotiz.empresa} onChange={e=>upd('empresa',e.target.value)}/></div>
        <div className="fg"><label>Teléfono / WhatsApp</label><input value={cotiz.tel} onChange={e=>upd('tel',e.target.value)}/></div>
        <div className="fg"><label>Email</label><input type="email" value={cotiz.mail} onChange={e=>upd('mail',e.target.value)}/></div>
        <div className="fg"><label>Sitio web</label><input value={cotiz.web} onChange={e=>upd('web',e.target.value)} placeholder="https://"/></div>
        <div className="fg"><label>CUIT</label><input value={cotiz.cuit} onChange={e=>upd('cuit',e.target.value)}/></div>
      </div>
      <div className="fg" style={{marginBottom:14}}><label>Dirección</label><input value={cotiz.dir} onChange={e=>upd('dir',e.target.value)}/></div>
      <div style={{display:'flex',justifyContent:'flex-end'}}><button className="btn btn-acc" onClick={guardar}>Guardar</button></div>
    </div>
  )
}
