import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SwipeNavigation } from './components/SwipeNavigation';
import { Home } from './pages/Home';
import { Article } from './pages/Article';
import { Category } from './pages/Category';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Glossary } from './pages/Glossary';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';
import { User } from './types';

export const SwipeContext = React.createContext<'left' | 'right' | null>(null);

function AnimatedRoutes({ user, swipeDirection }: { user: User | null, swipeDirection: 'left' | 'right' | null }) {
  const location = useLocation();

  return (
    <SwipeContext.Provider value={swipeDirection}>
      <AnimatePresence mode="wait" custom={swipeDirection}>
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </SwipeContext.Provider>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white transition-colors duration-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <Router>
      <SwipeNavigation setSwipeDirection={setSwipeDirection} />
      <div className="min-h-screen flex flex-col bg-white transition-colors duration-500">
        <Header user={user} onLogout={handleLogout} onLoginSuccess={fetchUser} />
        <main className="flex-grow">
          <AnimatedRoutes user={user} swipeDirection={swipeDirection} />
        </main>
        <Footer />
      </div>
    </Router>
  );
}
