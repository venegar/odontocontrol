-- ==============================================================================
-- SCHEMA INICIAL - CONSULTORIO ODONTOLÓGICO VIRTUAL (SUPABASE / POSTGRESQL)
-- Versión con soporte de Roles, Permisos Granulares y Aprobación de Citas
-- ==============================================================================

-- 1. TIPOS ENUMERADOS (DOMINIO DEL NEGOCIO)
-- ------------------------------------------------------------------------------
create type rol_usuario as enum ('admin', 'odontologo', 'recepcionista', 'paciente');
create type tipo_documento as enum ('CC', 'TI', 'CE', 'PASAPORTE', 'OTRO');
-- Estados que reflejan el flujo de aprobación
create type estado_cita as enum (
  'solicitada',    -- Creada por el paciente, en espera de aprobación
  'confirmada',    -- Aprobada (manual o automáticamente)
  'en_atencion',   -- Paciente en el sillón dental
  'completada',    -- Cita finalizada con éxito
  'cancelada',     -- Cancelada por el paciente o el consultorio
  'rechazada'      -- Solicitud de cita no aceptada por falta de cupo u otro motivo
);
create type estado_tratamiento as enum ('propuesto', 'en_curso', 'completado', 'cancelado');
create type tipo_recordatorio as enum ('whatsapp', 'email', 'sms');
create type estado_recordatorio as enum ('pendiente', 'enviado', 'fallido');
create type modo_aprobacion as enum ('manual', 'automatico');

-- ------------------------------------------------------------------------------
-- 2. TABLA: CONFIGURACIÓN GENERAL DEL CONSULTORIO
-- ------------------------------------------------------------------------------
create table public.configuracion_consultorio (
  id uuid primary key default gen_random_uuid(),
  nombre_consultorio text not null default 'DentisCare Consultorio Odontológico',
  modo_aprobacion_citas modo_aprobacion not null default 'manual', -- 'manual' o 'automatico'
  duracion_cita_default_minutos integer not null default 30,
  dias_anticipacion_maximo integer not null default 30,
  horas_cancelacion_minima integer not null default 12,
  actualizado_por uuid references auth.users(id),
  actualizado_en timestamptz default timezone('utc'::text, now()) not null
);

-- Insertar configuración inicial por defecto
insert into public.configuracion_consultorio (modo_aprobacion_citas)
values ('manual');

-- ------------------------------------------------------------------------------
-- 3. TABLA: PERFILES DE USUARIO (Vinculada a auth.users de Supabase)
-- ------------------------------------------------------------------------------
create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombres text not null,
  apellidos text not null,
  rol rol_usuario not null default 'paciente',
  telefono text,
  especialidad text, -- Aplica si es odontólogo (ej. Endodoncia, Ortodoncia)
  registro_profesional text, -- Tarjeta profesional médica
  activo boolean default true,
  creado_en timestamptz default timezone('utc'::text, now()) not null,
  actualizado_en timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 4. TABLA: PERMISOS GRANULARES DE USUARIO (Panel de Permisos del Admin)
-- ------------------------------------------------------------------------------
-- Permite al Admin conceder o revocar permisos específicos a cada colaborador:
-- ej: 'citas.aprobar', 'historias.ver', 'pacientes.editar', 'reportes.ver'
create table public.permisos_usuario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  permiso text not null,
  otorgado_por uuid references public.perfiles(id),
  creado_en timestamptz default timezone('utc'::text, now()) not null,
  unique (usuario_id, permiso)
);

-- ------------------------------------------------------------------------------
-- 5. TABLA: PACIENTES (Ficha clínica y datos demográficos)
-- ------------------------------------------------------------------------------
create table public.pacientes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.perfiles(id) on delete set null, -- Enlace si el paciente tiene cuenta activa
  tipo_documento tipo_documento not null default 'CC',
  numero_documento text not null unique,
  nombres text not null,
  apellidos text not null,
  email text,
  telefono text not null,
  fecha_nacimiento date not null,
  ciudad text default 'Bogotá',
  direccion text,
  
  -- Antecedentes médicos relevantes para odontología
  alergias text[] default '{}',
  enfermedades_previas text[] default '{}',
  medicamentos_actuales text[] default '{}',
  contacto_emergencia_nombre text,
  contacto_emergencia_telefono text,
  
  creado_en timestamptz default timezone('utc'::text, now()) not null,
  actualizado_en timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 6. TABLA: CATÁLOGO DE TRATAMIENTOS Y SERVICIOS
