'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Logo from './Logo'
import type { Sesion } from '@/types'

function RecuperarClave({ onVolver }: { onVolver: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')

  const buscar = async () => {
    if (!email.trim()) { setError('Ingresá tu email'); return }
    setLoading(true)
    setError('')
    const { data } = await supabase
      .from('licencias')
      .select('clave, activa, vencimiento')
      .eq('email', email.trim().toLowerCase())
      .single()
    if (!data) {
      setError('No encontramos una licencia asociada a ese email.')
    } else {
      setClave(data.clave)
    }
    setLoading(false)
  }

  if (clave) {
    return (
      <>
        <h2>Tu clave de acceso</h2>
        <p>Usá esta clave para ingresar a la aplicación.</p>
        <div style={{ background:'#1a1d2e', borderRadius:8, padding:'14px 18px', fontFamily:'monospace', fontSize:18, letterSpacing:'3px', color:'var(--acc)', textAlign:'center', marginBottom:18 }}>
          {clave}
        </div>
        <button className="btn btn-acc btn-login" onClick={onVolver}>Volver al inicio →</button>
      </>
    )
  }

  return (
    <>
      <h2>Recuperar clave</h2>
      <p>Ingresá el email asociado a tu licencia.</p>
      {error && <div className="login-err">⚠ {error}</div>}
      <div className="fg" style={{ marginBottom: 14 }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && buscar()}
          placeholder="tu@email.com"
          autoFocus
        />
      </div>
      <button className="btn btn-acc btn-login" onClick={buscar} disabled={loading}>
        {loading ? 'Buscando…' : 'Buscar clave →'}
      </button>
      <button onClick={onVolver}
        style={{ marginTop:14, background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--t2)', textDecoration:'underline', width:'100%' }}>
        Volver
      </button>
    </>
  )
}

export default function LoginScreen({ onLogin }: { onLogin: (s: Sesion) => void }) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recuperar, setRecuperar] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const intentar = async () => {
    if (!clave.trim()) { setError('Ingresá tu clave de acceso'); return }
    setLoading(true)
    try {
      const hoy = new Date().toISOString().slice(0, 10)
      const { data, error: err } = await supabase
        .from('licencias')
        .select('*')
        .eq('clave', clave.trim().toUpperCase())
        .eq('activa', true)
        .single()
      if (err || !data) { setError('Clave inválida.'); setLoading(false); return }
      if (data.vencimiento && hoy > data.vencimiento) {
        setError(`Licencia vencida el ${data.vencimiento}. Contactá al administrador.`)
        setLoading(false); return
      }
      onLogin({ usuario: data.usuario, rol: data.rol })
    } catch {
      setError('Error al verificar. Intentá de nuevo.')
    }
    setLoading(false)
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo"><Logo size={56} showText={true}/></div>
        <div className="login-card">
          {recuperar ? (
            <RecuperarClave onVolver={() => setRecuperar(false)} />
          ) : (
            <>
              <h2>Acceso a la aplicación</h2>
              <p>Ingresá tu clave de licencia para continuar</p>
              {error && <div className="login-err">⚠ {error}</div>}
              <div className="fg" style={{ marginBottom: 14 }}>
                <label>Clave de acceso</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={clave}
                  onChange={e => { setClave(e.target.value.toUpperCase()); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && intentar()}
                  placeholder="DRW-XXXXX-XXXX"
                  style={{ letterSpacing: '2px', fontFamily: 'monospace', fontSize: 14 }}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <button className="btn btn-acc btn-login" onClick={intentar} disabled={loading}>
                {loading ? 'Verificando…' : 'Ingresar →'}
              </button>
              <button onClick={() => setRecuperar(true)}
                style={{ marginTop:14, background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--t2)', textDecoration:'underline', width:'100%' }}>
                ¿Olvidaste tu clave?
              </button>
            </>
          )}
        </div>
        <div className="login-footer">Calcula Drywall Pro · Licencia requerida</div>
      </div>
    </div>
  )
}
