import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { logger } from './logger';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw error;
  }
}

export async function comparePasswords(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Error comparing passwords:', error);
    throw error;
  }
}

export function generateToken(payload: {
  userId: number;
  email: string;
  roles: string[];
  permissions: string[];
}): string {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256',
    });
  } catch (error) {
    logger.error('Error generating token:', error);
    throw error;
  }
}

export function verifyToken(
  token: string,
): {
  userId: number;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
} | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      roles: string[];
      permissions: string[];
      iat: number;
      exp: number;
    };
  } catch (error) {
    logger.error('Error verifying token:', error);
    return null;
  }
}

export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Error decoding token:', error);
    return null;
  }
}
