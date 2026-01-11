import { Router } from 'express';
import { chatController } from '../di/container';
import { authenticate } from '../shared/middleware/auth';
import { validate } from '../shared/middleware/validate';
import { markThreadReadSchema, sendMessageSchema, createGroupSchema } from '../shared/validation/chat.schema';

export const chatRoutes = Router();

chatRoutes.get('/threads', authenticate, (req, res) => chatController.listThreads(req, res));
chatRoutes.get('/threads/:threadId/messages', authenticate, (req, res) => chatController.getMessages(req, res));
chatRoutes.post('/messages', authenticate, validate(sendMessageSchema), (req, res) => chatController.sendMessage(req, res));
chatRoutes.post('/threads/:threadId/read', authenticate, validate(markThreadReadSchema), (req, res) => chatController.markThreadRead(req, res));

// Group chat endpoints
chatRoutes.post('/groups', authenticate, validate(createGroupSchema), (req, res) => chatController.createGroup(req, res));
chatRoutes.get('/groups', authenticate, (req, res) => chatController.listGroups(req, res));
chatRoutes.get('/groups/:groupId', authenticate, (req, res) => chatController.getGroup(req, res));

export default chatRoutes;
