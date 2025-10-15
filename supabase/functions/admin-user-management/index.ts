import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

// CORS restrito
const ALLOWED_ORIGINS = [
  'https://chicosabetudo.sigametech.com.br',
  'http://localhost:8080',
  'http://localhost:5173'
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

// Rate limiter para admin
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count < RATE_LIMIT_MAX) {
    entry.count++;
    return true;
  }

  return false;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting por IP
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(clientIp)) {
    console.warn('[SECURITY] Admin function rate limit exceeded:', clientIp);
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      { 
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      }
    );
  }

  try {
    console.log('Admin user management function called');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the Authorization header
    const authHeader = req.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user's token
    const { data: user, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    console.log('User verification result:', { userId: user?.user?.id, hasError: !!authError });
    
    if (authError || !user) {
      console.log('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin role - use direct query instead of has_role function
    console.log('Checking admin role for user:', user.user.id);
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.user.id)
      .eq('role', 'admin')
      .single();

    console.log('Role check result:', { roleData, roleError });

    if (roleError && roleError.code !== 'PGRST116') {
      console.log('Database error checking role:', roleError);
      return new Response(JSON.stringify({ error: 'Database error checking permissions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!roleData) {
      console.log('Permission denied - not admin:', { userId: user.user.id });
      return new Response(JSON.stringify({ error: 'Insufficient permissions', details: { userId: user.user.id, hasRole: false } }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin access verified');

    const { action, ...body } = await req.json();

    switch (action) {
      case 'update_role':
        return await updateUserRole(supabase, user.user.id, body);
      case 'delete_user':
        return await deleteUser(supabase, user.user.id, body);
      case 'approve_user':
        return await approveUser(supabase, user.user.id, body);
      case 'revoke_user':
        return await revokeUser(supabase, user.user.id, body);
      case 'get_audit_log':
        return await getAuditLog(supabase);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in admin-user-management function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function updateUserRole(supabase: any, adminId: string, { target_user_id, new_role, reason }: any) {
  try {
    // Call the secure database function
    const { data, error } = await supabase.rpc('update_user_role', {
      target_user_id,
      new_role,
      admin_user_id: adminId,
      reason: reason || 'Role updated by admin'
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function deleteUser(supabase: any, adminId: string, { target_user_id, reason }: any) {
  try {
    // Call the secure database function
    const { data, error } = await supabase.rpc('delete_user_safe', {
      target_user_id,
      admin_user_id: adminId,
      reason: reason || 'User deleted by admin'
    });

    if (error) {
      throw error;
    }

    // Also delete from auth.users using admin client
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(target_user_id);
    if (authDeleteError) {
      console.error('Error deleting user from auth:', authDeleteError);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function approveUser(supabase: any, adminId: string, { target_user_id, reason }: any) {
  try {
    // Call the secure database function
    const { data, error } = await supabase.rpc('approve_user_access', {
      target_user_id,
      admin_user_id: adminId,
      reason: reason || 'User access approved by admin'
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error approving user:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function revokeUser(supabase: any, adminId: string, { target_user_id, reason }: any) {
  try {
    // Call the secure database function
    const { data, error } = await supabase.rpc('revoke_user_access', {
      target_user_id,
      admin_user_id: adminId,
      reason: reason || 'User access revoked by admin'
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error revoking user:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function getAuditLog(supabase: any) {
  try {
    const { data, error } = await supabase
      .from('role_audit_log')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}