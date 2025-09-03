import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import ImageOptimizer from './image-optimizer';

interface CDNConfig {
  provider: 'aws' | 'cloudflare' | 'local';
  aws?: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    cloudFrontDomain?: string;
  };
  cloudflare?: {
    accountId: string;
    apiToken: string;
    domain: string;
  };
  local?: {
    baseUrl: string;
    uploadPath: string;
  };
}

class CDNService {
  private config: CDNConfig;
  private s3Client?: S3Client;
  private imageOptimizer: ImageOptimizer;

  constructor(config: CDNConfig) {
    this.config = config;
    this.imageOptimizer = new ImageOptimizer();

    if (config.provider === 'aws' && config.aws) {
      this.s3Client = new S3Client({
        region: config.aws.region,
        credentials: {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey,
        },
      });
    }
  }

  // Upload adventure assets to CDN
  async uploadAdventureAssets(
    adventureId: string,
    files: {
      thumbnail?: Buffer;
      images?: Buffer[];
      pdf?: Buffer;
    }
  ): Promise<{
    thumbnailUrl?: string;
    imageUrls?: string[];
    pdfUrl?: string;
  }> {
    const results: any = {};

    try {
      // Upload thumbnail
      if (files.thumbnail) {
        const thumbnailResult = await this.uploadImage(
          files.thumbnail,
          `adventures/${adventureId}/thumbnail.webp`,
          'image/webp'
        );
        results.thumbnailUrl = thumbnailResult.url;
      }

      // Upload images
      if (files.images && files.images.length > 0) {
        results.imageUrls = [];
        for (let i = 0; i < files.images.length; i++) {
          const imageResult = await this.uploadImage(
            files.images[i],
            `adventures/${adventureId}/image_${i + 1}.webp`,
            'image/webp'
          );
          results.imageUrls.push(imageResult.url);
        }
      }

      // Upload PDF
      if (files.pdf) {
        const pdfResult = await this.uploadFile(
          files.pdf,
          `adventures/${adventureId}/adventure.pdf`,
          'application/pdf'
        );
        results.pdfUrl = pdfResult.url;
      }

      return results;
    } catch (error) {
      console.error('Error uploading adventure assets:', error);
      throw error;
    }
  }

  // Upload optimized image
  private async uploadImage(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    // Validate and optimize image
    const validation = await this.imageOptimizer.validateImage(buffer);
    if (!validation.valid) {
      throw new Error(`Invalid image: ${validation.error}`);
    }

    // Optimize image before upload
    const optimizedBuffer = await this.optimizeImageForCDN(buffer);

    return await this.uploadFile(optimizedBuffer, key, contentType);
  }

