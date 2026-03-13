import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Users, Activity, FileText, Send, LogOut, Search, Download, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from '../components/PageWrapper';
import { ContentItem } from '../types';

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
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'departed' | 'content'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
    video_url: ''
  });


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuthenticated) {
      interval = setInterval(() => {
        fetchData(false);
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated]);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [usersRes, activityRes, contentRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/activity', { credentials: 'include' }),
        fetch('/api/content')
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
    navigate('/');
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !messageText) return;
    
    try {
      const res = await fetch('/api/admin/message', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, message: messageText })
      });
      
      if (res.ok) {
        alert(t('admin.msg_success'));
        setMessageText('');
        setSelectedUser(null);
      } else {
        alert(t('admin.msg_failed'));
      }
    } catch (err) {
      alert(t('admin.msg_error'));
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
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
              <span className="font-serif font-bold text-navy">T</span>
            </div>
            <span className="font-bold tracking-widest uppercase text-sm">{t('admin.console')}</span>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={exportPDF} className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider hover:text-gold transition-colors">
              <Download size={16} />
              <span>{t('admin.export')}</span>
            </button>
            <div className="h-4 w-[1px] bg-white/20"></div>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider hover:text-red-400 transition-colors">
              <LogOut size={16} />
              <span>{t('admin.exit')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-card p-6 rounded-sm shadow-sm border-l-4 border-gold">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('admin.total_users')}</p>
                <h3 className="text-3xl font-serif font-bold text-navy dark:text-white mt-2">{users.length}</h3>
              </div>
              <Users className="text-gold/50" size={24} />
            </div>
          </div>
          <div className="bg-white dark:bg-dark-card p-6 rounded-sm shadow-sm border-l-4 border-navy">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('admin.active_today')}</p>
                <h3 className="text-3xl font-serif font-bold text-navy dark:text-white mt-2">
                  {users.filter(u => u.last_login && parseDate(u.last_login).toDateString() === new Date().toDateString()).length}
                </h3>
              </div>
              <Activity className="text-navy/50 dark:text-white/50" size={24} />
            </div>
          </div>
          <div className="bg-white dark:bg-dark-card p-6 rounded-sm shadow-sm border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('admin.total_actions')}</p>
                <h3 className="text-3xl font-serif font-bold text-navy dark:text-white mt-2">{activity.length}</h3>
              </div>
              <FileText className="text-green-500/50" size={24} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 border-b border-navy/10 dark:border-gold/10 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'users' 
                ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold' 
                : 'text-gray-400 hover:text-navy dark:hover:text-gold'
            }`}
          >
            {t('admin.user_mgmt')}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'activity' 
                ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold' 
                : 'text-gray-400 hover:text-navy dark:hover:text-gold'
            }`}
          >
            {t('admin.activity_logs')}
          </button>
          <button
            onClick={() => setActiveTab('departed')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'departed' 
                ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold' 
                : 'text-gray-400 hover:text-navy dark:hover:text-gold'
            }`}
          >
            {t('admin.departed_users')}
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'content' 
                ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold' 
                : 'text-gray-400 hover:text-navy dark:hover:text-gold'
            }`}
          >
            Ma'lumotlar boshqaruvi
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
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.email')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.last_active')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-navy dark:text-gold">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5 dark:divide-gold/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-navy/5 dark:hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
                          <span className="font-medium text-sm text-navy dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
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
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {log.content_title || log.details || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white dark:bg-dark-card rounded-sm shadow-sm p-8">
            <h3 className="text-xl font-serif font-bold text-navy dark:text-white mb-8">Yangi ma'lumot qo'shish</h3>
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
                {loading ? 'Yuklanmoqda...' : 'Ma\'lumotni joylashtirish va xabar yuborish'}
              </button>
            </form>

            <div className="mt-16">
              <h3 className="text-xl font-serif font-bold text-navy dark:text-white mb-8">Mavjud ma'lumotlar</h3>
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
                <LogOut size={18} className="rotate-180" /> {/* Using LogOut as close icon equivalent */}
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
              <h3 className="text-2xl font-serif font-bold text-navy dark:text-white mb-4">Ma'lumotni o'chirish</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Haqiqatan ham ushbu ma'lumotni o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
              
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => handleDeleteContent(deleteConfirmId)}
                  disabled={loading}
                  className="w-full py-4 bg-red-500 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {loading ? 'O\'chirilmoqda...' : 'Ha, o\'chirilsin'}
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-full py-4 bg-gray-100 dark:bg-white/5 text-navy dark:text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
};
