import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyOTPRequest {
  email: string;
  code: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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