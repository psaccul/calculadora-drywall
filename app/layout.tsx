import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Calcula Drywall Pro',
  description: 'Calculadora y cotizadora para construcción en seco',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
