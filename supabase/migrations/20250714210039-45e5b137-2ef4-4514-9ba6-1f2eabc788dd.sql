-- Fix critical role escalation vulnerability
-- Add additional RLS policy to prevent users from modifying their own roles

-- Create policy to prevent users from updating their own roles
CREATE POLICY "Users cannot modify their own roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (auth.uid() != user_id);

-- Create policy to prevent users from deleting their own roles
CREATE POLICY "Users cannot delete their own roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (auth.uid() != user_id);

-- Create audit log table for role changes
CREATE TABLE public.role_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_role app_role,
  new_role app_role,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log (only admins can view)
CREATE POLICY "Admins can view audit log"
ON public.role_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the role change
  INSERT INTO public.role_audit_log (
    user_id, 
    old_role, 
    new_role, 
    changed_by,
    reason
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    OLD.role,
    NEW.role,
    auth.uid(),
    'Role modified via admin panel'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change logging
CREATE TRIGGER role_change_audit_trigger
  AFTER UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- Create function to safely update user roles (server-side only)
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID,
  new_role app_role,
  reason TEXT DEFAULT 'Role updated by admin'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Prevent users from modifying their own roles
  IF auth.uid() = target_user_id THEN
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
    auth.uid(),
    reason
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to safely delete users (server-side only)
CREATE OR REPLACE FUNCTION public.delete_user_safe(
  target_user_id UUID,
  reason TEXT DEFAULT 'User deleted by admin'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Prevent users from deleting themselves
  IF auth.uid() = target_user_id THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;
  
  -- Log the deletion
  INSERT INTO public.role_audit_log (
    user_id, 
    old_role,
    changed_by,
    reason
  ) VALUES (
    target_user_id,
    (SELECT role FROM public.user_roles WHERE user_id = target_user_id LIMIT 1),
    auth.uid(),
    reason
  );
  
  -- Delete user data (this will cascade to user_roles due to FK constraint)
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;