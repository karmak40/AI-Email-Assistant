// Примеры использования компонентов AI Email Assistant
// Этот файл содержит примеры кода для разработчиков

import { Button, Card, HeroSection, FeatureItem, StepItem, DemoModal } from '../components';
import { useTheme } from '../context/ThemeContext';
import { View, Text } from 'react-native';

/**
 * Пример использования компонента Button
 */
export function ButtonExamples() {
  const { colors } = useTheme();

  return (
    <View>
      {/* Primary Button */}
      <Button
        title="Основная кнопка"
        onPress={() => console.log('Primary button pressed')}
        variant="primary"
        size="large"
      />

      {/* Secondary Button */}
      <Button
        title="Вторичная кнопка"
        onPress={() => console.log('Secondary button pressed')}
        variant="secondary"
        size="medium"
      />

      {/* Outline Button */}
      <Button
        title="Кнопка с контуром"
        onPress={() => console.log('Outline button pressed')}
        variant="outline"
        size="small"
      />

      {/* Disabled Button */}
      <Button
        title="Отключенная кнопка"
        onPress={() => {}}
        variant="primary"
        disabled={true}
      />
    </View>
  );
}

/**
 * Пример использования компонента Card
 */
export function CardExamples() {
  const { colors } = useTheme();

  return (
    <View>
      {/* Elevated Card */}
      <Card variant="elevated" padding={20}>
        <Text style={{ color: colors.text, fontWeight: 'bold' }}>Elevated Card</Text>
      </Card>

      {/* Outlined Card */}
      <Card variant="outlined" padding={16}>
        <Text style={{ color: colors.text }}>Outlined Card</Text>
      </Card>

      {/* Filled Card */}
      <Card variant="filled" padding={12}>
        <Text style={{ color: colors.text }}>Filled Card</Text>
      </Card>
    </View>
  );
}

/**
 * Пример использования компонента HeroSection
 */
export function HeroSectionExample() {
  return (
    <HeroSection
      title="Ваш заголовок здесь"
      subtitle="Описание или подзаголовок"
    >
      <Button
        title="Действие 1"
        onPress={() => {}}
        variant="primary"
      />
      <Button
        title="Действие 2"
        onPress={() => {}}
        variant="outline"
      />
    </HeroSection>
  );
}

/**
 * Пример использования компонента FeatureItem
 */
export function FeatureItemExample() {
  return (
    <View style={{ gap: 12 }}>
      <FeatureItem
        title="Быстрая обработка"
        description="Обрабатывает письма за считанные секунды"
        icon="⚡"
      />
      <FeatureItem
        title="Точные результаты"
        description="AI использует передовые алгоритмы"
        icon="✓"
      />
      <FeatureItem
        title="Легко в использовании"
        description="Интуитивный интерфейс для всех"
        icon="👍"
      />
    </View>
  );
}

/**
 * Пример использования компонента StepItem
 */
export function StepItemExample() {
  return (
    <View>
      <StepItem
        number={1}
        title="Первый шаг"
        description="Описание первого шага"
        icon="1️⃣"
      />
      <StepItem
        number={2}
        title="Второй шаг"
        description="Описание второго шага"
        icon="2️⃣"
      />
      <StepItem
        number={3}
        title="Третий шаг"
        description="Описание третьего шага"
        icon="3️⃣"
      />
    </View>
  );
}

/**
 * Пример использования компонента DemoModal
 */
export function DemoModalExample() {
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <>
      <Button
        title="Открыть демо"
        onPress={() => setModalVisible(true)}
      />
      <DemoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

/**
 * Пример интеграции с ThemeContext
 */
export function ThemeExample() {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <Card style={{ backgroundColor: colors.surface }}>
      <Text style={{ color: colors.text }}>
        Текущая тема: {theme}
      </Text>
      <Button
        title={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'}`}
        onPress={toggleTheme}
      />
    </Card>
  );
}

/**
 * Пример использования API сервисов
 */
export async function ApiServicesExample() {
  const { aiService, gmailService } = await import('../services/api');

  // Пример улучшения письма
  const emailContent = {
    subject: 'Встреча завтра',
    body: 'Привет! Можно встретиться завтра на кофе?',
  };

  try {
    const improved = await aiService.improveEmail(emailContent);
    console.log('Улучшенное письмо:', improved);
  } catch (error) {
    console.error('Ошибка:', error);
  }

  // Пример генерации письма
  try {
    const generated = await aiService.generateEmail('проект', 'professional');
    console.log('Сгенерированное письмо:', generated);
  } catch (error) {
    console.error('Ошибка:', error);
  }

  // Пример изменения тона
  try {
    const toned = await aiService.changeTone(
      'Привет, как дела?',
      'formal'
    );
    console.log('Текст в формальном тоне:', toned);
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

/**
 * Пример использования Supabase сервисов
 */
export async function SupabaseServicesExample() {
  const { authService, settingsService } = await import('../services/supabase');

  // Пример регистрации
  try {
    const user = await authService.signUp('user@example.com', 'password123');
    console.log('Пользователь зарегистрирован:', user);
  } catch (error) {
    console.error('Ошибка регистрации:', error);
  }

  // Пример входа
  try {
    const session = await authService.signIn('user@example.com', 'password123');
    console.log('Пользователь авторизован:', session);
  } catch (error) {
    console.error('Ошибка входа:', error);
  }

  // Пример сохранения настроек
  try {
    await settingsService.saveUserSettings('user-id', {
      theme: 'dark',
      language: 'ru',
      notifications: true,
    });
    console.log('Настройки сохранены');
  } catch (error) {
    console.error('Ошибка сохранения:', error);
  }

  // Пример получения настроек
  try {
    const settings = await settingsService.getUserSettings('user-id');
    console.log('Настройки пользователя:', settings);
  } catch (error) {
    console.error('Ошибка получения настроек:', error);
  }
}

/**
 * Пример использования навигации
 */
export function NavigationExample(navigation: any) {
  return (
    <View>
      {/* Переход на Home экран */}
      <Button
        title="На главную"
        onPress={() => navigation.navigate('HomeTab')}
      />

      {/* Переход на Auth экран */}
      <Button
        title="На авторизацию"
        onPress={() => navigation.navigate('Auth')}
      />

      {/* Переход на Settings экран */}
      <Button
        title="На настройки"
        onPress={() => navigation.navigate('SettingsTab')}
      />

      {/* Возврат на предыдущий экран */}
      <Button
        title="Назад"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}
