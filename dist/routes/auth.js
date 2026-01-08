"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const jwt = __importStar(require("jsonwebtoken"));
const User_1 = require("../models/users/User");
const config_1 = require("../config");
const logger_1 = require("../shared/utils/logger");
const container_1 = require("../di/container");
const httpStatus_1 = require("../shared/constants/httpStatus");
const auth_1 = require("../shared/middleware/auth");
const validate_1 = require("../shared/middleware/validate");
const auth_schema_1 = require("../shared/validation/auth.schema");
exports.authRoutes = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "password123"
 *         confirmPassword:
 *           type: string
 *           minLength: 6
 *           example: "password123"
 *         userName:
 *           type: string
 *           example: "Nguyễn Văn A"
 *         phone:
 *           type: string
 *           example: "0901234567"
 *         date_of_birth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         address:
 *           type: object
 *           properties:
 *             province:
 *               type: string
 *               example: "Hà Nội"
 *             district:
 *               type: string
 *               example: "Ba Đình"
 *             commune:
 *               type: string
 *               example: "Phúc Xá"
 *             street:
 *               type: string
 *               example: "Đường ABC"
 *             detail:
 *               type: string
 *               example: "Số nhà 123"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           example: "password123"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         user:
 *           type: object
 *         token:
 *           type: string
 */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đăng ký thành công"
 *                 user:
 *                   type: object
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       409:
 *         description: Email đã tồn tại
 */
exports.authRoutes.post('/register', (0, validate_1.validate)(auth_schema_1.registerSchema), async (req, res) => {
    try {
        const { email, password, confirmPassword, userName, phone, date_of_birth, address } = req.body;
        if (!email || !password) {
            return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Email và password là bắt buộc'
            });
        }
        // Defense-in-depth: ensure confirmPassword matches password even though validation middleware checks it
        if (confirmPassword !== password) {
            return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Mật khẩu xác nhận không khớp'
            });
        }
        const normalizedEmail = String(email).trim().toLowerCase();
        const existingUser = await User_1.User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(httpStatus_1.HttpStatus.CONFLICT).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }
        const user = new User_1.User({
            email: normalizedEmail,
            password,
            userName,
            phone,
            date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
            address: address || undefined,
            role: 'customer',
            isVerified: true
        });
        await user.save();
        const payload = { userId: user._id, email: user.email, role: user.role };
        const secret = config_1.config.JWT_SECRET;
        const accessToken = jwt.sign(payload, secret, {
            expiresIn: config_1.config.JWT_EXPIRES_IN
        });
        const refreshToken = jwt.sign(payload, secret, {
            expiresIn: config_1.config.JWT_REFRESH_EXPIRES_IN
        });
        logger_1.logger.info(`New user registered: ${normalizedEmail}`);
        res.status(httpStatus_1.HttpStatus.CREATED).json({
            success: true,
            message: 'Đăng ký thành công',
            user: {
                id: user._id,
                email: user.email,
                userName: user.userName,
                phone: user.phone,
                role: user.role,
                address: user.address
            },
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        logger_1.logger.error('Register error:', error);
        if (error.name === 'ValidationError') {
            return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: Object.values(error.errors).map((err) => err.message)
            });
        }
        res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Lỗi server, vui lòng thử lại sau'
        });
    }
});
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đăng nhập thành công"
 *                 user:
 *                   type: object
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Thiếu thông tin đăng nhập
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 */
exports.authRoutes.post('/login', (0, validate_1.validate)(auth_schema_1.loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Email và password là bắt buộc'
            });
        }
        // Find user by email
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }
        // Check if user is locked
        if (user.locked) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.'
            });
        }
        // Check if user is verified (skip in development mode)
        if (!user.isVerified && config_1.config.NODE_ENV === 'production') {
            return res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực.'
            });
        }
        // In development mode, show warning but allow login
        if (!user.isVerified && config_1.config.NODE_ENV === 'development') {
            logger_1.logger.warn(`⚠️ Login without verification in development: ${user.email}`);
        }
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }
        // Generate JWT tokens
        const payload = { userId: user._id, email: user.email, role: user.role };
        const secret = config_1.config.JWT_SECRET;
        // cast to library types to satisfy TypeScript overloads
        const accessToken = jwt.sign(payload, secret, { expiresIn: config_1.config.JWT_EXPIRES_IN }); // Use config value
        const refreshToken = jwt.sign(payload, secret, { expiresIn: config_1.config.JWT_REFRESH_EXPIRES_IN }); // Use config value
        logger_1.logger.info(`User logged in: ${email}`);
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            user: {
                id: user._id,
                email: user.email,
                userName: user.userName,
                phone: user.phone,
                address: user.address,
                facebookId: user.facebookId || user.facebookID,
                googleId: user.googleId,
                role: user.role,
                isVerified: user.isVerified
            },
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Lỗi server, vui lòng thử lại sau'
        });
    }
});
/**
 * Social login endpoints (Google/Facebook) removed from the backend. These were deprecated and are intentionally omitted from the API docs.
 */
