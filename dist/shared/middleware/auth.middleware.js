"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const httpStatus_1 = require("../constants/httpStatus");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: 'No token provided' });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Attach user to request with both userId and id for compatibility
        req.user = {
            id: decoded.userId,
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Optional Authentication Middleware
 * Doesn't fail if no token, but attaches user if valid token exists
 */
const optionalAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Attach user to request with both userId and id for compatibility
            req.user = {
                id: decoded.userId,
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
        }
        next();
    }
    catch (error) {
        // Continue without user
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
