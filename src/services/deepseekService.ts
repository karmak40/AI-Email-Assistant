import { Alert } from 'react-native';

// Временно используем mock, т.к. API ключ нужно добавить в .env
const DEEPSEEK_API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || 'mock-key';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

export type ToneType = 'professional' | 'friendly';

interface DeepseekRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'system';
    content: string;
  }>;
  temperature: number;
  max_tokens: number;
}

interface DeepseekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const deepseekService = {
  async polishText(text: string): Promise<string> {
    try {
      const prompt = `Исправь грамматические и стилистические ошибки. Сохрани смысл и тон. Верни только исправленный текст без объяснений.

Текст для исправления:
${text}`;

      return await this.callDeepseekAPI(prompt);
    } catch (error) {
      console.error('Polish text error:', error);
      throw error;
    }
  },

  async changeTone(text: string, tone: ToneType): Promise<string> {
    try {
      let tonePrompt = '';

      if (tone === 'professional') {
        tonePrompt = `Перепиши текст в официально-деловом стиле. Используй уважительные обращения и формальные выражения. Верни только переписанный текст без объяснений.

Текст:
${text}`;
      } else if (tone === 'friendly') {
        tonePrompt = `Перепиши текст в дружелюбном, неформальном тоне, но сохрани профессионализм и понятность. Используй более casual выражения и позитивные интонации. Верни только переписанный текст без объяснений.

Текст:
${text}`;
      }

      return await this.callDeepseekAPI(tonePrompt);
    } catch (error) {
      console.error('Change tone error:', error);
      throw error;
    }
  },

  async callDeepseekAPI(prompt: string): Promise<string> {
    try {
      // Используем mock для демонстрации, если API ключ не настроен
      if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'mock-key') {
        return await this.getMockResponse(prompt);
      }

      const request: DeepseekRequest = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      };

      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(
          `Deepseek API error: ${response.status} ${response.statusText}`
        );
      }

      const data: DeepseekResponse = await response.json();
      const result = data.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from Deepseek API');
      }

      return result.trim();
    } catch (error) {
      console.error('Deepseek API call error:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось обработать текст. Проверьте подключение к интернету.'
      );
      throw error;
    }
  },

  async getMockResponse(prompt: string): Promise<string> {
    // Имитация задержки сети
    return new Promise((resolve) => {
      setTimeout(() => {
        let mockResponse = '';

        if (prompt.includes('Исправь грамматические')) {
          const match = prompt.match(/Текст для исправления:\n([\s\S]*)/);
          const originalText = match ? match[1].trim() : 'текст';
          mockResponse = `${originalText} (исправлено грамматикой).`;
        } else if (prompt.includes('официально-деловом')) {
          const match = prompt.match(/Текст:\n([\s\S]*)/);
          const originalText = match ? match[1].trim() : 'текст';
          mockResponse = `Уважаемый адресат,\n\nХотел бы обратить Ваше внимание на следующее: ${originalText}\n\nС уважением.`;
        } else if (prompt.includes('дружелюбном')) {
          const match = prompt.match(/Текст:\n([\s\S]*)/);
          const originalText = match ? match[1].trim() : 'текст';
          mockResponse = `Привет! 😊\n\nЯ хотел бы рассказать тебе о следующем: ${originalText}\n\nСпасибо за внимание! 👋`;
        } else {
          mockResponse = 'Это улучшенный вариант текста.';
        }

        resolve(mockResponse);
      }, 800);
    });
  },
};
