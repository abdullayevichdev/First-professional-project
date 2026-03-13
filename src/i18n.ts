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
        contact: 'Aloqa',
        glossary: 'Lugʻat'
      },
      hero: {
        slogan: "Har bir soʻzdan ma’no, har bir ma’nodan tushuncha berish maqsadida, tarix sahifalarini hozirgi zamon istiqboliga olib oʻtayotgan ta'sirlari."
      },
      auth: {
        login: 'Kirish',
        logout: 'Chiqish',
        register: "Ro'yxatdan o'tish",
        gmail_only: "Faqat Google Gmail orqali",
        welcome_back: "Xush kelibsiz",
        sign_in_desc: "Eksklyuziv kontent va tahlillarni o'qish uchun tizimga kiring",
        register_title: "Xush kelibsiz",
        register_desc: "Davom etish uchun ma'lumotlaringizni kiriting",
        continue_google: "Google orqali davom etish",
        continue_apple: "Apple orqali davom etish",
        terms_agree: "Davom etish orqali siz bizning Xizmat ko'rsatish shartlari va Maxfiylik siyosatimizga rozilik bildirasiz."
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
        latest_updates: "So'nggi Yangiliklar",
        view_archive: "Arxivni ko'rish",
        trending: "Trendda",
        multimedia: "Multimedia tahlili",
        strategic_insights: "Strategik tahlillar",
        join_discussion: "Munozaraga qo'shiling",
        become_member: "A'zo bo'lish",
        featured_analysis: "Maxsus Tahlil",
        weekly_brief: "Haftalik Xabarnoma",
        weekly_brief_desc: "Har yakshanba tongida eng aniq siyosiy tahlillarimizni elektron pochtangizga oling.",
        email_placeholder: "Elektron pochta manzili",
        subscribe: "Obuna bo'lish",
        subscribed: "Obuna bo'ldingiz!",
        decoding_speeches: "Siyosiy nutqlarni dekodlash",
        decoding_desc: "Ekspertlarimiz so'nggi yirik nutqlar ortidagi yashirin ma'nolar va tarixiy kontekstni tahlil qilishini tomosha qiling.",
        watch_analysis: "Tahlilni tomosha qilish",
        international_relations: "Xalqaro munosabatlar",
        historical_context: "Tarixiy Kontekst",
        future_integration: "Markaziy Osiyo integratsiyasining kelajagi",
        future_integration_desc: "Mintaqaviy kuchlar o'rtasidagi hamkorlikning yangi davrini harakatga keltiruvchi iqtisodiy va siyosiy omillarni chuqur o'rganish.",
        digital_sovereignty: "21-asrda raqamli suverenitet",
        digital_sovereignty_desc: "Davlatlar ma'lumotlar maxfiyligi, AI etikasi va texnologik mustaqillik murakkabliklarini qanday boshqarmoqda.",
        community_desc: "Bizning platformamiz shunchaki yangiliklar emas. Bu olimlar, tahlilchilar va faol fuqarolar hamjamiyatidir.",
        editorial: "Tahqiq Tahririyati",
        explore_archives: "Arxivlarni o'rganish",
        trending_1: "2026 yilda Markaziy Osiyo diplomatiyasining o'zgaruvchan dinamikasi.",
        current_edition: "Joriy Nashr",
        member: "A'zo",
        admin_access: "Admin Kirish",
        analytical_insight: "Analitik Tushuncha"
      },
      footer: {
        desc: "\"Siyosiy nutqlar va global muammolarni dalillarga asoslangan holda tahlil qilib, ta'lim berish va xabardor qilish. Tarix va bugungi kunni bog'lash.\"",
        platform: "Platforma",
        about: "Biz haqimizda",
        contact: "Aloqa",
        resources: "Resurslar",
        legal: "Huquqiy",
        privacy: "Maxfiylik siyosati",
        terms: "Xizmat ko'rsatish shartlari",
        connect: "Bog'lanish",
        rights: "Barcha huquqlar himoyalangan",
        designed: "Mukammallik uchun yaratilgan",
        global_edition: "Global Nashr"
      },
      about: {
        philosophy: "Bizning Falsafamiz",
        mission_p1: "Tahqiq - bu siyosiy nutqlar va global muammolarni dalillarga asoslangan holda tahlil qilishga bag'ishlangan professional platforma. Bizning missiyamiz neytral kuratsiyani kuchli tahliliy sharhlar bilan muvozanatlash orqali o'zbek va xalqaro auditoriyani o'qitishdir.",
        mission_p2: "Biz ishonamizki, axborot ko'pligi davrida siyosiy ritorika ortidagi asl ma'noni dekodlash qobiliyati sog'lom demokratiya va xabardor fuqarolar uchun zarurdir.",
        why_p1: "Bizning loyihamiz muhim, chunki u tarix va bugungi kun o'rtasida ko'prik vazifasini o'taydi. Tarix sahifalarining ta'sirini tahlil qilib, biz hozirgi zamon uchun istiqbollarni taklif qilamiz.",
        why_p2: "Ushbu platforma ayniqsa talabalar, tadqiqotchilar va PPE (Siyosat, Falsafa va Iqtisodiyot) ilovalariga qiziqqan har bir kishi uchun qimmatli bo'lib, akademik chuqurlik va ishonchli manbalarga havolalarni taqdim etadi.",
        join: "Hamjamiyatimizga qo'shiling",
        join_desc: "Global siyosat va tarixiy istiqbollarning murakkabliklarini dekodlovchi so'nggi tahliliy ma'lumotlarimizdan xabardor bo'ling.",
        contact_editorial: "Tahririyat bilan aloqa"
      },
      contact: {
        get_in_touch: "Bog'lanish",
        desc: "\"Savollar, akademik hamkorlik yoki ommaviy axborot vositalari so'rovlari uchun tahririyatimiz bilan bog'laning.\"",
        editorial_office: "Tahririyat Ofisi",
        address: "Toshkent, O'zbekiston",
        department: "Siyosiy Tahlil Bo'limi",
        direct_contact: "To'g'ridan-to'g'ri Aloqa",
        full_name: "To'liq ism",
        email: "Elektron pochta",
        message: "Xabar",
        send_inquiry: "So'rov yuborish"
      },
      article: {
        share: "Ulashish",
        save: "Saqlash",
        exclusive_analysis: "Eksklyuziv Tahlil",
        not_found: "Maqola topilmadi."
      },
      admin: {
        access: "Admin Kirish",
        enter_code: "Davom etish uchun xavfsiz kirish kodini kiriting",
        unlock: "Panelni qulfdan chiqarish",
        console: "Admin Konsoli",
        export: "Hisobotni yuklab olish",
        exit: "Chiqish",
        total_users: "Jami foydalanuvchilar",
        active_today: "Bugun faol",
        total_actions: "Jami harakatlar",
        user_mgmt: "Foydalanuvchilarni boshqarish",
        activity_logs: "Faollik jurnallari",
        departed_users: "Chiqib ketgan foydalanuvchilar",
        user: "Foydalanuvchi",
        email: "Email",
        last_active: "So'nggi faollik",
        actions: "Harakatlar",
        message: "Xabar",
        time: "Vaqt",
        event: "Hodisa",
        details: "Tafsilotlar",
        no_departed: "Chiqib ketgan foydalanuvchilar topilmadi.",
        message_to: "Xabar yuborish:",
        send_notification: "Bu foydalanuvchiga to'g'ridan-to'g'ri bildirishnoma yuborish.",
        type_message: "Xabaringizni bu yerga yozing...",
        cancel: "Bekor qilish",
        send: "Yuborish",
        invalid_code: "Yaroqsiz kirish kodi",
        login_failed: "Kirish muvaffaqiyatsiz tugadi",
        msg_success: "Xabar muvaffaqiyatli yuborildi",
        msg_failed: "Xabar yuborish muvaffaqiyatsiz tugadi",
        msg_error: "Xabar yuborishda xatolik"
      },
      category: {
        archive_explorer: "Arxiv Tadqiqotchisi",
        desc: "{{category}} landshaftiga oid chuqur tahlillar, ekspert xulosalari va strategik tushunchalar."
      },
      glossary: {
        knowledge_base: "Bilimlar Bazasi",
        title: "Siyosiy Lug'at",
        desc: "\"Talabalar, tadqiqotchilar va global fuqarolar uchun tushuntirilgan asosiy terminologiya.\"",
        watch_explainer: "Tushuntirishni tomosha qilish",
        terms: {
          parliament: {
            term: "Parlament",
            def: "Davlat hokimiyatining oliy vakillik va qonun chiqaruvchi organi."
          },
          referendum: {
            term: "Referendum",
            def: "Davlat ahamiyatiga molik eng muhim masalalar bo'yicha o'tkaziladigan umumxalq ovoz berishi."
          },
          lobbying: {
            term: "Lobbizm",
            def: "Siyosiy qarorlar qabul qilinishiga ta'sir ko'rsatish maqsadida davlat organlariga bosim o'tkazish faoliyati."
          },
          democracy: {
            term: "Demokratiya",
            def: "Xalq hokimiyatiga asoslangan davlat boshqaruvi shakli."
          }
        }
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
        contact: 'Contact',
        glossary: 'Glossary'
      },
      hero: {
        slogan: "With the purpose of deriving meaning from every word and insight from every meaning, [we] are transferring the influences of history’s pages into the prospects of the present time."
      },
      auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        gmail_only: "Google Gmail only",
        welcome_back: "Welcome Back",
        sign_in_desc: "Sign in to access exclusive content and analysis",
        register_title: "Welcome",
        register_desc: "Please enter your details to continue",
        continue_google: "Continue with Google",
        continue_apple: "Continue with Apple",
        terms_agree: "By continuing, you agree to our Terms of Service and Privacy Policy."
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
        become_member: "Become a Member",
        featured_analysis: "Featured Analysis",
        weekly_brief: "The Weekly Brief",
        weekly_brief_desc: "Get our most rigorous political analysis delivered to your inbox every Sunday morning.",
        email_placeholder: "Email Address",
        subscribe: "Subscribe",
        subscribed: "Subscribed!",
        decoding_speeches: "Decoding Political Speeches",
        decoding_desc: "Watch our expert curators break down the hidden meanings and historical context behind recent major addresses.",
        watch_analysis: "Watch Analysis",
        international_relations: "International Relations",
        historical_context: "Historical Context",
        future_integration: "The Future of Central Asian Integration",
        future_integration_desc: "An in-depth look at the economic and political factors driving the new era of cooperation between regional powers.",
        digital_sovereignty: "Digital Sovereignty in the 21st Century",
        digital_sovereignty_desc: "How nations are navigating the complexities of data privacy, AI ethics, and technological independence.",
        community_desc: "Our platform is more than just news. It's a community of scholars, analysts, and engaged citizens.",
        editorial: "Tahqiq Editorial",
        explore_archives: "Explore Archives",
        trending_1: "The shifting dynamics of Central Asian diplomacy in 2026.",
        current_edition: "Current Edition",
        member: "Member",
        admin_access: "Admin Access",
        analytical_insight: "Analytical Insight"
      },
      footer: {
        desc: "\"Providing evidence-based analysis of political speeches and global issues to educate and inform. Bridging history and the present.\"",
        platform: "Platform",
        about: "About Us",
        contact: "Contact",
        resources: "Resources",
        legal: "Legal",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
        connect: "Connect",
        rights: "All Rights Reserved",
        designed: "Designed for Excellence",
        global_edition: "Global Edition"
      },
      about: {
        philosophy: "Our Philosophy",
        mission_p1: "Tahqiq is a professional platform dedicated to the evidence-based analysis of political speeches and global issues. Our mission is to educate both Uzbek and international audiences by balancing neutral curation with strong analytical commentary.",
        mission_p2: "We believe that in an era of information overload, the ability to decode the true meaning behind political rhetoric is essential for a healthy democracy and an informed citizenry.",
        why_p1: "Our project matters because it provides a bridge between history and the present. By analyzing the influences of history's pages, we offer prospects for the present time.",
        why_p2: "This platform is particularly valuable for students, researchers, and anyone interested in PPE (Politics, Philosophy, and Economics) applications, providing academic depth and reliable source citations.",
        join: "Join Our Community",
        join_desc: "Stay informed with our latest analytical insights, decoding the complexities of global politics and historical perspectives.",
        contact_editorial: "Contact Editorial"
      },
      contact: {
        get_in_touch: "Get in Touch",
        desc: "\"For inquiries, academic collaborations, or media requests, please reach out to our editorial team.\"",
        editorial_office: "Editorial Office",
        address: "Tashkent, Uzbekistan",
        department: "Political Analysis Department",
        direct_contact: "Direct Contact",
        full_name: "Full Name",
        email: "Email Address",
        message: "Message",
        send_inquiry: "Send Inquiry"
      },
      article: {
        share: "Share",
        save: "Save",
        exclusive_analysis: "Exclusive Analysis",
        not_found: "Article not found."
      },
      admin: {
        access: "Admin Access",
        enter_code: "Enter the secure access code to continue",
        unlock: "Unlock Panel",
        console: "Admin Console",
        export: "Export Report",
        exit: "Exit",
        total_users: "Total Users",
        active_today: "Active Today",
        total_actions: "Total Actions",
        user_mgmt: "User Management",
        activity_logs: "Activity Logs",
        departed_users: "Departed Users",
        user: "User",
        email: "Email",
        last_active: "Last Active",
        actions: "Actions",
        message: "Message",
        time: "Time",
        event: "Event",
        details: "Details",
        no_departed: "No departed users found.",
        message_to: "Message to",
        send_notification: "Send a direct notification to this user.",
        type_message: "Type your message here...",
        cancel: "Cancel",
        send: "Send",
        invalid_code: "Invalid Access Code",
        login_failed: "Login failed",
        msg_success: "Message sent successfully",
        msg_failed: "Failed to send message",
        msg_error: "Error sending message"
      },
      category: {
        archive_explorer: "Archive Explorer",
        desc: "\"Deep dives, expert analysis, and strategic insights regarding the {{category}} landscape.\""
      },
      glossary: {
        knowledge_base: "Knowledge Base",
        title: "Political Glossary",
        desc: "\"Essential terminology explained for students, researchers, and global citizens.\"",
        watch_explainer: "Watch Explainer",
        terms: {
          parliament: {
            term: "Parliament",
            def: "The supreme representative and legislative body of state power."
          },
          referendum: {
            term: "Referendum",
            def: "A nationwide vote on the most important issues of state significance."
          },
          lobbying: {
            term: "Lobbying",
            def: "The activity of exerting pressure on state bodies to influence political decisions."
          },
          democracy: {
            term: "Democracy",
            def: "A form of government based on the power of the people."
          }
        }
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
        contact: 'Контакты',
        glossary: 'Словарь'
      },
      hero: {
        slogan: "Смыслом каждого слова, пониманием каждого значения стремясь, [мы] переносим влияния страниц истории в перспективу настоящего времени."
      },
      auth: {
        login: 'Войти',
        logout: 'Выйти',
        register: 'Регистрация',
        gmail_only: "Только через Google Gmail",
        welcome_back: "С возвращением",
        sign_in_desc: "Войдите, чтобы получить доступ к эксклюзивному контенту",
        register_title: "Добро пожаловать",
        register_desc: "Пожалуйста, введите свои данные, чтобы продолжить",
        continue_google: "Продолжить с Google",
        continue_apple: "Продолжить с Apple",
        terms_agree: "Продолжая, вы соглашаетесь с нашими Условиями обслуживания и Политикой конфиденциальности."
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
        become_member: "Стать участником",
        featured_analysis: "Специальный анализ",
        weekly_brief: "Еженедельный обзор",
        weekly_brief_desc: "Получайте наш самый тщательный политический анализ на почту каждое воскресное утро.",
        email_placeholder: "Адрес электронной почты",
        subscribe: "Подписаться",
        subscribed: "Вы подписаны!",
        decoding_speeches: "Расшифровка политических речей",
        decoding_desc: "Смотрите, как наши эксперты разбирают скрытые смыслы и исторический контекст недавних крупных выступлений.",
        watch_analysis: "Смотреть анализ",
        international_relations: "Международные отношения",
        historical_context: "Исторический контекст",
        future_integration: "Будущее центральноазиатской интеграции",
        future_integration_desc: "Глубокий взгляд на экономические и политические факторы, стимулирующие новую эру сотрудничества.",
        digital_sovereignty: "Цифровой суверенитет в 21 веке",
        digital_sovereignty_desc: "Как страны справляются со сложностями конфиденциальности данных, этики ИИ и технологической независимости.",
        community_desc: "Наша платформа — это больше, чем просто новости. Это сообщество ученых, аналитиков и активных граждан.",
        editorial: "Редакция Tahqiq",
        explore_archives: "Изучить архивы",
        trending_1: "Изменяющаяся динамика дипломатии Центральной Азии в 2026 году.",
        current_edition: "Текущий выпуск",
        member: "Участник",
        admin_access: "Доступ администратора",
        analytical_insight: "Аналитический взгляд"
      },
      footer: {
        desc: "\"Предоставление обоснованного анализа политических речей и глобальных проблем для обучения и информирования. Связывая историю и современность.\"",
        platform: "Платформа",
        about: "О нас",
        contact: "Контакты",
        resources: "Ресурсы",
        legal: "Правовая информация",
        privacy: "Политика конфиденциальности",
        terms: "Условия обслуживания",
        connect: "Связь",
        rights: "Все права защищены",
        designed: "Создано для совершенства",
        global_edition: "Глобальное издание"
      },
      about: {
        philosophy: "Наша философия",
        mission_p1: "Tahqiq — это профессиональная платформа, посвященная обоснованному анализу политических речей и глобальных проблем. Наша миссия — обучать как узбекскую, так и международную аудиторию, балансируя нейтральное курирование с сильными аналитическими комментариями.",
        mission_p2: "Мы считаем, что в эпоху информационной перегрузки способность расшифровывать истинный смысл политической риторики имеет важное значение для здоровой демократии и информированных граждан.",
        why_p1: "Наш проект важен, потому что он служит мостом между историей и настоящим. Анализируя влияние страниц истории, мы предлагаем перспективы для настоящего времени.",
        why_p2: "Эта платформа особенно ценна для студентов, исследователей и всех, кто интересуется приложениями PPE (политика, философия и экономика), обеспечивая академическую глубину и надежные ссылки на источники.",
        join: "Присоединяйтесь к нашему сообществу",
        join_desc: "Будьте в курсе наших последних аналитических данных, расшифровывающих сложности глобальной политики и исторических перспектив.",
        contact_editorial: "Связаться с редакцией"
      },
      contact: {
        get_in_touch: "Связаться",
        desc: "\"По вопросам, академическому сотрудничеству или запросам СМИ, пожалуйста, обращайтесь в нашу редакцию.\"",
        editorial_office: "Редакция",
        address: "Ташкент, Узбекистан",
        department: "Отдел политического анализа",
        direct_contact: "Прямой контакт",
        full_name: "Полное имя",
        email: "Адрес электронной почты",
        message: "Сообщение",
        send_inquiry: "Отправить запрос"
      },
      article: {
        share: "Поделиться",
        save: "Сохранить",
        exclusive_analysis: "Эксклюзивный анализ",
        not_found: "Статья не найдена."
      },
      admin: {
        access: "Доступ администратора",
        enter_code: "Введите безопасный код доступа для продолжения",
        unlock: "Разблокировать панель",
        console: "Консоль администратора",
        export: "Экспорт отчета",
        exit: "Выход",
        total_users: "Всего пользователей",
        active_today: "Активны сегодня",
        total_actions: "Всего действий",
        user_mgmt: "Управление пользователями",
        activity_logs: "Журналы активности",
        departed_users: "Вышедшие пользователи",
        user: "Пользователь",
        email: "Email",
        last_active: "Последняя активность",
        actions: "Действия",
        message: "Сообщение",
        time: "Время",
        event: "Событие",
        details: "Детали",
        no_departed: "Вышедшие пользователи не найдены.",
        message_to: "Сообщение для",
        send_notification: "Отправить прямое уведомление этому пользователю.",
        type_message: "Введите ваше сообщение здесь...",
        cancel: "Отмена",
        send: "Отправить",
        invalid_code: "Неверный код доступа",
        login_failed: "Ошибка входа",
        msg_success: "Сообщение успешно отправлено",
        msg_failed: "Не удалось отправить сообщение",
        msg_error: "Ошибка при отправке сообщения"
      },
      category: {
        archive_explorer: "Исследователь архива",
        desc: "\"Глубокое погружение, экспертный анализ и стратегические идеи относительно ландшафта {{category}}.\""
      },
      glossary: {
        knowledge_base: "База знаний",
        title: "Политический словарь",
        desc: "\"Основные термины, объясненные для студентов, исследователей и граждан мира.\"",
        watch_explainer: "Смотреть объяснение",
        terms: {
          parliament: {
            term: "Парламент",
            def: "Высший представительный и законодательный орган государственной власти."
          },
          referendum: {
            term: "Референдум",
            def: "Всенародное голосование по важнейшим вопросам государственного значения."
          },
          lobbying: {
            term: "Лоббизм",
            def: "Деятельность по оказанию давления на государственные органы с целью влияния на политические решения."
          },
          democracy: {
            term: "Демократия",
            def: "Форма государственного управления, основанная на власти народа."
          }
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'uz',
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
