"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFile = requireFile;
exports.requireFiles = requireFiles;
const httpStatus_1 = require("../constants/httpStatus");
function requireFile(fieldName = 'avatar') {
    return (req, res, next) => {
        const file = req.file;
        if (!file) {
            return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ success: false, message: `Vui lòng chọn file ${fieldName}` });
        }
        return next();
    };
}
function requireFiles(fieldName = 'images', min = 1, max = 10) {
    return (req, res, next) => {
        const files = req.files;
        if (!files || files.length < min) {
            return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ success: false, message: `Vui lòng tải lên ít nhất ${min} file ${fieldName}` });
        }
        if (files.length > max) {
            return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ success: false, message: `Tối đa ${max} file ${fieldName} được phép` });
        }
        return next();
    };
}
