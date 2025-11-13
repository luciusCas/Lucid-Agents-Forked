import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { database } from '../config/database';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN' 
      });
    }

    // Verify JWT token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Get user from database
    const user = await database.get(
      'SELECT id, email, name, role, api_key, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.',
        code: 'USER_NOT_FOUND' 
      });
    }

    if (!user.is_active) {
      return res.status(401).json({ 
        error: 'Account is disabled.',
        code: 'ACCOUNT_DISABLED' 
      });
    }

    // Add user to request
    req.user = user;
    next();
    
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.',
        code: 'INVALID_TOKEN' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token has expired.',
        code: 'TOKEN_EXPIRED' 
      });
    }

    logger.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error.',
      code: 'SERVER_ERROR' 
    });
  }
};

// API Key authentication middleware
export const apiKeyAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key required.',
        code: 'NO_API_KEY' 
      });
    }

    // Find user by API key
    const user = await database.get(
      'SELECT id, email, name, role, is_active FROM users WHERE api_key = ?',
      [apiKey]
    );

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid API key.',
        code: 'INVALID_API_KEY' 
      });
    }

    if (!user.is_active) {
      return res.status(401).json({ 
        error: 'Account is disabled.',
        code: 'ACCOUNT_DISABLED' 
      });
    }

    // Update last used
    await database.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    req.user = user;
    next();
    
  } catch (error) {
    logger.error('API key auth error:', error);
    res.status(500).json({ 
      error: 'Internal server error.',
      code: 'SERVER_ERROR' 
    });
  }
};

// Optional auth middleware
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      const user = await database.get(
        'SELECT id, email, name, role, is_active FROM users WHERE id = ?',
        [decoded.userId]
      );
      
      if (user && user.is_active) {
        req.user = user;
      }
    } catch (error) {
      // Ignore auth errors for optional auth
    }
  }
  
  next();
};

// Role-based authorization
export const requireRole = (roles: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED' 
      });
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ 
        error: 'Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredRoles,
        user: userRoles
      });
    }

    next();
  };
};
