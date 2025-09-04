# Visual Tiers System - Design Document

## Overview

This design implements a sophisticated visual hierarchy system that creates dramatic pacing and professional presentation by treating images according to their narrative importance and functional purpose.

## Architecture

### Visual Tier Classification System
```
ImageTierClassifier
├── identifyImageTier(imageContext, contentType)
├── processTier1Images(splashArt)
├── processTier2Images(contextImages)
└── processTier3Images(flavorArt)
```

### Tier Definitions

#### Tier 1: Splash Art (Maximum Impact)
- **Cover Image**: Full-page, no margins, maximum drama
- **Boss Monster**: Full-page or half-page presentation before stat block
- **Treatment**: Largest size, highest quality, dramatic presentation

#### Tier 2: Context & Atmosphere (Functional Beauty)
- **Scene Images**: ~1/3 page at scene beginning
- **NPC Portraits**: Integrated into character cards
- **Treatment**: Balanced size, clear context, readable integration

#### Tier 3: Iconography & Flavor (Subtle Enhancement)
- **Magic Items**: Small icons in item cards
- **Minor Monsters**: Smaller images beside stat blocks
- **Treatment**: Compact size, supportive role, consistent styling

## Components and Interfaces

### Image Classification Interface
```typescript
interface ImageTier {
  tier: 1 | 2 | 3;
  purpose: 'splash' | 'context' | 'flavor';
  treatment: 'full-page' | 'half-page' | 'third-page' | 'icon';
  placement: 'standalone' | 'integrated' | 'sidebar';
}

interface ClassifiedImage {
  url: string;
  tier: ImageTier;
  contentType: 'cover' | 'boss-monster' | 'scene' | 'npc' | 'magic-item' | 'minor-monster';
  metadata: {
    title?: string;
    description?: string;
    playerSafe: boolean;
  };
}
```

### Tier 1: Splash Art Implementation

#### Boss Monster Dramatic Presentation
```html
<!-- Full-page boss monster before stat block -->
<div class="page boss-splash-page">
  <div class="boss-image-container">
    <img src="${bossImage}" alt="${bossName}" class="boss-splash-image" />
    <div class="boss-name-overlay">
      <h1 class="boss-title">${bossName}</h1>
      <div class="boss-subtitle">The Final Challenge Awaits</div>
    </div>
  </div>
</div>

<!-- Followed by stat block on next page -->
<div class="page boss-stats-page">
  ${generateBossStatBlock(boss)}
</div>
```

#### CSS for Tier 1 Images
```css
.boss-splash-page {
  padding: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.boss-splash-image {
  width: 100%;
  height: 100vh;
  object-fit: cover;
  filter: brightness(0.8) contrast(1.2);
}

.boss-name-overlay {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: white;
  text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
}

.boss-title {
  font-family: 'Cinzel', serif;
  font-size: 48pt;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 3px;
  text-transform: uppercase;
}
```

### Tier 2: Context Images Implementation

#### Scene Image Integration
```html
<div class="scene-container">
  <div class="scene-image-tier2">
    <img src="${sceneImage}" alt="${sceneTitle}" class="context-image" />
    <div class="image-caption">${sceneTitle}</div>
  </div>
  <div class="scene-content">
    <!-- Scene description and mechanics -->
  </div>
</div>
```

#### CSS for Tier 2 Images
```css
.scene-image-tier2 {
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
  border: 3px solid #8b4513;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 6px 15px rgba(0,0,0,0.2);
}

.context-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  filter: contrast(1.1) saturation(1.05);
}

.image-caption {
  background: rgba(139, 69, 19, 0.9);
  color: white;
  padding: 8px 12px;
  font-size: 10pt;
  text-align: center;
  font-style: italic;
}
```

### Tier 3: Flavor Art Implementation

#### Magic Item Icons
```html
<div class="magic-item-card">
  <div class="item-header">
    <div class="item-icon-tier3">
      <img src="${itemImage}" alt="${itemName}" class="flavor-icon" />
    </div>
    <div class="item-title">${itemName}</div>
  </div>
  <div class="item-content">
    <!-- Item description -->
  </div>
</div>
```

#### CSS for Tier 3 Images
```css
.item-icon-tier3 {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #d4af37;
  flex-shrink: 0;
}

.flavor-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(1.1) contrast(1.05);
}

.minor-monster-icon {
  width: 80px;
  height: 80px;
  float: right;
  margin: 0 0 10px 15px;
  border-radius: 6px;
  border: 2px solid #8b4513;
}
```

### Enhanced Visual Gallery

#### Player-Safe Gallery Implementation
```html
<div class="page gallery-page">
  <h1 class="section-title">Player Visual Aids</h1>
  <div class="gallery-intro">
    <p>These images can be shown to players during gameplay to enhance immersion and provide visual context for scenes, characters, and discoveries.</p>
  </div>
  
  <div class="player-aids-grid">
    ${playerSafeImages.map(image => `
      <div class="aid-card">
        <img src="${image.url}" alt="${image.title}" class="aid-image" />
        <div class="aid-info">
          <h3 class="aid-title">${image.title}</h3>
          <div class="aid-type">${image.contentType}</div>
          <div class="aid-description">${image.description}</div>
        </div>
      </div>
    `).join('')}
  </div>
</div>
```

## Data Models

### Image Classification Logic
```typescript
function classifyImage(imageContext: any, contentType: string): ImageTier {
  // Tier 1: Splash Art
  if (contentType === 'cover') {
    return { tier: 1, purpose: 'splash', treatment: 'full-page', placement: 'standalone' };
  }
  
  if (contentType === 'monster' && imageContext.isBoss) {
    return { tier: 1, purpose: 'splash', treatment: 'full-page', placement: 'standalone' };
  }
  
  // Tier 2: Context & Atmosphere
  if (contentType === 'scene' || contentType === 'npc') {
    return { tier: 2, purpose: 'context', treatment: 'third-page', placement: 'integrated' };
  }
  
  // Tier 3: Iconography & Flavor
  if (contentType === 'magic-item' || (contentType === 'monster' && !imageContext.isBoss)) {
    return { tier: 3, purpose: 'flavor', treatment: 'icon', placement: 'integrated' };
  }
  
  // Default to Tier 2
  return { tier: 2, purpose: 'context', treatment: 'third-page', placement: 'integrated' };
}
```

### Player-Safe Content Filter
```typescript
function isPlayerSafe(image: ClassifiedImage): boolean {
  const playerSafeTypes = ['scene', 'npc', 'magic-item'];
  const spoilerTypes = ['monster', 'boss-monster'];
  
  return playerSafeTypes.includes(image.contentType) && 
         !spoilerTypes.includes(image.contentType);
}
```

## Implementation Strategy

### Phase 1: Image Classification System
1. Implement automatic image tier detection
2. Create classification logic for different content types
3. Add boss monster identification system

### Phase 2: Tier-Specific Rendering
1. Implement Tier 1 splash art layouts
2. Enhance Tier 2 context image integration
3. Optimize Tier 3 flavor art sizing

### Phase 3: Enhanced Gallery
1. Filter images for player-safe content
2. Redesign gallery as functional GM tool
3. Add descriptive metadata for each image

### Phase 4: Visual Flow Optimization
1. Implement dramatic pacing between tiers
2. Optimize page breaks around splash art
3. Fine-tune overall visual rhythm

This design creates a sophisticated visual hierarchy that enhances both the aesthetic appeal and functional utility of adventure PDFs, providing GMs with a professional tool that creates memorable gaming experiences.