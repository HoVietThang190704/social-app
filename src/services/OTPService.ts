/*
  DEPRECATED: OTPService has been removed from the project.
  This lightweight stub exists only to prevent accidental imports and to keep TypeScript happy.
*/

export class OTPService {
  static generateOTP(): string {
    throw new Error('OTPService has been removed.');
  }

  static async createOTP(..._args: any[]): Promise<{ otp: string; expiresAt: Date }> {
    throw new Error('OTPService has been removed.');
  }

  static async verifyOTP(..._args: any[]): Promise<boolean> {
    throw new Error('OTPService has been removed.');
  }

  static async sendOTP(..._args: any[]): Promise<boolean> {
    throw new Error('OTPService has been removed.');
  }

  static normalizePhone(_phone: string): string {
    throw new Error('OTPService has been removed.');
  }

  static async cleanupExpiredOTPs(): Promise<void> {
    // noop
    return;
  }
}
