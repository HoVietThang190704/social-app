"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrCodeService = void 0;
exports.qrCodeService = {
    async generate(data) {
        return `data:image/png;base64,`; // stub
    },
    async generateDataUrl(data) { return this.generate(data); }
};
exports.default = exports.qrCodeService;
