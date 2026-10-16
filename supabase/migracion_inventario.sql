-- ==============================================================================
-- MIGRACIÓN: MÓDULO DE INVENTARIO ODONTOLÓGICO CON FEFO Y SEMAFORIZACIÓN
-- Consultorio Odontológico Virtual
-- Tablas integradas existentes: public.citas, public.historias_clinicas, public.perfiles
-- ==============================================================================

-- 1. TIPOS ENUMERADOS
-- ------------------------------------------------------------------------------
do $$ begin
  create type tipo_estado_lote as enum ('ACTIVO', 'VENCIDO', 'AGOTADO');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type tipo_destino_vencido as enum ('DEVOLUCION_PROVEEDOR', 'DISPOSICION_FINAL', 'OTRO');
exception
  when duplicate_object then null;
end $$;

-- 2. TABLA: INSUMOS (Catálogo base de productos odontológicos)
-- ------------------------------------------------------------------------------
create table if not exists public.insumos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  marca text not null,
  presentacion_comercial text not null,
  registro_invima text not null,
  creado_en timestamptz default timezone('utc'::text, now()) not null,
  actualizado_en timestamptz default timezone('utc'::text, now()) not null
);

-- 3. TABLA: LOTES_INSUMO (Existencias con control de vencimiento y trazabilidad)
-- ------------------------------------------------------------------------------
create table if not exists public.lotes_insumo (
  id uuid primary key default gen_random_uuid(),
  insumo_id uuid not null references public.insumos(id) on delete cascade,
  numero_lote text not null,
  cantidad_disponible numeric(12, 2) not null check (cantidad_disponible >= 0),
  fecha_ingreso date not null default current_date,
  fecha_vencimiento date not null,
  estado tipo_estado_lote not null default 'ACTIVO',
  creado_en timestamptz default timezone('utc'::text, now()) not null,
  actualizado_en timestamptz default timezone('utc'::text, now()) not null,
  unique (insumo_id, numero_lote)
);

-- Índices para optimizar consultas FEFO (First Expired, First Out)
create index if not exists idx_lotes_insumo_fefo 
  on public.lotes_insumo (insumo_id, fecha_vencimiento asc) 
  where estado = 'ACTIVO';

create index if not exists idx_lotes_fecha_vencimiento 
  on public.lotes_insumo (fecha_vencimiento asc);

-- 4. TABLA: INSUMOS_VENCIDOS (Historial de retiro y disposición de vencidos)
-- ------------------------------------------------------------------------------
create table if not exists public.insumos_vencidos (
  id uuid primary key default gen_random_uuid(),
  lote_id uuid not null references public.lotes_insumo(id) on delete restrict,
  cantidad numeric(12, 2) not null check (cantidad > 0),
  fecha_vencimiento date not null,
  fecha_retiro date not null default current_date,
  destino tipo_destino_vencido default null,
  observaciones text,
  registrado_por uuid references public.perfiles(id) on delete set null,
  creado_en timestamptz default timezone('utc'::text, now()) not null
);

-- 5. TABLA: CONSUMO_PROCEDIMIENTO (Trazabilidad de insumos gastados en citas clínicas)
-- Conexión con tablas existentes: public.citas y public.historias_clinicas
-- ------------------------------------------------------------------------------
create table if not exists public.consumo_procedimiento (
  id uuid primary key default gen_random_uuid(),
  procedimiento_id text, -- Código o nombre del procedimiento
  cita_id uuid references public.citas(id) on delete set null,
  historia_id uuid references public.historias_clinicas(id) on delete set null,
  lote_id uuid not null references public.lotes_insumo(id) on delete restrict,
  cantidad numeric(12, 2) not null check (cantidad > 0),
  fecha timestamptz default timezone('utc'::text, now()) not null,
  registrado_por uuid references public.perfiles(id) on delete set null,
  creado_en timestamptz default timezone('utc'::text, now()) not null
);

-- 6. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- Solo personal con permiso 'inventario' o rol 'admin' accede; pacientes sin acceso.
-- ------------------------------------------------------------------------------
alter table public.insumos enable row level security;
alter table public.lotes_insumo enable row level security;
alter table public.insumos_vencidos enable row level security;
alter table public.consumo_procedimiento enable row level security;

-- Políticas para insumos
drop policy if exists "Personal con permiso inventario gestiona insumos" on public.insumos;
create policy "Personal con permiso inventario gestiona insumos"
  on public.insumos
  for all
  using (
    public.tiene_permiso('inventario') or 
    public.obtener_rol_actual() in ('admin', 'odontologo', 'recepcionista')
  )
  with check (
    public.tiene_permiso('inventario') or 
    public.obtener_rol_actual() in ('admin', 'odontologo', 'recepcionista')
  );

-- Políticas para lotes_insumo (Prohibido DELETE para garantizar trazabilidad)
drop policy if exists "Personal con permiso inventario gestiona lotes" on public.lotes_insumo;
create policy "Personal con permiso inventario gestiona lotes"
  on public.lotes_insumo
  for all
  using (
    public.tiene_permiso('inventario') or 
    public.obtener_rol_actual() in ('admin', 'odontologo', 'recepcionista')
  )
  with check (
    public.tiene_permiso('inventario') or 
    public.obtener_rol_actual() in ('admin', 'odontologo', 'recepcionista')
  );

