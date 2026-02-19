# 🗄️ Пошаговая инструкция: Инициализация Supabase

**Выберите ваш случай:**

---

## 📍 Вариант 1: База данных ПОЛНОСТЬЮ ПУСТАЯ

Если вы только что создали проект в Supabase и там нет никаких таблиц:

### ✅ Ваши действия:

1. Откройте проект в Supabase
2. Перейдите в **SQL Editor**
3. Нажмите **New Query**
4. Откройте файл [SUPABASE_FULL_INIT.md](SUPABASE_FULL_INIT.md)
5. **Скопируйте весь SQL скрипт** (от `CREATE TABLE IF NOT EXISTS users` до конца)
6. **Вставьте** в SQL Editor
7. Нажмите **Run**

### 📊 Результат:

После выполнения у вас будут таблицы:
- `users` ✅
- `user_tokens` ✅
- `emails` ✅
- `email_responses` ✅
- `user_preferences` ✅
- `usage_stats` ✅

### ⏱️ Время: 1-2 минуты

---

## 📍 Вариант 2: У вас УЖЕ есть таблица `users`

Если у вас уже создана таблица `users` (например, по какому-то другому туториалу):

### ✅ Ваши действия:

1. Откройте проект в Supabase
2. Перейдите в **SQL Editor**
3. Нажмите **New Query**
4. Выполните эти команды по одной:

#### Шаг 1: Добавить колонки Gmail в users

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS gmail_email VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gmail_connected BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gmail_connected_at TIMESTAMP;
```

#### Шаг 2: Создать таблицу user_tokens

```sql
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

-- Индексы
CREATE INDEX IF NOT EXISTS user_tokens_user_id_idx ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS user_tokens_provider_idx ON user_tokens(provider);
```

#### Шаг 3: Включить RLS

```sql
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
```

#### Шаг 4: Создать RLS политики

```sql
-- SELECT
CREATE POLICY "Users can view their own tokens" ON user_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can insert their own tokens" ON user_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update their own tokens" ON user_tokens
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete their own tokens" ON user_tokens
  FOR DELETE USING (auth.uid() = user_id);
```

### ⏱️ Время: 2-3 минуты

---

## 📍 Вариант 3: Полная переинициализация (очистка + создание)

Если вы хотите **полностью очистить** базу и начать с нуля:

### ⚠️ ОСТОРОЖНО! Это удалит ВСЕ данные!

```sql
-- 1. Удалить все таблицы в правильном порядке
DROP TABLE IF EXISTS usage_stats CASCADE;
DROP TABLE IF EXISTS email_responses CASCADE;
DROP TABLE IF EXISTS emails CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Удалить функции
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

После удаления используйте скрипт из **Варианта 1** для создания всех таблиц с нуля.

### ⏱️ Время: 1 минута (+ время из Варианта 1)

---

## ✅ Проверка: База готова?

После выполнения SQL скриптов проверьте, всё ли работает:

### Тест 1: Таблицы созданы

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Результат должен содержать:**
- public.users
- public.user_tokens
- (+ другие таблицы если вы выбрали Вариант 1)

### Тест 2: RLS включено

```sql
SELECT * FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

**Результат должен содержать:**
- user_tokens (и другие)

### Тест 3: Индексы созданы

```sql
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;
```

**Результат должен содержать индексы:**
- user_tokens_user_id_idx
- user_tokens_provider_idx

---

## 🔧 Если вы допустили ошибку

### Удалить одну таблицу

```sql
DROP TABLE IF EXISTS user_tokens CASCADE;
```

### Удалить RLS политику

```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Удалить индекс

```sql
DROP INDEX IF EXISTS index_name;
```

---

## 🎯 Что дальше?

Когда база готова:

1. ✅ Переходите к [GMAIL_SUPABASE_SETUP.md](GMAIL_SUPABASE_SETUP.md) для настройки Google OAuth
2. ✅ Добавьте Google OAuth Credentials
3. ✅ Конфигурируйте .env файл
4. ✅ Тестируйте приложение

---

## 📞 Часто встречающиеся ошибки

### ❌ "Relation already exists"

**Проблема**: Таблица уже существует

**Решение**: Используйте `IF NOT EXISTS` в команде создания таблицы

```sql
CREATE TABLE IF NOT EXISTS user_tokens (...);
```

### ❌ "Foreground key violation"

**Проблема**: `user_id` в `user_tokens` не существует в `users`

**Решение**: Убедитесь, что таблица `users` существует и имеет данные

```sql
SELECT COUNT(*) FROM users;
```

### ❌ "RLS policy violation"

**Проблема**: Пользователь не может читать/писать данные

**Решение**: Проверьте RLS политики и убедитесь, что `auth.uid()` установлен

```sql
SELECT * FROM pg_policies;
```

### ❌ "Invalid redirect URI"

**Проблема**: Google OAuth не может перенаправить после авторизации

**Решение**: Проверьте Google Cloud Console и добавьте правильный redirect URI

```
com.aiemailassistant:/oauth2redirect
```

---

## 📚 Дополнительные ресурсы

- [SUPABASE_FULL_INIT.md](SUPABASE_FULL_INIT.md) - Полный SQL скрипт
- [GMAIL_SUPABASE_SETUP.md](GMAIL_SUPABASE_SETUP.md) - Настройка Gmail OAuth
- [GMAIL_INTEGRATION_GUIDE.md](GMAIL_INTEGRATION_GUIDE.md) - Руководство интеграции

---

**Версия**: 1.0.0  
**Дата**: 19 февраля 2026  
**Статус**: ✅ ГОТОВО
