import 'i18next';
// Импортируем только один файл как эталон для структуры ключей
import translationRU from '../../public/locales/ru/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      // Мы говорим TS: "используй структуру из RU файла для всех переводов"
      // Это даст тебе автодополнение ключей в t('...')
      translation: typeof translationRU;
    };
  }
}