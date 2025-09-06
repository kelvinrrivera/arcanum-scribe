import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  structuredData?: object;
}

const DEFAULT_SEO = {
  title: 'Arcanum Scribe - AI-Powered D&D Adventure Generator (Beta)',
  description: 'Create immersive D&D adventures with AI assistance. Currently in closed beta - join the waitlist for early access to our magical adventure generation tools.',
  keywords: [
    'D&D adventure generator',
    'AI dungeon master',
    'tabletop RPG tools',
    'D&D campaign creator',
    'RPG adventure builder',
    'beta access',
    'early access'
  ],
  image: '/images/og-image.jpg',
  url: 'https://arcanumscribe.com',
  type: 'website' as const,
};

export function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false,
  structuredData,
}: SEOProps) {
  const seo = {
    title: title ? `${title} | Arcanum Scribe` : DEFAULT_SEO.title,
    description: description || DEFAULT_SEO.description,
    keywords: keywords || DEFAULT_SEO.keywords,
    image: image || DEFAULT_SEO.image,
    url: url || DEFAULT_SEO.url,
    type,
  };

  // Ensure absolute URL for image
  const absoluteImage = seo.image.startsWith('http') 
    ? seo.image 
    : `${seo.url}${seo.image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(', ')} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={seo.url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={seo.type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content="Arcanum Scribe" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={absoluteImage} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="Arcanum Scribe Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#0f172a" />
      
      {/* Performance and Security */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Language and Locale */}
      <meta httpEquiv="Content-Language" content="en-US" />
      <meta property="og:locale" content="en_US" />
      
      {/* Beta Status Indicators */}
      <meta name="application-name" content="Arcanum Scribe Beta" />
      <meta name="msapplication-TileColor" content="#0f172a" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Predefined SEO configurations for different pages
export const SEO_CONFIGS = {
  home: {
    title: 'AI-Powered D&D Adventure Generator',
    description: 'Create immersive D&D adventures with AI assistance. Currently in closed beta - join the waitlist for early access to our magical adventure generation tools.',
    keywords: [
      'D&D adventure generator',
      'AI dungeon master',
      'tabletop RPG tools',
      'D&D campaign creator',
      'RPG adventure builder',
      'beta access'
    ],
  },
  
  features: {
    title: 'Features - AI Adventure Generation Tools',
    description: 'Discover the powerful features of Arcanum Scribe in development: AI-powered adventure generation, NPC creation, and campaign management tools. Beta access available.',
    keywords: [
      'D&D features',
      'AI adventure tools',
      'RPG generator features',
      'beta features',
      'coming soon'
    ],
  },
  
  pricing: {
    title: 'Pricing - Beta Access Plans',
    description: 'Explore our beta pricing plans for early access to Arcanum Scribe. Join the closed beta and help shape the future of AI-powered D&D adventure generation.',
    keywords: [
      'D&D tool pricing',
      'beta pricing',
      'early access',
      'RPG tool subscription',
      'beta plans'
    ],
  },
  
  waitlist: {
    title: 'Join Beta Waitlist - Early Access',
    description: 'Join the Arcanum Scribe beta waitlist for early access to our AI-powered D&D adventure generator. Be among the first to experience the future of tabletop RPG tools.',
    keywords: [
      'beta waitlist',
      'early access',
      'D&D beta',
      'RPG tools beta',
      'closed beta signup'
    ],
  },
  
  testimonials: {
    title: 'Beta Community - Early User Experiences',
    description: 'Hear from early beta testers about their experience with Arcanum Scribe. Join our growing community of Game Masters exploring AI-powered adventure creation.',
    keywords: [
      'beta testimonials',
      'user experiences',
      'D&D community',
      'beta feedback',
      'early adopters'
    ],
  },
  
  about: {
    title: 'About - AI-Powered D&D Tools in Development',
    description: 'Learn about Arcanum Scribe\'s mission to revolutionize tabletop RPG creation with AI. Currently in beta development with a focus on authentic D&D experiences.',
    keywords: [
      'about arcanum scribe',
      'AI D&D tools',
      'beta development',
      'RPG innovation',
      'tabletop technology'
    ],
  },
} as const;