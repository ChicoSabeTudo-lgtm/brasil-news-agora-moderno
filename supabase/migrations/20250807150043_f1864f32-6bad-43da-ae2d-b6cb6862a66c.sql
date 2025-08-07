-- Remove the old version of update_user_role function that uses auth.uid()
-- and ensure we only have the correct one that accepts admin_user_id parameter

DROP FUNCTION IF EXISTS public.update_user_role(uuid, app_role, text);

-- Recreate the correct function with admin_user_id parameter
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role app_role, admin_user_id uuid, reason text DEFAULT 'Role updated by admin'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Check if the admin user has admin role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = admin_user_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Prevent users from modifying their own roles
  IF admin_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot modify your own role';
  END IF;
  
  -- Update the role
  UPDATE public.user_roles 
  SET role = new_role
  WHERE user_id = target_user_id;
  
  -- Log the change with custom reason
  INSERT INTO public.role_audit_log (
    user_id, 
    new_role, 
    changed_by,
    reason
  ) VALUES (
    target_user_id,
    new_role,
    admin_user_id,
    reason
  );
  
  RETURN TRUE;
END;
$function$;