import { TODAS_PLACAS, PLACAS_YESO, MONTANTES, SOLERAS, TORN_MAD_OPCIONES, CLAVOS_OPCIONES } from './catalogo'
import type { Ambiente } from '@/types'

export function calcAmb(a: Ambiente, pr: Record<string,number>) {
  const placa = TODAS_PLACAS.find(p => p.id === a.placa_id) || PLACAS_YESO[0]
  const mont  = MONTANTES.find(m => m.id === a.mont_id) || MONTANTES[1]
  const sol   = SOLERAS.find(s => s.id === a.sol_id) || SOLERAS[1]
  const tmo   = TORN_MAD_OPCIONES.find(t => t.id === a.torn_mad_id) || TORN_MAD_OPCIONES[1]
  const clo   = CLAVOS_OPCIONES.find(c => c.id === a.clavos_id) || CLAVOS_OPCIONES[1]
  const sep   = parseFloat(a.sep) || 0.6
  const caras = parseInt(a.caras) || 1
  const aw = parseFloat(a.ancho) || 0
  const al = parseFloat(a.largo) || 0
  const ah = parseFloat(a.alto)  || 0
  const esCiel = a.tipo_sup === 'cielorraso'
  const m2B = esCiel ? aw * al : (aw + al) * 2 * ah
  const desc = (a.aperturas || []).reduce((s, ap) => {
    return s + (parseInt(ap.cant)||1) * (parseFloat(ap.ancho)||0) * (parseFloat(ap.alto)||0)
  }, 0)
  const m2N = Math.max(0, m2B - desc)
  const m2Pl = placa.w * placa.h
  const placas = m2N > 0 ? Math.ceil(m2N * caras / m2Pl * 1.05) : 0
  const perim = (aw + al) * 2
  const lineas = Math.ceil((esCiel ? aw : m2N) / sep)
  const monts = m2N > 0 ? Math.ceil(lineas * (esCiel ? 1 : ah) / mont.largo) + Math.ceil(perim / mont.largo) : 0
  const sols = m2N > 0 ? Math.ceil(perim * 2 / sol.largo) : 0
  const t1 = a.opts.t1 ? Math.ceil(placas * 28 / 100) * 100 : 0
  const t2 = a.opts.t2 ? Math.ceil(placas * 8  / 100) * 100 : 0
  const torn_mad = a.opts.torn_mad ? Math.ceil(m2N * 2) : 0
  const clavos   = a.opts.clavos   ? Math.ceil(m2N * 0.08) : 0
  const masilla  = a.opts.masilla  ? Math.ceil(m2N * caras * 0.6) : 0
  const cp  = a.opts.cinta_papel   ? Math.ceil(m2N * 0.8) : 0
  const cm  = a.opts.cinta_malla   ? Math.ceil(m2N * 0.6) : 0
  const bv  = a.opts.barrera_vapor ? m2N : 0
  const ais = a.opts.aislacion     ? m2N : 0
  const burl  = a.opts.burletes    ? Math.ceil(perim) : 0
  const omega  = a.opts.omega      ? Math.ceil(m2N * 1.2) : 0
  const cant   = a.opts.cantonera  ? Math.ceil(Math.sqrt(m2N) * 4) : 0
  const ang    = a.opts.angulo_aj  ? Math.ceil(m2N * 0.4) : 0
  const bunia  = a.opts.bunia_z    ? Math.ceil(Math.sqrt(m2N) * 2) : 0
  const costo =
    placas * (pr[placa.pk]||0) + monts * (pr[mont.pk]||0) + sols * (pr[sol.pk]||0) +
    (t1/100)*(pr.t1_x100||0) + (t2/100)*(pr.t2_x100||0) +
    torn_mad*(pr[tmo.pk]||0) + clavos*(pr[clo.pk]||0) +
    masilla*(pr.masilla_kg||0) + cp*(pr.cinta_papel_m||0) + cm*(pr.cinta_malla_m||0) +
    bv*(pr.barrera_vapor_m2||0) + ais*(pr.aislacion_m2||0) + burl*(pr.burlete_ml||0) +
    omega*(pr.omega_m||0) + cant*(pr.cantonera_m||0) + ang*(pr.angulo_aj_m||0) + bunia*(pr.bunia_z_m||0)
  return {
    m2B: +m2B.toFixed(2), m2N: +m2N.toFixed(2),
    placas, monts, sols, t1, t2, torn_mad, clavos, masilla, cp, cm,
    bv, ais, burl, omega, cant, ang, bunia,
    costo: +costo.toFixed(2), placa, mont, sol, tmo, clo
  }
}

export function defaultsParaTipo(tipo: string) {
  if (tipo === 'woodframe') return {
    placa_id:'osb_95', mont_id:'wf_2x4', sol_id:'wf_s2x4', sep:'0.40',
    torn_mad_id:'tm_65', clavos_id:'cl_75',
    opts:{t1:false,t2:false,torn_mad:true,clavos:true,masilla:false,cinta_papel:false,
      cinta_malla:false,barrera_vapor:true,aislacion:true,burletes:true,
      omega:false,cantonera:false,angulo_aj:false,bunia_z:false}
  }
  if (tipo === 'cementicioso') return {
    placa_id:'cem_8', mont_id:'m69', sol_id:'s70', sep:'0.60',
    torn_mad_id:'tm_65', clavos_id:'cl_75',
    opts:{t1:true,t2:true,torn_mad:false,clavos:false,masilla:false,cinta_papel:false,
      cinta_malla:true,barrera_vapor:false,aislacion:false,burletes:true,
      omega:false,cantonera:true,angulo_aj:false,bunia_z:false}
  }
  return {
    placa_id:'std_12', mont_id:'m69', sol_id:'s70', sep:'0.60',
    torn_mad_id:'tm_65', clavos_id:'cl_75',
    opts:{t1:true,t2:true,torn_mad:false,clavos:false,masilla:true,cinta_papel:true,
      cinta_malla:false,barrera_vapor:false,aislacion:false,burletes:false,
      omega:false,cantonera:false,angulo_aj:false,bunia_z:false}
  }
}

export const fmt = (n: number) => '$' + Math.round(n || 0).toLocaleString('es-AR')
export const nid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5)
