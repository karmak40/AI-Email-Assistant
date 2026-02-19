import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GMAIL_CLIENT_ID || '';
const REDIRECT_SCHEME = 'com.aiemailassistant';

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

export const gmailService = {
  async authenticate(): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    try {
      // Создаем объект запроса для OAuth
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/gmail.modify');
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('redirect_uri', `${REDIRECT_SCHEME}:/oauth2redirect`);
      authUrl.searchParams.append('prompt', 'consent');

      // Открываем WebBrowser для авторизации
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        `${REDIRECT_SCHEME}:/oauth2redirect`
      );

      if (result.type !== 'success') {
        throw new Error('OAuth authentication failed');
      }

      // Парсим URL с кодом авторизации
      const url = new URL(result.url);
      const authCode = url.searchParams.get('code');

      if (!authCode) {
        throw new Error('No authorization code received');
      }

      // Обмениваем код на токены
      const tokens = await this.exchangeCodeForToken(authCode);

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };
    } catch (error) {
      console.error('Gmail authentication error:', error);
      throw error;
    }
  },

  async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          grant_type: 'authorization_code',
          redirect_uri: `${REDIRECT_SCHEME}:/oauth2redirect`,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const data: GoogleTokenResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  },

  async saveTokens(
    userId: string,
    accessToken: string,
    refreshToken?: string
  ): Promise<void> {
    try {
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

      if (error) throw error;

      // Токены хранятся только в Supabase (защищены RLS)
    } catch (error) {
      console.error('Save tokens error:', error);
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
};
