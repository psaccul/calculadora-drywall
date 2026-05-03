export const PLACAS_YESO = [
  {id:'std_12',  label:'Estándar 12,5mm — 1,20×2,40', w:1.20,h:2.40, pk:'p_yeso_std12', tipos:['drywall']},
  {id:'std_15',  label:'Estándar 15mm — 1,20×2,40',   w:1.20,h:2.40, pk:'p_yeso_std15', tipos:['drywall']},
  {id:'hr_12',   label:'Humedad 12,5mm — 1,20×2,40',  w:1.20,h:2.40, pk:'p_yeso_hr12',  tipos:['drywall']},
  {id:'hr_15',   label:'Humedad 15mm — 1,20×2,40',    w:1.20,h:2.40, pk:'p_yeso_hr15',  tipos:['drywall']},
  {id:'rf_12_240',label:'Fuego 12,5mm — 1,20×2,40',  w:1.20,h:2.40, pk:'p_yeso_rf12_240', tipos:['drywall']},
  {id:'rf_12_260',label:'Fuego 12,5mm — 1,20×2,60',  w:1.20,h:2.60, pk:'p_yeso_rf12_260', tipos:['drywall']},
  {id:'rf_15_240',label:'Fuego 15mm — 1,20×2,40',    w:1.20,h:2.40, pk:'p_yeso_rf15_240', tipos:['drywall']},
  {id:'rf_15_260',label:'Fuego 15mm — 1,20×2,60',    w:1.20,h:2.60, pk:'p_yeso_rf15_260', tipos:['drywall']},
  {id:'4d_12',   label:'4D 12,5mm — 1,20×2,40',      w:1.20,h:2.40, pk:'p_yeso_4d12',  tipos:['drywall']},
  {id:'4d_15',   label:'4D 15mm — 1,20×2,40',        w:1.20,h:2.40, pk:'p_yeso_4d15',  tipos:['drywall']},
  {id:'ciel_7',  label:'Cielorraso 7mm — 1,20×2,40', w:1.20,h:2.40, pk:'p_ciel_7',     tipos:['drywall']},
]

export const PLACAS_OSB = [
  {id:'osb_95', label:'OSB 9,5mm — 1,22×2,44',  w:1.22,h:2.44, pk:'p_osb_95',  tipos:['woodframe']},
  {id:'osb_111',label:'OSB 11,1mm — 1,22×2,44', w:1.22,h:2.44, pk:'p_osb_111', tipos:['woodframe']},
  {id:'osb_151',label:'OSB 15,1mm — 1,22×2,44', w:1.22,h:2.44, pk:'p_osb_151', tipos:['woodframe']},
  {id:'osb_183',label:'OSB 18,3mm — 1,22×2,44', w:1.22,h:2.44, pk:'p_osb_183', tipos:['woodframe']},
]

export const PLACAS_CEM = [
  {id:'cem_8', label:'Cementicioso 8mm — 1,20×2,40',  w:1.20,h:2.40, pk:'p_cem_8',  tipos:['cementicioso','woodframe']},
  {id:'cem_10',label:'Cementicioso 10mm — 1,20×2,40', w:1.20,h:2.40, pk:'p_cem_10', tipos:['cementicioso','woodframe']},
]

export const TODAS_PLACAS = [...PLACAS_YESO, ...PLACAS_OSB, ...PLACAS_CEM]

export const MONTANTES = [
  {id:'m34',   label:'Montante 34×35×30mm',    largo:2.6, pk:'m_34',    tipos:['drywall','cementicioso']},
  {id:'m69',   label:'Montante 69×35×30mm',    largo:2.6, pk:'m_69',    tipos:['drywall','cementicioso']},
  {id:'m99',   label:'Montante 99×35×30mm',    largo:2.6, pk:'m_99',    tipos:['drywall','cementicioso']},
  {id:'wf_2x4',label:'Pie derecho 2×4" (pino)',largo:2.6, pk:'wf_2x4', tipos:['woodframe']},
  {id:'wf_2x6',label:'Pie derecho 2×6" (pino)',largo:2.6, pk:'wf_2x6', tipos:['woodframe']},
]

export const SOLERAS = [
  {id:'s35',    label:'Solera 35×28mm',          largo:2.6, pk:'s_35',    tipos:['drywall','cementicioso']},
  {id:'s70',    label:'Solera 70×28mm',           largo:2.6, pk:'s_70',    tipos:['drywall','cementicioso']},
  {id:'s100',   label:'Solera 100×28mm',          largo:2.6, pk:'s_100',   tipos:['drywall','cementicioso']},
  {id:'wf_s2x4',label:'Durmiente 2×4" (pino)',   largo:2.6, pk:'wf_s2x4', tipos:['woodframe']},
  {id:'wf_s2x6',label:'Durmiente 2×6" (pino)',   largo:2.6, pk:'wf_s2x6', tipos:['woodframe']},
]

export const TORN_MAD_OPCIONES = [
  {id:'tm_50', label:'50mm (2")',   pk:'torn_mad_50'},
  {id:'tm_65', label:'65mm (2½")', pk:'torn_mad_65'},
  {id:'tm_75', label:'75mm (3")',  pk:'torn_mad_75'},
  {id:'tm_90', label:'90mm (3½")', pk:'torn_mad_90'},
]

export const CLAVOS_OPCIONES = [
  {id:'cl_50', label:'Clavo 50mm (2")',   pk:'clavos_50'},
  {id:'cl_75', label:'Clavo 75mm (3")',   pk:'clavos_75'},
  {id:'cl_90', label:'Clavo 90mm (3½")', pk:'clavos_90'},
  {id:'cl_100',label:'Clavo 100mm (4")', pk:'clavos_100'},
]

export const PRECIOS_DEF: Record<string,number> = {
  p_yeso_std12:1200, p_yeso_std15:1350,
  p_yeso_hr12:1600,  p_yeso_hr15:1750,
  p_yeso_rf12_240:1800, p_yeso_rf12_260:1950,
  p_yeso_rf15_240:1900, p_yeso_rf15_260:2050,
  p_yeso_4d12:2200,  p_yeso_4d15:2400, p_ciel_7:980,
  p_osb_95:1400, p_osb_111:1600, p_osb_151:1900, p_osb_183:2200,
  p_cem_8:1800, p_cem_10:2000,
  m_34:320, m_69:380, m_99:440,
  s_35:260, s_70:300, s_100:360,
  wf_2x4:480, wf_2x6:620, wf_s2x4:440, wf_s2x6:580,
  omega_m:180, cantonera_m:95, angulo_aj_m:120, bunia_z_m:210,
  t1_x100:380, t2_x100:420,
  torn_mad_50:42, torn_mad_65:48, torn_mad_75:55, torn_mad_90:62,
  clavos_50:280, clavos_75:300, clavos_90:320, clavos_100:340,
  masilla_kg:280, cinta_papel_m:40, cinta_malla_m:55,
  barrera_vapor_m2:120, aislacion_m2:480, burlete_ml:65,
  mano_obra_m2:900,
}

export const TIPO_LABELS: Record<string,string> = {
  drywall:'Drywall', woodframe:'Woodframe', cementicioso:'Cementicias'
}

export const TIPO_COLOR: Record<string,string> = {
  drywall:'#2563eb', woodframe:'#7c3aed', cementicioso:'#d97706'
}
