/**
 * Image Processing Utility
 * Handles image upload, resize, and optimization
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class ImageProcessor {
  private static readonly AVATAR_SIZE = 500; // 500x500px
  private static readonly UPLOAD_DIR = path.join(__dirname, '../../uploads/avatars');
  private static readonly ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Process and save avatar image
   */
  static async processAvatar(
    buffer: Buffer,
    originalName: string
  ): Promise<{ filename: string; url: string; size: number }> {
    try {
      // Ensure upload directory exists
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });

      // Generate unique filename
      const ext = path.extname(originalName).toLowerCase().replace('.', '');
      
      if (!this.ALLOWED_FORMATS.includes(ext)) {
        throw new Error(`Invalid file format. Allowed: ${this.ALLOWED_FORMATS.join(', ')}`);
      }

      const hash = crypto.randomBytes(16).toString('hex');
      const filename = `avatar_${hash}_${Date.now()}.${ext}`;
      const filepath = path.join(this.UPLOAD_DIR, filename);

      // Process image: resize, optimize, convert to JPEG
      const processedBuffer = await sharp(buffer)
        .resize(this.AVATAR_SIZE, this.AVATAR_SIZE, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toBuffer();

      // Save to disk
      await fs.writeFile(filepath, processedBuffer);

      const size = processedBuffer.length;
      const url = `/uploads/avatars/${filename}`;

      return { filename, url, size };
    } catch (error: any) {
      throw new Error(`Failed to process avatar: ${error.message}`);
    }
  }

  /**
   * Delete avatar file
   */
  static async deleteAvatar(filename: string): Promise<void> {
    try {
      const filepath = path.join(this.UPLOAD_DIR, filename);
      await fs.unlink(filepath);
    } catch (error: any) {
      // Ignore if file doesn't exist
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Generate default avatar with initials
   * Returns SVG as base64 data URL
   */
  static generateDefaultAvatar(initials: string, backgroundColor: string = '#1976d2'): string {
    const svg = `
      <svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="500" height="500" fill="${backgroundColor}"/>
        <text
          x="50%"
          y="50%"
          dominant-baseline="middle"
          text-anchor="middle"
          fill="#ffffff"
          font-family="Arial, sans-serif"
          font-size="200"
          font-weight="bold">
          ${initials.toUpperCase()}
        </text>
      </svg>
    `;

    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Get initials from name
   */
  static getInitials(firstName: string, lastName: string): string {
    const first = (firstName || '').charAt(0).toUpperCase();
    const last = (lastName || '').charAt(0).toUpperCase();
    return first + last;
  }
}

