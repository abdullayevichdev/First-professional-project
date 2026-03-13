import express from "express";
import { createServer as createViteServer } from "vite";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  deleteDoc,
  serverTimestamp,
  initializeFirestore,
  query,
  where
} from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = 3000;

// Firebase setup
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCRI_uFBdXc20slLGWbm0K53GBT6mfgODE",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "tahqiq-87f79.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "tahqiq-87f79",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "tahqiq-87f79.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "415984827866",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:415984827866:web:08e196f183a0541d4894e3",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QX1GSZZ5WS"
};

const firebaseApp = initializeApp(firebaseConfig);
// Use initializeFirestore with long polling to prevent hangs in Node.js environments
const db = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
});

// Mock data insertion if empty
async function initializeMockData() {
  console.log("Checking Firestore for existing content...");
  try {
    // Set a timeout for the initial check to avoid hanging the whole startup
    const checkPromise = getDocs(collection(db, "content"));
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Firestore check timed out")), 15000)
    );

    const contentSnap = await Promise.race([checkPromise, timeoutPromise]) as any;
    
    if (contentSnap.empty) {
      console.log("Firestore is empty. Initializing mock data...");
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
      for (const item of mockData) {
        await setDoc(doc(db, "content", item.id), {
          ...item,
          created_at: serverTimestamp()
        });
      }
      console.log("Mock data initialized.");
    }
  } catch (e: any) {
    if (e.message?.includes("PERMISSION_DENIED") || e.message?.includes("not been used")) {
      console.error("CRITICAL: Cloud Firestore API is disabled. Please enable it at: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=tahqiq-87f79");
    } else {
      console.error("Failed to initialize mock data:", e);
    }
  }
}
initializeMockData();

app.use(express.json());
app.use(cookieParser());

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const { firstName, lastName, birthDate, phone, picture } = req.body;
  
  if (!firstName || !lastName || !birthDate || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if user exists by phone
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    
    let userId;
    if (!querySnapshot.empty) {
      // User exists, update and login
      userId = querySnapshot.docs[0].id;
      await setDoc(doc(db, "users", userId), {
        firstName, lastName, birthDate, phone, picture,
        name: `${firstName} ${lastName}`,
        last_login: serverTimestamp()
      }, { merge: true });
    } else {
      // New user
      const newUserRef = doc(collection(db, "users"));
      userId = newUserRef.id;
      await setDoc(newUserRef, {
        id: userId, firstName, lastName, birthDate, phone, picture,
        name: `${firstName} ${lastName}`,
        last_login: serverTimestamp(), created_at: serverTimestamp()
      });
    }

    res.cookie("user_id", userId, {
      httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, user_id: userId });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register" });
  }
});

app.post("/api/auth/firebase-sync", async (req, res) => {
  const { uid, email, name, picture } = req.body;
  
  if (!uid || !email) {
    return res.status(400).json({ error: "Missing user data" });
  }

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        id: uid, email, name: name || "User", picture: picture || "",
        last_login: serverTimestamp(), created_at: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        name: name || "User", picture: picture || "", last_login: serverTimestamp()
      }, { merge: true });
    }

    await addDoc(collection(db, "analytics"), {
      user_id: uid, event_type: 'login', details: 'Firebase User Login', timestamp: serverTimestamp()
    });

    res.cookie("user_id", uid, {
      httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, user: { id: uid, email, name, picture } });
  } catch (error) {
    console.error("Firebase sync error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  const userId = req.cookies.user_id;
  console.log(`GET /api/auth/me requested. Cookie user_id: ${userId}`);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    if (!userSnap.exists()) {
      console.log(`User ${userId} not found in Firestore`);
      return res.status(401).json({ error: "User not found" });
    }
    
    const data = userSnap.data();
    console.log(`User ${userId} found in Firestore`);
    res.json({
      ...data,
      last_login: data.last_login?.toDate?.()?.toISOString() || null,
      created_at: data.created_at?.toDate?.()?.toISOString() || null
    });
  } catch (e) {
    console.error("Error in /api/auth/me:", e);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  const userId = req.cookies.user_id;
  if (userId) {
    try {
      await addDoc(collection(db, "analytics"), {
        user_id: userId, event_type: 'logout', details: 'Firebase User Logout', timestamp: serverTimestamp()
      });
    } catch (e) {}
  }
  res.clearCookie("user_id", { secure: true, sameSite: "none" });
  res.json({ success: true });
});

