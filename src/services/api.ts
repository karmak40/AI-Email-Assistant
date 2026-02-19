import { AIResponse, EmailContent } from '../types';

// Mock AI service - подключите реальный API (Deepseek, OpenAI и т.д.)
export const aiService = {
  async improveEmail(email: EmailContent): Promise<AIResponse> {
    try {
      // Это mock-ответ. Замените на реальный API call
      const mockResponse: AIResponse = {
        corrected: `Улучшенное письмо:\n\n${email.body}`,
        suggestions: [
          'Убрать лишние запятые',
          'Усилить эмоциональное воздействие',
          'Сделать текст более конкретным',
        ],
        tone: email.tone || 'professional',
      };

      // Имитация задержки сети
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockResponse), 1000);
      });
    } catch (error) {
      console.error('AI improve email error:', error);
      throw error;
    }
  },

  async generateEmail(topic: string, tone: string): Promise<string> {
    try {
      // Mock response
      const mockEmail = `Уважаемый коллега,\n\nХотел бы обсудить ${topic}.\n\nС уважением`;

      return new Promise((resolve) => {
        setTimeout(() => resolve(mockEmail), 1500);
      });
    } catch (error) {
      console.error('AI generate email error:', error);
      throw error;
    }
  },

  async correctText(text: string): Promise<string> {
    try {
      // Mock response - просто возвращаем исправленный текст
      const correctedText = text.trim();

      return new Promise((resolve) => {
        setTimeout(() => resolve(correctedText), 800);
      });
    } catch (error) {
      console.error('AI correct text error:', error);
      throw error;
    }
  },

  async changeTone(text: string, newTone: string): Promise<string> {
    try {
      // Mock response
      const tonedText = `${text} (переведено в ${newTone} тон)`;

      return new Promise((resolve) => {
        setTimeout(() => resolve(tonedText), 900);
      });
    } catch (error) {
      console.error('AI change tone error:', error);
      throw error;
    }
  },
};

// Gmail service - заглушка для будущей интеграции
export const gmailService = {
  async connectGmail(token: string) {
    try {
      // TODO: Реализовать интеграцию с Gmail API
      console.log('Connecting Gmail with token:', token);
      return { success: true, message: 'Gmail connected' };
    } catch (error) {
      console.error('Gmail connection error:', error);
      throw error;
    }
  },

  async getEmails() {
    try {
      // Mock response
      return [];
    } catch (error) {
      console.error('Get emails error:', error);
      throw error;
    }
  },

  async sendEmail(to: string, subject: string, body: string) {
    try {
      console.log('Sending email to:', to);
      return { success: true, message: 'Email sent' };
    } catch (error) {
      console.error('Send email error:', error);
      throw error;
    }
  },
};
