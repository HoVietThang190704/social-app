import { SupportFaqRecord } from '../../domain/entities/support/SupportFaq.entity';

export const supportFaqs: SupportFaqRecord[] = [
  {
    id: 'contact-support',
    category: 'support',
    question: {
      vi: 'Tôi có thể liên hệ hỗ trợ bằng những cách nào?',
      en: 'Which support channels are available?'
    },
    answer: {
      vi: 'Bạn có thể liên hệ qua hotline 1800-1234, email support@freshmarket.vn hoặc chat trực tiếp trên ứng dụng.',
      en: 'You can contact us via hotline 1800-1234, email support@freshmarket.vn, or live chat in the app.'
    },
    helpful: 0,
    notHelpful: 0,
    keywords: ['support', 'liên hệ', 'hotline', 'email', 'chat']
  }
];
