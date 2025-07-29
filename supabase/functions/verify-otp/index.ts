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
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, code }: VerifyOTPRequest = await req.json();
    
    console.log('Verifying OTP for email:', email, 'code:', code);

    // Clean up expired codes first
    await supabase.rpc('cleanup_expired_otp_codes');

    // Find valid OTP code
    const { data: otpData, error: otpError } = await supabase
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

    // Get user by email for sign in
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
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

    // Get the password from the OTP request (we need to store it)
    const { data: otpRecord } = await supabase
      .from('otp_codes')
      .select('user_password')
      .eq('user_email', email)
      .eq('code', code)
      .single();

    // Delete the used OTP code first
    await supabase
      .from('otp_codes')
      .delete()
      .eq('user_email', email)
      .eq('code', code);

    // Now sign in the user with their password to create a session
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: otpRecord?.user_password || ''
    });

    if (authError) {
      console.error('Failed to authenticate user:', authError);
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
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token
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