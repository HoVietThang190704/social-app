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
exports.ChatSupport = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AttachmentSchema = new mongoose_1.Schema({
    url: { type: String, required: true, trim: true },
    filename: { type: String, default: null }
}, { _id: false });
const MessageSchema = new mongoose_1.Schema({
    sender: { type: String, enum: ['user', 'admin'], required: true },
    sender_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    sender_name: { type: String, default: null },
    sender_role: { type: String, default: null },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    attachments: { type: [AttachmentSchema], default: [] }
}, {
    _id: true,
    timestamps: { createdAt: true, updatedAt: false }
});
const ChatSupportSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    user_email: { type: String, required: true, trim: true, lowercase: true },
    user_name: { type: String, default: null },
    user_avatar: { type: String, default: null },
    last_message: { type: String, default: null },
    last_sender: { type: String, enum: ['user', 'admin'], default: null },
    last_message_at: { type: Date, default: null },
    unread_by_admin: { type: Number, default: 0 },
    unread_by_user: { type: Number, default: 0 },
    messages: { type: [MessageSchema], default: [] }
}, {
    timestamps: true,
    collection: 'Chat_Support'
});
ChatSupportSchema.index({ updatedAt: -1 });
ChatSupportSchema.index({ user_name: 1, user_email: 1 });
exports.ChatSupport = mongoose_1.default.model('ChatSupport', ChatSupportSchema);
