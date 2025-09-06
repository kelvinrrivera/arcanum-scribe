// Structured data schemas for SEO with authentic beta messaging

interface Organization {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  logo: string;
  foundingDate: string;
  sameAs: string[];
}

interface SoftwareApplication {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    '@type': string;
    availability: string;
    price: string;
    priceCurrency: string;
    description: string;
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: string;
    ratingCount: string;
    bestRating: string;
    worstRating: string;
  };
  author: {
    '@type': string;
    name: string;
  };
  datePublished: string;
  inLanguage: string;
  isAccessibleForFree: boolean;
}

interface WebSite {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

interface BreadcrumbList {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

// Organization schema - authentic information
export function createOrganizationSchema(): Organization {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Arcanum Scribe',
    description: 'AI-powered tabletop RPG adventure generation tools currently in beta development.',
    url: 'https://arcanumscribe.com',
    logo: 'https://arcanumscribe.com/images/logo.png',
    foundingDate: '2024',
    sameAs: [
      // Add actual social media URLs when available
    ],
  };
}

// Software application schema - honest beta status
export function createSoftwareApplicationSchema(): SoftwareApplication {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Arcanum Scribe',
    description: 'AI-powered D&D adventure generator currently in closed beta. Create immersive tabletop RPG adventures with artificial intelligence assistance.',
    url: 'https://arcanumscribe.com',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/PreOrder', // Indicates beta/pre-release status
      price: '0',
      priceCurrency: 'USD',
      description: 'Currently available through closed beta waitlist. Pricing to be announced.',
    },
    // No fake ratings - remove aggregateRating until we have real data
    author: {
      '@type': 'Organization',
      name: 'Arcanum Scribe Team',
    },
    datePublished: '2024-12-01', // Adjust to actual beta launch date
    inLanguage: 'en-US',
    isAccessibleForFree: true, // Beta is free
  };
}

// Website schema
export function createWebSiteSchema(): WebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Arcanum Scribe',
    description: 'AI-powered D&D adventure generator in beta development',
    url: 'https://arcanumscribe.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://arcanumscribe.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

// Breadcrumb schema generator
export function createBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): BreadcrumbList {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

// FAQ schema for beta information
export function createBetaFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Arcanum Scribe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Arcanum Scribe is an AI-powered tool for creating D&D adventures, currently in closed beta development. It helps Game Masters generate immersive tabletop RPG content using artificial intelligence.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Arcanum Scribe available now?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Arcanum Scribe is currently in closed beta. You can join our waitlist to be notified when beta access becomes available.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does Arcanum Scribe cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Beta access is currently free. Pricing for the full release will be announced as we approach launch.',
        },
      },
      {
        '@type': 'Question',
        name: 'What features are included in the beta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The beta includes core adventure generation features, NPC creation, and basic campaign management tools. Features are being actively developed and expanded.',
        },
      },
    ],
  };
}

// Product schema for beta software
export function createBetaProductSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Arcanum Scribe Beta',
    description: 'AI-powered D&D adventure generator in closed beta development',
    category: 'Software',
    brand: {
      '@type': 'Brand',
      name: 'Arcanum Scribe',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/PreOrder',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free beta access through waitlist signup',
      validFrom: '2024-12-01',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Tabletop RPG Players and Game Masters',
    },
  };
}

// Beta announcement schema
export function createBetaAnnouncementSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Arcanum Scribe Beta - AI-Powered D&D Adventure Generator',
    description: 'Announcing the closed beta of Arcanum Scribe, an innovative AI-powered tool for creating immersive D&D adventures and tabletop RPG content.',
    author: {
      '@type': 'Organization',
      name: 'Arcanum Scribe Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Arcanum Scribe',
      logo: {
        '@type': 'ImageObject',
        url: 'https://arcanumscribe.com/images/logo.png',
      },
    },
    datePublished: '2024-12-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://arcanumscribe.com',
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://arcanumscribe.com/images/og-image.jpg',
      width: 1200,
      height: 630,
    },
    articleSection: 'Technology',
    keywords: 'AI, D&D, RPG, beta, adventure generator, tabletop gaming',
  };
}

// Service schema for beta offering
export function createBetaServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Arcanum Scribe Beta Access',
    description: 'Early access to AI-powered D&D adventure generation tools through our closed beta program.',
    provider: {
      '@type': 'Organization',
      name: 'Arcanum Scribe',
    },
    serviceType: 'Software Beta Testing',
    areaServed: 'Worldwide',
    availableLanguage: 'English',
    isRelatedTo: {
      '@type': 'SoftwareApplication',
      name: 'Arcanum Scribe',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/LimitedAvailability',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free beta access through waitlist invitation',
    },
  };
}

// Combined structured data for landing page
export function createLandingPageStructuredData() {
  return [
    createOrganizationSchema(),
    createWebSiteSchema(),
    createSoftwareApplicationSchema(),
    createBetaFAQSchema(),
    createBetaAnnouncementSchema(),
    createBetaServiceSchema(),
  ];
}

// Page-specific structured data generators
export const STRUCTURED_DATA = {
  home: () => createLandingPageStructuredData(),
  
  features: () => [
    createOrganizationSchema(),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://arcanumscribe.com' },
      { name: 'Features', url: 'https://arcanumscribe.com/features' },
    ]),
  ],
  
  pricing: () => [
    createOrganizationSchema(),
    createBetaProductSchema(),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://arcanumscribe.com' },
      { name: 'Pricing', url: 'https://arcanumscribe.com/pricing' },
    ]),
  ],
  
  roadmap: () => [
    createOrganizationSchema(),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://arcanumscribe.com' },
      { name: 'Roadmap', url: 'https://arcanumscribe.com/roadmap' },
    ]),
  ],
  
  showcase: () => [
    createOrganizationSchema(),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://arcanumscribe.com' },
      { name: 'Showcase', url: 'https://arcanumscribe.com/showcase' },
    ]),
  ],
  
  waitlist: () => [
    createOrganizationSchema(),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://arcanumscribe.com' },
      { name: 'Beta Waitlist', url: 'https://arcanumscribe.com/waitlist' },
    ]),
  ],
} as const;