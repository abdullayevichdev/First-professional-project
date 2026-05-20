import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
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
  onSnapshot,
  getDocFromServer
} from "firebase/firestore";

let __filename = '';
let __dirname = '';
try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = dirname(__filename);
} catch (e) {
  console.error("ESM __dirname error:", e);
  __dirname = process.cwd();
}

dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to allow external images easily
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
const PORT = 3000;
const getEnv = (key: string) => process.env[`VITE_${key}`] || process.env[key];

const JWT_SECRET = getEnv('JWT_SECRET') || "tahqiq-super-secret-key-2026";

const ADMIN_EMAILS = [
  "mansur.ox7@gmail.com",
  "abdulxayavazxanov2012@gmail.com"
];

// Firebase setup
let firebaseApp: any = null;
let db: any = null;
let auth: any = null;
let initError: any = null;

let firebaseConfig: any = {};
let configFound = false;

const loadConfig = () => {
  // Always prefer environment variables in production
  firebaseConfig = {
    apiKey: getEnv('FIREBASE_API_KEY'),
    authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('FIREBASE_APP_ID'),
    measurementId: getEnv('FIREBASE_MEASUREMENT_ID')
  };

  const dbId = getEnv('FIREBASE_DATABASE_ID');
  if (dbId) {
    process.env.FIREBASE_DATABASE_ID = dbId;
  }

  // Fallback to JSON only if env vars are missing and file exists (local/AI Studio)
  if (!firebaseConfig.apiKey) {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      try {
        const localConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        firebaseConfig = {
          apiKey: localConfig.apiKey,
          authDomain: localConfig.authDomain,
          projectId: localConfig.projectId,
          storageBucket: localConfig.storageBucket,
          messagingSenderId: localConfig.messagingSenderId,
          appId: localConfig.appId,
          measurementId: localConfig.measurementId
        };
        if (localConfig.firestoreDatabaseId) {
          process.env.FIREBASE_DATABASE_ID = localConfig.firestoreDatabaseId;
        }
        configFound = true;
        console.log("Firebase config loaded from JSON:", configPath);
      } catch (e) {
        console.error("Failed to read firebase-applet-config.json", e);
      }
    }
  } else {
    configFound = true;
    console.log("Firebase config loaded from Environment Variables");
  }
};

loadConfig();

if (!configFound && !firebaseConfig.apiKey) {
  console.error("CRITICAL: No Firebase configuration found! Please set environment variables or provide firebase-applet-config.json");
}

// Firebase initialization
let initPromise: Promise<void> | null = null;
let lastInitAttempt = 0;
const INIT_COOLDOWN = 10000; // 10 seconds cooldown between failed attempts

const initializeFirebase = async () => {
  if (db) return;
  if (initPromise) return initPromise;
  
  const now = Date.now();
  if (now - lastInitAttempt < INIT_COOLDOWN) {
    console.log("Skipping Firebase initialization due to cooldown");
    return;
  }

  lastInitAttempt = now;
  
  initPromise = (async () => {
    try {
      // If config is still missing, try loading it again
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        loadConfig();
      }

      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        throw new Error("Missing Firebase config");
      }

      firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(firebaseApp);
      
      const firestoreDatabaseId = getEnv('FIREBASE_DATABASE_ID');
      const dbId = (firestoreDatabaseId && firestoreDatabaseId !== "(default)") ? firestoreDatabaseId : undefined;
      
      try {
        db = getFirestore(firebaseApp, dbId);
      } catch (e) {
        db = initializeFirestore(firebaseApp, {
          experimentalForceLongPolling: true,
          experimentalAutoDetectLongPolling: false,
        }, dbId as any);
      }
      
      if (db) {
        console.log("Firestore Initialized:", { projectId: firebaseConfig.projectId, databaseId: dbId || "(default)" });
        
        // Non-blocking anonymous sign-in
        if (!auth.currentUser) {
          signInAnonymously(auth)
            .then(() => console.log("Server signed in anonymously"))
            .catch(e => console.warn("Background server auth failed:", e.message));
        }

        initError = null;
      }
    } catch (error: any) {
      initError = error;
      console.error("CRITICAL: Firebase initialization failed:", error);
      // Keep initPromise null so next request after cooldown can try again
    } finally {
      initPromise = null;
    }
  })();
  
  return initPromise;
};

