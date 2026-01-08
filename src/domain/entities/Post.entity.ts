export interface IPostEntity {
  id: string;
  userId: string;
  content: string;
  images: string[];
  cloudinaryPublicIds: string[];
  
  likes: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  
  visibility: 'public' | 'friends' | 'private';
  isEdited: boolean;
  editedAt?: Date;
  
  originalPostId?: string;
  sharedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export class PostEntity implements IPostEntity {
  id: string;
  userId: string;
  content: string;
  images: string[];
  cloudinaryPublicIds: string[];
  likes: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  visibility: 'public' | 'friends' | 'private';
  isEdited: boolean;
  editedAt?: Date;
  originalPostId?: string;
  sharedBy?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IPostEntity) {
    this.id = data.id;
    this.userId = data.userId;
    this.content = data.content;
    this.images = data.images || [];
    this.cloudinaryPublicIds = data.cloudinaryPublicIds || [];
    this.likes = data.likes || [];
    this.likesCount = data.likesCount || 0;
    this.commentsCount = data.commentsCount || 0;
    this.sharesCount = data.sharesCount || 0;
    this.visibility = data.visibility || 'public';
    this.isEdited = data.isEdited || false;
    this.editedAt = data.editedAt;
    this.originalPostId = data.originalPostId;
    this.sharedBy = data.sharedBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isLikedBy(userId: string): boolean {
    return this.likes.includes(userId);
  }

  toggleLike(userId: string): boolean {
    const index = this.likes.indexOf(userId);
    
    if (index > -1) {
      this.likes.splice(index, 1);
      this.likesCount = Math.max(0, this.likesCount - 1);
      return false;
    } else {
      this.likes.push(userId);
      this.likesCount += 1;
      return true;
    }
  }

  addLike(userId: string): boolean {
    if (this.isLikedBy(userId)) {
      return false;
    }
    
    this.likes.push(userId);
    this.likesCount += 1;
    return true;
  }

  removeLike(userId: string): boolean {
    const index = this.likes.indexOf(userId);
    
    if (index === -1) {
      return false;
    }
    
    this.likes.splice(index, 1);
    this.likesCount = Math.max(0, this.likesCount - 1);
    return true;
  }

  incrementCommentsCount(): void {
    this.commentsCount += 1;
  }

  decrementCommentsCount(): void {
    this.commentsCount = Math.max(0, this.commentsCount - 1);
  }

  incrementSharesCount(): void {
    this.sharesCount += 1;
  }

  isSharedPost(): boolean {
    return !!this.originalPostId;
  }

  hasImages(): boolean {
    return this.images.length > 0;
  }

  isPublic(): boolean {
    return this.visibility === 'public';
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  canBeViewedBy(userId: string, isFriend: boolean = false): boolean {
    if (this.isOwnedBy(userId)) {
      return true;
    }

    switch (this.visibility) {
      case 'public':
        return true;
      case 'friends':
        return isFriend;
      case 'private':
        return false;
      default:
        return false;
    }
  }

  canBeEditedBy(userId: string): boolean {
    return this.isOwnedBy(userId);
  }

  canBeDeletedBy(userId: string, isAdmin: boolean = false): boolean {
    return this.isOwnedBy(userId) || isAdmin;
  }

  updateContent(newContent: string): void {
    if (!newContent || newContent.trim().length === 0) {
      throw new Error('Nội dung bài viết không được để trống');
    }

    this.content = newContent.trim();
    this.isEdited = true;
    this.editedAt = new Date();
    this.updatedAt = new Date();
  }

  updateImages(images: string[], cloudinaryPublicIds: string[]): void {
    this.images = images;
    this.cloudinaryPublicIds = cloudinaryPublicIds;
    this.isEdited = true;
    this.editedAt = new Date();
    this.updatedAt = new Date();
  }

  updateVisibility(visibility: 'public' | 'friends' | 'private'): void {
    this.visibility = visibility;
    this.updatedAt = new Date();
  }

  getAgeInHours(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60));
  }

  getAgeInDays(): number {
    return Math.floor(this.getAgeInHours() / 24);
  }

  isRecent(): boolean {
    return this.getAgeInHours() < 24;
  }

  getEngagementRate(): number {
    const ageInHours = Math.max(1, this.getAgeInHours());
    const totalEngagements = this.likesCount + this.commentsCount + this.sharesCount;
    return totalEngagements / ageInHours;
  }

  isTrending(threshold: number = 10): boolean {
    return this.getEngagementRate() >= threshold;
  }

  async validate(): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const { postEntitySchema } = await import('../../shared/validation/post.schema');
      postEntitySchema.parse({
        id: this.id,
        userId: this.userId,
        content: this.content,
        images: this.images,
        cloudinaryPublicIds: this.cloudinaryPublicIds,
        likes: this.likes,
        likesCount: this.likesCount,
        commentsCount: this.commentsCount,
        sharesCount: this.sharesCount,
        visibility: this.visibility,
        isEdited: this.isEdited,
        editedAt: this.editedAt,
        originalPostId: this.originalPostId,
        sharedBy: this.sharedBy,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      });

      return { isValid: true, errors: [] };
    } catch (err: any) {
      const errors: string[] = [];
      if (err && err.errors && Array.isArray(err.errors)) {
        for (const e of err.errors) {
          if (e?.message) errors.push(String(e.message));
          else errors.push(String(e));
        }
      } else if (err && err.message) {
        errors.push(String(err.message));
      } else {
        errors.push('Invalid post entity');
      }
      return { isValid: errors.length === 0, errors };
    }
  }
}
