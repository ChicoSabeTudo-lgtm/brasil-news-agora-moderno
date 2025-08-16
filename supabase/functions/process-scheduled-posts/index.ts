import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduledPost {
  id: string
  platform: string
  content: string
  image_url?: string
  scheduled_for: string
  news_id: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🚀 Processing scheduled social posts...')

    // Buscar posts agendados que estão prontos para publicar
    const { data: posts, error: fetchError } = await supabaseClient
      .from('social_scheduled_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())

    if (fetchError) {
      console.error('❌ Error fetching scheduled posts:', fetchError)
      throw fetchError
    }

    console.log(`📊 Found ${posts?.length || 0} posts ready to publish`)

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No posts ready to publish', processed: 0 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    let successCount = 0
    let errorCount = 0

    // Processar cada post
    for (const post of posts as ScheduledPost[]) {
      try {
        console.log(`📤 Processing post ${post.id} for ${post.platform}`)

        // Buscar configuração do webhook social
        const { data: config } = await supabaseClient
          .from('site_configurations')
          .select('social_webhook_url')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (config?.social_webhook_url) {
          // Enviar para webhook externo
          const webhookData = {
            type: 'scheduled_publish',
            post_id: post.id,
            platform: post.platform,
            content: post.content,
            image_url: post.image_url,
            news_id: post.news_id,
            timestamp: new Date().toISOString()
          }

          console.log(`🔗 Sending to webhook: ${config.social_webhook_url}`)
          
          const webhookResponse = await fetch(config.social_webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
          })

          if (webhookResponse.ok) {
            console.log(`✅ Webhook call successful for post ${post.id}`)
            
            // Atualizar status para published
            const { error: updateError } = await supabaseClient
              .from('social_scheduled_posts')
              .update({
                status: 'published',
                published_at: new Date().toISOString(),
                error_message: null
              })
              .eq('id', post.id)

            if (updateError) {
              console.error(`❌ Error updating post ${post.id}:`, updateError)
              errorCount++
            } else {
              console.log(`📝 Post ${post.id} marked as published`)
              successCount++
            }
          } else {
            console.error(`❌ Webhook failed for post ${post.id}:`, await webhookResponse.text())
            
            // Marcar como falhou
            await supabaseClient
              .from('social_scheduled_posts')
              .update({
                status: 'failed',
                error_message: `Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`
              })
              .eq('id', post.id)
            
            errorCount++
          }
        } else {
          console.log(`⚠️ No webhook configured, marking post ${post.id} as published anyway`)
          
          // Se não há webhook, apenas marcar como publicado
          const { error: updateError } = await supabaseClient
            .from('social_scheduled_posts')
            .update({
              status: 'published',
              published_at: new Date().toISOString(),
              error_message: null
            })
            .eq('id', post.id)

          if (updateError) {
            console.error(`❌ Error updating post ${post.id}:`, updateError)
            errorCount++
          } else {
            successCount++
          }
        }

      } catch (error) {
        console.error(`❌ Error processing post ${post.id}:`, error)
        
        // Marcar como falhou
        await supabaseClient
          .from('social_scheduled_posts')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', post.id)
        
        errorCount++
      }
    }

    console.log(`📊 Processing complete: ${successCount} successful, ${errorCount} failed`)

    return new Response(
      JSON.stringify({
        message: 'Scheduled posts processed',
        processed: posts.length,
        successful: successCount,
        failed: errorCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in process-scheduled-posts:', error)
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})