  // Upload file to CDN
  private async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    switch (this.config.provider) {
      case 'aws':
        return await this.uploadToS3(buffer, key, contentType);
      case 'cloudflare':
        return await this.uploadToCloudflare(buffer, key, contentType);
      case 'local':
        return await this.uploadToLocal(buffer, key, contentType);
      default:
        throw new Error('Unsupported CDN provider');
    }
  }

  // AWS S3 upload
  private async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    if (!this.s3Client || !this.config.aws) {
      throw new Error('S3 client not configured');
    }

    const command = new PutObjectCommand({
      Bucket: this.config.aws.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year cache
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    await this.s3Client.send(command);

    // Return CloudFront URL if configured, otherwise S3 URL
    const baseUrl = this.config.aws.cloudFrontDomain
      ? `https://${this.config.aws.cloudFrontDomain}`
      : `https://${this.config.aws.bucket}.s3.${this.config.aws.region}.amazonaws.com`;

    return {
      url: `${baseUrl}/${key}`,
      key,
    };
  }

  // Cloudflare R2 upload (similar to S3)
  private async uploadToCloudflare(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    // Implementation for Cloudflare R2 would go here
    // For now, fallback to local storage
    return await this.uploadToLocal(buffer, key, contentType);
  }

  // Local storage upload
  private async uploadToLocal(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    if (!this.config.local) {
      throw new Error('Local storage not configured');
    }

    const fs = await import('fs/promises');
    const path = await import('path');

    const fullPath = path.join(this.config.local.uploadPath, key);
    const directory = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(directory, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, buffer);

    return {
      url: `${this.config.local.baseUrl}/${key}`,
      key,
    };
  }

  // Delete adventure assets
  async deleteAdventureAssets(adventureId: string): Promise<void> {
    const keys = [
      `adventures/${adventureId}/thumbnail.webp`,
      `adventures/${adventureId}/adventure.pdf`,
    ];

    // Add image keys (assuming max 10 images)
    for (let i = 1; i <= 10; i++) {
      keys.push(`adventures/${adventureId}/image_${i}.webp`);
    }

    for (const key of keys) {
      try {
        await this.deleteFile(key);
      } catch (error) {
        // Ignore errors for files that don't exist
        console.log(`File not found: ${key}`);
      }
    }
  }

  // Delete file from CDN
  private async deleteFile(key: string): Promise<void> {
    switch (this.config.provider) {
      case 'aws':
        await this.deleteFromS3(key);
        break;
      case 'cloudflare':
        await this.deleteFromCloudflare(key);
        break;
      case 'local':
        await this.deleteFromLocal(key);
        break;
    }
  }

  // Delete from S3
  private async deleteFromS3(key: string): Promise<void> {
    if (!this.s3Client || !this.config.aws) {
      throw new Error('S3 client not configured');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.config.aws.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  // Delete from Cloudflare
  private async deleteFromCloudflare(key: string): Promise<void> {
    // Implementation for Cloudflare R2 would go here
    await this.deleteFromLocal(key);
  }

  // Delete from local storage
  private async deleteFromLocal(key: string): Promise<void> {
    if (!this.config.local) {
      throw new Error('Local storage not configured');
    }

    const fs = await import('fs/promises');
    const path = await import('path');

    const fullPath = path.join(this.config.local.uploadPath, key);
    
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // File doesn't exist, ignore
    }
  }

  // Generate signed URL for temporary access
  async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.config.provider === 'aws' && this.s3Client && this.config.aws) {
      const command = new GetObjectCommand({
        Bucket: this.config.aws.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    }

    // For other providers, return direct URL
    return this.getPublicUrl(key);
  }

  // Get public URL for asset
  getPublicUrl(key: string): string {
    switch (this.config.provider) {
      case 'aws':
        if (!this.config.aws) throw new Error('AWS config not found');
        const baseUrl = this.config.aws.cloudFrontDomain
          ? `https://${this.config.aws.cloudFrontDomain}`
          : `https://${this.config.aws.bucket}.s3.${this.config.aws.region}.amazonaws.com`;
        return `${baseUrl}/${key}`;
      
      case 'cloudflare':
        if (!this.config.cloudflare) throw new Error('Cloudflare config not found');
        return `https://${this.config.cloudflare.domain}/${key}`;
      
      case 'local':
        if (!this.config.local) throw new Error('Local config not found');
        return `${this.config.local.baseUrl}/${key}`;
      
      default:
        throw new Error('Unsupported CDN provider');
    }
  }

  // Optimize image for CDN upload
  private async optimizeImageForCDN(buffer: Buffer): Promise<Buffer> {
    const sharp = await import('sharp');
    
    return await sharp.default(buffer)
      .webp({ 
        quality: 85, 
        progressive: true,
        effort: 6 
      })
      .toBuffer();
  }

  // Purge CDN cache
  async purgeCacheForAdventure(adventureId: string): Promise<void> {
    const urls = [
      this.getPublicUrl(`adventures/${adventureId}/thumbnail.webp`),
      this.getPublicUrl(`adventures/${adventureId}/adventure.pdf`),
    ];

    // Add image URLs
    for (let i = 1; i <= 10; i++) {
      urls.push(this.getPublicUrl(`adventures/${adventureId}/image_${i}.webp`));
    }

    await this.purgeCache(urls);
  }

  // Purge cache (implementation depends on CDN provider)
  private async purgeCache(urls: string[]): Promise<void> {
    switch (this.config.provider) {
      case 'aws':
        // CloudFront cache invalidation would go here
        console.log('CloudFront cache invalidation not implemented');
        break;
      case 'cloudflare':
        // Cloudflare cache purge would go here
        console.log('Cloudflare cache purge not implemented');
        break;
      case 'local':
        // No cache to purge for local storage
        break;
    }
  }
}

export default CDNService;