import React, { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true); // Always visible by default
  const { language } = useHomeStore();

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt or if it hasn't fired
      alert(language === 'ar' 
        ? 'لتثبيت التطبيق، يرجى النقر على أيقونة المشاركة في متصفحك واختيار "إضافة إلى الشاشة الرئيسية".' 
        : 'To install the app, please click the share icon in your browser and select "Add to Home Screen".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.8 }}
        className="fixed bottom-24 right-6 z-[100]"
      >
        <button
          onClick={handleInstall}
          className="group relative flex items-center gap-4 bg-primary text-white px-8 py-5 rounded-[32px] shadow-[0_0_30px_rgba(255,159,28,0.6)] hover:shadow-[0_0_50px_rgba(255,159,28,0.8)] hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden border-2 border-white/20"
        >
          {/* Intense Glowing Animation */}
          <motion.div
            animate={{ 
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-accent/20 blur-xl"
          />
          
          {/* Scanning Light Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform" />
          
          <div className="relative flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md">
            <Download className="w-6 h-6 animate-bounce" />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl border-2 border-white"
            />
          </div>

          <div className="relative flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent animate-pulse">
                {language === 'ar' ? 'تثبيت الآن' : 'Install Now'}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            </div>
            <span className="text-lg font-black poppins-bold tracking-tight">
              {language === 'ar' ? 'تحميل شكو ماكو' : 'Download Shaku Maku'}
            </span>
          </div>

          <div className="relative ml-2 p-2 bg-accent rounded-xl text-primary">
            <Smartphone className="w-5 h-5" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
