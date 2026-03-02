import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cookieParser from "cookie-parser";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = 3000;

// Database setup
const db = new Database("tahqiq.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    picture TEXT,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    event_type TEXT, -- view_article, login, logout
    content_id TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS content (
    id TEXT PRIMARY KEY,
    type TEXT, -- article, video, glossary
    category TEXT, -- uzbekistan, global, speech, opinion, historical
    title_uz TEXT,
    title_ru TEXT,
    title_en TEXT,
    excerpt_uz TEXT,
    excerpt_ru TEXT,
    excerpt_en TEXT,
    body_uz TEXT,
    body_ru TEXT,
    body_en TEXT,
    author TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Mock data insertion if empty
const contentCount = db.prepare("SELECT COUNT(*) as count FROM content").get() as { count: number };
if (contentCount.count === 0) {
  const insertContent = db.prepare(`
    INSERT INTO content (id, type, category, title_uz, title_ru, title_en, excerpt_uz, excerpt_ru, excerpt_en, body_uz, body_ru, body_en, author, video_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const mockData = [
    {
      id: "art-1", type: "article", category: "speech",
      title_uz: "Siyosiy ritorika kuchi: Shavkat Mirziyoyev nutqlari tahlili",
      title_ru: "Сила политической риторики: анализ выступлений Шавката Мирзиёева",
      title_en: "The Power of Political Rhetoric: Analysis of Shavkat Mirziyoyev's Speeches",
      excerpt_uz: "O'zbekiston Prezidentining BMTdagi nutqlarida qo'llanilgan asosiy tushunchalar va ularning xalqaro hamjamiyatga ta'siri.",
      excerpt_ru: "Ключевые концепции, использованные в выступлениях Президента Узбекистана в ООН, и их влияние на международное сообщество.",
      excerpt_en: "Key concepts used in the President of Uzbekistan's UN speeches and their impact on the international community.",
      body_uz: "Prezident Shavkat Mirziyoyevning xalqaro minbarlardagi nutqlari yangi O'zbekistonning tashqi siyosiy strategiyasini aks ettiradi. Tahlillar shuni ko'rsatadiki, 'Markaziy Osiyo birdamligi' va 'Barqaror rivojlanish' tushunchalari nutqlarning markaziy qismini egallaydi. Bu ritorika nafaqat ichki auditoriyaga, balki global investorlar va siyosiy hamkorlarga ham yo'naltirilgan. Nutqlardagi pragmatizm va ochiqlik O'zbekistonning xalqaro maydondagi nufuzini oshirishga xizmat qilmoqda.",
      body_ru: "Выступления президента Шавката Мирзиёева на международных трибунах отражают внешнеполитическую стратегию нового Узбекистана. Анализ показывает, что понятия «Центральноазиатская солидарность» и «Устойчивое развитие» занимают центральное место в выступлениях. Эта риторика направлена ​​не только на внутреннюю аудиторию, но и на глобальных инвесторов и политических партнеров. Прагматизм и открытость в выступлениях служат повышению авторитета Узбекистана на международной арене.",
      body_en: "President Shavkat Mirziyoyev's speeches on international platforms reflect the foreign policy strategy of the new Uzbekistan. Analysis shows that the concepts of 'Central Asian Solidarity' and 'Sustainable Development' occupy a central place in the speeches. This rhetoric is aimed not only at the domestic audience, but also at global investors and political partners. Pragmatism and openness in the speeches serve to increase Uzbekistan's prestige in the international arena.",
      author: "Tahqiq Editorial", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
      id: "art-2", type: "article", category: "uzbekistan",
      title_uz: "Yangi O'zbekiston iqtisodiyoti: Islohotlar va natijalar",
      title_ru: "Экономика Нового Узбекистана: Реформы и результаты",
      title_en: "Economy of New Uzbekistan: Reforms and Results",
      excerpt_uz: "So'nggi yillarda amalga oshirilgan valyuta liberallashuvi va xususiylashtirish jarayonlarining tahlili.",
      excerpt_ru: "Анализ процессов либерализации валюты и приватизации, осуществленных в последние годы.",
      excerpt_en: "Analysis of currency liberalization and privatization processes carried out in recent years.",
      body_uz: "O'zbekiston iqtisodiyoti transformatsiya davrini boshidan kechirmoqda. Valyuta bozorining erkinlashtirilishi tashqi savdo aylanmasining sezilarli darajada oshishiga olib keldi. Biroq, inflyatsiya va davlat korxonalarini xususiylashtirish masalalari hamon dolzarbligicha qolmoqda. PPE (Siyosat, Falsafa va Iqtisodiyot) nuqtai nazaridan, bu islohotlar ijtimoiy shartnomaning yangilanishini anglatadi.",
      body_ru: "Экономика Узбекистана переживает период трансформации. Либерализация валютного рынка привела к значительному увеличению внешнеторгового оборота. Однако вопросы инфляции и приватизации государственных предприятий остаются актуальными. С точки зрения PPE (политика, философия и экономика), эти реформы означают обновление общественного договора.",
      body_en: "Uzbekistan's economy is undergoing a period of transformation. The liberalization of the currency market led to a significant increase in foreign trade turnover. However, the issues of inflation and privatization of state-owned enterprises remain relevant. From a PPE (Politics, Philosophy, and Economics) perspective, these reforms mean a renewal of the social contract.",
      author: "Dr. Alisher K.", video_url: null
    },
    {
      id: "art-3", type: "article", category: "global",
      title_uz: "Geosiyosiy o'zgarishlar: Markaziy Osiyo yangi markazmi?",
      title_ru: "Геополитические изменения: является ли Центральная Азия новым центром?",
      title_en: "Geopolitical Shifts: Is Central Asia the New Hub?",
      excerpt_uz: "Buyuk davlatlar raqobatida Markaziy Osiyoning strategik ahamiyati ortib borishi.",
      excerpt_ru: "Растущее стратегическое значение Центральной Азии в конкуренции великих держав.",
      excerpt_en: "The growing strategic importance of Central Asia in the competition of great powers.",
      body_uz: "Hozirgi kunda Markaziy Osiyo mintaqasi nafaqat tranzit yo'li, balki mustaqil geosiyosiy sub'ekt sifatida namoyon bo'lmoqda. 'C5+1' formatidagi uchrashuvlarning ko'payishi AQSH, Xitoy va Rossiyaning mintaqaga bo'lgan qiziqishini tasdiqlaydi. O'zbekistonning faol tashqi siyosati mintaqaviy integratsiyani kuchaytirmoqda, bu esa barqarorlikning garovidir.",
      body_ru: "Сегодня регион Центральной Азии выступает не только как транзитный маршрут, но и как независимый геополитический субъект. Увеличение количества встреч в формате «C5+1» подтверждает интерес США, Китая и России к региону. Активная внешняя политика Узбекистана укрепляет региональную интеграцию, что является залогом стабильности.",
      body_en: "Today, the Central Asian region appears not only as a transit route, but also as an independent geopolitical subject. The increase in the number of meetings in the 'C5+1' format confirms the interest of the US, China and Russia in the region. Uzbekistan's active foreign policy is strengthening regional integration, which is a guarantee of stability.",
      author: "Matt D.", video_url: null
    },
    {
      id: "art-4", type: "article", category: "historical",
      title_uz: "Amir Temur diplomatiyasi: Tarixdan saboqlar",
      title_ru: "Дипломатия Амира Темура: уроки истории",
      title_en: "Diplomacy of Amir Temur: Lessons from History",
      excerpt_uz: "Buyuk sarkardaning xalqaro munosabatlar va elchilik aloqalaridagi strategiyasi.",
      excerpt_ru: "Стратегия великого полководца в международных отношениях и дипломатических связях.",
      excerpt_en: "The strategy of the great commander in international relations and diplomatic ties.",
      body_uz: "Amir Temur nafaqat buyuk sarkarda, balki mohir diplomat ham bo'lgan. Uning Yevropa hukmdorlari, xususan Fransiya qiroli Karl VI bilan yozishmalari o'sha davrning murakkab xalqaro munosabatlarini aks ettiradi. Temuriylar diplomatiyasi bugungi O'zbekiston tashqi siyosati uchun ham muhim tarixiy asos bo'lib xizmat qiladi.",
      body_ru: "Амир Темур был не только великим полководцем, но и искусным дипломатом. Его переписка с европейскими правителями, в частности с французским королем Карлом VI, отражает сложные международные отношения того времени. Дипломатия Темуридов служит важной исторической основой внешней политики сегодняшнего Узбекистана.",
      body_en: "Amir Temur was not only a great commander, but also a skilled diplomat. His correspondence with European rulers, in particular with the French King Charles VI, reflects the complex international relations of that time. Timurid diplomacy serves as an important historical basis for the foreign policy of today's Uzbekistan.",
      author: "Historical Analyst", video_url: null
    },
    {
      id: "art-5", type: "article", category: "opinion",
      title_uz: "Sun'iy intellekt va siyosat: Kelajak qanday bo'ladi?",
      title_ru: "Искусственный интеллект и политика: каким будет будущее?",
      title_en: "AI and Politics: What Will the Future Hold?",
      excerpt_uz: "Algoritmlarning saylovlar va jamoatchilik fikriga ta'siri haqida mulohazalar.",
      excerpt_ru: "Размышления о влиянии алгоритмов на выборы и общественное мнение.",
      excerpt_en: "Reflections on the impact of algorithms on elections and public opinion.",
      body_uz: "Sun'iy intellekt siyosiy kampaniyalarni o'zgartirmoqda. Ma'lumotlarni tahlil qilish orqali saylovchilarning xohish-istaklarini aniqroq bashorat qilish mumkin. Biroq, bu texnologiya dezinformatsiya tarqalishi xavfini ham tug'diradi. Siyosiy etika masalasi raqamli asrda har qachongidan ham dolzarb bo'lib qolmoqda.",
      body_ru: "Искусственный интеллект меняет политические кампании. Анализируя данные, можно более точно предсказать предпочтения избирателей. Однако эта технология также несет в себе риск распространения дезинформации. Вопрос политической этики становится более актуальным, чем когда-либо, в эпоху цифровых технологий.",
      body_en: "Artificial intelligence is changing political campaigns. By analyzing data, it is possible to predict voter preferences more accurately. However, this technology also poses a risk of spreading disinformation. The issue of political ethics is becoming more relevant than ever in the digital age.",
      author: "Tech & Policy Expert", video_url: null
    },
    {
      id: "art-6", type: "article", category: "global",
      title_uz: "Iqlim o'zgarishi va xavfsizlik: Markaziy Osiyo xavf ostidami?",
      title_ru: "Изменение климата и безопасность: находится ли Центральная Азия под угрозой?",
      title_en: "Climate Change and Security: Is Central Asia at Risk?",
      excerpt_uz: "Ekologik muammolarning mintaqaviy barqarorlikka ta'siri.",
      excerpt_ru: "Влияние экологических проблем на региональную стабильность.",
      excerpt_en: "The impact of environmental problems on regional stability.",
      body_uz: "Muzliklarning erishi va suv tanqisligi Markaziy Osiyo uchun eng katta xavflardan biridir. Bu muammo nafaqat ekologik, balki siyosiy xarakterga ham ega. Suv resurslari bo'yicha mintaqaviy hamkorlik xavfsizlikni ta'minlashning yagona yo'lidir. Tahqiq tahlillari shuni ko'rsatadiki, iqlim diplomatiyasi mintaqa davlatlari uchun ustuvor yo'nalishga aylanishi kerak.",
      body_ru: "Таяние ледников и нехватка воды — одна из величайших угроз для Центральной Азии. Эта проблема носит не только экологический, но и политический характер. Региональное сотрудничество по водным ресурсам – единственный способ обеспечить безопасность. Анализ Tahqiq показывает, что климатическая дипломатия должна стать приоритетом для стран региона.",
      body_en: "Glacier melting and water scarcity are one of the greatest threats to Central Asia. This problem is not only environmental, but also political in nature. Regional cooperation on water resources is the only way to ensure security. Tahqiq's analysis shows that climate diplomacy should become a priority for the countries of the region.",
      author: "Eco-Policy Analyst", video_url: null
    },
    {
      id: "art-7", type: "article", category: "uzbekistan",
      title_uz: "O'zbekistonda fuqarolik jamiyati: Rivojlanish bosqichlari",
      title_ru: "Гражданское общество в Узбекистане: Этапы развития",
      title_en: "Civil Society in Uzbekistan: Stages of Development",
      excerpt_uz: "Nodavlat tashkilotlar va jamoatchilik nazoratining kuchayishi.",
      excerpt_ru: "Рост неправительственных организаций и общественного контроля.",
      excerpt_en: "The growth of non-governmental organizations and public control.",
      body_uz: "So'nggi yillarda O'zbekistonda fuqarolik jamiyati institutlarining roli sezilarli darajada oshdi. Jamoatchilik nazorati mexanizmlari davlat organlari faoliyatining shaffofligini ta'minlashga xizmat qilmoqda. Biroq, haqiqiy fuqarolik jamiyatini shakllantirish uchun huquqiy savodxonlikni oshirish va ijtimoiy tashabbuslarni qo'llab-quvvatlash zarur.",
      body_ru: "В последние годы роль институтов гражданского общества в Узбекистане значительно возросла. Механизмы общественного контроля служат обеспечению прозрачности деятельности государственных органов. Однако для формирования истинного гражданского общества необходимо повышение правовой грамотности и поддержка социальных инициатив.",
      body_en: "In recent years, the role of civil society institutions in Uzbekistan has significantly increased. Public control mechanisms serve to ensure the transparency of state bodies' activities. However, to form a true civil society, it is necessary to increase legal literacy and support social initiatives.",
      author: "Sociology Expert", video_url: null
    },
    {
      id: "art-8", type: "article", category: "speech",
      title_uz: "BMT minbaridagi o'zbek tili: Tarixiy burilish",
      title_ru: "Узбекский язык на трибуне ООН: исторический поворот",
      title_en: "Uzbek Language at the UN Podium: A Historical Turning Point",
      excerpt_uz: "Prezident nutqining madaniy va siyosiy ahamiyati.",
      excerpt_ru: "Культурное и политическое значение речи президента.",
      excerpt_en: "The cultural and political significance of the president's speech.",
      body_uz: "O'zbekiston Prezidentining BMT Bosh Assambleyasida o'zbek tilida nutq so'zlashi milliy o'zlikni anglash va xalqaro maydonda davlat nufuzini mustahkamlash yo'lidagi muhim qadam bo'ldi. Bu voqea nafaqat lingvistik, balki chuqur siyosiy ma'noga ega bo'lib, O'zbekistonning mustaqil va teng huquqli sub'ekt ekanligini yana bir bor tasdiqladi.",
      body_ru: "Выступление Президента Узбекистана на Генеральной Ассамблее ООН на узбекском языке стало важным шагом на пути национального самосознания и укрепления престижа государства на международной арене. Это событие имело не только лингвистическое, но и глубокое политическое значение, еще раз подтвердив, что Узбекистан является независимым и равноправным субъектом.",
      body_en: "The President of Uzbekistan's speech at the UN General Assembly in the Uzbek language was an important step towards national identity and strengthening the state's prestige in the international arena. This event had not only linguistic, but also deep political significance, once again confirming that Uzbekistan is an independent and equal subject.",
      author: "Cultural Analyst", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
      id: "art-9", type: "article", category: "uzbekistan",
      title_uz: "O'zbekistonning raqamli kelajagi: IT-parklar va innovatsiyalar",
      title_ru: "Цифровое будущее Узбекистана: IT-парки и инновации",
      title_en: "Uzbekistan's Digital Future: IT Parks and Innovations",
      excerpt_uz: "Mamlakatda axborot texnologiyalari sohasini rivojlantirish bo'yicha ko'rilayotgan choralar.",
      excerpt_ru: "Меры, принимаемые по развитию сферы информационных технологий в стране.",
      excerpt_en: "Measures being taken to develop the information technology sector in the country.",
      body_uz: "O'zbekiston IT-xabga aylanishni maqsad qilgan. IT-parklarning tashkil etilishi va soliq imtiyozlari yosh dasturchilar uchun keng imkoniyatlar yaratmoqda. Eksport hajmining oshishi sohaning salohiyatini ko'rsatadi.",
      body_ru: "Узбекистан стремится стать IT-хабом. Создание IT-парков и налоговые льготы создают широкие возможности для молодых программистов. Рост объемов экспорта свидетельствует о потенциале отрасли.",
      body_en: "Uzbekistan aims to become an IT hub. The creation of IT parks and tax incentives create wide opportunities for young programmers. The increase in export volumes shows the potential of the industry.",
      author: "Tech Analyst", video_url: null
    },
    {
      id: "art-10", type: "article", category: "global",
      title_uz: "Global energetika inqirozi: Muqobil energiya manbalari",
      title_ru: "Глобальный энергетический кризис: альтернативные источники энергии",
      title_en: "Global Energy Crisis: Alternative Energy Sources",
      excerpt_uz: "Dunyo bo'ylab energiya xavfsizligini ta'minlashda yashil texnologiyalarning o'rni.",
      excerpt_ru: "Роль зеленых технологий в обеспечении энергетической безопасности во всем мире.",
      excerpt_en: "The role of green technologies in ensuring energy security worldwide.",
      body_uz: "Qayta tiklanadigan energiya manbalariga o'tish endi tanlov emas, balki zaruriyatdir. Quyosh va shamol energiyasi global energetika balansida muhim o'rin egallamoqda.",
      body_ru: "Переход на возобновляемые источники энергии теперь не выбор, а необходимость. Солнечная и ветровая энергия занимают важное место в мировом энергетическом балансе.",
      body_en: "The transition to renewable energy sources is no longer a choice, but a necessity. Solar and wind energy occupy an important place in the global energy balance.",
      author: "Energy Expert", video_url: null
    },
    {
      id: "art-11", type: "article", category: "speech",
      title_uz: "Diplomatik muloqot san'ati: Muzokaralar strategiyasi",
      title_ru: "Искусство дипломатического общения: стратегия переговоров",
      title_en: "The Art of Diplomatic Communication: Negotiation Strategy",
      excerpt_uz: "Xalqaro munosabatlarda samarali muloqot va murosaga erishish yo'llari.",
      excerpt_ru: "Эффективное общение и пути достижения компромисса в международных отношениях.",
      excerpt_en: "Effective communication and ways to reach compromise in international relations.",
      body_uz: "Diplomatiya nafaqat davlatlararo aloqa, balki murakkab psixologik jarayondir. Muzokaralar stolida erishilgan kelishuvlar ko'pincha parda ortidagi nozik muloqotlar natijasidir.",
      body_ru: "Дипломатия – это не только межгосударственное общение, но и сложный психологический процесс. Соглашения, достигнутые за столом переговоров, часто являются результатом деликатного общения за кулисами.",
      body_en: "Diplomacy is not only interstate communication, but also a complex psychological process. Agreements reached at the negotiating table are often the result of delicate communication behind the scenes.",
      author: "Senior Diplomat", video_url: null
    },
    {
      id: "art-12", type: "article", category: "opinion",
      title_uz: "Ta'lim islohoti: Sifatmi yoki miqdor?",
      title_ru: "Реформа образования: качество или количество?",
      title_en: "Education Reform: Quality or Quantity?",
      excerpt_uz: "Oliy ta'lim tizimidagi o'zgarishlar va ularning mehnat bozoriga ta'siri.",
      excerpt_ru: "Изменения в системе высшего образования и их влияние на рынок труда.",
      excerpt_en: "Changes in the higher education system and their impact on the labor market.",
      body_uz: "Oliy o'quv yurtlari sonining ko'payishi ta'lim sifatiga qanday ta'sir qilmoqda? Mehnat bozori talablariga javob beradigan kadrlar tayyorlash masalasi dolzarbligicha qolmoqda.",
      body_ru: "Как увеличение количества высших учебных заведений влияет на качество образования? Вопрос подготовки кадров, отвечающих требованиям рынка труда, остается актуальным.",
      body_en: "How does the increase in the number of higher education institutions affect the quality of education? The issue of training personnel who meet the requirements of the labor market remains relevant.",
      author: "Education Specialist", video_url: null
    },
    {
      id: "art-13", type: "article", category: "historical",
      title_uz: "Ipak yo'li merosi: Madaniy aloqalar tiklanishi",
      title_ru: "Наследие Шелкового пути: восстановление культурных связей",
      title_en: "Silk Road Heritage: Restoration of Cultural Ties",
      excerpt_uz: "Qadimiy savdo yo'lining zamonaviy dunyodagi ahamiyati va turizm salohiyati.",
      excerpt_ru: "Значение древнего торгового пути в современном мире и туристический потенциал.",
      excerpt_en: "The significance of the ancient trade route in the modern world and tourism potential.",
      body_uz: "Buyuk Ipak yo'li nafaqat savdo, balki g'oyalar almashinuvi markazi bo'lgan. Bugungi kunda ushbu merosni tiklash mintaqaviy hamkorlikni mustahkamlashga xizmat qilmoqda.",
      body_ru: "Великий Шелковый путь был центром не только торговли, но и обмена идеями. Сегодня восстановление этого наследия служит укреплению регионального сотрудничества.",
      body_en: "The Great Silk Road was a center of not only trade, but also exchange of ideas. Today, the restoration of this heritage serves to strengthen regional cooperation.",
      author: "Historian", video_url: null
    },
    {
      id: "art-14", type: "article", category: "uzbekistan",
      title_uz: "Qishloq xo'jaligida innovatsiyalar: Suv tejovchi texnologiyalar",
      title_ru: "Инновации в сельском хозяйстве: водосберегающие технологии",
      title_en: "Innovations in Agriculture: Water-Saving Technologies",
      excerpt_uz: "O'zbekiston agrar sektorida tomchilatib sug'orish va raqamli monitoring.",
      excerpt_ru: "Капельное орошение и цифровой мониторинг в аграрном секторе Узбекистана.",
      excerpt_en: "Drip irrigation and digital monitoring in the agricultural sector of Uzbekistan.",
      body_uz: "Suv tanqisligi sharoitida qishloq xo'jaligini modernizatsiya qilish hayotiy zaruriyatdir. Yangi texnologiyalar hosildorlikni oshirish bilan birga resurslarni tejash imkonini beradi.",
      body_ru: "Модернизация сельского хозяйства в условиях дефицита воды является жизненной необходимостью. Новые технологии позволяют повысить урожайность и при этом сэкономить ресурсы.",
      body_en: "Modernization of agriculture in conditions of water shortage is a vital necessity. New technologies allow to increase productivity while saving resources.",
      author: "Agro Expert", video_url: null
    },
    {
      id: "art-15", type: "article", category: "global",
      title_uz: "Kosmik poyga 2.0: Xususiy sektorning roli",
      title_ru: "Космическая гонка 2.0: роль частного сектора",
      title_en: "Space Race 2.0: The Role of the Private Sector",
      excerpt_uz: "SpaceX va boshqa kompaniyalarning koinotni o'zlashtirishdagi ta'siri.",
      excerpt_ru: "Влияние SpaceX и других компаний на освоение космоса.",
      excerpt_en: "The impact of SpaceX and other companies on space exploration.",
      body_uz: "Koinot endi faqat davlatlar monopoliyasi emas. Xususiy kompaniyalar parvozlar tannarxini pasaytirib, yangi ufqlarni ochmoqda.",
      body_ru: "Космос больше не является монополией государств. Частные компании снижают стоимость полетов и открывают новые горизонты.",
      body_en: "Space is no longer just a state monopoly. Private companies are lowering the cost of flights and opening new horizons.",
      author: "Space Analyst", video_url: null
    },
    {
      id: "art-16", type: "article", category: "speech",
      title_uz: "Siyosiy etika va mas'uliyat: Rahbar obrazi",
      title_ru: "Политическая этика и ответственность: образ лидера",
      title_en: "Political Ethics and Responsibility: The Image of a Leader",
      excerpt_uz: "Zamonaviy siyosatda axloqiy me'yorlar va jamoatchilik ishonchi.",
      excerpt_ru: "Этические нормы и общественное доверие в современной политике.",
      excerpt_en: "Ethical standards and public trust in modern politics.",
      body_uz: "Siyosatchining so'zi va amali o'rtasidagi mutanosiblik uning obro'sini belgilaydi. Axloqiy tamoyillar siyosiy barqarorlikning asosi hisoblanadi.",
      body_ru: "Баланс между словами и действиями политика определяет его репутацию. Этические принципы являются основой политической стабильности.",
      body_en: "The balance between a politician's words and actions determines his reputation. Ethical principles are the basis of political stability.",
      author: "Ethics Researcher", video_url: null
    },
    {
      id: "art-17", type: "article", category: "opinion",
      title_uz: "Raqamli iqtisodiyot: Kriptovalyutalar va kelajak",
      title_ru: "Цифровая экономика: криптовалюты и будущее",
      title_en: "Digital Economy: Cryptocurrencies and the Future",
      excerpt_uz: "Blokcheyn texnologiyasining moliya tizimiga ta'siri haqida tahlil.",
      excerpt_ru: "Анализ влияния технологии блокчейн на финансовую систему.",
      excerpt_en: "Analysis of the impact of blockchain technology on the financial system.",
      body_uz: "Markaziy banklar raqamli valyutalarni joriy etish masalasini ko'rib chiqmoqda. Bu an'anaviy moliya tizimini tubdan o'zgartirishi mumkin.",
      body_ru: "Центральные банки рассматривают вопрос введения цифровых валют. Это может радикально изменить традиционную финансовую систему.",
      body_en: "Central banks are considering the issue of introducing digital currencies. This could radically change the traditional financial system.",
      author: "Financial Analyst", video_url: null
    },
    {
      id: "art-18", type: "article", category: "historical",
      title_uz: "Jadidlar harakati: Milliy uyg'onish saboqlari",
      title_ru: "Движение джадидов: уроки национального возрождения",
      title_en: "Jadid Movement: Lessons of National Revival",
      excerpt_uz: "XX asr boshidagi ma'rifatparvarlarning g'oyalari va ularning bugungi kundagi ahamiyati.",
      excerpt_ru: "Идеи просветителей начала XX века и их значение сегодня.",
      excerpt_en: "The ideas of the enlighteners of the early 20th century and their significance today.",
      body_uz: "Jadidlar ta'lim va ma'rifat orqali millatni ozodlikka yetaklashni maqsad qilgan edilar. Ularning g'oyalari bugungi kunda ham o'z dolzarbligini yo'qotmagan.",
      body_ru: "Джадиды стремились привести нацию к свободе через образование и просвещение. Их идеи не потеряли своей актуальности и сегодня.",
      body_en: "The Jadids aimed to lead the nation to freedom through education and enlightenment. Their ideas have not lost their relevance today.",
      author: "Historian", video_url: null
    },
    {
      id: "art-19", type: "article", category: "uzbekistan",
      title_uz: "O'zbekistonning turizm salohiyati: Yangi yo'nalishlar",
      title_ru: "Туристический потенциал Узбекистана: новые направления",
      title_en: "Uzbekistan's Tourism Potential: New Directions",
      excerpt_uz: "Ziyorat turizmi va ekoturizmni rivojlantirish bo'yicha strategik rejalar.",
      excerpt_ru: "Стратегические планы по развитию паломнического и экотуризма.",
      excerpt_en: "Strategic plans for the development of pilgrimage and ecotourism.",
      body_uz: "O'zbekiston turizm sohasini iqtisodiyotning drayveriga aylantirmoqda. Viza rejimining soddalashtirilishi va infratuzilmaning yaxshilanishi sayyohlar oqimini oshirmoqda.",
      body_ru: "Узбекистан превращает сферу туризма в драйвер экономики. Упрощение визового режима и улучшение инфраструктуры увеличивают поток туристов.",
      body_en: "Uzbekistan is turning the tourism sector into a driver of the economy. The simplification of the visa regime and the improvement of infrastructure are increasing the flow of tourists.",
      author: "Tourism Expert", video_url: null
    },
    {
      id: "art-20", type: "article", category: "global",
      title_uz: "Dunyo okeani va ekologiya: Moviy iqtisodiyot",
      title_ru: "Мировой океан и экология: Голубая экономика",
      title_en: "World Ocean and Ecology: Blue Economy",
      excerpt_uz: "Okean resurslaridan barqaror foydalanish va dengiz ekotizimlarini himoya qilish.",
      excerpt_ru: "Устойчивое использование ресурсов океана и защита морских экосистем.",
      excerpt_en: "Sustainable use of ocean resources and protection of marine ecosystems.",
      body_uz: "Moviy iqtisodiyot global barqarorlikning kalitidir. Okeanlarni plastik ifloslanishdan tozalash va baliq zaxiralarini saqlash insoniyat kelajagi uchun muhimdir.",
      body_ru: "Голубая экономика – ключ к глобальной стабильности. Очистка океанов от пластикового загрязнения и сохранение рыбных запасов важны для будущего человечества.",
      body_en: "The blue economy is the key to global stability. Cleaning the oceans of plastic pollution and preserving fish stocks are important for the future of humanity.",
      author: "Marine Biologist", video_url: null
    },
    {
      id: "art-21", type: "article", category: "speech",
      title_uz: "Nutq madaniyati va jamiyat: Muloqot odobi",
      title_ru: "Культура речи и общество: этикет общения",
      title_en: "Speech Culture and Society: Communication Etiquette",
      excerpt_uz: "Ommaviy chiqishlarda tilning o'rni va notiqlik san'ati sirlari.",
      excerpt_ru: "Роль языка в публичных выступлениях и секреты ораторского искусства.",
      excerpt_en: "The role of language in public speaking and the secrets of the art of oratory.",
      body_uz: "Notiqlik san'ati nafaqat chiroyli gapirish, balki tinglovchi qalbini zabt etishdir. Zamonaviy rahbar uchun nutq madaniyati eng muhim ko'nikmalardan biridir.",
      body_ru: "Искусство ораторского мастерства – это не только умение красиво говорить, но и умение покорить сердце слушателя. Для современного лидера культура речи – один из важнейших навыков.",
      body_en: "The art of oratory is not only about speaking beautifully, but also about winning the heart of the listener. For a modern leader, speech culture is one of the most important skills.",
      author: "Linguist", video_url: null
    }
  ];

  for (const item of mockData) {
    insertContent.run(
      item.id, item.type, item.category,
      item.title_uz, item.title_ru, item.title_en,
      item.excerpt_uz, item.excerpt_ru, item.excerpt_en,
      item.body_uz, item.body_ru, item.body_en,
      item.author, item.video_url
    );
  }
}

// Mock Email Notification
function notifyUsers(contentTitle: string) {
  const users = db.prepare("SELECT email FROM users").all() as { email: string }[];
  console.log(`[MOCK EMAIL] Notifying ${users.length} users about new content: ${contentTitle}`);
  users.forEach(u => {
    console.log(`[MOCK EMAIL] Sent to ${u.email}`);
  });
}

app.use(express.json());
app.use(cookieParser());

// Auth Routes

app.post("/api/auth/firebase-sync", (req, res) => {
  const { uid, email, name, picture } = req.body;
  
  if (!uid || !email) {
    return res.status(400).json({ error: "Missing user data" });
  }

  try {
    db.prepare(`
      INSERT INTO users (id, email, name, picture, last_login)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, picture=excluded.picture, last_login=CURRENT_TIMESTAMP
    `).run(uid, email, name || "User", picture || "");

    // Log login activity
    db.prepare("INSERT INTO analytics (user_id, event_type, details) VALUES (?, 'login', 'Firebase User Login')").run(uid);

    res.cookie("user_id", uid, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({ success: true, user: { id: uid, email, name, picture } });
  } catch (error) {
    console.error("Firebase sync error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

app.get("/api/auth/me", (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!user) return res.status(401).json({ error: "User not found" });

  res.json(user);
});

app.post("/api/auth/logout", (req, res) => {
  const userId = req.cookies.user_id;
  if (userId) {
    try {
      db.prepare("INSERT INTO analytics (user_id, event_type, details) VALUES (?, 'logout', 'Firebase User Logout')").run(userId);
    } catch (e) {
      console.error("Failed to log logout event:", e);
    }
  }
  res.clearCookie("user_id", {
    secure: true,
    sameSite: "none",
  });
  res.json({ success: true });
});

// Content Routes
app.get("/api/content", (req, res) => {
  const { type, category } = req.query;
  let query = "SELECT id, type, category, title_uz, title_ru, title_en, excerpt_uz, excerpt_ru, excerpt_en, author, created_at FROM content";
  const params = [];

  if (type || category) {
    query += " WHERE";
    if (type) {
      query += " type = ?";
      params.push(type);
    }
    if (category) {
      if (type) query += " AND";
      query += " category = ?";
      params.push(category);
    }
  }

  const items = db.prepare(query).all(...params);
  res.json(items);
});

app.get("/api/content/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const item = db.prepare("SELECT * FROM content WHERE id = ?").get(req.params.id) as any;

  if (!item) return res.status(404).json({ error: "Not found" });

  // Access control: full content only for logged in users
  if (!userId) {
    // Return only preview
    return res.json({
      ...item,
      body_uz: null,
      body_ru: null,
      body_en: null,
      is_preview: true
    });
  }

  // Track analytics
  db.prepare("INSERT INTO analytics (user_id, event_type, content_id) VALUES (?, ?, ?)")
    .run(userId, "view", item.id);

  res.json({ ...item, is_preview: false });
});

// Analytics Route
app.get("/api/admin/analytics", (req, res) => {
  // In a real app, this would be protected by admin role
  const stats = {
    total_users: (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count,
    total_views: (db.prepare("SELECT COUNT(*) as count FROM analytics").get() as any).count,
    popular_content: db.prepare(`
      SELECT c.title_en, COUNT(a.id) as views
      FROM analytics a
      JOIN content c ON a.content_id = c.id
      GROUP BY a.content_id
      ORDER BY views DESC
      LIMIT 5
    `).all()
  };
  res.json(stats);
});

// Admin Routes
app.post("/api/admin/login", (req, res) => {
  const { code } = req.body;
  // Hardcoded check for server-side security as requested
  if (code === "1980") {
    res.cookie("admin_token", "admin-secret-token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid access code" });
  }
});

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.cookies.admin_token === "admin-secret-token") {
    next();
  } else {
    res.status(403).json({ error: "Unauthorized access" });
  }
};

app.get("/api/admin/users", requireAdmin, (req, res) => {
  try {
    const users = db.prepare("SELECT * FROM users ORDER BY last_login DESC").all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api/admin/activity", requireAdmin, (req, res) => {
  try {
    const activity = db.prepare(`
      SELECT a.*, u.email, u.name, c.title_en as content_title
      FROM analytics a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN content c ON a.content_id = c.id
      ORDER BY a.timestamp DESC
    `).all();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

app.post("/api/admin/message", requireAdmin, (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: "Missing fields" });
  
  try {
    db.prepare("INSERT INTO messages (user_id, message) VALUES (?, ?)").run(userId, message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_token", {
    secure: true,
    sameSite: "none",
  });
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