/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Xác thực email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *       properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               token:
 *                 type: string
 *                 example: "verification-token-here"
 *     responses:
 *       200:
 *         description: Xác thực thành công
 *       400:
 *         description: Token không hợp lệ
 *       404:
 *         description: Không tìm thấy user
 */
exports.authRoutes.post('/verify-email', async (req, res) => {
    try {
        const { email, token } = req.body;
        if (!email || !token) {
            return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Email và token là bắt buộc'
            });
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(httpStatus_1.HttpStatus.NOT_FOUND).json({
                success: false,
                message: 'Không tìm thấy tài khoản'
            });
        }
        if (user.isVerified) {
            return res.json({
                success: true,
                message: 'Tài khoản đã được xác thực trước đó'
            });
        }
        // In a real app, you would verify the token here
        // For now, we'll accept any non-empty token
        if (token && token.length > 0) {
            user.isVerified = true;
            await user.save();
            logger_1.logger.info(`✅ User verified: ${user.email}`);
            return res.json({
                success: true,
                message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.'
            });
        }
        else {
            return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Token xác thực không hợp lệ'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('❌ Email verification error:', error);
        res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Lỗi server khi xác thực email'
        });
    }
});
/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Gửi lại email xác thực
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Email xác thực đã được gửi lại
 *       404:
 *         description: Không tìm thấy user
 *       400:
 *         description: Tài khoản đã được xác thực
 */
exports.authRoutes.post('/resend-verification', (0, validate_1.validate)(auth_schema_1.resendVerificationSchema), async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Email là bắt buộc'
            });
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(httpStatus_1.HttpStatus.NOT_FOUND).json({
                success: false,
                message: 'Không tìm thấy tài khoản với email này'
            });
        }
        if (user.isVerified) {
            return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Tài khoản đã được xác thực'
            });
        }
        // In a real app, you would send verification email here
        logger_1.logger.info(`📧 Resent verification email to: ${user.email}`);
        res.json({
            success: true,
            message: 'Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.',
            data: {
                email: user.email,
                // For development, provide a simple token
                verification_token: 'dev-token-' + Date.now()
            }
        });
    }
    catch (error) {
        logger_1.logger.error('❌ Resend verification error:', error);
        res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Lỗi server khi gửi lại email xác thực'
        });
    }
});
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
exports.authRoutes.post('/refresh', (0, validate_1.validate)(auth_schema_1.refreshSchema), async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token là bắt buộc'
            });
        }
        // Verify refresh token
        const secret = config_1.config.JWT_SECRET;
        const decoded = jwt.verify(refreshToken, secret);
        // Find user
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token không hợp lệ'
            });
        }
        // Generate new access token
        const payload = { userId: user._id, email: user.email, role: user.role };
        // cast to library types to satisfy TypeScript overloads
        const accessToken = jwt.sign(payload, secret, { expiresIn: config_1.config.JWT_EXPIRES_IN });
        logger_1.logger.info(`Token refreshed for user: ${user.email}`);
        res.json({
            success: true,
            message: 'Token refreshed successfully',
            accessToken
        });
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token không hợp lệ hoặc đã hết hạn'
            });
        }
        logger_1.logger.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi refresh token'
        });
    }
});
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
exports.authRoutes.post('/logout', (req, res) => {
    // In a real-world app, you might want to blacklist the token
    res.json({
        success: true,
        message: 'Đăng xuất thành công'
    });
});
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Lấy thông tin profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin profile
 *       401:
 *         description: Không có quyền truy cập
 */
exports.authRoutes.get('/profile', async (req, res) => {
    res.json({
        success: true,
        message: 'Endpoint sẽ được bảo vệ bằng JWT middleware sau'
    });
});
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu (Xác nhận token)
 *     tags: [Auth]
 *     description: Đặt lại mật khẩu mới bằng reset token nhận được qua email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset password token
 *                 example: "abc123xyz789"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Mật khẩu mới
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới."
 *       400:
 *         description: Token không hợp lệ hoặc mật khẩu không đúng định dạng
 *       500:
 *         description: Lỗi server
 */
exports.authRoutes.post('/reset-password', (0, validate_1.validate)(auth_schema_1.resetPasswordSchema), async (req, res) => {
    await container_1.userController.resetPassword(req, res);
});
/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Đổi mật khẩu (Đã đăng nhập)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Đổi mật khẩu cho người dùng đã đăng nhập (yêu cầu xác thực mật khẩu cũ)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Mật khẩu hiện tại
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Mật khẩu mới (phải khác mật khẩu cũ)
 *                 example: "newpassword456"
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đổi mật khẩu thành công"
 *       400:
 *         description: Mật khẩu cũ không đúng hoặc mật khẩu mới không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Người dùng không tồn tại
 *       500:
 *         description: Lỗi server
 */
exports.authRoutes.post('/change-password', auth_1.authenticate, (0, validate_1.validate)(auth_schema_1.changePasswordSchema), async (req, res) => {
    await container_1.userController.changePassword(req, res);
});
