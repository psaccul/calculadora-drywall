'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/calc'
import { TIPO_LABELS, TIPO_COLOR } from '@/lib/catalogo'
import type { Cotizador } from '@/types'

function matRows(a: any, r: any, pr: Record<string,number>) {
  return [
    {key:'placa_'+r.placa?.pk,  label:r.placa?.label||'Placa',          cant:r.placas,  u:'ud',    precio:pr[r.placa?.pk]||0, total:r.placas*(pr[r.placa?.pk]||0)},
    {key:'mont_'+r.mont?.pk,    label:r.mont?.label||'Montante',        cant:r.monts,   u:'barras',precio:pr[r.mont?.pk]||0,  total:r.monts*(pr[r.mont?.pk]||0)},
    {key:'sol_'+r.sol?.pk,      label:r.sol?.label||'Solera',           cant:r.sols,    u:'barras',precio:pr[r.sol?.pk]||0,   total:r.sols*(pr[r.sol?.pk]||0)},
    r.t1>0&&{key:'t1',          label:'Tornillos T1',                   cant:r.t1,      u:'ud',    precio:(pr.t1_x100||0)/100,total:(r.t1/100)*(pr.t1_x100||0)},
    r.t2>0&&{key:'t2',          label:'Tornillos T2',                   cant:r.t2,      u:'ud',    precio:(pr.t2_x100||0)/100,total:(r.t2/100)*(pr.t2_x100||0)},
    r.torn_mad>0&&{key:'tm_'+r.tmo?.pk,label:'Torn. madera '+(r.tmo?.label||''),cant:r.torn_mad,u:'ud',precio:pr[r.tmo?.pk]||0,total:r.torn_mad*(pr[r.tmo?.pk]||0)},
    r.clavos>0&&{key:'cl_'+r.clo?.pk,  label:r.clo?.label||'Clavos',   cant:r.clavos,  u:'kg',    precio:pr[r.clo?.pk]||0,   total:r.clavos*(pr[r.clo?.pk]||0)},
    r.masilla>0&&{key:'masilla',label:'Masilla',                        cant:r.masilla, u:'kg',    precio:pr.masilla_kg||0,   total:r.masilla*(pr.masilla_kg||0)},
    r.cp>0&&{key:'cp',          label:'Cinta de papel',                 cant:r.cp,      u:'m',     precio:pr.cinta_papel_m||0,total:r.cp*(pr.cinta_papel_m||0)},
    r.cm>0&&{key:'cm',          label:'Cinta malla',                    cant:r.cm,      u:'m',     precio:pr.cinta_malla_m||0,total:r.cm*(pr.cinta_malla_m||0)},
    r.bv>0&&{key:'bv',          label:'Barrera de vapor',               cant:r.bv,      u:'m²',    precio:pr.barrera_vapor_m2||0,total:r.bv*(pr.barrera_vapor_m2||0)},
    r.ais>0&&{key:'ais',        label:'Aislación acústica',             cant:r.ais,     u:'m²',    precio:pr.aislacion_m2||0, total:r.ais*(pr.aislacion_m2||0)},
    r.burl>0&&{key:'burl',      label:'Burletes',                       cant:r.burl,    u:'ml',    precio:pr.burlete_ml||0,   total:r.burl*(pr.burlete_ml||0)},
    r.omega>0&&{key:'omega',    label:'Omega',                          cant:r.omega,   u:'ml',    precio:pr.omega_m||0,      total:r.omega*(pr.omega_m||0)},
    r.cant>0&&{key:'cant_',     label:'Cantonera',                      cant:r.cant,    u:'ml',    precio:pr.cantonera_m||0,  total:r.cant*(pr.cantonera_m||0)},
    r.ang>0&&{key:'ang',        label:'Ángulo de ajuste',               cant:r.ang,     u:'ml',    precio:pr.angulo_aj_m||0,  total:r.ang*(pr.angulo_aj_m||0)},
    r.bunia>0&&{key:'bunia',    label:'Buña Z',                         cant:r.bunia,   u:'ml',    precio:pr.bunia_z_m||0,    total:r.bunia*(pr.bunia_z_m||0)},
  ].filter(Boolean) as any[]
}

