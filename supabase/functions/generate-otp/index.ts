import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateOTPRequest {
  email: string;
  password: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generate OTP request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, password }: GenerateOTPRequest = await req.json();
    
    console.log('Processing OTP request for email:', email);

    // First verify user credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
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

    // Get user's WhatsApp phone number from profile
    const { data: profile, error: profileError } = await supabase
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

    // Clean up expired codes first
    await supabase.rpc('cleanup_expired_otp_codes');

    // Delete any existing OTP codes for this email
    await supabase
      .from('otp_codes')
      .delete()
      .eq('user_email', email);

    // Save OTP code to database
    const { error: otpError } = await supabase
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

    // Get webhook URL from site configurations
    const { data: config } = await supabase
      .from('site_configurations')
      .select('webhook_url')
      .limit(1)
      .single();

    if (config?.webhook_url) {
      // Send webhook to n8n
      const webhookPayload = {
        email,
        user_id: authData.user.id,
        whatsapp_phone: profile.whatsapp_phone,
        otp_code: otpCode,
        timestamp: new Date().toISOString(),
      };

      console.log('Sending webhook to n8n:', config.webhook_url);
      
      try {
        const webhookResponse = await fetch(config.webhook_url, {
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