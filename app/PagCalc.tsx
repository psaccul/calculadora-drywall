'use client'
import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { calcAmb, defaultsParaTipo, fmt, nid } from '@/lib/calc'
import { PLACAS_YESO, PLACAS_OSB, PLACAS_CEM, MONTANTES, SOLERAS, TORN_MAD_OPCIONES, CLAVOS_OPCIONES, TIPO_LABELS, TIPO_COLOR, PRECIOS_DEF } from '@/lib/catalogo'
import type { Ambiente, Cliente, Cotizador, Sesion } from '@/types'
import ModalPDF from './ModalPDF'

const AP_DEFAULTS: Record<string,{ancho:string;alto:string}> = {
  puerta:{ancho:'0.90',alto:'2.10'}, ventana:{ancho:'1.20',alto:'1.00'}, vano:{ancho:'0.80',alto:'2.10'}
}
const AP_LABELS: Record<string,string> = { puerta:'🚪 Puerta', ventana:'🪟 Ventana', vano:'⬜ Vano' }
const TIPO_BADGE: Record<string,string> = { drywall:'tbadge-dw', woodframe:'tbadge-wf', cementicioso:'tbadge-ce' }

function newAmb(nombre = 'Ambiente'): Ambiente {
  return { id: nid(), nombre, tipo_const:'drywall', tipo_sup:'pared',
    ancho:'', alto:'', largo:'', caras:'1', aperturas:[],
    ...defaultsParaTipo('drywall') } as Ambiente
}

