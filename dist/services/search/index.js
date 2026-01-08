"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elasticsearchService = void 0;
const elasticsearch_service_1 = __importDefault(require("./elasticsearch.service"));
exports.elasticsearchService = elasticsearch_service_1.default;
exports.default = exports.elasticsearchService;
