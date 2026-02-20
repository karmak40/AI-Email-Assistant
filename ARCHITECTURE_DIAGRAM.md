## 🏗️ Архитектура обновленного приложения

```
┌─────────────────────────────────────────────────────────────┐
│                      App.tsx                                │
│              (ThemeProvider + RootNavigator)                │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │   RootNavigator         │
        │ (Условная навигация)    │
        └────────────┬────────────┘
                     │
        ┌────────────┴─────────────────────┐
        │                                  │
   ┌────▼────┐                    ┌───────▼──────┐
   │ AuthScreen  (не авторизован) │ BottomTabs   │
   │            OR GmailAuthScreen│ (авторизован)│
   └──────────┘                    └───────┬──────┘
                                            │
              ┌─────────────────────────────┼─────────────────────────────┐
              │                             │                             │
         ┌────▼─────┐              ┌───────▼──────┐          ┌───────────▼──┐
         │ HomeTab   │              │ InboxTab     │          │ ComposeTab   │
         │(Главная)  │              │(Входящие)    │          │(Написать)    │
         ├───────────┤              ├──────────────┤          ├──────────────┤
         │ HomeScreen│              │ InboxScreen  │          │ComposeScreen │
         │           │              │  (заглушка)  │          │  (заглушка)  │
         │-Profile   │              │- Список      │          │- Форма       │
         │-Quick     │              │  писем       │          │- AI Помощник │
         │ Actions   │              │- Empty state │          │- Отправка    │
         │-Settings  │              └──────────────┘          └──────────────┘
         │ Button    │
         └────┬──────┘
              │
         ┌────▼──────────┐
         │ SettingsTab    │
         │ (Настройки)    │
         ├────────────────┤
         │SettingsScreen  │
         │ - Theme        │
         │ - Notifications│
         │ - Profile      │
         │ - Logout (RED) │
         └────────────────┘
```

---

## 🔀 Поток аутентификации

```
┌──────────────────────┐
│   Запуск приложения  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  RootNavigator                       │
│  Проверяет: supabase.auth.getSession()
└──────────┬───────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌──────────────────┐
│ session │  │   session        │
│   null  │  │   существует     │
└────┬────┘  └────┬─────────────┘
     │            │
     ▼            ▼
┌────────────┐  ┌────────────────┐
│ AuthScreen │  │ BottomTabs     │
│ (Login/    │  │ + HomeScreen   │
│  Register) │  │ (Профиль)      │
└────┬───────┘  └────────────────┘
     │
     │ (авторизация)
     │
     ▼
┌────────────────────────────┐
│ Перенаправить на BottomTabs│
│ + GmailAuthScreen (опцион.)│
└────────────────────────────┘
```

---

## 📊 Компоненты и их ответственность

### Services (Бизнес логика)

```
googleProfileService.ts
├─ getUserProfile(token)      → Google профиль
├─ getProfilePhoto(token)     → URL фото
└─ getUserEmail(token)        → Email адрес

gmailService.ts (существующий)
├─ authenticate()             → OAuth
├─ saveTokens()              → Сохранение токенов
├─ getProfile()              → Gmail профиль
└─ getMessages()             → Список писем (TODO)

supabase.ts (существующий)
├─ auth.getSession()         → Текущая сессия
├─ auth.onAuthStateChange()  → Слушатель изменений
└─ auth.signOut()            → Выход
```

### Screens (UI слой)

```
HomeScreen.tsx
├─ Неавторизованный рендер
│  ├─ HeroSection
│  ├─ StepItem (инструкции)
│  └─ FeatureItem (возможности)
└─ Авторизованный рендер (Gmail)
   ├─ Profile Header
   │  ├─ Avatar
   │  ├─ Name
   │  └─ Email
   ├─ Main Actions
   │  ├─ Inbox Button
   │  └─ Compose Button
   └─ Quick Actions
      ├─ Reply Latest
      ├─ Check Urgent
      └─ Daily Summary

InboxScreen.tsx
├─ Header
├─ Loading State
├─ Empty State
└─ Message List (TODO)

ComposeScreen.tsx
├─ Header (Cancel + Send)
├─ Form
│  ├─ To Field
│  ├─ Subject Field
│  └─ Body Field
└─ AI Helper Buttons
   ├─ Fix
   ├─ Change Tone
   └─ Expand

SettingsScreen.tsx
├─ Theme Toggle
├─ Notifications
├─ Account Info
├─ About
└─ Logout Button (RED)
```

### Navigation (Навигация)

