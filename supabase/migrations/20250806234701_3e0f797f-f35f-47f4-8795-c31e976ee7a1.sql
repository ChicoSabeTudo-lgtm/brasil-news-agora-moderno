-- Assign admin role to Francisco Alves (user already exists)
INSERT INTO user_roles (user_id, role)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure Francisco is approved and has access
UPDATE profiles 
SET is_approved = true, 
    access_revoked = false,
    approved_at = now()
WHERE user_id = '610e7321-e707-45c8-b48d-7c86f31f1750';