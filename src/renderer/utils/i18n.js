// src/renderer/utils/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import translationSV from '../assets/locales/sv.json';
import translationEN from '../assets/locales/en.json';

// Available languages
export const LANGUAGES = {
  SV: 'sv',
  EN: 'en'
};

// Initialize i18n
export const initI18n = async () => {
  const storedLang = await window.electron.getSettings('language');
  const defaultLanguage = (storedLang.success && storedLang.value) || LANGUAGES.SV;

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        [LANGUAGES.SV]: {
          translation: translationSV
        },
        [LANGUAGES.EN]: {
          translation: translationEN
        }
      },
      lng: defaultLanguage,
      fallbackLng: LANGUAGES.SV,
      interpolation: {
        escapeValue: false // React already escapes values
      }
    });

  return i18n;
};

// Change language
export const changeLanguage = async (language) => {
  if (![LANGUAGES.SV, LANGUAGES.EN].includes(language)) {
    console.error('Invalid language:', language);
    return false;
  }

  await i18n.changeLanguage(language);
  await window.electron.storeSettings({ language });
  return true;
};

export default i18n;