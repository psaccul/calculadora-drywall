export interface Licencia {
  id: string
  clave: string
  usuario: string
  rol: 'admin' | 'user'
  vencimiento: string | null
  activa: boolean
  email?: string
}

export interface Sesion {
  usuario: string
  rol: 'admin' | 'user'
}

export interface Cliente {
  id: string
  nombre: string
  empresa?: string
  tel?: string
  mail?: string
  dir?: string
  notas?: string
}

export interface Apertura {
  id: string
  tipo: 'puerta' | 'ventana' | 'vano'
  cant: string
  ancho: string
  alto: string
}

export interface Ambiente {
  id: string
  nombre: string
  tipo_const: 'drywall' | 'woodframe' | 'cementicioso'
  tipo_sup: 'pared' | 'cielorraso'
  ancho: string
  alto: string
  largo: string
  caras: string
  aperturas: Apertura[]
  placa_id: string
  mont_id: string
  sol_id: string
  sep: string
  torn_mad_id: string
  clavos_id: string
  opts: Record<string, boolean>
}

export interface Presupuesto {
  id: string
  numero: number
  fecha: string
  cliente_id?: string
  cliente_snapshot?: Cliente | null
  ambientes: Ambiente[]
  resultados: any[]
  precios_snapshot?: Record<string, number>
  mo_tipo: string
  mo_valor: string
  mo: number
  adicionales: {concepto: string; val: string}[]
  descuento: string
  impuesto: string
  iva: boolean
  tot_m2: number
  tot_mat: number
  sub_tot: number
  d_val: number
  i_val: number
  iva_val: number
  total: number
  created_at?: string
}

export interface Cotizador {
  nombre: string
  empresa: string
  tel: string
  mail: string
  web: string
  cuit: string
  dir: string
  logo: string
}
