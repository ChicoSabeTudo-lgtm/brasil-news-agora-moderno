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

// Rate limiter - Previne spam de OTP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Máximo 5 OTPs por minuto
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

interface GenerateOTPRequest {
  email: string;
  password: string;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password }: GenerateOTPRequest = await req.json();
    
    // Rate limiting por email
    if (!checkRateLimit(email)) {
      console.warn('[SECURITY] OTP generation rate limit exceeded:', email);
      return new Response(
        JSON.stringify({ 
          error: 'Muitas solicitações. Aguarde 1 minuto.',
          retryAfter: 60 
        }),
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
    console.log('Generate OTP request received');
    
    // Create separate clients for different operations
    // supabaseAuth: for user authentication (uses anon key)
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    // supabaseAdmin: for otp_codes table operations (uses service role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, password }: GenerateOTPRequest = await req.json();
    
    console.log('Processing OTP request for email:', email);

    // First verify user credentials using auth client
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user's WhatsApp phone number from profile using admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('whatsapp_phone')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError || !profile?.whatsapp_phone) {
      console.error('WhatsApp phone not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'WhatsApp phone number not configured for this user' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    console.log('Generated OTP code:', otpCode, 'expires at:', expiresAt);

    // Clean up expired codes first using admin client
    await supabaseAdmin.rpc('cleanup_expired_otp_codes');

    // Delete any existing OTP codes for this email using admin client
    await supabaseAdmin
      .from('otp_codes')
      .delete()
      .eq('user_email', email);

    // Save OTP code to database using admin client
    const { error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .insert({
        user_email: email,
        code: otpCode,
        expires_at: expiresAt.toISOString(),
      });

    if (otpError) {
      console.error('Failed to save OTP code:', otpError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP code' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get webhook URL from site configurations using admin client
    const { data: config } = await supabaseAdmin
      .from('site_configurations')
      .select('otp_webhook_url')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (config?.otp_webhook_url) {
      // Send webhook to n8n
      const webhookPayload = {
        email,
        user_id: authData.user.id,
        whatsapp_phone: profile.whatsapp_phone,
        otp_code: otpCode,
        timestamp: new Date().toISOString(),
      };

      console.log('Sending webhook to n8n:', config.otp_webhook_url);
      
      try {
        const webhookResponse = await fetch(config.otp_webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        console.log('Webhook response status:', webhookResponse.status);
      } catch (webhookError) {
        console.error('Webhook failed:', webhookError);
        // Don't fail the OTP generation if webhook fails
      }
    } else {
      console.warn('No webhook URL configured');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP code generated and sent via WhatsApp',
        expires_in: 300 // 5 minutes in seconds
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-otp function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});