// Route for detailed debugging
app.get("/api/debug-firebase", async (req, res) => {
  const firestoreDatabaseId = getEnv('FIREBASE_DATABASE_ID') || "(default)";
  const status: any = {
    initialized: !!db,
    configFound,
    projectId: firebaseConfig.projectId,
    databaseId: firestoreDatabaseId,
    hasApiKey: !!firebaseConfig.apiKey,
    auth: {
      isLoggedIn: !!auth?.currentUser,
      uid: auth?.currentUser?.uid || null,
      isAnonymous: auth?.currentUser?.isAnonymous || false
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      HAS_VITE_PROJECT_ID: !!process.env.VITE_FIREBASE_PROJECT_ID,
      HAS_FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    }
  };

  if (db) {
    try {
      // Try to read a known collection
      const testSnap = await getDocs(query(collection(db, "content"), limit(1)));
      status.firestoreRead = "OK";
      status.contentCount = testSnap.size;
    } catch (e: any) {
      status.firestoreRead = "FAILED";
      status.firestoreError = e.message;
      status.firestoreStack = e.stack;
    }
  }

  res.json(status);
});

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((p: any) => ({
        providerId: p.providerId,
        email: p.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// initial attempt - non-blocking
initializeFirebase().catch(e => console.error("Initial Firebase setup failed:", e));

// Middleware to check if Firebase DB is initialized
const checkDb = async (req: any, res: any, next: any) => {
  // Ensure we have a DB instance
  if (!db) {
    try {
      // Small timeout for re-init to prevent long hangs
      const initPromise = initializeFirebase();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
      await Promise.race([initPromise, timeoutPromise]);
    } catch (e) {
      // Continue anyway, we'll check db below
    }
  }

  if (!db) {
    // If it's a critical path, fail. If it's a background path, maybe skip?
    if (req.path.startsWith("/auth/me") || req.path.startsWith("/content")) {
       return res.status(503).json({ 
        error: "Service Temporarily Unavailable", 
        details: "Firebase connection is taking longer than expected. Please refresh in a few seconds.",
        initError: initError ? initError.message : "Initialization in progress"
      });
    }
  }
  next();
};

// Health status
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(), 
    db: db ? "connected" : "connecting",
    authStatus: !!auth,
    env: process.env.NODE_ENV
  });
});

// Apply db check to all /api routes except health
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  checkDb(req, res, next);
});

// Helper for JWT
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
};

