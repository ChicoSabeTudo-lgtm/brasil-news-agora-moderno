-- Função para garantir que o usuário tenha profile e telefone configurados
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id uuid,
  p_full_name text DEFAULT NULL,
  p_whatsapp_phone text DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  normalized_full_name text;
  normalized_whatsapp text;
  result_record public.profiles;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Você não tem permissão para atualizar este perfil.';
  END IF;

  normalized_full_name := NULLIF(trim(COALESCE(p_full_name, '')), '');
  IF normalized_full_name IS NULL THEN
    SELECT email INTO normalized_full_name FROM auth.users WHERE id = p_user_id;
  END IF;

  normalized_whatsapp := NULLIF(trim(COALESCE(p_whatsapp_phone, '')), '');
  IF normalized_whatsapp IS NOT NULL THEN
    normalized_whatsapp := regexp_replace(normalized_whatsapp, '[^0-9+]', '', 'g');

    IF normalized_whatsapp ~ '^\+[0-9]{10,15}$' THEN
      -- já está em formato internacional
      NULL;
    ELSIF normalized_whatsapp ~ '^55[0-9]{11}$' THEN
      normalized_whatsapp := '+' || normalized_whatsapp;
    ELSIF normalized_whatsapp ~ '^[0-9]{11}$' THEN
      normalized_whatsapp := '+55' || normalized_whatsapp;
    ELSIF normalized_whatsapp ~ '^[0-9]{12,14}$' THEN
      normalized_whatsapp := '+' || normalized_whatsapp;
    END IF;
  END IF;

  INSERT INTO public.profiles (
    user_id,
    full_name,
    whatsapp_phone,
    is_approved,
    access_revoked
  ) VALUES (
    p_user_id,
    normalized_full_name,
    normalized_whatsapp,
    true,
    false
  )
  ON CONFLICT (user_id) DO UPDATE
    SET
      full_name = COALESCE(normalized_full_name, public.profiles.full_name),
      whatsapp_phone = COALESCE(normalized_whatsapp, public.profiles.whatsapp_phone),
      is_approved = true,
      access_revoked = false,
      updated_at = now()
  RETURNING * INTO result_record;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'redator')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN result_record;
END;
$$;

