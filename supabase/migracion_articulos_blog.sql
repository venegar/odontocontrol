-- ==============================================================================
-- MIGRACIÓN: MÓDULO DE BLOG Y GESTIÓN DE CONTENIDOS EDUCATIVOS
-- Consultorio Odontológico Virtual (DentisCare)
-- ==============================================================================

-- 1. TABLA: ARTÍCULOS DE BLOG
-- ------------------------------------------------------------------------------
create table if not exists public.articulos_blog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  extracto text not null,
  contenido text not null,
  categoria text not null default 'Salud General',
  autor text not null default 'Dra. Yasmín Blanco',
  autor_id uuid references public.perfiles(id) on delete set null,
  imagen_url text,
  publicado boolean not null default true,
  destacado boolean not null default false,
  tiempo_lectura text default '5 min',
  creado_en timestamptz default timezone('utc'::text, now()) not null,
  actualizado_en timestamptz default timezone('utc'::text, now()) not null
);

-- Índices para búsqueda rápida y ordenamiento
create index if not exists idx_articulos_blog_slug on public.articulos_blog (slug);
create index if not exists idx_articulos_blog_publicado on public.articulos_blog (publicado);
create index if not exists idx_articulos_blog_categoria on public.articulos_blog (categoria);
create index if not exists idx_articulos_blog_creado_en on public.articulos_blog (creado_en desc);

-- 2. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
alter table public.articulos_blog enable row level security;

-- Política 1: Lectura pública de artículos publicados
drop policy if exists "Artículos publicados son visibles públicamente" on public.articulos_blog;
create policy "Artículos publicados son visibles públicamente"
  on public.articulos_blog for select
  to anon, authenticated
  using (publicado = true);

-- Política 2: El personal autorizado puede ver todos los artículos (incluyendo borradores)
drop policy if exists "Personal autorizado puede ver todos los artículos" on public.articulos_blog;
create policy "Personal autorizado puede ver todos los artículos"
  on public.articulos_blog for select
  to authenticated
  using (
    public.tiene_permiso('blog.ver') or 
    public.obtener_rol_actual() in ('admin', 'odontologo', 'recepcionista')
  );

-- Política 3: Personal autorizado puede crear artículos
drop policy if exists "Personal autorizado puede crear artículos" on public.articulos_blog;
create policy "Personal autorizado puede crear artículos"
  on public.articulos_blog for insert
  to authenticated
  with check (
    public.tiene_permiso('blog.crear') or 
    public.obtener_rol_actual() in ('admin', 'odontologo')
  );

-- Política 4: Personal autorizado puede editar artículos
drop policy if exists "Personal autorizado puede editar artículos" on public.articulos_blog;
create policy "Personal autorizado puede editar artículos"
  on public.articulos_blog for update
  to authenticated
  using (
    public.tiene_permiso('blog.editar') or 
    public.obtener_rol_actual() in ('admin', 'odontologo')
  );

-- Política 5: Solo administradores o personal facultado pueden eliminar artículos
drop policy if exists "Personal autorizado puede eliminar artículos" on public.articulos_blog;
create policy "Personal autorizado puede eliminar artículos"
  on public.articulos_blog for delete
  to authenticated
  using (
    public.tiene_permiso('blog.eliminar') or 
    public.obtener_rol_actual() = 'admin'
  );

-- 3. PERMISOS DE ACCESO DIRECTO
-- ------------------------------------------------------------------------------
grant select on public.articulos_blog to anon, authenticated;
grant insert, update, delete on public.articulos_blog to authenticated, service_role;

-- 4. ARTÍCULOS INICIALES (SEED EDUCATIVO)
-- ------------------------------------------------------------------------------
insert into public.articulos_blog (
  slug, 
  titulo, 
  extracto, 
  contenido, 
  categoria, 
  autor, 
  publicado, 
  destacado, 
  tiempo_lectura
)
values 
  (
    'como-cuidar-el-esmalte-dental',
    '5 consejos prácticos para cuidar y proteger el esmalte dental',
    'El esmalte es la capa protectora externa de tus dientes. Descubre cómo mantenerlo fuerte frente al desgaste diario y los ácidos de las comidas.',
    'El esmalte dental es la sustancia más dura del cuerpo humano, pero una vez que se desgasta, no puede regenerarse de forma natural. Para preservarlo adecuadamente: 1) Cepíllate con cerdas suaves para no generar abrasión mecánica. 2) Espera al menos 30 minutos tras ingerir cítricos o refrescos antes de cepillarte. 3) Usa pasta con flúor o hidroxiapatita para remineralizar. 4) Mantén una adecuada hidratación salival. 5) Consulta a tu odontólogo para férulas nocturnas si padeces bruxismo.',
    'Higiene',
    'Dra. Yasmín Blanco',
    true,
    true,
    '4 min'
  ),
  (
    'mitos-comunes-sobre-la-ortodoncia',
    'Mitos y realidades sobre los tratamientos de ortodoncia invisible',
    '¿Duele ponerse alineadores transparentes? ¿A qué edad se recomienda? Respondemos las dudas más frecuentes sobre la alineación digital sin brackets metálicos.',
    'La ortodoncia con alineadores invisibles ha revolucionado la estética y comodidad dental. A diferencia de los brackets tradicionales: no interfieren con la masticación ni provocan llagas por alambres desajustados. Los dientes se mueven mediante fuerzas controladas y microplanificadas digitalmente. Requieren un uso disciplinado de 22 horas al día para obtener los resultados estipulados en el estudio 3D.',
    'Ortodoncia',
    'Dra. Laura Vega',
    true,
    false,
    '5 min'
  ),
  (
    'importancia-de-la-limpieza-dental-periodica',
    '¿Por qué debes realizarte una profilaxis dental cada 6 meses?',
    'Incluso con un cepillado riguroso, el sarro acumulado requiere atención profesional con ultrasonido para prevenir gingivitis y pérdida ósea.',
    'El cálculo o sarro dental es placa bacteriana endurecida que no se retira con el cepillo común ni con hilo dental. La limpieza periódica con tecnología de ultrasonido y micropartículas Airflow elimina las colonias bacterianas subgingivales, previene el mal aliento (halitosis) y reduce a cero el riesgo de periodontitis severa.',
    'Salud General',
    'Dra. Yasmín Blanco',
    true,
    false,
    '3 min'
  ),
  (
    'implantes-dentales-carga-inmediata',
    'Implantes Dentales de Carga Inmediata: Sonríe con confianza en un solo día',
    'Conoce la tecnología que permite colocar el implante y una corona provisional estética en una sola sesión clínica.',
    'La técnica de carga inmediata es idónea para pacientes que desean recuperar su sonrisa sin esperar meses desdentados. Gracias a la tomografía computarizada 3D y la cirugía guiada por ordenador, el implante de titanio de alta biocompatibilidad se ancla firmemente en el hueso, permitiendo fijar una corona funcional desde el primer día.',
    'Implantes',
    'Dra. Yasmín Blanco',
    true,
    true,
    '6 min'
  )
on conflict (slug) do nothing;
