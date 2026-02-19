/*
ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ GMAILSERVICE

Этот файл содержит примеры кода для использования GmailService.
Скопируйте и адаптируйте примеры для вашего проекта.

ПРИМЕР 1: Базовая авторизация
─────────────────────────────────────

import { gmailService } from '../services/gmailService';

async function authenticateWithGmail() {
  try {
    const { accessToken, refreshToken } = await gmailService.authenticate();
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
  } catch (error) {
    console.error('Auth error:', error);
  }
}

ПРИМЕР 2: Сохранение токенов в Supabase
─────────────────────────────────────

import { gmailService } from '../services/gmailService';
import { supabase } from '../services/supabase';

async function saveGmailTokens() {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    const { accessToken, refreshToken } = await gmailService.authenticate();
    await gmailService.saveTokens(userId!, accessToken, refreshToken);

    console.log('Токены сохранены!');
  } catch (error) {
    console.error('Save tokens error:', error);
  }
}

ПРИМЕР 3: Получение профиля пользователя
─────────────────────────────────────

import { gmailService } from '../services/gmailService';
import { supabase } from '../services/supabase';

async function getGmailProfile() {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    const accessToken = await gmailService.getSavedToken(userId!);
    const profile = await gmailService.getProfile(accessToken!);

    console.log('Email:', profile.emailAddress);
    console.log('Gmail ID:', profile.id);
  } catch (error) {
    console.error('Get profile error:', error);
  }
}

ПРИМЕР 4: Получение списка писем
─────────────────────────────────────

import { gmailService } from '../services/gmailService';
import { supabase } from '../services/supabase';

async function getGmailMessages() {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    const accessToken = await gmailService.getSavedToken(userId!);
    const messages = await gmailService.listMessages(accessToken!, 10);

    console.log(`Получено ${messages.length} писем:`);
    messages.forEach((msg: any, index: number) => {
      console.log(`${index + 1}. ${msg.snippet.substring(0, 50)}...`);
    });
  } catch (error) {
    console.error('List messages error:', error);
  }
}

ПРИМЕР 5: Проверка подключения Gmail
─────────────────────────────────────

import { gmailService } from '../services/gmailService';
import { supabase } from '../services/supabase';

async function checkGmailConnection() {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    const isConnected = await gmailService.isGmailConnected(userId!);

    if (isConnected) {
      console.log('✅ Gmail подключен');
    } else {
      console.log('❌ Gmail не подключен');
    }
  } catch (error) {
    console.error('Check connection error:', error);
  }
}

ПРИМЕР 6: Отключение Gmail
─────────────────────────────────────

import { gmailService } from '../services/gmailService';
import { supabase } from '../services/supabase';

async function disconnectGmailAccount() {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    await gmailService.disconnectGmail(userId!);

    await supabase
      .from('users')
      .update({
        gmail_connected: false,
        gmail_email: null,
      })
      .eq('id', userId);

    console.log('Gmail отключен');
  } catch (error) {
    console.error('Disconnect error:', error);
  }
}

ПРИМЕР 7: Использование в компоненте React
─────────────────────────────────────

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { gmailService } from '../services/gmailService';
import { supabase } from '../services/supabase';

const GmailConnectButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { accessToken, refreshToken } = await gmailService.authenticate();
      
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      await gmailService.saveTokens(userId!, accessToken, refreshToken);

      const profile = await gmailService.getProfile(accessToken);
      
      await supabase
        .from('users')
        .update({
          gmail_email: profile.emailAddress,
          gmail_connected: true,
        })
        .eq('id', userId);

      Alert.alert('Успех!', 'Gmail подключен');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось подключить Gmail');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleConnect} disabled={isLoading}>
      <Text>{isLoading ? 'Загрузка...' : 'Подключить Gmail'}</Text>
    </TouchableOpacity>
  );
};

МЕТОДЫ GMAILSERVICE
─────────────────────────────────────

authenticate() 
  - Запускает OAuth поток
  - Возвращает: { accessToken, refreshToken }

saveTokens(userId, accessToken, refreshToken)
  - Сохраняет токены в Supabase
  - Используется после authenticate()

getProfile(accessToken)
  - Получает информацию о профиле Gmail
  - Возвращает: { id, emailAddress, historyId }

listMessages(accessToken, maxResults)
  - Получает список последних писем
  - Возвращает: массив сообщений

getSavedToken(userId)
  - Получает сохраненный токен доступа
  - Используется для последующих вызовов API

isGmailConnected(userId)
  - Проверяет, подключен ли Gmail
  - Возвращает: boolean

disconnectGmail(userId)
  - Удаляет токены и отключает Gmail
  - Используется при отключении аккаунта

*/

export { };

