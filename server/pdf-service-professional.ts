import puppeteer from 'puppeteer';
import { Pool } from 'pg';
import { query } from '../src/integrations/postgres/client';
import { MagicCreditsService } from './magic-credits-service';

export interface PDFGenerationOptions {
  template: 'classic' | 'modern' | 'fantasy' | 'minimalist';
  format: 'A4' | 'Letter' | 'A5';
  includeImages: boolean;
  includeStatBlocks: boolean;
  watermark?: boolean;
}

export interface PDFResult {
  success: boolean;
  buffer?: Buffer;
  error?: string;
  cost?: number;
  creditsUsed?: number;
  isPreview?: boolean;
}

export class ProfessionalPDFService {
  private magicCreditsService: MagicCreditsService;
  private docRaptorApiKey: string;

  constructor(pool: Pool) {
    console.log('[PDF-PROFESSIONAL] Initializing with pool:', !!pool);
    this.magicCreditsService = new MagicCreditsService(pool);
    this.docRaptorApiKey = process.env.DOCRAPTOR_API_KEY || '';
    
    if (!this.docRaptorApiKey) {
      console.warn('[PDF-PROFESSIONAL] DocRaptor API key not configured');
    }
    console.log('[PDF-PROFESSIONAL] Service initialized successfully');
  }

  /**
   * Generate professional PDF using DocRaptor (costs credits)
   */
  async generateProfessionalPDF(
    html: string, 
    options: PDFGenerationOptions,
    userId: string,
    adventureTitle: string
  ): Promise<PDFResult> {
    try {
      console.log(`[PDF-PROFESSIONAL] Generating professional PDF for user ${userId}`);

      if (!this.docRaptorApiKey) {
        return {
          success: false,
          error: 'DocRaptor API key not configured. Professional PDFs are temporarily unavailable.'
        };
      }

      // Check if user can afford PDF generation
      const canAfford = await this.magicCreditsService.canUserAffordAction(userId, 'pdfExport');
      if (!canAfford) {
        return {
          success: false,
          error: 'Insufficient credits for professional PDF generation. Upgrade your plan or purchase more credits.'
        };
      }

      // Optimize HTML for DocRaptor with CSS Paged Media
      const optimizedHtml = this.optimizeHTMLForPagedMedia(html, options, adventureTitle);

      // Generate PDF with DocRaptor API
      const requestConfig = {
        url: 'https://api.docraptor.com/docs',
        encoding: null,
        headers: {
          'Content-Type': 'application/json'
        },
        json: {
          user_credentials: this.docRaptorApiKey,
          doc: {
            document_content: optimizedHtml,
            type: "pdf",
            test: process.env.NODE_ENV === 'development', // watermarked for development
            prince_options: {
              media: 'print',
              baseurl: process.env.FRONTEND_URL || 'http://localhost:8080',
            }
          }
        }
      };

      console.log(`[PDF-PROFESSIONAL] Calling DocRaptor API...`);
      const startTime = Date.now();
      
      const pdfBuffer = await this.callDocRaptorAPI(requestConfig);
      
      const endTime = Date.now();
      const generationTime = endTime - startTime;

      // Consume magic credits
      const creditsConsumed = await this.magicCreditsService.consumeCredits(userId, 'pdfExport', {
        adventure_title: adventureTitle,
        template: options.template,
        generation_time_ms: generationTime
      });

      if (!creditsConsumed) {
        return {
          success: false,
          error: 'Failed to consume credits for PDF generation. Please try again.'
        };
      }

      console.log(`[PDF-PROFESSIONAL] ✅ Professional PDF generated in ${generationTime}ms`);

      return {
        success: true,
        buffer: pdfBuffer,
        cost: 0.12, // Estimated DocRaptor cost + margin
        creditsUsed: 1,
        isPreview: false
      };

    } catch (error) {
      console.error('[PDF-PROFESSIONAL] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate professional PDF'
      };
    }
  }

