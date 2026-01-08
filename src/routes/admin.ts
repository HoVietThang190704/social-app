import { Router } from 'express';
import { User } from '../models/users/User';
import { Post } from '../models/Post';

export const adminRoutes = Router();

adminRoutes.get('/stats', async (req, res) => {
  try {
    const since24h = new Date(Date.now() - 1000 * 60 * 60 * 24);

    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const activeNow = await User.countDocuments({ lastActive: { $gte: since24h } });

    const monthlyPosts = await Post.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const overview = monthlyPosts.map((item: any) => ({
      name: `${item._id.month}/${item._id.year}`,
      total: item.total
    }));

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'userName email avatar')
      .lean();

    const recent = recentPosts.map((p: any) => ({
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
  } catch (err) {
    let message = 'Unknown error';
    if (err instanceof Error) message = err.message;
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: message });
  }
});
