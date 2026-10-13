-- ==============================================================================
-- DATOS INICIALES DE PRUEBA (SEED) - CONSULTORIO ODONTOLÓGICO
-- ==============================================================================

-- 1. Catálogo de Tratamientos Odontológicos iniciales
insert into public.tratamientos_catalogo (nombre, descripcion, precio_base, duracion_estimada_minutos)
values
  ('Valoración Odontológica Inicial', 'Examen clínico general, diagnóstico y plan de tratamiento.', 50000.00, 30),
  ('Profilaxis y Limpieza Profunda', 'Eliminación de sarro, placa bacteriana y pulido dental.', 90000.00, 45),
  ('Resina Fotocurada (1 superficie)', 'Restauración estética con resina de alta gama por caries o fractura.', 85000.00, 40),
  ('Blanqueamiento Dental LED', 'Aclaramiento dental en consultorio con lámpara de luz fría.', 350000.00, 60),
  ('Control de Ortodoncia', 'Revisión y ajuste periódico de brackets o alineadores.', 70000.00, 30),
  ('Endodoncia Unirradicular', 'Tratamiento de conducto para piezas dentales anteriores.', 280000.00, 90);

-- 2. Paciente de ejemplo para pruebas
insert into public.pacientes (
  tipo_documento, 
  numero_documento, 
  nombres, 
  apellidos, 
  email, 
  telefono, 
  fecha_nacimiento, 
  alergias, 
  enfermedades_previas, 
  medicamentos_actuales
)
values (
  'CC',
  '1020304050',
  'María Camila',
  'Pérez Gómez',
  'maria.perez@ejemplo.com',
  '+57 310 987 6543',
  '1995-06-15',
  array['Penicilina'],
  array['Hipotensión controlada'],
  array['Ninguno']
);
