import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Calendar, Phone, Camera, Loader2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    picture: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, picture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Server bilan bog\'lanishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-[#0A0A0B] w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden border border-navy/10 dark:border-white/10 z-10"
          >
              <div className="flex flex-col md:flex-row min-h-[600px]">
                {/* Left Side - Visual/Branding */}
                <div className="hidden md:flex md:w-2/5 bg-navy p-12 flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(197,160,89,0.2),transparent_70%)]"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center mb-8">
                      <span className="font-serif font-bold text-navy text-xl">T</span>
                    </div>
                    <h2 className="text-4xl font-serif font-bold text-white leading-tight mb-4">
                      Tahqiq <br />
                      <span className="text-gold">Hamjamiyatiga</span> <br />
                      Xush Kelibsiz
                    </h2>
                  </div>

                  <div className="relative z-10">
                    <p className="text-white/60 text-sm leading-relaxed font-light">
                      Siyosiy tahlil va chuqur mulohazalar olamiga xush kelibsiz. Davom etish uchun profilingizni yarating.
                    </p>
                  </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 p-8 sm:p-12 bg-white dark:bg-[#0A0A0B] relative">
                  <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors z-20"
                  >
                    <X size={20} />
                  </button>

                  <div className="mb-10 md:hidden">
                    <h2 className="text-2xl font-serif font-bold text-navy dark:text-white mb-2">
                      Xush kelibsiz
                    </h2>
                    <p className="text-gray-500 text-xs uppercase tracking-widest">Profilingizni yarating</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col items-center mb-10">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-28 h-28 rounded-full bg-gray-50 dark:bg-white/5 border border-navy/5 dark:border-white/10 flex items-center justify-center cursor-pointer group overflow-hidden transition-all hover:border-gold p-1"
                      >
                        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-navy/20 flex items-center justify-center">
                          {formData.picture ? (
                            <img src={formData.picture} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <Camera size={28} className="text-gray-300 group-hover:text-gold transition-colors" />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Yuklash</span>
                        </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <p className="mt-3 text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">Profil Rasmi</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Ism</label>
                        <input
                          required
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Ali"
                          className="w-full px-0 py-3 bg-transparent border-b border-gray-200 dark:border-white/10 focus:border-gold outline-none text-navy dark:text-white transition-all text-lg font-serif"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Familya</label>
                        <input
                          required
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Valiyev"
                          className="w-full px-0 py-3 bg-transparent border-b border-gray-200 dark:border-white/10 focus:border-gold outline-none text-navy dark:text-white transition-all text-lg font-serif"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Tug'ilgan sana</label>
                      <div className="relative">
                        <Calendar className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input
                          required
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          className="w-full px-0 py-3 bg-transparent border-b border-gray-200 dark:border-white/10 focus:border-gold outline-none text-navy dark:text-white transition-all appearance-none text-lg font-serif"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Telefon raqam</label>
                      <div className="relative">
                        <Phone className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+998 90 123 45 67"
                          className="w-full px-0 py-3 bg-transparent border-b border-gray-200 dark:border-white/10 focus:border-gold outline-none text-navy dark:text-white transition-all text-lg font-serif"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-navy text-white font-bold uppercase tracking-[0.3em] text-[10px] rounded-full shadow-2xl shadow-navy/20 hover:bg-gold hover:text-navy transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <>
                            <span>Tasdiqlash</span>
                            <Check size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
