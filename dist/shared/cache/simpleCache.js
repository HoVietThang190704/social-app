"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCache = exports.SimpleCache = void 0;
class SimpleCache {
    constructor(options) {
        this.options = options;
        this.store = new Map();
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry) {
            return undefined;
        }
        if (Date.now() >= entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }
    set(key, value, ttlOverrideMs) {
        const ttl = ttlOverrideMs ?? this.options.ttlMs;
        const expiresAt = Date.now() + ttl;
        this.store.set(key, { value, expiresAt });
        this.pruneExpired();
        this.enforceSizeLimit();
    }
    delete(key) {
        this.store.delete(key);
    }
    clear() {
        this.store.clear();
    }
    size() {
        return this.store.size;
    }
    pruneExpired() {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now >= entry.expiresAt) {
                this.store.delete(key);
            }
        }
    }
    enforceSizeLimit() {
        const max = this.options.maxItems;
        if (!max) {
            return;
        }
        while (this.store.size > max) {
            const oldestKey = this.store.keys().next().value;
            if (oldestKey === undefined) {
                break;
            }
            this.store.delete(oldestKey);
        }
    }
}
exports.SimpleCache = SimpleCache;
const createCache = (options) => {
    return new SimpleCache(options);
};
exports.createCache = createCache;
