import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Phone, Mail, Edit3, Shield, Clock, Bell, Check, Eye } from 'lucide-react';
import { User as UserType, Notification } from '../types';
import { PageWrapper } from '../components/PageWrapper';

interface ProfileProps {
  user: UserType | null;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    if (user) {
      fetch('/api/notifications', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setNotifications(data);
        });
    }
  }, [user]);

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
          <h2 className="text-2xl font-serif font-bold text-navy dark:text-white mb-2">Kirish talab qilinadi</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs">Profilni ko'rish uchun iltimos tizimga kiring.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="news-container py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="relative mb-12">
            <div className="h-48 sm:h-64 bg-navy dark:bg-gold/10 rounded-[2.5rem] overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)]"></div>
            </div>
            
            <div className="absolute -bottom-12 left-8 sm:left-12 flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] border-4 border-white dark:border-[#0A0A0B] overflow-hidden shadow-2xl bg-white dark:bg-dark-card">
                  <img src={user.picture || 'https://picsum.photos/seed/user/200/200'} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-gold text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                  <Edit3 size={16} />
                </button>
              </div>
              
              <div className="pb-4">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy dark:text-white mb-1">{user.name}</h1>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gold/60">
                  <Shield size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Premium A'zo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-24">
            {/* Sidebar Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-50 dark:bg-white/5 rounded-[2rem] p-8 border border-navy/5 dark:border-white/5">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Ma'lumotlar</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-white dark:bg-white/5 rounded-lg text-navy dark:text-gold">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tug'ilgan sana</p>
                      <p className="text-sm font-bold text-navy dark:text-white">{user.birthDate || 'Kiritilmagan'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-white dark:bg-white/5 rounded-lg text-navy dark:text-gold">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Telefon</p>
                      <p className="text-sm font-bold text-navy dark:text-white">{user.phone || 'Kiritilmagan'}</p>
                    </div>
                  </div>

                  {user.email && (
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-white dark:bg-white/5 rounded-lg text-navy dark:text-gold">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                        <p className="text-sm font-bold text-navy dark:text-white">{user.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-navy dark:bg-gold rounded-[2rem] p-8 text-white dark:text-navy">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Obuna holati</span>
                </div>
                <p className="text-2xl font-serif font-bold mb-4">Faol</p>
                <button className="w-full py-3 bg-white/10 dark:bg-navy/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 dark:hover:bg-navy/20 transition-all">
                  Batafsil
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Notifications Section */}
              <AnimatePresence>
                {notifications.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
                      <Bell size={14} className="text-gold" />
                      <span>Bildirishnomalar</span>
                    </h3>
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-white/5 border border-gold/20 rounded-[2rem] p-8 shadow-xl shadow-gold/5"
                      >
                        <div className="flex flex-col space-y-6">
                          <p className="text-lg font-serif font-bold text-navy dark:text-white leading-relaxed">
                            <span className="text-gold">{user.name}</span> {notif.message}
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                              onClick={() => handleView(notif.id, notif.contentId)}
                              className="flex items-center justify-center space-x-3 py-4 bg-navy text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all group"
                            >
                              <Eye size={16} className="group-hover:scale-110 transition-transform" />
                              <span>Yangi xabarni ko'rishni hohlaysizmi</span>
                            </button>
                            <button
                              onClick={() => handleDismiss(notif.id)}
                              className="flex items-center justify-center space-x-3 py-4 bg-gray-100 dark:bg-white/5 text-navy dark:text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all group"
                            >
                              <Check size={16} className="text-green-500 group-hover:scale-110 transition-transform" />
                              <span>Yoki bu xabarni ko'rib bo'ldingizmi</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-white/5 border border-navy/5 dark:border-white/5 rounded-[2rem] p-8 text-center">
                  <p className="text-3xl font-serif font-bold text-navy dark:text-gold mb-1">12</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">O'qilgan maqolalar</p>
                </div>
                <div className="bg-white dark:bg-white/5 border border-navy/5 dark:border-white/5 rounded-[2rem] p-8 text-center">
                  <p className="text-3xl font-serif font-bold text-navy dark:text-gold mb-1">4</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saqlanganlar</p>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 border border-navy/5 dark:border-white/5 rounded-[2.5rem] p-10">
                <h3 className="text-xl font-serif font-bold text-navy dark:text-white mb-8">So'nggi faollik</h3>
                <div className="space-y-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-gold/10 group-hover:text-gold transition-all">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy dark:text-white group-hover:text-gold transition-colors">Siyosiy ritorika kuchi tahlili</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">2 soat avval</p>
                        </div>
                      </div>
                      <div className="h-1 w-12 bg-gray-100 dark:bg-white/10 rounded-full group-hover:bg-gold transition-all"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
