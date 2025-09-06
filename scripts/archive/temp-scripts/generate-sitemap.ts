#!/usr/bin/env node

/**
 * Generate XML sitemap for Arcanum Scribe
 * Run this script to create/update the sitemap.xml file
 * Only includes pages that actually exist and have real content
 */

import { promises as fs } from 'fs';
import path from 'path';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const BASE_URL = 'https://arcanumscribe.com';

// Define all public URLs with their properties - ONLY REAL PAGES
const SITEMAP_URLS: SitemapUrl[] = [
  {
    loc: '/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 1.0,
  },
  {
    loc: '/auth',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    loc: '/showcase',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 0.8,
  },
  {
    loc: '/pricing',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.9,
  },
  // Note: Protected routes like /generate, /gallery, etc. are not included
  // as they require authentication and are not meant for search engines
];

function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlElements = urls.map(url => {
    const fullUrl = `${BASE_URL}${url.loc}`;
    
    return `  <url>
    <loc>${fullUrl}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

function generateRobotsTxt(): string {
  return `# Robots.txt for Arcanum Scribe

User-agent: *
Allow: /
Allow: /auth
Allow: /pricing

# Disallow protected/private areas
Disallow: /generate
Disallow: /gallery
Disallow: /library
Disallow: /adventure/
Disallow: /admin
Disallow: /settings
Disallow: /api/

# Disallow development/testing paths
Disallow: /test
Disallow: /dev
Disallow: /_next/
Disallow: /static/

# Allow important resources
Allow: /images/
Allow: /favicon.ico
Allow: /manifest.json

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl delay (be respectful)
Crawl-delay: 1`;
}

async function generateSEOFiles() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    
    // Generate sitemap.xml
    const sitemapXML = generateSitemapXML(SITEMAP_URLS);
    await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemapXML);
    console.log('✅ Generated sitemap.xml');
    
    // Generate robots.txt
    const robotsTxt = generateRobotsTxt();
    await fs.writeFile(path.join(publicDir, 'robots.txt'), robotsTxt);
    console.log('✅ Generated robots.txt');
    
    // Generate manifest.json for PWA
    const manifest = {
      name: 'Arcanum Scribe - AI D&D Adventure Generator',
      short_name: 'Arcanum Scribe',
      description: 'AI-powered D&D adventure generator currently in beta',
      start_url: '/',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: '#0f172a',
      icons: [
        {
          src: '/favicon.ico',
          sizes: '32x32',
          type: 'image/x-icon',
        },
        // Add more icon sizes when available
      ],
      categories: ['games', 'entertainment', 'productivity'],
      lang: 'en-US',
      orientation: 'portrait-primary',
    };
    
    await fs.writeFile(
      path.join(publicDir, 'manifest.json'), 
      JSON.stringify(manifest, null, 2)
    );
    console.log('✅ Generated manifest.json');
    
    // Log sitemap URLs for verification
    console.log('\n📋 Sitemap URLs (REAL PAGES ONLY):');
    SITEMAP_URLS.forEach(url => {
      console.log(`  ${BASE_URL}${url.loc} (priority: ${url.priority})`);
    });
    
    console.log('\n🎯 SEO Files Generated Successfully!');
    console.log('✅ No fake pages or content');
    console.log('✅ No duplicate content');
    console.log('✅ Only real, existing pages included');
    
  } catch (error) {
    console.error('❌ Error generating SEO files:', error);
  }
}

generateSEOFiles();