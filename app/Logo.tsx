export default function Logo({ size = 48, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: showText ? 12 : 0, justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="8" width="28" height="36" rx="2" fill="#1e2130" stroke="#f59e0b" strokeWidth="1.5"/>
        <rect x="8" y="12" width="20" height="3" rx="1" fill="#f59e0b" opacity=".9"/>
        <rect x="8" y="18" width="20" height="2" rx="1" fill="#f59e0b" opacity=".4"/>
        <rect x="8" y="23" width="14" height="2" rx="1" fill="#f59e0b" opacity=".4"/>
        <rect x="8" y="28" width="20" height="2" rx="1" fill="#f59e0b" opacity=".4"/>
        <rect x="8" y="33" width="10" height="2" rx="1" fill="#f59e0b" opacity=".4"/>
        <circle cx="36" cy="32" r="10" fill="#0d0f1a" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="36" y="37" textAnchor="middle" fontSize="12" fontWeight="800" fill="#f59e0b" fontFamily="monospace">Σ</text>
      </svg>
      {showText && (
        <div>
          <div style={{ fontSize: size > 36 ? 22 : 15, fontWeight: 900, color: '#f59e0b', letterSpacing: '-0.5px', lineHeight: 1 }}>CALCULA</div>
          <div style={{ fontSize: size > 36 ? 11 : 8, fontWeight: 700, color: '#4a4f6a', letterSpacing: '3px', textTransform: 'uppercase', marginTop: 2 }}>DRYWALL PRO</div>
        </div>
      )}
    </div>
  )
}
