-- Add access control fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_approved boolean DEFAULT false,
ADD COLUMN access_revoked boolean DEFAULT false,
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN approved_by uuid,
ADD COLUMN revoked_at timestamp with time zone,
ADD COLUMN revoked_by uuid;

-- Update existing users to be approved by default (backward compatibility)
UPDATE public.profiles SET is_approved = true WHERE is_approved = false;

-- Create function to approve user access
CREATE OR REPLACE FUNCTION public.approve_user_access(target_user_id UUID, reason TEXT DEFAULT 'User access approved by admin')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Approve the user
  UPDATE public.profiles 
  SET 
    is_approved = true,
    access_revoked = false,
    approved_at = now(),
    approved_by = auth.uid(),
    revoked_at = null,
    revoked_by = null
  WHERE user_id = target_user_id;
  
  -- Log the approval
  INSERT INTO public.role_audit_log (
    user_id, 
    changed_by,
    reason
  ) VALUES (
    target_user_id,
    auth.uid(),
    reason
  );
  
  RETURN TRUE;
END;
$$;

-- Create function to revoke user access
CREATE OR REPLACE FUNCTION public.revoke_user_access(target_user_id UUID, reason TEXT DEFAULT 'User access revoked by admin')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Prevent admins from revoking their own access
  IF auth.uid() = target_user_id THEN
    RAISE EXCEPTION 'Cannot revoke your own access';
  END IF;
  
  -- Revoke the user access
  UPDATE public.profiles 
  SET 
    access_revoked = true,
    revoked_at = now(),
    revoked_by = auth.uid()
  WHERE user_id = target_user_id;
  
  -- Log the revocation
  INSERT INTO public.role_audit_log (
    user_id, 
    changed_by,
    reason
  ) VALUES (
    target_user_id,
    auth.uid(),
    reason
  );
  
  RETURN TRUE;
END;
$$;

-- Update RLS policies to consider approval status
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new policies that consider approval status
CREATE POLICY "Users can view their own profile if approved and not revoked"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND is_approved = true AND access_revoked = false);

CREATE POLICY "Users can update their own profile if approved and not revoked"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND is_approved = true AND access_revoked = false);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update user_roles policies to consider approval status
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles if approved and not revoked"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_approved = true 
    AND access_revoked = false
  )
);