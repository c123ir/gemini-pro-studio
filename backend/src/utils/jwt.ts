// backend/src/utils/jwt.ts
// JWT utilities for authentication

import jwt, { SignOptions } from 'jsonwebtoken';
import { logger } from './logger';

// JWT token types
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

/**
 * Generate a JWT token
 */
export const generateJwt = (
  payload: JwtPayload,
  expiresIn: string = '1d'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      reject(new Error('JWT configuration error'));
      return;
    }
    
    try {
      const options: SignOptions = { 
        expiresIn: expiresIn as jwt.SignOptions['expiresIn']
      };
      const token = jwt.sign(payload, secret as jwt.Secret, options);
      resolve(token);
    } catch (err) {
      logger.error('JWT generation error:', err);
      reject(err);
    }
  });
};

/**
 * Verify a JWT token
 */
export const verifyJwt = (token: string): Promise<JwtPayload | null> => {
  return new Promise((resolve) => {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      resolve(null);
      return;
    }
    
    try {
      const decoded = jwt.verify(token, secret as jwt.Secret) as JwtPayload;
      resolve(decoded);
    } catch (err) {
      logger.warn('JWT verification failed:', err);
      resolve(null);
    }
  });
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (
  userId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
    
    if (!secret) {
      logger.error('REFRESH_TOKEN_SECRET is not defined in environment variables');
      reject(new Error('JWT configuration error'));
      return;
    }
    
    try {
      const options: SignOptions = { 
        expiresIn: '30d' as jwt.SignOptions['expiresIn']
      };
      const token = jwt.sign({ id: userId }, secret as jwt.Secret, options);
      resolve(token);
    } catch (err) {
      logger.error('Refresh token generation error:', err);
      reject(err);
    }
  });
}; 