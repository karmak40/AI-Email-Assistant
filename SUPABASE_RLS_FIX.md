# Supabase RLS Policy Fix

## Проблема
При добавлении Gmail токенов появляются ошибки:
- `42501: new row violates row-level security policy for table "users"`
- `23503: insert or update on table "user_tokens" violates foreign key constraint`

## Решение

Выполни эти SQL команды в Supabase SQL Editor:

```sql
-- 1. Отключи RLS на таблице users (если включен)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Или если хочешь оставить RLS, создай политику:
-- Разреши пользователю вставлять свои записи в users таблицу
CREATE POLICY "Users can insert their own user record" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Отключи RLS на таблице user_tokens
ALTER TABLE user_tokens DISABLE ROW LEVEL SECURITY;

-- 4. Или если хочешь оставить RLS:
-- Разреши пользователю вставлять свои токены
CREATE POLICY "Users can manage their own tokens" ON user_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Проверь что пользователь существует
SELECT * FROM users WHERE id = '64bfa782-7867-45f3-a382-c1d046db803d';

-- 6. Если нету - создай вручную
INSERT INTO users (id, email, created_at) 
VALUES ('64bfa782-7867-45f3-a382-c1d046db803d', 'test@example.com', NOW())
ON CONFLICT DO NOTHING;
```

## Что делать:

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Перейди в **SQL Editor**
3. Скопируй и выполни SQL выше
4. Попробуй добавить Gmail еще раз

**Рекомендуется использовать вариант с RLS политикой (пункты 2 и 4) для безопасности!**
