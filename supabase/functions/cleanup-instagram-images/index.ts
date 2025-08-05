import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Usar service role key para ter acesso total
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🧹 Iniciando limpeza de imagens do Instagram...')
    
    // Calcular data de 7 dias atrás
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    console.log(`📅 Buscando imagens anteriores a: ${sevenDaysAgo.toISOString()}`)

    // Buscar imagens mais antigas que 7 dias
    const { data: imagesToDelete, error: fetchError } = await supabase
      .from('instagram_images')
      .select('id, image_url')
      .lt('created_at', sevenDaysAgo.toISOString())

    if (fetchError) {
      console.error('❌ Erro ao buscar imagens:', fetchError)
      throw fetchError
    }

    if (!imagesToDelete || imagesToDelete.length === 0) {
      console.log('✅ Nenhuma imagem antiga encontrada para excluir')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma imagem para excluir',
          deletedCount: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`🗑️ Encontradas ${imagesToDelete.length} imagens para excluir`)

    let deletedFromStorage = 0
    let deletedFromDatabase = 0

    // Excluir arquivos do Storage
    for (const image of imagesToDelete) {
      try {
        // Extrair o nome do arquivo da URL
        const url = new URL(image.image_url)
        const pathParts = url.pathname.split('/')
        const fileName = pathParts[pathParts.length - 1]
        
        console.log(`🗂️ Excluindo arquivo: ${fileName}`)
        
        const { error: storageError } = await supabase.storage
          .from('news-images')
          .remove([fileName])

        if (storageError) {
          console.error(`❌ Erro ao excluir arquivo ${fileName}:`, storageError)
        } else {
          deletedFromStorage++
          console.log(`✅ Arquivo excluído: ${fileName}`)
        }
      } catch (error) {
        console.error(`❌ Erro ao processar arquivo da imagem ${image.id}:`, error)
      }
    }

    // Excluir registros da tabela
    const imageIds = imagesToDelete.map(img => img.id)
    const { error: deleteError } = await supabase
      .from('instagram_images')
      .delete()
      .in('id', imageIds)

    if (deleteError) {
      console.error('❌ Erro ao excluir registros da tabela:', deleteError)
      throw deleteError
    }

    deletedFromDatabase = imagesToDelete.length

    console.log(`✅ Limpeza concluída:`)
    console.log(`  - Arquivos excluídos do storage: ${deletedFromStorage}`)
    console.log(`  - Registros excluídos da tabela: ${deletedFromDatabase}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        deletedFromStorage,
        deletedFromDatabase,
        message: `Limpeza concluída: ${deletedFromDatabase} registros e ${deletedFromStorage} arquivos excluídos`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro na limpeza:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno na limpeza',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})