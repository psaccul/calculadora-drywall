-- Run this in Supabase SQL Editor

-- Licencias
create table if not exists licencias (
  id uuid primary key default gen_random_uuid(),
  clave text unique not null,
  usuario text not null,
  rol text not null default 'user',
  vencimiento date,
  activa boolean default true,
  created_at timestamptz default now()
);

-- Clientes
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  empresa text,
  tel text,
  mail text,
  dir text,
  notas text,
  created_at timestamptz default now()
);

-- Precios
create table if not exists precios (
  id uuid primary key default gen_random_uuid(),
  clave text unique not null,
  valor numeric not null default 0,
  updated_at timestamptz default now()
);

-- Cotizador (datos del profesional)
create table if not exists cotizador (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  empresa text,
  tel text,
  mail text,
  web text,
  cuit text,
  dir text,
  logo text,
  updated_at timestamptz default now()
);

-- Presupuestos
create table if not exists presupuestos (
  id uuid primary key default gen_random_uuid(),
  numero integer not null,
  fecha text not null,
  cliente_id uuid references clientes(id) on delete set null,
  cliente_snapshot jsonb,
  ambientes jsonb not null default '[]',
  resultados jsonb not null default '[]',
  precios_snapshot jsonb,
  mo_tipo text,
  mo_valor text,
  mo numeric default 0,
  adicionales jsonb default '[]',
  descuento text,
  impuesto text,
  iva boolean default false,
  tot_m2 numeric default 0,
  tot_mat numeric default 0,
  sub_tot numeric default 0,
  d_val numeric default 0,
  i_val numeric default 0,
  iva_val numeric default 0,
  total numeric default 0,
  created_at timestamptz default now()
);

-- Insertar licencias por defecto
insert into licencias (clave, usuario, rol, vencimiento) values
  ('DRW-ADMIN-2025', 'Administrador', 'admin', null),
  ('DRW-USER1-2025', 'Usuario 1', 'user', null),
  ('DRW-USER2-2025', 'Usuario 2', 'user', null),
  ('DRW-USER3-2025', 'Usuario 3', 'user', '2025-12-31'),
  ('DRW-DEMO-2025',  'Demo',      'user', '2025-06-30')
on conflict (clave) do nothing;

-- RLS: deshabilitado para simplicidad (app interna con licencias propias)
alter table licencias disable row level security;
alter table clientes disable row level security;
alter table precios disable row level security;
alter table cotizador disable row level security;
alter table presupuestos disable row level security;
