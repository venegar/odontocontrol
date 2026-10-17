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

## 6. Registro Continuo de Cambios (Bitácora Obligatoria)
- **Regla:** Cada vez que se realice un cambio, nueva característica, corrección o refactorización en la aplicación, se debe documentar inmediatamente en la sección **Historial de Cambios** de este archivo (`GEMINI.md`).
- **Formato del registro:**
  - Fecha del cambio.
  - Módulos o archivos modificados/creados.
  - Descripción clara del cambio y su propósito.
  - Estado del entregable o pasos pendientes si aplica.

## 7. Historial de Cambios y Estado Actual

### [2026-10-16] - Configuración de Entorno de Despliegue y CLIs (Node.js, Vercel y Supabase)
- **Módulos / Archivos:** Entorno local (`Node.js v24`, `npm v11`, `vercel v64`, `supabase v2.121`).
- **Descripción:** 
  - Instalación de Node.js LTS y npm para habilitar ejecución y dependencias del proyecto.
  - Instalación y verificación global de **Vercel CLI** y **Supabase CLI**.
  - Inicio del proceso de vinculación y autenticación de cuentas para despliegue y base de datos.

### [2026-10-16] - Inicialización de Control de Versiones (Git y GitHub)
- **Módulos / Archivos:** Repositorio Git local (`.git/`), `.gitignore`, identidad Git configurada.
- **Descripción:** 
  - Instalación de Git y GitHub CLI en el entorno.
  - Configuración global de identidad Git: `Jairo Carcamo` (`jairocarcamo@gmail.com`) y rama predeterminada `main`.
  - Inicialización del repositorio local y generación del commit inicial con los 90 archivos del proyecto.
  - Preparación de vinculación y push hacia GitHub.

### [2026-10-16] - Carga Inicial y Configuración de Bitácora
- **Módulos / Archivos:** Estructura completa del proyecto (`src/app/`, `src/modules/`, `supabase/`, `public/`).
- **Descripción:** 
  - Carga y verificación del repositorio con arquitectura modular: portal público (Dra. Yasmín Blanco), portal del paciente, panel administrativo/clínico (citas, pacientes, historias clínicas, inventario, personal, recordatorios, valoraciones, blog y patrocinadores).
  - Verificación del esquema de base de datos Supabase con RLS, triggers y migraciones.
  - Establecimiento de la regla de bitácora continua en `GEMINI.md` para persistencia de contexto entre estaciones de trabajo.


