import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "Plans & pricing": "Plans & pricing",
      "Sign in": "Sign in",
      "Sign up": "Sign up",
      "Product": "Product",
      "Our data": "Our data",
      "Resources": "Resources",
      "Pricing": "Pricing",
      "Enterprise": "Enterprise",
      "Evolve": "Evolve",
      "Pay annually, save up to 17%": "Pay annually, save up to 17%",
      "Lite": "Lite",
      "Standard": "Standard",
      "Advanced": "Advanced",
      "Get started": "Get started",
      // Add more keys as needed
    }
  },
  fr: {
    translation: {
      "Plans & pricing": "Plans et tarifs",
      "Sign in": "Se connecter",
      "Sign up": "S'inscrire",
      "Product": "Produit",
      "Our data": "Nos données",
      "Resources": "Ressources",
      "Pricing": "Tarification",
      "Enterprise": "Entreprise",
      "Evolve": "Évoluer",
      "Pay annually, save up to 17%": "Payez annuellement, économisez jusqu'à 17%",
      "Lite": "Essentiel",
      "Standard": "Standard",
      "Advanced": "Avancé",
      "Get started": "Commencer",
      // Add more keys as needed
    }
  },
  de: {
    translation: {
      "Plans & pricing": "Pläne & Preise",
      "Sign in": "Anmelden",
      "Sign up": "Registrieren",
      "Product": "Produkt",
      "Our data": "Unsere Daten",
      "Resources": "Ressourcen",
      "Pricing": "Preise",
      "Enterprise": "Unternehmen",
      "Evolve": "Entwickeln",
      "Pay annually, save up to 17%": "Jährlich zahlen, bis zu 17% sparen",
      "Lite": "Lite",
      "Standard": "Standard",
      "Advanced": "Erweitert",
      "Get started": "Loslegen",
      // Add more keys as needed
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n; 