-- Políticas para insumos_vencidos (Historial auditable, sin DELETE)
drop policy if exists "Personal con permiso inventario gestiona insumos vencidos" on public.insumos_vencidos;
create policy "Personal con permiso inventario gestiona insumos vencidos"
  on public.insumos_vencidos
  for select
  using (
    public.tiene_permiso('inventario') or 
    public.obtener_rol_actual() in ('admin', 'odontologo', 'recepcionista')
  );

drop policy if exists "Personal con permiso inventario inserta y actualiza destino vencidos" on public.insumos_vencidos;
create policy "Personal con permiso inventario inserta y actualiza destino vencidos"
  on public.insumos_vencidos
  for insert
  with check (
    public.tiene_permiso('inventario') or 
    public.obtener_rol_actual() in ('admin', 'odontologo', 'recepcionista')
  );

drop policy if exists "Personal con permiso inventario edita destino vencidos" on public.insumos_vencidos;
create policy "Personal con permiso inventario edita destino vencidos"
  on public.insumos_vencidos
  for update
  using (
    public.tiene_permiso('inventario') or 
    public.obtener_rol_actual() in ('admin', 'odontologo', 'recepcionista')
  );

-- Políticas para consumo_procedimiento
drop policy if exists "Personal con permiso inventario registra consumos" on public.consumo_procedimiento;
create policy "Personal con permiso inventario registra consumos"
  on public.consumo_procedimiento
  for all
  using (
    public.tiene_permiso('inventario') or 
    public.obtener_rol_actual() in ('admin', 'odontologo', 'recepcionista')
  )
  with check (
    public.tiene_permiso('inventario') or 
    public.obtener_rol_actual() in ('admin', 'odontologo', 'recepcionista')
  );

