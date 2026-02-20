/**
 * Google Profile Service
 * Сервис для получения информации профиля пользователя из Google API
 */

export interface GoogleUserProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

export const googleProfileService = {
  /**
   * Получает профиль пользователя из Google People API
   * @param accessToken - Google access token
   * @returns Google профиль пользователя
   */
  async getUserProfile(accessToken: string): Promise<GoogleUserProfile> {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[googleProfileService] Profile fetch failed (${response.status}):`, errorText);
        throw new Error(`Get user profile failed: ${response.statusText}`);
      }

      const data: GoogleUserProfile = await response.json();
      console.log('[googleProfileService] ✅ Profile loaded successfully');
      return data;
    } catch (error) {
      console.error('[googleProfileService] ❌ Get user profile error:', error);
      throw error;
    }
  },

  /**
   * Получает фото профиля пользователя
   * @param accessToken - Google access token
   * @returns URL фото профиля
   */
  async getProfilePhoto(accessToken: string): Promise<string | null> {
    try {
      const profile = await this.getUserProfile(accessToken);
      return profile.picture || null;
    } catch (error) {
      console.error('Get profile photo error:', error);
      return null;
    }
  },

  /**
   * Получает email пользователя
   * @param accessToken - Google access token
   * @returns Email адрес пользователя
   */
  async getUserEmail(accessToken: string): Promise<string> {
    try {
      const profile = await this.getUserProfile(accessToken);
      return profile.email;
    } catch (error) {
      console.error('Get user email error:', error);
      throw error;
    }
  },
};
