# 🗄️ Инициализация Supabase - Полная База Данных

**Для полностью пустой базы данных**

---

## 📋 Содержание

1. [Создание таблиц с нуля](#создание-таблиц-с-нуля)
2. [Настройка RLS политик](#настройка-rls-политик)
3. [Создание индексов](#создание-индексов)
4. [Проверка настройки](#проверка-настройки)

---

## 🔧 Создание таблиц с нуля

### Вариант 1: Полный SQL скрипт (Рекомендуется)

Скопируйте весь скрипт ниже и выполните в Supabase SQL Editor:

```sql
-- ========================================
-- ПОЛНАЯ ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ
-- для AI Email Assistant
-- ========================================

-- ========================================
-- 1. Таблица USERS (основная таблица пользователей)
-- ========================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Gmail интеграция
  gmail_email VARCHAR(255),
  gmail_connected BOOLEAN DEFAULT false,
  gmail_connected_at TIMESTAMP,
  
  -- Профиль
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  
  -- Настройки
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'ru'
);

-- Комментарии таблицы
COMMENT ON TABLE users IS 'Основная таблица пользователей приложения';
COMMENT ON COLUMN users.email IS 'Email адрес (уникальный)';
COMMENT ON COLUMN users.gmail_email IS 'Email аккаунта Gmail если подключен';
COMMENT ON COLUMN users.gmail_connected IS 'Флаг подключения Gmail';

-- ========================================
-- 2. Таблица USER_TOKENS (токены OAuth)
-- ========================================

CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Комментарии таблицы
COMMENT ON TABLE user_tokens IS 'OAuth токены пользователей (Gmail, Google и т.д.)';
COMMENT ON COLUMN user_tokens.provider IS 'Провайдер (gmail, google и т.д.)';

-- ========================================
-- 3. Таблица EMAILS (кэш писем из Gmail)
-- ========================================

CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gmail_message_id VARCHAR(255) NOT NULL,
  thread_id VARCHAR(255),
  from_email VARCHAR(255),
  to_email VARCHAR(255),
  subject TEXT,
  snippet TEXT,
  body TEXT,
  labels TEXT[],
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  received_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, gmail_message_id)
);

-- Комментарии таблицы
COMMENT ON TABLE emails IS 'Кэш писем из Gmail для анализа';
COMMENT ON COLUMN emails.gmail_message_id IS 'ID письма в Gmail';

-- ========================================
-- 4. Таблица EMAIL_RESPONSES (сгенерированные ответы)
-- ========================================

CREATE TABLE IF NOT EXISTS email_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  corrected_text TEXT,
  tone VARCHAR(50),
  generated_response TEXT,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Комментарии таблицы
COMMENT ON TABLE email_responses IS 'Сгенерированные AI ответы и исправления';

-- ========================================
-- 5. Таблица USER_PREFERENCES (настройки пользователя)
-- ========================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Общие настройки
  auto_sync_gmail BOOLEAN DEFAULT true,
  sync_interval_minutes INTEGER DEFAULT 5,
  
  -- Тон по умолчанию
  default_tone VARCHAR(50) DEFAULT 'professional',
  
  -- Уведомления
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  
  -- AI настройки
  ai_model VARCHAR(50) DEFAULT 'deepseek',
  temperature FLOAT DEFAULT 0.7,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Комментарии таблицы
COMMENT ON TABLE user_preferences IS 'Настройки пользователя';

-- ========================================
-- 6. Таблица USAGE_STATS (статистика использования)
-- ========================================

CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Счетчики
  emails_analyzed INTEGER DEFAULT 0,
  responses_generated INTEGER DEFAULT 0,
  corrections_made INTEGER DEFAULT 0,
  
  -- API использование
  deepseek_calls INTEGER DEFAULT 0,
  gmail_api_calls INTEGER DEFAULT 0,
  
  -- Дата обновления
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Комментарии таблицы
COMMENT ON TABLE usage_stats IS 'Статистика использования приложения';

-- ========================================
-- СОЗДАНИЕ ИНДЕКСОВ
-- ========================================

-- Индексы для users
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_gmail_email_idx ON users(gmail_email);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at DESC);

-- Индексы для user_tokens
CREATE INDEX IF NOT EXISTS user_tokens_user_id_idx ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS user_tokens_provider_idx ON user_tokens(provider);
CREATE INDEX IF NOT EXISTS user_tokens_user_provider_idx ON user_tokens(user_id, provider);

-- Индексы для emails
CREATE INDEX IF NOT EXISTS emails_user_id_idx ON emails(user_id);
CREATE INDEX IF NOT EXISTS emails_gmail_message_id_idx ON emails(gmail_message_id);
CREATE INDEX IF NOT EXISTS emails_thread_id_idx ON emails(thread_id);
CREATE INDEX IF NOT EXISTS emails_received_at_idx ON emails(received_at DESC);
CREATE INDEX IF NOT EXISTS emails_user_received_idx ON emails(user_id, received_at DESC);

-- Индексы для email_responses
CREATE INDEX IF NOT EXISTS email_responses_user_id_idx ON email_responses(user_id);
CREATE INDEX IF NOT EXISTS email_responses_email_id_idx ON email_responses(email_id);
CREATE INDEX IF NOT EXISTS email_responses_created_at_idx ON email_responses(created_at DESC);

-- Индексы для user_preferences
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);

-- Индексы для usage_stats
CREATE INDEX IF NOT EXISTS usage_stats_user_id_idx ON usage_stats(user_id);

-- ========================================
-- НАСТРОЙКА RLS (Row Level Security)
-- ========================================

-- Таблица users (публичное чтение профиля, приватное редактирование)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_public_profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "users_can_update_own_profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_delete_own_profile" ON users
  FOR DELETE USING (auth.uid() = id);

-- Таблица user_tokens (приватно)
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_tokens" ON user_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_tokens" ON user_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_tokens" ON user_tokens
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_tokens" ON user_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Таблица emails (приватно)
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_emails" ON emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_emails" ON emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_emails" ON emails
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_emails" ON emails
  FOR DELETE USING (auth.uid() = user_id);

-- Таблица email_responses (приватно)
ALTER TABLE email_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_responses" ON email_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_responses" ON email_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_responses" ON email_responses
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_responses" ON email_responses
  FOR DELETE USING (auth.uid() = user_id);

-- Таблица user_preferences (приватно)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Таблица usage_stats (приватно)
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_stats" ON usage_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_stats" ON usage_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_stats" ON usage_stats
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- СОЗДАНИЕ ФУНКЦИЙ
-- ========================================

-- Функция автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tokens_updated_at BEFORE UPDATE ON user_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_responses_updated_at BEFORE UPDATE ON email_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ПРОВЕРКА ИНИЦИАЛИЗАЦИИ
-- ========================================

-- Показать все созданные таблицы
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Показать все индексы
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
```

---

## ✅ Проверка после выполнения

### 1️⃣ Проверить таблицы

```sql
-- Показать все таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Результат должен содержать:
-- users
-- user_tokens
-- emails
-- email_responses
-- user_preferences
-- usage_stats
```

### 2️⃣ Проверить индексы

```sql
-- Показать все индексы
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;
```

### 3️⃣ Проверить RLS политики

```sql
-- Показать RLS политики
SELECT * FROM pg_policies;

-- Результат должен содержать политики для всех таблиц
```

### 4️⃣ Проверить триггеры

```sql
-- Показать все триггеры
SELECT trigger_name, table_name FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY table_name;
```

---

## 🧪 Тестирование

### Тест 1: Создание пользователя

```sql
-- Вставить тестового пользователя
INSERT INTO users (email, username) 
VALUES ('test@example.com', 'testuser')
RETURNING id, email, created_at;
```

### Тест 2: Проверка RLS

```sql
-- Это должно вернуть данные пользователя
SELECT * FROM users WHERE email = 'test@example.com';

-- Если RLS работает, вы увидите только свои данные
```

### Тест 3: Создание токенов

```sql
-- Вставить токен (замените user_id на реальный)
INSERT INTO user_tokens (user_id, provider, access_token)
VALUES ('00000000-0000-0000-0000-000000000000', 'gmail', 'test_token')
RETURNING *;
```

---

## 🛠️ Если нужны изменения

### Добавить новую колонку

```sql
ALTER TABLE users ADD COLUMN new_column_name VARCHAR(100);
```

### Удалить колонку

```sql
ALTER TABLE users DROP COLUMN column_name;
```

### Изменить тип данных

```sql
ALTER TABLE users ALTER COLUMN column_name TYPE new_type;
```

### Переименовать таблицу

```sql
ALTER TABLE old_table_name RENAME TO new_table_name;
```

---

## 📊 Структура базы данных

```
┌─────────────────────────────┐
│        users                │
├─────────────────────────────┤
│ id (PK)                     │
│ email (UNIQUE)              │
│ username                    │
│ gmail_email                 │
│ gmail_connected             │
│ theme                       │
│ created_at                  │
│ updated_at                  │
└─────────────────────────────┘
        ↓ (1:N)
┌─────────────────────────────┐
│      user_tokens            │
├─────────────────────────────┤
│ id (PK)                     │
│ user_id (FK)                │
│ provider                    │
│ access_token                │
│ refresh_token               │
│ expires_at                  │
└─────────────────────────────┘

        ↓ (1:N)
┌─────────────────────────────┐
│        emails               │
├─────────────────────────────┤
│ id (PK)                     │
│ user_id (FK)                │
│ gmail_message_id            │
│ subject                     │
│ body                        │
│ from_email                  │
│ received_at                 │
└─────────────────────────────┘
        ↓ (1:N)
┌─────────────────────────────┐
│     email_responses         │
├─────────────────────────────┤
│ id (PK)                     │
│ user_id (FK)                │
│ email_id (FK)               │
│ generated_response          │
│ tone                        │
│ used                        │
└─────────────────────────────┘

┌─────────────────────────────┐
│   user_preferences          │
├─────────────────────────────┤
│ id (PK)                     │
│ user_id (FK UNIQUE)         │
│ auto_sync_gmail             │
│ default_tone                │
│ ai_model                    │
└─────────────────────────────┘

┌─────────────────────────────┐
│     usage_stats             │
├─────────────────────────────┤
│ id (PK)                     │
│ user_id (FK)                │
│ emails_analyzed             │
│ responses_generated         │
│ deepseek_calls              │
└─────────────────────────────┘
```

---

## 🔒 Безопасность RLS

Все таблицы защищены RLS политиками:
- ✅ Пользователи видят только свои данные
- ✅ Не могут видеть данные других пользователей
- ✅ Не могут изменять чужие данные
- ✅ Не могут удалять чужие данные

---

## 🚀 Готово!

База данных полностью инициализирована и готова к использованию.

Теперь можно:
1. Добавить Google OAuth интеграцию
2. Начать сохранять данные пользователей
3. Кэшировать письма из Gmail
4. Хранить сгенерированные ответы

---

**Версия**: 1.0.0  
**Дата**: 19 февраля 2026  
**Статус**: ✅ ГОТОВО
