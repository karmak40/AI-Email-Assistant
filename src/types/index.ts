// Theme types
export type Theme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  white: string;
  dark: string;
  accent: string;
}

export interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

// Navigation types
export type RootStackParamList = {
  BottomTabs: undefined;
  Auth: undefined;
  GmailAuth: undefined;
  MessageDetail: {
    message: any;
  };
};

export type BottomTabParamList = {
  HomeTab: {
    successMessage?: string;
    gmailEmail?: string;
  } | undefined;
  InboxTab: undefined;
  ComposeTab: undefined;
  SettingsTab: undefined;
};

// API Service types
export interface EmailContent {
  subject: string;
  body: string;
  tone?: 'formal' | 'casual' | 'professional';
}

export interface AIResponse {
  corrected: string;
  suggestions: string[];
  tone?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  createdAt: string;
}
