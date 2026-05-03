'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Cliente } from '@/types'

const EMPTY: Omit<Cliente,'id'> = {nombre:'',empresa:'',tel:'',mail:'',dir:'',notas:''}

export default function PagClientes({ msg }: { msg:(m:string,t?:string)=>void }) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>({...EMPTY})
  const [editId, setEditId] = useState<string|null>(null)

  const cargar = async () => {
    const { data } = await supabase.from('clientes').select('*').order('nombre')
    if (data) setClientes(data)
  }
  useEffect(() => { cargar() }, [])

  const abrir = (c?: Cliente) => {
    setForm(c ? {...c} : {...EMPTY})
    setEditId(c?.id || null)
    setModal(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim()) { msg('El nombre es requerido','err'); return }
    const payload = { nombre:form.nombre,empresa:form.empresa,tel:form.tel,mail:form.mail,dir:form.dir,notas:form.notas }
    if (editId) {
      await supabase.from('clientes').update(payload).eq('id', editId)
    } else {
      await supabase.from('clientes').insert([payload])
    }
    msg('Guardado ✓')
    setModal(false)
    cargar()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar cliente?')) return
    await supabase.from('clientes').delete().eq('id', id)
    msg('Eliminado')
    cargar()
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <button className="btn btn-acc" onClick={()=>abrir()}>+ Nuevo cliente</button>
      </div>
      {!clientes.length && <div className="empty"><div className="eic">👥</div><p>Sin clientes</p></div>}
      {clientes.map(c => (
        <div key={c.id} className="cli-row">
          <div className="cli-av">{c.nombre.slice(0,2).toUpperCase()}</div>
          <div className="cli-inf">
            <div className="cli-n">{c.nombre}{c.empresa&&<span style={{color:'var(--t3)',fontWeight:400}}> — {c.empresa}</span>}</div>
            <div className="cli-d">{c.tel&&'Tel: '+c.tel}{c.tel&&c.mail&&' · '}{c.mail}</div>
          </div>
          <button className="btn btn-sec btn-sm" onClick={()=>abrir(c)}>✏️</button>
          <button className="btn btn-danger btn-sm" onClick={()=>eliminar(c.id)}>🗑</button>
        </div>
      ))}
      {modal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal" style={{width:500}}>
            <div className="modal-hdr"><h3>{editId?'Editar':'Nuevo'} cliente</h3><button onClick={()=>setModal(false)}>×</button></div>
            <div className="grid2" style={{marginBottom:10}}>
              <div className="fg"><label>Nombre *</label><input value={form.nombre} onChange={e=>setForm((f:any)=>({...f,nombre:e.target.value}))}/></div>
              <div className="fg"><label>Empresa</label><input value={form.empresa||''} onChange={e=>setForm((f:any)=>({...f,empresa:e.target.value}))}/></div>
              <div className="fg"><label>Teléfono</label><input value={form.tel||''} onChange={e=>setForm((f:any)=>({...f,tel:e.target.value}))}/></div>
              <div className="fg"><label>Email</label><input type="email" value={form.mail||''} onChange={e=>setForm((f:any)=>({...f,mail:e.target.value}))}/></div>
            </div>
            <div className="fg" style={{marginBottom:10}}><label>Dirección</label><input value={form.dir||''} onChange={e=>setForm((f:any)=>({...f,dir:e.target.value}))}/></div>
            <div className="fg" style={{marginBottom:14}}><label>Notas</label><textarea value={form.notas||''} onChange={e=>setForm((f:any)=>({...f,notas:e.target.value}))}/></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn btn-sec" onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn btn-acc" onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