-- ------------------------------------------------------------------------------
create table public.tratamientos_catalogo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  precio_base numeric(12, 2) not null default 0.00,
  duracion_estimada_minutos integer not null default 30,
  activo boolean default true,
  creado_en timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 7. TABLA: CITAS Y AGENDAMIENTO (Con soporte para solicitud y reagendamiento)
-- ------------------------------------------------------------------------------
create table public.citas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  odontologo_id uuid not null references public.perfiles(id) on delete restrict,
  tratamiento_id uuid references public.tratamientos_catalogo(id) on delete set null,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  motivo text not null,
  estado estado_cita not null default 'solicitada', -- Comienza en 'solicitada'
  es_reagendamiento boolean default false,
  cita_origen_id uuid references public.citas(id), -- Referencia si es una cita reagendada
  motivo_rechazo_cancelacion text,
  aprobado_por uuid references public.perfiles(id),
  aprobado_en timestamptz,
  notas text,
  creado_por uuid references public.perfiles(id) on delete set null,
  creado_en timestamptz default timezone('utc'::text, now()) not null,
  actualizado_en timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 8. TABLA: HISTORIAS CLÍNICAS Y EVOLUCIONES
-- ------------------------------------------------------------------------------
create table public.historias_clinicas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  odontologo_id uuid not null references public.perfiles(id) on delete restrict,
  cita_id uuid references public.citas(id) on delete set null,
  fecha timestamptz default timezone('utc'::text, now()) not null,
  
  motivo_consulta text not null,
  diagnostico text not null,
  procedimiento_realizado text not null,
  pieza_dental text, -- Nomenclatura FDI (ej. "18", "21") o "General"
  prescripcion_medicamentos text,
  indicaciones_cuidados text,
  archivos_adjuntos text[] default '{}',
  
  creado_en timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 9. TABLA: RECORDATORIOS AUTOMATIZADOS DE CITAS
