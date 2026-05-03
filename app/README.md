# Calcula Drywall Pro

## Setup

### 1. Supabase — ejecutar en SQL Editor
Copiar y ejecutar el contenido de `supabase-schema.sql`

### 2. Variables de entorno en Vercel
Agregar en Project Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://ufnecbgfddugebmwghkf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Gw3eSpPPJk8s-fNxVuf0Iw_ajZ-HG7I
```

### 3. Deploy
```bash
npm install
npm run build
vercel --prod
```

## Claves de acceso iniciales
- `DRW-ADMIN-2025` — admin
- `DRW-USER1-2025` — user
- `DRW-USER2-2025` — user
- `DRW-USER3-2025` — user (vence 31/12/2025)
- `DRW-DEMO-2025` — demo (vence 30/06/2025)

Gestionar desde Panel Admin → Licencias
