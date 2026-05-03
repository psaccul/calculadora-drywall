'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PRECIOS_DEF } from '@/lib/catalogo'

const SECCIONES = [
  {t:'Placas de yeso (Drywall)',items:[
    {k:'p_yeso_std12',l:'Estándar 12,5mm'},{k:'p_yeso_std15',l:'Estándar 15mm'},
    {k:'p_yeso_hr12',l:'Humedad 12,5mm'},{k:'p_yeso_hr15',l:'Humedad 15mm'},
    {k:'p_yeso_rf12_240',l:'Fuego 12,5mm 2,40'},{k:'p_yeso_rf12_260',l:'Fuego 12,5mm 2,60'},
    {k:'p_yeso_rf15_240',l:'Fuego 15mm 2,40'},{k:'p_yeso_rf15_260',l:'Fuego 15mm 2,60'},
    {k:'p_yeso_4d12',l:'4D 12,5mm'},{k:'p_yeso_4d15',l:'4D 15mm'},
    {k:'p_ciel_7',l:'Cielorraso 7mm'},
  ]},
  {t:'Placas OSB (Woodframe)',items:[
    {k:'p_osb_95',l:'OSB 9,5mm'},{k:'p_osb_111',l:'OSB 11,1mm'},
    {k:'p_osb_151',l:'OSB 15,1mm'},{k:'p_osb_183',l:'OSB 18,3mm'},
  ]},
  {t:'Placas cementicias',items:[
    {k:'p_cem_8',l:'Cementicioso 8mm'},{k:'p_cem_10',l:'Cementicioso 10mm'},
  ]},
  {t:'Perfiles metálicos',items:[
    {k:'m_34',l:'Montante 34mm'},{k:'m_69',l:'Montante 69mm'},{k:'m_99',l:'Montante 99mm'},
    {k:'s_35',l:'Solera 35mm'},{k:'s_70',l:'Solera 70mm'},{k:'s_100',l:'Solera 100mm'},
    {k:'omega_m',l:'Omega (m)'},{k:'cantonera_m',l:'Cantonera (m)'},
    {k:'angulo_aj_m',l:'Ángulo ajuste (m)'},{k:'bunia_z_m',l:'Buña Z (m)'},
  ]},
  {t:'Madera estructural (Woodframe)',items:[
    {k:'wf_2x4',l:'Pie derecho 2×4"'},{k:'wf_2x6',l:'Pie derecho 2×6"'},
    {k:'wf_s2x4',l:'Durmiente 2×4"'},{k:'wf_s2x6',l:'Durmiente 2×6"'},
  ]},
  {t:'Tornillos metálicos',items:[
    {k:'t1_x100',l:'T1 (precio x100)'},{k:'t2_x100',l:'T2 (precio x100)'},
  ]},
  {t:'Tornillos para madera (por unidad)',items:[
    {k:'torn_mad_50',l:'50mm (2")'},{k:'torn_mad_65',l:'65mm (2½")'},
    {k:'torn_mad_75',l:'75mm (3")'},{k:'torn_mad_90',l:'90mm (3½")'},
  ]},
  {t:'Clavos (por kg)',items:[
    {k:'clavos_50',l:'Clavo 50mm'},{k:'clavos_75',l:'Clavo 75mm'},
    {k:'clavos_90',l:'Clavo 90mm'},{k:'clavos_100',l:'Clavo 100mm'},
  ]},
  {t:'Terminación y extras',items:[
    {k:'masilla_kg',l:'Masilla (kg)'},{k:'cinta_papel_m',l:'Cinta papel (m)'},
    {k:'cinta_malla_m',l:'Cinta malla (m)'},{k:'barrera_vapor_m2',l:'Barrera vapor (m²)'},
    {k:'aislacion_m2',l:'Aislación (m²)'},{k:'burlete_ml',l:'Burlete (ml)'},
  ]},
  {t:'Mano de obra',items:[{k:'mano_obra_m2',l:'M.O. por m² (ref.)'}]},
]

export default function PagPrecios({ msg }: { msg:(m:string,t?:string)=>void }) {
  const [precios, setPrecios] = useState<Record<string,number>>(PRECIOS_DEF)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('precios').select('*').then(({data}) => {
      if (data?.length) {
        const m = {...PRECIOS_DEF}
        data.forEach(r => { m[r.clave] = r.valor })
        setPrecios(m)
      }
      setLoading(false)
    })
  }, [])

  const upd = (k: string, v: string) => setPrecios(p => ({...p, [k]: parseFloat(v)||0}))

  const guardar = async () => {
    const upserts = Object.entries(precios).map(([clave, valor]) => ({
      clave, valor, updated_at: new Date().toISOString()
    }))
    const { error } = await supabase.from('precios').upsert(upserts, { onConflict: 'clave' })
    if (error) { msg('Error al guardar','err'); return }
    msg('Precios guardados ✓')
  }

  const restaurar = () => { setPrecios(PRECIOS_DEF); msg('Restaurados a valores por defecto') }

  if (loading) return <div className="empty"><div className="eic">⏳</div></div>

  return (
    <div>
      {SECCIONES.map(sec => (
        <div className="card" key={sec.t}>
          <div className="card-title">💰 {sec.t}</div>
          <div className="grid3">
            {sec.items.map(it => (
              <div className="fg" key={it.k}>
                <label>{it.l}</label>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{color:'var(--t3)',fontSize:12}}>$</span>
                  <input type="number" value={precios[it.k]||''} onChange={e=>upd(it.k,e.target.value)}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginBottom:24}}>
        <button className="btn btn-sec" onClick={restaurar}>Restaurar defaults</button>
        <button className="btn btn-acc" onClick={guardar}>Guardar precios</button>
      </div>
    </div>
  )
}
