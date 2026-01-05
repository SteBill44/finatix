import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DOMAIN = 'https://finaptics.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all courses
    const { data: courses, error } = await supabase
      .from('courses')
      .select('slug, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
      throw error
    }

    // Static pages with their priorities and change frequencies
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
      { path: '/courses', priority: '0.9', changefreq: 'weekly' },
      { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
      { path: '/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/contact', priority: '0.6', changefreq: 'monthly' },
      { path: '/auth', priority: '0.5', changefreq: 'monthly' },
      { path: '/discussions', priority: '0.7', changefreq: 'daily' },
    ]

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${DOMAIN}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // Add course pages dynamically
    if (courses && courses.length > 0) {
      for (const course of courses) {
        const lastmod = course.updated_at 
          ? new Date(course.updated_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
        
        xml += `  <url>
    <loc>${DOMAIN}/courses/${course.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
      }
    }

    xml += `</urlset>`

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
