import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Users, Activity, FileText, Send, LogOut, Search, Download, Trash2, X, CheckCircle, XCircle, Eye, MessageSquare, Sparkles, Languages } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from '../components/PageWrapper';
import { ContentItem, ArticleSubmission } from '../types';
import { autoTranslateArticle } from '../services/translationService';

const parseDate = (dateString: string) => {
  if (!dateString) return new Date();
  if (dateString.includes('T')) return new Date(dateString);
  return new Date(dateString.replace(' ', 'T') + 'Z');
};

interface AdminUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  last_login: string;
  created_at: string;
}

interface AdminActivity {
  id: number;
  user_id: string;
  event_type: string;
  content_id: string;
  details: string;
  timestamp: string;
  email?: string;
  name?: string;
  content_title?: string;
}

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'departed' | 'content' | 'newsletter' | 'messages' | 'submissions'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<ArticleSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ArticleSubmission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [isTranslating, setIsTranslating] = useState(false);

  // New Content Form State
  const [contentForm, setContentForm] = useState({
    type: 'article',
    category: 'uzbekistan',
    title_uz: '',
    title_ru: '',
    title_en: '',
    excerpt_uz: '',
    excerpt_ru: '',
    excerpt_en: '',
    body_uz: '',
    body_ru: '',
    body_en: '',
    author: '',
    image_url: '',
    video_url: ''
  });


  useEffect(() => {
    let eventSource: EventSource | null = null;
    
    if (isAuthenticated) {
      setLoading(true);
      eventSource = new EventSource('/api/admin/stream', { withCredentials: true });
      
      eventSource.addEventListener('users', (e) => {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      });
      
      eventSource.addEventListener('activity', (e) => {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) setActivity(data);
      });
      
      eventSource.addEventListener('content', (e) => {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) setContentList(data);
      });
      
      eventSource.addEventListener('newsletter', (e) => {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) setSubscribers(data);
      });
      
      eventSource.addEventListener('messages', (e) => {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) setMessages(data);
      });

      eventSource.addEventListener('submissions', (e) => {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) setSubmissions(data);
      });

      eventSource.onerror = (err) => {
        console.error("SSE connection error", err);
        // Fallback to manual fetch if SSE fails
        fetchData(false);
      };
    }
    
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isAuthenticated]);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [usersRes, activityRes, contentRes, newsletterRes, messagesRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/activity', { credentials: 'include' }),
        fetch('/api/content'),
        fetch('/api/admin/newsletter', { credentials: 'include' }),
        fetch('/api/admin/messages', { credentials: 'include' })
      ]);
      
      if (usersRes.ok) {
        const data = await usersRes.json();
        if (Array.isArray(data)) setUsers(data);
      }
      if (activityRes.ok) {
        const data = await activityRes.json();
        if (Array.isArray(data)) setActivity(data);
      }
      if (contentRes.ok) {
        const data = await contentRes.json();
        if (Array.isArray(data)) setContentList(data);
      }
      if (newsletterRes.ok) {
        const data = await newsletterRes.json();
        if (Array.isArray(data)) setSubscribers(data);
      }
      if (messagesRes.ok) {
        const data = await messagesRes.json();
        if (Array.isArray(data)) setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pin })
      });
      
      if (res.ok) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setError(t('admin.invalid_code'));
      }
    } catch (err) {
      setError(t('admin.login_failed'));
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout failed', err);
    }
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !messageText) return;
    
    try {
      const res = await fetch('/api/admin/message', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, message: messageText, userName: selectedUser.name })
      });
      
      if (res.ok) {
        alert(t('admin.msg_success'));
        setMessageText('');
        setSelectedUser(null);
        // Refresh messages after sending
        const msgRes = await fetch('/api/admin/messages', { credentials: 'include' });
        if (msgRes.ok) setMessages(await msgRes.json());
      } else {
        alert(t('admin.msg_failed'));
      }
    } catch (err) {
      alert(t('admin.msg_error'));
    }
  };

  const handleAutoTranslate = async () => {
    if (!contentForm.title_uz || !contentForm.excerpt_uz || !contentForm.body_uz) {
      alert(t('submit_article.fill_uzbek_first'));
      return;
    }

    setIsTranslating(true);
    try {
      const translations = await autoTranslateArticle({
        title: contentForm.title_uz,
        excerpt: contentForm.excerpt_uz,
        body: contentForm.body_uz
      });

      setContentForm(prev => ({
        ...prev,
        title_ru: translations.ru.title,
        title_en: translations.en.title,
        excerpt_ru: translations.ru.excerpt,
        excerpt_en: translations.en.excerpt,
        body_ru: translations.ru.body,
        body_en: translations.en.body
      }));
    } catch (err) {
      console.error('Translation failed:', err);
      alert(t('submit_article.translation_failed'));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentForm)
      });
      
      if (res.ok) {
        alert('Yangi ma\'lumot muvaffaqiyatli qo\'shildi va foydalanuvchilarga xabar yuborildi!');
        fetchData(false);
        setContentForm({
          type: 'article',
          category: 'uzbekistan',
          title_uz: '',
          title_ru: '',
          title_en: '',
          excerpt_uz: '',
          excerpt_ru: '',
          excerpt_en: '',
          body_uz: '',
          body_ru: '',
          body_en: '',
          author: '',
          image_url: '',
          video_url: ''
        });
      } else {
        alert('Xatolik yuz berdi');
      }
    } catch (err) {
      console.error(err);
      alert('Server xatosi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        fetchData(false);
        setDeleteConfirmId(null);
      } else {
        console.error('O\'chirishda xatolik');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmission = async (id: string, status: 'accepted' | 'rejected') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_feedback: feedbackText })
      });
      
      if (res.ok) {
        alert(status === 'accepted' ? 'Maqola qabul qilindi va saytga joylashtirildi!' : 'Maqola rad etildi.');
        setSelectedSubmission(null);
        setFeedbackText('');
        fetchData(false);
      } else {
        alert('Xatolik yuz berdi');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(10, 25, 47); // Navy
    doc.text('Tahqiq Admin Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Users Table
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Registered Users', 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Name', 'Email', 'Last Login', 'Joined']],
      body: users.map(u => [
        u.name || 'N/A',
        u.email || 'N/A',
        u.last_login ? parseDate(u.last_login).toLocaleDateString() : 'Never',
        u.created_at ? parseDate(u.created_at).toLocaleDateString() : 'Unknown'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [10, 25, 47] }
    });

    // Activity Table
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.text('Recent Activity', 14, finalY + 15);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['User', 'Action', 'Details', 'Time']],
      body: activity.map(a => [
        a.email || 'Unknown',
        a.event_type,
        a.content_title || a.details || '-',
        a.timestamp ? parseDate(a.timestamp).toLocaleString() : 'Unknown'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [197, 160, 89] } // Gold
    });

    doc.save('tahqiq-admin-report.pdf');
  };

  if (!isAuthenticated) {
    return (
      <PageWrapper className="min-h-screen bg-navy flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center">
              <Lock className="text-gold" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-center text-navy mb-2">{t('admin.access')}</h2>
          <p className="text-center text-gray-500 mb-8 text-sm">{t('admin.enter_code')}</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center text-2xl tracking-[0.5em] font-bold py-4 border-b-2 border-navy/20 focus:border-gold outline-none transition-colors"
                placeholder="••••"
                maxLength={4}
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-center text-sm font-bold">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-navy text-white py-4 font-bold uppercase tracking-widest hover:bg-gold transition-colors duration-300"
            >
              {t('admin.unlock')}
            </button>
          </form>
        </motion.div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-paper dark:bg-dark-bg transition-colors duration-500">
      {/* Admin Header */}
      <header className="bg-navy text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-8 h-8 bg-gold rounded flex items-center justify-center flex-shrink-0">
              <span className="font-serif font-bold text-navy">T</span>
            </div>
            <span className="font-bold tracking-widest uppercase text-[10px] sm:text-sm truncate">{t('admin.console')}</span>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-6">
            <button onClick={exportPDF} className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:text-gold transition-colors">
              <Download size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('admin.export')}</span>
            </button>
            <div className="h-4 w-[1px] bg-white/20"></div>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:text-red-400 transition-colors">
              <LogOut size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('admin.exit')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-card p-5 sm:p-6 rounded-sm shadow-sm border-l-4 border-gold"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('admin.total_users')}</p>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-navy dark:text-white mt-2">{users.length}</h3>
              </div>
              <Users className="text-gold/50" size={24} />
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-card p-5 sm:p-6 rounded-sm shadow-sm border-l-4 border-navy"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('admin.active_today')}</p>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-navy dark:text-white mt-2">
                  {users.filter(u => u.last_login && parseDate(u.last_login).toDateString() === new Date().toDateString()).length}
                </h3>
              </div>
              <Activity className="text-navy/50 dark:text-white/50" size={24} />
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-dark-card p-5 sm:p-6 rounded-sm shadow-sm border-l-4 border-green-500 sm:col-span-2 lg:col-span-1"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('admin.total_actions')}</p>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-navy dark:text-white mt-2">{activity.length}</h3>
              </div>
              <FileText className="text-green-500/50" size={24} />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 border-b border-navy/10 dark:border-gold/10 mb-8 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'users' 
                ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold' 
                : 'text-gray-400 hover:text-navy dark:hover:text-gold'
            }`}
          >
            {t('admin.user_mgmt')}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'activity' 
                ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold' 
                : 'text-gray-400 hover:text-navy dark:hover:text-gold'
            }`}
          >
            {t('admin.activity_logs')}
          </button>
          <button
            onClick={() => setActiveTab('departed')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'departed' 
                ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold' 
                : 'text-gray-400 hover:text-navy dark:hover:text-gold'
            }`}
          >
            {t('admin.departed_users')}
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'content' 
                ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold' 
                : 'text-gray-400 hover:text-navy dark:hover:text-gold'
            }`}
          >
            {t('admin.content_mgmt')}
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'newsletter' 
                ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold' 
                : 'text-gray-400 hover:text-navy dark:hover:text-gold'
            }`}
          >
            {t('admin.subscribers')}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'messages' 
                ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold' 
                : 'text-gray-400 hover:text-navy dark:hover:text-gold'
            }`}
          >
            {t('admin.messages')}
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'submissions' 
                ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold' 
                : 'text-gray-400 hover:text-navy dark:hover:text-gold'
            }`}
          >
            {t('admin.user_submissions')}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-dark-card rounded-sm shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy/5 dark:bg-gold/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.user')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Login / Email</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Telefon</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Turi</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.last_active')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5 dark:divide-gold/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-navy/5 dark:hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-navy/10 dark:bg-gold/10 flex items-center justify-center text-navy dark:text-gold font-bold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium text-sm text-navy dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.username || user.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.phone || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          user.username ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.username ? 'Sayt orqali' : 'Google/Apple'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {user.last_login ? parseDate(user.last_login).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="text-navy dark:text-gold hover:underline text-xs font-bold uppercase tracking-wider"
                        >
                          {t('admin.message')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-dark-card rounded-sm shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy/5 dark:bg-gold/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.time')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.user')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.event')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.details')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5 dark:divide-gold/5">
                  {activity.map((log) => (
                    <tr key={log.id} className="hover:bg-navy/5 dark:hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {log.timestamp ? parseDate(log.timestamp).toLocaleString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-navy dark:text-white font-medium">
                        {log.email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          log.event_type === 'login' ? 'bg-green-100 text-green-800' :
                          log.event_type === 'view' ? 'bg-blue-100 text-blue-800' :
                          log.event_type === 'logout' ? 'bg-red-100 text-red-800' :
                          log.event_type === 'share' ? 'bg-purple-100 text-purple-800' :
                          log.event_type === 'save' ? 'bg-yellow-100 text-yellow-800' :
                          log.event_type === 'register' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {log.content_title ? `${log.details}: ${log.content_title}` : log.details || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'departed' && (
          <div className="bg-white dark:bg-dark-card rounded-sm shadow-sm overflow-hidden">
            <div className="p-8 border-b border-navy/5 dark:border-gold/5">
              <h3 className="text-xl font-serif font-bold text-navy dark:text-white">{t('admin.inactive_users')}</h3>
              <p className="text-sm text-gray-500 mt-2">{t('admin.inactive_desc')}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy/5 dark:bg-gold/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.user')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Login / Email</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Telefon</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Oxirgi faollik</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Inaktivlik davri</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5 dark:divide-gold/5">
                  {users.filter(u => {
                    if (!u.last_login) return true;
                    const lastLogin = parseDate(u.last_login);
                    const diff = Date.now() - lastLogin.getTime();
                    return diff > 30 * 24 * 60 * 60 * 1000;
                  }).map((user) => (
                    <tr key={user.id} className="hover:bg-navy/5 dark:hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-navy/10 dark:bg-gold/10 flex items-center justify-center text-navy dark:text-gold font-bold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium text-sm text-navy dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.username || user.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {user.last_login ? parseDate(user.last_login).toLocaleDateString() : 'Hech qachon'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                          {user.last_login 
                            ? `${Math.floor((Date.now() - parseDate(user.last_login).getTime()) / (1000 * 60 * 60 * 24))} kun`
                            : 'Noma\'lum'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="bg-white dark:bg-dark-card rounded-sm shadow-sm overflow-hidden">
            <div className="p-8 border-b border-navy/5 dark:border-gold/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-serif font-bold text-navy dark:text-white">{t('admin.newsletter_subs')}</h3>
                <p className="text-sm text-gray-500 mt-2">{t('admin.newsletter_desc')}</p>
              </div>
              <div className="bg-gold/10 text-gold px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                {subscribers.length} Obunachi
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy/5 dark:bg-gold/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Email</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Obuna sanasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5 dark:divide-gold/5">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-navy/5 dark:hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-navy dark:text-white font-medium">{sub.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {sub.subscribed_at ? parseDate(sub.subscribed_at).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-dark-card rounded-sm shadow-sm overflow-hidden">
              <div className="p-8 border-b border-navy/5 dark:border-gold/5">
                <h3 className="text-xl font-serif font-bold text-navy dark:text-white">{t('admin.send_to_users')}</h3>
                <p className="text-sm text-gray-500 mt-2">{t('admin.send_to_users_desc')}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy/5 dark:bg-gold/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.user')}</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Login / Email</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Telefon</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5 dark:divide-gold/5">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-navy/5 dark:hover:bg-gold/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-navy/10 dark:bg-gold/10 flex items-center justify-center text-navy dark:text-gold font-bold">
                              {user.name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-medium text-sm text-navy dark:text-white">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.username || user.email || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.phone || '-'}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="flex items-center space-x-2 px-4 py-2 bg-navy text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-colors"
                          >
                            <Send size={14} />
                            <span>Xabar yuborish</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-sm shadow-sm overflow-hidden">
              <div className="p-8 border-b border-navy/5 dark:border-gold/5">
                <h3 className="text-xl font-serif font-bold text-navy dark:text-white">{t('admin.msg_history')}</h3>
                <p className="text-sm text-gray-500 mt-2">{t('admin.msg_history_desc')}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy/5 dark:bg-gold/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Kimga</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Xabar</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5 dark:divide-gold/5">
                    {messages.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()).map((msg) => (
                      <tr key={msg.id} className="hover:bg-navy/5 dark:hover:bg-gold/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-navy dark:text-white font-medium">{msg.to_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">{msg.message}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {msg.sent_at ? parseDate(msg.sent_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-8">
            <div className="flex space-x-4">
              {(['pending', 'accepted', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSubmissionFilter(status)}
                  className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    submissionFilter === status
                      ? 'bg-gold text-white shadow-lg shadow-gold/20'
                      : 'bg-white dark:bg-dark-card text-gray-500 hover:text-navy dark:hover:text-gold border border-navy/5 dark:border-gold/10'
                  }`}
                >
                  {status === 'pending' ? t('admin.pending') : status === 'accepted' ? t('admin.accepted') : t('admin.rejected')}
                  <span className="ml-2 opacity-60">({submissions.filter(s => s.status === status).length})</span>
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-dark-card rounded-sm shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy/5 dark:bg-gold/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Muallif</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Sarlavha</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Kategoriya</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Sana</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5 dark:divide-gold/5">
                    {submissions
                      .filter(s => s.status === submissionFilter)
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((sub) => (
                        <tr key={sub.id} className="hover:bg-navy/5 dark:hover:bg-gold/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                                {sub.userName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-sm text-navy dark:text-white">{sub.userName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-navy dark:text-white font-medium max-w-xs truncate">{sub.title_uz}</td>
                          <td className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500">{sub.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => setSelectedSubmission(sub)}
                              className="flex items-center space-x-2 px-4 py-2 bg-navy text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-colors"
                            >
                              <Eye size={14} />
                              <span>Ko'rib chiqish</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    {submissions.filter(s => s.status === submissionFilter).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">{t('admin.no_data')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white dark:bg-dark-card rounded-sm shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-serif font-bold text-navy dark:text-white">{t('admin.add_content')}</h3>
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={isTranslating || !contentForm.title_uz}
                className="flex items-center space-x-2 px-6 py-2 bg-gold/10 text-gold rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all disabled:opacity-50"
              >
                {isTranslating ? (
                  <>
                    <Languages className="animate-spin" size={14} />
                    <span>{t('submit_article.translating')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>{t('submit_article.auto_translate')}</span>
                  </>
                )}
              </button>
            </div>
            <form onSubmit={handleAddContent} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Turi</label>
                  <select 
                    value={contentForm.type}
                    onChange={(e) => setContentForm({...contentForm, type: e.target.value})}
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all"
                  >
                    <option value="article">Maqola</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Bo'lim</label>
                  <select 
                    value={contentForm.category}
                    onChange={(e) => setContentForm({...contentForm, category: e.target.value})}
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all"
                  >
                    <option value="uzbekistan">O'zbekiston Siyosati</option>
                    <option value="global">Global Siyosat</option>
                    <option value="speech">Nutq Tahlili</option>
                    <option value="opinion">Mulohaza va Tahlil</option>
                    <option value="historical">Tarixiy Kontekst</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Sarlavha (UZ)</label>
                    <input 
                      required
                      type="text"
                      value={contentForm.title_uz}
                      onChange={(e) => setContentForm({...contentForm, title_uz: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Sarlavha (RU)</label>
                    <input 
                      required
                      type="text"
                      value={contentForm.title_ru}
                      onChange={(e) => setContentForm({...contentForm, title_ru: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Sarlavha (EN)</label>
                    <input 
                      required
                      type="text"
                      value={contentForm.title_en}
                      onChange={(e) => setContentForm({...contentForm, title_en: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Qisqacha (UZ)</label>
                    <textarea 
                      required
                      value={contentForm.excerpt_uz}
                      onChange={(e) => setContentForm({...contentForm, excerpt_uz: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all h-24 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Qisqacha (RU)</label>
                    <textarea 
                      required
                      value={contentForm.excerpt_ru}
                      onChange={(e) => setContentForm({...contentForm, excerpt_ru: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all h-24 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Qisqacha (EN)</label>
                    <textarea 
                      required
                      value={contentForm.excerpt_en}
                      onChange={(e) => setContentForm({...contentForm, excerpt_en: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all h-24 resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Matn (UZ)</label>
                    <textarea 
                      value={contentForm.body_uz}
                      onChange={(e) => setContentForm({...contentForm, body_uz: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all h-48 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Matn (RU)</label>
                    <textarea 
                      value={contentForm.body_ru}
                      onChange={(e) => setContentForm({...contentForm, body_ru: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all h-48 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Matn (EN)</label>
                    <textarea 
                      value={contentForm.body_en}
                      onChange={(e) => setContentForm({...contentForm, body_en: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all h-48 resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Muallif</label>
                    <input 
                      required
                      type="text"
                      value={contentForm.author}
                      onChange={(e) => setContentForm({...contentForm, author: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Image URL (ixtiyoriy)</label>
                    <input 
                      type="text"
                      value={contentForm.image_url}
                      onChange={(e) => setContentForm({...contentForm, image_url: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Video URL (ixtiyoriy)</label>
                    <input 
                      type="text"
                      value={contentForm.video_url}
                      onChange={(e) => setContentForm({...contentForm, video_url: e.target.value})}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gold outline-none rounded transition-all"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-navy text-white font-bold uppercase tracking-widest rounded shadow-xl hover:bg-gold transition-all disabled:opacity-50"
              >
                {loading ? t('admin.loading') : t('admin.publish_and_notify')}
              </button>
            </form>

            <div className="mt-16">
              <h3 className="text-xl font-serif font-bold text-navy dark:text-white mb-8">{t('admin.existing_content')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy/5 dark:bg-gold/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Sarlavha</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Turi</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Bo'lim</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Sana</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">Harakatlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5 dark:divide-gold/5">
                    {contentList.filter(i => i.is_admin_added).map((item) => (
                      <tr key={item.id} className="hover:bg-navy/5 dark:hover:bg-gold/5 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-sm text-navy dark:text-white">{item.title_uz}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs uppercase tracking-wider text-gray-500">{item.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs uppercase tracking-wider text-gray-500">{item.category}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                            title="O'chirish"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Submission Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[120] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-card w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-navy/5 dark:border-gold/10"
          >
            <div className="bg-navy p-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-navy font-bold">
                  {selectedSubmission.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-bold uppercase tracking-widest text-sm">{selectedSubmission.userName} maqolasi</h3>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest">{new Date(selectedSubmission.created_at).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gold">O'zbekcha</h4>
                  <h5 className="text-lg sm:text-xl font-serif font-bold text-navy dark:text-white">{selectedSubmission.title_uz}</h5>
                  <p className="text-sm text-gray-500 italic">{selectedSubmission.excerpt_uz}</p>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{selectedSubmission.body_uz}</div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Русский</h4>
                  <h5 className="text-lg sm:text-xl font-serif font-bold text-navy dark:text-white">{selectedSubmission.title_ru}</h5>
                  <p className="text-sm text-gray-500 italic">{selectedSubmission.excerpt_ru}</p>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{selectedSubmission.body_ru}</div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gold">English</h4>
                  <h5 className="text-lg sm:text-xl font-serif font-bold text-navy dark:text-white">{selectedSubmission.title_en}</h5>
                  <p className="text-sm text-gray-500 italic">{selectedSubmission.excerpt_en}</p>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{selectedSubmission.body_en}</div>
                </div>
              </div>

              <div className="bg-navy/5 dark:bg-white/5 p-6 rounded-2xl border border-navy/5 dark:border-gold/10 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40">Media va Havolalar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedSubmission.image_url && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Rasm URL</span>
                      <a href={selectedSubmission.image_url} target="_blank" rel="noreferrer" className="text-sm text-gold hover:underline truncate block">{selectedSubmission.image_url}</a>
                    </div>
                  )}
                  {selectedSubmission.video_url && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Video URL</span>
                      <a href={selectedSubmission.video_url} target="_blank" rel="noreferrer" className="text-sm text-gold hover:underline truncate block">{selectedSubmission.video_url}</a>
                    </div>
                  )}
                </div>
              </div>

              {selectedSubmission.status === 'pending' && (
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Admin fikri (ixtiyoriy, rad etilganda ko'rinadi)</label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full h-24 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark-bg focus:outline-none focus:border-gold transition-colors resize-none"
                    placeholder="Maqola haqida fikringiz..."
                  ></textarea>
                </div>
              )}
            </div>

            {selectedSubmission.status === 'pending' && (
              <div className="p-8 bg-gray-50 dark:bg-dark-bg border-t border-navy/5 dark:border-gold/10 flex justify-end space-x-4">
                <button 
                  onClick={() => handleUpdateSubmission(selectedSubmission.id, 'rejected')}
                  disabled={loading}
                  className="px-8 py-3 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  <span>Rad etish</span>
                </button>
                <button 
                  onClick={() => handleUpdateSubmission(selectedSubmission.id, 'accepted')}
                  disabled={loading}
                  className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  <span>Qabul qilish va joylashtirish</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Message Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-card w-full max-w-lg rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="bg-navy p-4 flex justify-between items-center">
              <h3 className="text-white font-bold uppercase tracking-widest text-sm">{t('admin.message_to')} {selectedUser.name}</h3>
              <button onClick={() => setSelectedUser(null)} className="text-white/50 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">{t('admin.send_notification')}</p>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full h-32 p-4 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-dark-bg focus:outline-none focus:border-gold transition-colors resize-none"
                placeholder={t('admin.type_message')}
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-navy"
                >
                  {t('admin.cancel')}
                </button>
                <button 
                  onClick={handleSendMessage}
                  className="bg-navy text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors flex items-center space-x-2"
                >
                  <Send size={14} />
                  <span>{t('admin.send')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-navy/5 dark:border-gold/10"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-navy dark:text-white mb-4">{t('admin.delete_content')}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">{t('admin.delete_confirm')}</p>
              
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => handleDeleteContent(deleteConfirmId)}
                  disabled={loading}
                  className="w-full py-4 bg-red-500 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {loading ? t('admin.loading') : t('admin.yes_delete')}
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-full py-4 bg-gray-100 dark:bg-white/5 text-navy dark:text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  {t('admin.no_cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
};
