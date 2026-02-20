import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { gmailService } from '../services/gmailService';
import { supabase } from '../services/supabase';

interface GmailAuthScreenProps {
  navigation: any;
}

export const GmailAuthScreen: React.FC<GmailAuthScreenProps> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Получаем текущего пользователя
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        setError('Сначала авторизуйтесь в приложении');
        setIsLoading(false);
        return;
      }

      const userId = authData.user.id;
      console.log('[GmailAuthScreen] User ID:', userId);

      // Проверяем что пользователь существует в таблице users
      const { data: userData, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId);

      console.log('[GmailAuthScreen] User exists check:', userData?.length ? 'YES' : 'NO');

      if (!userData || userData.length === 0) {
        console.warn('[GmailAuthScreen] User not in users table, creating...');
        const { error: createUserError } = await supabase.from('users').insert({
          id: userId,
          email: authData.user.email,
          created_at: new Date().toISOString(),
        });

        if (createUserError) {
          console.error('[GmailAuthScreen] Error creating user:', createUserError);
          // Продолжаем несмотря на ошибку RLS
        }
      }

      // Запускаем реальную Google авторизацию через gmailService
      console.log('📧 Открываем форму Google для выбора аккаунта Gmail');
      const { accessToken, refreshToken } = await gmailService.authenticate();

      // Сохраняем токены
      await gmailService.saveTokens(userId, accessToken, refreshToken);

      // Получаем профиль для проверки
      const profile = await gmailService.getProfile(accessToken);

      // Обновляем профиль пользователя в Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          gmail_email: profile.emailAddress,
          gmail_connected: true,
          gmail_connected_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.warn('[GmailAuthScreen] Update profile error:', updateError);
      }

      // Показываем успешное сообщение и возвращаемся на главный экран
      Alert.alert('✅ Gmail подключен!', `Email: ${profile.emailAddress}`);
      
      setIsLoading(false);

      // Навигация на главный экран с уведомлением
      navigation.replace('Home', {
        successMessage: '✅ Gmail успешно подключен!',
        gmailEmail: profile.emailAddress,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('[GmailAuthScreen] Error:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header с кнопкой назад */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: colors.accent }]}>← Назад</Text>
          </TouchableOpacity>
        </View>

        {/* Основной контент */}
        <View style={styles.content}>
          {/* Иконка Gmail */}
          <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
            <Text style={styles.icon}>📧</Text>
          </View>

          {/* Заголовок */}
          <Text style={[styles.title, { color: colors.text }]}>Подключите Gmail</Text>

          {/* Описание */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Приложению нужен доступ к вашим письмам, чтобы помогать с ответами. Мы не
            храним письма на своих серверах.
          </Text>

          {/* Преимущества */}
          <View style={styles.benefitsContainer}>
            <BenefitItem
              icon="🔒"
              title="Безопасность"
              description="Ваши письма остаются в Google"
              textColor={colors.text}
            />
            <BenefitItem
              icon="⚡"
              title="Быстро"
              description="Мгновенная обработка ответов"
              textColor={colors.text}
            />
            <BenefitItem
              icon="🎯"
              title="Умно"
              description="AI понимает контекст писем"
              textColor={colors.text}
            />
          </View>

          {/* Информация о разрешениях */}
          <View
            style={[
              styles.permissionsBox,
              { backgroundColor: colors.accent + '10', borderColor: colors.accent },
            ]}
          >
            <Text style={[styles.permissionsTitle, { color: colors.accent }]}>
              Требуемые разрешения:
            </Text>
            <Text style={[styles.permissionItem, { color: colors.text }]}>
              • Чтение писем (для анализа)
            </Text>
            <Text style={[styles.permissionItem, { color: colors.text }]}>
              • Создание писем (для отправки черновиков)
            </Text>
            <Text style={[styles.permissionItem, { color: colors.text }]}>
              • Чтение профиля (адрес электронной почты)
            </Text>
          </View>

          {/* Сообщение об ошибке */}
          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.errorText, { color: colors.accent }]}>{error}</Text>
            </View>
          )}

          {/* Кнопка входа через Google */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              { backgroundColor: '#fff', opacity: isLoading ? 0.6 : 1 },
            ]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#1f2937" size="small" />
            ) : (
              <>
                <Text style={styles.googleButtonIcon}>📧</Text>
                <Text style={styles.googleButtonText}>Добавить Gmail аккаунт</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Дополнительная информация */}
          <View style={styles.infoBox}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Вы можете отключить доступ в любое время в настройках Google аккаунта
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface BenefitItemProps {
  icon: string;
  title: string;
  description: string;
  textColor: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, title, description, textColor }) => (
  <View style={styles.benefitItem}>
    <Text style={styles.benefitIcon}>{icon}</Text>
    <View style={styles.benefitText}>
      <Text style={[styles.benefitTitle, { color: textColor }]}>{title}</Text>
      <Text style={[styles.benefitDescription, { color: textColor }]}>
        {description}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 44,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 28,
    textAlign: 'center',
  },
  benefitsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 0,
    gap: 12,
  },
  benefitIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  permissionsBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  permissionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  permissionItem: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 6,
  },
  errorBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  googleButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  googleButtonIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ea4335',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoBox: {
    paddingHorizontal: 12,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    textAlign: 'center',
  },
});
