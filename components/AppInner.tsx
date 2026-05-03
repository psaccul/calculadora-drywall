'use client'
import { useState } from 'react'
import Logo from './Logo'
import PagCalc from './PagCalc'
import PagPresupuestos from './PagPresupuestos'
import PagClientes from './PagClientes'
import PagPrecios from './PagPrecios'
import PagCotizador from './PagCotizador'
import PanelAdmin from './PanelAdmin'
import type { Sesion, Presupuesto } from '@/types'

interface Props { sesion: Sesion; onLogout: () => void }

export default function AppInner({ sesion, onLogout }: Props) {
  const [pag, setPag] = useState('calc')
  const [sbOpen, setSbOpen] = useState(false)
  const [notif, setNotif] = useState<{ m: string; tipo: string } | null>(null)
  const [pdfData, setPdfData] = useState<Presupuesto | null>(null)
  const [refreshPresups, setRefreshPresups] = useState(0)

  const msg = (m: string, tipo = 'ok') => {
    setNotif({ m, tipo })
    setTimeout(() => setNotif(null), 3000)
  }

  const nav = [
    { id: 'calc',      ic: '📐', label: 'Nueva cotización' },
    { id: 'presups',   ic: '📋', label: 'Presupuestos' },
    { id: 'clientes',  ic: '👥', label: 'Clientes' },
    { id: 'precios',   ic: '💰', label: 'Lista de precios' },
    { id: 'cotizador', ic: '🪪', label: 'Mis datos' },
    ...(sesion.rol === 'admin' ? [{ id: 'admin', ic: '🔐', label: 'Licencias' }] : []),
  ]

  const navItem = nav.find(n => n.id === pag)

  return (
    <div className="app">
      <div className={`sb-overlay${sbOpen ? ' open' : ''}`} onClick={() => setSbOpen(false)}/>
      <aside className={`sb${sbOpen ? ' open' : ''}`}>
        <div className="sb-logo"><Logo size={28} showText={true}/></div>
        <nav className="sb-nav">
          {nav.map(n => (
            <div key={n.id} className={`ni${pag === n.id ? ' on' : ''}`}
              onClick={() => { setPag(n.id); setSbOpen(false) }}>
              <span className="ic">{n.ic}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
            </div>
          ))}
        </nav>
        <div className="sb-user">
          <div className="sb-user-av">{sesion.usuario.slice(0, 2).toUpperCase()}</div>
          <div className="sb-user-name">{sesion.usuario}</div>
          <button className="sb-logout" onClick={onLogout} title="Cerrar sesión">⏻</button>
        </div>
      </aside>
      <div className="main">
        <div className="hdr">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="hamburger" onClick={() => setSbOpen(s => !s)}>☰</button>
            <h2>{navItem?.ic} {navItem?.label}</h2>
          </div>
        </div>
        <div className="content">
          {pag === 'calc'      && <PagCalc msg={msg} sesion={sesion} onSaved={() => setRefreshPresups(r => r+1)}/>}
          {pag === 'presups'   && <PagPresupuestos msg={msg} refresh={refreshPresups}/>}
          {pag === 'clientes'  && <PagClientes msg={msg}/>}
          {pag === 'precios'   && <PagPrecios msg={msg}/>}
          {pag === 'cotizador' && <PagCotizador msg={msg}/>}
          {pag === 'admin' && sesion.rol === 'admin' && <PanelAdmin msg={msg}/>}
        </div>
      </div>
      {notif && <div className={`notif ${notif.tipo}`}>{notif.m}</div>}
    </div>
  )
}
