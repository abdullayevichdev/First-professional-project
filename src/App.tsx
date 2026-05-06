import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Article } from './pages/Article';
import { Category } from './pages/Category';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Glossary } from './pages/Glossary';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';
import { SubmitArticle } from './pages/SubmitArticle';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { User } from './types';
import { auth, signInAnon } from './lib/firebase';
import { signInAnonymously } from 'firebase/auth';

function AnimatedRoutes({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/article/:id" element={<Article user={user} />} />
        <Route path="/category/:id" element={<Category />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/admin" element={<Admin user={user} />} />
        <Route path="/profile" element={<Profile user={user} onLogout={onLogout} />} />
        <Route path="/submit-article" element={<SubmitArticle user={user} />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseConfigMissing, setFirebaseConfigMissing] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    // We are now using firebase-applet-config.json
    setFirebaseConfigMissing(false);
  }, []);

  const fetchUser = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/me', { 
        credentials: 'include',
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // If 401, maybe token expired, clear it
        if (res.status === 401) {
          localStorage.removeItem('auth_token');
        }
        setUser(null);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('Fetch user timed out after 30s');
      } else {
        console.error('Fetch user error:', err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Non-blocking anonymous sign-in
      signInAnonymously(auth).catch(e => {
        console.warn("Anonymous sign-in on frontend failed:", e);
      });
      await fetchUser();
    };
    
    initAuth();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchUser();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include',
        headers
      });
    } catch (e) {
      console.error('Server logout error:', e);
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  return (
    <HelmetProvider>
      <Router>
        <Toaster position="top-right" />
        <div className="min-h-screen flex flex-col bg-white transition-colors duration-500">
          {firebaseConfigMissing && import.meta.env.DEV && (
            <div className="bg-amber-100 border-b border-amber-200 py-2 px-4 text-center text-amber-800 text-sm font-medium">
              ⚠️ Firebase API kalitlari (VITE_FIREBASE_API_KEY) topilmadi. Settings menyusi orqali Environment Variables bo'limiga ularni kiriting.
            </div>
          )}
          <Header user={user} onLogout={handleLogout} onLoginSuccess={fetchUser} />
          <main className="flex-grow">
            {loading ? (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
              </div>
            ) : (
              <AnimatedRoutes user={user} onLogout={handleLogout} />
            )}
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}