// Content Routes
app.get("/api/content", async (req, res) => {
  const { type, category } = req.query;
  console.log(`GET /api/content requested. Type: ${type}, Category: ${category}`);
  try {
    const snapshot = await getDocs(collection(db, "content"));
    console.log(`Firestore returned ${snapshot.size} documents`);
    let items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    
    if (type) items = items.filter(i => i.type === type);
    if (category) items = items.filter(i => i.category === category);
    
    items = items.map(i => {
      const { body_uz, body_ru, body_en, ...rest } = i as any;
      return {
        ...rest,
        created_at: rest.created_at?.toDate?.()?.toISOString() || null
      };
    });
    
    res.json(items);
  } catch (e: any) {
    console.error("Error in /api/content:", e);
    if (e.message?.includes("PERMISSION_DENIED")) {
      return res.status(503).json({ error: "Cloud Firestore API is disabled. Please enable it in Google Cloud Console." });
    }
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

app.get("/api/content/:id", async (req, res) => {
  const userId = req.cookies.user_id;
  try {
    const itemSnap = await getDoc(doc(db, "content", req.params.id));
    if (!itemSnap.exists()) return res.status(404).json({ error: "Not found" });
    const item = itemSnap.data();

    if (!userId) {
      return res.json({ 
        ...item, 
        body_uz: null, body_ru: null, body_en: null, 
        is_preview: true,
        created_at: item.created_at?.toDate?.()?.toISOString() || null
      });
    }

    await addDoc(collection(db, "analytics"), {
      user_id: userId, event_type: "view", content_id: item.id, timestamp: serverTimestamp()
    });

    res.json({ 
      ...item, 
      is_preview: false,
      created_at: item.created_at?.toDate?.()?.toISOString() || null
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// Analytics Route
app.get("/api/admin/analytics", async (req, res) => {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const analyticsSnap = await getDocs(collection(db, "analytics"));
    const contentSnap = await getDocs(collection(db, "content"));
    
    const contentMap = new Map();
    contentSnap.docs.forEach(d => contentMap.set(d.id, d.data().title_en));
    
    const viewsCount: Record<string, number> = {};
    analyticsSnap.docs.forEach(d => {
      const data = d.data();
      if (data.content_id) {
        viewsCount[data.content_id] = (viewsCount[data.content_id] || 0) + 1;
      }
    });
    
    const popular_content = Object.entries(viewsCount)
      .map(([id, views]) => ({ title_en: contentMap.get(id) || id, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
      
    res.json({
      total_users: usersSnap.size,
      total_views: analyticsSnap.size,
      popular_content
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
      httpOnly: true, secure: true, sameSite: "none"
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

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(d => {
      const data = d.data();
      return {
        ...data,
        last_login: data.last_login?.toDate?.()?.toISOString() || null,
        created_at: data.created_at?.toDate?.()?.toISOString() || null
      };
    }).sort((a, b) => new Date(b.last_login || 0).getTime() - new Date(a.last_login || 0).getTime());
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api/admin/activity", requireAdmin, async (req, res) => {
  try {
    const analyticsSnap = await getDocs(collection(db, "analytics"));
    const usersSnap = await getDocs(collection(db, "users"));
    const contentSnap = await getDocs(collection(db, "content"));
    
    const usersMap = new Map();
    usersSnap.docs.forEach(d => usersMap.set(d.id, d.data()));
    
    const contentMap = new Map();
    contentSnap.docs.forEach(d => contentMap.set(d.id, d.data()));
    
    const activity = analyticsSnap.docs.map(d => {
      const data = d.data();
      const user = usersMap.get(data.user_id) || {};
      const content = contentMap.get(data.content_id) || {};
      return {
        ...data,
        id: d.id,
        email: user.email,
        name: user.name,
        content_title: content.title_en,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || null
      };
    }).sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

app.post("/api/admin/message", requireAdmin, async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: "Missing fields" });
  
  try {
    await addDoc(collection(db, "messages"), {
      user_id: userId, message, is_read: false, created_at: serverTimestamp()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.post("/api/admin/content", requireAdmin, async (req, res) => {
  const { type, category, title_uz, title_ru, title_en, excerpt_uz, excerpt_ru, excerpt_en, body_uz, body_ru, body_en, author, video_url } = req.body;
  
  try {
    const contentRef = await addDoc(collection(db, "content"), {
      type, category, title_uz, title_ru, title_en, 
      excerpt_uz, excerpt_ru, excerpt_en, 
      body_uz, body_ru, body_en, 
      author, video_url, 
      is_admin_added: true,
      created_at: serverTimestamp()
    });

    // Create notifications for all users
    const usersSnap = await getDocs(collection(db, "users"));
    const notificationMessage = `Saytga yangi Yangiliklar qo'shildi Ko'rishni hohlaysizmi yoki hali ko'rmadingizmi?`;
    
    const notificationPromises = usersSnap.docs.map(userDoc => {
      return addDoc(collection(db, "notifications"), {
        userId: userDoc.id,
        message: notificationMessage,
        contentId: contentRef.id,
        isSeen: false,
        timestamp: serverTimestamp()
      });
    });

    await Promise.all(notificationPromises);

    res.json({ success: true, id: contentRef.id });
  } catch (error) {
    console.error("Failed to add content:", error);
    res.status(500).json({ error: "Failed to add content" });
  }
});

app.delete("/api/admin/content/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteDoc(doc(db, "content", id));
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete content:", error);
    res.status(500).json({ error: "Failed to delete content" });
  }
});

app.get("/api/notifications", async (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("isSeen", "==", false));
    const snap = await getDocs(q);
    const notifications = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().timestamp?.toDate?.()?.toISOString() || null
    }));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.post("/api/notifications/:id/dismiss", async (req, res) => {
  const { id } = req.params;
  try {
    await setDoc(doc(db, "notifications", id), { isSeen: true }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to dismiss notification" });
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

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // One-time cleanup for "etc" content
    try {
      const titles = ["title_uz", "title_ru", "title_en"];
      for (const titleField of titles) {
        const q = query(collection(db, "content"), where(titleField, "==", "etc"));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await deleteDoc(doc(db, "content", d.id));
          console.log(`Deleted "etc" content (${titleField}): ${d.id}`);
        }
      }
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  });
}

if (process.env.NODE_ENV !== "production") {
  startServer();
}

export default app;