  /**
   * Make HTTP request to DocRaptor API
   */
  private async callDocRaptorAPI(config: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const postData = JSON.stringify(config.json);

      const options = {
        hostname: 'api.docraptor.com',
        port: 443,
        path: '/docs',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res: any) => {
        const chunks: Buffer[] = [];
        
        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          
          if (res.statusCode === 200) {
            resolve(buffer);
          } else {
            reject(new Error(`DocRaptor API error: ${res.statusCode} - ${buffer.toString()}`));
          }
        });
      });

      req.on('error', (error: Error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Generate preview PDF with watermark (free for all tiers)
   */
  async generatePreviewPDF(
    html: string,
    options: PDFGenerationOptions,
    adventureTitle: string
  ): Promise<PDFResult> {
    try {
      console.log(`[PDF-PREVIEW] Generating preview PDF with watermark`);

      // Add watermark to HTML
      const watermarkedHtml = this.addWatermarkToHTML(html, adventureTitle);

      // Use Puppeteer for preview (existing system)
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(watermarkedHtml, { waitUntil: 'networkidle0' });

      const pdfOptions = {
        format: options.format as any,
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 10px; color: #666; margin-left: 15mm;">🏰 Adventure Preview - Upgrade for Professional PDFs</div>',
        footerTemplate: '<div style="font-size: 10px; color: #666; text-align: center; width: 100%;">Page <span class="pageNumber"></span></div>'
      };

      const buffer = await page.pdf(pdfOptions);
      await browser.close();

      console.log(`[PDF-PREVIEW] ✅ Preview PDF generated with watermark`);

      return {
        success: true,
        buffer,
        cost: 0,
        creditsUsed: 0,
        isPreview: true
      };

    } catch (error) {
      console.error('[PDF-PREVIEW] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate preview PDF'
      };
    }
  }

  /**
   * Optimize HTML for CSS Paged Media (DocRaptor/Prince)
   */
  private optimizeHTMLForPagedMedia(
    html: string, 
    options: PDFGenerationOptions,
    adventureTitle: string
  ): string {
    const pagedMediaCSS = `
      <style>
        /* CSS Paged Media for professional layout */
        @page {
          size: ${options.format};
          margin: 18mm 14mm 20mm 14mm;
          
          @top-left {
            content: "🏰 ${adventureTitle}";
            font-family: 'Segoe UI', system-ui, sans-serif;
            font-size: 9pt;
            color: #666;
          }
          
          @top-right {
            content: "Page " counter(page) " of " counter(pages);
            font-family: 'Segoe UI', system-ui, sans-serif;
            font-size: 9pt;
            color: #666;
          }
          
          @bottom-center {
            content: "Generated by Arcanum Scribe";
            font-family: 'Segoe UI', system-ui, sans-serif;
            font-size: 8pt;
            color: #999;
          }
        }

        /* Professional typography */
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
          hyphens: auto;
        }

        /* Prevent awkward breaks */
        .stat-block, .adventure-section, table, .npc-block {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* Headings */
        h1 {
          break-before: right;
          string-set: chapter-title content();
          font-size: 24pt;
          margin-top: 0;
          margin-bottom: 18pt;
          color: #2c3e50;
        }

        h2 {
          break-after: avoid;
          font-size: 18pt;
          margin-top: 24pt;
          margin-bottom: 12pt;
          color: #34495e;
        }

        h3 {
          break-after: avoid;
          font-size: 14pt;
          margin-top: 18pt;
          margin-bottom: 9pt;
          color: #34495e;
        }

        /* Paragraphs */
        p {
          margin-bottom: 12pt;
          orphans: 3;
          widows: 3;
          text-align: justify;
        }

        /* Lists */
        ul, ol {
          break-inside: avoid;
        }

        /* Tables and stat blocks */
        .stat-block {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 12pt;
          margin: 12pt 0;
          background: #f9f9f9;
        }

        /* Images */
        img {
          max-width: 100%;
          height: auto;
          break-inside: avoid;
        }

        /* Template-specific styles */
        ${this.getTemplateStyles(options.template)}
      </style>
    `;

    // Insert CSS and optimize HTML structure
    const optimizedHtml = html
      .replace('<head>', `<head>${pagedMediaCSS}`)
      .replace(/<script.*?<\/script>/gs, '') // Remove scripts
      .replace(/style="[^"]*"/g, ''); // Clean inline styles

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${adventureTitle}</title>
          ${pagedMediaCSS}
        </head>
        <body>
          ${optimizedHtml}
        </body>
      </html>
    `;
  }

  /**
   * Add watermark to HTML for preview
   */
  private addWatermarkToHTML(html: string, adventureTitle: string): string {
    const watermarkCSS = `
      <style>
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          color: rgba(0, 0, 0, 0.1);
          font-weight: bold;
          z-index: 1000;
          pointer-events: none;
          font-family: Arial, sans-serif;
        }
        
        .watermark-corner {
          position: fixed;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-family: Arial, sans-serif;
        }
      </style>
    `;

    const watermarkHTML = `
      <div class="watermark">PREVIEW</div>
      <div class="watermark-corner">
        🏰 Upgrade to Creator for Professional PDFs
      </div>
    `;

    return html
      .replace('<head>', `<head>${watermarkCSS}`)
      .replace('<body>', `<body>${watermarkHTML}`);
  }

  /**
   * Get template-specific styles
   */
  private getTemplateStyles(template: string): string {
    const templates = {
      classic: `
        body { font-family: 'Georgia', serif; }
        h1, h2, h3 { font-family: 'Trajan Pro', 'Times New Roman', serif; }
        .stat-block { border-color: #8B4513; background: #FFF8DC; }
      `,
      modern: `
        body { font-family: 'Segoe UI', sans-serif; }
        h1, h2, h3 { font-family: 'Segoe UI', sans-serif; font-weight: 300; }
        .stat-block { border-color: #2196F3; background: #F5F5F5; }
      `,
      fantasy: `
        body { font-family: 'Cinzel', serif; }
        h1, h2, h3 { font-family: 'Cinzel', serif; color: #722F37; }
        .stat-block { border-color: #722F37; background: #FAF0E6; }
      `,
      minimalist: `
        body { font-family: 'Lato', sans-serif; }
        h1, h2, h3 { font-family: 'Lato', sans-serif; font-weight: 100; }
        .stat-block { border: none; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      `
    };

    return templates[template as keyof typeof templates] || templates.classic;
  }

  /**
   * Check if user can generate professional PDF
   */
  async canGenerateProfessionalPDF(userId: string): Promise<boolean> {
    return await this.magicCreditsService.canUserAffordAction(userId, 'pdfExport');
  }

  /**
   * Get user's remaining PDF credits
   */
  async getRemainingPDFCredits(userId: string): Promise<number> {
    const tierInfo = await this.magicCreditsService.getUserTierInfo(userId);
    return tierInfo?.credits.creditsRemaining || 0;
  }
}