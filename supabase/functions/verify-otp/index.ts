import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

// Rate limiter - RIGOROSO para prevenir brute force
const rateLimitMap = new Map<string, { count: number; resetTime: number; blocked: boolean }>();
const RATE_LIMIT_MAX = 10; // Apenas 10 tentativas
const RATE_LIMIT_WINDOW = 60000; // Por minuto
const BLOCK_DURATION = 300000; // 5 minutos de bloqueio após exceder

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Se está bloqueado
  if (entry?.blocked && now < entry.resetTime) {
    return { allowed: false, remaining: 0 };
  }

  // Reset se expirou
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW, blocked: false });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  // Incrementar contador
  if (entry.count < RATE_LIMIT_MAX) {
    entry.count++;
    return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
  }

  // Excedeu - bloquear por 5 minutos
  entry.blocked = true;
  entry.resetTime = now + BLOCK_DURATION;
  console.warn('[SECURITY] Rate limit exceeded, bloqueado por 5 min:', identifier);
  
  return { allowed: false, remaining: 0 };
}

interface VerifyOTPRequest {
  email: string;
  code: string;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyOTPRequest = await req.json();
    
    // Rate limiting por email (previne brute force de códigos)
    const rateLimitCheck = checkRateLimit(email);
    if (!rateLimitCheck.allowed) {
      console.warn('[SECURITY] OTP verification blocked:', email);
      return new Response(
        JSON.stringify({ 
          error: 'Muitas tentativas. Aguarde 5 minutos.',
          retryAfter: 300 
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '300'
          }
        }
      );
    }
    console.log('Verify OTP request received');
    
    // Create separate clients for different operations
    // supabaseAdmin: for otp_codes table operations (uses service role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, code }: VerifyOTPRequest = await req.json();
    
    console.log('Verifying OTP for email:', email, 'code:', code);

    // Clean up expired codes first using admin client
    await supabaseAdmin.rpc('cleanup_expired_otp_codes');

    // Find valid OTP code using admin client
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('user_email', email)
      .eq('code', code)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpData) {
      console.error('Invalid or expired OTP code:', otpError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP code' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user by email for sign in using admin client
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('Failed to get users:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error('User not found for email:', email);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('OTP verification successful for:', email);

    // Delete the used OTP code using admin client
    await supabaseAdmin
      .from('otp_codes')
      .delete()
      .eq('user_email', email)
      .eq('code', code);

    // Generate access tokens for the user using admin API
    const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/auth/v1/callback`
      }
    });

    if (tokenError || !tokenData) {
      console.error('Failed to generate tokens:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('User authenticated successfully:', email);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'OTP verified and user authenticated',
        session_url: tokenData.properties?.action_link
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in verify-otp function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});