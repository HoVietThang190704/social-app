"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticsearchService = void 0;
class ElasticsearchService {
    isEnabled() { return false; }
    initialize() { return Promise.resolve(); }
    async indexPost(post) { return Promise.resolve(); }
    async removePost(postId) { return Promise.resolve(); }
    async searchPosts(query, options) {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 10;
        const total = 0;
        return Promise.resolve({ items: [], total, page, limit, totalPages: Math.ceil(total / limit) });
    }
}
exports.ElasticsearchService = ElasticsearchService;
exports.default = new ElasticsearchService();
