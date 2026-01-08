"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSupportRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ChatSupport_1 = require("../../models/ChatSupport");
const logger_1 = require("../../shared/utils/logger");
const toObjectId = (value) => {
    if (!value || !mongoose_1.default.Types.ObjectId.isValid(value)) {
        return null;
    }
    return new mongoose_1.default.Types.ObjectId(value);
};
const normalizeDate = (value) => {
    if (!value)
        return undefined;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
};
class ChatSupportRepository {
    mapMessage(doc) {
        return {
            id: (doc._id || doc.id || '').toString(),
            sender: doc.sender,
            senderId: doc.sender_id ? doc.sender_id.toString() : null,
            senderName: doc.sender_name ?? null,
            senderRole: doc.sender_role ?? null,
            content: doc.content,
            attachments: Array.isArray(doc.attachments) ? doc.attachments.map((item) => ({
                url: item.url,
                filename: item.filename ?? null
            })) : [],
            createdAt: normalizeDate(doc.createdAt) ?? new Date()
        };
    }
    mapThread(doc, options = {}) {
        const base = {
            id: (doc?._id || '').toString(),
            userId: doc.user_id?.toString() || '',
            userEmail: doc.user_email,
            userName: doc.user_name ?? null,
            userAvatar: doc.user_avatar ?? null,
            lastMessage: doc.last_message ?? null,
            lastSender: doc.last_sender ?? null,
            lastMessageAt: normalizeDate(doc.last_message_at) ?? null,
            unreadByAdmin: doc.unread_by_admin ?? 0,
            unreadByUser: doc.unread_by_user ?? 0,
            createdAt: normalizeDate(doc.createdAt) ?? new Date(),
            updatedAt: normalizeDate(doc.updatedAt) ?? new Date()
        };
        if (options.includeMessages) {
            const messages = Array.isArray(doc.messages) ? doc.messages : [];
            base.messages = messages
                .map((message) => this.mapMessage(message))
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        }
        return base;
    }
    async findByUserId(userId, options) {
        const objectId = toObjectId(userId);
        if (!objectId) {
            return null;
        }
        const query = ChatSupport_1.ChatSupport.findOne({ user_id: objectId });
        if (!options?.includeMessages) {
            query.select('-messages');
        }
        const doc = await query.lean().exec();
        return doc ? this.mapThread(doc, { includeMessages: !!options?.includeMessages }) : null;
    }
    async createThread(payload) {
        const objectId = toObjectId(payload.userId);
        if (!objectId) {
            throw new Error('Invalid user id');
        }
        try {
            const doc = await ChatSupport_1.ChatSupport.create({
                user_id: objectId,
                user_email: payload.userEmail.toLowerCase(),
                user_name: payload.userName ?? null,
                user_avatar: payload.userAvatar ?? null
            });
            return this.mapThread(doc, { includeMessages: true });
        }
        catch (error) {
            if (error?.code === 11000) {
                const existing = await ChatSupport_1.ChatSupport.findOne({ user_id: objectId }).lean().exec();
                if (existing) {
                    return this.mapThread(existing);
                }
            }
            logger_1.logger.error('ChatSupportRepository.createThread error:', error);
            throw new Error('Unable to create chat thread');
        }
    }
    async appendMessage(payload) {
        const objectId = toObjectId(payload.userId);
        if (!objectId) {
            throw new Error('Invalid user id');
        }
        const now = new Date();
        const senderObjectId = payload.senderId ? toObjectId(payload.senderId) : null;
        const messageDoc = {
            sender: payload.sender,
            sender_id: senderObjectId ?? undefined,
            sender_name: payload.senderName ?? null,
            sender_role: payload.senderRole ?? null,
            content: payload.content,
            attachments: Array.isArray(payload.attachments) ? payload.attachments.map((item) => ({
                url: item.url,
                filename: item.filename ?? null
            })) : []
        };
        const updated = await ChatSupport_1.ChatSupport.findOneAndUpdate({ user_id: objectId }, {
            $push: { messages: messageDoc },
            $set: {
                last_message: payload.content,
                last_sender: payload.sender,
                last_message_at: now,
                updatedAt: now
            },
            $inc: {
                unread_by_admin: payload.sender === 'user' ? 1 : 0,
                unread_by_user: payload.sender === 'admin' ? 1 : 0
            }
        }, { new: true }).lean().exec();
        if (!updated) {
            throw new Error('Chat thread not found');
        }
        const latestRaw = Array.isArray(updated.messages)
            ? updated.messages[updated.messages.length - 1]
            : null;
        if (!latestRaw) {
            throw new Error('Message not persisted');
        }
        const thread = this.mapThread(updated, { includeMessages: false });
        const message = this.mapMessage(latestRaw);
        return { message, thread };
    }
    async markAsRead(userId, actor) {
        const objectId = toObjectId(userId);
        if (!objectId) {
            return null;
        }
        const field = actor === 'admin' ? 'unread_by_admin' : 'unread_by_user';
        const doc = await ChatSupport_1.ChatSupport.findOneAndUpdate({ user_id: objectId }, { $set: { [field]: 0 } }, { new: true }).select('-messages').lean().exec();
        return doc ? this.mapThread(doc) : null;
    }
    async listThreads(filters) {
        const query = {};
        if (filters?.search) {
            const keyword = filters.search.trim();
            if (keyword) {
                const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escaped, 'i');
                query.$or = [
                    { user_name: regex },
                    { user_email: regex }
                ];
            }
        }
        const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
        const offset = Math.max(filters?.offset ?? 0, 0);
        const docs = await ChatSupport_1.ChatSupport.find(query)
            .select('-messages')
            .sort({ updatedAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean()
            .exec();
        return docs.map((doc) => this.mapThread(doc));
    }
}
exports.ChatSupportRepository = ChatSupportRepository;
