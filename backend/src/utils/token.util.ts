import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

/**
 * Reusable JWT Token Utilities
 * Handles token generation, verification, and refresh token logic
 */

interface ITokenPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
  email: string;
}

export class TokenUtil {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  private static readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  /**
   * Generate access token
   */
  static generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN as any
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN as any
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokens(payload: ITokenPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as ITokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET) as ITokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): ITokenPayload | null {
    try {
      return jwt.decode(token) as ITokenPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get token expiry time
   */
  static getTokenExpiry(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
