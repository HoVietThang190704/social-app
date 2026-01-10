export interface DirectMessageParticipant {
  userId: string;
  userName?: string | null;
  avatar?: string | null;
}

export interface DirectMessageAttachment {
  url: string;
  type?: string | null;
  name?: string | null;
}

export interface DirectMessageMessageEntity {
  id: string;
  threadId: string;
  senderId: string;
  recipientId: string;
  content?: string | null;
  attachments: DirectMessageAttachment[];
  readAt?: Date | null;
  createdAt: Date;
}

export interface DirectMessageThreadEntity {
  id: string;
  participantIds: string[];
  participants: DirectMessageParticipant[];
  lastMessage?: string | null;
  lastMessageAt?: Date | null;
  lastSenderId?: string | null;
  unreadCount: number;
  unreadByUser: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}
