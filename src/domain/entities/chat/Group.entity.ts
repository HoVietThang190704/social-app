export interface GroupEntity {
  id: string;
  name: string;
  avatar?: string | null;
  members: string[];
  admins: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Group implements GroupEntity {
  id: string;
  name: string;
  avatar?: string | null;
  members: string[];
  admins: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: GroupEntity) {
    this.id = data.id;
    this.name = data.name;
    this.avatar = data.avatar;
    this.members = data.members || [];
    this.admins = data.admins || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