const authenticateToken = (req: any, res: any, next: any) => {
  // Check cookie first, then Authorization header
  let token = req.cookies.auth_token;
  
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

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
        timestamp: serverTimestamp()
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
      role: ADMIN_EMAILS.includes(username) ? "admin" : "user",
      status: "active",
      last_login: serverTimestamp(),
      created_at: serverTimestamp()
    };

    await setDoc(newUserRef, userData);

    await logActivity(userId, username, userData.name, "register", undefined, "Ro'yxatdan o'tdi");

    if (userData.role === "admin") {
      res.cookie("admin_token", "admin-secret-token", {
        httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    const token = generateToken(userId);
    res.cookie("auth_token", token, {
      httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ 
      success: true, 
      token,
      user: { id: userId, username, name: userData.name, picture: userData.picture, role: userData.role } 
    });
  } catch (error: any) {
    console.error("Registration error details:", error);
    res.status(500).json({ error: `Failed to register: ${error.message || 'Unknown error'}` });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.status === "suspended") {
      return res.status(403).json({ error: "Your account has been suspended" });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      console.log("Login failed: Invalid password");
      return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
    }

    await updateDoc(doc(db, "users", userDoc.id), {
      last_login: serverTimestamp()
    });

    await logActivity(userDoc.id, userData.username || userData.email, userData.name, "login", undefined, "Tizimga kirdi");

    const token = generateToken(userDoc.id);
    res.cookie("auth_token", token, {
      httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
    });

    const checkEmail = userData.email || userData.username;
    const isSpecialAdmin = (checkEmail && ADMIN_EMAILS.includes(checkEmail)) ||
                           (userData.name && userData.name.toLowerCase().includes("abdulxay")) ||
                           (userData.name && userData.name.toLowerCase().includes("mansur"));
                           
    if (isSpecialAdmin) {
      res.cookie("admin_token", "admin-secret-token", {
        httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
      });
      userData.role = "admin";
    }

    res.json({ 
      success: true, 
      token,
      user: { 
        id: userDoc.id, 
        username: userData.username, 
        name: userData.name, 
        role: userData.role,
        picture: userData.picture 
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/google", async (req, res) => {
  const { email, name, picture, uid } = req.body;
  if (!email || !uid) return res.status(400).json({ error: "Missing data" });

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    let userData;
    if (!userSnap.exists()) {
      userData = {
        id: uid,
        email,
        name: name || email.split('@')[0],
        picture: picture || "",
        role: "user",
        status: "active",
        created_at: serverTimestamp(),
        last_login: serverTimestamp()
      };
      try {
        await setDoc(userRef, userData);
        await logActivity(uid, email, userData.name, "register", undefined, "Google orqali ro'yxatdan o'tdi");
      } catch (writeErr: any) {
        console.error("Firestore write error during Google auth:", writeErr);
        return res.status(500).json({ error: `Ma'lumotlar bazasiga yozishda xatolik: ${writeErr.message}` });
      }
    } else {
      userData = userSnap.data();
      await updateDoc(userRef, { last_login: serverTimestamp() });
      await logActivity(uid, email, userData.name, "login", undefined, "Google orqali kirdi");
    }

    const token = generateToken(uid);
    res.cookie("auth_token", token, {
      httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
    });

    const isSpecialAdmin = (email && ADMIN_EMAILS.includes(email)) ||
                           (userData.name && userData.name.toLowerCase().includes("abdulxay")) ||
                           (userData.name && userData.name.toLowerCase().includes("mansur"));

    if (isSpecialAdmin) {
      res.cookie("admin_token", "admin-secret-token", {
        httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
      });
      userData.role = "admin";
    }

    res.json({ success: true, token, user: userData });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    const userSnap = await getDoc(doc(db, "users", req.userId));
    if (!userSnap.exists()) return res.status(404).json({ error: "User not found" });
    
    const data = userSnap.data();
    const { password, ...safeData } = data;
    
    const checkEmail = safeData.email || safeData.username;
    const isSpecialAdmin = (checkEmail && ADMIN_EMAILS.includes(checkEmail)) || 
                           (safeData.name && safeData.name.toLowerCase().includes("abdulxay")) ||
                           (safeData.name && safeData.name.toLowerCase().includes("mansur"));
    if (isSpecialAdmin) {
      safeData.role = "admin";
    }

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
  res.clearCookie("admin_token", { secure: true, sameSite: "none" });
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
    try {
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
    } catch (e) {
      console.error("Error processing notifications snap", e);
    }
  }, (err) => console.error("SSE User Notifications error:", err));

  // Listen for submissions
  const subQ = query(collection(db, "submissions"), where("userId", "==", userId));
  const unsubSubmissions = onSnapshot(subQ, (snap) => {
    const submissions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    submissions.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    sendEvent("submissions", submissions);
  }, (err) => console.error("SSE User Submissions error:", err));

  req.on("close", () => {
    unsubNotifications();
    unsubSubmissions();
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

const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.cookies.admin_token === "admin-secret-token") {
    return next();
  }
  
  // Alternative check: valid session token belonging to an admin email
  const token = req.cookies.auth_token;
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.userId) {
        const userDoc = await getDoc(doc(db, "users", decoded.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.email && ADMIN_EMAILS.includes(userData.email)) {
            // Auto-set admin token if they are an admin but don't have it
            res.cookie("admin_token", "admin-secret-token", {
              httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000
            });
            return next();
          }
        }
      }
    } catch (e) {
      // Token invalid, ignore
    }
  }

  res.status(403).json({ error: "Unauthorized access" });
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

  const unsubSubmissions = onSnapshot(collection(db, "submissions"), (snap) => {
    const subs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    sendEvent("submissions", subs);
  }, (err) => console.error("SSE Submissions error:", err));

  req.on("close", () => {
    unsubUsers();
    unsubActivity();
    unsubContent();
    unsubNewsletter();
    unsubMessages();
    unsubSubmissions();
  });
});

