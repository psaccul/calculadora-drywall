'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/calc'
import ModalPDF from './ModalPDF'

export default function PagPresupuestos({ msg, refresh }: { msg:(m:string,t?:string)=>void; refresh:number }) {
  const [presups, setPresups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pdfData, setPdfData] = useState<any>(null)

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase.from('presupuestos').select('*').order('created_at', { ascending: false })
    if (data) setPresups(data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [refresh])

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar presupuesto?')) return
    await supabase.from('presupuestos').delete().eq('id', id)
    msg('Eliminado')
    cargar()
  }

  const abrirPdf = (p: any) => {
    setPdfData({
      nro: p.numero, num: p.numero, fecha: p.fecha,
      cliente: p.cliente_snapshot,
      ambs: p.ambientes, res: p.resultados,
      pr: p.precios_snapshot,
      moTipo: p.mo_tipo, moVal: p.mo_valor, mo: p.mo,
      adics: p.adicionales, desc: p.descuento, imp: p.impuesto, iva: p.iva,
      totM2: p.tot_m2, totMat: p.tot_mat, subTot: p.sub_tot,
      dVal: p.d_val, iVal: p.i_val, ivaVal: p.iva_val, total: p.total,
    })
  }

  if (loading) return <div className="empty"><div className="eic">⏳</div><p>Cargando...</p></div>
  if (!presups.length) return <div className="empty"><div className="eic">📋</div><p>No hay presupuestos guardados</p></div>

  return (
    <div>
      {presups.map(p => (
        <div key={p.id} className="q-row">
          <div style={{fontSize:20}}>📄</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--t1)'}}>Presupuesto #{p.numero} — {p.fecha}</div>
            <div style={{fontSize:10,color:'var(--t3)'}}>{p.cliente_snapshot?.nombre||'Sin cliente'} · {p.tot_m2||0} m²</div>
          </div>
          <div style={{fontSize:14,fontWeight:800,color:'var(--acc)'}}>{fmt(p.total||0)}</div>
          <button className="btn btn-blue btn-sm" onClick={()=>abrirPdf(p)}>📄 PDF</button>
          <button className="btn btn-danger btn-sm" onClick={()=>eliminar(p.id)}>🗑</button>
        </div>
      ))}
      {pdfData && <ModalPDF data={pdfData} onClose={()=>setPdfData(null)} msg={msg}/>}
    </div>
  )
}
