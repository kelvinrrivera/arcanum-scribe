import puppeteer from 'puppeteer';

interface PDFExportOptions {
  template: 'adventure-masterpiece' | 'full-adventure' | 'monster-card' | 'magic-item-card' | 'spell-card' | 'npc-portfolio';
  data: any;
  title: string;
  style?: 'classic' | 'gothic' | 'mystical' | 'arcane';
}

interface PDFResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

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

export class PDFService {
  private browser: puppeteer.Browser | null = null;

  // Image Classification System
  private classifyImage(imageUrl: string, contentType: string, context?: any): ClassifiedImage {
    const tier = this.determineImageTier(contentType, context);
    const metadata = this.generateImageMetadata(contentType, context);
    
    return {
      url: imageUrl,
      tier,
      contentType: contentType as any,
      metadata
    };
  }

  private determineImageTier(contentType: string, context?: any): ImageTier {
    // Tier 1: Splash Art (Maximum Impact)
    if (contentType === 'cover') {
      return { tier: 1, purpose: 'splash', treatment: 'full-page', placement: 'standalone' };
    }
    
    if (contentType === 'monster' && this.isBossMonster(context)) {
      return { tier: 1, purpose: 'splash', treatment: 'full-page', placement: 'standalone' };
    }
    
    // Tier 2: Context & Atmosphere
    if (contentType === 'scene' || contentType === 'npc') {
      return { tier: 2, purpose: 'context', treatment: 'third-page', placement: 'integrated' };
    }
    
    // Tier 3: Iconography & Flavor
    if (contentType === 'magic-item' || (contentType === 'monster' && !this.isBossMonster(context))) {
      return { tier: 3, purpose: 'flavor', treatment: 'icon', placement: 'integrated' };
    }
    
    // Default to Tier 2
    return { tier: 2, purpose: 'context', treatment: 'third-page', placement: 'integrated' };
  }

  private isBossMonster(context?: any): boolean {
    if (!context) return false;
    
    // PRIORITY 1: Check if explicitly marked as main antagonist
    if (context.isBoss || context.boss || context.mainAntagonist || context.isMainVillain) return true;
    
    // PRIORITY 2: Check if this is the primary villain from NPCs
    if (context.role && (
      context.role.toLowerCase().includes('villain') ||
      context.role.toLowerCase().includes('antagonist') ||
      context.role.toLowerCase().includes('main enemy') ||
      context.role.toLowerCase().includes('final boss')
    )) return true;
    
    // PRIORITY 3: Check narrative importance indicators in name
    const name = (context.name || '').toLowerCase();
    const bossKeywords = ['lord', 'master', 'king', 'queen', 'ancient', 'elder', 'prime', 'arch', 'high', 'supreme', 'grand'];
    if (bossKeywords.some(keyword => name.includes(keyword))) return true;
    
    // PRIORITY 4: Check challenge rating (CR 5+ typically indicates boss-level)
    const challengeRating = parseInt(context.challengeRating || '0');
    if (challengeRating >= 5) return true;
    
    // PRIORITY 5: Check if it's a spellcaster (likely main villain)
    if (context.spellcasting || context.spells || context.magicAbilities) return true;
    
    return false;
  }

  private generateImageMetadata(contentType: string, context?: any): { title?: string; description?: string; playerSafe: boolean } {
    const playerSafeTypes = ['scene', 'npc', 'magic-item'];
    const playerSafe = playerSafeTypes.includes(contentType);
    
    let title = '';
    let description = '';
    
    switch (contentType) {
      case 'cover':
        title = context?.title || 'Adventure Cover';
        description = 'The cover art for this adventure';
        break;
      case 'scene':
        title = context?.title || 'Scene Illustration';
        description = context?.description || 'A scene from the adventure';
        break;
      case 'npc':
        title = context?.name || 'Character Portrait';
        description = `${context?.role || 'Character'} - ${context?.personality || 'Important NPC'}`;
        break;
      case 'monster':
        title = context?.name || 'Creature';
        description = this.isBossMonster(context) ? 'Main Antagonist' : 'Creature Encounter';
        break;
      case 'magic-item':
        title = context?.name || 'Magic Item';
        description = context?.description || 'A magical artifact';
        break;
    }
    
    return { title, description, playerSafe };
  }

  private classifyAllImages(adventure: any): ClassifiedImage[] {
    const classifiedImages: ClassifiedImage[] = [];
    const images = adventure.image_urls || [];
    
    // Cover image (first image)
    if (images[0]) {
      classifiedImages.push(this.classifyImage(images[0], 'cover', adventure));
    }
    
    // Scene images
    if (adventure.scenes && images.length > 1) {
      adventure.scenes.forEach((scene: any, index: number) => {
        const imageIndex = index + 1; // Skip cover image
        if (images[imageIndex]) {
          classifiedImages.push(this.classifyImage(images[imageIndex], 'scene', scene));
        }
      });
    }
    
    // Monster images (detect boss vs minor)
    if (adventure.monsters) {
      adventure.monsters.forEach((monster: any, index: number) => {
        // For now, assume monsters don't have dedicated images in the image_urls array
        // This would need to be enhanced when monster images are properly integrated
        if (monster.imageUrl) {
          classifiedImages.push(this.classifyImage(monster.imageUrl, 'monster', monster));
        }
      });
    }
    
    // NPC images
    if (adventure.npcs) {
      adventure.npcs.forEach((npc: any) => {
        if (npc.imageUrl) {
          classifiedImages.push(this.classifyImage(npc.imageUrl, 'npc', npc));
        }
      });
    }
    
    // Magic item images
    if (adventure.magicItems) {
      adventure.magicItems.forEach((item: any) => {
        if (item.imageUrl) {
          classifiedImages.push(this.classifyImage(item.imageUrl, 'magic-item', item));
        }
      });
    }
    
    return classifiedImages;
  }

  private getPlayerSafeImages(classifiedImages: ClassifiedImage[]): ClassifiedImage[] {
    return classifiedImages.filter(image => image.metadata.playerSafe);
  }