function buildCliente(data: any, cotiz: Cotizador, sinIva: boolean) {
  const {nro,num,fecha,cliente,ambs,res,pr,mo,adics,desc,imp,iva,totMat,subTot,dVal,iVal,ivaVal,total,moTipo,moVal} = data
  const nroF = nro||num
  const totF = sinIva ? total-(ivaVal||0) : total
  const consolidated: Record<string,{label:string;total:number}> = {}
  ;(ambs||[]).forEach((a:any,i:number) => {
    const r=(res||[])[i];if(!r)return
    matRows(a,r,pr||{}).forEach((row:any) => {
      if(!consolidated[row.key]) consolidated[row.key]={label:row.label,total:0}
      consolidated[row.key].total+=row.total
    })
  })
  const filas = Object.values(consolidated).map((m:any) =>
    `<tr><td>${m.label}</td><td style="text-align:right;font-weight:700">${fmt(m.total)}</td></tr>`
  ).join('')
  const moLabel = moTipo==='m2'?`M.O. por m²`:moTipo==='pct'?`M.O. ${moVal||0}%`:'M.O. fijo'
  return cabecera(cotiz,nroF,fecha,cliente,'PRESUPUESTO')+
    `<div style="font-size:11px;font-weight:700;color:#333;border-bottom:1.5px solid #f59e0b;padding-bottom:3px;margin:0 0 10px">MATERIALES</div>
    <table><thead><tr><th>Material</th><th style="text-align:right">Sub Total</th></tr></thead><tbody>${filas}</tbody></table>
    <div style="font-size:11px;font-weight:700;color:#333;border-bottom:1.5px solid #f59e0b;padding-bottom:3px;margin:14px 0 8px">RESUMEN</div>
    <table><tbody>
      <tr><td>Materiales</td><td style="text-align:right">${fmt(totMat)}</td></tr>
      <tr><td>${moLabel}</td><td style="text-align:right">${fmt(mo)}</td></tr>
      ${(adics||[]).filter((a:any)=>a.concepto).map((a:any)=>`<tr><td>${a.concepto}</td><td style="text-align:right">${fmt(parseFloat(a.val||0))}</td></tr>`).join('')}
      <tr><td style="font-weight:700">Subtotal</td><td style="text-align:right;font-weight:700">${fmt(subTot)}</td></tr>
      ${desc?`<tr><td style="color:#e53935">Descuento ${desc}%</td><td style="text-align:right;color:#e53935">-${fmt(dVal)}</td></tr>`:''}
      ${imp?`<tr><td>Impuesto ${imp}%</td><td style="text-align:right">${fmt(iVal)}</td></tr>`:''}
      ${!sinIva&&iva&&ivaVal?`<tr><td>IVA 21%</td><td style="text-align:right">${fmt(ivaVal)}</td></tr>`:''}
      <tr style="background:#fff8e1"><td style="font-weight:800;font-size:13px">TOTAL${sinIva?' (sin IVA)':''}</td><td style="text-align:right;font-weight:800;font-size:14px;color:#f59e0b">${fmt(totF)}</td></tr>
    </tbody></table>`+pie(cotiz)
}

