import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb';
import { FriendRequest, FriendRequestStatus, IFriendRequest } from '../../models/FriendRequest';
import { User, IUser } from '../../models/users/User';
import { notificationService } from '../notification/NotificationService';
import { pushNotificationService } from '../notification/PushNotificationService';
import { getIO } from '../socket/socketManager';
import { logger } from '../../shared/utils/logger';

export interface FriendRequestDTO {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string | null;
  status: FriendRequestStatus;
  createdAt: Date;
}

export interface FriendStatusResponse {
  status: 'none' | 'pending_sent' | 'pending_received' | 'friends';
  requestId?: string;
}

export interface FriendListItem {
  id: string;
  userName: string;
  email: string;
  avatar: string | null;
  addedAt: Date;
}

export class FriendService {
  private toObjectId(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId | null {
    if (id instanceof mongoose.Types.ObjectId) return id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    return null;
  }

  /**
   * Get friend status between current user and target user
   */
  async getFriendStatus(currentUserId: string, targetUserId: string): Promise<FriendStatusResponse> {
    const currentId = this.toObjectId(currentUserId);
    const targetId = this.toObjectId(targetUserId);

    if (!currentId || !targetId) {
      throw new Error('Invalid user ID');
    }

    // Check if they are already friends
    const currentUser = await User.findById(currentId).select('friends').lean();
    if (currentUser?.friends?.some((f: mongoose.Types.ObjectId) => f.equals(targetId))) {
      return { status: 'friends' };
    }

    // Check for pending friend request
    const request = await FriendRequest.findOne({
      $or: [
        { senderId: currentId, receiverId: targetId, status: FriendRequestStatus.PENDING },
        { senderId: targetId, receiverId: currentId, status: FriendRequestStatus.PENDING }
      ]
    }).lean();

    if (request) {
      if (request.senderId.equals(currentId)) {
        return { status: 'pending_sent', requestId: request._id.toString() };
      } else {
        return { status: 'pending_received', requestId: request._id.toString() };
      }
    }

    return { status: 'none' };
  }

  /**
   * Send a friend request
   */
  async sendFriendRequest(senderId: string, receiverId: string): Promise<FriendRequestDTO> {
    const senderObjectId = this.toObjectId(senderId);
    const receiverObjectId = this.toObjectId(receiverId);

    if (!senderObjectId || !receiverObjectId) {
      throw new Error('Invalid user ID');
    }

    if (senderObjectId.equals(receiverObjectId)) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if users exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderObjectId).select('userName avatar email pushToken').lean(),
      User.findById(receiverObjectId).select('userName avatar email pushToken').lean()
    ]);

    if (!sender || !receiver) {
      throw new Error('User not found');
    }

    // Check if already friends
    const senderFull = await User.findById(senderObjectId).select('friends').lean();
    if (senderFull?.friends?.some((f: mongoose.Types.ObjectId) => f.equals(receiverObjectId))) {
      throw new Error('Already friends');
    }

    let friendRequest: IFriendRequest;

    // Check for any existing request in either direction
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { senderId: senderObjectId, receiverId: receiverObjectId },
        { senderId: receiverObjectId, receiverId: senderObjectId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === FriendRequestStatus.PENDING) {
        throw new Error('Friend request already exists');
      }

      if (existingRequest.status === FriendRequestStatus.ACCEPTED) {
        throw new Error('Already friends');
      }

      // Re-open a previously cancelled/rejected request in the current direction
      existingRequest.senderId = senderObjectId;
      existingRequest.receiverId = receiverObjectId;
      existingRequest.status = FriendRequestStatus.PENDING;
      existingRequest.createdAt = new Date();
      existingRequest.updatedAt = new Date();
      await existingRequest.save();
      friendRequest = existingRequest;
    } else {
      // Create new friend request
      try {
        friendRequest = await FriendRequest.create({
          senderId: senderObjectId,
          receiverId: receiverObjectId,
          status: FriendRequestStatus.PENDING
        });
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
          throw new Error('Friend request already exists');
        }
        throw error;
      }
    }

    const senderName = sender.userName || sender.email;
    const dto: FriendRequestDTO = {
      id: friendRequest._id.toString(),
      senderId: senderId,
      senderName,
      senderAvatar: sender.avatar || null,
      receiverId: receiverId,
      receiverName: receiver.userName || receiver.email,
      receiverAvatar: receiver.avatar || null,
      status: FriendRequestStatus.PENDING,
      createdAt: friendRequest.createdAt
    };

    // Save notification to database
    await notificationService.send({
      audience: 'user',
      targetId: receiverId,
      type: 'friend_request',
      title: 'Friend Request',
      message: `${senderName} sent you a friend request`,
      payload: {
        type: 'friend_request',
        requestId: friendRequest._id.toString(),
        senderId: senderId,
        senderName,
        senderAvatar: sender.avatar || null
      }
    });

    // Send push notification (outside app)
    const receiverPushToken = (receiver as unknown as { pushToken?: string }).pushToken;
    if (receiverPushToken) {
      await pushNotificationService.sendToDevice(receiverPushToken, {
        title: 'Friend Request',
        body: `${senderName} sent you a friend request`,
        data: {
          type: 'friend_request',
          requestId: friendRequest._id.toString(),
          senderId: senderId
        }
      });
    }

    // Emit socket event for real-time notification in app
    try {
      const io = getIO();
      io.to(`user:${receiverId}`).emit('friend-request:received', dto);
    } catch (e) {
      logger.warn('Failed to emit friend request socket event', e);
    }

    return dto;
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string, currentUserId: string): Promise<void> {
    const reqObjectId = this.toObjectId(requestId);
    const currentUserObjectId = this.toObjectId(currentUserId);

    if (!reqObjectId || !currentUserObjectId) {
      throw new Error('Invalid ID');
    }

    const request = await FriendRequest.findById(reqObjectId);
    if (!request) {
      throw new Error('Friend request not found');
    }

    if (!request.receiverId.equals(currentUserObjectId)) {
      throw new Error('You can only accept requests sent to you');
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new Error('Friend request is no longer pending');
    }

    // Update request status
    request.status = FriendRequestStatus.ACCEPTED;
    await request.save();

    // Add each other as friends
    await Promise.all([
      User.findByIdAndUpdate(request.senderId, {
        $addToSet: { friends: request.receiverId },
        $inc: { friendsCount: 1 }
      }),
      User.findByIdAndUpdate(request.receiverId, {
        $addToSet: { friends: request.senderId },
        $inc: { friendsCount: 1 }
      })
    ]);

    // Notify the sender that request was accepted
    const [sender, receiver] = await Promise.all([
      User.findById(request.senderId).select('userName email pushToken').lean(),
      User.findById(request.receiverId).select('userName email').lean()
    ]);

    const receiverName = receiver?.userName || receiver?.email || 'Someone';

    await notificationService.send({
      audience: 'user',
      targetId: request.senderId.toString(),
      type: 'friend_request_accepted',
      title: 'Friend Request Accepted',
      message: `${receiverName} accepted your friend request`,
      payload: {
        type: 'friend_request_accepted',
        userId: request.receiverId.toString()
      }
    });

    const senderPushToken = (sender as unknown as { pushToken?: string })?.pushToken;
    if (senderPushToken) {
      await pushNotificationService.sendToDevice(senderPushToken, {
        title: 'Friend Request Accepted',
        body: `${receiverName} accepted your friend request`,
        data: {
          type: 'friend_request_accepted',
          userId: request.receiverId.toString()
        }
      });
    }

    // Socket event
    try {
      const io = getIO();
      io.to(`user:${request.senderId.toString()}`).emit('friend-request:accepted', {
        requestId: requestId,
        userId: request.receiverId.toString(),
        userName: receiverName
      });
    } catch (e) {
      logger.warn('Failed to emit friend request accepted socket event', e);
    }
  }

  /**
   * Reject a friend request
   */
  async rejectFriendRequest(requestId: string, currentUserId: string): Promise<void> {
    const reqObjectId = this.toObjectId(requestId);
    const currentUserObjectId = this.toObjectId(currentUserId);

    if (!reqObjectId || !currentUserObjectId) {
      throw new Error('Invalid ID');
    }

    const request = await FriendRequest.findById(reqObjectId);
    if (!request) {
      throw new Error('Friend request not found');
    }

    if (!request.receiverId.equals(currentUserObjectId)) {
      throw new Error('You can only reject requests sent to you');
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new Error('Friend request is no longer pending');
    }

    request.status = FriendRequestStatus.REJECTED;
    await request.save();
  }

  /**
   * Cancel a friend request (by sender)
   */
  async cancelFriendRequest(requestId: string, currentUserId: string): Promise<void> {
    const reqObjectId = this.toObjectId(requestId);
    const currentUserObjectId = this.toObjectId(currentUserId);

    if (!reqObjectId || !currentUserObjectId) {
      throw new Error('Invalid ID');
    }

    const request = await FriendRequest.findById(reqObjectId);
    if (!request) {
      throw new Error('Friend request not found');
    }

    if (!request.senderId.equals(currentUserObjectId)) {
      throw new Error('You can only cancel requests you sent');
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new Error('Friend request is no longer pending');
    }

    request.status = FriendRequestStatus.CANCELLED;
    await request.save();
  }

  /**
   * Cancel by target user ID instead of request ID
   */
  async cancelFriendRequestByUserId(senderId: string, receiverId: string): Promise<void> {
    const senderObjectId = this.toObjectId(senderId);
    const receiverObjectId = this.toObjectId(receiverId);

    if (!senderObjectId || !receiverObjectId) {
      throw new Error('Invalid user ID');
    }

    const result = await FriendRequest.updateOne(
      { 
        senderId: senderObjectId, 
        receiverId: receiverObjectId, 
        status: FriendRequestStatus.PENDING 
      },
      { status: FriendRequestStatus.CANCELLED }
    );

    if (result.matchedCount === 0) {
      throw new Error('Friend request not found');
    }
  }

  /**
   * Remove a friend
   */
  async removeFriend(currentUserId: string, friendId: string): Promise<void> {
    const currentObjectId = this.toObjectId(currentUserId);
    const friendObjectId = this.toObjectId(friendId);

    if (!currentObjectId || !friendObjectId) {
      throw new Error('Invalid user ID');
    }

    await Promise.all([
      User.findByIdAndUpdate(currentObjectId, {
        $pull: { friends: friendObjectId },
        $inc: { friendsCount: -1 }
      }),
      User.findByIdAndUpdate(friendObjectId, {
        $pull: { friends: currentObjectId },
        $inc: { friendsCount: -1 }
      })
    ]);

    // Update any existing friend request to cancelled
    await FriendRequest.updateMany(
      {
        $or: [
          { senderId: currentObjectId, receiverId: friendObjectId },
          { senderId: friendObjectId, receiverId: currentObjectId }
        ],
        status: FriendRequestStatus.ACCEPTED
      },
      { status: FriendRequestStatus.CANCELLED }
    );
  }

  /**
   * Get pending friend requests received by user
   */
  async getPendingRequests(userId: string, page = 1, limit = 20): Promise<{
    items: FriendRequestDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) {
      throw new Error('Invalid user ID');
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      FriendRequest.find({
        receiverId: userObjectId,
        status: FriendRequestStatus.PENDING
      })
        .populate('senderId', 'userName email avatar')
        .populate('receiverId', 'userName email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FriendRequest.countDocuments({
        receiverId: userObjectId,
        status: FriendRequestStatus.PENDING
      })
    ]);

    const items: FriendRequestDTO[] = requests.map((req: any) => ({
      id: req._id.toString(),
      senderId: req.senderId._id.toString(),
      senderName: req.senderId.userName || req.senderId.email,
      senderAvatar: req.senderId.avatar || null,
      receiverId: req.receiverId._id.toString(),
      receiverName: req.receiverId.userName || req.receiverId.email,
      receiverAvatar: req.receiverId.avatar || null,
      status: req.status,
      createdAt: req.createdAt
    }));

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get sent friend requests
   */
  async getSentRequests(userId: string, page = 1, limit = 20): Promise<{
    items: FriendRequestDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) {
      throw new Error('Invalid user ID');
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      FriendRequest.find({
        senderId: userObjectId,
        status: FriendRequestStatus.PENDING
      })
        .populate('senderId', 'userName email avatar')
        .populate('receiverId', 'userName email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FriendRequest.countDocuments({
        senderId: userObjectId,
        status: FriendRequestStatus.PENDING
      })
    ]);

    const items: FriendRequestDTO[] = requests.map((req: any) => ({
      id: req._id.toString(),
      senderId: req.senderId._id.toString(),
      senderName: req.senderId.userName || req.senderId.email,
      senderAvatar: req.senderId.avatar || null,
      receiverId: req.receiverId._id.toString(),
      receiverName: req.receiverId.userName || req.receiverId.email,
      receiverAvatar: req.receiverId.avatar || null,
      status: req.status,
      createdAt: req.createdAt
    }));

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get friends list
   */
  async getFriends(userId: string, page = 1, limit = 20): Promise<{
    items: FriendListItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) {
      throw new Error('Invalid user ID');
    }

    const user = await User.findById(userObjectId)
      .populate({
        path: 'friends',
        select: 'userName email avatar createdAt',
        options: {
          skip: (page - 1) * limit,
          limit: limit
        }
      })
      .select('friends friendsCount')
      .lean();

    if (!user) {
      throw new Error('User not found');
    }

    const friends = (user.friends || []) as any[];
    const total = user.friendsCount || friends.length;

    const items: FriendListItem[] = friends.map((f: any) => ({
      id: f._id.toString(),
      userName: f.userName || f.email,
      email: f.email,
      avatar: f.avatar || null,
      addedAt: f.createdAt
    }));

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export const friendService = new FriendService();
