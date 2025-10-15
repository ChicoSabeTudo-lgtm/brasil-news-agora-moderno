-- ============================================================================
-- FUNÇÃO SEGURA PARA VERIFICAR ÓTP
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================================

CREATE OR REPLACE FUNCTION public.verify_otp_code(
  p_email TEXT,
  p_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  PERFORM public.cleanup_expired_otp_codes();

  SELECT TRUE
  INTO v_exists
  FROM public.otp_codes
  WHERE user_email = p_email
    AND code = p_code
    AND expires_at >= now()
  LIMIT 1;

  IF v_exists THEN
    DELETE FROM public.otp_codes
    WHERE user_email = p_email
      AND code = p_code;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_otp_code(TEXT, TEXT) TO authenticated;
