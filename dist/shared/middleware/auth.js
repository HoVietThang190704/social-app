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
exports.authorize = exports.authenticate = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const config_1 = require("../../config");
const User_1 = require("../../models/users/User");
const logger_1 = require("../utils/logger");
const httpStatus_1 = require("../constants/httpStatus");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.'
            });
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = jwt.verify(token, config_1.config.JWT_SECRET);
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Người dùng không tồn tại.'
            });
        }
        if (!user.isVerified && config_1.config.NODE_ENV === 'production') {
            return res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({
                success: false,
                message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email.'
            });
        }
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        return next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Token không hợp lệ.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Token đã hết hạn. Vui lòng đăng nhập lại.'
            });
        }
        return res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Lỗi xác thực. Vui lòng thử lại sau.'
        });
    }
};
exports.authenticate = authenticate;
/**
 * Middleware to check if user has specific role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Bạn cần đăng nhập để truy cập.'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({
                success: false,
                message: 'Bạn không có quyền truy cập tính năng này.'
            });
        }
        return next();
    };
};
exports.authorize = authorize;