// Submissions Endpoints
app.post("/api/submissions", authenticateToken, async (req: any, res: any) => {
  try {
    const { 
      title_uz, title_ru, title_en, 
      excerpt_uz, excerpt_ru, excerpt_en, 
      body_uz, body_ru, body_en, 
      category, image_url, video_url 
    } = req.body;

    const userDoc = await getDoc(doc(db, "users", req.userId));
    if (!userDoc.exists()) return res.status(404).json({ error: "User not found" });
    const userData = userDoc.data();

    const submissionData = {
      userId: req.userId,
      userName: userData.name || userData.username || "Foydalanuvchi",
      title_uz: title_uz || "",
      title_ru: title_ru || "",
      title_en: title_en || "",
      excerpt_uz: excerpt_uz || "",
      excerpt_ru: excerpt_ru || "",
      excerpt_en: excerpt_en || "",
      body_uz: body_uz || "",
      body_ru: body_ru || "",
      body_en: body_en || "",
      category: category || "uzbekistan",
      image_url: image_url || "",
      video_url: video_url || "",
      status: 'pending',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "submissions"), submissionData);
    
    await logActivity(req.userId, userData.email, userData.name, "submit_article", docRef.id, "Maqola yubordi", title_uz);

    res.json({ success: true, id: docRef.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/user/submissions", authenticateToken, async (req: any, res: any) => {
  try {
    const q = query(collection(db, "submissions"), where("userId", "==", req.userId));
    const snap = await getDocs(q);
    const submissions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort manually since we might not have index yet
    submissions.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/submissions/:id", requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status, admin_feedback } = req.body;

    const subRef = doc(db, "submissions", id);
    const subSnap = await getDoc(subRef);
    if (!subSnap.exists()) return res.status(404).json({ error: "Submission not found" });
    const subData = subSnap.data();

    await updateDoc(subRef, {
      status,
      admin_feedback: admin_feedback || "",
      updated_at: serverTimestamp()
    });

    // If accepted, add to content
    if (status === 'accepted') {
      const contentData = {
        type: 'article',
        category: subData.category,
        title_uz: subData.title_uz,
        title_ru: subData.title_ru,
        title_en: subData.title_en,
        excerpt_uz: subData.excerpt_uz,
        excerpt_ru: subData.excerpt_ru,
        excerpt_en: subData.excerpt_en,
        body_uz: subData.body_uz,
        body_ru: subData.body_ru,
        body_en: subData.body_en,
        author: subData.userName,
        image_url: subData.image_url,
        video_url: subData.video_url,
        created_at: serverTimestamp(),
        is_admin_added: false,
        submitted_by: subData.userId,
        submissionId: id
      };
      await addDoc(collection(db, "content"), contentData);
    }

    // Add notification to user
    await addDoc(collection(db, "notifications"), {
      userId: subData.userId,
      message: status === 'accepted' 
        ? `Tabriklaymiz! Sizning "${subData.title_uz}" maqolangiz qabul qilindi va saytga joylashtirildi.` 
        : `Afsuski, sizning "${subData.title_uz}" maqolangiz qabul qilinmadi. ${admin_feedback ? 'Sabab: ' + admin_feedback : ''}`,
      contentId: id,
      type: "submission_status",
      read: false,
      created_at: serverTimestamp()
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/submissions/:id", requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Check if there is any content associated with this submission and delete it
    const q = query(collection(db, "content"), where("submissionId", "==", id));
    const contentSnap = await getDocs(q);
    for (const docSnap of contentSnap.docs) {
      await deleteDoc(doc(db, "content", docSnap.id));
    }

    // Delete the submission itself
    await deleteDoc(doc(db, "submissions", id));
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
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
    const {
      type, category, author, image_url, video_url,
      title_uz, title_ru, title_en,
      excerpt_uz, excerpt_ru, excerpt_en,
      body_uz, body_ru, body_en
    } = req.body;

    const contentData = {
      type: type || "article",
      category: category || "uzbekistan",
      author: author || "Tahqiq",
      image_url: image_url || "",
      video_url: video_url || "",
      title_uz: title_uz || "",
      title_ru: title_ru || "",
      title_en: title_en || "",
      excerpt_uz: excerpt_uz || "",
      excerpt_ru: excerpt_ru || "",
      excerpt_en: excerpt_en || "",
      body_uz: body_uz || "",
      body_ru: body_ru || "",
      body_en: body_en || "",
      is_admin_added: true,
      created_at: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "content"), contentData);
    
    // Notify all users about new content
    const usersSnap = await getDocs(collection(db, "users"));
    const notifications = usersSnap.docs.map(userDoc => ({
      userId: userDoc.id,
      message: `Yangi maqola: ${title_uz || "Yangi maqola"}`,
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

app.post("/api/contact/submit", async (req, res) => {
  const { fullName, email, message } = req.body;
  if (!fullName || !email || !message) {
    return res.status(400).json({ error: "Full name, email, and message are required" });
  }

  try {
    const docRef = await addDoc(collection(db, "messages"), {
      to: "admin",
      to_name: `${fullName} <${email}>`,
      from_name: fullName,
      from_email: email,
      message,
      sent_at: serverTimestamp(),
      type: "user_inquiry"
    });
    res.json({ success: true, id: docRef.id });
  } catch (e) {
    console.error("Error saving message:", e);
    res.status(500).json({ error: "Failed to send message" });
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

app.post("/api/admin/seed", requireAdmin, async (req, res) => {
  try {
    await seedContent();
    res.json({ success: true, message: "Content seeded successfully" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
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
    items = items.map(i => {
      let createdAt = null;
      if (i.created_at) {
        if (typeof i.created_at === 'string') {
          createdAt = i.created_at;
        } else if (i.created_at.toDate) {
          createdAt = i.created_at.toDate().toISOString();
        } else if (i.created_at.seconds) {
          createdAt = new Date(i.created_at.seconds * 1000).toISOString();
        }
      }
      return { ...i, created_at: createdAt };
    });
    res.json(items);
  } catch (e: any) {
    console.error("Failed to fetch content error:", e);
    try {
      handleFirestoreError(e, OperationType.LIST, "content");
    } catch (newError: any) {
      res.status(500).json({ error: "Failed to fetch content", details: newError.message });
    }
  }
});

app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== "string") return res.json([]);
  
  try {
    const snapshot = await getDocs(collection(db, "content"));
    const items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    
    const normalize = (str: string | null | undefined) => 
      (str || "").replace(/['ʻ’`]/g, "'").toLowerCase();
    
    const query = normalize(q);
    
    const results = items.filter(i => {
      return (
        normalize(i.title_uz).includes(query) ||
        normalize(i.title_en).includes(query) ||
        normalize(i.title_ru).includes(query) ||
        normalize(i.excerpt_uz).includes(query) ||
        normalize(i.excerpt_en).includes(query) ||
        normalize(i.excerpt_ru).includes(query) ||
        normalize(i.body_uz).includes(query) ||
        normalize(i.body_en).includes(query) ||
        normalize(i.body_ru).includes(query)
      );
    }).map(i => {
      let createdAt = null;
      if (i.created_at) {
        if (typeof i.created_at === 'string') {
          createdAt = i.created_at;
        } else if (i.created_at.toDate) {
          createdAt = i.created_at.toDate().toISOString();
        } else if (i.created_at.seconds) {
          createdAt = new Date(i.created_at.seconds * 1000).toISOString();
        }
      }
      return { ...i, created_at: createdAt };
    });
    
    res.json(results);
  } catch (e: any) {
    console.error("Search failed:", e);
    try {
      handleFirestoreError(e, OperationType.LIST, "content");
    } catch (newError: any) {
      res.status(500).json({ error: "Search failed", details: newError.message });
    }
  }
});

app.get("/api/content/:id", async (req, res) => {
  try {
    const itemSnap = await getDoc(doc(db, "content", req.params.id));
    if (!itemSnap.exists()) return res.status(404).json({ error: "Not found" });
    const item = itemSnap.data();
    res.json({ 
      ...item, 
      created_at: item.created_at?.toDate ? item.created_at.toDate().toISOString() : (typeof item.created_at === 'string' ? item.created_at : null)
    });
  } catch (e: any) {
    console.error("Failed to fetch content detail:", e);
    try {
      handleFirestoreError(e, OperationType.GET, `content/${req.params.id}`);
    } catch (newError: any) {
      res.status(500).json({ error: "Server error", details: newError.message });
    }
  }
});

async function seedContent() {
  if (!db) {
    console.warn("Skipping seedContent: db not initialized");
    return;
  }
  try {
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
        body_uz: "O'zbekiston iqtisodiyoti so'nggi yillarda jadal rivojlanish bosqichiga kirdi. Yangi strategiya doirasida xususiylashtirish jarayonlari, xorijiy investitsiyalarni jalb qilish va eksport salohiyatini oshirishga alohida e'tibor qaratilmoqda...",
        body_ru: "Экономика Узбекистана в последние годы вступила в фазу интенсивного развития. В рамках новой стратегии особое внимание уделяется процессам приватизации, привлечению иностранных инвестиций и повышению экспортного потенциала...",
        body_en: "Uzbekistan's economy has entered a phase of rapid development in recent years. Within the framework of the new strategy, special attention is paid to privatization processes, attracting foreign investment and increasing export potential...",
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
        body_uz: "Raqamli texnologiyalar davlat boshqaruvining samaradorligini oshirishda eng muhim qurol hisoblanadi. O'zbekiston kiber-xavfsizlikni kuchaytirish, milliy ma'lumotlar bazalarini himoyalash va aholiga ko'rsatiladigan elektron xizmatlarni soddalashtirish orqali o'z raqamli suverenitetini mustahkamlamoqda...",
        body_ru: "Цифровые технологии — важнейший инструмент повышения эффективности государственного управления. Узбекистан укрепляет свой цифровой суверенитет, усиливая кибербезопасность...",
        body_en: "Digital technologies are the most crucial instrument for improving state management efficiency. Uzbekistan is strengthening its digital sovereignty by reinforcing cybersecurity, protecting national databases, and simplifying electronic service delivery...",
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
        body_uz: "Bugungi kunda Markaziy Osiyo xalqaro munosabatlarning muhim chorrahasiga aylandi. Mintaqa davlatlari o'rtasidagi integratsiya jarayonlari tashqi siyosatda yangi sahifani ochib bermoqda. Ko'p tomonlama balanslangan munosabatlar mintaqa barqarorligining asosi hisoblanadi...",
        body_ru: "Центральная Азия сегодня находится на перекрестке международных интересов. Процессы интеграции открывают новые возможности...",
        body_en: "Today, Central Asia has become an important junction in international relations. Integration processes between the region's nations are opening a new chapter in foreign policy. A multivector balanced relationship serves as the core foundation for regional stability...",
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
        body_uz: "Nutq — bu shunchaki so'zlar yig'indisi emas, u siyosiy iroda va g'oyaviy quroldir. Mazkur tahlilda davlat rahbarlarining muhim nutqlaridagi yashirin ma'nolar, ritorik savollar va tinglovchini ishontirish uslublari batafsil tekshiriladi...",
        body_ru: "Речь — это не просто набор слов, а инструмент политической воли. В данном анализе подробно исследуются скрытые смыслы...",
        body_en: "A speech is not merely a collection of words; it is a political will and an ideological instrument. In this research, hidden meanings, rhetorical questions, and audience persuasion methodologies of key public speeches are thoroughly examined...",
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
        body_uz: "Buyuk Ipak yo'li faqatgina savdo yo'li emas, balki g'oyalar, dinlar va madaniy diplomatik aloqalar almashinuv o'chog'i edi. Bugungi kunda ushbu meros yangi iqtisodiy koridorlar doirasida qayta tiklanmoqda...",
        body_ru: "Великий шелковый путь был не только торговым маршрутом, но и колыбелью обмена идеями...",
        body_en: "The Great Silk Road was not only a trading route but a crucible for ideas, cultures, and diplomatic exchanges. Today, this legacy is revived in modern economic corridors...",
        author: "Tarix fanlari doktori Jasur Alimov",
        image_url: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1200&h=800",
        is_admin_added: true
      }
    ];

    console.log("Checking and seeding items as needed...");
    for (const item of initialContent) {
      const itemDoc = doc(db, "content", item.id);
      const itemSnap = await getDoc(itemDoc);
      if (!itemSnap.exists()) {
        console.log(`Seeding missing article: ${item.id}`);
        await setDoc(itemDoc, {
          ...item,
          created_at: serverTimestamp()
        });
      }
    }
    console.log("Seeding process completed.");
  } catch (e) {
    console.error("Failed to seed content", e);
  }
}

async function startServer() {
  // Seeding occurs in the background to not block app.listen()
  if (process.env.VERCEL !== "1") {
    seedContent().catch(err => console.error("Initial seeding failed:", err));
  }
  
  if (process.env.NODE_ENV !== "production") {
    const viteModule = "vite";
    const { createServer: createViteServer } = await import(/* @vite-ignore */ viteModule);
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      try {
        const template = await vite.transformIndexHtml(req.url, fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8'));
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else if (process.env.VERCEL !== "1") {
    // Only serve static files manually if NOT on Vercel
    // Vercel handles static file serving and SPA fallback automatically via vercel.json
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      app.get("*", (req, res) => {
        res.status(404).send("Production build not found. Run 'npm run build' first.");
      });
    }
  }
  
  // Only listen if not in a serverless environment like Vercel
  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  }
}

startServer();

export default app;
