"use strict";
/*
  DEPRECATED: EmailService removed (or trimmed)
  - Email sending via OTP is no longer used by the application in current scope.
  - This file now contains stubs to prevent accidental sending and to make any remaining imports fail loudly.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
class EmailService {
    static async sendEmail() {
        throw new Error('EmailService has been removed.');
    }
    static async sendOtpEmail() {
        throw new Error('EmailService has been removed.');
    }
    static async sendPasswordResetOtpEmail() {
        throw new Error('EmailService has been removed.');
    }
}
exports.EmailService = EmailService;
