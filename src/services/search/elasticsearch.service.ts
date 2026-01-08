export class ElasticsearchService {
  isEnabled() { return false; }
  initialize() { return Promise.resolve(); }
  async indexPost(post: any) { return Promise.resolve(); }
  async removePost(postId: string) { return Promise.resolve(); }
  async searchPosts(query: any, options?: any): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const total = 0;
    return Promise.resolve({ items: [], total, page, limit, totalPages: Math.ceil(total / limit) });
  }
}

export default new ElasticsearchService();