function buildInterno(data: any, cotiz: Cotizador, sinIva: boolean) {
  const {nro,num,fecha,cliente,ambs,res,pr,mo,adics,desc,imp,iva,totMat,subTot,dVal,iVal,ivaVal,total,moTipo,moVal} = data
  const nroF = nro||num
  const totF = sinIva ? total-(ivaVal||0) : total
  const detalles = (ambs||[]).map((a:any,i:number) => {
    const r=(res||[])[i];if(!r)return''
    const tc=a.tipo_const||'drywall'
    const color=TIPO_COLOR[tc]||'#333'
    const rows = matRows(a,r,pr||{})
    return`<div style="margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:${color};margin-bottom:5px">${a.nombre}
        <span style="font-size:9px;background:${color}22;color:${color};padding:1px 6px;border-radius:8px;margin-left:6px">${TIPO_LABELS[tc]||tc}</span>
        <span style="font-size:9px;color:#888;font-weight:400;margin-left:4px">— ${r.m2N} m²</span>
      </div>
      <table><thead><tr><th>Material</th><th>Cant.</th><th>P.unit.</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>
      ${rows.map((row:any)=>`<tr><td>${row.label}</td><td>${row.cant} ${row.u}</td><td>${fmt(row.precio)}</td><td style="text-align:right">${fmt(row.total)}</td></tr>`).join('')}
      <tr style="background:#f5f5f5"><td colspan="3" style="font-weight:700">Subtotal ${a.nombre}</td><td style="text-align:right;font-weight:700">${fmt(r.costo)}</td></tr>
      </tbody></table></div>`
  }).join('')
  const consolidated: Record<string,any> = {}
  ;(ambs||[]).forEach((a:any,i:number) => {
    const r=(res||[])[i];if(!r)return
    matRows(a,r,pr||{}).forEach((row:any) => {
      if(!consolidated[row.key]) consolidated[row.key]={label:row.label,cant:0,u:row.u,precio:row.precio,total:0}
      consolidated[row.key].cant+=row.cant
      consolidated[row.key].total+=row.total
    })
  })
  const filasCompra = Object.values(consolidated).map((m:any) =>
    `<tr><td>${m.label}</td><td style="font-weight:700">${typeof m.cant==='number'&&!Number.isInteger(m.cant)?m.cant.toFixed(2):m.cant} ${m.u}</td><td>${fmt(m.precio)}</td><td style="text-align:right;font-weight:700">${fmt(m.total)}</td></tr>`
  ).join('')
  const moLabel = moTipo==='m2'?`Por m² (${fmt(parseFloat(moVal)||0)}/m²)`:moTipo==='pct'?`${moVal||0}% sobre materiales`:'Monto fijo'
  return cabecera(cotiz,nroF,fecha,cliente,'REPORTE INTERNO')+
    `<div style="font-size:11px;font-weight:700;color:#333;border-bottom:1.5px solid #f59e0b;padding-bottom:3px;margin:0 0 10px">DETALLE POR AMBIENTE</div>
    ${detalles}
    <div style="font-size:11px;font-weight:700;color:#333;border-bottom:1.5px solid #f59e0b;padding-bottom:3px;margin:14px 0 8px">📦 LISTA DE COMPRA CONSOLIDADA</div>
    <div style="font-size:9px;color:#888;margin-bottom:6px">Todos los materiales de la obra agrupados</div>
    <table><thead><tr><th>Material</th><th>Total a comprar</th><th>P. unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
    <tbody>${filasCompra}
    <tr style="background:#f5f5f5"><td colspan="3" style="font-weight:700">Total materiales</td><td style="text-align:right;font-weight:700">${fmt(totMat)}</td></tr>
    </tbody></table>
    <div style="font-size:11px;font-weight:700;color:#333;border-bottom:1.5px solid #f59e0b;padding-bottom:3px;margin:14px 0 8px">RESUMEN ECONÓMICO</div>
    <table><tbody>
      <tr><td>Materiales</td><td style="text-align:right">${fmt(totMat)}</td></tr>
      <tr><td>Mano de obra (${moLabel})</td><td style="text-align:right">${fmt(mo)}</td></tr>
      ${(adics||[]).filter((a:any)=>a.concepto).map((a:any)=>`<tr><td>${a.concepto}</td><td style="text-align:right">${fmt(parseFloat(a.val||0))}</td></tr>`).join('')}
      <tr><td style="font-weight:700">Subtotal</td><td style="text-align:right;font-weight:700">${fmt(subTot)}</td></tr>
      ${desc?`<tr><td style="color:#e53935">Descuento ${desc}%</td><td style="text-align:right;color:#e53935">-${fmt(dVal)}</td></tr>`:''}
      ${imp?`<tr><td>Impuesto ${imp}%</td><td style="text-align:right">${fmt(iVal)}</td></tr>`:''}
      ${!sinIva&&iva&&ivaVal?`<tr><td>IVA 21%</td><td style="text-align:right">${fmt(ivaVal)}</td></tr>`:''}
      <tr style="background:#fff8e1"><td style="font-weight:800;font-size:13px">TOTAL${sinIva?' (sin IVA)':''}</td><td style="text-align:right;font-weight:800;font-size:14px;color:#f59e0b">${fmt(totF)}</td></tr>
    </tbody></table>`+pie(cotiz)
}

