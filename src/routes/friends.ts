import { Router } from 'express';
import { authenticate } from '../shared/middleware/auth';
import { friendController } from '../presentation/controllers/FriendController';

const router = Router();

/**
 * @openapi
 * /api/friends/status/{userId}:
 *   get:
 *     tags:
 *       - Friends
 *     summary: Get friend status with a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Target user ID
 *     responses:
 *       200:
 *         description: Friend status retrieved
 */
router.get('/status/:userId', authenticate, (req, res) => friendController.getStatus(req, res));

/**
 * @openapi
 * /api/friends/request/{userId}:
 *   post:
 *     tags:
 *       - Friends
 *     summary: Send a friend request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Target user ID to send request to
 *     responses:
 *       201:
 *         description: Friend request sent
 */
router.post('/request/:userId', authenticate, (req, res) => friendController.sendRequest(req, res));

/**
 * @openapi
 * /api/friends/request/{userId}/cancel:
 *   delete:
 *     tags:
 *       - Friends
 *     summary: Cancel a sent friend request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Target user ID
 *     responses:
 *       200:
 *         description: Friend request cancelled
 */
router.delete('/request/:userId/cancel', authenticate, (req, res) => friendController.cancelRequest(req, res));

/**
 * @openapi
 * /api/friends/request/{requestId}/accept:
 *   post:
 *     tags:
 *       - Friends
 *     summary: Accept a friend request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend request ID
 *     responses:
 *       200:
 *         description: Friend request accepted
 */
router.post('/request/:requestId/accept', authenticate, (req, res) => friendController.acceptRequest(req, res));

/**
 * @openapi
 * /api/friends/request/{requestId}/reject:
 *   post:
 *     tags:
 *       - Friends
 *     summary: Reject a friend request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend request ID
 *     responses:
 *       200:
 *         description: Friend request rejected
 */
router.post('/request/:requestId/reject', authenticate, (req, res) => friendController.rejectRequest(req, res));

/**
 * @openapi
 * /api/friends/{userId}:
 *   delete:
 *     tags:
 *       - Friends
 *     summary: Remove a friend
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend's user ID to remove
 *     responses:
 *       200:
 *         description: Friend removed
 */
router.delete('/:userId', authenticate, (req, res) => friendController.removeFriend(req, res));

/**
 * @openapi
 * /api/friends/requests/pending:
 *   get:
 *     tags:
 *       - Friends
 *     summary: Get pending friend requests received
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of pending friend requests
 */
router.get('/requests/pending', authenticate, (req, res) => friendController.getPendingRequests(req, res));

/**
 * @openapi
 * /api/friends/requests/sent:
 *   get:
 *     tags:
 *       - Friends
 *     summary: Get sent friend requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of sent friend requests
 */
router.get('/requests/sent', authenticate, (req, res) => friendController.getSentRequests(req, res));

/**
 * @openapi
 * /api/friends:
 *   get:
 *     tags:
 *       - Friends
 *     summary: Get friends list
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of friends
 */
router.get('/', authenticate, (req, res) => friendController.getFriends(req, res));

export default router;
