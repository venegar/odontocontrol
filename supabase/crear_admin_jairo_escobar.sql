-- ==============================================================================
-- CREACIÓN DE USUARIO ADMINISTRADOR: JAIRO ESCOBAR
-- Consultorio Odontológico Dra. Yasmín Blanco (OdontoControl)
-- ==============================================================================

-- 1. Habilitar extensión pgcrypto para encriptación segura bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'jairo.escobar@odontocontrol.com'; -- Puedes cambiar este correo por el que prefieras
  v_password text := '7574242Jc';
BEGIN
  -- Verificar si el usuario ya existe en auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      timezone('utc'::text, now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nombres":"Jairo","apellidos":"Escobar","rol":"admin"}'::jsonb,
      timezone('utc'::text, now()),
      timezone('utc'::text, now()),
      '',
      '',
      '',
      ''
    );
  ELSE
    -- Si ya existe, actualizamos su contraseña y metadata
    UPDATE auth.users
    SET encrypted_password = crypt(v_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, timezone('utc'::text, now())),
        raw_user_meta_data = '{"nombres":"Jairo","apellidos":"Escobar","rol":"admin"}'::jsonb,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_user_id;
  END IF;

  -- 2. Crear o actualizar perfil en public.perfiles con ROL ADMINISTRADOR
  INSERT INTO public.perfiles (
    id,
    nombres,
    apellidos,
    rol,
    activo,
    creado_en,
    actualizado_en
  ) VALUES (
    v_user_id,
    'Jairo',
    'Escobar',
    'admin',
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE
  SET rol = 'admin',
      nombres = 'Jairo',
      apellidos = 'Escobar',
      activo = true,
      actualizado_en = timezone('utc'::text, now());

  -- 3. Asignar todos los permisos del sistema en public.permisos_usuario
  INSERT INTO public.permisos_usuario (usuario_id, permiso)
  VALUES 
    (v_user_id, 'citas.ver'),
    (v_user_id, 'citas.crear'),
    (v_user_id, 'citas.aprobar'),
    (v_user_id, 'pacientes.ver'),
    (v_user_id, 'pacientes.crear'),
    (v_user_id, 'pacientes.editar'),
    (v_user_id, 'historias.ver'),
    (v_user_id, 'historias.crear'),
    (v_user_id, 'personal.ver'),
    (v_user_id, 'personal.gestionar'),
    (v_user_id, 'recordatorios.gestionar'),
    (v_user_id, 'reportes.ver')
  ON CONFLICT (usuario_id, permiso) DO NOTHING;

  RAISE NOTICE 'Usuario Administrador Jairo Escobar creado exitosamente con ID %', v_user_id;
END $$;
