import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch published news
    const { data: news, error } = await supabaseClient
      .from('news')
      .select(`
        id,
        slug,
        title,
        published_at,
        updated_at,
        categories (slug)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error) {
      throw error
    }

    // Fetch categories
    const { data: categories } = await supabaseClient
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)

    const baseUrl = 'https://spgusjrjrhfychhdwixn.supabase.co'
    const currentDate = new Date().toISOString()

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Static pages -->
  <url>
    <loc>${baseUrl}/videos</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/ao-vivo</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/advertise</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`

    // Add category pages
    if (categories) {
      for (const category of categories) {
        sitemap += `
  <url>
    <loc>${baseUrl}/${category.slug}</loc>
    <lastmod>${category.updated_at}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
      }
    }

    // Add news articles
    if (news) {
      for (const article of news) {
        const categorySlug = article.categories?.slug || 'nacional'
        const publishDate = new Date(article.published_at)
        const isRecent = (Date.now() - publishDate.getTime()) < (7 * 24 * 60 * 60 * 1000) // 7 days
        
        sitemap += `
  <url>
    <loc>${baseUrl}/${categorySlug}/${article.slug}/${article.id}</loc>
    <lastmod>${article.updated_at}</lastmod>
    <changefreq>${isRecent ? 'daily' : 'weekly'}</changefreq>
    <priority>${isRecent ? '0.9' : '0.7'}</priority>`

        // Add Google News specific tags for recent articles
        if (isRecent) {
          sitemap += `
    <news:news>
      <news:publication>
        <news:name>Portal de Notícias</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${article.published_at}</news:publication_date>
      <news:title>${article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
    </news:news>`
        }
        
        sitemap += `
  </url>`
      }
    }

    sitemap += `
</urlset>`

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      },
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response('Error generating sitemap', {
      status: 500,
      headers: corsHeaders,
    })
  }
})