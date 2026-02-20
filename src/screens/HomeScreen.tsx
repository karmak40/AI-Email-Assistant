import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  DemoModal,
  FeatureItem,
  HeroSection,
  StepItem,
} from '../components';
import { useTheme } from '../context/ThemeContext';
import { googleProfileService, GoogleUserProfile } from '../services/googleProfileService';
import { supabase } from '../services/supabase';

interface HomeScreenProps {
  navigation: any;
  route: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const { colors, theme, toggleTheme } = useTheme();
  const [demoModalVisible, setDemoModalVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<GoogleUserProfile | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Загружаем профиль пользователя при монтировании компонента
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        
        // Получаем данные пользователя из БД
        const { data: userData } = await supabase
          .from('users')
          .select('gmail_email, gmail_connected')
          .eq('id', session.user.id)
          .single();

        if (userData?.gmail_connected) {
          setGmailConnected(true);
          setGmailEmail(userData.gmail_email);
        }
        
        // Получаем Google токены из Supabase
        const { data: tokenData } = await supabase
          .from('user_tokens')
          .select('access_token')
          .eq('user_id', session.user.id)
          .eq('provider', 'gmail')
          .single();

        if (tokenData?.access_token) {
          try {
            const profile = await googleProfileService.getUserProfile(tokenData.access_token);
            setUserProfile(profile);
          } catch (profileError) {
            console.warn('[HomeScreen] Could not load profile, continuing without it:', profileError);
            // Профиль - не критичный, приложение работает и без него
            // Можем использовать данные сессии как fallback
            if (session.user.email) {
              setUserProfile({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || 'User',
              });
            }
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Обработка параметров навигации (успешное подключение Gmail)
  useEffect(() => {
    if (route?.params?.successMessage) {
      Alert.alert('Успех!', route.params.successMessage);
      // Перезагружаем профиль
      loadUserProfile();
      // Очищаем параметры
      navigation.setParams({ successMessage: undefined, gmailEmail: undefined });
    }
  }, [route?.params?.successMessage]);

  const features = [
    {
      title: 'Исправление ошибок',
      description: 'AI автоматически исправляет грамматические и пунктуационные ошибки',
      icon: '✓',
    },
    {
      title: 'Смена тона',
      description: 'Переводит текст в формальный, дружеский или другой тон',
      icon: '🎭',
    },
    {
      title: 'Генерация ответов',
      description: 'Быстро генерирует уместные ответы на входящие письма',
      icon: '✉️',
    },
    {
      title: 'Расширение текста',
      description: 'Дополняет краткие тезисы подробным и развернутым текстом',
      icon: '📝',
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Откройте приложение',
      description: 'Запустите AI Email Assistant и авторизуйтесь через Supabase',
      icon: '🚀',
    },
    {
      number: 2,
      title: 'Вставьте текст',
      description: 'Скопируйте или напишите текст письма в редактор',
      icon: '📌',
    },
    {
      number: 3,
      title: 'Выберите действие',
      description: 'Нажмите на нужное действие: исправить, изменить тон, генерировать',
      icon: '⚡',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : isAuthenticated && userProfile ? (
        // Экран для авторизованного пользователя
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header с профилем */}
          <View style={styles.authenticatedHeader}>
            <View style={styles.profileInfo}>
              {userProfile.picture ? (
                <Image
                  source={{ uri: userProfile.picture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}>
                  <Text style={styles.avatarInitial}>
                    {userProfile.given_name?.charAt(0) || userProfile.email.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {userProfile.given_name || 'Привет'}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                  {userProfile.email}
                </Text>
                {gmailConnected && gmailEmail && (
                  <View style={styles.gmailStatus}>
                    <Text style={styles.gmailStatusIcon}>✅</Text>
                    <Text style={[styles.gmailStatusText, { color: colors.textSecondary }]}>
                      Gmail: {gmailEmail}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.themeButton, { backgroundColor: colors.surface }]}
            >
              <Text style={styles.themeIcon}>{theme === 'light' ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Основные действия */}
          <View style={styles.mainActionsContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('InboxTab')}
              style={[styles.mainActionCard, { backgroundColor: colors.surface }]}
            >
              <Text style={styles.actionIcon}>📧</Text>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Входящие</Text>
              <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                Просмотр всех писем
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ComposeTab')}
              style={[styles.mainActionCard, { backgroundColor: colors.surface }]}
            >
              <Text style={styles.actionIcon}>✍️</Text>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Написать письмо</Text>
              <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                Создать новое письмо
              </Text>
            </TouchableOpacity>
          </View>

          {/* Быстрые действия AI */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Быстрые действия
            </Text>
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={[styles.quickActionItem, { backgroundColor: colors.background }]}>
                <Text style={styles.quickActionIcon}>💬</Text>
                <Text style={[styles.quickActionTitle, { color: colors.text }]}>
                  Ответить на последние
                </Text>
                <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>
                  AI анализирует непрочитанные
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickActionItem, { backgroundColor: colors.background }]}>
                <Text style={styles.quickActionIcon}>⚡</Text>
                <Text style={[styles.quickActionTitle, { color: colors.text }]}>
                  Проверить срочные
                </Text>
                <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>
                  AI ищет важные письма
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickActionItem, { backgroundColor: colors.background }]}>
                <Text style={styles.quickActionIcon}>📋</Text>
                <Text style={[styles.quickActionTitle, { color: colors.text }]}>
                  Саммари за день
                </Text>
                <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>
                  Краткое содержание всех писем
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        // Экран для неавторизованного пользователя
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Header с кнопкой темы */}
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            AI Email Assistant
          </Text>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeButton, { backgroundColor: colors.surface }]}
          >
            <Text style={styles.themeIcon}>{theme === 'light' ? '🌙' : '☀️'}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <HeroSection
          title="AI Email Assistant — пишите письма в 10 раз быстрее"
          subtitle="Исправляйте ошибки, меняйте тон, генерируйте ответы голосом"
        >
          <Button
            title="Попробовать демо"
            onPress={() => setDemoModalVisible(true)}
            variant="primary"
            size="large"
            style={{ width: '100%', maxWidth: 280, marginBottom: 12 }}
          />
          <Button
            title="Подключить Gmail"
            onPress={() => navigation.navigate('GmailAuth')}
            variant="outline"
            size="large"
            style={{ width: '100%', maxWidth: 280 }}
          />
        </HeroSection>

        {/* Как это работает */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Как это работает
          </Text>
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <StepItem
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
                icon={step.icon}
              />
            ))}
          </View>
        </View>

        {/* Возможности */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Основные возможности
          </Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureWrapper}>
                <FeatureItem
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                />
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={[styles.ctaSection, { backgroundColor: colors.accent + '10' }]}>
          <Text style={[styles.ctaTitle, { color: colors.text }]}>
            Готовы к инновациям?
          </Text>
          <Text style={[styles.ctaSubtitle, { color: colors.textSecondary }]}>
            Начните экономить время на написании писем прямо сейчас
          </Text>
          <Button
            title="Попробовать бесплатно"
            onPress={() => navigation.navigate('Auth')}
            variant="primary"
            size="large"
            style={{ width: '100%', marginTop: 16 }}
          />
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2026 AI Email Assistant. Все права защищены.
          </Text>
        </View>
      </ScrollView>
      )}

      {/* Demo Modal */}
      <DemoModal
        visible={demoModalVisible}
        onClose={() => setDemoModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Неавторизованный пользователь
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  // Авторизованный пользователь
  authenticatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#666',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: 20,
  },
  // Основные действия
  mainActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  mainActionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  // Секции
  section: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  // Быстрые действия
  quickActionsContainer: {
    gap: 12,
  },
  quickActionItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  gmailStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  gmailStatusIcon: {
    fontSize: 12,
  },
  gmailStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Старые стили для неавторизованного экрана
  stepsContainer: {
    marginTop: 0,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  featureWrapper: {
    width: '48%',
    aspectRatio: 1.15,
  },
  ctaSection: {
    marginHorizontal: 24,
    marginVertical: 32,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 40,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
});
