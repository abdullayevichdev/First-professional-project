import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Instagram, Send, Youtube, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-dark-card border-t border-navy/5 dark:border-gold/5 pt-24 pb-12 transition-colors duration-500">
      <div className="news-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          {/* Brand */}
          <div className="md:col-span-4 flex flex-col">
            <Link to="/" className="flex flex-col mb-8 group">
              <span className="text-4xl font-serif font-black tracking-tighter text-navy dark:text-white leading-none group-hover:text-gold transition-colors duration-500">TAHQIQ</span>
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.4em] text-gold mt-1">Analytical Insight</span>
            </Link>
            <p className="text-sm text-navy/50 dark:text-gray-400 leading-relaxed font-light max-w-xs italic">
              "Providing evidence-based analysis of political speeches and global issues to educate and inform. Bridging history and the present."
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
            <div className="flex flex-col space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy/30 dark:text-gold/30 mb-2">Platform</span>
              <Link to="/about" className="text-sm font-bold text-navy dark:text-gray-300 hover:text-gold transition-colors">About Us</Link>
              <Link to="/contact" className="text-sm font-bold text-navy dark:text-gray-300 hover:text-gold transition-colors">Contact</Link>
              <Link to="/glossary" className="text-sm font-bold text-navy dark:text-gray-300 hover:text-gold transition-colors">Resources</Link>
            </div>
            <div className="flex flex-col space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy/30 dark:text-gold/30 mb-2">Legal</span>
              <Link to="/privacy" className="text-sm font-bold text-navy dark:text-gray-300 hover:text-gold transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-sm font-bold text-navy dark:text-gray-300 hover:text-gold transition-colors">Terms of Service</Link>
            </div>
          </div>

          {/* Social */}
          <div className="md:col-span-4 flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy/30 dark:text-gold/30 mb-8">Connect</span>
            <div className="flex space-x-4">
              {[
                { icon: <Youtube size={20} />, url: 'https://youtube.com/@TAHQIQ_OFFICIAL' },
                { icon: <Send size={20} />, url: 'https://t.me/tahqiq_official' },
                { icon: <Instagram size={20} />, url: 'https://www.instagram.com/tahqiq.official' }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="social-btn"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-24 pt-12 border-t border-navy/5 dark:border-gold/5 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <p className="text-[10px] font-bold text-navy/30 dark:text-gold/20 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} TAHQIQ.com — All Rights Reserved
          </p>
          <div className="flex items-center space-x-8 text-[10px] font-bold text-navy/30 dark:text-gold/20 uppercase tracking-[0.2em]">
            <span>Designed for Excellence</span>
            <span className="w-1 h-1 bg-gold rounded-full"></span>
            <span>Global Edition</span>
            <Link to="/admin" className="opacity-0 hover:opacity-100 transition-opacity duration-500">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
