// Demo версия Gmail Service для тестирования без Google верификации

export interface GmailProfile {
  id: string;
  emailAddress: string;
  historyId: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
}

const DEMO_EMAIL = 'glushchenko.konstantin@gmail.com';
const DEMO_MESSAGES = [
  {
    id: '1',
    threadId: '1',
    labelIds: ['INBOX', 'IMPORTANT'],
    snippet: '📧 Добро пожаловать в AI Email Assistant! Это тестовое письмо.',
  },
  {
    id: '2',
    threadId: '2',
    labelIds: ['INBOX'],
    snippet: '💌 Второе письмо - проверка функциональности приложения.',
  },
  {
    id: '3',
    threadId: '3',
    labelIds: ['INBOX'],
    snippet: '🚀 Третье письмо - давайте тестировать AI функции!',
  },
];

export const gmailServiceDemo = {
  async authenticate(): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    console.log('🧪 DEMO: Mock Google авторизация');
    return {
      accessToken: 'demo_access_token_' + Date.now(),
      refreshToken: 'demo_refresh_token_' + Date.now(),
    };
  },

  async getProfile(accessToken: string): Promise<GmailProfile> {
    console.log('🧪 DEMO: Getting mock profile');
    return {
      id: 'demo_user_123',
      emailAddress: DEMO_EMAIL,
      historyId: 'demo_history_1',
    };
  },

  async listMessages(
    accessToken: string,
    maxResults: number = 10
  ): Promise<GmailMessage[]> {
    console.log('🧪 DEMO: Getting mock messages', maxResults);
    return DEMO_MESSAGES.slice(0, maxResults);
  },

  async saveTokens(
    userId: string,
    accessToken: string,
    refreshToken?: string
  ): Promise<void> {
    console.log('🧪 DEMO: Mock token saved');
  },

  async getSavedToken(userId: string): Promise<string | null> {
    console.log('🧪 DEMO: Getting mock token');
    return 'demo_saved_token';
  },

  async isGmailConnected(userId: string): Promise<boolean> {
    console.log('🧪 DEMO: Mock Gmail connected check');
    return true;
  },

  async disconnectGmail(userId: string): Promise<void> {
    console.log('🧪 DEMO: Mock Gmail disconnect');
  },
};
