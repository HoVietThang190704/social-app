/*
  DEPRECATED: EmailService removed (or trimmed)
  - Email sending via OTP is no longer used by the application in current scope.
  - This file now contains stubs to prevent accidental sending and to make any remaining imports fail loudly.
*/

export class EmailService {
  static async sendEmail(): Promise<boolean> {
    throw new Error('EmailService has been removed.');
  }

  static async sendOtpEmail(): Promise<boolean> {
    throw new Error('EmailService has been removed.');
  }

  static async sendPasswordResetOtpEmail(): Promise<boolean> {
    throw new Error('EmailService has been removed.');
  }
}

