#!/usr/bin/env node

/**
 * Script to generate optimized images in modern formats (AVIF, WebP)
 * Creates responsive breakpoints and optimized versions for landing page
 */

import { promises as fs } from 'fs';
import path from 'path';

async function createImageDirectories() {
  const imageDir = path.join(process.cwd(), 'public', 'images');
  const subdirs = ['hero', 'characters', 'features', 'testimonials'];

  try {
    // Create main images directory
    await fs.mkdir(imageDir, { recursive: true });
    console.log('✅ Created public/images directory');

    // Create subdirectories
    for (const subdir of subdirs) {
      await fs.mkdir(path.join(imageDir, subdir), { recursive: true });
      console.log(`✅ Created public/images/${subdir} directory`);
    }

    // Create placeholder files documentation
    const readmeContent = `# Optimized Images Directory

This directory contains optimized images in multiple formats for the landing page.

## Directory Structure

- \`hero/\` - Hero section background images
- \`characters/\` - Character avatars and testimonial images  
- \`features/\` - Feature section icons and illustrations
- \`testimonials/\` - Testimonial-related imagery

## Image Formats

For each image, we provide multiple formats:
- \`.avif\` - Modern format with best compression
- \`.webp\` - Widely supported modern format
- \`.jpg/.png\` - Fallback format

## Naming Convention

Images should follow this pattern:
- \`image-name.avif\`
- \`image-name.webp\`
- \`image-name.jpg\` (or .png for transparency)

## Optimization Guidelines

1. **Hero Images**: 1920x1080 max, optimized for different breakpoints
2. **Character Avatars**: 128x128, with 64x64 and 32x32 variants
3. **Feature Icons**: 64x64 SVG preferred, with PNG fallbacks
4. **Backgrounds**: Use CSS gradients where possible, images as enhancement

## Tools for Optimization

- Use \`sharp\` for Node.js image processing
- Use \`squoosh\` for manual optimization
- Use \`imagemin\` for build-time optimization
`;

    await fs.writeFile(path.join(imageDir, 'README.md'), readmeContent);
    console.log('✅ Created images README.md');

    // Create sample placeholder SVG
    const placeholderSvg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(220 14% 96%);stop-opacity:1" />
      <stop offset="100%" style="stop-color:hsl(220 13% 91%);stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
        font-family="system-ui, sans-serif" font-size="16" fill="hsl(220 9% 46%)">
    Optimized Image Placeholder
  </text>
</svg>`;

    await fs.writeFile(path.join(imageDir, 'placeholder-optimized.svg'), placeholderSvg);
    console.log('✅ Created optimized placeholder SVG');

    // Generate sample optimized images for development
    await generateSampleImages();

    console.log('\n🎯 Next Steps:');
    console.log('1. Replace sample images with actual high-quality assets');
    console.log('2. Run image optimization pipeline: npm run optimize-images');
    console.log('3. Test loading performance across different devices');
    console.log('4. Monitor Core Web Vitals for image loading impact');

  } catch (error) {
    console.error('❌ Error creating image directories:', error);
  }
}

async function generateSampleImages() {
  const imageDir = path.join(process.cwd(), 'public', 'images');
  
  // Generate sample hero backgrounds at different breakpoints
  const heroBreakpoints = [320, 768, 1024, 1536, 1920];
  
  for (const width of heroBreakpoints) {
    const height = Math.round(width * 0.5625); // 16:9 aspect ratio
    
    // Generate SVG placeholder for each breakpoint
    const heroSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="heroGrad${width}" cx="50%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:hsl(220 14% 4%);stop-opacity:1" />
      <stop offset="50%" style="stop-color:hsl(220 13% 8%);stop-opacity:1" />
      <stop offset="100%" style="stop-color:hsl(220 14% 2%);stop-opacity:1" />
    </radialGradient>
    <filter id="glow${width}">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#heroGrad${width})"/>
  
  <!-- Magical D20 dice -->
  <polygon points="${width*0.2},${height*0.3} ${width*0.25},${height*0.25} ${width*0.3},${height*0.3} ${width*0.25},${height*0.35}" 
           fill="hsl(38 92% 50%)" opacity="0.6" filter="url(#glow${width})"/>
  <polygon points="${width*0.7},${height*0.6} ${width*0.75},${height*0.55} ${width*0.8},${height*0.6} ${width*0.75},${height*0.65}" 
           fill="hsl(38 92% 50%)" opacity="0.4" filter="url(#glow${width})"/>
  
  <!-- Mystical particles -->
  <circle cx="${width*0.15}" cy="${height*0.7}" r="2" fill="hsl(38 92% 50%)" opacity="0.8"/>
  <circle cx="${width*0.85}" cy="${height*0.2}" r="1.5" fill="hsl(38 92% 50%)" opacity="0.6"/>
  <circle cx="${width*0.6}" cy="${height*0.8}" r="1" fill="hsl(38 92% 50%)" opacity="0.7"/>
  
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
        font-family="system-ui, sans-serif" font-size="${Math.max(16, width/60)}" 
        fill="hsl(38 92% 50%)" opacity="0.3">
    Hero Background ${width}w
  </text>
</svg>`;

    await fs.writeFile(
      path.join(imageDir, 'hero', `hero-bg-${width}w.svg`), 
      heroSvg
    );
  }
  
  // Generate character avatar placeholders
  const avatarSizes = [32, 64, 128, 256];
  const characterNames = ['wizard', 'rogue', 'paladin', 'bard'];
  
  for (const name of characterNames) {
    for (const size of avatarSizes) {
      const avatarSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${name}Grad${size}" cx="50%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:hsl(${Math.random() * 360} 70% 60%);stop-opacity:1" />
      <stop offset="100%" style="stop-color:hsl(${Math.random() * 360} 50% 30%);stop-opacity:1" />
    </radialGradient>
  </defs>
  <circle cx="50%" cy="50%" r="50%" fill="url(#${name}Grad${size})"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
        font-family="system-ui, sans-serif" font-size="${size/8}" 
        fill="white" font-weight="bold">
    ${name.charAt(0).toUpperCase()}
  </text>
</svg>`;

      await fs.writeFile(
        path.join(imageDir, 'characters', `${name}-${size}w.svg`), 
        avatarSvg
      );
    }
  }
  
  console.log('✅ Generated sample optimized images');
}

// Image optimization configuration
async function createOptimizationConfig() {
  const config = {
    input: 'public/images/**/*.{jpg,jpeg,png,svg}',
    output: 'public/images/',
    formats: ['avif', 'webp'],
    breakpoints: [320, 480, 768, 1024, 1280, 1536, 1920],
    quality: {
      avif: 80,
      webp: 85,
      jpeg: 90
    },
    optimization: {
      progressive: true,
      mozjpeg: true,
      pngquant: true
    }
  };
  
  await fs.writeFile(
    path.join(process.cwd(), 'image-optimization.config.json'),
    JSON.stringify(config, null, 2)
  );
  
  console.log('✅ Created image optimization configuration');
}

async function main() {
  await createImageDirectories();
  await createOptimizationConfig();
}

main().catch(console.error);