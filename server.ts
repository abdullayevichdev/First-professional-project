import express from "express";
import { createServer as createViteServer } from "vite";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = 3000;

// Initialize SQLite Database
const db = new Database('data.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    picture TEXT,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS content (
    id TEXT PRIMARY KEY,
    type TEXT,
    category TEXT,
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

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    event_type TEXT,
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
`);

// Mock data insertion if empty
const contentCount = db.prepare('SELECT COUNT(*) as count FROM content').get() as { count: number };
if (contentCount.count === 0) {
  console.log("Initializing mock data in SQLite...");
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
    }
  ];

  const insertContent = db.prepare(`
    INSERT INTO content (id, type, category, title_uz, title_ru, title_en, excerpt_uz, excerpt_ru, excerpt_en, body_uz, body_ru, body_en, author, video_url)
    VALUES (@id, @type, @category, @title_uz, @title_ru, @title_en, @excerpt_uz, @excerpt_ru, @excerpt_en, @body_uz, @body_ru, @body_en, @author, @video_url)
  `);

  const insertMany = db.transaction((data) => {
    for (const item of data) insertContent.run(item);
  });

  insertMany(mockData);
  console.log("Mock data initialized.");
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
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
    
    if (!user) {
      db.prepare(`
        INSERT INTO users (id, email, name, picture, last_login)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(uid, email, name || "User", picture || "");
    } else {
      db.prepare(`
        UPDATE users SET name = ?, picture = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?
      `).run(name || "User", picture || "", uid);
    }

    db.prepare(`
      INSERT INTO analytics (user_id, event_type, details)
      VALUES (?, 'login', 'User Login')
    `).run(uid);

    res.cookie("user_id", uid, {
      httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, user: { id: uid, email, name, picture } });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

app.get("/api/auth/me", (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  const userId = req.cookies.user_id;
  if (userId) {
    try {
      db.prepare(`
        INSERT INTO analytics (user_id, event_type, details)
        VALUES (?, 'logout', 'User Logout')
      `).run(userId);
    } catch (e) {}
  }
  res.clearCookie("user_id", { secure: true, sameSite: "none" });
  res.json({ success: true });
});

// Content Routes
app.get("/api/content", (req, res) => {
  const { type, category } = req.query;
  try {
    let query = 'SELECT id, type, category, title_uz, title_ru, title_en, excerpt_uz, excerpt_ru, excerpt_en, author, video_url, created_at FROM content WHERE 1=1';
    const params: any[] = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

app.get("/api/content/:id", (req, res) => {
  const userId = req.cookies.user_id;
  try {
    const item = db.prepare('SELECT * FROM content WHERE id = ?').get(req.params.id) as any;
    if (!item) return res.status(404).json({ error: "Not found" });

    if (!userId) {
      return res.json({ 
        ...item, 
        body_uz: null, body_ru: null, body_en: null, 
        is_preview: true
      });
    }

    db.prepare(`
      INSERT INTO analytics (user_id, event_type, content_id)
      VALUES (?, 'view', ?)
    `).run(userId, item.id);

    res.json({ 
      ...item, 
      is_preview: false
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// Analytics Route
app.get("/api/admin/analytics", (req, res) => {
  try {
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const totalViews = (db.prepare('SELECT COUNT(*) as count FROM analytics').get() as any).count;
    
    const popularContent = db.prepare(`
      SELECT c.title_en, COUNT(a.id) as views
      FROM analytics a
      JOIN content c ON a.content_id = c.id
      WHERE a.content_id IS NOT NULL
      GROUP BY a.content_id
      ORDER BY views DESC
      LIMIT 5
    `).all();
      
    res.json({
      total_users: totalUsers,
      total_views: totalViews,
      popular_content: popularContent
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Admin Routes
app.post("/api/admin/login", (req, res) => {
  const { code } = req.body;
  if (code === "1980") {
    res.cookie("admin_token", "admin-secret-token", {
      httpOnly: true, secure: true, sameSite: "none", maxAge: 24 * 60 * 60 * 1000
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
    const users = db.prepare('SELECT * FROM users ORDER BY last_login DESC').all();
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
    db.prepare(`
      INSERT INTO messages (user_id, message)
      VALUES (?, ?)
    `).run(userId, message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_token", { secure: true, sameSite: "none" });
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true, 
        hmr: false,
        watch: null
      },
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
