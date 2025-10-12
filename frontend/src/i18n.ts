// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "Seller Center": "Seller Center",
      "Download App": "Download App",
      "Help Center": "Help Center",
      "English": "English",
      "Somali": "Somali"
    }
  },
  so: {
    translation: {
      "Seller Center": "Xarunta Iibiyaha",
      "Download App": "Soo Dejiso App-ka",
      "Help Center": "Xarunta Caawimaadka",
      "English": "Ingiriisi",
      "Somali": "Soomaali"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;