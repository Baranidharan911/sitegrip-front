import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language resources
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

const resources = {
  en: {
    translation: en
  },
  es: {
    translation: es
  },
  fr: {
    translation: fr
  },
  de: {
    translation: de
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;

// Language options for the UI
export const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
];

// Helper function to change language
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  localStorage.setItem('i18nextLng', language);
};

// Helper function to get current language
export const getCurrentLanguage = () => {
  return i18n.language;
};

// Helper function to get language name
export const getLanguageName = (code: string) => {
  const lang = languageOptions.find(l => l.code === code);
  return lang ? lang.name : 'English';
};

// Helper function to get language flag
export const getLanguageFlag = (code: string) => {
  const lang = languageOptions.find(l => l.code === code);
  return lang ? lang.flag : '🇺🇸';
}; 