import { Request, Response } from 'express';
import { createUser, getUserByEmail, verifyUserPassword } from '../models/User';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwt';
import { validatePasswordStrength } from '../utils/password';
import { logError, logWarning } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';
import { blacklistToken, isTokenBlacklisted } from '../models/TokenBlacklist';
import { createAuditLog } from '../models/AuditLog';

const getClientIp = (req: Request): string | undefined => {
  const h = req?.headers;
  const xff = h && (h['x-forwarded-for'] as string);
  const ip = xff ? xff.split(',')[0]?.trim() : (req?.socket as { remoteAddress?: string } | undefined)?.remoteAddress;
  return ip || undefined;
};
const getClientUserAgent = (req: Request): string | undefined =>
  req?.headers?.['user-agent'];

const getTokenExpiry = (token: string): Date | undefined => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) {
    return undefined;
  }
  return new Date(decoded.exp * 1000);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Create user
    const user = await createUser({ name, email, password });

    await createAuditLog({
      eventType: 'auth_register_success',
      userId: user.id,
      ip: getClientIp(req),
      userAgent: getClientUserAgent(req),
      metadata: { email: user.email },
    });
    
    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    const email = req.body?.email;
    logError(error, { context: 'User registration', email });
    if (error.code === '23505') { // PostgreSQL unique violation
      logWarning('Registration attempt with existing email', { email });
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    throw new CustomError('Registration failed', 500, 'REGISTRATION_ERROR');
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Verify credentials
    const user = await verifyUserPassword(email, password);
    if (!user) {
      await createAuditLog({
        eventType: 'auth_login_failure',
        ip: getClientIp(req),
        userAgent: getClientUserAgent(req),
        metadata: { email: String(email).slice(0, 100) },
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await createAuditLog({
      eventType: 'auth_login_success',
      userId: user.id,
      ip: getClientIp(req),
      userAgent: getClientUserAgent(req),
      metadata: { email: user.email },
    });
    
    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logError(error as Error, { context: 'User login', email: req.body?.email });
    throw new CustomError('Login failed', 500, 'LOGIN_ERROR');
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const isRefreshBlacklisted = await isTokenBlacklisted(refreshToken);
    if (isRefreshBlacklisted) {
      return res.status(401).json({ error: 'Refresh token has been revoked' });
    }
    
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    await createAuditLog({
      eventType: 'auth_refresh',
      userId: payload.userId,
      ip: getClientIp(req),
      userAgent: getClientUserAgent(req),
    });
    
    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });
    
    res.json({
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    logError(error, { context: 'Token refresh' });
    throw new CustomError(error.message || 'Invalid refresh token', 401, 'REFRESH_TOKEN_ERROR');
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;
    const { refreshToken } = req.body || {};

    if (accessToken) {
      await blacklistToken(accessToken, 'access', getTokenExpiry(accessToken));
    }

    if (refreshToken) {
      await blacklistToken(refreshToken, 'refresh', getTokenExpiry(refreshToken));
    }

    await createAuditLog({
      eventType: 'auth_logout',
      userId: req.user?.userId,
      ip: getClientIp(req),
      userAgent: getClientUserAgent(req),
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    logError(error as Error, { context: 'User logout', userId: req.user?.userId });
    throw new CustomError('Logout failed', 500, 'LOGOUT_ERROR');
  }
};

