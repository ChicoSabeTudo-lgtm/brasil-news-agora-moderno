-- Security Enhancement: Update all functions to include explicit search_path
-- This prevents potential schema-based attacks

CREATE OR REPLACE FUNCTION public.increment_video_views(video_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.videos 
  SET views = views + 1,
      updated_at = now()
  WHERE id = video_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.manage_featured_news()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  featured_count INTEGER;
BEGIN
  -- Se está marcando como destaque
  IF NEW.is_featured = true AND (OLD.is_featured IS NULL OR OLD.is_featured = false) THEN
    -- Contar quantos destaques já existem
    SELECT COUNT(*) INTO featured_count
    FROM public.news
    WHERE is_featured = true AND is_published = true AND id != NEW.id;
    
    -- Se já temos 3 destaques, remover o mais antigo
    IF featured_count >= 3 THEN
      UPDATE public.news
      SET is_featured = false, updated_at = now()
      WHERE is_featured = true 
        AND is_published = true 
        AND id != NEW.id
        AND published_at = (
          SELECT MIN(published_at)
          FROM public.news
          WHERE is_featured = true 
            AND is_published = true 
            AND id != NEW.id
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role app_role, reason text DEFAULT 'Role updated by admin'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.delete_user_safe(target_user_id uuid, reason text DEFAULT 'User deleted by admin'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.approve_user_access(target_user_id uuid, reason text DEFAULT 'User access approved by admin'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.revoke_user_access(target_user_id uuid, reason text DEFAULT 'User access revoked by admin'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );

  -- Assign default role as 'redator'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'redator');

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_slug(title text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to slug format
  base_slug := lower(regexp_replace(
    regexp_replace(
      regexp_replace(title, '[áàâãä]', 'a', 'g'),
      '[éèêë]', 'e', 'g'
    ),
    '[íìîï]', 'i', 'g'
  ));
  base_slug := regexp_replace(
    regexp_replace(base_slug, '[óòôõö]', 'o', 'g'),
    '[úùûü]', 'u', 'g'
  );
  base_slug := regexp_replace(base_slug, '[ç]', 'c', 'g');
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s]', '', 'g');
  base_slug := regexp_replace(trim(base_slug), '\s+', '-', 'g');
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment if necessary
  WHILE EXISTS (SELECT 1 FROM public.news WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_news_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.publish_scheduled_news()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.news 
  SET 
    is_published = true,
    published_at = now(),
    updated_at = now()
  WHERE 
    scheduled_publish_at IS NOT NULL 
    AND scheduled_publish_at <= now()
    AND is_published = false;
END;
$function$;