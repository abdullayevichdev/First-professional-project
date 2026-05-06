import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { User, Calendar, Phone, Mail, Edit3, Shield, Clock, Bell, Check, Eye, Bookmark, FileText, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { User as UserType, Notification, ContentItem, ArticleSubmission } from '../types';
import { PageWrapper } from '../components/PageWrapper';

interface ProfileProps {
  user: UserType | null;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [savedArticles, setSavedArticles] = useState<ContentItem[]>([]);
  const [submissions, setSubmissions] = useState<ArticleSubmission[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    if (user) {
      eventSource = new EventSource('/api/user/stream', { withCredentials: true });
      
      eventSource.addEventListener('notifications', (e) => {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) setNotifications(data);
      });

      eventSource.addEventListener('submissions', (e) => {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) setSubmissions(data);
      });

      eventSource.onerror = (err) => {
        console.error("SSE user stream error", err);
      };

      setLoadingSaved(true);
      fetch('/api/user/saved-articles', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSavedArticles(data);
        })
        .finally(() => setLoadingSaved(false));

      setLoadingSubmissions(true);
      fetch('/api/user/submissions', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSubmissions(data);
        })
        .finally(() => setLoadingSubmissions(false));
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user]);

  const getTitle = (item: ContentItem) => {
    if (i18n.language === 'en') return item.title_en;
    if (i18n.language === 'ru') return item.title_ru;
    return item.title_uz;
  };

  const handleDismiss = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/dismiss`, { method: 'POST', credentials: 'include' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = (id: string, contentId: string) => {
    handleDismiss(id);
    navigate(`/article/${contentId}`);
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Shield size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-navy dark:text-white mb-2">{t('auth.login_required', 'Kirish talab qilinadi')}</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs">{t('auth.sign_in_desc')}</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#050505] py-8 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Profile Header - Clean & Professional */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#0A0A0B] border border-gray-100 dark:border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-12 mb-6 sm:mb-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 relative overflow-hidden"
          >
            {/* Subtle background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative shrink-0 z-10">
              <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white dark:border-[#141414] shadow-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-3xl sm:text-4xl font-serif font-bold text-gold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left min-w-0 z-10 pt-0 sm:pt-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gold/10 text-gold rounded-full mb-3 sm:mb-4">
                <Shield size={12} />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{user.role === 'admin' ? t('profile.admin') : t('profile.user')}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-navy dark:text-white mb-2 truncate" title={user.name}>
                {user.name}
              </h1>
              {user.email && (
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-base truncate mb-6" title={user.email}>
                  {user.email}
                </p>
              )}
              
              <button 
                onClick={() => {
                  onLogout();
                  navigate('/');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-red-500/10"
              >
                <LogOut size={14} />
                <span>{t('auth.logout', 'Chiqish')}</span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Left Column (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6 sm:space-y-8">
              {/* Personal Info Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#0A0A0B] border border-gray-100 dark:border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-sm"
              >
                <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 sm:mb-6">{t('profile.personal_info')}</h3>
                <div className="space-y-4 sm:space-y-6 divide-y divide-gray-50 dark:divide-white/5">
                  <div className="pt-4 first:pt-0 flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-navy dark:text-gold shrink-0">
                      <Phone size={18} className="sm:w-[20px] sm:h-[20px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('contact.phone', 'Telefon')}</p>
                      <p className="text-xs sm:text-sm font-medium text-navy dark:text-white truncate">{user.phone || '---'}</p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-navy dark:text-gold shrink-0">
                      <Mail size={18} className="sm:w-[20px] sm:h-[20px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('contact.email')}</p>
                      <p className="text-xs sm:text-sm font-medium text-navy dark:text-white truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Subscription Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-navy dark:bg-[#141414] border border-navy/10 dark:border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden group shadow-lg"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.15),transparent_60%)]"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div className="flex items-center space-x-2 text-gold">
                      <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">{t('profile.role')}</span>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full">{user.role}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                    {t('hero.slogan')}
                  </p>
                  <Link to="/submit-article" className="w-full py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all backdrop-blur-sm flex items-center justify-center">
                    {t('profile.submit_article')}
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right Column (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4 sm:gap-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-[#0A0A0B] border border-gray-100 dark:border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-6 shadow-sm group hover:border-gold/30 transition-colors text-center sm:text-left"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-white/5 group-hover:bg-gold/10 flex items-center justify-center text-navy dark:text-gray-400 group-hover:text-gold shrink-0 transition-colors">
                    <Eye size={20} className="sm:w-[24px] sm:h-[24px]" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-serif font-bold text-navy dark:text-white mb-0.5 sm:mb-1">12</p>
                    <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('profile.read_articles')}</p>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-[#0A0A0B] border border-gray-100 dark:border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-6 shadow-sm group hover:border-gold/30 transition-colors text-center sm:text-left"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-white/5 group-hover:bg-gold/10 flex items-center justify-center text-navy dark:text-gray-400 group-hover:text-gold shrink-0 transition-colors">
                    <Bookmark size={20} className="sm:w-[24px] sm:h-[24px]" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-serif font-bold text-navy dark:text-white mb-0.5 sm:mb-1">{savedArticles.length}</p>
                    <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('profile.saved_articles')}</p>
                  </div>
                </motion.div>
              </div>

              {/* Admin Messages Section */}
              <AnimatePresence>
                {notifications.filter(n => n.type === 'admin_message').length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2 ml-2">
                      <Bell size={14} className="text-gold" />
                      <span>{t('profile.admin_messages')}</span>
                    </h3>
                    {notifications.filter(n => n.type === 'admin_message').map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white dark:bg-[#0A0A0B] border border-gold/20 rounded-[2rem] p-6 sm:p-8 shadow-sm"
                      >
                        <div className="flex flex-col space-y-6">
                          <p className="text-base sm:text-lg font-serif font-medium text-navy dark:text-gray-200 leading-relaxed">
                            {notif.message}
                          </p>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <button
                              onClick={() => handleDismiss(notif.id)}
                              className="flex items-center justify-center space-x-2 py-3.5 bg-gray-50 dark:bg-white/5 text-navy dark:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-all group border border-gray-100 dark:border-white/5"
                            >
                              <Check size={16} className="text-green-500 group-hover:scale-110 transition-transform" />
                              <span>{t('profile.read')}</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Notifications Section */}
              <AnimatePresence>
                {notifications.filter(n => n.type !== 'admin_message').length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2 ml-2">
                      <Bell size={14} className="text-gold" />
                      <span>{t('profile.notifications')}</span>
                    </h3>
                    {notifications.filter(n => n.type !== 'admin_message').map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white dark:bg-[#0A0A0B] border border-gold/20 rounded-[2rem] p-6 sm:p-8 shadow-sm"
                      >
                        <div className="flex flex-col space-y-6">
                          <p className="text-base sm:text-lg font-serif font-medium text-navy dark:text-gray-200 leading-relaxed">
                            <span className="text-gold font-bold">{user.name}</span> {notif.message}
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              onClick={() => handleView(notif.id, notif.contentId)}
                              className="flex items-center justify-center space-x-2 py-3.5 bg-navy text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all group"
                            >
                              <Eye size={16} className="group-hover:scale-110 transition-transform" />
                              <span>{t('profile.view')}</span>
                            </button>
                            <button
                              onClick={() => handleDismiss(notif.id)}
                              className="flex items-center justify-center space-x-2 py-3.5 bg-gray-50 dark:bg-white/5 text-navy dark:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-all group border border-gray-100 dark:border-white/5"
                            >
                              <Check size={16} className="text-green-500 group-hover:scale-110 transition-transform" />
                              <span>{t('profile.read')}</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Article Submissions */}
              <div className="bg-white dark:bg-[#0A0A0B] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 sm:p-10 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                  <h3 className="text-xl font-serif font-bold text-navy dark:text-white flex items-center space-x-3">
                    <FileText size={20} className="text-gold" />
                    <span>{t('profile.my_articles')}</span>
                  </h3>
                  <Link 
                    to="/submit-article"
                    className="px-4 py-2 bg-gold text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-navy transition-all"
                  >
                    {t('profile.submit_article')}
                  </Link>
                </div>
                
                <div className="space-y-6">
                  {loadingSubmissions ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                    </div>
                  ) : submissions.length > 0 ? (
                    submissions.map((sub) => (
                      <div 
                        key={sub.id} 
                        className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-lg font-serif font-bold text-navy dark:text-white truncate" title={sub.title_uz}>
                              {i18n.language === 'en' ? sub.title_en : i18n.language === 'ru' ? sub.title_ru : sub.title_uz}
                            </h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                              {new Date(sub.created_at).toLocaleDateString()} • {sub.category}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {sub.status === 'pending' && (
                              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-full">
                                <Clock size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{t('profile.status_pending')}</span>
                              </div>
                            )}
                            {sub.status === 'accepted' && (
                              <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full">
                                <CheckCircle size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{t('profile.status_accepted')}</span>
                              </div>
                            )}
                            {sub.status === 'rejected' && (
                              <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-full">
                                <XCircle size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{t('profile.status_rejected')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {sub.admin_feedback && (
                          <div className="p-4 bg-white dark:bg-dark-bg rounded-xl border border-navy/5 dark:border-gold/10">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Admin:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">{sub.admin_feedback}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-600">
                        <FileText size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.no_articles')}</p>
                      <button 
                        onClick={() => navigate('/submit-article')}
                        className="mt-4 text-gold text-[10px] font-bold uppercase tracking-widest hover:underline"
                      >
                        {t('profile.submit_article')} &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Articles */}
              <div className="bg-white dark:bg-[#0A0A0B] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 sm:p-10 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                  <h3 className="text-xl font-serif font-bold text-navy dark:text-white flex items-center space-x-3">
                    <Bookmark size={20} className="text-gold" />
                    <span>{t('profile.saved_articles')}</span>
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {loadingSaved ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                    </div>
                  ) : savedArticles.length > 0 ? (
                    savedArticles.map((item) => (
                      <Link 
                        key={item.id} 
                        to={`/article/${item.id}`}
                        className="flex items-center justify-between group cursor-pointer p-4 -mx-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-gold/10 group-hover:text-gold shrink-0 transition-colors">
                            <Bookmark size={18} fill="currentColor" className="text-gold opacity-0 group-hover:opacity-100 absolute transition-opacity" />
                            <Bookmark size={18} className="group-hover:opacity-0 transition-opacity" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base font-bold text-navy dark:text-white group-hover:text-gold transition-colors truncate">
                              {getTitle(item)}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity text-gold">
                          <span className="text-[10px] font-bold uppercase tracking-widest">{t('common.read_more')} &rarr;</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-600">
                        <Bookmark size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.no_saved')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
