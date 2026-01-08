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
exports.Address = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AddressSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID là bắt buộc'],
        index: true
    },
    recipientName: {
        type: String,
        required: [true, 'Tên người nhận là bắt buộc'],
        trim: true,
        maxlength: [100, 'Tên người nhận không được vượt quá 100 ký tự']
    },
    phone: {
        type: String,
        required: [true, 'Số điện thoại là bắt buộc'],
        trim: true,
        match: [
            /^(\+84|84|0)[1-9][0-9]{8}$/,
            'Số điện thoại không hợp lệ'
        ]
    },
    address: {
        type: String,
        required: [true, 'Địa chỉ là bắt buộc'],
        trim: true,
        maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự']
    },
    ward: {
        type: String,
        required: [true, 'Phường/Xã là bắt buộc'],
        trim: true
    },
    district: {
        type: String,
        required: [true, 'Quận/Huyện là bắt buộc'],
        trim: true
    },
    province: {
        type: String,
        required: [true, 'Tỉnh/Thành phố là bắt buộc'],
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false,
        index: true
    },
    label: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
    },
    note: {
        type: String,
        trim: true,
        maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự']
    }
}, {
    timestamps: true,
    collection: 'addresses',
    toJSON: {
        virtuals: true,
        transform: function (_doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});
// Indexes
AddressSchema.index({ userId: 1, isDefault: 1 });
AddressSchema.index({ userId: 1, createdAt: -1 });
// Pre-save middleware: Ensure only one default address per user
AddressSchema.pre('save', async function (next) {
    if (this.isModified('isDefault') && this.isDefault) {
        // Set all other addresses of this user to non-default
        await mongoose_1.default.model('Address').updateMany({ userId: this.userId, _id: { $ne: this._id } }, { $set: { isDefault: false } });
    }
    next();
});
exports.Address = mongoose_1.default.model('Address', AddressSchema);
