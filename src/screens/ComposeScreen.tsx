import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ComposeScreenProps {
  navigation: any;
  route: any;
}

export const ComposeScreen: React.FC<ComposeScreenProps> = ({ navigation, route }) => {
  const { colors, theme } = useTheme();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    // TODO: Отправить письмо через Gmail API
    if (to && subject) {
      alert('Письмо отправляется...');
    } else {
      alert('Пожалуйста, заполните поля "Кому" и "Тема"');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.cancelButton, { color: colors.accent }]}>Отмена</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Новое письмо</Text>
          <TouchableOpacity onPress={handleSend}>
            <Text style={[styles.sendButton, { color: colors.accent }]}>Отправить</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
          {/* Кому */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Кому:</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Email адрес получателя"
              placeholderTextColor={colors.textSecondary}
              value={to}
              onChangeText={setTo}
              keyboardType="email-address"
            />
          </View>

          {/* Тема */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Тема:</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Тема письма"
              placeholderTextColor={colors.textSecondary}
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          {/* Текст письма */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Текст:</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Напишите текст письма..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={12}
              value={body}
              onChangeText={setBody}
              textAlignVertical="top"
            />
          </View>

          {/* AI Помощник */}
          <View style={[styles.aiHelperSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.aiHelperTitle, { color: colors.text }]}>AI Помощник</Text>
            <View style={styles.aiHelperButtons}>
              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: colors.background }]}
              >
                <Text style={styles.aiButtonIcon}>✓</Text>
                <Text style={[styles.aiButtonText, { color: colors.text }]}>Исправить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: colors.background }]}
              >
                <Text style={styles.aiButtonIcon}>🎭</Text>
                <Text style={[styles.aiButtonText, { color: colors.text }]}>Изменить тон</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: colors.background }]}
              >
                <Text style={styles.aiButtonIcon}>📝</Text>
                <Text style={[styles.aiButtonText, { color: colors.text }]}>Расширить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sendButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 200,
  },
  aiHelperSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  aiHelperTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  aiHelperButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  aiButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  aiButtonIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
