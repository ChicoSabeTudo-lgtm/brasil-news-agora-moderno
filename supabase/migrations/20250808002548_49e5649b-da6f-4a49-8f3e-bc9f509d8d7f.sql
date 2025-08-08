-- Ensure only the correct update_user_role function exists and works with admin_user_id
-- Drop any older variants first (if they exist)
DROP FUNCTION IF EXISTS public.update_user_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.update_user_role(uuid, app_role, text);

-- Recreate the secure function with explicit admin_user_id argument
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id uuid,
  new_role app_role,
  admin_user_id uuid,
  reason text DEFAULT 'Role updated by admin'
)
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
  
  -- Update the role for the target user
  UPDATE public.user_roles 
  SET role = new_role,
      created_at = created_at -- no-op to avoid warning, keeps updated_at triggers if any
  WHERE user_id = target_user_id;
  
  -- If no row was updated (user has no role yet), insert it
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, new_role);
  END IF;
  
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