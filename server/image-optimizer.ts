import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  progressive?: boolean;
}

interface ThumbnailSizes {
  small: { width: 200, height: 150 };
  medium: { width: 400, height: 300 };
  large: { width: 800, height: 600 };
}

class ImageOptimizer {
  private uploadDir: string;
  private thumbnailDir: string;
  private thumbnailSizes: ThumbnailSizes;

  constructor(uploadDir: string = 'uploads') {
    this.uploadDir = uploadDir;
    this.thumbnailDir = path.join(uploadDir, 'thumbnails');
    this.thumbnailSizes = {
      small: { width: 200, height: 150 },
      medium: { width: 400, height: 300 },
      large: { width: 800, height: 600 }
    };
    
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.thumbnailDir, { recursive: true });
      
      // Create size-specific directories
      for (const size of Object.keys(this.thumbnailSizes)) {
        await fs.mkdir(path.join(this.thumbnailDir, size), { recursive: true });
      }
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  // Optimize and generate thumbnails for adventure images
  async processAdventureImage(
    inputBuffer: Buffer,
    filename: string,
    adventureId: string
  ): Promise<{
    original: string;
    thumbnails: { [key: string]: string };
  }> {
    const fileExtension = path.extname(filename);
    const baseName = path.basename(filename, fileExtension);
    const optimizedName = `${adventureId}_${baseName}`;

    // Optimize original image
    const originalPath = await this.optimizeImage(
      inputBuffer,
      path.join(this.uploadDir, `${optimizedName}.webp`),
      { quality: 85, format: 'webp', progressive: true }
    );

    // Generate thumbnails
    const thumbnails: { [key: string]: string } = {};
    
    for (const [size, dimensions] of Object.entries(this.thumbnailSizes)) {
      const thumbnailPath = await this.generateThumbnail(
        inputBuffer,
        path.join(this.thumbnailDir, size, `${optimizedName}.webp`),
        dimensions.width,
        dimensions.height
      );
      thumbnails[size] = thumbnailPath;
    }

    return {
      original: originalPath,
      thumbnails
    };
  }

  // Optimize single image
  private async optimizeImage(
    inputBuffer: Buffer,
    outputPath: string,
    options: ImageOptimizationOptions = {}
  ): Promise<string> {
    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      progressive = true
    } = options;

    let pipeline = sharp(inputBuffer);

    // Resize if dimensions provided
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'cover',
        position: 'center'
      });
    }

    // Apply format-specific optimizations
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ 
          quality, 
          progressive,
          effort: 6 // Higher effort for better compression
        });
        break;
      case 'jpeg':
        pipeline = pipeline.jpeg({ 
          quality, 
          progressive,
          mozjpeg: true // Use mozjpeg encoder for better compression
        });
        break;
      case 'png':
        pipeline = pipeline.png({ 
          quality,
          progressive,
          compressionLevel: 9
        });
        break;
    }

    await pipeline.toFile(outputPath);
    return outputPath;
  }

  // Generate thumbnail with specific dimensions
  private async generateThumbnail(
    inputBuffer: Buffer,
    outputPath: string,
    width: number,
    height: number
  ): Promise<string> {
    await sharp(inputBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: 80, 
        progressive: true,
        effort: 6
      })
      .toFile(outputPath);

    return outputPath;
  }

  // Generate responsive image set
  async generateResponsiveImages(
    inputBuffer: Buffer,
    baseName: string,
    adventureId: string
  ): Promise<{
    srcset: string;
    sizes: string;
    fallback: string;
  }> {
    const responsiveSizes = [
      { width: 320, suffix: 'mobile' },
      { width: 768, suffix: 'tablet' },
      { width: 1200, suffix: 'desktop' },
      { width: 1920, suffix: 'large' }
    ];

    const srcsetEntries: string[] = [];
    let fallbackUrl = '';

    for (const size of responsiveSizes) {
      const filename = `${adventureId}_${baseName}_${size.suffix}.webp`;
      const outputPath = path.join(this.uploadDir, 'responsive', filename);
      
      await this.ensureDirectory(path.dirname(outputPath));
      
      await this.optimizeImage(inputBuffer, outputPath, {
        width: size.width,
        quality: 85,
        format: 'webp',
        progressive: true
      });

      const url = `/uploads/responsive/${filename}`;
      srcsetEntries.push(`${url} ${size.width}w`);
      
      if (size.width === 768) {
        fallbackUrl = url; // Use tablet size as fallback
      }
    }

    return {
      srcset: srcsetEntries.join(', '),
      sizes: '(max-width: 320px) 320px, (max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px',
      fallback: fallbackUrl
    };
  }

  // Lazy loading placeholder generation
  async generatePlaceholder(
    inputBuffer: Buffer,
    width: number = 20,
    height: number = 15
  ): Promise<string> {
    const placeholder = await sharp(inputBuffer)
      .resize(width, height, { fit: 'cover' })
      .blur(2)
      .webp({ quality: 20 })
      .toBuffer();

    // Convert to base64 data URL
    const base64 = placeholder.toString('base64');
    return `data:image/webp;base64,${base64}`;
  }

  // Clean up old images
  async cleanupOldImages(adventureId: string): Promise<void> {
    try {
      const patterns = [
        path.join(this.uploadDir, `${adventureId}_*`),
        path.join(this.thumbnailDir, '*', `${adventureId}_*`),
        path.join(this.uploadDir, 'responsive', `${adventureId}_*`)
      ];

      for (const pattern of patterns) {
        const files = await this.globFiles(pattern);
        for (const file of files) {
          await fs.unlink(file);
        }
      }
    } catch (error) {
      console.error('Error cleaning up images:', error);
    }
  }

  // Get image metadata
  async getImageMetadata(filePath: string): Promise<sharp.Metadata> {
    return await sharp(filePath).metadata();
  }

  // Validate image file
  async validateImage(buffer: Buffer): Promise<{
    valid: boolean;
    metadata?: sharp.Metadata;
    error?: string;
  }> {
    try {
      const metadata = await sharp(buffer).metadata();
      
      // Check file size (max 10MB)
      if (buffer.length > 10 * 1024 * 1024) {
        return { valid: false, error: 'File size too large (max 10MB)' };
      }

      // Check dimensions (max 4000x4000)
      if (metadata.width && metadata.height) {
        if (metadata.width > 4000 || metadata.height > 4000) {
          return { valid: false, error: 'Image dimensions too large (max 4000x4000)' };
        }
      }

      // Check format
      const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
      if (!metadata.format || !allowedFormats.includes(metadata.format)) {
        return { valid: false, error: 'Unsupported image format' };
      }

      return { valid: true, metadata };
    } catch (error) {
      return { valid: false, error: 'Invalid image file' };
    }
  }

  // Utility methods
  private async ensureDirectory(dir: string): Promise<void> {
    await fs.mkdir(dir, { recursive: true });
  }

  private async globFiles(pattern: string): Promise<string[]> {
    // Simple glob implementation for cleanup
    const dir = path.dirname(pattern);
    const filename = path.basename(pattern);
    
    try {
      const files = await fs.readdir(dir);
      const regex = new RegExp(filename.replace('*', '.*'));
      return files
        .filter(file => regex.test(file))
        .map(file => path.join(dir, file));
    } catch (error) {
      return [];
    }
  }
}

export default ImageOptimizer;