function cabecera(cotiz: Cotizador, nroF: any, fecha: string, cliente: any, titulo: string) {
  return`<div style="font-family:Arial,sans-serif;font-size:10px;color:#222;padding:24px 28px;max-width:800px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2.5px solid #f59e0b;padding-bottom:10px;margin-bottom:14px">
      <div>
        ${cotiz?.logo?`<img src="${cotiz.logo}" style="height:50px;margin-bottom:5px;display:block"/>`:''}
        <div style="font-size:16px;font-weight:800;color:#1a1a2e">${cotiz?.empresa||cotiz?.nombre||''}</div>
        <div style="font-size:9px;color:#777;margin-top:2px">${cotiz?.tel?'Tel: '+cotiz.tel+' · ':''}${cotiz?.mail||''}</div>
        <div style="font-size:9px;color:#777">${cotiz?.web?cotiz.web+' · ':''}${cotiz?.cuit?'CUIT: '+cotiz.cuit:''}</div>
        ${cotiz?.dir?`<div style="font-size:9px;color:#777">${cotiz.dir}</div>`:''}
      </div>
      <div style="text-align:right">
        <div style="font-size:20px;font-weight:800;color:#f59e0b">${titulo} #${nroF}</div>
        <div style="font-size:9px;color:#777">Fecha: ${fecha||''}</div>
        <div style="font-size:9px;color:#aaa;margin-top:2px">Válido por 15 días</div>
      </div>
    </div>
    ${cliente?`<div style="background:#f9f9f9;padding:6px 10px;border-radius:3px;margin-bottom:12px;font-size:10px">
      <strong>${cliente.nombre}</strong>${cliente.empresa?' · '+cliente.empresa:''}
      <br/>${cliente.tel?'Tel: '+cliente.tel+' ':''}${cliente.mail||''}
    </div>`:''}`
}

function pie(cotiz: Cotizador) {
  return`<div style="font-size:8px;color:#aaa;text-align:center;margin-top:16px;border-top:1px solid #eee;padding-top:6px">
    Generado con Calcula Drywall Pro · ${cotiz?.nombre||''}
  </div></div>`
}

