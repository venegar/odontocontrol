# Reglas y Convenciones del Proyecto - Consultorio Odontológico Virtual

## 1. Idioma y Comunicación
- Todas las respuestas, explicaciones, resúmenes, documentación y comentarios en el código deben redactarse exclusivamente en **español**.

## 2. Visión del Proyecto
Desarrollo de una plataforma web integral para un consultorio odontológico, compuesta por:
- **Área Pública:** Sitio informativo (servicios, equipo, contacto, horarios), blog de salud oral y formulario de solicitud de citas.
- **Portal del Paciente:** Calendario personal donde los pacientes pueden ver sus citas activas y solicitar citas o reagendamientos.
- **Área Privada (Gestión Clínica):** Sistema administrativo modular con:
  - **Control de Roles y Permisos:** Rol Administrador con acceso total y panel para asignar permisos individuales al personal del consultorio.
  - **Aprobación de Citas Configurable:** Las solicitudes de agendamiento/reagendamiento de pacientes pasan por aprobación (modo manual por recepción/médico o modo automático según disponibilidad del odontólogo).
  - **Gestión Clínica:** Pacientes, calendario de citas del consultorio, personal, historias clínicas, tratamientos y recordatorios automatizados.

## 3. Stack Tecnológico
- **Frontend / Framework:** Next.js (App Router) con TypeScript y Tailwind CSS.
- **Componentes UI:** shadcn/ui o componentes accesibles y reutilizables con Tailwind CSS y Lucide Icons.
- **Base de Datos y Autenticación:** Supabase / PostgreSQL con políticas de seguridad Row Level Security (RLS).
- **Gestión de Estado y Formularios:** React Hook Form + Zod para validaciones tipadas.

## 4. Arquitectura Modular
El código se estructurará por dominios funcionales para garantizar escalabilidad:
- `src/app/(public)/`: Rutas públicas (inicio, blog, contacto, solicitar cita).
- `src/app/(dashboard)/`: Rutas protegidas del panel administrativo.
- `src/modules/`: Módulos de lógica de negocio desacoplados:
  - `pacientes/`
  - `citas/`
  - `personal/`
  - `tratamientos/`
  - `historias-clinicas/`
  - `blog/`
  - `recordatorios/`
- `src/components/ui/`: Componentes genéricos de interfaz compartidos.

## 5. Buenas Prácticas de Código
- Mantener tipado estricto en TypeScript sin uso de `any`.
- Modularidad: cada nueva funcionalidad debe crearse en su respectivo módulo sin acoplarse excesivamente a otros.
- Seguridad en datos médicos: garantizar la privacidad y confidencialidad de los datos de los pacientes.
