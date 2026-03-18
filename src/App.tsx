import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { Toaster } from 'react-hot-toast';
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

function AnimatedRoutes({ user }: { user: User | null }) {
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
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile user={user} />} />
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

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const fetchUser = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30s

    try {
      const res = await fetch('/api/auth/me', { 
        credentials: 'include',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
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
    fetchUser();

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
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Server logout error:', e);
    }
    setUser(null);
  };

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col bg-white transition-colors duration-500">
        <Header user={user} onLogout={handleLogout} onLoginSuccess={fetchUser} />
        <main className="flex-grow">
          {loading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
          ) : (
            <AnimatedRoutes user={user} />
          )}
        </main>
        <Footer />
      </div>
    </Router>
  );
}
