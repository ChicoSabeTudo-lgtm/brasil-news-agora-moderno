import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Lista de domínios permitidos para CORS
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

// Rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
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
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Rate limiting
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
        'Retry-After': '60'
      }
    });
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

    const baseUrl = 'https://chicosabetudo.sigametech.com.br'
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