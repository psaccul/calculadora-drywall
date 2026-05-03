'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import LoginScreen from '@/components/LoginScreen'
import AppInner from '@/components/AppInner'
import type { Sesion } from '@/types'

export default function Home() {
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = sessionStorage.getItem('dw_sesion')
    if (s) setSesion(JSON.parse(s))
    setLoading(false)
  }, [])

  const login = (s: Sesion) => {
    sessionStorage.setItem('dw_sesion', JSON.stringify(s))
    setSesion(s)
  }

  const logout = () => {
    sessionStorage.removeItem('dw_sesion')
    setSesion(null)
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#0d0f1a'}}/>
  if (!sesion) return <LoginScreen onLogin={login}/>
  return <AppInner sesion={sesion} onLogout={logout}/>
}