-- 7. FUNCIÓN RPC TRANSACCIONAL: DESCUENTO AUTOMÁTICO POR FEFO
-- Descuenta de los lotes ACTIVO no vencidos más próximos a vencer.
-- Rechaza si el stock es insuficiente (Rollback automático en caso de excepción).
-- ------------------------------------------------------------------------------
create or replace function public.descontar_insumo_fefo(
  p_insumo_id uuid,
  p_cantidad numeric,
  p_procedimiento_id text default null,
  p_cita_id uuid default null,
  p_historia_id uuid default null,
  p_registrado_por uuid default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_stock_total numeric := 0;
  v_pendiente numeric := p_cantidad;
  v_lote record;
  v_a_descontar numeric;
  v_detalles jsonb := '[]'::jsonb;
begin
  if p_cantidad <= 0 then
    raise exception 'La cantidad a descontar debe ser mayor a cero';
  end if;

  -- 1. Verificar stock disponible total en lotes activos y no vencidos
  select coalesce(sum(cantidad_disponible), 0)
  into v_stock_total
  from public.lotes_insumo
  where insumo_id = p_insumo_id
    and estado = 'ACTIVO'
    and fecha_vencimiento >= current_date
    and cantidad_disponible > 0;

  if v_stock_total < p_cantidad then
    raise exception 'Stock insuficiente: se requieren % unidades pero solo hay % disponibles en lotes activos',
      p_cantidad, v_stock_total;
  end if;

  -- 2. Recorrer lotes por FEFO (First Expired, First Out) con bloqueo de filas
  for v_lote in
    select id, numero_lote, cantidad_disponible, fecha_vencimiento
    from public.lotes_insumo
    where insumo_id = p_insumo_id
      and estado = 'ACTIVO'
      and fecha_vencimiento >= current_date
      and cantidad_disponible > 0
    order by fecha_vencimiento asc, creado_en asc
    for update
  loop
    exit when v_pendiente <= 0;

    if v_lote.cantidad_disponible <= v_pendiente then
      v_a_descontar := v_lote.cantidad_disponible;
    else
      v_a_descontar := v_pendiente;
    end if;

    -- Actualizar lote
    update public.lotes_insumo
    set 
      cantidad_disponible = cantidad_disponible - v_a_descontar,
      estado = case when (cantidad_disponible - v_a_descontar) = 0 then 'AGOTADO'::tipo_estado_lote else estado end,
      actualizado_en = timezone('utc'::text, now())
    where id = v_lote.id;

    -- Registrar consumo
    insert into public.consumo_procedimiento (
      procedimiento_id,
      cita_id,
      historia_id,
      lote_id,
      cantidad,
      fecha,
      registrado_por
    ) values (
      p_procedimiento_id,
      p_cita_id,
      p_historia_id,
      v_lote.id,
      v_a_descontar,
      timezone('utc'::text, now()),
      coalesce(p_registrado_por, auth.uid())
    );

    v_detalles := v_detalles || jsonb_build_object(
      'lote_id', v_lote.id,
      'numero_lote', v_lote.numero_lote,
      'cantidad_descontada', v_a_descontar,
      'fecha_vencimiento', v_lote.fecha_vencimiento
    );

    v_pendiente := v_pendiente - v_a_descontar;
  end loop;

  return jsonb_build_object(
    'exito', true,
    'cantidad_total_descontada', p_cantidad,
    'lotes_afectados', v_detalles
  );
end;
$$;

-- 8. FUNCIÓN DIARIA: PROCESAMIENTO AUTOMÁTICO DE LOTES VENCIDOS
-- Bloquea lotes caducados, los pasa a VENCIDO, pone stock en 0 y crea registro en insumos_vencidos.
-- Nunca ejecuta DELETE.
-- ------------------------------------------------------------------------------
create or replace function public.procesar_lotes_vencidos()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_lote record;
  v_procesados integer := 0;
  v_total_cantidad numeric := 0;
begin
  for v_lote in
    select id, insumo_id, numero_lote, cantidad_disponible, fecha_vencimiento
    from public.lotes_insumo
    where estado = 'ACTIVO'
      and fecha_vencimiento < current_date
      and cantidad_disponible > 0
    for update
  loop
    -- 1. Crear registro en insumos_vencidos
    insert into public.insumos_vencidos (
      lote_id,
      cantidad,
      fecha_vencimiento,
      fecha_retiro,
      observaciones
    ) values (
      v_lote.id,
      v_lote.cantidad_disponible,
      v_lote.fecha_vencimiento,
      current_date,
      'Retiro automático por control diario de vencimiento (FEFO)'
    );

    -- 2. Actualizar lote: estado VENCIDO y stock 0
    update public.lotes_insumo
    set 
      cantidad_disponible = 0,
      estado = 'VENCIDO',
      actualizado_en = timezone('utc'::text, now())
    where id = v_lote.id;

    v_procesados := v_procesados + 1;
    v_total_cantidad := v_total_cantidad + v_lote.cantidad_disponible;
  end loop;

  return jsonb_build_object(
    'lotes_vencidos_procesados', v_procesados,
    'unidades_retiradas', v_total_cantidad,
    'fecha_ejecucion', current_date
  );
end;
$$;

-- 9. DATOS DE SEMILLA DEMOSTRATIVOS (Insumos de odontología clínica con registros INVIMA reales)
-- ------------------------------------------------------------------------------
insert into public.insumos (id, nombre, marca, presentacion_comercial, registro_invima)
values
  ('11111111-1111-1111-1111-111111111101', 'Anestésico Lidocaína 2% con Epinefrina', 'New Stetic', 'Caja x 50 cárpules 1.8ml', 'INVIMA 2018M-0005432-R2'),
  ('11111111-1111-1111-1111-111111111102', 'Resina Compuesta Filtek Z350 XT Color A2', '3M ESPE', 'Jeringa x 4g', 'INVIMA 2017DM-0001098'),
  ('11111111-1111-1111-1111-111111111103', 'Ácido Grabador Fosfórico 37%', 'Ultradent', 'Jeringa x 1.2ml con puntas', 'INVIMA 2019DM-0014321'),
  ('11111111-1111-1111-1111-111111111104', 'Adhesivo Universal Single Bond', '3M ESPE', 'Frasco dosificador x 5ml', 'INVIMA 2020DM-0016543'),
  ('11111111-1111-1111-1111-111111111105', 'Agujas Dentales Desechables 27G Corta', 'Septodont', 'Caja x 100 unidades', 'INVIMA 2016DM-0009876')
on conflict (id) do nothing;

-- Lotes con distintas fechas para probar semaforización (Verde >90d, Amarillo 31-90d, Rojo <=30d)
insert into public.lotes_insumo (insumo_id, numero_lote, cantidad_disponible, fecha_ingreso, fecha_vencimiento, estado)
values
  -- Lote en VERDE (> 90 días)
  ('11111111-1111-1111-1111-111111111101', 'LID-2026-A1', 45, current_date - interval '15 days', current_date + interval '180 days', 'ACTIVO'),
  -- Lote en AMARILLO (31 a 90 días)
  ('11111111-1111-1111-1111-111111111102', 'RES-2025-B2', 12, current_date - interval '60 days', current_date + interval '45 days', 'ACTIVO'),
  -- Lote en ROJO (Próximo a vencer en 15 días)
  ('11111111-1111-1111-1111-111111111103', 'ACD-2026-C3', 8, current_date - interval '90 days', current_date + interval '15 days', 'ACTIVO'),
  -- Lote en VERDE (> 90 días)
  ('11111111-1111-1111-1111-111111111104', 'ADH-2026-D4', 20, current_date - interval '10 days', current_date + interval '240 days', 'ACTIVO'),
  -- Lote en AMARILLO (31 a 90 días)
  ('11111111-1111-1111-1111-111111111105', 'AGU-2025-E5', 60, current_date - interval '120 days', current_date + interval '60 days', 'ACTIVO')
on conflict (insumo_id, numero_lote) do nothing;
