-- ==============================================================================
-- MIGRACIÓN: AGREGAR CAMPO EPS A LA TABLA DE PACIENTES
-- Consultorio Odontológico Dra. Yasmín Blanco
-- ==============================================================================

-- 1. Agregar columna eps a public.pacientes con valor por defecto 'Particular'
alter table public.pacientes
add column if not exists eps text default 'Particular' check (eps in ('Particular', 'Ecopetrol'));

comment on column public.pacientes.eps is 'Entidad Promotora de Salud o régimen de cobertura del paciente (Particular o Ecopetrol)';

-- 2. Asegurar que los pacientes existentes tengan un valor asignado
update public.pacientes
set eps = 'Particular'
where eps is null;