export default function PagCalc({ msg, sesion, onSaved }: { msg:(m:string,t?:string)=>void; sesion:Sesion; onSaved:()=>void }) {
  const [step, setStep] = useState('datos')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cotiz, setCotiz] = useState<Cotizador>({nombre:'',empresa:'',tel:'',mail:'',web:'',cuit:'',dir:'',logo:''})
  const [precios, setPrecios] = useState<Record<string,number>>(PRECIOS_DEF)
  const [cliId, setCliId] = useState('')
  const [ambs, setAmbs] = useState<Ambiente[]>([newAmb('Sala principal')])
  const [moTipo, setMoTipo] = useState('m2')
  const [moVal, setMoVal] = useState('')
  const [adics, setAdics] = useState<{concepto:string;val:string}[]>([])
  const [descuento, setDescuento] = useState('')
  const [imp, setImp] = useState('')
  const [iva, setIva] = useState(false)
  const [nro, setNro] = useState(1)
  const [errores, setErrores] = useState<Record<string,any>>({})
  const [pdfData, setPdfData] = useState<any>(null)

  useEffect(() => {
    supabase.from('clientes').select('*').order('nombre').then(({data}) => { if(data) setClientes(data) })
    supabase.from('cotizador').select('*').limit(1).then(({data}) => { if(data?.[0]) setCotiz(data[0]) })
    supabase.from('precios').select('*').then(({data}) => {
      if(data?.length) {
        const m: Record<string,number> = {...PRECIOS_DEF}
        data.forEach(r => { m[r.clave] = r.valor })
        setPrecios(m)
      }
    })
    supabase.from('presupuestos').select('numero').order('numero',{ascending:false}).limit(1).then(({data}) => {
      if(data?.[0]) setNro(data[0].numero + 1)
    })
  }, [])

  const res = useMemo(() => ambs.map(a => calcAmb(a, precios)), [ambs, precios])
  const totM2 = res.reduce((s,r) => s + r.m2N, 0)
  const totMat = res.reduce((s,r) => s + r.costo, 0)
  const mo = (() => { const v=parseFloat(moVal)||0; if(moTipo==='m2') return v*totM2; if(moTipo==='pct') return totMat*v/100; return v })()
  const sumAdic = adics.reduce((s,a) => s+(parseFloat(a.val)||0), 0)
  const subTot = totMat + mo + sumAdic
  const dVal = descuento ? subTot*(parseFloat(descuento)/100) : 0
  const base = subTot - dVal
  const iVal = imp ? base*(parseFloat(imp)/100) : 0
  const ivaVal = iva ? base*0.21 : 0
  const total = base + iVal + ivaVal

  const buildData = () => ({
    nro, numero:nro,
    fecha: new Date().toLocaleDateString('es-AR'),
    cliente_id: cliId||null,
    cliente_snapshot: clientes.find(c=>c.id===cliId)||null,
    ambientes: ambs, resultados: res,
    precios_snapshot: precios,
    mo_tipo:moTipo, mo_valor:moVal, mo,
    adicionales:adics, descuento, impuesto:imp, iva,
    tot_m2:+totM2.toFixed(2), tot_mat:+totMat.toFixed(2),
    sub_tot:+subTot.toFixed(2), d_val:+dVal.toFixed(2),
    i_val:+iVal.toFixed(2), iva_val:+ivaVal.toFixed(2), total:+total.toFixed(2),
  })

  const guardar = async () => {
    const d = buildData()
    const { error } = await supabase.from('presupuestos').insert([{
      numero: d.numero, fecha: d.fecha,
      cliente_id: d.cliente_id, cliente_snapshot: d.cliente_snapshot,
      ambientes: d.ambientes, resultados: d.resultados,
      precios_snapshot: d.precios_snapshot,
      mo_tipo: d.mo_tipo, mo_valor: d.mo_valor, mo: d.mo,
      adicionales: d.adicionales, descuento: d.descuento,
      impuesto: d.impuesto, iva: d.iva,
      tot_m2: d.tot_m2, tot_mat: d.tot_mat, sub_tot: d.sub_tot,
      d_val: d.d_val, i_val: d.i_val, iva_val: d.iva_val, total: d.total,
    }])
    if (error) { msg('Error al guardar: ' + error.message, 'err'); return }
    msg('Presupuesto #'+d.nro+' guardado ✓')
    onSaved()
    setNro(n => n+1)
  }

  const irAResultado = () => {
    const errs: Record<string,any> = {}
    ambs.forEach(a => {
      const e: Record<string,string> = {}
      if (!parseFloat(a.ancho)) e.ancho='Requerido'
      if (!parseFloat(a.largo)) e.largo='Requerido'
      if (a.tipo_sup==='pared' && !parseFloat(a.alto)) e.alto='Requerido'
      if (Object.keys(e).length) errs[a.id] = e
    })
    if (Object.keys(errs).length) { setErrores(errs); msg('Completá las dimensiones de todos los ambientes','err'); setStep('ambientes'); return }
    setErrores({})
    setStep('resultado')
  }

  const updA = (id:string,k:string,v:any) => setAmbs(p=>p.map(a=>a.id===id?{...a,[k]:v}:a))
  const updO = (id:string,k:string,v:boolean) => setAmbs(p=>p.map(a=>a.id===id?{...a,opts:{...a.opts,[k]:v}}:a))
  const cambiarTipo = (id:string,tipo:string) => setAmbs(p=>p.map((a:Ambiente)=>a.id===id?{...a,tipo_const:tipo as any,...defaultsParaTipo(tipo)}:a))
  const copyA = (id:string) => setAmbs(p=>{const a=p.find(x=>x.id===id)!;return[...p,{...JSON.parse(JSON.stringify(a)),id:nid(),nombre:a.nombre+' (copia)'}]})
  const delA = (id:string) => setAmbs(p=>p.filter(a=>a.id!==id))

  return (
    <div>
      <div className="tabs">
        <button className={`tab${step==='datos'?' on':''}`} onClick={()=>setStep('datos')}>1. Proyecto</button>
        <button className={`tab${step==='ambientes'?' on':''}`} onClick={()=>setStep('ambientes')}>2. Ambientes ({ambs.length})</button>
        <button className={`tab${step==='resultado'?' on':''}`} onClick={irAResultado}>3. Resultado</button>
      </div>

      {step==='datos' && (
        <div>
          <div className="card">
            <div className="card-title">📋 Datos del presupuesto</div>
            <div className="grid3" style={{marginBottom:10}}>
              <div className="fg"><label>N° Presupuesto</label><input type="number" value={nro} onChange={e=>setNro(+e.target.value)}/></div>
              <div className="fg"><label>Cliente</label>
                <select value={cliId} onChange={e=>setCliId(e.target.value)}>
                  <option value="">Sin cliente</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}{c.empresa?' — '+c.empresa:''}</option>)}
                </select>
              </div>
              <div className="fg"><label>Fecha</label><input readOnly value={new Date().toLocaleDateString('es-AR')}/></div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">👷 Mano de obra</div>
            <div className="grid3">
              <div className="fg"><label>Tipo</label>
                <select value={moTipo} onChange={e=>setMoTipo(e.target.value)}>
                  <option value="m2">Por m²</option>
                  <option value="pct">% sobre materiales</option>
                  <option value="fijo">Monto fijo $</option>
                </select>
              </div>
              <div className="fg"><label>{moTipo==='m2'?'Precio $/m²':moTipo==='pct'?'Porcentaje %':'Monto fijo $'}</label>
                <input type="number" value={moVal} onChange={e=>setMoVal(e.target.value)}/>
              </div>
              <div className="fg"><label>Subtotal M.O.</label><input readOnly value={mo?fmt(mo):'—'}/></div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">➕ Adicionales, descuento e impuestos</div>
            {adics.map((a,i)=>(
              <div key={i} style={{display:'flex',gap:8,marginBottom:6,alignItems:'flex-end'}}>
                <div className="fg" style={{flex:2}}><label>Concepto</label>
                  <input value={a.concepto} onChange={e=>setAdics(p=>{const n=[...p];n[i]={...n[i],concepto:e.target.value};return n})}/>
                </div>
                <div className="fg" style={{flex:1}}><label>Valor $</label>
                  <input type="number" value={a.val} onChange={e=>setAdics(p=>{const n=[...p];n[i]={...n[i],val:e.target.value};return n})}/>
                </div>
                <button className="btn btn-danger btn-sm" onClick={()=>setAdics(p=>p.filter((_,j)=>j!==i))}>✕</button>
              </div>
            ))}
            <button className="btn btn-sec btn-sm" style={{marginBottom:12}} onClick={()=>setAdics(p=>[...p,{concepto:'',val:''}])}>+ Adicional</button>
            <div className="grid3">
              <div className="fg"><label>Descuento %</label><input type="number" value={descuento} onChange={e=>setDescuento(e.target.value)} placeholder="0"/></div>
              <div className="fg"><label>Impuesto extra %</label><input type="number" value={imp} onChange={e=>setImp(e.target.value)} placeholder="0"/></div>
              <div className="fg"><label>IVA</label>
                <select value={iva?'si':'no'} onChange={e=>setIva(e.target.value==='si')}>
                  <option value="no">Sin IVA</option><option value="si">+ IVA 21%</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {step==='ambientes' && (
        <div>
          {ambs.map((a,i)=>(
            <AmbCard key={a.id} a={a} i={i} r={res[i]} errores={errores[a.id]||{}}
              onU={(k:string,v:any)=>updA(a.id,k,v)} onO={(k:string,v:boolean)=>updO(a.id,k,v)}
              onD={()=>delA(a.id)} onC={()=>copyA(a.id)}
              onTipo={(t:string)=>cambiarTipo(a.id,t)} canD={ambs.length>1}/>
          ))}
          <button className="btn btn-sec" style={{width:'100%',marginTop:4}} onClick={()=>setAmbs(p=>[...p,newAmb()])}>+ Agregar ambiente</button>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
            <button className="btn btn-acc" onClick={irAResultado}>Ver resultado →</button>
          </div>
        </div>
      )}

      {step==='resultado' && (
        <div>
          <div className="sum-grid">
            <div className="sum-c"><div className="sum-v">{totM2.toFixed(1)}</div><div className="sum-l">m² totales</div></div>
            <div className="sum-c"><div className="sum-v">{fmt(totMat)}</div><div className="sum-l">Materiales</div></div>
            <div className="sum-c"><div className="sum-v">{fmt(mo)}</div><div className="sum-l">Mano de obra</div></div>
            <div className="sum-c"><div className="sum-v" style={{color:'var(--green)'}}>{fmt(total)}</div><div className="sum-l">Total final</div></div>
          </div>
          {ambs.map((a,i)=><ResAmb key={a.id} a={a} r={res[i]} pr={precios}/>)}
          <div className="card">
            <div className="card-title">💰 Resumen económico</div>
            <table><tbody>
              <tr><td>Materiales</td><td className="td-s">{fmt(totMat)}</td></tr>
              <tr><td>Mano de obra</td><td className="td-s">{fmt(mo)}</td></tr>
              {adics.filter(a=>a.concepto).map((a,i)=><tr key={i}><td>{a.concepto}</td><td>{fmt(parseFloat(a.val)||0)}</td></tr>)}
              <tr><td style={{fontWeight:700}}>Subtotal</td><td className="td-s">{fmt(subTot)}</td></tr>
              {descuento&&<tr><td style={{color:'var(--red)'}}>Descuento {descuento}%</td><td style={{color:'var(--red)'}}>−{fmt(dVal)}</td></tr>}
              {imp&&<tr><td>Impuesto {imp}%</td><td>{fmt(iVal)}</td></tr>}
              {iva&&<tr><td>IVA 21%</td><td>{fmt(ivaVal)}</td></tr>}
              <tr><td style={{fontSize:14,fontWeight:800,color:'var(--t1)'}}>TOTAL</td><td style={{fontSize:16,fontWeight:800,color:'var(--green)'}}>{fmt(total)}</td></tr>
            </tbody></table>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-sec" onClick={guardar}>💾 Guardar</button>
            <button className="btn btn-blue" onClick={()=>setPdfData(buildData())}>📄 PDF</button>
          </div>
        </div>
      )}
      {pdfData && <ModalPDF data={pdfData} onClose={()=>setPdfData(null)} msg={msg}/>}
    </div>
  )
}

