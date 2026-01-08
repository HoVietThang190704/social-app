"use strict";
/*
  DEPRECATED: OTPService has been removed from the project.
  This lightweight stub exists only to prevent accidental imports and to keep TypeScript happy.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPService = void 0;
class OTPService {
    static generateOTP() {
        throw new Error('OTPService has been removed.');
    }
    static async createOTP(..._args) {
        throw new Error('OTPService has been removed.');
    }
    static async verifyOTP(..._args) {
        throw new Error('OTPService has been removed.');
    }
    static async sendOTP(..._args) {
        throw new Error('OTPService has been removed.');
    }
    static normalizePhone(_phone) {
        throw new Error('OTPService has been removed.');
    }
    static async cleanupExpiredOTPs() {
        // noop
        return;
    }
}
exports.OTPService = OTPService;
