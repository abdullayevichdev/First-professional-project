import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as fs from 'fs';

async function seedDirectly() {
  try {
    const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
    console.log("Using Database ID:", config.firestoreDatabaseId);
    const app = initializeApp(config);
    const db = getFirestore(app, config.firestoreDatabaseId);

    const initialContent = [
      {
        id: "art-1",
        type: "article",
        category: "uzbekistan",
        title_uz: "O'zbekistonning yangi iqtisodiy strategiyasi: Tahlil",
        title_ru: "Новая экономическая стратегия Узбекистана: Анализ",
        title_en: "Uzbekistan's New Economic Strategy: An Analysis",
        excerpt_uz: "O'zbekiston iqtisodiyotini modernizatsiya qilish yo'lidagi asosiy qadamlar va kutilayotgan natijalar haqida batafsil tahlil.",
        excerpt_ru: "Подробный анализ основных шагов по модернизации экономики Узбекистана и ожидаемых результатов.",
        excerpt_en: "A detailed analysis of the key steps towards modernizing Uzbekistan's economy and the expected results.",
        body_uz: "O'zbekiston iqtisodiyotini so'nggi yillarda jadal rivojlanish bosqichiga kirdi. Yangi strategiya doirasida xususiylashtirish jarayonlari, xorijiy investitsiyalarni jalb qilish va eksport salohiyatini oshirishga alohida e'tibor qaratilmoqda. Tahlillarga ko'ra, xususiy sektor ulushi yalpi ichki mahsulotda 75 foizga yetishi kutilmoqda. Bu esa ishsizlik darajasini kamaytirish va aholi farovonligini oshirish imkonini beradi.",
        body_ru: "Экономика Узбекистана в последние годы вступила в фазу интенсивного развития. В рамках новой стратегии особое внимание уделяется процессам приватизации, привлечению иностранных инвестиций и повышению экспортного потенциала. Согласно анализу, доля частного сектора в ВВП достигнет 75%. Это позволит существенно снизить уровень безработицы.",
        body_en: "Uzbekistan's economy has entered a phase of rapid development in recent years. Within the framework of the new strategy, special attention is paid to privatization processes, attracting foreign investment and increasing export potential. According to analyses, the private sector's share in GDP is expected to reach 75%, allowing reduction of unemployment and rise of welfare.",
        author: "Tahqiq Tahlilchisi",
        image_url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1200&h=800",
        is_admin_added: true
      },
      {
        id: "art-2",
        type: "article",
        category: "uzbekistan",
        title_uz: "O'zbekiston raqamli suvereniteti va elektron hukumat taraqqiyoti",
        title_ru: "Цифровой суверенитет Узбекистана и развитие электронного правительства",
        title_en: "Uzbekistan's Digital Sovereignty and E-Government Developments",
        excerpt_uz: "Mamlakatning raqamli infratuzilmasini himoya qilish, kiber-xavfsizlik va davlat xizmatlarini raqamlashtirish tahlili.",
        excerpt_ru: "Анализ защиты цифровой инфраструктуры страны, кибербезопасности и цифровизации государственных услуг.",
        excerpt_en: "Protection of national digital infrastructure, cyber security, and an analysis of public services digitization.",
        body_uz: "Raqamli texnologiyalar davlat boshqaruvining samaradorligini oshirishda eng muhim qurol hisoblanadi. O'zbekiston kiber-xavfsizlikni kuchaytirish, milliy ma'lumotlar bazalarini himoyalash va aholiga ko'rsatiladigan elektron xizmatlarni soddalashtirish orqali o'z raqamli suverenitetini mustahkamlamoqda. Birgina My.gov.uz portali orqali ko'rsatilayotgan xizmatlar soni 500 dan oshdi.",
        body_ru: "Цифровые технологии — важнейший инструмент повышения эффективности государственного управления. Узбекистан укрепляет свой цифровой суверенитет, усиливая кибербезопасность, защищая национальные базы данных и упрощая электронные услуги. Количество услуг через My.gov.uz уже превысило 500.",
        body_en: "Digital technologies are the most crucial instrument for improving state management efficiency. Uzbekistan is strengthening its digital sovereignty by reinforcing cybersecurity, protecting national databases, and simplifying electronic service delivery. The number of services provided via My.gov.uz has already exceeded 500.",
        author: "Prof. Dilshodbek Karimov",
        image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200&h=800",
        is_admin_added: true
      },
      {
        id: "art-3",
        type: "article",
        category: "global",
        title_uz: "Markaziy Osiyoning yangi geosiyosiy muvozanati",
        title_ru: "Новый геополитический баланс Центральной Азии",
        title_en: "Central Asia's New Geopolitical Equilibrium",
        excerpt_uz: "Mintaqadagi ko'p tomonlama tashqi siyosat va global kuchlar o'rtasidagi hamkorlik istiqbollari.",
        excerpt_ru: "Многовекторная внешняя политика в регионе и перспективы сотрудничества между мировыми державами.",
        excerpt_en: "Multivector foreign policies in the region and cooperative outlooks amidst global powers.",
        body_uz: "Bugungi kunda Markaziy Osiyo xalqaro munosabatlarning muhim chorrahasiga aylandi. Mintaqa davlatlari o'rtasidagi integratsiya jarayonlari tashqi siyosatda yangi sahifani ochib bermoqda. Ko'p tomonlama balanslangan munosabatlar mintaqa barqarorligining asosi hisoblanadi. Shimol, janub, sharq va g'arb o'rtasidagi multimodal transport koridorlari mintaqa ahamiyatini yanada oshiradi.",
        body_ru: "Центральная Азия сегодня находится на перекрестке международных интересов. Процессы интеграции открывают новые возможности во внешней политике. Сбалансированный многовекторный диалог способствует устойчивости региона со всеми мировыми центрами силы.",
        body_en: "Today, Central Asia has become an important junction in international relations. Integration processes between the region's nations are opening a new chapter in foreign policy. A multivector balanced relationship serves as the core foundation for regional stability with global trade routes.",
        author: "Farhod Ergashev",
        image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200&h=800",
        is_admin_added: true
      },
      {
        id: "art-4",
        type: "article",
        category: "speech",
        title_uz: "Millat taqdirini o'zgartirgan nutqlar diskurs-tahlili",
        title_ru: "Дискурс-анализ речей, изменивших судьбу наций",
        title_en: "Speeches That Shaped Nations: A Discourse Analysis",
        excerpt_uz: "Tarixiy va zamonaviy chiqishlar ortidagi ritorik uslublar, manipulyativ texnikalar va strategiyalar tahlili.",
        excerpt_ru: "Анализ риторических методов, манипулятивных приемов и стратегий исторических и современных выступлений.",
        excerpt_en: "Analysis of rhetorical devices, persuasive techniques, and communication strategies behind historic and modern speeches.",
        body_uz: "Nutq — bu shunchaki so'zlar yig'indisi emas, u siyosiy iroda va g'oyaviy quroldir. Mazkur tahlilda davlat rahbarlarining muhim nutqlaridagi yashirin ma'nolar, ritorik savollar va tinglovchini ishontirish uslublari batafsil tekshiriladi. Siyosiy diskurs o'zgarishi natijasida ijtimoiy ongda yuz beradigan transformatsiyalar tadqiq etiladi.",
        body_ru: "Речь — это не просто набор слов, а инструмент политической воли. В данном анализе подробно исследуются скрытые смыслы, риторические вопросы и способы убеждения аудитории лидерами государств. Раскрываются лингвистические приемы формирования общественного мнения.",
        body_en: "A speech is not merely a collection of words; it is a political will and an ideological instrument. In this research, hidden meanings, rhetorical questions, and audience persuasion methodologies of key public speeches are thoroughly examined.",
        author: "Dildora Tojiyeva",
        image_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200&h=800",
        is_admin_added: true
      },
      {
        id: "art-5",
        type: "article",
        category: "historical",
        title_uz: "Buyuk Ipak yo'li merosi: Siyosiy va madaniy diplomatiya darslari",
        title_ru: "Наследие Великого шелкового пути: Уроки политической и культурной дипломатии",
        title_en: "The Silk Road Legacy: Lessons in Political & Cultural Diplomacy",
        excerpt_uz: "Tarixiy savdo aloqalarining zamonaviy geo-iqtisodiy tashabbuslar va mintaqaviy hamkorlikka ta'siri.",
        excerpt_ru: "Влияние исторических торговых связей на современные геоэкономические инициативы и региональное сотрудничество.",
        excerpt_en: "The impact of historic trade routes on modern geo-economic initiatives and regional collaboration.",
        body_uz: "Buyuk Ipak yo'li faqatgina savdo yo'li emas, balki g'oyalar, dinlar va madaniy diplomatik aloqalar almashinuv o'chog'i edi. Bugungi kunda ushbu meros yangi iqtisodiy koridorlar doirasida qayta tiklanmoqda. Tarixiy aloqalar, o'zaro ishonch va do'stlik madaniyati mintaqaviy tinchlikning poydevori sifatida xizmat qiladi.",
        body_ru: "Великий шелковый путь был не только торговым маршрутом, но и колыбелью обмена идеями, религиями и культурами. Сегодня это наследие возрождается в рамках новых экономических коридоров. Уроки прошлого помогают выстраивать долгосрочное взаимовыгодное партнерство.",
        body_en: "The Great Silk Road was not only a trading route but a crucible for ideas, cultures, and diplomatic exchanges. Today, this legacy is revived in modern economic corridors. Historical interactions teach the values of mutual trust and cultural understanding.",
        author: "Tarix fanlari doktori Jasur Alimov",
        image_url: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1200&h=800",
        is_admin_added: true
      },
      {
        id: "art-6",
        type: "article",
        category: "opinion",
        title_uz: "Globallashuv va milliy o'zlikni anglash masalalari",
        title_ru: "Глобализация и вопросы национального самосознания",
        title_en: "Globalization and National Identity Dynamics",
        excerpt_uz: "Zamonaviy madaniyatlar to'qnashuvi davrida milliy urf-odatlar va qadriyatlarni asrab qolish haqida mustaqil nuqtai nazar.",
        excerpt_ru: "Независимый взгляд на сохранение национальных традиций и ценностей в эпоху столкновения современных культур.",
        excerpt_en: "An independent opinion on conserving national traditions, linguistic features, and values during modern cultural friction.",
        body_uz: "Globallashuv jarayonlari bizga cheksiz ma'lumot va imkoniyatlar berdi, lekin shu bilan birga milliy o'zlikni yo'qotish xavfini ham tug'dirdi. Milliy til, madaniyat va mafkurani tarbiyalash va yoshlar ongiga to'g'ri singdirish - kelajak asr barqarorligi uchun muhim vazifadir.",
        body_ru: "Процессы глобализации принесли бесконечный поток информации, но также создали риски для культурной уникальности. Национальные ценности, родной язык и историческая память служат главными щитами общества.",
        body_en: "Globalizing streams open unlimited horizons, yet trigger risks of identity erosion. Safeguarding our national heritage, mother tongue, and fundamental values constitutes the supreme goal for successive generations.",
        author: "Nodira Mansurova",
        image_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200&h=800",
        is_admin_added: true
      },
      {
        id: "art-7",
        type: "article",
        category: "speech",
        title_uz: "Siyosiy ritorika va xalqaro maydondagi imij tahlili",
        title_ru: "Политическая риторика и анализ международного имиджа",
        title_en: "Political Rhetoric and International Image Analysis",
        excerpt_uz: "Xalqaro sammitlarda davlat rahbarlari nutqlarining lingvistik tahlili va uning milliy imijga ta'siri.",
        excerpt_ru: "Лингвистический анализ ключевых речей на международных саммитах и его влияние на суверенный имидж.",
        excerpt_en: "Linguistic and semantic breakdown of principal speeches at international summits and their influence on country image.",
        body_uz: "Sammitlardagi har bir so'z, metafora va imo-ishoralar puxta rejalashtiriladi. Tashqi siyosatda samarali ritorika millatning ijobiy brendini shakllantirishda bevosita rol o'ynaydi. Nutqlarda pragmatik yondashuv o'ta muhim ahamiyatga ega.",
        body_ru: "Каждое слово, метафора и жест на саммитах тщательно планируются. Эффективная внешнеполитическая риторика напрямую влияет на инвестиционную привлекательность и доверие со стороны глобального сообщества.",
        body_en: "Every metaphor, word choice, and gesture at high-level summits is thoroughly framed. Expressive and clear diplomatic rhetoric plays an immediate role in defining a positive state reputation and soft power globally.",
        author: "Dildora Tojiyeva",
        image_url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=1200&h=800",
        is_admin_added: true
      },
      {
        id: "art-8",
        type: "article",
        category: "global",
        title_uz: "Markaziy Osiyoda suv diplomatiyasi va ekologik hamkorlik",
        title_ru: "Водная дипломатия и экологическое сотрудничество в Центральной Азии",
        title_en: "Water Diplomacy and Ecological Cooperation in Central Asia",
        excerpt_uz: "Amudaryo va Sirdaryo havzalarida suv resurslaridan oqilona foydalanish bo'yicha hamkorlik istiqbollari tahlili.",
        excerpt_ru: "Анализ перспектив совместного использования трансграничных водных ресурсов Амударьи и Сырдарьи.",
        excerpt_en: "An operational focus on water distribution and green diplomacy in Amu Darya and Syr Darya basins.",
        body_uz: "Suv resurslari tansqiligi Markaziy Osiyo uchun eng dolzarb ekologik va geosiyosiy masalalardan biridir. Birgalikda integratsiyalashgan suv menejmenti va yashil energetika loyihalarini tatbiq etish mintaqa davlatlarining mustahkam birdamligini talab qiladi.",
        body_ru: "Дефицит пресной воды становится ключевым вызовом для нашего региона. Интегрированное управление ресурсами и внедрение водосберегающих технологий требуют коллективной стратегии и экологической солидарности.",
        body_en: "Freshwater deficit constitutes a crucial ecological and geopolitical challenge for Central Asia. Transboundary integrated water management and collaborative green projects are foundational for long-term regional security.",
        author: "Farhod Ergashev",
        image_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1200&h=800",
        is_admin_added: true
      },
      {
        id: "art-9",
        type: "article",
        category: "uzbekistan",
        title_uz: "Davlat boshqaruvida sun'iy intellekt: Istiqbollar va tavakkalchiliklar",
        title_ru: "Искусственный интеллект в госуправлении: Перспективы и риски",
        title_en: "AI in Public Governance: Prospects and Systemic Risks",
        excerpt_uz: "O'zbekiston davlat xizmatlarini raqamlashtirishda sun'iy intellekt modellarini tatbiq etish bo'yicha tahliliy tahrir.",
        excerpt_ru: "Аналитическое обозрение внедрения искусственного интеллекта в госслужбы и системы принятия решений.",
        excerpt_en: "A strategic overview of machine learning and large language models integration in public utility and decision workflows.",
        body_uz: "Sun'iy intellekt davlat xizmatlari sifatini oshiradi, korrupsiyani cheklaydi va tezkor qarorlar qabul qilishga ko'maklashadi. Ammo ma'lumotlar xavfsizligi, kibertahdidlar va texnik xatolardan himoyalanish eng muhim shartlardan qolmoqda.",
        body_ru: "Алгоритмы ИИ способны оптимизировать госуслуги и искоренять коррупционные риски. При этом на передний план выходят вопросы защиты персональных данных граждан и построение устойчивых систем кибербезопасности.",
        body_en: "AI and automation streamline administrative services and mitigate human bias. However, establishing comprehensive cyberguards, strict ethical boundaries, and privacy protection laws remains highly mandatory.",
        author: "Prof. Dilshodbek Karimov",
        image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200&h=800",
        is_admin_added: true
      },
      {
        id: "art-10",
        type: "article",
        category: "opinion",
        title_uz: "OAV bevosita jamoatchilik nazorati va ochiqlik kafolati sifatida",
        title_ru: "СМИ как инструмент общественного контроля и гарантия открытости",
        title_en: "Media as a Direct Mirror of Public Control and Transparency",
        excerpt_uz: "OAVning jamiyat hayotidagi o'rni, so'z erkinligi, muammolarni xolis yoritish va davlat organlari mas'uliyati.",
        excerpt_ru: "Роль прессы в современном обществе, свобода выражения мнений и подотчетность государственных органов.",
        excerpt_en: "Exploring journalism's duty, freedom of press, objective problem reporting, and executive responsiveness.",
        body_uz: "Erkin va mustaqil jamoatchilik nazorati rivojlangan davlat qurishning fundamental ustunidir. OAV jamiyatdagi tizimli muammolarni jasorat bilan ko'tarib chiqishi islohotlarning barqaror va samarali bo'lishiga zamin yaratadi.",
        body_ru: "Независимая пресса — фундамент демократического государства. Освещение острых социальных и экономических вопросов средствами массовой информации помогает вовремя реагировать на запросы граждан.",
        body_en: "A free and robust public media landscape defines a resilient democratic society. Exposing systematic errors and citizen complaints through media channels serves as a vital feedback loop for structural modernizations.",
        author: "Nodira Mansurova",
        image_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200&h=800",
        is_admin_added: true
      }
    ];

    console.log("Seeding documents inside database...");
    for (const item of initialContent) {
      console.log(`- Writing ${item.id}...`);
      await setDoc(doc(db, "content", item.id), {
        ...item,
        created_at: serverTimestamp()
      }, { merge: true });
    }
    console.log("DIRECT SEEDING COMPLETE!");
  } catch (err: any) {
    console.error("SEEDING CRASHED:", err);
  }
}

seedDirectly();
