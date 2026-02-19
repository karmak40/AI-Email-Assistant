import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface DemoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Как работает AI
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.demoStep}>
              <Text
                style={[
                  styles.stepTitle,
                  { color: colors.text },
                ]}
              >
                Пример 1: Исправление ошибок
              </Text>
              <View
                style={[
                  styles.exampleBox,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Было:
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                  Привет, как дела? Я хотел бы обсудить проект с вами.
                </Text>
              </View>
              <View
                style={[
                  styles.exampleBox,
                  { backgroundColor: colors.accent + '15', borderColor: colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    { color: colors.accent },
                  ]}
                >
                  AI исправила:
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                  Здравствуйте! Я хотел бы обсудить детали проекта с вами.
                </Text>
              </View>
            </View>

            <View style={styles.demoStep}>
              <Text
                style={[
                  styles.stepTitle,
                  { color: colors.text },
                ]}
              >
                Пример 2: Смена тона
              </Text>
              <View
                style={[
                  styles.exampleBox,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Формальный тон:
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                  Уважаемый господин! Прошу вас рассмотреть мою кандидатуру.
                </Text>
              </View>
              <View
                style={[
                  styles.exampleBox,
                  { backgroundColor: colors.accent + '15', borderColor: colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    { color: colors.accent },
                  ]}
                >
                  Дружеский тон:
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                  Привет! Думаю, я бы отлично подошел для этой роли! 😊
                </Text>
              </View>
            </View>

            <View style={styles.demoStep}>
              <Text
                style={[
                  styles.stepTitle,
                  { color: colors.text },
                ]}
              >
                Пример 3: Генерация ответа
              </Text>
              <View
                style={[
                  styles.exampleBox,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Входящее письмо:
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                  Можно ли назначить встречу на завтра?
                </Text>
              </View>
              <View
                style={[
                  styles.exampleBox,
                  { backgroundColor: colors.accent + '15', borderColor: colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    { color: colors.accent },
                  ]}
                >
                  AI сгенерировала ответ:
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                  Спасибо за предложение! К сожалению, завтра у меня напряженный день. Как вам подходит послезавтра в 14:00?
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.button,
                { backgroundColor: colors.accent },
              ]}
            >
              <Text style={styles.buttonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  closeText: {
    fontSize: 20,
    fontWeight: '400',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  demoStep: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  exampleBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
