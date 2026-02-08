import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_ROUNDS = 10;

export interface JWTPayload {
  userId: number;
  email: string;
  roleIds: number[];
  permissionNames: string[];
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('[Auth] Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare plaintext password with hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('[Auth] Password verification error:', error);
    return false;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256',
    });
    return token;
  } catch (error) {
    console.error('[Auth] Token generation error:', error);
    throw new Error('Failed to generate token');
  }
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('[Auth] Token verification error:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Validate JWT secret is set
 */
export function validateAuthConfig(): void {
  if (!process.env.JWT_SECRET) {
    console.warn('[Auth] JWT_SECRET not set in environment. Using default. Set JWT_SECRET in production!');
  }
}
