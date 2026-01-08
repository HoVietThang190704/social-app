"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.isAdmin = exports.authorizeRoles = void 0;
const logger_1 = require("../utils/logger");
const httpStatus_1 = require("../constants/httpStatus");
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục'
            });
            return;
        }
        const userRole = req.user.role;
        if (!roles.includes(userRole)) {
            logger_1.logger.warn(`Authorization failed for user ${req.user.userId}: required ${roles.join(', ')}, has ${userRole}`);
            res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({
                success: false,
                message: 'Bạn không có quyền thực hiện hành động này'
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
exports.isAdmin = (0, exports.authorizeRoles)('admin');
// shop_owner role removed for social-app
exports.isAuthenticated = (0, exports.authorizeRoles)('customer', 'admin');
