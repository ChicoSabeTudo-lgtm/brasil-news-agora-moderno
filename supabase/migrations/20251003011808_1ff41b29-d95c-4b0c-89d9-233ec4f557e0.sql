-- Criar o bucket company-documents se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-documents', 'company-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Atualizar a função de status para avisar apenas 2 dias antes
CREATE OR REPLACE FUNCTION public.update_certification_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update expired certifications
  UPDATE public.company_certifications
  SET status = 'expired'
  WHERE expiry_date < CURRENT_DATE
  AND status != 'expired';
  
  -- Update expiring soon (2 days or less)
  UPDATE public.company_certifications
  SET status = 'expiring_soon'
  WHERE expiry_date >= CURRENT_DATE
  AND expiry_date <= CURRENT_DATE + INTERVAL '2 days'
  AND status != 'expiring_soon';
  
  -- Update active certifications
  UPDATE public.company_certifications
  SET status = 'active'
  WHERE expiry_date > CURRENT_DATE + INTERVAL '2 days'
  AND status != 'active';
END;
$function$;