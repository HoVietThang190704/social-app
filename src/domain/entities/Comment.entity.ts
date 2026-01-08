export class CommentEntity {
  id!: string;
  postId!: string;
  userId!: string;
  content!: string;
  images?: string[];
  cloudinaryPublicIds?: string[];
  parentCommentId?: string;
  level?: number;
  mentionedUserId?: string;
  likes?: string[];
  likesCount?: number;
  repliesCount?: number;
  isEdited?: boolean;
  editedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(props: any) {
    Object.assign(this, props);
  }
}
