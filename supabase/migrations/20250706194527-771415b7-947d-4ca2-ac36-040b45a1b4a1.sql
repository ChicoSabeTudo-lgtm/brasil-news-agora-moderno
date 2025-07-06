-- Update user role for chicop7@gmail.com to admin
UPDATE public.user_roles 
SET role = 'admin'::app_role
WHERE user_id = '610e7321-e707-45c8-b48d-7c86f31f1750';