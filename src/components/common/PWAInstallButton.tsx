import React, { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useHomeStore();

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsVisible(false);
    } else {
      console.log('User dismissed the install prompt');
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
          className="group relative flex items-center gap-3 bg-accent text-bg-dark px-6 py-4 rounded-3xl shadow-2xl shadow-accent/40 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
        >
          {/* Glowing Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="relative flex items-center justify-center w-10 h-10 bg-bg-dark/10 rounded-2xl">
            <Smartphone className="w-5 h-5" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl border-2 border-bg-dark/20"
            />
          </div>

          <div className="relative flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
              {language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
            </span>
            <span className="text-sm font-black poppins-bold">
              {language === 'ar' ? 'بي لايف' : 'BeLive'}
            </span>
          </div>

          <Download className="w-5 h-5 ml-2 animate-bounce" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
