import axios from 'axios';
import { logger } from '../../shared/utils/logger';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Push Notification Service using Pushy.me
 * This service sends push notifications to mobile devices
 * even when the app is in the background or closed.
 */
export class PushNotificationService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.pushy.me';

  constructor() {
    this.apiKey = process.env.PUSHY_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('PUSHY_API_KEY is not set. Push notifications will be disabled.');
    }
  }

  /**
   * Send push notification to a single device
   */
  async sendToDevice(deviceToken: string, payload: PushNotificationPayload): Promise<boolean> {
    if (!this.apiKey) {
      logger.warn('Push notification skipped: PUSHY_API_KEY not configured');
      return false;
    }

    if (!deviceToken) {
      logger.warn('Push notification skipped: No device token provided');
      return false;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/push?api_key=${this.apiKey}`,
        {
          to: deviceToken,
          // Data payload - Pushy sẽ gọi notification listener
          data: {
            ...payload.data,
            title: payload.title,
            message: payload.body
          },
          // Android notification options
          notification: {
            title: payload.title,
            body: payload.body,
            sound: 'default',
            badge: 1,
            // Channel ID phải khớp với Flutter app
            android_channel_id: 'friend_requests'
          },
          // QUAN TRỌNG: Đảm bảo notification hiển thị
          content_available: true,
          mutable_content: true,
          // Ưu tiên cao để hiển thị ngay
          priority: 'high',
          // Time to live: 24 hours
          time_to_live: 86400
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data?.success) {
        logger.info(`Push notification sent successfully to device: ${deviceToken.substring(0, 10)}...`);
        return true;
      }

      logger.warn('Push notification response indicates failure', {
        status: response.status,
        data: response.data
      });
      return false;
    } catch (error: any) {
      logger.error('Failed to send push notification', {
        message: error?.message || error,
        status: error?.response?.status,
        data: error?.response?.data
      });
      return false;
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendToDevices(deviceTokens: string[], payload: PushNotificationPayload): Promise<{
    successCount: number;
    failureCount: number;
  }> {
    if (!this.apiKey) {
      logger.warn('Push notifications skipped: PUSHY_API_KEY not configured');
      return { successCount: 0, failureCount: deviceTokens.length };
    }

    const validTokens = deviceTokens.filter(t => t && t.length > 0);
    if (validTokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/push?api_key=${this.apiKey}`,
        {
          to: validTokens,
          // Data payload - Pushy sẽ gọi notification listener
          data: {
            ...payload.data,
            title: payload.title,
            message: payload.body
          },
          // Android notification options
          notification: {
            title: payload.title,
            body: payload.body,
            sound: 'default',
            badge: 1,
            // Channel ID phải khớp với Flutter app
            android_channel_id: 'friend_requests'
          },
          // QUAN TRỌNG: Đảm bảo notification hiển thị
          content_available: true,
          mutable_content: true,
          // Ưu tiên cao để hiển thị ngay
          priority: 'high',
          // Time to live: 24 hours
          time_to_live: 86400
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data?.success) {
        logger.info(`Push notifications sent to ${validTokens.length} devices`);
        return { successCount: validTokens.length, failureCount: 0 };
      }

      return { successCount: 0, failureCount: validTokens.length };
    } catch (error: any) {
      logger.error('Failed to send batch push notifications:', error?.message || error);
      return { successCount: 0, failureCount: validTokens.length };
    }
  }

  /**
   * Send push notification to a topic
   */
  async sendToTopic(topic: string, payload: PushNotificationPayload): Promise<boolean> {
    if (!this.apiKey) {
      logger.warn('Push notification skipped: PUSHY_API_KEY not configured');
      return false;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/push?api_key=${this.apiKey}`,
        {
          to: `/topics/${topic}`,
          notification: {
            title: payload.title,
            body: payload.body,
            sound: 'default'
          },
          data: {
            ...payload.data,
            title: payload.title,
            message: payload.body
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return response.data?.success === true;
    } catch (error: any) {
      logger.error('Failed to send topic push notification:', error?.message || error);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
