import React from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/supabase';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { colors, theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    await performLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const performLogout = async () => {
    try {
      await authService.signOut();
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err: any) {
      console.error('[SettingsScreen] Logout error:', err);
      Alert.alert('Ошибка', err.message || 'Ошибка при выходе');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Настройки</Text>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ВНЕШНИЙ ВИД
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={toggleTheme}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Темная тема
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                Сейчас {theme === 'light' ? 'светлая' : 'темная'}
              </Text>
            </View>
            <View style={styles.toggle}>
              <Text style={styles.toggleIcon}>
                {theme === 'light' ? '☀️' : '🌙'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            УВЕДОМЛЕНИЯ
          </Text>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Включить уведомления
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                Получайте оповещения о новых письмах
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.accent + '80' }}
              thumbColor={notificationsEnabled ? colors.accent : colors.textSecondary}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            АККАУНТ
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Мой профиль
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                Управляйте информацией профиля
              </Text>
            </View>
            <Text style={[styles.arrow, { color: colors.textSecondary }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                marginTop: 8,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Интегрированные сервисы
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                Gmail, Deepseek и другие
              </Text>
            </View>
            <Text style={[styles.arrow, { color: colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            О ПРИЛОЖЕНИИ
          </Text>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Версия
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                1.0.0
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                marginTop: 8,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Политика конфиденциальности
              </Text>
            </View>
            <Text style={[styles.arrow, { color: colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <Pressable
            style={[
              styles.settingItem,
              {
                backgroundColor: '#FF3B30',
              },
            ]}
            onPress={() => {
              console.log('Logout button pressed');
              handleLogout();
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: '#FFFFFF' }]}>
                Выход из аккаунта
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Logout Confirmation Dialog */}
        <Modal
          visible={showLogoutConfirm}
          transparent={true}
          animationType="fade"
          onRequestClose={handleLogoutCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.confirmDialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.confirmTitle, { color: colors.text }]}>
                Выход из аккаунта
              </Text>
              <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
                Вы уверены, что хотите выйти?
              </Text>
              <View style={styles.confirmButtons}>
                <Pressable
                  onPress={handleLogoutCancel}
                  style={[styles.confirmButton, { backgroundColor: colors.border }]}
                >
                  <Text style={[styles.confirmButtonText, { color: colors.text }]}>
                    Отмена
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleLogoutConfirm}
                  style={[styles.confirmButton, { backgroundColor: '#FF3B30' }]}
                >
                  <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>
                    Выход
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 13,
    fontWeight: '400',
  },
  toggle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 20,
  },
  arrow: {
    fontSize: 18,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmDialog: {
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 20,
    borderWidth: 1,
    borderTopWidth: 1,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