function AmbCard({a,i,r,errores,onU,onO,onD,onC,onTipo,canD}:any) {
  const [open,setOpen]=useState(true)
  const tc=a.tipo_const
  const isWF=tc==='woodframe'
  const montsDisp=MONTANTES.filter(m=>m.tipos.includes(tc))
  const solsDisp=SOLERAS.filter(s=>s.tipos.includes(tc))
  const optsMetalicos=[{k:'omega',l:'Omega'},{k:'cantonera',l:'Cantonera'},{k:'angulo_aj',l:'Ángulo ajuste'},{k:'bunia_z',l:'Buña Z'}]
  const optsTerminacion=[{k:'masilla',l:'Masilla'},{k:'cinta_papel',l:'Cinta papel'},{k:'cinta_malla',l:'Cinta malla'},{k:'barrera_vapor',l:'Barrera vapor'},{k:'aislacion',l:'Aislación acústica'},{k:'burletes',l:'Burletes'}]

  return(
    <div className={`amb ${tc}`}>
      <div className="amb-hdr">
        <span style={{color:'var(--t3)',fontSize:11,fontWeight:700,minWidth:22}}>#{i+1}</span>
        <input value={a.nombre} onChange={e=>onU('nombre',e.target.value)} placeholder="Nombre"/>
        <span className={`tbadge ${TIPO_BADGE[tc]}`}>{TIPO_LABELS[tc]}</span>
        <span style={{fontSize:10,color:'var(--acc)',fontWeight:700,whiteSpace:'nowrap'}}>{r?.m2N||0} m²</span>
        <button className="btn btn-sec btn-sm" onClick={()=>setOpen((o:boolean)=>!o)}>{open?'▲':'▼'}</button>
        <button className="btn btn-sec btn-sm" onClick={onC}>⧉</button>
        {canD&&<button className="btn btn-danger btn-sm" onClick={onD}>✕</button>}
      </div>
      {open&&(
        <div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.6px',marginBottom:6}}>Tipo de construcción</div>
            <div className="tipo-pills">
              {['drywall','woodframe','cementicioso'].map(t=>(
                <button key={t} className={`tipo-pill ${t}${tc===t?' on':''}`} onClick={()=>onTipo(t)}>
                  {t==='drywall'?'🧱 Drywall':t==='woodframe'?'🪵 Woodframe':'🏗 Cementicias'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid3" style={{marginBottom:10}}>
            <div className="fg"><label>Superficie</label>
              <select value={a.tipo_sup} onChange={e=>onU('tipo_sup',e.target.value)}>
                <option value="pared">Paredes</option><option value="cielorraso">Cielorraso</option>
              </select>
            </div>
            <div className="fg"><label>Ancho (m)</label>
              <input type="number" step=".1" value={a.ancho} onChange={e=>onU('ancho',e.target.value)} className={errores.ancho?'err':''}/>
              {errores.ancho&&<span className="err-msg">{errores.ancho}</span>}
            </div>
            <div className="fg"><label>Largo (m)</label>
              <input type="number" step=".1" value={a.largo} onChange={e=>onU('largo',e.target.value)} className={errores.largo?'err':''}/>
              {errores.largo&&<span className="err-msg">{errores.largo}</span>}
            </div>
            {a.tipo_sup==='pared'&&<>
              <div className="fg"><label>Alto (m)</label>
                <input type="number" step=".1" value={a.alto} onChange={e=>onU('alto',e.target.value)} className={errores.alto?'err':''}/>
                {errores.alto&&<span className="err-msg">{errores.alto}</span>}
              </div>
            </>}
          </div>
          {a.tipo_sup==='pared'&&<AperturasEditor aperturas={a.aperturas||[]} onChange={(v:any)=>onU('aperturas',v)}/>}
          <div className="grid4" style={{marginBottom:10}}>
            <div className="fg"><label>Placa</label>
              <select value={a.placa_id} onChange={e=>onU('placa_id',e.target.value)}>
                {tc==='drywall'&&<>
                  <optgroup label="Estándar">{PLACAS_YESO.filter(p=>p.id.startsWith('std')).map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
                  <optgroup label="Resistente humedad">{PLACAS_YESO.filter(p=>p.id.startsWith('hr')).map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
                  <optgroup label="Resistente fuego">{PLACAS_YESO.filter(p=>p.id.startsWith('rf')).map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
                  <optgroup label="4D">{PLACAS_YESO.filter(p=>p.id.startsWith('4d')).map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
                  <optgroup label="Cielorraso">{PLACAS_YESO.filter(p=>p.id.startsWith('ciel')).map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
                </>}
                {tc==='woodframe'&&<>
                  <optgroup label="OSB">{PLACAS_OSB.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
                  <optgroup label="Cementicioso">{PLACAS_CEM.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
                </>}
                {tc==='cementicioso'&&PLACAS_CEM.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div className="fg"><label>{isWF?'Pie derecho':'Montante'}</label>
              <select value={a.mont_id} onChange={e=>onU('mont_id',e.target.value)}>
                {montsDisp.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div className="fg"><label>{isWF?'Durmiente':'Solera'}</label>
              <select value={a.sol_id} onChange={e=>onU('sol_id',e.target.value)}>
                {solsDisp.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="fg"><label>Sep. estructura</label>
              <select value={a.sep} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>onU('sep',e.target.value)}>
                <option value="0.40">40 cm</option><option value="0.60">60 cm</option>
              </select>
            </div>
          </div>
          <div style={{maxWidth:200,marginBottom:10}}>
            <div className="fg"><label>Caras a revestir</label>
              <select value={a.caras} onChange={e=>onU('caras',e.target.value)}>
                <option value="1">1 cara</option><option value="2">2 caras</option>
              </select>
            </div>
          </div>
          <div className="sec-sep">Tornillos y fijaciones</div>
          <div className="chklist" style={{marginBottom:6}}>
            <label className={`chk-item${a.opts.t1?' on':''}`}><input type="checkbox" checked={!!a.opts.t1} onChange={e=>onO('t1',e.target.checked)}/>T1 (x100){isWF&&<span style={{fontSize:9,color:'var(--t3)'}}> mixto</span>}</label>
            <label className={`chk-item${a.opts.t2?' on':''}`}><input type="checkbox" checked={!!a.opts.t2} onChange={e=>onO('t2',e.target.checked)}/>T2 (x100){isWF&&<span style={{fontSize:9,color:'var(--t3)'}}> mixto</span>}</label>
            <label className={`chk-item${isWF?' wf-item':''}${a.opts.torn_mad?' on':''}`}><input type="checkbox" checked={!!a.opts.torn_mad} onChange={e=>onO('torn_mad',e.target.checked)}/>Torn. madera{isWF&&<span style={{fontSize:9,color:'#a855f7'}}> ★</span>}</label>
            <label className={`chk-item${isWF?' wf-item':''}${a.opts.clavos?' on':''}`}><input type="checkbox" checked={!!a.opts.clavos} onChange={e=>onO('clavos',e.target.checked)}/>Clavos{isWF&&<span style={{fontSize:9,color:'#a855f7'}}> ★</span>}</label>
          </div>
          {(a.opts.torn_mad||a.opts.clavos)&&(
            <div className="grid2" style={{marginBottom:8}}>
              {a.opts.torn_mad&&<div className="fg"><label>Medida torn. madera</label>
                <select value={a.torn_mad_id} onChange={e=>onU('torn_mad_id',e.target.value)}>
                  {TORN_MAD_OPCIONES.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>}
              {a.opts.clavos&&<div className="fg"><label>Tipo de clavo</label>
                <select value={a.clavos_id} onChange={e=>onU('clavos_id',e.target.value)}>
                  {CLAVOS_OPCIONES.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>}
            </div>
          )}
          {isWF&&<div className="hint">🪵 Woodframe: torn. madera y clavos activos por defecto. T1/T2 disponibles para estructura mixta.</div>}
          {!isWF&&<>
            <div className="sec-sep">Perfiles adicionales</div>
            <div className="chklist" style={{marginBottom:8}}>
              {optsMetalicos.map(o=>(
                <label key={o.k} className={`chk-item${a.opts[o.k]?' on':''}`}>
                  <input type="checkbox" checked={!!a.opts[o.k]} onChange={e=>onO(o.k,e.target.checked)}/>{o.l}
                </label>
              ))}
            </div>
          </>}
          <div className="sec-sep">Terminación y extras</div>
          <div className="chklist">
            {optsTerminacion.map(o=>(
              <label key={o.k} className={`chk-item${a.opts[o.k]?' on':''}`}>
                <input type="checkbox" checked={!!a.opts[o.k]} onChange={e=>onO(o.k,e.target.checked)}/>{o.l}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AperturasEditor({aperturas,onChange}:any){
  const add=(tipo:string)=>onChange([...aperturas,{id:nid(),tipo,cant:'1',...AP_DEFAULTS[tipo]}])
  const upd=(id:string,k:string,v:string)=>onChange(aperturas.map((a:any)=>a.id===id?{...a,[k]:v}:a))
  const del=(id:string)=>onChange(aperturas.filter((a:any)=>a.id!==id))
  const totalDesc=aperturas.reduce((s:number,a:any)=>s+(parseInt(a.cant)||1)*(parseFloat(a.ancho)||0)*(parseFloat(a.alto)||0),0)
  return(
    <div style={{marginBottom:10}}>
      <div className="sec-sep" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6}}>
        <span>Aperturas{aperturas.length>0&&<span style={{color:'var(--acc)',marginLeft:6}}>−{totalDesc.toFixed(2)} m²</span>}</span>
        <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
          {['puerta','ventana','vano'].map(t=><button key={t} className="btn btn-sec btn-sm" onClick={()=>add(t)}>+ {AP_LABELS[t]}</button>)}
        </div>
      </div>
      {aperturas.length===0&&<div style={{fontSize:11,color:'var(--t3)',padding:'6px 0'}}>Sin aperturas</div>}
      {aperturas.map((ap:any)=>(
        <div key={ap.id} style={{background:'var(--bg2)',padding:'10px 12px',borderRadius:6,border:'1px solid var(--border)',marginBottom:6}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr auto',gap:8,alignItems:'flex-end'}}>
            <div className="fg"><label>Tipo</label>
              <select value={ap.tipo} onChange={e=>upd(ap.id,'tipo',e.target.value)}>
                <option value="puerta">Puerta</option><option value="ventana">Ventana</option><option value="vano">Vano</option>
              </select>
            </div>
            <div className="fg"><label>Cantidad</label><input type="number" min="1" value={ap.cant} onChange={e=>upd(ap.id,'cant',e.target.value)}/></div>
            <div className="fg"><label>Ancho (m)</label><input type="number" step=".01" value={ap.ancho} onChange={e=>upd(ap.id,'ancho',e.target.value)}/></div>
            <div className="fg"><label>Alto (m)</label><input type="number" step=".01" value={ap.alto} onChange={e=>upd(ap.id,'alto',e.target.value)}/></div>
            <button className="btn btn-danger btn-sm" style={{alignSelf:'flex-end',marginBottom:1}} onClick={()=>del(ap.id)}>✕</button>
          </div>
          <div style={{fontSize:10,color:'var(--t3)',marginTop:5}}>
            {ap.cant||1} × {ap.ancho||0}m × {ap.alto||0}m = <strong style={{color:'var(--acc)'}}>{((parseInt(ap.cant)||1)*(parseFloat(ap.ancho)||0)*(parseFloat(ap.alto)||0)).toFixed(2)} m²</strong>
          </div>
        </div>
      ))}
    </div>
  )
}

function ResAmb({a,r,pr}:any){
  const rows=[
    {l:r.placa?.label||'Placa',       c:r.placas,  u:'placas', p:pr[r.placa?.pk]||0, t:r.placas*(pr[r.placa?.pk]||0)},
    {l:r.mont?.label||'Estructura',   c:r.monts,   u:'barras', p:pr[r.mont?.pk]||0,  t:r.monts*(pr[r.mont?.pk]||0)},
    {l:r.sol?.label||'Solera',        c:r.sols,    u:'barras', p:pr[r.sol?.pk]||0,   t:r.sols*(pr[r.sol?.pk]||0)},
    r.t1>0&&{l:'Tornillos T1',        c:r.t1,      u:'ud',     p:(pr.t1_x100||0)/100,t:(r.t1/100)*(pr.t1_x100||0)},
    r.t2>0&&{l:'Tornillos T2',        c:r.t2,      u:'ud',     p:(pr.t2_x100||0)/100,t:(r.t2/100)*(pr.t2_x100||0)},
    r.torn_mad>0&&{l:`Torn. madera ${r.tmo?.label||''}`,c:r.torn_mad,u:'ud',p:pr[r.tmo?.pk]||0,t:r.torn_mad*(pr[r.tmo?.pk]||0)},
    r.clavos>0&&{l:r.clo?.label||'Clavos',c:r.clavos,u:'kg',  p:pr[r.clo?.pk]||0,   t:r.clavos*(pr[r.clo?.pk]||0)},
    r.masilla>0&&{l:'Masilla',         c:r.masilla,u:'kg',     p:pr.masilla_kg||0,   t:r.masilla*(pr.masilla_kg||0)},
    r.cp>0&&{l:'Cinta de papel',       c:r.cp,     u:'m',      p:pr.cinta_papel_m||0,t:r.cp*(pr.cinta_papel_m||0)},
    r.cm>0&&{l:'Cinta malla',          c:r.cm,     u:'m',      p:pr.cinta_malla_m||0,t:r.cm*(pr.cinta_malla_m||0)},
    r.bv>0&&{l:'Barrera vapor',        c:r.bv,     u:'m²',     p:pr.barrera_vapor_m2||0,t:r.bv*(pr.barrera_vapor_m2||0)},
    r.ais>0&&{l:'Aislación acústica',  c:r.ais,    u:'m²',     p:pr.aislacion_m2||0, t:r.ais*(pr.aislacion_m2||0)},
    r.burl>0&&{l:'Burletes',           c:r.burl,   u:'ml',     p:pr.burlete_ml||0,   t:r.burl*(pr.burlete_ml||0)},
    r.omega>0&&{l:'Omega',             c:r.omega,  u:'ml',     p:pr.omega_m||0,      t:r.omega*(pr.omega_m||0)},
    r.cant>0&&{l:'Cantonera',          c:r.cant,   u:'ml',     p:pr.cantonera_m||0,  t:r.cant*(pr.cantonera_m||0)},
    r.ang>0&&{l:'Ángulo de ajuste',    c:r.ang,    u:'ml',     p:pr.angulo_aj_m||0,  t:r.ang*(pr.angulo_aj_m||0)},
    r.bunia>0&&{l:'Buña Z',            c:r.bunia,  u:'ml',     p:pr.bunia_z_m||0,    t:r.bunia*(pr.bunia_z_m||0)},
  ].filter(Boolean) as any[]
  const tc=a.tipo_const
  return(
    <div className="card" style={{marginBottom:10}}>
      <div className="card-title">
        📦 {a.nombre}
        <span className={`tbadge ${TIPO_BADGE[tc]}`}>{TIPO_LABELS[tc]}</span>
        <span style={{color:'var(--t2)',fontWeight:400}}>— {r.m2N} m² netos</span>
        <span style={{marginLeft:'auto',fontWeight:800,color:'var(--acc)',fontSize:12}}>{fmt(r.costo)}</span>
      </div>
      <table><thead><tr><th>Material</th><th>Cantidad</th><th>P. unitario</th><th>Subtotal</th></tr></thead>
      <tbody>{rows.map((row:any,i:number)=>(
        <tr key={i}><td>{row.l}</td><td className="td-s">{row.c} {row.u}</td><td>{fmt(row.p)}</td><td className="td-s">{fmt(row.t)}</td></tr>
      ))}</tbody></table>
    </div>
  )
}
