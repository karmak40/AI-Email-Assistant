import React, { useEffect, useState } from 'react';
import {
    Alert,
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

interface HomeScreenProps {
  navigation: any;
  route: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const { colors, theme, toggleTheme } = useTheme();
  const [demoModalVisible, setDemoModalVisible] = useState(false);

  // Обработка параметров навигации (успешное подключение Gmail)
  useEffect(() => {
    if (route?.params?.successMessage) {
      Alert.alert('Успех!', route.params.successMessage);
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
  scrollContent: {
    paddingBottom: 40,
  },
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
  section: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
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
