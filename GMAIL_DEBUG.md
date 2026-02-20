# Gmail OAuth Debug Checklist

## 1. Google Cloud Console Verification (CRITICAL)

Перейдите в https://console.cloud.google.com и выполните ВСЕ проверки:

### 1.1 Gmail API Enabled
- [ ] Перейдите: **APIs & Services → Enabled APIs & services**
- [ ] Найдите **Gmail API**
- [ ] Статус: **Enabled** (зелёная галочка)
- Если не видите - нажмите "Enable APIs and services" и найдите Gmail API

### 1.2 OAuth Consent Screen
- [ ] Перейдите: **APIs & Services → OAuth consent screen**
- [ ] Статус скоупов - проверьте **Scopes section**:
  - [ ] `https://www.googleapis.com/auth/gmail.readonly` - **ДОЛЖЕН БЫТЬ**
  - [ ] `openid`
  - [ ] `email`
  - [ ] `profile`

Если скоупов нет:
- Нажмите "ADD SCOPES"
- Найдите и добавьте `https://www.googleapis.com/auth/gmail.readonly`
- Нажмите "SAVE"

### 1.3 OAuth 2.0 Client IDs
- [ ] Перейдите: **APIs & Services → Credentials**
- [ ] Найдите Web application OAuth client ID
- [ ] Нажмите на него и проверьте **Authorized redirect URIs**:
  - [ ] Должен содержать вашу Supabase redirect URI
  - Найдите в Supabase: **Authentication → Providers → Google**
  - Скопируйте оттуда "Callback URL (for OAuth)"
  - Проверьте что эта же URI в Google Cloud Console

### 1.4 Скопируйте Client ID и Secret
- [ ] Client ID: ________________
- [ ] Client Secret: ________________
- [ ] Это должно совпадать с тем, что в Supabase!

## 2. Supabase Verification

- [ ] Перейдите: https://app.supabase.com
- [ ] Выберите ваш проект
- [ ] **Authentication → Providers → Google**
- [ ] Paste:
  - [ ] Client ID (из Google Cloud)
  - [ ] Client Secret (из Google Cloud)
- [ ] Нажмите "Save"
- [ ] Скопируйте "Callback URL (for OAuth)" - это должно совпадать с Authorized redirect URIs в Google Cloud!

## 3. Console Logs Check

После переподключения Gmail откройте DevTools (F12):
- [ ] Откройте **Console** tab
- [ ] Найдите логи с `🔓 Decoded token payload`
- [ ] **Важно:** скопируйте ПОЛНЫЙ лог с payload

Ищите что-то вроде:
```
[gmailService] 🔓 Decoded token payload: {
  scope: "email profile openid https://www.googleapis.com/auth/gmail.readonly",
  aud: "...",
  exp: Date
}
```

**Если `gmail.readonly` НЕ в `scope` - проблема в Google Cloud Console scopes!**

## 4. Full Fix Procedure

Если всё ещё не работает:

1. В Google Cloud Console удалите старый Client ID (стрелка вниз → Delete)
2. Создайте новый: **Credentials → + Create Credentials → OAuth 2.0 Client ID**
3. Type: **Web application**
4. Name: "Gmail Assistant Web"
5. Authorized redirect URIs: добавьте вашу Supabase Callback URL
6. Click "Create"
7. Скопируйте NEW Client ID и Secret
8. В Supabase вставьте NEW Client ID и Secret
9. **Полностью очистите браузер:**
   - DevTools → Application → LocalStorage → Delete All
   - DevTools → Application → Cookies → Delete All
   - Закройте браузер полностью
10. `npm start`
11. Заново логин + подключение Gmail
12. Проверьте 🔓 декодированный токен

## 5. What to Report

Когда вернётесь, покажите:
1. Лог с 🔓 Decoded token payload - **скопируйте ПОЛНОСТЬЮ**
2. Скрин из Google Cloud Console с включённым Gmail API
3. Скрин из Google Cloud Console с OAuth scopes
4. Скрин из Supabase Google Provider с Client ID/Secret
