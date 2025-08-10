-- Ensure whatsapp_phone field exists on profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;

-- Update handle_new_user to also save whatsapp_phone from user metadata and keep default role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, whatsapp_phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'whatsapp_phone', '')), '')
  );

  -- Assign default role as 'redator' (idempotent)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'redator')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;