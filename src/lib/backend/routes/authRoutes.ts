import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../config/database';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const generateToken = (userId: number): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateApiKey = (): string => {
  return 'lucid-' + uuidv4().replace(/-/g, '');
};

export const authRoutes = {
  async register(req: Request, res: Response) {
    const { email, password, name } = req.body;

    const existingUser = await database.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400, 'USER_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const apiKey = generateApiKey();

    const result = await database.run(
      'INSERT INTO users (email, password_hash, name, api_key) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name, apiKey]
    );

    const user = {
      id: result.id,
      email,
      name,
      apiKey
    };

    const token = generateToken(user.id);

    logger.info(`User registered: ${email}`, { userId: result.id });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        apiKey: user.apiKey,
        token
      }
    });
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await database.get(
      'SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.is_active) {
      throw new AppError('Account is disabled', 401, 'ACCOUNT_DISABLED');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    await database.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = generateToken(user.id);

    logger.info(`User logged in: ${email}`, { userId: user.id });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  },

  async getProfile(req: any, res: Response) {
    const user = await database.get(
      'SELECT id, email, name, role, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: { user }
    });
  }
};
