-- Get the current user ID and assign admin role
INSERT INTO user_roles (user_id, role)
SELECT auth.uid(), 'admin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
);

-- Also ensure the user is approved in profiles
UPDATE profiles 
SET is_approved = true, 
    access_revoked = false,
    approved_at = now()
WHERE user_id = auth.uid();