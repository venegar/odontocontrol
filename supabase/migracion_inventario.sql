-- ==============================================================================
-- MIGRACIÓN: MÓDULO DE INVENTARIO ODONTOLÓGICO CON FEFO Y SEMAFORIZACIÓN
-- Consultorio Odontológico Virtual
-- Tablas integradas existentes: public.citas, public.historias_clinicas, public.perfiles
-- Políticas estrictas: Acceso exclusivo a usuarios con permiso individual 'inventario'
-- Zona Horaria oficial: America/Bogota (UTC-5)
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
  fecha_ingreso date not null default ((now() at time zone 'America/Bogota')::date),
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
  fecha_retiro date not null default ((now() at time zone 'America/Bogota')::date),
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
-- Restricción estricta: Solo personal con permiso individual 'inventario'
-- Pacientes y colaboradores sin el permiso explícito NO tienen acceso.
-- ------------------------------------------------------------------------------
alter table public.insumos enable row level security;
alter table public.lotes_insumo enable row level security;
alter table public.insumos_vencidos enable row level security;
alter table public.consumo_procedimiento enable row level security;

-- Insumos: SELECT, INSERT, UPDATE (Sin DELETE para proteger catálogo histórico)
drop policy if exists "Personal con permiso inventario consulta insumos" on public.insumos;
create policy "Personal con permiso inventario consulta insumos"
  on public.insumos for select
  using (public.tiene_permiso('inventario'));

drop policy if exists "Personal con permiso inventario inserta insumos" on public.insumos;
create policy "Personal con permiso inventario inserta insumos"
  on public.insumos for insert
  with check (public.tiene_permiso('inventario'));

drop policy if exists "Personal con permiso inventario actualiza insumos" on public.insumos;
create policy "Personal con permiso inventario actualiza insumos"
  on public.insumos for update
  using (public.tiene_permiso('inventario'))
  with check (public.tiene_permiso('inventario'));

-- Lotes Insumo: SELECT, INSERT, UPDATE (Sin DELETE para garantizar trazabilidad FEFO)
drop policy if exists "Personal con permiso inventario consulta lotes" on public.lotes_insumo;
create policy "Personal con permiso inventario consulta lotes"
  on public.lotes_insumo for select
  using (public.tiene_permiso('inventario'));

drop policy if exists "Personal con permiso inventario inserta lotes" on public.lotes_insumo;
create policy "Personal con permiso inventario inserta lotes"
  on public.lotes_insumo for insert
  with check (public.tiene_permiso('inventario'));

drop policy if exists "Personal con permiso inventario actualiza lotes" on public.lotes_insumo;
create policy "Personal con permiso inventario actualiza lotes"
  on public.lotes_insumo for update
  using (public.tiene_permiso('inventario'))
  with check (public.tiene_permiso('inventario'));

-- Insumos Vencidos: SELECT, INSERT, UPDATE de destino (PROHIBIDO DELETE)
drop policy if exists "Personal con permiso inventario consulta insumos vencidos" on public.insumos_vencidos;
create policy "Personal con permiso inventario consulta insumos vencidos"
  on public.insumos_vencidos for select
  using (public.tiene_permiso('inventario'));

drop policy if exists "Personal con permiso inventario inserta insumos vencidos" on public.insumos_vencidos;
create policy "Personal con permiso inventario inserta insumos vencidos"
  on public.insumos_vencidos for insert
  with check (public.tiene_permiso('inventario'));

drop policy if exists "Personal con permiso inventario edita destino vencidos" on public.insumos_vencidos;
create policy "Personal con permiso inventario edita destino vencidos"
  on public.insumos_vencidos for update
  using (public.tiene_permiso('inventario'))
  with check (public.tiene_permiso('inventario'));

-- Consumo Procedimiento: SELECT, INSERT (PROHIBIDO UPDATE Y DELETE para auditoría inalterable)
drop policy if exists "Personal con permiso inventario consulta consumos" on public.consumo_procedimiento;
create policy "Personal con permiso inventario consulta consumos"
  on public.consumo_procedimiento for select
  using (public.tiene_permiso('inventario'));

drop policy if exists "Personal con permiso inventario registra consumos" on public.consumo_procedimiento;
create policy "Personal con permiso inventario registra consumos"
  on public.consumo_procedimiento for insert
  with check (public.tiene_permiso('inventario'));

-- 7. FUNCIÓN RPC TRANSACCIONAL: DESCUENTO AUTOMÁTICO POR FEFO
-- Utiliza zona horaria America/Bogota y valida permiso dentro de la función.
-- Security Definer con search_path fijo para evitar privilege escalation.
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
set search_path = public, pg_temp
as $$
declare
  v_hoy date := (now() at time zone 'America/Bogota')::date;
  v_stock_total numeric := 0;
  v_pendiente numeric := p_cantidad;
  v_lote record;
  v_a_descontar numeric;
  v_detalles jsonb := '[]'::jsonb;
begin
  -- Verificación de permiso individual obligatorio
  if not public.tiene_permiso('inventario') then
    raise exception 'Acceso denegado: se requiere el permiso individual de inventario';
  end if;

  if p_cantidad <= 0 then
    raise exception 'La cantidad a descontar debe ser mayor a cero';
  end if;

  -- 1. Verificar stock disponible total en lotes activos y no vencidos según fecha de Colombia
  select coalesce(sum(cantidad_disponible), 0)
  into v_stock_total
  from public.lotes_insumo
  where insumo_id = p_insumo_id
    and estado = 'ACTIVO'
    and fecha_vencimiento >= v_hoy
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
      and fecha_vencimiento >= v_hoy
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

    -- Registrar consumo (auditable, sin UPDATE/DELETE)
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

-- 8. FUNCIÓN DIARIA: PROCESAMIENTO AUTOMÁTICO DE LOTES VENCIDOS (IDEMPOTENTE)
-- Bloquea lotes expirados según hora de Colombia (America/Bogota).
-- Idempotente: evita duplicar registros si se ejecuta varias veces el mismo día.
-- Security Definer con search_path fijo.
-- ------------------------------------------------------------------------------
create or replace function public.procesar_lotes_vencidos()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_hoy date := (now() at time zone 'America/Bogota')::date;
  v_lote record;
  v_procesados integer := 0;
  v_total_cantidad numeric := 0;
begin
  for v_lote in
    select id, insumo_id, numero_lote, cantidad_disponible, fecha_vencimiento
    from public.lotes_insumo
    where estado = 'ACTIVO'
      and fecha_vencimiento < v_hoy
      and cantidad_disponible > 0
      and not exists (
        select 1 from public.insumos_vencidos iv where iv.lote_id = lotes_insumo.id
      )
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
      v_hoy,
      'Retiro automático por control diario de vencimiento (America/Bogota)'
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
    'fecha_ejecucion', v_hoy
  );
end;
$$;