  async initialize(): Promise<void> {
    if (!this.browser) {
      console.log('🖨️  Initializing PDF Service with Puppeteer...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--allow-running-insecure-content',
          '--disable-blink-features=AutomationControlled',
          '--disable-gpu'
        ]
      });
      console.log('✅ PDF Service initialized');
    }
  }

  async generatePDF(options: PDFExportOptions): Promise<PDFResult> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('PDF Service not initialized');
    }

    console.log(`🖨️  Starting PDF generation for template: ${options.template}`);
    const page = await this.browser.newPage();
    
    try {
      // Generate HTML content based on template
      const htmlContent = await this.generateHTML(options);
      
      // Set the HTML content with cache disabled and force reload
      await page.setCacheEnabled(false);
      await page.setExtraHTTPHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 60000 
      });
      
      // Wait for images to load
      console.log('🖼️  Waiting for images to load...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Configure PDF options
      const pdfOptions = this.getPDFOptions(options.template);
      
      // Generate PDF
      console.log(`🖨️  Generating PDF for template: ${options.template}`);
      const buffer = await page.pdf(pdfOptions);
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const templateName = options.template.replace('-', '_');
      const safeName = options.title.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${templateName}_${safeName}_${timestamp}.pdf`;

      console.log(`✅ PDF generated: ${filename}`);
      
      return {
        buffer,
        filename,
        contentType: 'application/pdf'
      };
      
    } finally {
      await page.close();
    }
  }

  private async generateHTML(options: PDFExportOptions): Promise<string> {
    switch (options.template) {
      case 'adventure-masterpiece':
        return await this.generateAdventureMasterpieceHTML(options.data, options.style);
      case 'full-adventure':
        return await this.generateFullAdventureHTML(options.data);
      default:
        throw new Error(`Unknown template: ${options.template}`);
    }
  }

  private getPDFOptions(template: string): puppeteer.PDFOptions {
    const baseOptions: puppeteer.PDFOptions = {
      printBackground: true,
      preferCSSPageSize: true,
    };

    switch (template) {
      case 'adventure-masterpiece':
      case 'full-adventure':
        return {
          ...baseOptions,
          format: 'A4',
          margin: {
            top: '15mm',
            right: '12mm',
            bottom: '15mm',
            left: '12mm'
          }
        };
      default:
        return baseOptions;
    }
  }

  private async generateAdventureMasterpieceHTML(adventure: any, style?: string): Promise<string> {
    const generationId = Math.random().toString(36).substring(7);
    console.log(`🎨 [${generationId}] Generating Adventure Masterpiece HTML with style: ${style || 'default'}`);
    console.log(`📖 [${generationId}] Adventure title: ${adventure.title}`);
    console.log(`🖼️  [${generationId}] Images available: ${adventure.image_urls?.length || 0}`);
    
    // Check for professional enhancement
    const isProfessional = adventure.professionalEnhancement ? true : false;
    console.log(`🦄 [${generationId}] Professional Mode: ${isProfessional ? 'ENABLED' : 'DISABLED'}`);
    if (isProfessional) {
      console.log(`✨ [${generationId}] Professional Grade: ${adventure.professionalEnhancement.professionalGrade || 'N/A'}`);
      console.log(`🎯 [${generationId}] Quality Score: ${adventure.professionalEnhancement.qualityMetrics?.overallScore || 'N/A'}`);
    }
    
    const images = adventure.image_urls || [];
    const base64Images = await this.convertImagesToBase64(images);
    const coverImage = base64Images[0];
    
    // Classify all images using the Visual Tiers System
    console.log(`🎯 [${generationId}] Classifying images using Visual Tiers System...`);
    const classifiedImages = this.classifyAllImages({
      ...adventure,
      image_urls: base64Images
    });
    console.log(`📊 [${generationId}] Classified ${classifiedImages.length} images across ${new Set(classifiedImages.map(img => img.tier.tier)).size} tiers`);
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
      <meta http-equiv="Pragma" content="no-cache">
      <meta http-equiv="Expires" content="0">
      <title>${adventure.title}</title>
      <style>
        /* Generated at: ${new Date().toISOString()} */
        ${this.getProfessionalStyles(isProfessional, adventure.professionalEnhancement)}
      </style>
    </head>
    <body>
      <!-- DEBUG: Starting page generation -->
      <!-- Complete PDF with fixed page numbering -->
      ${this.generateCoverPage(adventure, coverImage, isProfessional, adventure.professionalEnhancement)}
      ${this.generateTableOfContents()}
      ${this.generateBackgroundLore(adventure)}
      ${this.generateScenes(adventure, base64Images, classifiedImages)}
      ${this.generateCastOfCharacters(adventure)}
      ${this.generateBestiaryOfTerrors(adventure, classifiedImages)}
      ${this.generateTreasuresArtifacts(adventure, classifiedImages)}
      ${this.generateEnhancedVisualGallery(adventure, classifiedImages)}
    </body>
    </html>
    `;
  }

  private async generateFullAdventureHTML(adventure: any): Promise<string> {
    return this.generateAdventureMasterpieceHTML(adventure);
  }

  private async convertImagesToBase64(imageUrls: string[]): Promise<string[]> {
    const base64Images: string[] = [];
    
    for (const url of imageUrls) {
      try {
        console.log(`🖼️  Converting image: ${url.substring(0, 50)}...`);
        const response = await fetch(url);
        
        if (!response.ok) {
          console.log(`❌ Failed to download image: ${response.status}`);
          continue;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;
        
        base64Images.push(base64);
        console.log(`✅ Converted image to base64`);
        
      } catch (error) {
        console.log(`❌ Error converting image:`, error.message);
      }
    }
    
    return base64Images;
  }

  private getProfessionalStyles(isProfessional: boolean = false, professionalEnhancement?: any): string {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Crimson Text', serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #2c1810;
        background: #f8f5f0;
        counter-reset: page-counter;
      }
      
      .page {
        page-break-after: always;
        min-height: 100vh;
        padding: 40px;
        position: relative;
        background: linear-gradient(135deg, #f8f5f0 0%, #f0ede8 100%);
        counter-increment: page-counter;
      }
      
      .page:last-child {
        page-break-after: avoid;
      }
      
      /* COVER PAGE */
      .cover-page {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: #2c1810;
        color: #f8f5f0;
        position: relative;
        overflow: hidden;
        padding: 0;
      }
      
      .cover-image-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }
      
      .cover-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.8;
      }
      
      .cover-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, 
          rgba(44, 24, 16, 0.85) 0%, 
          rgba(44, 24, 16, 0.6) 50%, 
          rgba(44, 24, 16, 0.85) 100%);
        z-index: 2;
      }
      
      .cover-content {
        position: relative;
        z-index: 3;
        max-width: 800px;
        padding: 60px;
      }
      
      .adventure-title {
        font-family: 'Cinzel', serif;
        font-size: 48pt;
        font-weight: 700;
        margin-bottom: 30px;
        text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #d4af37;
      }
      
      .adventure-subtitle {
        font-family: 'Cinzel', serif;
        font-size: 18pt;
        font-weight: 400;
        margin-bottom: 40px;
        color: #f8f5f0;
        font-style: italic;
        letter-spacing: 1px;
      }
      
      .cover-icons {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 40px;
        margin: 40px 0;
        color: #d4af37;
      }
      
      .cover-icon {
        width: 48px;
        height: 48px;
        color: #d4af37;
        filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.6));
        transition: all 0.3s ease;
      }
      
      .adventure-summary {
        font-size: 14pt;
        line-height: 1.8;
        max-width: 600px;
        margin: 0 auto;
        background: rgba(0,0,0,0.4);
        padding: 30px;
        border-radius: 15px;
        border: 2px solid #d4af37;
        backdrop-filter: blur(5px);
      }
      
      /* TABLE OF CONTENTS */
      .toc-page {
        background: linear-gradient(135deg, #f8f5f0 0%, #f0ede8 100%);
      }
      
      .toc-title {
        font-family: 'Cinzel', serif;
        font-size: 32pt;
        font-weight: 600;
        text-align: center;
        margin-bottom: 50px;
        color: #8b4513;
        text-transform: uppercase;
        letter-spacing: 2px;
        border-bottom: 3px solid #d4af37;
        padding-bottom: 20px;
      }
      
      .toc-container {
        max-width: 600px;
        margin: 0 auto;
        background: #fff;
        border: 3px solid #8b4513;
        border-radius: 15px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      }
      
      .toc-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-bottom: 2px dotted #d4af37;
        font-size: 14pt;
        font-weight: 600;
      }
      
      .toc-item:last-child {
        border-bottom: none;
      }
      
      .toc-item-title {
        color: #2c1810;
      }
      
      .toc-item-page {
        color: #8b4513;
        font-weight: 700;
        background: #f8f5f0;
        padding: 5px 15px;
        border-radius: 20px;
        border: 2px solid #d4af37;
      }
      
      /* ADVENTURE OVERVIEW */
      .overview-page {
        background: linear-gradient(135deg, #f8f5f0 0%, #f0ede8 100%);
      }
      
      .section-title {
        font-family: 'Cinzel', serif;
        font-size: 28pt;
        font-weight: 600;
        text-align: center;
        margin-bottom: 40px;
        color: #8b4513;
        text-transform: uppercase;
        letter-spacing: 2px;
        border-bottom: 3px solid #d4af37;
        padding-bottom: 15px;
      }
      
      .overview-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin-top: 40px;
      }
      
      .overview-box {
        background: #fff;
        border: 3px solid #8b4513;
        border-radius: 15px;
        padding: 30px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      }
      
      .overview-header {
        font-family: 'Cinzel', serif;
        font-size: 18pt;
        font-weight: 600;
        color: #8b4513;
        text-align: center;
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .overview-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .stat-item {
        text-align: center;
        background: #f8f5f0;
        padding: 15px;
        border-radius: 10px;
        border: 2px solid #d4af37;
      }
      
      .stat-value {
        font-family: 'Cinzel', serif;
        font-size: 24pt;
        font-weight: 700;
        color: #8b4513;
        display: block;
      }
      
      .stat-label {
        font-size: 12pt;
        color: #2c1810;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 5px;
      }
      
      .overview-content {
        background: #f8f5f0;
        padding: 25px;
        border-radius: 10px;
        border-left: 5px solid #d4af37;
      }
      
      .overview-content h3 {
        font-family: 'Cinzel', serif;
        font-size: 16pt;
        color: #8b4513;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .overview-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .overview-list li {
        position: relative;
        padding: 10px 0 10px 35px; /* Consistent with tactics-list */
        margin-bottom: 8px;
        line-height: 1.5;
        border-bottom: 1px dotted rgba(212, 175, 55, 0.3);
        text-align: left;
      }
      
      .overview-list li:last-child {
        border-bottom: none;
      }
      
      .overview-list li::before {
        content: "✦"; /* Fantasy star icon for features */
        position: absolute;
        left: 0;
        top: 10px;
        color: #d4af37;
        font-size: 14pt;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        filter: drop-shadow(0 1px 2px rgba(212, 175, 55, 0.4));
      }
      
      /* BACKGROUND & LORE */
      .lore-page {
        background: linear-gradient(135deg, #f8f5f0 0%, #f0ede8 100%);
      }
      
      .lore-container {
        max-width: 800px;
        margin: 0 auto;
      }
      
      .lore-content {
        background: #fff;
        border: 3px solid #8b4513;
        border-radius: 15px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        position: relative;
      }
      
      .lore-content::before {
        content: "";
        position: absolute;
        top: 20px;
        right: 20px;
        width: 100px;
        height: 100px;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="%23d4af37" stroke-width="3"/><text x="50" y="55" text-anchor="middle" font-family="serif" font-size="12" fill="%238b4513">ANCIENT</text><text x="50" y="70" text-anchor="middle" font-family="serif" font-size="12" fill="%238b4513">SECRETS</text></svg>') no-repeat center;
        background-size: contain;
        opacity: 0.3;
      }
      
      .lore-text {
        font-size: 13pt;
        line-height: 1.8;
        text-align: justify;
        column-count: 2;
        column-gap: 40px;
        column-rule: 2px solid #d4af37;
      }
      
      .lore-text p:first-child::first-letter {
        float: left;
        font-family: 'Cinzel', serif;
        font-size: 4em;
        line-height: 0.8;
        margin: 0.1em 0.1em 0.2em 0;
        color: #8b4513;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      
      /* SCENES */
      .scene-page {
        background: linear-gradient(135deg, #f8f5f0 0%, #f0ede8 100%);
      }
      
      .scene-container {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 30px;
        margin-top: 30px;
      }
      
      .scene-image-container {
        width: 100%;
        height: 250px;
        border: 4px solid #8b4513;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        position: relative;
      }
      
      .scene-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .scene-image-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.8));
        color: white;
        padding: 15px;
        font-size: 10pt;
        text-align: center;
        font-style: italic;
      }
      
      .scene-content {
        background: #fff;
        border: 3px solid #8b4513;
        border-radius: 15px;
        padding: 30px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      }
      
      .scene-header {
        font-family: 'Cinzel', serif;
        font-size: 20pt;
        font-weight: 600;
        color: #8b4513;
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 2px solid #d4af37;
        padding-bottom: 10px;
      }
      
      .scene-section {
        margin-bottom: 25px;
      }
      
      .scene-section h3 {
        font-family: 'Cinzel', serif;
        font-size: 14pt;
        color: #8b4513;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      /* IMPROVED TEXT ALIGNMENT FOR SCENES */
      .scene-section p {
        text-align: left;
        line-height: 1.6;
        margin-bottom: 10px;
      }
      
      .scene-section em {
        font-style: italic;
        color: #5d4037;
      }
      
      .scene-sidebar {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .sidebar-box {
        background: #f8f5f0;
        border: 2px solid #d4af37;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      }
      
      .sidebar-title {
        font-family: 'Cinzel', serif;
        font-size: 16pt;
        font-weight: 700;
        color: #8b4513;
        text-align: center;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        background: linear-gradient(135deg, #8b4513, #d4af37);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        border-bottom: 2px solid #d4af37;
        padding-bottom: 8px;
      }
      
      .mechanical-details {
        background: #f0ede8 !important;
        border: 2px solid #8b4513 !important;
        border-left: 5px solid #d4af37 !important;
      }
      
      .mechanical-details .sidebar-title {
        color: #8b4513 !important;
        background: none !important;
        -webkit-text-fill-color: #8b4513 !important;
        font-size: 14pt;
      }
      
      .mechanical-details ul {
        margin: 0;
        padding-left: 15px;
      }
      
      .mechanical-details li {
        margin-bottom: 8px;
        line-height: 1.4;
        font-size: 10pt;
      }
      
      /* CHARACTER CARDS */
      .character-page {
        background: linear-gradient(135deg, #f8f5f0 0%, #f0ede8 100%);
        page-break-inside: avoid;
      }
      
      .character-page .section-title {
        page-break-after: avoid;
        break-after: avoid;
        margin-bottom: 20px;
      }
      
      .character-grid {
        page-break-inside: avoid;
      }
      
      .character-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-top: 30px;
        align-items: stretch; /* Ensures equal height cards */
        grid-auto-rows: 1fr; /* Makes all rows the same height */
      }
      
      /* Handle odd number of characters */
      .character-grid .character-card:last-child:nth-child(odd) {
        grid-column: 1 / -1; /* Spans full width if it's the only card in the row */
        max-width: 400px; /* Prevents it from being too wide */
        margin: 0 auto; /* Centers it */
      }
      
      .character-card {
        background: #fff;
        border: 3px solid #8b4513;
        border-radius: 15px;
        padding: 25px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        position: relative;
        display: flex;
        flex-direction: column;
        min-height: 280px; /* Minimum height for consistency */
      }
      
      .character-name {
        font-family: 'Cinzel', serif;
        font-size: 18pt;
        font-weight: 600;
        color: #8b4513;
        text-align: center;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 2px solid #d4af37;
        padding-bottom: 10px;
        flex-shrink: 0; /* Prevents shrinking */
      }
      
      .character-role {
        text-align: center;
        font-style: italic;
        color: #666;
        margin-bottom: 20px;
        font-size: 12pt;
        flex-shrink: 0; /* Prevents shrinking */
      }
      
      .character-details {
        background: #f8f5f0;
        padding: 15px;
        border-radius: 10px;
        border-left: 4px solid #d4af37;
        flex-grow: 1; /* Takes up available space */
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }
      
      .character-details p {
        margin-bottom: 10px;
        line-height: 1.4;
      }
      
      .character-details p:last-child {
        margin-bottom: 0;
      }
      
      .character-quote {
        font-style: italic;
        text-align: center;
        color: #8b4513;
        background: #f0ede8;
        padding: 15px;
        border-radius: 10px;
        border: 2px dashed #d4af37;
        margin-top: auto; /* Pushes quote to bottom */
        font-size: 11pt;
        line-height: 1.3;
        min-height: 50px; /* Ensures consistent quote area */
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      /* BESTIARY */
      .bestiary-page {
        background: linear-gradient(135deg, #f8f5f0 0%, #f0ede8 100%);
      }
      
      .bestiary-intro {
        text-align: center;
        font-style: italic;
        color: #666;
        margin-bottom: 40px;
        font-size: 12pt;
        background: #f0ede8;
        padding: 20px;
        border-radius: 10px;
        border: 2px solid #d4af37;
      }
      
      .boss-preview-container {
        display: flex;
        align-items: center;
        gap: 30px;
        margin-top: 40px;
        background: linear-gradient(135deg, #2c1810, #1a0f08);
        padding: 30px;
        border-radius: 15px;
        border: 3px solid #d4af37;
      }
      
      .boss-preview-image {
        flex-shrink: 0;
        width: 200px;
        height: 200px;
        border-radius: 10px;
        overflow: hidden;
        border: 3px solid #d4af37;
      }
      
      .boss-preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .boss-preview-image-large {
        flex-shrink: 0;
        width: 350px;
        height: 250px;
        border-radius: 15px;
        overflow: hidden;
        border: 4px solid #d4af37;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        margin-bottom: 20px;
      }
      
      .boss-preview-img-large {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .boss-showcase-image-full {
        width: 100%;
        height: 350px;
        margin-top: 30px;
        border: 4px solid #d4af37;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }
      
      .boss-showcase-img-full {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .boss-showcase-info {
        text-align: center;
        margin-top: 20px;
        background: linear-gradient(135deg, rgba(44, 24, 16, 0.9), rgba(26, 15, 8, 0.9));
        border: 3px solid #d4af37;
        border-radius: 15px;
        padding: 20px;
        color: #f8f5f0;
      }
      
      .boss-showcase-name {
        font-family: 'Cinzel', serif;
        font-size: 28pt;
        font-weight: 700;
        color: #d4af37;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      }
      
      .boss-showcase-subtitle {
        font-family: 'Cinzel', serif;
        font-size: 14pt;
        font-style: italic;
        margin-bottom: 10px;
        color: #f8f5f0;
      }
      
      .boss-showcase-cr {
        font-size: 16pt;
        font-weight: 700;
        color: #d4af37;
        margin-bottom: 15px;
      }
      
      .boss-showcase-note {
        font-style: italic;
        color: #ccc;
        font-size: 12pt;
      }
      
      .boss-preview-info {
        flex: 1;
        color: #f8f5f0;
      }
      
      .boss-preview-name {
        font-family: 'Cinzel', serif;
        font-size: 32pt;
        font-weight: 700;
        color: #d4af37;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 3px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      }
      
      .boss-preview-subtitle {
        font-family: 'Cinzel', serif;
        font-size: 16pt;
        font-style: italic;
        margin-bottom: 15px;
        color: #f8f5f0;
      }
      
      .boss-preview-cr {
        font-size: 14pt;
        font-weight: 600;
        color: #d4af37;
        margin-bottom: 20px;
      }
      
      .boss-preview-note {
        font-style: italic;
        color: #ccc;
        font-size: 12pt;
      }
      
      /* TERROR SHOWCASE PAGE - ESCALOFRIANTE */
      .terror-showcase-page {
        background: linear-gradient(135deg, #1a0f08 0%, #2c1810 50%, #1a0f08 100%);
        color: #f8f5f0;
        position: relative;
        overflow: hidden;
      }
      
      .terror-showcase-page::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.05) 0%, transparent 50%);
        pointer-events: none;
      }
      
      .bestiary-intro-compact {
        text-align: center;
        font-style: italic;
        color: #ccc;
        margin-bottom: 30px;
        font-size: 11pt;
        background: rgba(0,0,0,0.3);
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #d4af37;
        backdrop-filter: blur(5px);
      }
      
      .terror-image-showcase {
        display: flex;
        justify-content: center;
        margin: 30px 0;
        position: relative;
        z-index: 2;
      }
      
      .terror-image-frame {
        position: relative;
        width: 400px;
        height: 300px;
        border: 5px solid #d4af37;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 
          0 0 30px rgba(212, 175, 55, 0.4),
          0 0 60px rgba(212, 175, 55, 0.2),
          inset 0 0 20px rgba(0,0,0,0.5);
        transform: perspective(1000px) rotateX(2deg);
      }
      
      .terror-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: contrast(1.2) saturate(0.8) brightness(0.9);
        transition: all 0.3s ease;
      }
      
      .terror-image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          45deg,
          transparent 0%,
          rgba(139, 69, 19, 0.1) 25%,
          transparent 50%,
          rgba(212, 175, 55, 0.1) 75%,
          transparent 100%
        );
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 15px;
      }
      
      .terror-warning {
        background: linear-gradient(135deg, #ff4444, #cc0000);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 10pt;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        border: 2px solid #fff;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
      
      .terror-info-panel {
        background: linear-gradient(135deg, rgba(44, 24, 16, 0.9), rgba(26, 15, 8, 0.9));
        border: 3px solid #d4af37;
        border-radius: 15px;
        padding: 25px;
        margin-top: 20px;
        backdrop-filter: blur(10px);
        position: relative;
        z-index: 2;
      }
      
      .terror-classification {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #d4af37;
      }
      
      .terror-label {
        background: linear-gradient(135deg, #d4af37, #f4d03f);
        color: #2c1810;
        padding: 8px 20px;
        border-radius: 25px;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 12pt;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
      }
      
      .terror-threat-level {
        color: #ff4444;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 12pt;
        text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
      }
      
      .terror-identity {
        text-align: center;
        margin: 25px 0;
      }
      
      .terror-name {
        font-family: 'Cinzel', serif;
        font-size: 36pt;
        font-weight: 900;
        color: #d4af37;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 4px;
        text-shadow: 
          3px 3px 6px rgba(0,0,0,0.9),
          0 0 20px rgba(212, 175, 55, 0.6);
        line-height: 0.9;
      }
      
      .terror-subtitle {
        font-family: 'Cinzel', serif;
        font-size: 16pt;
        font-style: italic;
        color: #f8f5f0;
        margin-bottom: 15px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      }
      
      .terror-cr {
        font-size: 18pt;
        font-weight: 700;
        color: #ff4444;
        text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
      }
      
      .terror-warning-box {
        background: linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(204, 0, 0, 0.1));
        border: 2px solid #ff4444;
        border-radius: 10px;
        padding: 20px;
        margin: 25px 0;
        text-align: center;
      }
      
      .terror-warning-title {
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 14pt;
        color: #ff4444;
        margin-bottom: 10px;
        text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
      }
      
      .terror-warning-text {
        font-size: 11pt;
        line-height: 1.5;
        color: #f8f5f0;
        font-style: italic;
      }
      
      .terror-page-turn {
        text-align: center;
        margin-top: 25px;
        padding-top: 20px;
        border-top: 1px solid #d4af37;
      }
      
      .terror-turn-text {
        font-family: 'Cinzel', serif;
        font-size: 14pt;
        font-style: italic;
        color: #d4af37;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      }
      
      .terror-turn-icon {
        font-size: 24pt;
        color: #d4af37;
        text-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
        animation: blink 3s infinite;
      }
      
      @keyframes blink {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0.3; }
      }
      
      /* STAT BLOCK */
      .stat-block {
        background: #fff;
        border: 4px solid #8b4513;
        border-radius: 15px;
        padding: 25px;
        margin: 20px 0;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        position: relative;
      }
      
      .stat-block::before {
        content: "CR 1";
        position: absolute;
        top: -15px;
        right: 20px;
        background: #d4af37;
        color: #2c1810;
        padding: 8px 20px;
        border-radius: 20px;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 12pt;
        border: 3px solid #8b4513;
        z-index: 10;
      }
      
      .monster-name {
        font-family: 'Cinzel', serif;
        font-size: 24pt;
        font-weight: 700;
        color: #8b4513;
        text-align: center;
        margin-top: 15px;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      
      .monster-type {
        text-align: center;
        font-style: italic;
        color: #666;
        margin-bottom: 20px;
        font-size: 12pt;
      }
      
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin: 20px 0;
      }
      
      .stat-item {
        background: #f8f5f0;
        padding: 10px;
        border-radius: 8px;
        border: 2px solid #d4af37;
        text-align: center;
      }
      
      .abilities-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 15px;
        margin: 20px 0;
        background: #f0ede8;
        padding: 25px;
        border-radius: 10px;
        border: 2px solid #8b4513;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      }
      
      .ability-score {
        text-align: center;
        background: #fff;
        padding: 12px 8px;
        border-radius: 8px;
        border: 2px solid #d4af37;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
      }
      
      .ability-name {
        font-family: 'Cinzel', serif;
        font-size: 10pt;
        font-weight: 600;
        color: #8b4513;
        text-transform: uppercase;
      }
      
      .ability-value {
        font-size: 14pt;
        font-weight: 700;
        color: #2c1810;
      }
      
      /* STAT BLOCK SECTION HEADERS */
      .stat-section-header {
        font-family: 'Cinzel', serif;
        font-size: 14pt;
        font-weight: 600;
        color: #8b4513;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 2px solid #d4af37;
        margin: 20px 0 10px 0;
        padding-bottom: 5px;
        background: linear-gradient(135deg, #8b4513, #d4af37);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .stat-section {
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(139, 69, 19, 0.03);
        border-radius: 8px;
        border-left: 4px solid #d4af37;
      }
      
      /* ENHANCED ABILITY NAME FORMATTING */
      .ability-entry {
        margin-bottom: 12px;
        text-align: left;
        line-height: 1.5;
        padding: 8px;
        background: rgba(255,255,255,0.5);
        border-radius: 4px;
      }
      
      .ability-name {
        font-weight: 700;
        color: #8b4513;
        font-family: 'Cinzel', serif;
      }
      
      .ability-name::after {
        content: ".";
      }
      
      /* LEGENDARY AND LAIR ACTION STYLES */
      .legendary-intro, .lair-intro {
        font-style: italic;
        color: #666;
        margin-bottom: 15px;
        padding: 10px;
        background: rgba(212, 175, 55, 0.1);
        border-radius: 4px;
        border-left: 3px solid #d4af37;
      }
        font-weight: 700;
      }
      
      .combat-tactics {
        background: #e8f5e8;
        border: 3px solid #228b22;
        border-radius: 10px;
        padding: 20px;
        margin-top: 20px;
      }
      
      .tactics-title {
        font-family: 'Cinzel', serif;
        font-size: 16pt;
        font-weight: 600;
        color: #228b22;
        text-align: center;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .tactics-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .tactics-list li {
        position: relative;
        padding: 10px 0 10px 35px; /* Increased padding for better spacing */
        margin-bottom: 8px;
        line-height: 1.5; /* Improved line height for readability */
        border-bottom: 1px dotted rgba(34, 139, 34, 0.3);
        text-align: left; /* Ensure left alignment for tactical content */
      }
      
      .tactics-list li:last-child {
        border-bottom: none; /* Remove border from last item */
      }
      
      .tactics-list li::before {
        content: "⚔️";
        position: absolute;
        left: 0;
        top: 10px;
        color: #228b22;
        font-size: 14pt;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3); /* Add depth to the icon */
        filter: drop-shadow(0 1px 2px rgba(34, 139, 34, 0.4));
      }
      
      /* TREASURES */
      .treasure-page {
        background: linear-gradient(135deg, #f8f5f0 0%, #f0ede8 100%);
      }
      
      .treasure-card {
        background: #fff;
        border: 4px solid #8b4513;
        border-radius: 15px;
        padding: 30px;
        margin: 20px 0;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        position: relative;
      }
      
      .treasure-card::before {
        content: "PRICELESS";
        position: absolute;
        top: -15px;
        right: 20px;
        background: #d4af37;
        color: #2c1810;
        padding: 8px 20px;
        border-radius: 20px;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 10pt;
        border: 3px solid #8b4513;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
      }
      
      .treasure-name {
        font-family: 'Cinzel', serif;
        font-size: 20pt;
        font-weight: 600;
        color: #8b4513;
        text-align: center;
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .treasure-sections {
        display: grid;
        gap: 20px;
      }
      
      .treasure-section {
        background: #f8f5f0;
        padding: 20px;
        border-radius: 10px;
        border-left: 5px solid #d4af37;
      }
      
      .treasure-section h3 {
        font-family: 'Cinzel', serif;
        font-size: 14pt;
        color: #8b4513;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      /* VISUAL GALLERY */
      .gallery-page {
        background: linear-gradient(135deg, #f8f5f0 0%, #f0ede8 100%);
      }
      
      .gallery-intro {
        text-align: center;
        font-style: italic;
        color: #666;
        margin-bottom: 40px;
        font-size: 12pt;
        background: #f0ede8;
        padding: 20px;
        border-radius: 10px;
        border: 2px solid #d4af37;
      }
      
      .gallery-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-top: 30px;
      }
      
      .gallery-item {
        background: #fff;
        border: 4px solid #8b4513;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        text-align: center;
      }
      
      .gallery-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 10px;
        margin-bottom: 15px;
      }
      
      .gallery-title {
        font-family: 'Cinzel', serif;
        font-size: 16pt;
        font-weight: 600;
        color: #8b4513;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .gallery-description {
        font-style: italic;
        color: #666;
        font-size: 11pt;
      }
      
      .gallery-tags {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 15px;
      }
      
      .gallery-tag {
        background: #f8f5f0;
        color: #8b4513;
        padding: 5px 15px;
        border-radius: 20px;
        border: 2px solid #d4af37;
        font-size: 10pt;
        font-weight: 600;
      }
      
      /* BREAK-INSIDE CONTROLS - Previene cortes bruscos */
      .stat-block, 
      .character-card, 
      .scene-container,
      .treasure-card,
      .gallery-item,
      .overview-box,
      .lore-content,
      .toc-container,
      .scene-content,
      .scene-sidebar,
      .sidebar-box,
      .treasure-section,
      .character-details,
      .combat-tactics,
      .abilities-grid,
      .monster-name,
      .treasure-name {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      /* Controla viudas y huérfanas para tipografía profesional */
      p, li {
        orphans: 3 !important;
        widows: 3 !important;
      }
      
      /* Evita cortes específicos en elementos de escena */
      .scene-section h3,
      .sidebar-title,
      .character-name,
      .section-title {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      
      /* Mantiene juntos los elementos relacionados */
      .scene-image-container + .scene-content,
      .character-name + .character-role + .character-details {
        break-before: avoid !important;
        page-break-before: avoid !important;
      }

      /* PROFESSIONAL PAGE NUMBERS */
      .page::after {
        content: counter(page-counter);
        position: absolute;
        bottom: 20px;
        right: 50%;
        transform: translateX(50%);
        background: linear-gradient(135deg, #8b4513, #a0522d);
        color: #f8f5f0;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 13pt;
        border: 3px solid #d4af37;
        box-shadow: 
          0 6px 15px rgba(0,0,0,0.3),
          inset 0 1px 0 rgba(255,255,255,0.2),
          inset 0 -1px 0 rgba(0,0,0,0.2);
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      }
      
      /* Cover page doesn't increment counter */
      .cover-page {
        counter-increment: none;
      }
      
      .cover-page::after {
        display: none;
      }
      
      /* ===== VISUAL TIERS SYSTEM STYLES ===== */
      
      /* TIER 1: SPLASH ART - Maximum Dramatic Impact */
      .boss-splash-page {
        padding: 0;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }
      
      .boss-image-container {
        width: 100%;
        height: 100vh;
        position: relative;
      }
      
      .boss-splash-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(0.7) contrast(1.3) saturate(1.1);
      }
      
      .boss-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          135deg,
          rgba(0,0,0,0.4) 0%,
          rgba(0,0,0,0.2) 50%,
          rgba(0,0,0,0.6) 100%
        );
      }
      
      .boss-name-overlay {
        position: absolute;
        bottom: 15%;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        color: white;
        z-index: 10;
      }
      
      .boss-title {
        font-family: 'Cinzel', serif;
        font-size: 72pt;
        font-weight: 900;
        margin-bottom: 30px;
        letter-spacing: 8px;
        text-transform: uppercase;
        text-shadow: 
          4px 4px 8px rgba(0,0,0,0.95),
          0 0 30px rgba(212, 175, 55, 0.7),
          0 0 60px rgba(212, 175, 55, 0.3);
        color: #d4af37;
        line-height: 0.9;
        text-align: center;
        background: linear-gradient(135deg, #d4af37, #f4d03f, #d4af37);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.95));
      }
      
      .boss-subtitle {
        font-family: 'Cinzel', serif;
        font-size: 20pt;
        font-weight: 400;
        margin-bottom: 15px;
        color: #f8f5f0;
        font-style: italic;
        letter-spacing: 2px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      }
      
      .boss-cr {
        font-family: 'Cinzel', serif;
        font-size: 16pt;
        font-weight: 600;
        color: #d4af37;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        background: rgba(0,0,0,0.6);
        padding: 10px 20px;
        border-radius: 25px;
        border: 2px solid #d4af37;
        display: inline-block;
      }
      
      .boss-text-splash {
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #2c1810 0%, #8b4513 50%, #2c1810 100%);
      }
      
      /* Enhanced Boss Stat Block */
      .boss-stats-page {
        background: linear-gradient(135deg, #f8f5f0 0%, #f0ede8 100%);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 60px;
      }
      
      .boss-stat-block {
        background: linear-gradient(135deg, #fefefe 0%, #f8f8f8 100%);
        border: 5px solid #8b4513;
        border-radius: 15px;
        padding: 30px;
        box-shadow: 
          0 15px 35px rgba(0,0,0,0.3),
          inset 0 1px 0 rgba(255,255,255,0.2);
        position: relative;
      }
      
      .boss-stat-block::before {
        content: "FINAL BOSS";
        position: absolute;
        top: -15px;
        left: 20px;
        background: linear-gradient(135deg, #d4af37, #f4d03f);
        color: #2c1810;
        padding: 8px 20px;
        border-radius: 20px;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 12pt;
        border: 3px solid #8b4513;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10;
      }
      
      .boss-stat-content {
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
        box-shadow: none;
      }
      
      /* TIER 2: CONTEXT IMAGES - Functional Beauty */
      .scene-image-tier2 {
        width: 100%;
        max-width: 400px;
        margin-bottom: 25px;
        border: 4px solid #8b4513;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 
          0 8px 20px rgba(0,0,0,0.25),
          inset 0 1px 0 rgba(255,255,255,0.1);
        position: relative;
      }
      
      .context-image {
        width: 100%;
        height: 280px;
        object-fit: cover;
        filter: contrast(1.1) saturate(1.05) brightness(1.02);
        transition: transform 0.3s ease;
      }
      
      .context-image:hover {
        transform: scale(1.02);
      }
      
      .image-caption {
        background: linear-gradient(135deg, rgba(139, 69, 19, 0.95), rgba(160, 82, 45, 0.95));
        color: white;
        padding: 12px 15px;
        font-size: 11pt;
        text-align: center;
        font-style: italic;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        letter-spacing: 0.5px;
      }
      
      /* TIER 3: FLAVOR ART - Subtle Enhancement */
      .item-icon-tier3 {
        width: 70px;
        height: 70px;
        border-radius: 10px;
        overflow: hidden;
        border: 3px solid #d4af37;
        flex-shrink: 0;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        position: relative;
      }
      
      .item-icon-tier3::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, transparent 0%, rgba(212, 175, 55, 0.1) 100%);
        pointer-events: none;
      }
      
      .flavor-icon {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(1.1) contrast(1.05) saturate(1.1);
      }
      
      .minor-monster-icon {
        width: 90px;
        height: 90px;
        float: right;
        margin: 0 0 15px 20px;
        border-radius: 8px;
        border: 3px solid #8b4513;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        filter: brightness(1.05) contrast(1.1);
      }
      
      .minor-monster-container {
        display: flex;
        gap: 20px;
        align-items: flex-start;
      }
      
      .minor-monster-image {
        flex-shrink: 0;
      }
      
      .minor-stat-block {
        flex: 1;
        background: #fff;
        border: 3px solid #8b4513;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.15);
      }
      
      /* Enhanced Visual Gallery for Player Aids */
      .player-aids-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
        margin-top: 30px;
      }
      
      .aid-card {
        background: #fff;
        border: 3px solid #8b4513;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .aid-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      }
      
      .aid-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 15px;
        border: 2px solid #d4af37;
      }
      
      .aid-title {
        font-family: 'Cinzel', serif;
        font-size: 16pt;
        font-weight: 600;
        color: #8b4513;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .aid-type {
        background: #d4af37;
        color: #2c1810;
        padding: 4px 12px;
        border-radius: 15px;
        font-size: 10pt;
        font-weight: 600;
        display: inline-block;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .aid-description {
        font-style: italic;
        color: #666;
        font-size: 11pt;
        line-height: 1.4;
      }
      
      .gallery-usage-tips {
        background: #f8f5f0;
        border: 3px solid #d4af37;
        border-radius: 12px;
        padding: 25px;
        margin-top: 30px;
      }
      
      .gallery-usage-tips h3 {
        font-family: 'Cinzel', serif;
        font-size: 18pt;
        color: #8b4513;
        margin-bottom: 15px;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .tips-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .tips-list li {
        position: relative;
        padding: 10px 0 10px 35px;
        margin-bottom: 8px;
        line-height: 1.5;
        border-bottom: 1px dotted rgba(212, 175, 55, 0.3);
      }
      
      .tips-list li:last-child {
        border-bottom: none;
      }
      
      .tips-list li::before {
        content: "💡";
        position: absolute;
        left: 0;
        top: 10px;
        font-size: 14pt;
      }
      
      ${isProfessional ? `
      /* Professional Mode Enhanced Styles */
      .professional-badge {
        position: absolute;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #d4af37, #f4d03f);
        color: #2c1810;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 10pt;
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        border: 2px solid #b8860b;
      }
      
      .professional-quality-indicator {
        background: linear-gradient(135deg, #2c1810, #1a0f08);
        color: #d4af37;
        padding: 15px;
        border-radius: 10px;
        border: 2px solid #d4af37;
        margin: 20px 0;
        text-align: center;
        font-weight: bold;
      }
      
      .professional-layout-enhanced {
        border-left: 4px solid #d4af37;
        padding-left: 20px;
        margin: 20px 0;
        background: linear-gradient(90deg, rgba(212, 175, 55, 0.1), transparent);
      }
      
      .professional-stat-block {
        background: linear-gradient(135deg, #f8f5f0, #f0ede8);
        border: 3px solid #d4af37;
        border-radius: 15px;
        padding: 20px;
        margin: 20px 0;
        box-shadow: 0 6px 20px rgba(212, 175, 55, 0.2);
      }
      
      .professional-callout {
        background: linear-gradient(135deg, #2c1810, #1a0f08);
        color: #f8f5f0;
        padding: 20px;
        border-radius: 12px;
        border: 3px solid #d4af37;
        margin: 25px 0;
        position: relative;
      }
      
      .professional-callout::before {
        content: "👑";
        position: absolute;
        top: -15px;
        left: 20px;
        background: #d4af37;
        color: #2c1810;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 14pt;
      }
      ` : ''}
    `;
  }

  private generateCoverPage(adventure: any, coverImage?: string, isProfessional: boolean = false, professionalEnhancement?: any): string {
    console.log(`🎨 Cover Page: Title="${adventure.title}", HasImage=${!!coverImage}`);
    return `
      <div class="page cover-page">
        ${isProfessional ? `
          <div class="professional-badge">
            👑 Professional Enhanced
          </div>
        ` : ''}
        ${coverImage ? `
          <div class="cover-image-container">
            <img src="${coverImage}" alt="Adventure Cover" class="cover-image" />
            <div class="cover-overlay"></div>
          </div>
        ` : ''}
        <div class="cover-content">
          <h1 class="adventure-title">${adventure.title}</h1>
          <div class="adventure-subtitle">An Epic D&D Adventure</div>
          <div class="cover-icons">
            <svg class="cover-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.92 5L5 6.92l6.36 6.37L5 19.64 6.92 21.5l6.36-6.36L19.64 21.5 21.5 19.64l-6.36-6.35L21.5 6.93 19.64 5l-6.35 6.36L6.92 5z"/>
              <path d="M12 2L8.5 8.5L2 12l6.5 3.5L12 22l3.5-6.5L22 12l-6.5-3.5L12 2z"/>
            </svg>
            <svg class="cover-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
              <path d="M7 10h2v7H7zm4-3h2v10h-2zm4 1h2v9h-2z"/>
            </svg>
            <svg class="cover-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          ${isProfessional && professionalEnhancement ? `
            <div class="professional-quality-indicator">
              Professional Grade: ${professionalEnhancement.professionalGrade || 'A+'} | 
              Quality Score: ${professionalEnhancement.qualityMetrics?.overallScore || 95}/100
            </div>
          ` : ''}
          <div class="adventure-summary">
            <p>${adventure.summary || 'A mysterious and dangerous adventure awaits brave heroes, filled with ancient secrets, powerful enemies, and legendary treasures that will test their courage and resolve.'}</p>
          </div>
        </div>
      </div>
    `;
  }

  private generateTableOfContents(): string {
    console.log('📋 Generating Table of Contents');
    return `
      <div class="page toc-page">
        <h1 class="toc-title">Table of Contents</h1>
        <div class="toc-container">
          <div class="toc-item">
            <span class="toc-item-title">Background & Lore</span>
            <span class="toc-item-page">3</span>
          </div>
          <div class="toc-item">
            <span class="toc-item-title">Adventure Overview</span>
            <span class="toc-item-page">4</span>
          </div>
          <div class="toc-item">
            <span class="toc-item-title">Act I: The Beginning</span>
            <span class="toc-item-page">5</span>
          </div>
          <div class="toc-item">
            <span class="toc-item-title">Act II: The Unfolding</span>
            <span class="toc-item-page">6</span>
          </div>
          <div class="toc-item">
            <span class="toc-item-title">Act III: The Climax</span>
            <span class="toc-item-page">7</span>
          </div>
          <div class="toc-item">
            <span class="toc-item-title">Cast of Characters</span>
            <span class="toc-item-page">8</span>
          </div>
          <div class="toc-item">
            <span class="toc-item-title">Bestiary of Terrors</span>
            <span class="toc-item-page">9</span>
          </div>
          <div class="toc-item">
            <span class="toc-item-title">Treasures & Artifacts</span>
            <span class="toc-item-page">10</span>
          </div>
          <div class="toc-item">
            <span class="toc-item-title">Visual Gallery</span>
            <span class="toc-item-page">11</span>
          </div>
        </div>
      </div>
    `;
  }

  private generateAdventureOverview(adventure: any): string {
    return `
      <div class="page overview-page">
        <h1 class="section-title">Adventure Overview</h1>
        <div class="overview-container">
          <div class="overview-box">
            <div class="overview-header">Duration</div>
            <div class="overview-stats">
              <div class="stat-item">
                <span class="stat-value">4-6</span>
                <span class="stat-label">Hours</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">3-6</span>
                <span class="stat-label">Characters</span>
              </div>
            </div>
            <div class="overview-stats">
              <div class="stat-item">
                <span class="stat-value">3rd-7th</span>
                <span class="stat-label">Level Range</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">D&D 5E</span>
                <span class="stat-label">System</span>
              </div>
            </div>
          </div>
          <div class="overview-box">
            <div class="overview-header">Features</div>
            <div class="overview-content">
              <h3>What You'll Find Inside</h3>
              <ul class="overview-list">
                <li>Rich story and compelling NPCs</li>
                <li>Challenging combat encounters</li>
                <li>Exploration and discovery</li>
                <li>Unique magic items and treasures</li>
                <li>Detailed maps and handouts</li>
                <li>Professional artwork</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private generateBackgroundLore(adventure: any): string {
    return `
      <div class="page lore-page">
        <h1 class="section-title">Background & Lore</h1>
        <div class="lore-container">
          <div class="lore-content">
            <div class="lore-text">
              <p>${adventure.backgroundStory || 'Long ago, in a time when magic flowed freely through the world and ancient powers walked among mortals, a great evil was sealed away by the combined efforts of legendary heroes. For centuries, this darkness has remained dormant, its prison weakening with each passing year.'}</p>
              <p>Now, strange omens have begun to appear across the land. Scholars speak of ancient prophecies coming to pass, while common folk whisper of shadows that move without light and dreams that feel too real to be mere fantasy.</p>
              <p>The time has come for new heroes to rise, for the seals that bind the ancient evil grow weak, and only those brave enough to face the darkness can prevent a catastrophe that would reshape the very fabric of reality itself.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private generateScenes(adventure: any, images: string[], classifiedImages: ClassifiedImage[]): string {
    // Use real adventure scenes data instead of hardcoded data
    const scenes = adventure.scenes || [];
    
    if (scenes.length === 0) {
      console.log('⚠️  No scenes found in adventure data, using fallback');
      return this.generateFallbackScenes(images);
    }
    
    console.log(`📖 Generating ${scenes.length} scenes from adventure data`);

    return scenes.map((scene: any, index: number) => {
      // Get corresponding image for this scene (skip cover image at index 0)
      const sceneImage = images[index + 1];
      
      return `
        <div class="page scene-page">
          <h1 class="section-title">${scene.title || `Scene ${index + 1}`}</h1>
          <div class="scene-container">
            <div class="scene-content">
              ${sceneImage ? `
                <div class="scene-image-container">
                  <img src="${sceneImage}" alt="${scene.title || `Scene ${index + 1}`}" class="scene-image" />
                  <div class="scene-image-overlay">Scene ${index + 1}: ${scene.title || 'The adventure unfolds'}</div>
                </div>
              ` : ''}
              <div class="scene-section">
                <h3>Read Aloud</h3>
                <p><em>"${scene.readAloud || scene.description || 'The scene unfolds before the adventurers...'}"</em></p>
              </div>
              <div class="scene-section">
                <h3>Behind the Scenes</h3>
                <p>${scene.gmNotes || scene.details || scene.description || 'This scene advances the adventure narrative.'}</p>
              </div>
            </div>
            <div class="scene-sidebar">
              <div class="sidebar-box">
                <div class="sidebar-title">Scene Objectives</div>
                <ul>
                  ${(scene.objectives || scene.goals || ['Advance the story', 'Engage the players']).map((obj: string) => `<li>${obj}</li>`).join('')}
                </ul>
              </div>
              <div class="sidebar-box">
                <div class="sidebar-title">GM Notes</div>
                <p>${scene.gmAdvice || scene.tactics || scene.notes || 'Use this scene to engage your players and advance the narrative.'}</p>
              </div>
              ${this.generateMechanicalDetails(scene, index)}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  private generateFallbackScenes(images: string[]): string {
    const fallbackScenes = [
      {
        title: "Opening Scene",
        description: "The adventure begins as the heroes encounter their first challenge.",
        readAloud: "The adventure unfolds before you, filled with mystery and danger.",
        objectives: ["Begin the adventure", "Meet key characters", "Establish the setting"],
        gmNotes: "Use this scene to introduce the adventure and engage your players."
      }
    ];

    return fallbackScenes.map((scene, index) => {
      const sceneImage = images[index + 1];
      return `
        <div class="page scene-page">
          <h1 class="section-title">${scene.title}</h1>
          <div class="scene-container">
            <div class="scene-content">
              ${sceneImage ? `
                <div class="scene-image-container">
                  <img src="${sceneImage}" alt="${scene.title}" class="scene-image" />
                  <div class="scene-image-overlay">Scene ${index + 1}: ${scene.title}</div>
                </div>
              ` : ''}
              <div class="scene-section">
                <h3>Read Aloud</h3>
                <p><em>"${scene.readAloud}"</em></p>
              </div>
              <div class="scene-section">
                <h3>Behind the Scenes</h3>
                <p>${scene.description}</p>
              </div>
            </div>
            <div class="scene-sidebar">
              <div class="sidebar-box">
                <div class="sidebar-title">Scene Objectives</div>
                <ul>
                  ${scene.objectives.map(obj => `<li>${obj}</li>`).join('')}
                </ul>
              </div>
              <div class="sidebar-box">
                <div class="sidebar-title">GM Notes</div>
                <p>${scene.gmNotes}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  private generateFallbackCharacters(): string {
    return `
      <div class="page character-page">
        <h1 class="section-title">Cast of Characters</h1>
        <div class="character-grid">
          <div class="character-card">
            <div class="character-name">Adventure Guide</div>
            <div class="character-role">Helpful NPC</div>
            <div class="character-details">
              <p><strong>Personality:</strong> Wise and helpful, ready to assist the heroes</p>
              <p><strong>Motivation:</strong> Wants to see the adventure succeed</p>
            </div>
            <div class="character-quote">
              "The path ahead is dangerous, but I believe in you."
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private generateCastOfCharacters(adventure: any): string {
    // Use real adventure NPCs data instead of hardcoded data
    const characters = adventure.npcs || [];
    
    if (characters.length === 0) {
      console.log('⚠️  No NPCs found in adventure data, using fallback');
      return this.generateFallbackCharacters();
    }
    
    console.log(`👥 Generating ${characters.length} characters from adventure data`);

    return `
      <div class="page character-page">
        <h1 class="section-title">Cast of Characters</h1>
        <div class="character-grid">
          ${characters.map((char: any) => {
            // CRITICAL FIX: Ensure role consistency with motivation
            let displayRole = char.role || char.occupation || char.type || 'Important NPC';
            
            // Fix role if it conflicts with motivation (Alariel problem)
            if (char.motivation && typeof char.motivation === 'string') {
              const motivation = char.motivation.toLowerCase();
              if ((motivation.includes('protect') || motivation.includes('guard') || motivation.includes('save')) &&
                  (displayRole.toLowerCase().includes('villain') || displayRole.toLowerCase().includes('antagonist'))) {
                displayRole = char.isMainVillain ? 'Tragic Antagonist' : 'Misunderstood Guardian';
                console.log(`🔧 [PDF-FIX] Corrected role for ${char.name}: "${char.role}" → "${displayRole}" (protective motivation detected)`);
              }
            }
            
            return `
            <div class="character-card">
              <div class="character-name">${char.name || 'Unnamed Character'}</div>
              <div class="character-role">${displayRole}</div>
              <div class="character-details">
                <p><strong>Personality:</strong> ${char.personality || char.traits || 'A memorable character with unique traits'}</p>
                <p><strong>Motivation:</strong> ${char.motivation || char.goals || char.desires || 'Has their own agenda in the adventure'}</p>
                ${char.backstory ? `<p><strong>Background:</strong> ${char.backstory}</p>` : ''}
                ${char.visualDescription ? `<p><strong>Appearance:</strong> ${char.visualDescription}</p>` : ''}
                ${char.isMainVillain ? `<p><strong>⚠️ Note:</strong> This character serves as the adventure's primary antagonist and appears as the final boss monster.</p>` : ''}
              </div>
              <div class="character-quote">
                "${char.quote || char.catchphrase || char.dialogue || 'A memorable quote that captures their essence.'}"
              </div>
            </div>
          `;
          }).join('')}
        </div>
      </div>
    `;
  }

  private generateBestiaryOfTerrors(adventure: any, classifiedImages: ClassifiedImage[]): string {
    const monsters = adventure.monsters || [];
    console.log(`🐉 [BESTIARY] Found ${monsters.length} monsters in adventure`);
    
    if (monsters.length === 0) {
      console.log('⚠️  [BESTIARY] No monsters found, generating empty bestiary section');
      return `
        <div class="page bestiary-page">
          <h1 class="section-title">Bestiary of Terrors</h1>
          <div class="bestiary-intro">
            This adventure focuses on exploration, social encounters, and puzzles rather than combat encounters.
            The challenges your heroes face will test their wit, diplomacy, and problem-solving skills.
          </div>
        </div>
      `;
    }

    let bestiaryHTML = '';

    // SIMPLIFICADO: Generar introducción + primer monstruo en una sola página
    const firstMonster = monsters[0];
    console.log(`🐉 [BESTIARY] First monster: ${firstMonster.name}, CR: ${firstMonster.challengeRating}`);
    
    const isBoss = this.isBossMonster(firstMonster);
    console.log(`🐉 [BESTIARY] Is boss: ${isBoss}`);
    
    if (isBoss) {
      // Página combinada: Intro + Boss Preview
      bestiaryHTML += this.generateBossSplashPageWithIntro(firstMonster, classifiedImages);
      // Página separada: Boss Stats
      bestiaryHTML += this.generateBossStatBlockPage(firstMonster);
    } else {
      // Página combinada: Intro + Primer monstruo menor
      bestiaryHTML += this.generateMinorMonsterBlockWithIntro(firstMonster, classifiedImages);
    }

    // Procesar monstruos restantes (si los hay)
    for (let i = 1; i < monsters.length; i++) {
      const monster = monsters[i];
      const isBoss = this.isBossMonster(monster);
      
      if (isBoss) {
        bestiaryHTML += this.generateBossSplashPage(monster, classifiedImages);
        bestiaryHTML += this.generateBossStatBlockPage(monster);
      } else {
        bestiaryHTML += this.generateMinorMonsterBlock(monster, classifiedImages);
      }
    }

    return bestiaryHTML;
  }

  private generateBossSplashPageWithIntro(boss: any, classifiedImages: ClassifiedImage[]): string {
    console.log(`🖼️  [BOSS-INTRO] Generating intro page for boss: ${boss.name}`);
    console.log(`🖼️  [BOSS-INTRO] Available images: ${classifiedImages.length}`);
    
    // Buscar imagen del boss con múltiples estrategias
    let bossImage = classifiedImages.find(img => 
      img.contentType === 'boss-monster' && 
      img.metadata.title?.toLowerCase().includes(boss.name?.toLowerCase())
    );
    
    // Fallback 1: Cualquier imagen de boss-monster
    if (!bossImage) {
      bossImage = classifiedImages.find(img => img.contentType === 'boss-monster');
    }
    
    // Fallback 2: Cualquier imagen de monster
    if (!bossImage) {
      bossImage = classifiedImages.find(img => img.contentType === 'monster');
    }
    
    // Fallback 3: Primera imagen disponible (probablemente la portada)
    if (!bossImage && classifiedImages.length > 0) {
      bossImage = classifiedImages[0];
    }
    
    console.log(`🖼️  [BOSS-INTRO] Boss image found: ${!!bossImage}`);

    return `
      <div class="page bestiary-page">
        <h1 class="section-title">Bestiary of Terrors</h1>
        <div class="bestiary-intro">
          Within these pages lurk the creatures that will test your heroes' mettle. Each entry provides everything needed to bring these beings to life at your table.
        </div>
        
        ${bossImage ? `
          <div class="boss-showcase-image-full">
            <img src="${bossImage.url}" alt="${boss.name}" class="boss-showcase-img-full" />
          </div>
          <div class="boss-showcase-info">
            <h2 class="boss-showcase-name">${boss.name}</h2>
            <div class="boss-showcase-subtitle">The Final Challenge Awaits</div>
            <div class="boss-showcase-cr">Challenge Rating ${boss.challengeRating}</div>
            <div class="boss-showcase-note">Turn the page to face this legendary foe...</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateBossSplashPage(boss: any, classifiedImages: ClassifiedImage[]): string {
    const bossImage = classifiedImages.find(img => 
      img.contentType === 'boss-monster' && 
      img.metadata.title?.toLowerCase().includes(boss.name?.toLowerCase())
    );

    return `
      <div class="page boss-splash-page">
        ${bossImage ? `
          <div class="boss-image-container">
            <img src="${bossImage.url}" alt="${boss.name}" class="boss-splash-image" />
            <div class="boss-overlay">
              <div class="boss-name-overlay">
                <h1 class="boss-title">${boss.name}</h1>
                <div class="boss-subtitle">The Final Challenge Awaits</div>
                <div class="boss-cr">Challenge Rating ${boss.challengeRating}</div>
              </div>
            </div>
          </div>
        ` : `
          <div class="boss-text-splash">
            <div class="boss-name-overlay">
              <h1 class="boss-title">${boss.name}</h1>
              <div class="boss-subtitle">The Final Challenge Awaits</div>
              <div class="boss-cr">Challenge Rating ${boss.challengeRating}</div>
            </div>
          </div>
        `}
      </div>
    `;
  }

  private generateBossStatBlockPage(boss: any): string {
    return `
      <div class="page boss-stats-page">
        <div class="boss-stat-block">
          ${this.generateEnhancedStatBlock(boss, true)}
        </div>
      </div>
    `;
  }

  private generateMinorMonsterBlockWithIntro(monster: any, classifiedImages: ClassifiedImage[]): string {
    const monsterImage = classifiedImages.find(img => 
      img.contentType === 'minor-monster' && 
      img.metadata.title?.toLowerCase().includes(monster.name?.toLowerCase())
    );

    return `
      <div class="page minor-monster-page">
        <h1 class="section-title">Bestiary of Terrors</h1>
        <div class="bestiary-intro">
          Within these pages lurk the creatures that will test your heroes' mettle. Each entry provides everything needed to bring these beings to life at your table.
        </div>
        
        <div class="minor-monster-container">
          ${monsterImage ? `
            <div class="minor-monster-image">
              <img src="${monsterImage.url}" alt="${monster.name}" class="minor-monster-icon" />
            </div>
          ` : ''}
          <div class="minor-stat-block">
            ${this.generateEnhancedStatBlock(monster, false)}
          </div>
        </div>
      </div>
    `;
  }

  private generateMinorMonsterBlock(monster: any, classifiedImages: ClassifiedImage[]): string {
    const monsterImage = classifiedImages.find(img => 
      img.contentType === 'minor-monster' && 
      img.metadata.title?.toLowerCase().includes(monster.name?.toLowerCase())
    );

    return `
      <div class="page minor-monster-page">
        <div class="minor-monster-container">
          ${monsterImage ? `
            <div class="minor-monster-image">
              <img src="${monsterImage.url}" alt="${monster.name}" class="minor-monster-icon" />
            </div>
          ` : ''}
          <div class="minor-stat-block">
            ${this.generateEnhancedStatBlock(monster, false)}
          </div>
        </div>
      </div>
    `;
  }

  private generateEnhancedStatBlock(monster: any, isBoss: boolean): string {
    const getModifier = (score: number) => {
      const mod = Math.floor((score - 10) / 2);
      return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    const blockClass = isBoss ? 'boss-stat-content' : 'minor-stat-block';
    
    // CRITICAL FIX: Ensure consistent CR display (no conflicts)
    const challengeRating = monster.challengeRating || '1';
    console.log(`🔧 [PDF-FIX] Monster ${monster.name} CR: ${challengeRating}`);

    return `
      <div class="stat-block ${blockClass}">
        <div class="monster-header">
          <h1 class="monster-name">${monster.name}</h1>
          <div class="monster-type">${monster.size || 'Medium'} ${monster.type || 'creature'}, ${monster.alignment || 'neutral'}</div>
        </div>
        
        <div class="basic-stats">
          <div class="stat-line"><strong>Armor Class</strong> ${monster.armorClass || '12'}</div>
          <div class="stat-line"><strong>Hit Points</strong> ${monster.hitPoints || '25 (4d8 + 4)'}</div>
          <div class="stat-line"><strong>Speed</strong> ${monster.speed || '30 ft.'}</div>
        </div>
        
        <div class="abilities-grid">
          ${Object.entries(monster.abilities || {STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10}).map(([ability, score]) => `
            <div class="ability-score">
              <div class="ability-name">${ability}</div>
              <div class="ability-value">${score} (${getModifier(score as number)})</div>
            </div>
          `).join('')}
        </div>
        
        ${monster.skills ? `
          <div class="stat-line"><strong>Skills</strong> ${Array.isArray(monster.skills) ? monster.skills.join(', ') : monster.skills}</div>
        ` : ''}
        
        ${/* CRITICAL FIX: Show damage resistances/immunities from validation */ ''}
        ${monster.damageResistances && monster.damageResistances.length > 0 ? `
          <div class="stat-line"><strong>Damage Resistances</strong> ${Array.isArray(monster.damageResistances) ? monster.damageResistances.join(', ') : monster.damageResistances}</div>
        ` : ''}
        
        ${monster.damageImmunities && monster.damageImmunities.length > 0 ? `
          <div class="stat-line"><strong>Damage Immunities</strong> ${Array.isArray(monster.damageImmunities) ? monster.damageImmunities.join(', ') : monster.damageImmunities}</div>
        ` : ''}
        
        ${monster.conditionImmunities && monster.conditionImmunities.length > 0 ? `
          <div class="stat-line"><strong>Condition Immunities</strong> ${Array.isArray(monster.conditionImmunities) ? monster.conditionImmunities.join(', ') : monster.conditionImmunities}</div>
        ` : ''}
        
        ${monster.senses ? `
          <div class="stat-line"><strong>Senses</strong> ${Array.isArray(monster.senses) ? monster.senses.join(', ') : monster.senses}</div>
        ` : ''}
        
        ${monster.languages ? `
          <div class="stat-line"><strong>Languages</strong> ${Array.isArray(monster.languages) ? monster.languages.join(', ') : monster.languages}</div>
        ` : ''}
        
        <div class="stat-line"><strong>Challenge</strong> ${challengeRating} (${monster.proficiencyBonus || '+2'} PB)</div>
        
        ${/* CRITICAL FIX: Show spellcasting if present */ ''}
        ${monster.spellcasting ? `
          <div class="stat-section">
            <h3 class="stat-section-header">Spellcasting</h3>
            <div class="ability-entry">
              ${monster.spellcasting}
            </div>
          </div>
        ` : ''}
        
        ${monster.specialAbilities && monster.specialAbilities.length > 0 ? `
          <div class="stat-section">
            <h3 class="stat-section-header">Special Abilities</h3>
            ${monster.specialAbilities.map((ability: any) => `
              <div class="ability-entry">
                <span class="ability-name">${ability.name}</span> ${ability.description}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${this.generateActionsSection(monster, isBoss)}
        
        ${monster.reactions && monster.reactions.length > 0 ? `
          <div class="stat-section">
            <h3 class="stat-section-header">Reactions</h3>
            ${monster.reactions.map((reaction: any) => `
              <div class="ability-entry">
                <span class="ability-name">${reaction.name}</span> ${reaction.description}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${monster.bonusActions && monster.bonusActions.length > 0 ? `
          <div class="stat-section">
            <h3 class="stat-section-header">Bonus Actions</h3>
            ${monster.bonusActions.map((action: any) => `
              <div class="ability-entry">
                <span class="ability-name">${action.name}</span> ${action.description}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${monster.legendaryActions && monster.legendaryActions.length > 0 ? `
          <div class="stat-section">
            <h3 class="stat-section-header">Legendary Actions</h3>
            <p class="legendary-intro">The ${monster.name} can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The ${monster.name} regains spent legendary actions at the start of its turn.</p>
            ${monster.legendaryActions.map((action: any) => `
              <div class="ability-entry">
                <span class="ability-name">${action.name}${action.cost ? ` (Costs ${action.cost} Actions)` : ''}</span> ${action.description}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${monster.lairActions && monster.lairActions.length > 0 ? `
          <div class="stat-section">
            <h3 class="stat-section-header">Lair Actions</h3>
            <p class="lair-intro">On initiative count 20 (losing initiative ties), the ${monster.name} takes a lair action to cause one of the following effects:</p>
            ${monster.lairActions.map((action: any) => `
              <div class="ability-entry">
                <span class="ability-name">${action.name}</span> ${action.description}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${monster.combatTactics && monster.combatTactics.length > 0 ? `
          <div class="combat-tactics">
            <div class="tactics-title">Combat Tactics</div>
            <ul class="tactics-list">
              ${monster.combatTactics.map((tactic: string) => `<li>${tactic}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }



  private generateTreasuresArtifacts(adventure: any, classifiedImages: ClassifiedImage[]): string {
    // Use real adventure magic items data instead of hardcoded data
    const magicItems = adventure.magicItems || adventure.treasures || [];
    
    if (magicItems.length === 0) {
      console.log('⚠️  No magic items found in adventure data, using fallback');
      return this.generateFallbackTreasures();
    }
    
    console.log(`💎 Generating ${magicItems.length} magic items from adventure data`);
    
    return `
      <div class="page treasure-page">
        <h1 class="section-title">Treasures & Artifacts</h1>
        
        ${magicItems.map((item: any) => `
          <div class="treasure-card">
            <div class="treasure-name">${item.name || 'Mysterious Artifact'}</div>
            <div class="treasure-sections">
              <div class="treasure-section">
                <h3>Magical Properties</h3>
                <p>${item.properties || item.effects || item.abilities || 'This item possesses mysterious magical properties.'}</p>
              </div>
              <div class="treasure-section">
                <h3>Lore & History</h3>
                <p>${item.lore || item.history || item.background || 'Legends speak of this artifact\'s ancient origins.'}</p>
              </div>
              ${item.description ? `
                <div class="treasure-section">
                  <h3>Description</h3>
                  <p>${item.description}</p>
                </div>
              ` : ''}
              ${item.rarity ? `
                <div class="treasure-section">
                  <h3>Rarity</h3>
                  <p>${item.rarity}</p>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private generateFallbackTreasures(): string {
    return `
      <div class="page treasure-page">
        <h1 class="section-title">Treasures & Artifacts</h1>
        
        <div class="treasure-card">
          <div class="treasure-name">Ancient Relic</div>
          <div class="treasure-sections">
            <div class="treasure-section">
              <h3>Magical Properties</h3>
              <p>This mysterious artifact holds ancient power waiting to be discovered.</p>
            </div>
            <div class="treasure-section">
              <h3>Lore & History</h3>
              <p>Legends speak of this artifact's origins in forgotten times.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private generateEnhancedVisualGallery(adventure: any, classifiedImages: ClassifiedImage[]): string {
    const playerSafeImages = this.getPlayerSafeImages(classifiedImages);
    
    // Agregar imagen del boss principal para completar 4 tarjetas
    const bossImage = classifiedImages.find(img => 
      img.contentType === 'boss-monster' || 
      (img.contentType === 'monster' && this.isBossMonster(adventure.monsters?.[0]))
    );
    
    let imagesToShow = playerSafeImages.length > 0 ? playerSafeImages : classifiedImages.slice(0, 3);
    
    // Agregar boss si no está ya incluido y tenemos menos de 4 imágenes
    if (bossImage && imagesToShow.length < 4 && !imagesToShow.find(img => img.url === bossImage.url)) {
      const bossName = adventure.monsters?.[0]?.name || 'The Final Boss';
      const bossDescription = this.generateEpicBossDescription(adventure.monsters?.[0], adventure.title);
      
      imagesToShow.push({
        ...bossImage,
        metadata: {
          ...bossImage.metadata,
          title: bossName,
          description: bossDescription,
          playerSafe: false // Marcamos como no player-safe pero lo incluimos para completar
        }
      });
    }
    
    // Asegurar que tenemos exactamente 4 imágenes
    while (imagesToShow.length < 4 && classifiedImages.length > imagesToShow.length) {
      const nextImage = classifiedImages.find(img => !imagesToShow.find(shown => shown.url === img.url));
      if (nextImage) imagesToShow.push(nextImage);
      else break;
    }
    
    return `
      <div class="page gallery-page">
        <h1 class="section-title">Player Visual Aids</h1>
        <div class="gallery-intro">
          <p><strong>GM Tool:</strong> These images can be shown to players during gameplay to enhance immersion and provide visual context. Monster images are excluded to maintain mystery and suspense.</p>
          <p><em>Tip: Use these visuals when describing scenes, introducing NPCs, or revealing discovered magic items.</em></p>
        </div>
        
        <div class="player-aids-grid">
          ${imagesToShow.map((image, index) => `
            <div class="aid-card">
              <img src="${image.url}" alt="${image.metadata.title}" class="aid-image" />
              <h3 class="aid-title">${image.metadata.title}</h3>
              <div class="aid-type">${this.formatContentType(image.contentType)}</div>
              <div class="aid-description">${image.metadata.description}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="gallery-usage-tips">
          <h3>Usage Tips for Game Masters</h3>
          <ul class="tips-list">
            <li><strong>Scene Images:</strong> Show when players enter new locations</li>
            <li><strong>NPC Portraits:</strong> Reveal when characters are introduced</li>
            <li><strong>Magic Items:</strong> Display when items are discovered or identified</li>
          </ul>
        </div>
      </div>
    `;
  }

  private generateActionsSection(monster: any, isBoss: boolean): string {
    let actions = monster.actions || [];
    
    // If actions are too basic or missing, enhance them with thematic abilities
    if (actions.length <= 1 || this.hasOnlyBasicAttacks(actions)) {
      console.log(`🎯 [STAT-BLOCK] Enhancing actions for ${monster.name} (Boss: ${isBoss})`);
      actions = this.generateThematicActions(monster, isBoss);
    }
    
    if (actions.length === 0) return '';
    
    return `
      <div class="stat-section">
        <h3 class="stat-section-header">Actions</h3>
        ${actions.map((action: any) => `
          <div class="ability-entry">
            <span class="ability-name">${action.name}</span> ${action.description}
          </div>
        `).join('')}
      </div>
    `;
  }
  
  private hasOnlyBasicAttacks(actions: any[]): boolean {
    const basicAttacks = ['slam', 'bite', 'claw', 'punch', 'strike'];
    return actions.every(action => 
      basicAttacks.some(basic => action.name.toLowerCase().includes(basic))
    );
  }
  
  private generateThematicActions(monster: any, isBoss: boolean): any[] {
    const monsterName = monster.name || 'Creature';
    const monsterType = (monster.type || '').toLowerCase();
    const cr = parseInt(monster.challengeRating || '1');
    
    // Base actions that every monster should have
    let actions = [];
    
    // Determine thematic abilities based on monster type and name
    if (monsterName.toLowerCase().includes('sand') || monsterName.toLowerCase().includes('desert')) {
      actions = this.generateSandThemeActions(monsterName, cr, isBoss);
    } else if (monsterName.toLowerCase().includes('time') || monsterName.toLowerCase().includes('chrono')) {
      actions = this.generateTimeThemeActions(monsterName, cr, isBoss);
    } else if (monsterType.includes('elemental')) {
      actions = this.generateElementalActions(monsterName, cr, isBoss);
    } else if (monsterType.includes('undead')) {
      actions = this.generateUndeadActions(monsterName, cr, isBoss);
    } else if (isBoss) {
      actions = this.generateGenericBossActions(monsterName, cr);
    } else {
      actions = this.generateGenericActions(monsterName, cr);
    }
    
    return actions;
  }
  
  private generateSandThemeActions(name: string, cr: number, isBoss: boolean): any[] {
    const actions = [
      {
        name: "Multiattack",
        description: `The ${name} makes two slam attacks.`
      },
      {
        name: "Slam",
        description: `Melee Weapon Attack: +${Math.max(4, cr + 2)} to hit, reach 10 ft., one target. Hit: ${Math.max(10, cr * 2 + 5)} (2d8 + ${Math.max(2, Math.floor(cr/2))}) bludgeoning damage.`
      },
      {
        name: "Sand Storm (Recharge 5-6)",
        description: `The ${name} creates a whirling storm of sand in a 20-foot radius. All creatures in the area must make a DC ${Math.max(12, 8 + Math.floor(cr/2))} Constitution saving throw or be blinded until the end of their next turn and take ${Math.max(7, cr + 2)} (2d6) slashing damage.`
      }
    ];
    
    if (isBoss) {
      actions.push({
        name: "Quicksand Trap (1/Day)",
        description: `The ${name} causes the ground in a 15-foot square to become quicksand. Creatures in the area must make a DC ${Math.max(14, 8 + Math.floor(cr/2) + 2)} Dexterity saving throw or sink 5 feet and become restrained. A restrained creature can use an action to make a DC ${Math.max(14, 8 + Math.floor(cr/2) + 2)} Strength check to free itself.`
      });
    }
    
    return actions;
  }
  
  private generateTimeThemeActions(name: string, cr: number, isBoss: boolean): any[] {
    const actions = [
      {
        name: "Multiattack",
        description: `The ${name} makes two temporal strike attacks or casts two spells.`
      },
      {
        name: "Temporal Strike",
        description: `Melee Spell Attack: +${Math.max(6, cr + 4)} to hit, reach 5 ft., one target. Hit: ${Math.max(12, cr * 2 + 6)} (2d8 + ${Math.max(3, Math.floor(cr/2) + 1)}) force damage plus ${Math.max(4, Math.floor(cr/2))} (1d8) necrotic damage as time ages the target.`
      },
      {
        name: "Time Distortion (Recharge 5-6)",
        description: `The ${name} warps time around up to 3 creatures within 60 feet. Each target must make a DC ${Math.max(14, 8 + Math.floor(cr/2) + 2)} Wisdom saving throw. On a failure, the target is stunned until the end of their next turn as they experience temporal displacement.`
      }
    ];
    
    if (isBoss) {
      actions.push({
        name: "Temporal Rewind (1/Day)",
        description: `The ${name} rewinds time to the start of the previous turn. All creatures return to their positions and conditions from that time, but retain memory of what occurred. The ${name} then acts immediately.`
      });
    }
    
    return actions;
  }
  
  private generateElementalActions(name: string, cr: number, isBoss: boolean): any[] {
    return [
      {
        name: "Multiattack",
        description: `The ${name} makes two slam attacks.`
      },
      {
        name: "Slam",
        description: `Melee Weapon Attack: +${Math.max(4, cr + 2)} to hit, reach 10 ft., one target. Hit: ${Math.max(10, cr * 2 + 5)} (2d8 + ${Math.max(2, Math.floor(cr/2))}) bludgeoning damage.`
      },
      {
        name: "Elemental Burst (Recharge 5-6)",
        description: `The ${name} releases elemental energy in a 15-foot cone. Each creature in the area must make a DC ${Math.max(12, 8 + Math.floor(cr/2))} Dexterity saving throw, taking ${Math.max(14, cr * 2)} (4d6) elemental damage on a failure, or half as much on a success.`
      }
    ];
  }
  
  private generateUndeadActions(name: string, cr: number, isBoss: boolean): any[] {
    return [
      {
        name: "Multiattack",
        description: `The ${name} makes two attacks.`
      },
      {
        name: "Life Drain",
        description: `Melee Weapon Attack: +${Math.max(4, cr + 2)} to hit, reach 5 ft., one target. Hit: ${Math.max(8, cr * 2 + 3)} (2d6 + ${Math.max(2, Math.floor(cr/2))}) necrotic damage, and the ${name} regains half the damage dealt as hit points.`
      },
      {
        name: "Frightful Presence (Recharge 5-6)",
        description: `Each creature within 30 feet that can see the ${name} must make a DC ${Math.max(12, 8 + Math.floor(cr/2))} Wisdom saving throw or be frightened for 1 minute. A frightened creature can repeat the saving throw at the end of each of its turns, ending the effect on a success.`
      }
    ];
  }
  
  private generateGenericBossActions(name: string, cr: number): any[] {
    return [
      {
        name: "Multiattack",
        description: `The ${name} makes three attacks.`
      },
      {
        name: "Devastating Strike",
        description: `Melee Weapon Attack: +${Math.max(6, cr + 4)} to hit, reach 10 ft., one target. Hit: ${Math.max(15, cr * 3)} (3d8 + ${Math.max(4, Math.floor(cr/2) + 2)}) damage.`
      },
      {
        name: "Power Surge (Recharge 5-6)",
        description: `The ${name} unleashes a wave of energy. All creatures within 20 feet must make a DC ${Math.max(14, 8 + Math.floor(cr/2) + 2)} Constitution saving throw, taking ${Math.max(21, cr * 3)} (6d6) damage on a failure, or half as much on a success.`
      }
    ];
  }
  
  private generateGenericActions(name: string, cr: number): any[] {
    return [
      {
        name: "Attack",
        description: `Melee Weapon Attack: +${Math.max(3, cr + 1)} to hit, reach 5 ft., one target. Hit: ${Math.max(6, cr + 3)} (1d8 + ${Math.max(1, Math.floor(cr/2))}) damage.`
      }
    ];
  }

  private generateMechanicalDetails(scene: any, sceneIndex: number): string {
    // CRITICAL FIX: Use adventure data instead of generating new mechanics
    const details = [];
    
    // PRIORITY 1: Use skill checks from adventure data (consistent DCs)
    if (scene.skillChecks && scene.skillChecks.length > 0) {
      console.log(`🔧 [PDF-FIX] Using ${scene.skillChecks.length} skill checks from adventure data`);
      details.push(`
        <div class="sidebar-box mechanical-details">
          <div class="sidebar-title">Skill Checks</div>
          <ul>
            ${scene.skillChecks.map((check: any) => `<li><strong>${check.skill} DC ${check.dc}:</strong> ${check.description}</li>`).join('')}
          </ul>
        </div>
      `);
    } else if (scene.objectives) {
      // FALLBACK: Generate skill checks only if none provided
      const skillChecks = this.generateSkillChecks(scene.objectives, sceneIndex);
      if (skillChecks.length > 0) {
        details.push(`
          <div class="sidebar-box mechanical-details">
            <div class="sidebar-title">Skill Checks</div>
            <ul>
              ${skillChecks.map(check => `<li><strong>${check.skill} DC ${check.dc}:</strong> ${check.description}</li>`).join('')}
            </ul>
          </div>
        `);
      }
    }
    
    // PRIORITY 2: Use encounters from adventure data (complete encounters)
    if (scene.encounters && scene.encounters.length > 0) {
      console.log(`🔧 [PDF-FIX] Using ${scene.encounters.length} encounters from adventure data`);
      details.push(`
        <div class="sidebar-box mechanical-details">
          <div class="sidebar-title">Encounters</div>
          <ul>
            ${scene.encounters.map((encounter: any) => `
              <li><strong>${encounter.name}:</strong> ${encounter.description}
              ${encounter.trigger ? `<br><em>Trigger:</em> ${encounter.trigger}` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      `);
    }
    
    // PRIORITY 3: Use environmental hazards from adventure data (with save DCs)
    if (scene.environmentalHazards && scene.environmentalHazards.length > 0) {
      console.log(`🔧 [PDF-FIX] Using ${scene.environmentalHazards.length} environmental hazards from adventure data`);
      details.push(`
        <div class="sidebar-box mechanical-details">
          <div class="sidebar-title">Environmental Hazards</div>
          <ul>
            ${scene.environmentalHazards.map((hazard: any) => `
              <li><strong>${hazard.name}:</strong> ${hazard.description}
              ${hazard.saveDC ? `<br><em>Save:</em> DC ${hazard.saveDC}` : ''}
              ${hazard.damage ? `<br><em>Damage:</em> ${hazard.damage}` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      `);
    } else {
      // FALLBACK: Generate environmental features only if none provided
      const environmentalFeatures = this.generateEnvironmentalFeatures(scene, sceneIndex);
      if (environmentalFeatures.length > 0) {
        details.push(`
          <div class="sidebar-box mechanical-details">
            <div class="sidebar-title">Environmental Features</div>
            <ul>
              ${environmentalFeatures.map(feature => `<li><strong>${feature.name}:</strong> ${feature.description}</li>`).join('')}
            </ul>
          </div>
        `);
      }
    }
    
    // PRIORITY 4: Show special mechanics if present
    if (scene.specialMechanics) {
      console.log(`🔧 [PDF-FIX] Adding special mechanics: ${scene.specialMechanics.name}`);
      details.push(`
        <div class="sidebar-box mechanical-details">
          <div class="sidebar-title">Special Mechanics</div>
          <p><strong>${scene.specialMechanics.name}:</strong> ${scene.specialMechanics.description}</p>
          ${scene.specialMechanics.rules ? `<p><em>Rules:</em> ${scene.specialMechanics.rules}</p>` : ''}
        </div>
      `);
    }
    
    // FALLBACK: Potential complications only if no other mechanics
    if (details.length === 0) {
      const complications = this.generateSceneComplications(scene, sceneIndex);
      if (complications.length > 0) {
        details.push(`
          <div class="sidebar-box mechanical-details">
            <div class="sidebar-title">Potential Complications</div>
            <ul>
              ${complications.map(comp => `<li>${comp}</li>`).join('')}
            </ul>
          </div>
        `);
      }
    }
    
    return details.join('');
  }
  
  private generateSkillChecks(objectives: string[], sceneIndex: number): any[] {
    const checks = [];
    const baseDC = 12 + sceneIndex; // Escalating difficulty
    
    objectives.forEach(objective => {
      const objLower = objective.toLowerCase();
      
      if (objLower.includes('decipher') || objLower.includes('rune') || objLower.includes('ancient')) {
        checks.push({
          skill: 'Intelligence (Arcana)',
          dc: baseDC + 2,
          description: `Decipher ancient magical writings. Success reveals key information about the time loop mechanism.`
        });
      }
      
      if (objLower.includes('investigate') || objLower.includes('search') || objLower.includes('find')) {
        checks.push({
          skill: 'Intelligence (Investigation)',
          dc: baseDC,
          description: `Thoroughly search the area. Success uncovers hidden clues or secret passages.`
        });
      }
      
      if (objLower.includes('stealth') || objLower.includes('sneak') || objLower.includes('avoid')) {
        checks.push({
          skill: 'Dexterity (Stealth)',
          dc: baseDC + 1,
          description: `Move without being detected. Failure alerts nearby enemies or triggers traps.`
        });
      }
      
      if (objLower.includes('persuade') || objLower.includes('convince') || objLower.includes('negotiate')) {
        checks.push({
          skill: 'Charisma (Persuasion)',
          dc: baseDC,
          description: `Convince NPCs to provide assistance or information. Success grants advantage on future interactions.`
        });
      }
      
      if (objLower.includes('time') || objLower.includes('temporal') || objLower.includes('loop')) {
        checks.push({
          skill: 'Wisdom (Insight)',
          dc: baseDC + 3,
          description: `Understand the nature of temporal distortions. Success allows prediction of time loop resets.`
        });
      }
    });
    
    return checks;
  }
  
  private generateEnvironmentalFeatures(scene: any, sceneIndex: number): any[] {
    const features = [];
    const sceneName = (scene.title || '').toLowerCase();
    
    if (sceneName.includes('market') || sceneName.includes('bazaar')) {
      features.push({
        name: 'Crowded Streets',
        description: 'Difficult terrain due to crowds. Stealth checks have disadvantage, but Sleight of Hand checks have advantage.'
      });
      features.push({
        name: 'Merchant Stalls',
        description: 'Provide half cover. Can be knocked over (AC 12, 10 HP) to create difficult terrain in a 5-foot square.'
      });
    }
    
    if (sceneName.includes('chrono') || sceneName.includes('time')) {
      features.push({
        name: 'Temporal Distortion',
        description: `At the start of each round, roll 1d6. On a 1, time hiccups - all creatures must reroll initiative.`
      });
      features.push({
        name: 'Time Echoes',
        description: 'Ghostly images of past events play out. Wisdom (Perception) DC 15 to glean useful information from them.'
      });
    }
    
    if (sceneName.includes('sand') || sceneName.includes('desert')) {
      features.push({
        name: 'Shifting Sands',
        description: 'Difficult terrain. Constitution saving throw DC 12 each hour or gain one level of exhaustion from heat.'
      });
      features.push({
        name: 'Sandstorm',
        description: 'Heavily obscured area, disadvantage on Wisdom (Perception) checks that rely on sight.'
      });
    }
    
    // Add generic features if none were added
    if (features.length === 0) {
      features.push({
        name: 'Interactive Elements',
        description: 'The environment contains objects that can be manipulated to solve puzzles or gain tactical advantages.'
      });
    }
    
    return features;
  }
  
  private generateSceneComplications(scene: any, sceneIndex: number): string[] {
    const complications = [];
    const sceneName = (scene.title || '').toLowerCase();
    
    if (sceneName.includes('final') || sceneName.includes('confrontation')) {
      complications.push('The villain has prepared contingencies - if reduced to half hit points, they activate a desperate gambit.');
      complications.push('Environmental hazards activate during combat, forcing tactical repositioning.');
    } else if (sceneIndex === 0) {
      complications.push('A time loop reset occurs mid-scene, but the characters retain partial memories.');
      complications.push('An NPC recognizes the characters from a "previous" loop iteration.');
    } else {
      complications.push('A random encounter interrupts the scene - roll on the appropriate encounter table.');
      complications.push('The characters\' actions have unintended consequences that complicate future scenes.');
    }
    
    return complications;
  }

  private generateEpicBossDescription(boss: any, adventureTitle: string): string {
    console.log(`📝 [EPIC-DESC] Generating epic description for boss: ${boss?.name}`);
    
    if (!boss || !boss.name) {
      return 'The ultimate challenge that awaits at the climax of this epic adventure';
    }
    
    const epicDescriptions = [
      `The legendary ${boss.name} - a terror that has haunted the realm for ages, now awakened to face the heroes in their darkest hour`,
      `Behold ${boss.name}, the apex predator of this adventure whose very presence reshapes reality and bends the laws of nature`,
      `The dreaded ${boss.name} emerges from shadow and legend to test the heroes' ultimate resolve in a battle that will echo through eternity`,
      `${boss.name} - the final guardian whose defeat will determine the fate of all who dwell in these lands and beyond`,
      `The ancient ${boss.name} rises, bringing with it the accumulated malice of countless dark years and the power to unmake worlds`,
      `Face to face with ${boss.name}, the heroes must confront their greatest fear made manifest - a being of pure nightmare and destruction`
    ];
    
    // Seleccionar descripción basada en el nombre del boss para consistencia
    const index = (boss.name.length || 0) % epicDescriptions.length;
    const selectedDescription = epicDescriptions[index];
    
    console.log(`📝 [EPIC-DESC] Selected description: ${selectedDescription.substring(0, 50)}...`);
    return selectedDescription;
  }

  private formatContentType(contentType: string): string {
    const typeMap: { [key: string]: string } = {
      'scene': 'Scene',
      'npc': 'Character',
      'magic-item': 'Magic Item',
      'cover': 'Cover Art'
    };
    return typeMap[contentType] || contentType;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🖨️  PDF Service closed');
    }
  }

  async cleanup(): Promise<void> {
    await this.close();
  }
}