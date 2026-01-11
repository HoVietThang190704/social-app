import { Request, Response } from 'express';
import { friendService } from '../../services/friend/FriendService';
import { logger } from '../../shared/utils/logger';

export class FriendController {
  /**
   * Get friend status between current user and target user
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const { userId } = req.params;

      if (!currentUserId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const status = await friendService.getFriendStatus(currentUserId, userId);
      res.status(200).json({ success: true, data: status });
    } catch (error: any) {
      logger.error('FriendController.getStatus error:', error);
      res.status(400).json({ success: false, message: error?.message || 'Failed to get friend status' });
    }
  }

  /**
   * Send a friend request
   */
  async sendRequest(req: Request, res: Response): Promise<void> {
    try {
      const senderId = req.user?.userId;
      const { userId } = req.params;

      if (!senderId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!userId) {
        res.status(400).json({ success: false, message: 'Target user ID is required' });
        return;
      }

      const request = await friendService.sendFriendRequest(senderId, userId);
      res.status(201).json({ success: true, data: request });
    } catch (error: any) {
      logger.error('FriendController.sendRequest error:', error);
      const status = error?.message?.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error?.message || 'Failed to send friend request' });
    }
  }

  /**
   * Accept a friend request
   */
  async acceptRequest(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const { requestId } = req.params;

      if (!currentUserId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!requestId) {
        res.status(400).json({ success: false, message: 'Request ID is required' });
        return;
      }

      await friendService.acceptFriendRequest(requestId, currentUserId);
      res.status(200).json({ success: true, message: 'Friend request accepted' });
    } catch (error: any) {
      logger.error('FriendController.acceptRequest error:', error);
      const status = error?.message?.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error?.message || 'Failed to accept friend request' });
    }
  }

  /**
   * Reject a friend request
   */
  async rejectRequest(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const { requestId } = req.params;

      if (!currentUserId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!requestId) {
        res.status(400).json({ success: false, message: 'Request ID is required' });
        return;
      }

      await friendService.rejectFriendRequest(requestId, currentUserId);
      res.status(200).json({ success: true, message: 'Friend request rejected' });
    } catch (error: any) {
      logger.error('FriendController.rejectRequest error:', error);
      const status = error?.message?.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error?.message || 'Failed to reject friend request' });
    }
  }

  /**
   * Cancel a sent friend request
   */
  async cancelRequest(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const { userId } = req.params;

      if (!currentUserId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!userId) {
        res.status(400).json({ success: false, message: 'Target user ID is required' });
        return;
      }

      await friendService.cancelFriendRequestByUserId(currentUserId, userId);
      res.status(200).json({ success: true, message: 'Friend request cancelled' });
    } catch (error: any) {
      logger.error('FriendController.cancelRequest error:', error);
      const status = error?.message?.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error?.message || 'Failed to cancel friend request' });
    }
  }

  /**
   * Remove a friend
   */
  async removeFriend(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const { userId } = req.params;

      if (!currentUserId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!userId) {
        res.status(400).json({ success: false, message: 'Friend user ID is required' });
        return;
      }

      await friendService.removeFriend(currentUserId, userId);
      res.status(200).json({ success: true, message: 'Friend removed' });
    } catch (error: any) {
      logger.error('FriendController.removeFriend error:', error);
      res.status(400).json({ success: false, message: error?.message || 'Failed to remove friend' });
    }
  }

  /**
   * Get pending friend requests received by current user
   */
  async getPendingRequests(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.userId;

      if (!currentUserId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(5, parseInt(String(req.query.limit ?? '20'), 10)));

      const result = await friendService.getPendingRequests(currentUserId, page, limit);
      res.status(200).json({ success: true, data: result.items, meta: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages
      }});
    } catch (error: any) {
      logger.error('FriendController.getPendingRequests error:', error);
      res.status(400).json({ success: false, message: error?.message || 'Failed to get pending requests' });
    }
  }

  /**
   * Get sent friend requests by current user
   */
  async getSentRequests(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.userId;

      if (!currentUserId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(5, parseInt(String(req.query.limit ?? '20'), 10)));

      const result = await friendService.getSentRequests(currentUserId, page, limit);
      res.status(200).json({ success: true, data: result.items, meta: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages
      }});
    } catch (error: any) {
      logger.error('FriendController.getSentRequests error:', error);
      res.status(400).json({ success: false, message: error?.message || 'Failed to get sent requests' });
    }
  }

  /**
   * Get friends list
   */
  async getFriends(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.userId;

      if (!currentUserId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(5, parseInt(String(req.query.limit ?? '20'), 10)));

      const result = await friendService.getFriends(currentUserId, page, limit);
      res.status(200).json({ success: true, data: result.items, meta: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages
      }});
    } catch (error: any) {
      logger.error('FriendController.getFriends error:', error);
      res.status(400).json({ success: false, message: error?.message || 'Failed to get friends list' });
    }
  }
}

export const friendController = new FriendController();
