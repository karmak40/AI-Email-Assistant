import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Button } from '../components';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';

interface AuthScreenProps {
  navigation: any;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [email, setEmail] = React.useState('test@example.com');
  const [password, setPassword] = React.useState('password123');
  const [loading, setLoading] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть минимум 6 символов');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Регистрация нового пользователя
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: undefined,
            data: {
              created_at: new Date().toISOString(),
            },
          },
        });

        if (signUpError) {
          if (signUpError.message?.includes('rate limit')) {
            const { error: loginError } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            });
            if (!loginError) {
              return;
            }
          }
          throw new Error(signUpError.message || 'Ошибка регистрации');
        }

        // Создаем запись пользователя в таблице users
        if (signUpData.user) {
          const { error: insertError } = await supabase.from('users').insert({
            id: signUpData.user.id,
            email: email.trim(),
            created_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error('[AuthScreen] Insert user error:', insertError);
          }
        }

        // После регистрации автоматически логиним пользователя
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (loginError) {
          Alert.alert(
            'Аккаунт создан',
            'Пожалуйста, попробуйте войти с вашими учетными данными'
          );
          setIsSignUp(false);
          setPassword('');
          return;
        }
        return;
      } else {
        // Вход в систему
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          console.error('[AuthScreen] Sign in error:', signInError);
          throw new Error(signInError.message || 'Неверные учетные данные');
        }
        return;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Ошибка авторизации';
      console.error('[AuthScreen] Auth error:', errorMsg);
      
      if (errorMsg.includes('Invalid') && !isSignUp) {
        Alert.alert(
          'Пользователь не найден',
          'Нажмите "Нет аккаунта? Регистрация" чтобы создать аккаунт'
        );
      } else {
        Alert.alert('Ошибка', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Добро пожаловать!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Создайте аккаунт или войдите в систему
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              editable={!loading}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Пароль</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              editable={!loading}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            title={loading ? 'Загрузка...' : isSignUp ? 'Создать аккаунт' : 'Войти'}
            onPress={handleAuth}
            disabled={loading}
            variant="primary"
            size="large"
            style={{ width: '100%', marginTop: 24 }}
          />

          <Button
            title={isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
            onPress={() => !loading && setIsSignUp(!isSignUp)}
            disabled={loading}
            variant="outline"
            size="medium"
            style={{ width: '100%' }}
          />
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>✨ Как начать:</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Создайте новый аккаунт - просто заполните email и пароль
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Пароль должен быть минимум 6 символов
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • После регистрации вы автоматически войдете в приложение
          </Text>
          <Text style={[styles.infoNote, { color: colors.textSecondary }]}>
            Если ошибка "Invalid credentials" - нажмите "Регистрация" и создайте аккаунт
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  infoBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 4,
  },
  infoNote: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 'auto',
  },
});
