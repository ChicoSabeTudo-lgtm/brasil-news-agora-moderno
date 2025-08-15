import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      social_scheduled_posts: {
        Row: {
          id: string;
          status: string;
          published_at: string | null;
          updated_at: string;
        };
      };
    };
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Starting cleanup of old social posts...');

    // Limpar posts publicados há mais de 48 horas
    const { data: publishedDeleted, error: publishedError } = await supabaseClient
      .from('social_scheduled_posts')
      .delete()
      .eq('status', 'published')
      .lt('published_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

    if (publishedError) {
      console.error('Error deleting published posts:', publishedError);
      throw publishedError;
    }

    // Limpar posts cancelados há mais de 48 horas
    const { data: cancelledDeleted, error: cancelledError } = await supabaseClient
      .from('social_scheduled_posts')
      .delete()
      .eq('status', 'cancelled')
      .lt('updated_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

    if (cancelledError) {
      console.error('Error deleting cancelled posts:', cancelledError);
      throw cancelledError;
    }

    // Limpar posts que falharam há mais de 48 horas
    const { data: failedDeleted, error: failedError } = await supabaseClient
      .from('social_scheduled_posts')
      .delete()
      .eq('status', 'failed')
      .lt('updated_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

    if (failedError) {
      console.error('Error deleting failed posts:', failedError);
      throw failedError;
    }

    const totalDeleted = (publishedDeleted?.length || 0) + (cancelledDeleted?.length || 0) + (failedDeleted?.length || 0);
    
    console.log(`Cleanup completed. Total posts deleted: ${totalDeleted}`);

    const response = {
      success: true,
      message: `Limpeza concluída. ${totalDeleted} posts removidos.`,
      deleted: {
        published: publishedDeleted?.length || 0,
        cancelled: cancelledDeleted?.length || 0,
        failed: failedDeleted?.length || 0,
        total: totalDeleted,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in cleanup function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});