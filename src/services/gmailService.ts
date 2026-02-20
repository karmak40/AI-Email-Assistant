import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

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

export interface GmailMessageFull {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
    parts?: any[];
    body?: { data: string };
  };
}

export interface MessageForDisplay {
  id: string;
  threadId: string;
  from: {
    email: string;
    name: string;
  };
  subject: string;
  snippet: string;
  date: string;
  timestamp: number;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  aiScore?: number;
}

export const gmailService = {
  /**
   * Получить access token - с поддержкой кеширования и refresh
   * Последовательность:
   * 1. Проверить сохраненный токен в Supabase
   * 2. Если его нет - взять из текущей сессии
   * 3. Если и того нет - запросить новую авторизацию
   */
  async getAccessToken(): Promise<string> {
    try {
      // 1. Получить текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[gmailService] 🔄 No user, need to authenticate');
        const auth = await this.authenticate();
        return auth.accessToken;
      }

      // 2. Проверить сохраненный токен в БД
      const { data: tokenData, error: queryError } = await supabase
        .from('user_tokens')
        .select('access_token')
        .eq('user_id', user.id)
        .eq('provider', 'gmail')
        .single();

      if (tokenData?.access_token) {
        console.log('[gmailService] ✅ Using saved token from database');
        return tokenData.access_token;
      }

      // 3. Если нет в БД - попробовать взять из текущей сессии
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        console.log('[gmailService] ✅ Using token from current session');
        // Сохраним его для следующего раза
        await this.saveTokens(user.id, session.provider_token, session.provider_refresh_token);
        return session.provider_token;
      }

      // 4. Если ничего нет - запросить новую авторизацию
      console.log('[gmailService] 🔄 No tokens found, requesting new authentication');
      const auth = await this.authenticate();
      if (auth.accessToken) {
        await this.saveTokens(user.id, auth.accessToken, auth.refreshToken);
      }
      return auth.accessToken;
    } catch (error) {
      console.error('[gmailService] ❌ getAccessToken error:', error);
      throw error;
    }
  },

  async authenticate(): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    try {
      console.log('🔐 Используем Supabase Google OAuth');
      console.log('[gmailService] 📋 Requesting Gmail scopes...');
      
      // Правильные scopes для Gmail API
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // 🔑 КРИТИЧНО: Добавляем gmail.readonly для доступа к письмам
          scopes: 'email profile openid https://www.googleapis.com/auth/gmail.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('[gmailService] OAuth error:', error);
        throw new Error(error.message || 'OAuth failed');
      }

      console.log('✅ OAuth redirect initiated');

      // Получаем текущую сессию с токенами
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.provider_token) {
        throw new Error('No provider token in session');
      }

      console.log('✅ Got provider token from session');
      console.log('[gmailService] 🔐 Provider token (first 50 chars):', session.provider_token.substring(0, 50));
      console.log('[gmailService] 🔐 Provider token length:', session.provider_token.length);
      
      // Пытаемся декодировать JWT чтобы увидеть реальные scopes
      try {
        const parts = session.provider_token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          console.log('[gmailService] 🔓 Decoded token payload:', {
            scope: payload.scope,
            aud: payload.aud,
            exp: new Date(payload.exp * 1000),
          });
        }
      } catch (e) {
        console.warn('[gmailService] Could not decode token:', e);
      }

      return {
        accessToken: session.provider_token,
        refreshToken: session.provider_refresh_token || undefined,
      };
    } catch (error) {
      console.error('[gmailService] Authentication error:', error);
      throw error;
    }
  },

  async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    // Supabase обрабатывает обмен токенов
    throw new Error('Use Supabase OAuth instead');
  },

  async saveTokens(
    userId: string,
    accessToken: string,
    refreshToken?: string
  ): Promise<void> {
    try {
      // Сначала убедимся, что пользователь существует в таблице users
      const { data: userExists, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId);

      // Если пользователя нет - создаем его
      if (!userExists || userExists.length === 0) {
        const { error: insertError } = await supabase.from('users').insert({
          id: userId,
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('[gmailService] Error creating user:', insertError);
          // Продолжаем - может быть пользователь уже создан в другом месте
        }
      }

      // Сохраняем токены в Supabase
      const { error } = await supabase.from('user_tokens').upsert(
        {
          user_id: userId,
          access_token: accessToken,
          refresh_token: refreshToken,
          provider: 'gmail',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      );

      if (error) {
        console.error('[gmailService] Error saving tokens:', error);
        throw error;
      }
    } catch (error) {
      console.error('[gmailService] Save tokens error:', error);
      throw error;
    }
  },

  async getProfile(accessToken: string): Promise<GmailProfile> {
    try {
      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get profile failed: ${response.statusText}`);
      }

      const data: GmailProfile = await response.json();
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  async listMessages(
    accessToken: string,
    maxResults: number = 10
  ): Promise<GmailMessage[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`List messages failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('List messages error:', error);
      throw error;
    }
  },

  async getSavedToken(userId: string): Promise<string | null> {
    try {
      // Получаем токен из Supabase
      const { data, error } = await supabase
        .from('user_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .single();

      if (error) {
        console.warn('Get token error:', error);
        return null;
      }

      return data?.access_token || null;
    } catch (error) {
      console.error('Get saved token error:', error);
      return null;
    }
  },

  async isGmailConnected(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .single();

      if (error) {
        console.warn('Is connected check error:', error);
        return false;
      }

      return !!data?.access_token;
    } catch (error) {
      console.error('Is connected error:', error);
      return false;
    }
  },

  async getMessages(accessToken: string, maxResults: number = 20, pageToken?: string): Promise<{ messages: MessageForDisplay[]; nextPageToken?: string }> {
    try {
      console.log('[gmailService] 📧 Fetching messages with maxResults:', maxResults);
      console.log('[gmailService] 🔑 Access token length:', accessToken.length);
      if (pageToken) console.log('[gmailService] 📄 Using pageToken:', pageToken);

      // Получаем список ID писем
      let url = `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      
      const listResponse = await fetch(
        url,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[gmailService] 📡 List API response status:', listResponse.status);

      // Обработать 401 - токен истёк
      if (listResponse.status === 401) {
        console.warn('[gmailService] ⚠️ 401 UNAUTHENTICATED - Token expired or invalid');
        
        // Удалить старый токен из БД
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('user_tokens')
              .delete()
              .eq('user_id', user.id)
              .eq('provider', 'gmail');
            console.log('[gmailService] 🧹 Old token deleted from database');
          }
        } catch (e) {
          console.warn('[gmailService] Could not delete old token:', e);
        }
        
        throw new Error('Token expired - need to re-authenticate');
      }

      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        console.error('[gmailService] ❌ List API error:', errorText);
        throw new Error(`List messages failed: ${listResponse.statusText} - ${errorText}`);
      }

      const listData = await listResponse.json();
      console.log('[gmailService] 📨 Raw API response:', listData);
      
      const messageIds = listData.messages || [];
      const nextPageToken = listData.nextPageToken;
      console.log('[gmailService] 📬 Found message IDs count:', messageIds.length);
      if (nextPageToken) console.log('[gmailService] ➡️ Next page token available');

      if (messageIds.length === 0) {
        console.log('[gmailService] ℹ️ No messages found in Gmail');
        return { messages: [], nextPageToken };
      }

      // Получаем детали каждого письма параллельно
      const messagesPromises = messageIds.map((msg: any) =>
        this.getMessage(accessToken, msg.id)
      );

      const messages = await Promise.all(messagesPromises);
      const validMessages = messages.filter(Boolean) as MessageForDisplay[];
      
      console.log(`[gmailService] ✅ Fetched ${validMessages.length} valid messages`);
      return { messages: validMessages, nextPageToken };
    } catch (error) {
      console.error('[gmailService] ❌ Get messages error:', error);
      throw error;
    }
  },

  async getMessage(accessToken: string, messageId: string): Promise<MessageForDisplay | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn(`[gmailService] ⚠️ Failed to get message ${messageId}: ${response.status}`);
        return null;
      }

      const message = await response.json() as GmailMessageFull;

      // Парсим headers
      const headers = message.payload?.headers || [];
      const getHeader = (name: string) => {
        return headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
      };

      const from = getHeader('from');
      const subject = getHeader('subject');
      const date = getHeader('date');

      // Парсим из и имя отправителя
      const fromMatch = from.match(/(.*?)\s*<(.+?)>/) || [null, from, from];
      const [, senderName, senderEmail] = fromMatch;

      // Парсим тему - декодируем если нужно
      const decodedSubject = this.decodeSubject(subject);

      // Получаем текст письма - используем только snippet
      // Полный контент будет загружен через getFullMessageContent() в MessageDetailScreen
      const body = message.snippet || '';

      // Проверяем статусы
      const labelIds = message.labelIds || [];
      const isRead = !labelIds.includes('UNREAD');
      const isStarred = labelIds.includes('STARRED');
      const isImportant = labelIds.includes('IMPORTANT');

      console.log(`[gmailService] ✅ Parsed message ${messageId}: "${decodedSubject.substring(0, 40)}..."`);

      return {
        id: message.id,
        threadId: message.threadId,
        from: {
          email: senderEmail.trim(),
          name: senderName.trim(),
        },
        subject: decodedSubject,
        snippet: message.snippet || body.substring(0, 200),
        date: date,
        timestamp: parseInt(message.internalDate) || Date.now(),
        isRead,
        isStarred,
        isImportant,
        aiScore: isImportant ? 0.8 : 0.3, // AI оценка важности
      };
    } catch (error) {
      console.error(`[gmailService] ❌ Get message error for ${messageId}:`, error);
      return null;
    }
  },

  decodeSubject(subject: string): string {
    try {
      // Декодируем RFC 2047 encoded subjects
      if (subject.startsWith('=?')) {
        const match = subject.match(/=\?([^?]+)\?([^?]+)\?(.+?)\?=/);
        if (match) {
          const [, charset, encoding, encodedText] = match;
          if (encoding.toUpperCase() === 'B') {
            // Base64
            try {
              return Buffer.from(encodedText, 'base64').toString('utf-8');
            } catch {
              return subject;
            }
          } else if (encoding.toUpperCase() === 'Q') {
            // Quoted-printable
            return encodedText.replace(/=([0-9A-F]{2})/g, (match, hex) => 
              String.fromCharCode(parseInt(hex, 16))
            );
          }
        }
      }
      return subject;
    } catch (error) {
      return subject;
    }
  },

  async getMessageBody(): Promise<string> {
    // Не используется - просто возвращаем пустую строку
    // MessageDetailScreen показывает message.snippet
    return '';
  },

  async getFullMessageContent(accessToken: string, messageId: string): Promise<string> {
    try {
      console.log('[gmailService] 📄 Fetching full message content...');
      
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn('[gmailService] ⚠️ Failed to fetch full message');
        return '';
      }

      const data = await response.json();
      const payload = data.payload || {};

      // Функция для декодирования base64
      const decodeBase64 = (str: string): string | null => {
        try {
          let base64Str = str
            .replace(/\s/g, '') // Удаляем пробелы
            .replace(/[^A-Za-z0-9+/=/]/g, ''); // Удаляем невалидные символы
          
          // Добавляем padding если нужно
          while (base64Str.length % 4) {
            base64Str += '=';
          }
          
          // Пробуем декодировать
          try {
            if (typeof Buffer !== 'undefined') {
              const decoded = Buffer.from(base64Str, 'base64').toString('utf-8');
              return decoded;
            } else {
              const decoded = atob(base64Str);
              return decoded;
            }
          } catch (atobError) {
            // Если atob не работает, пробуем использовать TextDecoder
            try {
              const binaryString = atob(base64Str);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const decoder = new TextDecoder('utf-8');
              return decoder.decode(bytes);
            } catch (e) {
              console.warn('[gmailService] Failed to decode base64:', e);
              return null;
            }
          }
        } catch (e) {
          console.warn('[gmailService] Base64 decode error:', e);
          return null;
        }
      };

      // 1. Пытаемся получить из payload.body (если письмо не multipart)
      if (payload.body?.data) {
        const decoded = decodeBase64(payload.body.data);
        if (decoded?.trim()) {
          console.log('[gmailService] ✅ Got content from payload.body');
          return decoded;
        }
      }

      // 2. Если есть parts - ищем text/html или text/plain
      if (payload.parts && Array.isArray(payload.parts)) {
        // Сначала ищем HTML
        for (const part of payload.parts) {
          if (part.mimeType === 'text/html' && part.body?.data) {
            const decoded = decodeBase64(part.body.data);
            if (decoded?.trim()) {
              console.log('[gmailService] ✅ Got HTML content from parts');
              return decoded;
            }
          }
        }
        
        // Если нет HTML, ищем plain text
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            const decoded = decodeBase64(part.body.data);
            if (decoded?.trim()) {
              console.log('[gmailService] ✅ Got plain text content from parts');
              // Преобразуем plain text в HTML для единообразного отображения
              return `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap; word-break: break-word;">${decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
            }
          }
        }

        // 3. Если есть nested parts (multipart/alternative содержит multipart/related и т.д.)
        for (const part of payload.parts) {
          if (part.parts && Array.isArray(part.parts)) {
            // Ищем HTML в nested parts
            for (const nestedPart of part.parts) {
              if (nestedPart.mimeType === 'text/html' && nestedPart.body?.data) {
                const decoded = decodeBase64(nestedPart.body.data);
                if (decoded?.trim()) {
                  console.log('[gmailService] ✅ Got HTML from nested parts');
                  return decoded;
                }
              }
            }
            // Ищем plain text в nested parts
            for (const nestedPart of part.parts) {
              if (nestedPart.mimeType === 'text/plain' && nestedPart.body?.data) {
                const decoded = decodeBase64(nestedPart.body.data);
                if (decoded?.trim()) {
                  console.log('[gmailService] ✅ Got plain text from nested parts');
                  return `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap; word-break: break-word;">${decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
                }
              }
            }
          }
        }
      }

      console.warn('[gmailService] ⚠️ Could not extract content');
      return '';
    } catch (error) {
      console.error('[gmailService] ❌ Get full content error:', error);
      return '';
    }
  },

  async disconnectGmail(userId: string): Promise<void> {
    try {
      // Удаляем токены из Supabase
      const { error } = await supabase
        .from('user_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('provider', 'gmail');

      if (error) throw error;

      // Токены удалены из Supabase
    } catch (error) {
      console.error('Disconnect Gmail error:', error);
      throw error;
    }
  },

  async forceReauthenticate(): Promise<void> {
    try {
      console.log('[gmailService] 🔄 FORCE REAUTHENTICATE: Signing out Supabase...');
      await supabase.auth.signOut();
      console.log('[gmailService] ✅ FORCE REAUTHENTICATE: Signed out');
      
      // Очищаем localStorage
      if (typeof window !== 'undefined') {
        console.log('[gmailService] 🧹 Clearing localStorage...');
        localStorage.clear();
        console.log('[gmailService] ✅ localStorage cleared');
      }
    } catch (error) {
      console.error('[gmailService] Force reauthenticate error:', error);
    }
  }
};