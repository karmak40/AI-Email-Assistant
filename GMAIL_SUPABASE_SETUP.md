# ⚙️ Настройка Supabase для Gmail интеграции

## ⚠️ Ваша база данных полностью пустая?

Если база данных **полностью пустая** (нет таблицы `users`), используйте:

### 🔗 [SUPABASE_FULL_INIT.md](SUPABASE_FULL_INIT.md)

Это файл с **полным SQL скриптом инициализации** для пустой БД. Он содержит:
- ✅ Таблица `users` (основная)
- ✅ Таблица `user_tokens` (для Gmail OAuth)
- ✅ Таблица `emails` (кэш писем)
- ✅ Таблица `email_responses` (сгенерированные ответы)
- ✅ Таблица `user_preferences` (настройки)
- ✅ Таблица `usage_stats` (статистика)
- ✅ Все индексы и триггеры
- ✅ Все RLS политики

**Просто скопируйте весь скрипт из SUPABASE_FULL_INIT.md и выполните его в Supabase SQL Editor!**

---

## 📋 Если у вас уже есть таблица `users`

Вам нужно создать две таблицы (или обновить существующую):

### 1. Таблица `users` (обновление)

Добавьте эти колонки к существующей таблице `users`:

```sql
ALTER TABLE users ADD COLUMN gmail_email VARCHAR;
ALTER TABLE users ADD COLUMN gmail_connected BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN gmail_connected_at TIMESTAMP;
```

### 2. Таблица `user_tokens` (новая)

Создайте новую таблицу для хранения OAuth токенов:

```sql
CREATE TABLE user_tokens (
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

-- Создайте индекс для быстрого поиска
CREATE INDEX user_tokens_user_id_idx ON user_tokens(user_id);
CREATE INDEX user_tokens_provider_idx ON user_tokens(provider);
```

## 🔐 RLS политики (Row Level Security)

Добавьте RLS политики для таблицы `user_tokens`:

```sql
-- Включите RLS
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- Пользователь может видеть только свои токены
CREATE POLICY "Users can view their own tokens" ON user_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователь может создавать только свои токены
CREATE POLICY "Users can insert their own tokens" ON user_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователь может обновлять только свои токены
CREATE POLICY "Users can update their own tokens" ON user_tokens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Пользователь может удалять только свои токены
CREATE POLICY "Users can delete their own tokens" ON user_tokens
  FOR DELETE
  USING (auth.uid() = user_id);
```

## 🔑 Google OAuth Credentials

**⭐ ПОЛНОЕ ПОШАГОВОЕ РУКОВОДСТВО:** [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)

Краткая версия:

### Шаг 1: Создать проект в Google Cloud Console

1. Откройте https://console.cloud.google.com
2. Создайте новый проект или выберите существующий
3. Включите **Gmail API**:
   - Перейдите в "APIs & Services" → "Library"
   - Найдите "Gmail API"
   - Нажмите "Enable"

### Шаг 2: Создать OAuth 2.0 Credentials

1. Перейдите в "APIs & Services" → "Credentials"
2. Нажмите "Create Credentials" → "OAuth 2.0 Client ID"
3. Выберите "Web application"
4. Добавьте **Authorized redirect URIs**:
   - `com.aiemailassistant:/oauth2redirect` (для мобильных)
   - `http://localhost:8081` (для локального тестирования)
5. Скопируйте **Client ID**

**Нужны подробные инструкции с картинками?** → [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)

### Шаг 3: Добавить Client ID в .env

```env
EXPO_PUBLIC_GMAIL_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

## 📱 Тестирование OAuth локально

### Для Expo Go

1. Убедитесь, что у вас есть Expo CLI:
```bash
npm install -g expo-cli
```

2. Запустите приложение:
```bash
npm start
```

3. Откройте в Expo Go и нажмите "Подключить Gmail"

4. Должно открыться WebView с Google авторизацией

### Для Web

1. Запустите:
```bash
npm start
# Нажмите 'w' для Web
```

2. Откройте http://localhost:8081
3. Нажмите "Подключить Gmail"

## 🐛 Отладка

### Если возникают ошибки:

1. **"DEEPLINK_NOT_CONFIGURED"** → Убедитесь, что Client ID добавлен в `.env`
2. **"Invalid redirect URI"** → Проверьте Authorized redirect URIs в Google Cloud Console
3. **"CORS error"** → Это нормально в локальной разработке, Google безопасно блокирует

## 🔒 Безопасность

- ✅ Токены хранятся в Supabase (защищены RLS)
- ✅ Access token копируется в Secure Store на устройстве
- ✅ Refresh token хранится только в Supabase
- ✅ Никогда не передавайте токены клиенту без шифрования
- ✅ Используйте HTTPS в production

## 📝 Скрипт для быстрой настройки Supabase

Если вы хотите автоматизировать создание таблиц:

```sql
-- Выполните этот SQL в Supabase SQL Editor

-- 1. Обновить таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS gmail_email VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gmail_connected BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gmail_connected_at TIMESTAMP;

-- 2. Создать таблицу user_tokens
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

-- 3. Создать индексы
CREATE INDEX IF NOT EXISTS user_tokens_user_id_idx ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS user_tokens_provider_idx ON user_tokens(provider);

-- 4. Включить RLS
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- 5. Создать RLS политики
CREATE POLICY "Users can view their own tokens" ON user_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON user_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON user_tokens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" ON user_tokens
  FOR DELETE
  USING (auth.uid() = user_id);
```

## ✅ Проверка настройки

Все работает, если:
1. ✅ Таблица `user_tokens` создана в Supabase
2. ✅ RLS политики активированы
3. ✅ Google Client ID в `.env`
4. ✅ Вы можете нажать "Подключить Gmail" и открыть Google авторизацию
5. ✅ После авторизации токены сохраняются в Supabase

---

**Дата**: 19 февраля 2026  
**Версия**: 1.0.0
