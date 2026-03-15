import express from "express";
import { createServer as createViteServer } from "vite";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
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
  updateDoc,
  serverTimestamp,
  initializeFirestore,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = 3000;
const JWT_SECRET = process.env.VITE_JWT_SECRET || "tahqiq-super-secret-key-2026";

// Firebase setup
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCRI_uFBdXc20slLGWbm0K53GBT6mfgODE",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "tahqiq-87f79.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "tahqiq-87f79",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "415984827866",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:415984827866:web:08e196f183a0541d4894e3",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QX1GSZZ5WS"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Helper for JWT
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
};

const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.userId = decoded.userId;
    next();
  });
};

async function logActivity(userId: string, email: string, name: string, eventType: string, contentId?: string, details?: string, contentTitle?: string) {
  try {
    await addDoc(collection(db, "activity"), {
      user_id: userId,
      email: email || "Noma'lum",
      name: name || "Foydalanuvchi",
      event_type: eventType,
      content_id: contentId || null,
      details: details || "",
      content_title: contentTitle || "",
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error("Failed to log activity", e);
  }
}

app.post("/api/activity/log", async (req: any, res: any) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    
    try {
      const userDoc = await getDoc(doc(db, "users", decoded.userId));
      if (!userDoc.exists()) return res.status(404).json({ error: "User not found" });
      
      const userData = userDoc.data();
      const { event_type, content_id, details, content_title } = req.body;
      
      await logActivity(
        decoded.userId, 
        userData.username || userData.email, 
        userData.name, 
        event_type, 
        content_id, 
        details, 
        content_title
      );
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to log activity" });
    }
  });
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const { firstName, lastName, birthDate, phone, username, password, picture } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return res.status(400).json({ error: "Login band, boshqa login tanlang" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserRef = doc(collection(db, "users"));
    const userId = newUserRef.id;

    console.log("Creating new user with ID:", userId);

    const userData = {
      id: userId,
      firstName: firstName || "",
      lastName: lastName || "",
      name: (firstName && lastName) ? `${firstName} ${lastName}` : username,
      birthDate: birthDate || "",
      phone: phone || "",
      username,
      password: hashedPassword,
      picture: picture || "",
      role: "user",
      status: "active",
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    console.log("Attempting to save user data to Firestore...");
    await setDoc(newUserRef, userData);
    console.log("User document created successfully");

    await logActivity(userId, username, userData.name, "register", undefined, "Ro'yxatdan o'tdi");

    const token = generateToken(userId);
    res.cookie("auth_token", token, {
      httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
    });

    console.log("Registration successful for user:", username);
    res.json({ success: true, user: { id: userId, username, name: userData.name, picture: userData.picture } });
  } catch (error: any) {
    console.error("Registration error details:", error);
    res.status(500).json({ error: `Failed to register: ${error.message || 'Unknown error'}` });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt for user:", username);

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("Login failed: User not found");
      return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.status === "suspended") {
      console.log("Login failed: Account suspended");
      return res.status(403).json({ error: "Your account has been suspended" });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      console.log("Login failed: Invalid password");
      return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
    }

    await updateDoc(doc(db, "users", userDoc.id), {
      last_login: new Date().toISOString()
    });

    await logActivity(userDoc.id, userData.username || userData.email, userData.name, "login", undefined, "Tizimga kirdi");

    const token = generateToken(userDoc.id);
    res.cookie("auth_token", token, {
      httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ 
      success: true, 
      user: { 
        id: userDoc.id, 
        username: userData.username, 
        name: userData.name, 
        picture: userData.picture,
        role: userData.role 
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    const userSnap = await getDoc(doc(db, "users", req.userId));
    if (!userSnap.exists()) return res.status(404).json({ error: "User not found" });
    
    const data = userSnap.data();
    const { password, ...safeData } = data;
    res.json({
      ...safeData,
      last_login: data.last_login?.toDate?.()?.toISOString() || null,
      created_at: data.created_at?.toDate?.()?.toISOString() || null
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  const token = req.cookies.auth_token;
  if (token) {
    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (!err && decoded.userId) {
        try {
          const userDoc = await getDoc(doc(db, "users", decoded.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            await logActivity(decoded.userId, userData.username || userData.email, userData.name, "logout", undefined, "Tizimdan chiqdi");
          }
        } catch (e) {}
      }
    });
  }
  res.clearCookie("auth_token", { secure: true, sameSite: "none" });
  res.json({ success: true });
});

app.post("/api/user/save-article", authenticateToken, async (req: any, res) => {
  const { articleId } = req.body;
  const userId = req.userId;
  
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const savedArticles = userData.saved_articles || [];
      const index = savedArticles.indexOf(articleId);
      
      if (index > -1) {
        savedArticles.splice(index, 1);
      } else {
        savedArticles.push(articleId);
      }
      
      await updateDoc(userRef, { saved_articles: savedArticles });
      res.json({ success: true, saved_articles: savedArticles });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to save article" });
  }
});

app.get("/api/user/stream", authenticateToken, (req: any, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (type: string, data: any) => {
    res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const userId = req.userId;

  // Listen for notifications
  const q = query(collection(db, "notifications"), where("userId", "==", userId));
  const unsubNotifications = onSnapshot(q, (snap) => {
    const notifications = snap.docs.map(d => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || null
      };
    });
    // Sort by created_at descending
    notifications.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    sendEvent("notifications", notifications);
  }, (err) => console.error("SSE User Notifications error:", err));

  req.on("close", () => {
    unsubNotifications();
  });
});

app.post("/api/notifications/:id/dismiss", authenticateToken, async (req: any, res) => {
  try {
    const notifRef = doc(db, "notifications", req.params.id);
    const notifSnap = await getDoc(notifRef);
    
    if (!notifSnap.exists() || notifSnap.data().userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    await deleteDoc(notifRef);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to dismiss notification" });
  }
});

app.get("/api/user/saved-articles", authenticateToken, async (req: any, res) => {
  const userId = req.userId;
  
  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    
    if (userSnap.exists()) {
      const savedIds = userSnap.data().saved_articles || [];
      if (savedIds.length === 0) return res.json([]);
      
      const contentSnap = await getDocs(collection(db, "content"));
      const allContent = contentSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const savedArticles = allContent.filter(i => savedIds.includes(i.id)).map(i => ({
        ...i,
        created_at: (i as any).created_at?.toDate?.()?.toISOString() || null
      }));
      
      res.json(savedArticles);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch saved articles" });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/user/update-picture", authenticateToken, upload.single('picture'), async (req: any, res: any) => {
  const userId = req.userId;
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    await updateDoc(doc(db, "users", userId), {
      picture: base64Image
    });

    res.json({ success: true, picture: base64Image });
  } catch (e: any) {
    console.error("Failed to update picture. Full error:", JSON.stringify(e, Object.getOwnPropertyNames(e)));
    res.status(500).json({ error: "Failed to update picture", details: e.message });
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

// Real-time SSE endpoint for Admin Panel
app.get("/api/admin/stream", requireAdmin, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (type: string, data: any) => {
    res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Listeners
  const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
    const users = snap.docs.map(d => {
      const data = d.data();
      const { password, ...safeData } = data;
      return {
        id: d.id,
        ...safeData,
        last_login: data.last_login?.toDate?.()?.toISOString() || null,
        created_at: data.created_at?.toDate?.()?.toISOString() || null
      };
    });
    sendEvent("users", users);
  }, (err) => console.error("SSE Users error:", err));

  const unsubActivity = onSnapshot(collection(db, "activity"), (snap) => {
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    sendEvent("activity", logs);
  }, (err) => console.error("SSE Activity error:", err));

  const unsubContent = onSnapshot(collection(db, "content"), (snap) => {
    const items = snap.docs.map(d => {
      const i = d.data() as any;
      return {
        id: d.id,
        ...i,
        created_at: i.created_at?.toDate?.()?.toISOString() || null
      };
    });
    sendEvent("content", items);
  }, (err) => console.error("SSE Content error:", err));

  const unsubNewsletter = onSnapshot(collection(db, "newsletter"), (snap) => {
    const subs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    sendEvent("newsletter", subs);
  }, (err) => console.error("SSE Newsletter error:", err));

  const unsubMessages = onSnapshot(collection(db, "messages"), (snap) => {
    const messages = snap.docs.map(d => ({ 
      id: d.id, 
      ...d.data(),
      sent_at: (d.data() as any).sent_at?.toDate?.()?.toISOString() || null
    }));
    sendEvent("messages", messages);
  }, (err) => console.error("SSE Messages error:", err));

  req.on("close", () => {
    unsubUsers();
    unsubActivity();
    unsubContent();
    unsubNewsletter();
    unsubMessages();
  });
});

// Admin User Management
app.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(d => {
      const data = d.data();
      const { password, ...safeData } = data;
      return {
        ...safeData,
        last_login: data.last_login?.toDate?.()?.toISOString() || null,
        created_at: data.created_at?.toDate?.()?.toISOString() || null
      };
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    await updateDoc(doc(db, "users", req.params.id), req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    await deleteDoc(doc(db, "users", req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.get("/api/admin/activity", requireAdmin, async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "activity"));
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

app.post("/api/admin/message", requireAdmin, async (req, res) => {
  const { userId, message, userName } = req.body;
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      message,
      type: "admin_message",
      read: false,
      created_at: serverTimestamp()
    });
    
    // Store in global messages collection for admin view
    await addDoc(collection(db, "messages"), {
      to: userId,
      to_name: userName || "Foydalanuvchi",
      message,
      sent_at: serverTimestamp()
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.get("/api/admin/messages", requireAdmin, async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "messages"));
    const messages = snap.docs.map(d => ({ 
      id: d.id, 
      ...d.data(),
      sent_at: (d.data() as any).sent_at?.toDate?.()?.toISOString() || null
    }));
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.post("/api/admin/content", requireAdmin, async (req, res) => {
  try {
    const contentData = {
      ...req.body,
      is_admin_added: true,
      created_at: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "content"), contentData);
    
    // Notify all users about new content
    const usersSnap = await getDocs(collection(db, "users"));
    const notifications = usersSnap.docs.map(userDoc => ({
      userId: userDoc.id,
      message: `Yangi maqola: ${req.body.title_uz}`,
      contentId: docRef.id,
      type: "new_content",
      read: false,
      created_at: serverTimestamp()
    }));
    
    for (const n of notifications) {
      await addDoc(collection(db, "notifications"), n);
    }

    res.json({ success: true, id: docRef.id });
  } catch (e) {
    res.status(500).json({ error: "Failed to add content" });
  }
});

app.post("/api/newsletter/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  
  try {
    await addDoc(collection(db, "newsletter"), {
      email,
      subscribed_at: serverTimestamp()
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Subscription failed" });
  }
});

app.get("/api/admin/newsletter", requireAdmin, async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "newsletter"));
    const subs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(subs);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

app.delete("/api/admin/content/:id", requireAdmin, async (req, res) => {
  try {
    await deleteDoc(doc(db, "content", req.params.id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete content" });
  }
});

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_token", { secure: true, sameSite: "none" });
  res.json({ success: true });
});

// Content Routes
app.get("/api/content", async (req, res) => {
  const { type, category } = req.query;
  try {
    const snapshot = await getDocs(collection(db, "content"));
    let items = snapshot.docs.map(d => {
      const data = d.data() as any;
      const { body_uz, body_ru, body_en, ...rest } = data;
      return { id: d.id, ...rest };
    });
    if (type) items = items.filter(i => i.type === type);
    if (category) items = items.filter(i => i.category === category);
    items = items.map(i => ({
      ...i,
      created_at: (i as any).created_at?.toDate?.()?.toISOString() || null
    }));
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== "string") return res.json([]);
  
  try {
    const snapshot = await getDocs(collection(db, "content"));
    const items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    const query = q.toLowerCase();
    
    const results = items.filter(i => 
      i.title_uz?.toLowerCase().includes(query) ||
      i.title_en?.toLowerCase().includes(query) ||
      i.title_ru?.toLowerCase().includes(query) ||
      i.excerpt_uz?.toLowerCase().includes(query) ||
      i.excerpt_en?.toLowerCase().includes(query) ||
      i.excerpt_ru?.toLowerCase().includes(query) ||
      i.content_uz?.toLowerCase().includes(query) ||
      i.content_en?.toLowerCase().includes(query) ||
      i.content_ru?.toLowerCase().includes(query)
    ).map(i => ({
      ...i,
      created_at: i.created_at?.toDate?.()?.toISOString() || null
    }));
    
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/api/content/:id", async (req, res) => {
  try {
    const itemSnap = await getDoc(doc(db, "content", req.params.id));
    if (!itemSnap.exists()) return res.status(404).json({ error: "Not found" });
    const item = itemSnap.data();
    res.json({ 
      ...item, 
      created_at: item.created_at?.toDate?.()?.toISOString() || null
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      try {
        const template = await vite.transformIndexHtml(req.url, fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8'));
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
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

if (process.env.NODE_ENV !== "production") {
  startServer();
}

export default app;
