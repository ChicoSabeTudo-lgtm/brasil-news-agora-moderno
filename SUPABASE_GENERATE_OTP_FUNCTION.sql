-- ============================================================================
-- FUNÇÃO SEGURA PARA GERAR E ARMAZENAR OTP
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_otp_code(
  p_email TEXT,
  p_code TEXT,
  p_expires_in_seconds INTEGER DEFAULT 300
)
RETURNS TABLE(otp_code TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expires_at TIMESTAMPTZ := now() + make_interval(secs => p_expires_in_seconds);
BEGIN
  -- Limpa códigos expirados
  PERFORM public.cleanup_expired_otp_codes();

  -- Remove códigos anteriores para o mesmo email
  DELETE FROM public.otp_codes
  WHERE user_email = p_email;

  -- Salva novo código
  INSERT INTO public.otp_codes (user_email, code, expires_at)
  VALUES (p_email, p_code, v_expires_at);

  RETURN QUERY SELECT p_code, v_expires_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_otp_code(TEXT, TEXT, INTEGER) TO authenticated;
