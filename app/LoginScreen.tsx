'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Logo from './Logo'
import type { Sesion } from '@/types'

export default function LoginScreen({ onLogin }: { onLogin: (s: Sesion) => void }) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
        </div>
        <div className="login-footer">Calcula Drywall Pro · Licencia requerida</div>
      </div>
    </div>
  )
}
