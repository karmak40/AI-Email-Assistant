import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MessageCard from '../components/MessageCard';
import { gmailService, MessageForDisplay } from '../services/gmailService';
import { supabase } from '../services/supabase';

interface InboxScreenProps {
  navigation: any;
  route: any;
}

export const InboxScreen: React.FC<InboxScreenProps> = ({ navigation, route }) => {
  const [messages, setMessages] = useState<MessageForDisplay[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageForDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'important' | 'unread'>('all');
  const [aiSortingInProgress, setAiSortingInProgress] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  // Получаем текущего пользователя
  const getCurrentUser = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('[InboxScreen] Get user error:', error);
      return null;
    }
  }, []);

  // Загружаем токен доступа Gmail
  const loadAccessToken = useCallback(async () => {
    try {
      console.log('[InboxScreen] 1️⃣ Starting loadAccessToken...');
      
      // Используем новую функцию gmailService которая автоматически управляет токенами
      const token = await gmailService.getAccessToken();
      
      if (token) {
        console.log('[InboxScreen] ✅ Token loaded successfully');
        setAccessToken(token);
      } else {
        console.warn('[InboxScreen] ⚠️ No token available');
      }
    } catch (error) {
      console.error('[InboxScreen] Load token error:', error);
    }
  }, []);

  // Загружаем письма
  const loadMessages = useCallback(async () => {
    try {
      if (!accessToken) {
        console.warn('[InboxScreen] ⚠️ No access token available');
        return;
      }

      setLoading(true);
      console.log('[InboxScreen] 📧 Loading messages with token...');

      const result = await gmailService.getMessages(accessToken, 25);
      const loadedMessages = result.messages;
      console.log('[InboxScreen] 📨 Loaded messages count:', loadedMessages.length);
      
      if (loadedMessages.length === 0) {
        console.warn('[InboxScreen] ⚠️ No messages returned from Gmail API');
      }
      
      // Сортируем по времени (новые сверху)
      const sorted = loadedMessages.sort((a, b) => b.timestamp - a.timestamp);
      console.log('[InboxScreen] ✅ Messages sorted, setting state');
      
      setMessages(sorted);
      setNextPageToken(result.nextPageToken);
      applyFilters(sorted, filterMode, searchQuery);
    } catch (error) {
      console.error('[InboxScreen] ❌ Load messages error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      // Если токен истёк - очистить и предложить переавторизоваться
      if (errorMessage.includes('Token expired') || errorMessage.includes('401')) {
        Alert.alert(
          'Сессия истекла',
          'Пожалуйста, переподключитесь к Gmail',
          [
            {
              text: 'Переподключиться',
              onPress: async () => {
                setAccessToken(null);
                // Будет загруженным в useEffect при изменении accessToken
              },
            },
          ]
        );
      } else {
        Alert.alert('Ошибка', `Не удалось загрузить письма: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, filterMode, searchQuery]);

  // Применяем фильтры и поиск
  const applyFilters = (
    messagesToFilter: MessageForDisplay[],
    mode: 'all' | 'important' | 'unread',
    query: string
  ) => {
    let filtered = messagesToFilter;

    // Применяем фильтр по типу
    if (mode === 'important') {
      filtered = filtered.filter(m => m.isImportant);
    } else if (mode === 'unread') {
      filtered = filtered.filter(m => !m.isRead);
    }

    // Применяем поиск
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.from.name.toLowerCase().includes(lowerQuery) ||
          m.from.email.toLowerCase().includes(lowerQuery) ||
          m.subject.toLowerCase().includes(lowerQuery) ||
          m.snippet.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredMessages(filtered);
  };

  // Обновляем фильтры при изменении поиска
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilters(messages, filterMode, query);
  };

  // Обновляем фильтр
  const handleFilterChange = (mode: 'all' | 'important' | 'unread') => {
    setFilterMode(mode);
    applyFilters(messages, mode, searchQuery);
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  // AI сортировка - анализирует письма и помечает важные
  const handleAISorting = async () => {
    try {
      setAiSortingInProgress(true);
      console.log('[InboxScreen] AI Sorting...');

      // Простой AI анализ на основе ключевых слов
      const updatedMessages = messages.map(msg => {
        const content = `${msg.subject} ${msg.snippet}`.toLowerCase();
        
        // Ключевые слова для определения важности
        const urgentKeywords = [
          'срочно', 'urgent', 'asap', 'важное', 'critical',
          'срочное', 'срочный', 'неотложно', 'неотложный',
          'deadline', 'крайний срок', 'просрочено',
        ];
        
        const spamKeywords = [
          'unsubscribe', 'отписаться', 'marketing',
          'newsletter', 'promotional', 'реклама',
        ];

        const hasUrgent = urgentKeywords.some(kw => content.includes(kw));
        const hasSpam = spamKeywords.some(kw => content.includes(kw));
        const isFromKnown = msg.from.name && msg.from.name.length > 2;

        // AI оценка
        let aiScore = 0.5;
        if (hasUrgent) aiScore = 0.95;
        else if (hasSpam) aiScore = 0.1;
        else if (isFromKnown) aiScore = 0.7;
        else aiScore = 0.4;

        return {
          ...msg,
          isImportant: aiScore > 0.7,
          aiScore,
        };
      });

      setMessages(updatedMessages);
      applyFilters(updatedMessages, filterMode, searchQuery);

      Alert.alert('Успех', 'AI анализ завершен. Письма отсортированы.');
    } catch (error) {
      console.error('[InboxScreen] AI Sorting error:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить AI анализ');
    } finally {
      setAiSortingInProgress(false);
    }
  };

  // Загрузка следующих писем (пагинация)
  const loadMoreMessages = useCallback(async () => {
    if (!accessToken || !nextPageToken || loadingMore) {
      return;
    }

    try {
      setLoadingMore(true);
      console.log('[InboxScreen] ➡️ Loading more messages...');
      
      const result = await gmailService.getMessages(accessToken, 25, nextPageToken);
      const moreMessages = result.messages;
      
      if (moreMessages.length > 0) {
        // Добавляем новые письма к существующим
        setMessages(prev => [...prev, ...moreMessages]);
        setNextPageToken(result.nextPageToken);
        
        // Пере申применяем фильтры
        const allMessages = [...messages, ...moreMessages].sort((a, b) => b.timestamp - a.timestamp);
        applyFilters(allMessages, filterMode, searchQuery);
        
        console.log('[InboxScreen] ✅ Loaded more:', moreMessages.length);
      }
    } catch (error) {
      console.error('[InboxScreen] Load more error:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить больше писем');
    } finally {
      setLoadingMore(false);
    }
  }, [accessToken, nextPageToken, loadingMore, filterMode, searchQuery, messages]);

  // Навигация на экран письма
  const handleMessagePress = (message: MessageForDisplay) => {
    navigation.navigate('MessageDetail', { message });
  };

  // Инициализация
  useEffect(() => {
    loadAccessToken();
  }, [loadAccessToken]);

  useFocusEffect(
    useCallback(() => {
      if (accessToken) {
        loadMessages();
      }
    }, [accessToken, loadMessages])
  );

  // Если Gmail не подключен
  if (!accessToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyIcon}>📧</Text>
          <Text style={styles.emptyTitle}>Gmail не подключен</Text>
          <Text style={styles.emptyDescription}>
            Подключите Gmail в настройках, чтобы видеть письма
          </Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.connectButtonText}>Перейти в настройки</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Загрузка
  if (loading && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loaderText}>Загрузка писем...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Пусто
  const emptyState = filteredMessages.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Входящие</Text>
        {messages.length > 0 && (
          <Text style={styles.messageCount}>{filteredMessages.length}</Text>
        )}
      </View>

      {/* Поиск */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск писем..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.searchIcon}>🔍</Text>
        )}
      </View>

      {/* Кнопки фильтров и AI */}
      <View style={styles.controlsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterButtonsScroll}
        >
          <Pressable
            style={[
              styles.filterButton,
              filterMode === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterMode === 'all' && styles.filterButtonTextActive,
              ]}
            >
              Все
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              filterMode === 'important' && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('important')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterMode === 'important' && styles.filterButtonTextActive,
              ]}
            >
              🔴 Срочные
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              filterMode === 'unread' && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('unread')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterMode === 'unread' && styles.filterButtonTextActive,
              ]}
            >
              Непрочитанные
            </Text>
          </Pressable>

          <Pressable
            style={styles.aiButton}
            onPress={handleAISorting}
            disabled={aiSortingInProgress}
          >
            {aiSortingInProgress ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.aiButtonText}>🤖 AI-сортировка</Text>
            )}
          </Pressable>
        </ScrollView>
      </View>

      {/* Список писем */}
      {emptyState ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyIcon}>
            {filterMode === 'important' ? '🔍' : filterMode === 'unread' ? '📭' : '📭'}
          </Text>
          <Text style={styles.emptyTitle}>
            {filterMode === 'important'
              ? 'Срочных писем нет'
              : filterMode === 'unread'
              ? 'Все письма прочитаны'
              : 'Входящие пусты'}
          </Text>
          <Text style={styles.emptyDescription}>
            {searchQuery
              ? 'Попробуйте другой запрос'
              : filterMode === 'important'
              ? 'Срочные письма появятся здесь'
              : 'Письма будут здесь'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMessages}
          renderItem={({ item }) => (
            <MessageCard
              message={item}
              onPress={handleMessagePress}
            />
          )}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
          onEndReachedThreshold={0.3}
          onEndReached={({ distanceFromEnd }) => {
            if (distanceFromEnd < 0) return;
            loadMoreMessages();
          }}
          scrollEventThrottle={16}
          ListFooterComponent={
            loadingMore && nextPageToken ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadMoreText}>Загрузка ещё писем...</Text>
              </View>
            ) : nextPageToken ? (
              <View style={styles.loadMoreContainer}>
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreMessages}
                  disabled={loadingMore}
                >
                  <Text style={styles.loadMoreButtonText}>
                    Загрузить ещё ({nextPageToken ? '➡️' : '✓'})
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}

      {/* Индикатор загрузки при обновлении */}
      {refreshing && (
        <View style={styles.refreshingIndicator}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.refreshingText}>Обновление...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  messageCount: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    marginLeft: 8,
    color: '#999',
  },
  clearButton: {
    fontSize: 18,
    marginLeft: 8,
    color: '#999',
  },
  controlsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 10,
  },
  filterButtonsScroll: {
    paddingHorizontal: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  aiButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiButtonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshingIndicator: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshingText: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 12,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loadMoreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadMoreText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
