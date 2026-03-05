const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf-8');

const mockDataMatch = content.match(/const mockData = (\[[\s\S]*?\]);\s*for/);
if (!mockDataMatch) {
  console.error("Could not find mockData array");
  process.exit(1);
}

const mockDataStr = mockDataMatch[1];

const newServerTs = `import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

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
const db = getFirestore(firebaseApp);

// Mock data insertion if empty
async function initializeMockData() {
  try {
    const contentSnap = await getDocs(collection(db, "content"));
    if (contentSnap.empty) {
      console.log("Initializing mock data in Firestore...");
      const mockData = ${mockDataStr};
      for (const item of mockData) {
        await setDoc(doc(db, "content", item.id), {
          ...item,
          created_at: serverTimestamp()
        });
      }
      console.log("Mock data initialized.");
    }
  } catch (e) {
    console.error("Failed to initialize mock data:", e);
  }
}
initializeMockData();

app.use(express.json());
app.use(cookieParser());

// Auth Routes
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
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    if (!userSnap.exists()) return res.status(401).json({ error: "User not found" });
    
    const data = userSnap.data();
    res.json({
      ...data,
      last_login: data.last_login?.toDate?.()?.toISOString() || null,
      created_at: data.created_at?.toDate?.()?.toISOString() || null
    });
  } catch (e) {
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
  try {
    const snapshot = await getDocs(collection(db, "content"));
    let items = snapshot.docs.map(d => d.data());
    
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
  } catch (e) {
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

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_token", { secure: true, sameSite: "none" });
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
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
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer();
`;

fs.writeFileSync('server.ts', newServerTs);
console.log("Replaced server.ts successfully");