-- ------------------------------------------------------------------------------
create table public.recordatorios (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid not null references public.citas(id) on delete cascade,
  tipo tipo_recordatorio not null default 'whatsapp',
  destinatario text not null,
  mensaje text not null,
  programado_para timestamptz not null,
  estado estado_recordatorio not null default 'pendiente',
  enviado_en timestamptz,
  error_detalle text,
  creado_en timestamptz default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 10. FUNCIONES AUXILIARES Y VERIFICACIÓN DE PERMISOS
-- ==============================================================================

-- Función para consultar el rol del usuario actual
create or replace function public.obtener_rol_actual()
returns rol_usuario as $$
  select rol from public.perfiles where id = auth.uid();
$$ language sql security definer stable;

-- Función para verificar si un usuario tiene un permiso específico (o es admin)
create or replace function public.tiene_permiso(p_permiso text)
returns boolean as $$
declare
  v_rol rol_usuario;
begin
  select rol into v_rol from public.perfiles where id = auth.uid();
  
  -- El administrador tiene acceso absoluto
  if v_rol = 'admin' then
    return true;
  end if;

  -- Comprobar si el usuario tiene el permiso asignado explícitamente
  return exists (
    select 1 from public.permisos_usuario
    where usuario_id = auth.uid() and permiso = p_permiso
  );
end;
$$ language plpgsql security definer stable;

-- Función trigger para registrar el perfil cuando un usuario se registra en auth.users
create or replace function public.manejar_nuevo_usuario()
returns trigger as $$
begin
  insert into public.perfiles (id, nombres, apellidos, rol, telefono)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombres', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'apellidos', 'Nuevo'),
    coalesce((new.raw_user_meta_data->>'rol')::rol_usuario, 'paciente'),
    new.raw_user_meta_data->>'telefono'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger al crear usuario en Supabase Auth
create or replace trigger al_crear_auth_user
  after insert on auth.users
  for each row execute procedure public.manejar_nuevo_usuario();

-- ==============================================================================
-- 11. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.configuracion_consultorio enable row level security;
alter table public.perfiles enable row level security;
alter table public.permisos_usuario enable row level security;
alter table public.pacientes enable row level security;
alter table public.tratamientos_catalogo enable row level security;
alter table public.citas enable row level security;
alter table public.historias_clinicas enable row level security;
alter table public.recordatorios enable row level security;

-- CONFIGURACIÓN DEL CONSULTORIO
create policy "Cualquiera autenticado puede ver configuración básica"
  on public.configuracion_consultorio for select
  using (auth.role() = 'authenticated');

create policy "Solo admin puede editar la configuración del consultorio"
  on public.configuracion_consultorio for all
  using (public.obtener_rol_actual() = 'admin');

-- PERMISOS DE USUARIO
create policy "Admin tiene control total de permisos"
  on public.permisos_usuario for all
  using (public.obtener_rol_actual() = 'admin');

create policy "Usuarios pueden ver sus propios permisos"
  on public.permisos_usuario for select
  using (usuario_id = auth.uid());

-- PERFILES
create policy "Usuarios ven su propio perfil o personal autorizado"
  on public.perfiles for select
  using (auth.uid() = id or public.tiene_permiso('personal.ver'));

create policy "Admin gestiona perfiles del personal"
  on public.perfiles for all
  using (public.obtener_rol_actual() = 'admin');

create policy "Usuarios pueden actualizar su propio perfil básico"
  on public.perfiles for update
  using (auth.uid() = id);

-- TRATAMIENTOS_CATÁLOGO
create policy "Catálogo visible públicamente"
  on public.tratamientos_catalogo for select
  using (true);

create policy "Admin o autorizados gestionan catálogo"
  on public.tratamientos_catalogo for all
  using (public.tiene_permiso('tratamientos.gestionar'));

-- PACIENTES
create policy "Personal con permiso puede consultar pacientes"
  on public.pacientes for select
  using (
    public.tiene_permiso('pacientes.ver') or 
    (public.obtener_rol_actual() = 'paciente' and usuario_id = auth.uid())
  );

create policy "Personal autorizado puede registrar pacientes"
  on public.pacientes for insert
  with check (public.tiene_permiso('pacientes.crear'));

create policy "Personal autorizado puede editar pacientes"
  on public.pacientes for update
  using (public.tiene_permiso('pacientes.editar'));

-- CITAS
create policy "Visualización de citas según rol y permisos"
  on public.citas for select
  using (
    public.tiene_permiso('citas.ver') or
    (public.obtener_rol_actual() = 'odontologo' and odontologo_id = auth.uid()) or
    (public.obtener_rol_actual() = 'paciente' and paciente_id in (
      select id from public.pacientes where usuario_id = auth.uid()
    ))
  );

create policy "Pacientes y personal pueden crear solicitudes de cita"
  on public.citas for insert
  with check (auth.role() = 'authenticated');

create policy "Personal con permiso de citas puede aprobar o reprogramar"
  on public.citas for update
  using (
    public.tiene_permiso('citas.aprobar') or
    (public.obtener_rol_actual() = 'odontologo' and odontologo_id = auth.uid()) or
    (public.obtener_rol_actual() = 'paciente' and paciente_id in (
      select id from public.pacientes where usuario_id = auth.uid()
    ))
  );

-- HISTORIAS CLÍNICAS (Protección médica)
create policy "Solo odontólogos y admin acceden a historias clínicas"
  on public.historias_clinicas for select
  using (public.tiene_permiso('historias.ver') or public.obtener_rol_actual() = 'odontologo');

create policy "Registro de historias clínicas por odontólogos autorizados"
  on public.historias_clinicas for insert
  with check (public.tiene_permiso('historias.crear') or public.obtener_rol_actual() = 'odontologo');

-- RECORDATORIOS
create policy "Gestión de recordatorios por personal autorizado"
  on public.recordatorios for all
  using (public.tiene_permiso('recordatorios.gestionar'));
