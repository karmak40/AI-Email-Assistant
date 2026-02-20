import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { MessageForDisplay } from '../services/gmailService';

interface MessageCardProps {
  message: MessageForDisplay;
  onPress: (message: MessageForDisplay) => void;
  isSelected?: boolean;
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  onPress,
  isSelected = false,
}) => {
  // Форматируем дату
  const formatDate = (dateString: string | number) => {
    try {
      const date = typeof dateString === 'string' 
        ? new Date(dateString) 
        : new Date(dateString);
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Сейчас';
      if (diffMins < 60) return `${diffMins}м назад`;
      if (diffHours < 24) return `${diffHours}ч назад`;
      if (diffDays < 7) return `${diffDays}д назад`;
      
      return date.toLocaleDateString('ru-RU', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Недавно';
    }
  };

  // Форматируем текст письма на 2 строки
  const getSnippetLines = (snippet: string) => {
    const lines = snippet.split('\n').filter(l => l.trim());
    return lines.slice(0, 2).join('\n');
  };

  const senderDisplay = message.from.name || message.from.email;
  const dateDisplay = formatDate(message.date);

  return (
    <Pressable
      onPress={() => onPress(message)}
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        !message.isRead && styles.unreadContainer,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.senderInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {senderDisplay.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.senderDetails}>
              <Text
                style={[
                  styles.senderName,
                  !message.isRead && styles.unreadText,
                ]}
                numberOfLines={1}
              >
                {senderDisplay}
              </Text>
              <Text
                style={[
                  styles.senderEmail,
                  !message.isRead && styles.unreadText,
                ]}
                numberOfLines={1}
              >
                {message.from.email}
              </Text>
            </View>
          </View>
          <View style={styles.rightHeader}>
            <Text style={styles.date}>{dateDisplay}</Text>
            {message.isStarred && (
              <Text style={styles.icon}>⭐</Text>
            )}
            {message.isImportant && (
              <Text style={styles.icon}>🔴</Text>
            )}
          </View>
        </View>

        <View style={styles.subjectContainer}>
          <Text
            style={[
              styles.subject,
              !message.isRead && styles.unreadText,
            ]}
            numberOfLines={1}
          >
            {message.subject || '(без темы)'}
          </Text>
          {message.aiScore && message.aiScore > 0.5 && (
            <Text style={styles.aiIcon}>🤖</Text>
          )}
        </View>

        <Text
          style={[
            styles.snippet,
            !message.isRead && styles.unreadSnippet,
          ]}
          numberOfLines={2}
        >
          {getSnippetLines(message.snippet)}
        </Text>

        {message.isImportant && (
          <View style={styles.importantBadge}>
            <Text style={styles.importantBadgeText}>Срочное</Text>
          </View>
        )}
      </View>

      {!message.isRead && (
        <View style={styles.unreadIndicator} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedContainer: {
    backgroundColor: '#f5f5f5',
  },
  unreadContainer: {
    backgroundColor: '#fafafa',
  },
  unreadIndicator: {
    width: 4,
    height: '100%',
    backgroundColor: '#007AFF',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  content: {
    flex: 1,
    paddingRight: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  senderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  senderEmail: {
    fontSize: 13,
    color: '#999',
  },
  rightHeader: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  date: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  icon: {
    fontSize: 14,
    marginTop: 2,
  },
  subjectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subject: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  aiIcon: {
    fontSize: 14,
    marginLeft: 6,
  },
  snippet: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  unreadText: {
    fontWeight: '700',
    color: '#000',
  },
  unreadSnippet: {
    color: '#333',
    fontWeight: '600',
  },
  importantBadge: {
    backgroundColor: '#ffe6e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  importantBadgeText: {
    fontSize: 11,
    color: '#d32f2f',
    fontWeight: '600',
  },
});

export default MessageCard;
