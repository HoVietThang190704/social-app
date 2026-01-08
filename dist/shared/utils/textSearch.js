"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSearchTokens = exports.buildVietnameseRegex = exports.buildVietnameseRegexPattern = exports.normalizeVietnameseText = void 0;
const SPECIAL_REGEX_CHARS = /[.*+?^${}()|[\]\\]/g;
const VIETNAMESE_CHAR_GROUPS = {
    a: 'aàáạảãâầấậẩẫăằắặẳẵ',
    e: 'eèéẹẻẽêềếệểễ',
    i: 'iìíịỉĩ',
    o: 'oòóọỏõôồốộổỗơờớợởỡ',
    u: 'uùúụủũưừứựửữ',
    y: 'yỳýỵỷỹ',
    d: 'dđ',
    c: 'c',
    h: 'h',
    k: 'k',
    g: 'g',
    q: 'q',
    n: 'n',
    t: 't',
    l: 'l',
    m: 'm',
    p: 'p',
    r: 'r',
    s: 's',
    v: 'v',
    b: 'b'
};
const normalizeVietnameseText = (value) => {
    if (!value) {
        return '';
    }
    return value
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};
exports.normalizeVietnameseText = normalizeVietnameseText;
const escapeRegexChar = (char) => char.replace(SPECIAL_REGEX_CHARS, '\\$&');
const buildVietnameseRegexPattern = (term) => {
    const trimmed = term.trim();
    if (!trimmed) {
        return '';
    }
    let pattern = '';
    for (const char of trimmed) {
        if (/\s/.test(char)) {
            pattern += '\\s+';
            continue;
        }
        const lower = char.toLowerCase();
        const group = VIETNAMESE_CHAR_GROUPS[lower];
        if (group) {
            const chars = group + group.toUpperCase();
            pattern += `[${chars}]`;
        }
        else {
            pattern += escapeRegexChar(char);
        }
    }
    return pattern;
};
exports.buildVietnameseRegexPattern = buildVietnameseRegexPattern;
const buildVietnameseRegex = (term, flags = 'i') => {
    const pattern = (0, exports.buildVietnameseRegexPattern)(term);
    if (!pattern) {
        return new RegExp('', flags);
    }
    return new RegExp(pattern, flags);
};
exports.buildVietnameseRegex = buildVietnameseRegex;
const splitIntoTokens = (value) => value
    .split(/[\s,.;:'"()\[\]{}!@#$%^&*+\-=\\/|<>?]+/)
    .map(token => token.trim())
    .filter(token => token.length > 0);
const addTokenVariants = (token, target) => {
    const trimmed = token.trim();
    if (!trimmed) {
        return;
    }
    const normalized = (0, exports.normalizeVietnameseText)(trimmed);
    const variants = [trimmed, trimmed.toLowerCase(), normalized, normalized.toLowerCase()];
    for (const variant of variants) {
        if (variant.length > 1) {
            target.add(variant);
        }
    }
};
const buildSearchTokens = (...values) => {
    const tokens = new Set();
    for (const value of values) {
        if (!value) {
            continue;
        }
        const trimmed = value.trim();
        if (!trimmed) {
            continue;
        }
        addTokenVariants(trimmed, tokens);
        for (const part of splitIntoTokens(trimmed)) {
            addTokenVariants(part, tokens);
        }
    }
    return Array.from(tokens).slice(0, 64);
};
exports.buildSearchTokens = buildSearchTokens;
