import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import * as fs from 'fs';

async function seedMissingOnly() {
  try {
    const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
    console.log("Seeding to Database:", config.firestoreDatabaseId);
    const app = initializeApp(config);
    const db = getFirestore(app, config.firestoreDatabaseId);

    const initialContent = [
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

    console.log("Checking database documents...");
    for (const item of initialContent) {
      const snap = await getDoc(doc(db, "content", item.id));
      if (!snap.exists()) {
        console.log(`- Seeding missing ${item.id} (${item.title_en})...`);
        await setDoc(doc(db, "content", item.id), {
          ...item,
          created_at: serverTimestamp()
        });
      } else {
        console.log(`- Already exists: ${item.id}`);
      }
    }
    console.log("FINISHED CHECKING / SEEDING!");
    process.exit(0);
  } catch (err: any) {
    console.error("SEEDING CRASHED:", err);
    process.exit(1);
  }
}

seedMissingOnly();
