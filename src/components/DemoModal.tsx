import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { deepseekService, ToneType } from '../services/deepseekService';

interface DemoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [inputText, setInputText] = useState('');
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handlePolishText = async () => {
    if (!inputText.trim()) {
      alert('Пожалуйста, введите текст');
      return;
    }

    setIsLoading(true);
    try {
      const result = await deepseekService.polishText(inputText);
      setResultText(result);
      setShowResult(true);
    } catch (error) {
      console.error('Polish error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeTone = async (tone: ToneType) => {
    if (!inputText.trim()) {
      alert('Пожалуйста, введите текст');
      return;
    }

    setIsLoading(true);
    try {
      const result = await deepseekService.changeTone(inputText, tone);
      setResultText(result);
      setShowResult(true);
    } catch (error) {
      console.error('Change tone error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInputText('');
    setResultText('');
    setShowResult(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>
                Попробуйте AI прямо сейчас
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {!showResult ? (
                <>
                  {/* Input Section */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>
                      Введите текст письма:
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      placeholder="Введите текст письма или нажмите 'Сгенерировать'"
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={8}
                      value={inputText}
                      onChangeText={setInputText}
                      editable={!isLoading}
                    />
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: colors.accent,
                          opacity: isLoading ? 0.6 : 1,
                        },
                      ]}
                      onPress={handlePolishText}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.buttonText}>✓ Исправить ошибки</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: colors.accent + 'DD',
                          opacity: isLoading ? 0.6 : 1,
                        },
                      ]}
                      onPress={() => handleChangeTone('professional')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.buttonText}>🎩 Официально</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: colors.accent + 'BB',
                          opacity: isLoading ? 0.6 : 1,
                        },
                      ]}
                      onPress={() => handleChangeTone('friendly')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.buttonText}>😊 Дружелюбно</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {/* Result Section */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>
                      Оригинальный текст:
                    </Text>
                    <View
                      style={[
                        styles.resultCard,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.resultText, { color: colors.text }]}>
                        {inputText}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.accent }]}>
                      Результат от AI:
                    </Text>
                    <View
                      style={[
                        styles.resultCard,
                        {
                          backgroundColor: colors.accent + '15',
                          borderColor: colors.accent,
                        },
                      ]}
                    >
                      <Text style={[styles.resultText, { color: colors.text }]}>
                        {resultText}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.accent }]}
                      onPress={() => {
                        setInputText(resultText);
                        setShowResult(false);
                      }}
                    >
                      <Text style={styles.buttonText}>↻ Использовать результат</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                onPress={
                  showResult
                    ? () => setShowResult(false)
                    : handleClose
                }
                style={[
                  styles.footerButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.footerButtonText, { color: colors.text }]}>
                  {showResult ? '← Назад' : 'Закрыть'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
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
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
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
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '400',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  actionsContainer: {
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    minHeight: 100,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  footerButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
