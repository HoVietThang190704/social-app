"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadCertificate = exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)'));
    }
};
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
exports.uploadAvatar = upload.single('avatar');
exports.uploadCertificate = upload.single('certificate');
exports.uploadMultiple = upload.array('images', 10);
exports.default = upload;
