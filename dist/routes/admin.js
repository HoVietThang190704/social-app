"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const User_1 = require("../models/users/User");
const Post_1 = require("../models/Post");
exports.adminRoutes = (0, express_1.Router)();
exports.adminRoutes.get('/stats', async (req, res) => {
    try {
        const since24h = new Date(Date.now() - 1000 * 60 * 60 * 24);
        const totalUsers = await User_1.User.countDocuments();
        const totalPosts = await Post_1.Post.countDocuments();
        const activeNow = await User_1.User.countDocuments({ lastActive: { $gte: since24h } });
        const monthlyPosts = await Post_1.Post.aggregate([
            { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        const overview = monthlyPosts.map((item) => ({
            name: `${item._id.month}/${item._id.year}`,
            total: item.total
        }));
        const recentPosts = await Post_1.Post.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'userName email avatar')
            .lean();
        const recent = recentPosts.map((p) => ({
            author: p.userId?.userName || 'Unknown',
            avatar: p.userId?.avatar || '/avatars/default.png',
            excerpt: typeof p.content === 'string' ? p.content.slice(0, 120) : '',
            createdAt: p.createdAt
        }));
        res.json({
            totalUsers,
            totalPosts,
            activeNow,
            overview,
            recent,
            recentCount: recent.length
        });
    }
    catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error)
            message = err.message;
        res.status(500).json({ error: 'Failed to fetch dashboard stats', details: message });
    }
});
