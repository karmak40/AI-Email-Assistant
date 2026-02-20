# Настройка Google OAuth в Supabase

## Шаг 1: Откройте Supabase Dashboard
1. Перейди на https://app.supabase.com
2. Выбери свой проект

## Шаг 2: Перейди в Authentication → Providers
1. **Authentication** → **Providers**
2. Найди **Google** и нажми на него

## Шаг 3: Добавь Google OAuth Credentials

### Откуда взять Client ID и Client Secret:

1. Перейди на https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. Найди свой **OAuth 2.0 Client** для Web
4. Нажми на нее чтобы отредактировать
5. Убедись что **Authorized redirect URIs** содержит:
   ```
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   ```
   где `YOUR_PROJECT` - это твой проект ID из Supabase

### Копируй и вставь в Supabase:

6. В Supabase Console добавь:
   - **Client ID** (из Google Console)
   - **Client Secret** (из Google Console)

7. Нажми **Save** и включи переключатель

## Шаг 4: Добавь Gmail Scopes

В Google Console для твоего OAuth приложения:

1. Перейди на **OAuth consent screen**
2. **Edit app** → **Scopes**
3. Добавь эти scopes:
   ```
   https://www.googleapis.com/auth/gmail.modify
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```

## ✅ Готово!

Теперь когда пользователь нажимает "Добавить Gmail":
1. Откроется Google выбор аккаунта
2. Supabase безопасно обменяет код на токены
3. Access token сохранится в `session.provider_token`

**Важно:** Все это происходит безопасно на Supabase сервере, твой `client_secret` никогда не попадает на фронт! 🔐
