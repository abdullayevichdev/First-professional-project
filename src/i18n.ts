import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  uz: {
    translation: {
      nav: {
        home: 'Bosh sahifa',
        uzb_politics: 'Oʻzbekiston Siyosati',
        global_politics: 'Global Siyosat',
        speech_analysis: 'Nutq Tahlili',
        opinion: 'Mulohaza va Tahlil',
        about: 'Biz haqimizda',
        contact: 'Aloqa'
      },
      hero: {
        slogan: "Har bir soʻzdan ma’no, har bir ma’nodan tushuncha berish maqsadida, tarix sahifalarini hozirgi zamon istiqboliga olib oʻtayotgan ta'sirlari."
      },
      auth: {
        login: 'Kirish',
        logout: 'Chiqish',
        register: "Ro'yxatdan o'tish",
        gmail_only: "Faqat Google Gmail orqali"
      },
      common: {
        read_more: 'Batafsil',
        key_points: 'Asosiy nuqtalar',
        author: 'Muallif',
        date: 'Sana',
        preview_mode: "To'liq o'qish uchun tizimga kiring",
        mission: "Missiyamiz",
        why_matters: "Nega bu muhim?",
        newsletter: "Yangiliklarga obuna bo'ling",
        latest_updates: "So'nggi yangilanishlar",
        view_archive: "Arxivni ko'rish",
        trending: "Trendda",
        multimedia: "Multimedia tahlili",
        strategic_insights: "Strategik tahlillar",
        join_discussion: "Munozaraga qo'shiling",
        become_member: "A'zo bo'lish"
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        uzb_politics: 'Uzbekistan Politics',
        global_politics: 'Global Politics',
        speech_analysis: 'Speech Analysis',
        opinion: 'Opinion & Analysis',
        about: 'About',
        contact: 'Contact'
      },
      hero: {
        slogan: "With the purpose of deriving meaning from every word and insight from every meaning, [we] are transferring the influences of history’s pages into the prospects of the present time."
      },
      auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        gmail_only: "Google Gmail only"
      },
      common: {
        read_more: 'Read More',
        key_points: 'Key Points',
        author: 'Author',
        date: 'Date',
        preview_mode: "Login to read full article",
        mission: "Our Mission",
        why_matters: "Why it matters?",
        newsletter: "Subscribe to Newsletter",
        latest_updates: "Latest Updates",
        view_archive: "View Archive",
        trending: "Trending Now",
        multimedia: "Multimedia Insights",
        strategic_insights: "Strategic Insights",
        join_discussion: "Join the Discussion",
        become_member: "Become a Member"
      }
    }
  },
  ru: {
    translation: {
      nav: {
        home: 'Главная',
        uzb_politics: 'Политика Узбекистана',
        global_politics: 'Глобальная политика',
        speech_analysis: 'Анализ речи',
        opinion: 'Мнение и анализ',
        about: 'О нас',
        contact: 'Контакты'
      },
      hero: {
        slogan: "Смыслом каждого слова, пониманием каждого значения стремясь, [мы] переносим влияния страниц истории в перспективу настоящего времени."
      },
      auth: {
        login: 'Войти',
        logout: 'Выйти',
        register: 'Регистрация',
        gmail_only: "Только через Google Gmail"
      },
      common: {
        read_more: 'Читать далее',
        key_points: 'Ключевые моменты',
        author: 'Автор',
        date: 'Дата',
        preview_mode: "Войдите, чтобы прочитать полностью",
        mission: "Наша миссия",
        why_matters: "Почему это важно?",
        newsletter: "Подписаться на рассылку",
        latest_updates: "Последние обновления",
        view_archive: "Посмотреть архив",
        trending: "В тренде",
        multimedia: "Мультимедийный анализ",
        strategic_insights: "Стратегический анализ",
        join_discussion: "Присоединяйтесь к дискуссии",
        become_member: "Стать участником"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