export default function ModalPDF({ data, onClose, msg }: { data:any; onClose:()=>void; msg:(m:string,t?:string)=>void }) {
  const {nro,num,fecha,cliente,iva,ivaVal,total,totM2} = data
  const nroF = nro||num
  const [sinIva, setSinIva] = useState(false)
  const [tipoReporte, setTipoReporte] = useState<'cliente'|'interno'>('cliente')
  const [cotiz, setCotiz] = useState<Cotizador>({nombre:'',empresa:'',tel:'',mail:'',web:'',cuit:'',dir:'',logo:''})
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('cotizador').select('*').limit(1).then(({data:d}) => { if(d?.[0]) setCotiz(d[0]) })
  }, [])

  const htmlContent = tipoReporte==='cliente' ? buildCliente(data,cotiz,sinIva) : buildInterno(data,cotiz,sinIva)
  const totFinal = sinIva ? (total||0)-(ivaVal||0) : (total||0)

  const generarPdf = async () => {
    if (!previewRef.current) return
    const html2pdf = (await import('html2pdf.js')).default
    const nombre = tipoReporte==='cliente' ? `Presupuesto_${nroF}.pdf` : `Reporte_${nroF}.pdf`
    return html2pdf().set({
      margin:[8,8,8,8], filename:nombre,
      image:{type:'jpeg',quality:0.97},
      html2canvas:{scale:2,useCORS:true,logging:false,backgroundColor:'#ffffff'},
      jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}
    }).from(previewRef.current).save()
  }

  const descargar = () => {
    msg('Generando PDF...','info')
    generarPdf()?.then(()=>msg('PDF descargado ✓')).catch(()=>msg('Error al generar PDF','err'))
  }

  const imprimir = () => {
    const w = window.open('','_blank')!
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pres. #${nroF}</title>
    <style>body{margin:0;padding:0}@media print{body{margin:0}}</style>
    </head><body>${htmlContent}</body></html>`)
    w.document.close()
    setTimeout(()=>w.print(),400)
  }

  const whatsapp = () => {
    const apDesc = data.ambs?.map((a:any)=>a.nombre).join(', ')||''
    const texto =
      `*PRESUPUESTO #${nroF}*\n📅 ${fecha||''}\n\n`+
      (cliente?.nombre?`👤 ${cliente.nombre}\n`:'')+
      `📐 ${totM2||0} m²\n`+(apDesc?`🏠 ${apDesc}\n`:'')+
      `\n💰 *TOTAL: ${fmt(totFinal)}*`+(sinIva?' (sin IVA)':'')+
      `\n\n---\n${cotiz.empresa||cotiz.nombre||''}`+
      (cotiz.tel?`\nTel: ${cotiz.tel}`:'')+
      (cotiz.mail?`\n${cotiz.mail}`:'')+
      `\n\n_Calcula Drywall Pro_`
    const numero = (cliente?.tel||'').replace(/\D/g,'')
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`,'_blank')
  }

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hdr">
          <h3>📄 Presupuesto #{nroF}<span style={{fontWeight:400,color:'var(--t3)',marginLeft:8,fontSize:12}}>{fecha}</span></h3>
          <button onClick={onClose}>×</button>
        </div>
        <div style={{display:'flex',gap:2,marginBottom:10,background:'var(--bg2)',padding:3,borderRadius:6}}>
          <button className={`tab${tipoReporte==='cliente'?' on':''}`} style={{flex:1}} onClick={()=>setTipoReporte('cliente')}>👤 Para el cliente</button>
          <button className={`tab${tipoReporte==='interno'?' on':''}`} style={{flex:1}} onClick={()=>setTipoReporte('interno')}>🔧 Reporte interno</button>
        </div>
        {iva && (
          <div style={{marginBottom:10}}>
            <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--t2)',cursor:'pointer'}}>
              <input type="checkbox" checked={sinIva} onChange={e=>setSinIva(e.target.checked)} style={{accentColor:'var(--acc)'}}/>
              Generar sin IVA
            </label>
          </div>
        )}
        <div ref={previewRef} style={{background:'#fff',borderRadius:6,maxHeight:400,overflowY:'auto',marginBottom:14,border:'1px solid #e5e7eb'}}
          dangerouslySetInnerHTML={{__html:htmlContent}}/>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',flexWrap:'wrap'}}>
          <button className="btn btn-sec" onClick={onClose}>Cerrar</button>
          <button className="btn btn-green" onClick={whatsapp}>💬 WhatsApp</button>
          <button className="btn btn-sec" onClick={imprimir}>🖨 Imprimir</button>
          <button className="btn btn-blue" onClick={descargar}>⬇ Descargar PDF</button>
        </div>
      </div>
    </div>
  )
}