```
RootNavigator.tsx
├─ Проверяет статус аутентификации
├─ Подписывается на изменения
└─ Рендерит:
   ├─ AuthScreen (не авторизован)
   ├─ BottomTabs (авторизован)
   └─ GmailAuth (модальный экран)

BottomTabNavigator.tsx
├─ Создает 4 вкладки
├─ Иконки (эмодзи)
├─ Динамические цвета
└─ Экраны:
   ├─ HomeTab
   ├─ InboxTab
   ├─ ComposeTab
   └─ SettingsTab
```

---

## 🔄 Сценарии использования

### Сценарий 1: Новый пользователь

```
1. Открывает приложение
   └─► AuthScreen (не авторизован)

2. Регистрируется/Входит
   └─► BottomTabs (авторизован)

3. На HomeScreen видит приглашение
   └─► "Подключить Gmail"

4. Нажимает "Подключить Gmail"
   └─► GmailAuthScreen

5. Авторизуется в Google
   └─► Возвращается на HomeScreen

6. HomeScreen автоматически загружает профиль
   └─► Показывает аватар, email, действия
```

### Сценарий 2: Существующий пользователь с Gmail

```
1. Открывает приложение
   └─► RootNavigator проверяет сессию

2. Сессия существует
   └─► BottomTabs

3. HomeScreen загружает профиль
   └─► Показывает аватар и действия

4. Может перейти на:
   - Входящие (📧)
   - Написать (✍️)
   - Настройки (⚙️)
```

### Сценарий 3: Выход из аккаунта

```
1. На SettingsScreen нажимает "Выход"
   └─► Подтверждение диалога

2. Подтверждает выход
   └─► supabase.auth.signOut()

3. Статус аутентификации изменяется
   └─► RootNavigator переключается на Auth

4. Показывается AuthScreen
   └─► Можно авторизоваться снова
```

---

## 💾 Хранение данных

```
Supabase
├─ auth (Supabase Auth)
│  └─ user session
│
└─ user_tokens table
   ├─ user_id (primary key)
   ├─ access_token (Google)
   ├─ refresh_token (Google, опцион)
   ├─ provider ("gmail")
   └─ updated_at

Local Storage (React State)
├─ HomeScreen
│  ├─ isAuthenticated
│  ├─ userProfile (Google)
│  └─ loading
└─ Theme
   ├─ theme (light/dark)
   └─ colors
```

---

## 🎨 UI Компоненты

```
Стандартные компоненты React Native:
├─ View, ScrollView, SafeAreaView
├─ Text, TextInput
├─ TouchableOpacity, Image
├─ ActivityIndicator
└─ StyleSheet

Компоненты приложения (существующие):
├─ Button.tsx
├─ Card.tsx
├─ HeroSection.tsx
├─ FeatureItem.tsx
└─ StepItem.tsx

Контекст (существующий):
└─ ThemeContext.tsx
   ├─ useTheme() hook
   └─ colors object
```

---

## 🔌 Интеграции

```
Внешние сервисы:

1. Supabase
   ├─ Аутентификация (Email/Password)
   ├─ Хранение токенов
   └─ RLS для безопасности

2. Google OAuth
   ├─ Авторизация (через WebBrowser)
   ├─ Gmail API доступ
   └─ Получение профиля

3. DeepSeek (TODO)
   ├─ Исправление текста
   ├─ Изменение тона
   └─ Расширение текста

4. Gmail API (TODO)
   ├─ Загрузка писем
   ├─ Отправка писем
   └─ Поиск писем
```

---

## ✅ Проверка компонентов

| Компонент | Статус | Проверка |
|-----------|--------|----------|
| RootNavigator | ✅ | Условная навигация работает |
| HomeScreen | ✅ | Условный рендеринг работает |
| BottomTabs | ✅ | Все 4 вкладки доступны |
| InboxScreen | ✅ | Заглушка готова |
| ComposeScreen | ✅ | Форма готова |
| SettingsScreen | ✅ | Выход работает |
| Google Profile Service | ✅ | API работает |
| Темизация | ✅ | Все экраны поддерживают |
| Типы | ✅ | Нет ошибок TypeScript |

---

## 📝 Примечания архитектуры

1. **Разделение ответственности**
   - Services: бизнес логика
   - Screens: UI компоненты
   - Navigation: управление потоком
   - Context: глобальное состояние

2. **Условный рендеринг**
   - На уровне RootNavigator (Auth vs BottomTabs)
   - На уровне HomeScreen (Профиль vs Приглашение)
   - На уровне Экранов (Loading vs Content vs Empty)

3. **Асинхронные операции**
   - useEffect для загрузки профиля
   - supabase.auth для сессии
   - googleProfileService для данных

4. **Типизация**
   - Все компоненты типизированы
   - Navigation параметры проверены
   - API ответы типизированы

---

**Архитектура готова к расширению!** 🚀
