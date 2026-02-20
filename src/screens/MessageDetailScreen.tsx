import React, { useState, useEffect } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { MessageForDisplay, gmailService } from '../services/gmailService';

// Импортируем WebView только для мобильных платформ
let WebView: any = null;
if (Platform.OS !== 'web') {
  const { WebView: RNWebView } = require('react-native-webview');
  WebView = RNWebView;
}

interface MessageDetailScreenProps {
  navigation: any;
  route: any;
}

export const MessageDetailScreen: React.FC<MessageDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { message } = route.params as { message: MessageForDisplay };
  const [isStarred, setIsStarred] = useState(message.isStarred);
  const [fullContent, setFullContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Загружаем токен и полный контент письма
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Получаем токен
        const token = await gmailService.getAccessToken();
        if (token) {
          setAccessToken(token);
          setLoadingContent(true);
          
          // Загружаем полный контент письма
          const content = await gmailService.getFullMessageContent(token, message.id);
          setFullContent(content);
        }
      } catch (error) {
        console.error('[MessageDetailScreen] Error loading content:', error);
      } finally {
        setLoadingContent(false);
      }
    };

    loadContent();
  }, [message.id]);

  const handleToggleStar = () => {
    setIsStarred(!isStarred);
    Alert.alert('', isStarred ? 'Письмо помечено' : 'Закладка удалена');
  };

  const handleReply = () => {
    Alert.alert('Ответ', 'Функция ответа на письма будет реализована в следующей версии');
  };

  const handleMarkAsSpam = () => {
    Alert.alert('Подтверждение', 'Отправить письмо в спам?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Да, отправить',
        style: 'destructive',
        onPress: () => {
          navigation.goBack();
          Alert.alert('', 'Письмо отправлено в спам');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleStar}>
          <Text style={styles.starButton}>{isStarred ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Информация об отправителе */}
        <View style={styles.senderCard}>
          <View style={styles.senderAvatar}>
            <Text style={styles.senderAvatarText}>
              {message.from.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>{message.from.name}</Text>
            <Text style={styles.senderEmail}>{message.from.email}</Text>
          </View>
        </View>

        {/* Дата и статус */}
        <View style={styles.metaInfo}>
          <Text style={styles.date}>
            {new Date(message.date).toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <View style={styles.statusBadges}>
            {!message.isRead && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Непрочитано</Text>
              </View>
            )}
            {message.isImportant && (
              <View style={[styles.badge, styles.importantBadge]}>
                <Text style={styles.badgeText}>Срочное</Text>
              </View>
            )}
          </View>
        </View>

        {/* Тема письма */}
        <Text style={styles.subject}>{message.subject}</Text>

        {/* Разделитель */}
        <View style={styles.divider} />

        {/* Содержимое письма - полный HTML контент */}
        {loadingContent ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Загрузка контента письма...</Text>
          </View>
        ) : fullContent ? (
          Platform.OS === 'web' ? (
            // Для веб-платформы используем iframe
            <View style={styles.webViewContainer}>
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                      body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        margin: 0;
                        padding: 16px;
                        background-color: #ffffff;
                        font-size: 16px;
                        line-height: 1.5;
                        color: #333;
                      }
                      img {
                        max-width: 100% !important;
                        height: auto !important;
                      }
                      table {
                        width: 100% !important;
                        border-collapse: collapse;
                      }
                      td, th {
                        padding: 8px;
                        border: 1px solid #e0e0e0;
                      }
                      a {
                        color: #007AFF;
                        text-decoration: none;
                      }
                      pre {
                        background-color: #f5f5f5;
                        padding: 12px;
                        border-radius: 4px;
                        overflow-x: auto;
                      }
                      blockquote {
                        border-left: 4px solid #007AFF;
                        margin-left: 0;
                        padding-left: 12px;
                      }
                    </style>
                  </head>
                  <body>
                    ${fullContent}
                  </body>
                  </html>
                `}
                style={{
                  width: '100%',
                  height: 500,
                  border: 'none',
                  borderRadius: 8,
                }}
              />
            </View>
          ) : (
            // Для мобильных платформ используем WebView
            <View style={styles.webViewContainer}>
              {WebView && (
                <WebView
                  source={{
                    html: `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <meta charset="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <style>
                          body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            margin: 0;
                            padding: 16px;
                            background-color: #ffffff;
                            font-size: 16px;
                            line-height: 1.5;
                            color: #333;
                          }
                          img {
                            max-width: 100% !important;
                            height: auto !important;
                          }
                          table {
                            width: 100% !important;
                            border-collapse: collapse;
                          }
                          td, th {
                            padding: 8px;
                            border: 1px solid #e0e0e0;
                          }
                          a {
                            color: #007AFF;
                            text-decoration: none;
                          }
                          pre {
                            background-color: #f5f5f5;
                            padding: 12px;
                            border-radius: 4px;
                            overflow-x: auto;
                          }
                          blockquote {
                            border-left: 4px solid #007AFF;
                            margin-left: 0;
                            padding-left: 12px;
                          }
                          .moz-cite-prefix {
                            color: #999;
                            font-size: 12px;
                          }
                        </style>
                      </head>
                      <body>
                        ${fullContent}
                      </body>
                      </html>
                    `,
                  }}
                  style={styles.webView}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  startInLoadingState={true}
                  scalesPageToFit={true}
                  onError={(error) => console.warn('[WebView] Error:', error)}
                />
              )}
            </View>
          )
        ) : (
          <View style={styles.messageBody}>
            <Text style={styles.bodyText}>{message.snippet}</Text>
          </View>
        )}

        {/* AI Information */}
        {message.aiScore !== undefined && (
          <View style={styles.aiInfo}>
            <Text style={styles.aiTitle}>🤖 AI Анализ</Text>
            <View style={styles.aiScoreContainer}>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreBarFill,
                    {
                      width: `${message.aiScore * 100}%`,
                      backgroundColor:
                        message.aiScore > 0.7 ? '#ff6b6b' : '#4CAF50',
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreText}>
                Важность: {Math.round(message.aiScore * 100)}%
              </Text>
            </View>
            <Text style={styles.aiDescription}>
              {message.aiScore > 0.7
                ? 'AI определил это письмо как важное'
                : message.aiScore > 0.5
                ? 'Обычное письмо'
                : 'AI определил это письмо как низкоприоритетное'}
            </Text>
          </View>
        )}

        {/* Padding для прокрутки */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Фиксированная панель действий внизу */}
      <View style={styles.actionsPanel}>
        <TouchableOpacity
          style={[styles.actionButton, styles.replyButton]}
          onPress={handleReply}
        >
          <Text style={styles.actionButtonText}>↩️ Ответить</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.spamButton]}
          onPress={handleMarkAsSpam}
        >
          <Text style={styles.actionButtonText}>🚫 В спам</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  starButton: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  senderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  senderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  senderAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  senderEmail: {
    fontSize: 12,
    color: '#999',
  },
  metaInfo: {
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#e0e7ff',
  },
  importantBadge: {
    backgroundColor: '#ffe6e6',
  },
  badgeText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '600',
  },
  subject: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  messageBody: {
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  webViewContainer: {
    height: 500,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  aiInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  aiScoreContainer: {
    marginBottom: 12,
  },
  scoreBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  aiDescription: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 40,
  },
  actionsPanel: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyButton: {
    backgroundColor: '#007AFF',
  },
  spamButton: {
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
