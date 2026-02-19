// Примеры использования DeepseekService

import { deepseekService } from '../services/deepseekService';

// ============================================
// Пример 1: Исправление ошибок
// ============================================

async function examplePolishText() {
  try {
    const originalText = `Привет, я хотел бы обсудить проект.
    Это очень интересное предложение и я думаю что мы можем работать вместе.
    Можешь ли ты позвонить мне завтра?`;

    const polishedText = await deepseekService.polishText(originalText);
    
    console.log('Оригинал:', originalText);
    console.log('Исправлено:', polishedText);
  } catch (error) {
    console.error('Ошибка при исправлении текста:', error);
  }
}

// Ожидаемый результат:
// Оригинал: "Привет, я хотел бы обсудить проект..."
// Исправлено: "Здравствуйте! Я бы хотел обсудить проект..."


// ============================================
// Пример 2: Смена на официальный тон
// ============================================

async function exampleProfessionalTone() {
  try {
    const casualText = `Привет! Как дела? Я хотел бы поговорить о новом проекте. 
    Думаю, что это классная идея и мы можем сделать что-то крутое вместе! 
    Когда мы можем встретиться?`;

    const professionalText = await deepseekService.changeTone(
      casualText, 
      'professional'
    );
    
    console.log('Casual:', casualText);
    console.log('Professional:', professionalText);
  } catch (error) {
    console.error('Ошибка при смене тона:', error);
  }
}

// Ожидаемый результат:
// Casual: "Привет! Как дела?..."
// Professional: "Уважаемый коллега, прошу рассмотреть предложение относительно..."


// ============================================
// Пример 3: Смена на дружелюбный тон
// ============================================

async function exampleFriendlyTone() {
  try {
    const formalText = `Уважаемый адресат! Направляю вам предложение о сотрудничестве. 
    Полагаю, что совместная работа может быть взаимовыгодной. 
    Прошу подтвердить возможность проведения встречи.`;

    const friendlyText = await deepseekService.changeTone(
      formalText, 
      'friendly'
    );
    
    console.log('Formal:', formalText);
    console.log('Friendly:', friendlyText);
  } catch (error) {
    console.error('Ошибка при смене тона:', error);
  }
}

// Ожидаемый результат:
// Formal: "Уважаемый адресат!..."
// Friendly: "Привет! 😊 Хотел поделиться крутой идеей..."


// ============================================
// Пример 4: Использование в компоненте React
// ============================================

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const ExampleComponent = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePolish = async () => {
    setIsLoading(true);
    try {
      const result = await deepseekService.polishText(input);
      setOutput(result);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeFriendly = async () => {
    setIsLoading(true);
    try {
      const result = await deepseekService.changeTone(input, 'friendly');
      setOutput(result);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Введите текст..."
        value={input}
        onChangeText={setInput}
        multiline
        numberOfLines={5}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
        }}
      />

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <TouchableOpacity
          onPress={handlePolish}
          disabled={isLoading}
          style={{
            flex: 1,
            backgroundColor: '#007AFF',
            padding: 10,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Исправить
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMakeFriendly}
          disabled={isLoading}
          style={{
            flex: 1,
            backgroundColor: '#34C759',
            padding: 10,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Дружелюбно
          </Text>
        </TouchableOpacity>
      </View>

      {output && (
        <View
          style={{
            backgroundColor: '#f0f0f0',
            padding: 10,
            borderRadius: 8,
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>
            Результат:
          </Text>
          <Text>{output}</Text>
        </View>
      )}
    </View>
  );
};

export default ExampleComponent;


// ============================================
// Пример 5: Обработка ошибок
// ============================================

async function exampleErrorHandling() {
  try {
    const text = '';

    if (!text.trim()) {
      console.warn('Текст не может быть пустым');
      return;
    }

    const result = await deepseekService.polishText(text);
    console.log('Успех:', result);
  } catch (error) {
    // Ошибка уже обработана в deepseekService
    // и пользователю показан Alert
    // Здесь можно добавить дополнительную логику
    console.error('Дополнительная обработка ошибки:', error);
  }
}


// ============================================
// Пример 6: Цепочка обработок
// ============================================

async function exampleChainProcessing() {
  try {
    const originalText = `Привет, это было бы классно если мы могли бы 
    обсудить проект вместе в ближайшее время!`;

    // Сначала исправляем ошибки
    console.log('1. Исправляем ошибки...');
    const polished = await deepseekService.polishText(originalText);
    console.log('Результат 1:', polished);

    // Затем переводим в официальный тон
    console.log('2. Переводим в официальный тон...');
    const professional = await deepseekService.changeTone(polished, 'professional');
    console.log('Результат 2:', professional);

    // Теперь переводим обратно в дружелюбный
    console.log('3. Переводим в дружелюбный тон...');
    const friendly = await deepseekService.changeTone(professional, 'friendly');
    console.log('Финальный результат:', friendly);
  } catch (error) {
    console.error('Ошибка в цепочке обработок:', error);
  }
}


// ============================================
// Пример 7: Конфигурация с собственным API ключом
// ============================================

// Если вы хотите использовать другой API ключ в runtime:

async function exampleWithCustomKey() {
  // Нужно модифицировать deepseekService или создать новый сервис
  // Текущая реализация использует переменную окружения:
  // process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY

  // Для переопределения в runtime, создайте новый файл:
  // src/services/customDeepseekService.ts

  const customApiKey = 'sk_...your_custom_key...';

  // Затем вы можете создать свой сервис с переданным ключом
  // или модифицировать существующий
}

// ============================================
// Экспорт примеров
// ============================================

export {
  examplePolishText,
  exampleProfessionalTone,
  exampleFriendlyTone,
  exampleErrorHandling,
  exampleChainProcessing,
  ExampleComponent,
};
