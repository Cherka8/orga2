import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend'; // Import the backend

i18n
  .use(HttpApi) // Use the backend
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true, // Set to false in production
    fallbackLng: 'fr', // Use French if detected language is not available
    load: 'languageOnly', // Ne charge que 'fr' ou 'en', pas 'fr-FR' ou 'en-US'
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    // Configure the backend
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to translation files
    },
    // ns: ['translation'], // Optional: specify namespaces if needed
    // defaultNS: 'translation', // Optional: specify the default namespace
    // Remove hardcoded resources as they will be loaded by the backend
    /*
    resources: {
      en: {
        translation: {
          // Example key: value pair
          welcome: "Welcome to OrganAIzer"
        }
      },
      fr: {
        translation: {
          // Example key: value pair for French
          welcome: "Bienvenue à OrganAIzer"
        }
      }
    }
    */
  });

export default i18n;
