"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const register = async (req, res) => {
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
        const passwordValidation = (0, password_1.validatePasswordStrength)(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.message });
        }
        // Check if user already exists
        const existingUser = await (0, User_1.getUserByEmail)(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }
        // Create user
        const user = await (0, User_1.createUser)({ name, email, password });
        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
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
    }
    catch (error) {
        const email = req.body?.email;
        (0, logger_1.logError)(error, { context: 'User registration', email });
        if (error.code === '23505') { // PostgreSQL unique violation
            (0, logger_1.logWarning)('Registration attempt with existing email', { email });
            return res.status(409).json({ error: 'User with this email already exists' });
        }
        throw new errorHandler_1.CustomError('Registration failed', 500, 'REGISTRATION_ERROR');
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Verify credentials
        const user = await (0, User_1.verifyUserPassword)(email, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
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
    }
    catch (error) {
        (0, logger_1.logError)(error, { context: 'User login', email: req.body?.email });
        throw new errorHandler_1.CustomError('Login failed', 500, 'LOGIN_ERROR');
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
        // Verify refresh token
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        // Generate new access token
        const newAccessToken = (0, jwt_1.generateAccessToken)({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        });
        res.json({
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        (0, logger_1.logError)(error, { context: 'Token refresh' });
        throw new errorHandler_1.CustomError(error.message || 'Invalid refresh token', 401, 'REFRESH_TOKEN_ERROR');
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        // In a production app, you might want to blacklist the token
        // For now, we'll just return success
        res.json({ message: 'Logout successful' });
    }
    catch (error) {
        (0, logger_1.logError)(error, { context: 'User logout', userId: req.user?.userId });
        throw new errorHandler_1.CustomError('Logout failed', 500, 'LOGOUT_ERROR');
    }
};
exports.logout = logout;
