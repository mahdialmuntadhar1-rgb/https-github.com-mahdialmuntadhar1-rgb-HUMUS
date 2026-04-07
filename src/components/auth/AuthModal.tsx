import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useHomeStore } from '@/stores/homeStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = 'user' | 'business_owner';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useHomeStore();

  const translations = {
    welcome: {
      en: 'Welcome Back',
      ar: 'مرحباً بعودتك',
      ku: 'بەخێربێیتەوە'
    },
    create: {
      en: 'Create Account',
      ar: 'إنشاء حساب',
      ku: 'دروستکردنی هەژمار'
    },
    loginDesc: {
      en: 'Log in to access your saved places and reviews.',
      ar: 'سجل الدخول للوصول إلى الأماكن المحفوظة والمراجعات.',
      ku: 'بچۆ ژوورەوە بۆ دەستگەیشتن بە شوێنە پاشەکەوتکراوەکان و پێداچوونەوەکان.'
    },
    signupDesc: {
      en: 'Join Saku Maku to discover and share the best of Iraq.',
      ar: 'انضم إلى شکو ماکو لاكتشاف ومشاركة الأفضل في العراق.',
      ku: 'ببە بە ئەندام لە شکو ماکو بۆ دۆزینەوە و هاوبەشکردنی باشترینەکانی عێراق.'
    },
    fullName: {
      en: 'Full Name',
      ar: 'الاسم الكامل',
      ku: 'ناوی تەواو'
    },
    email: {
      en: 'Email Address',
      ar: 'البريد الإلكتروني',
      ku: 'ناونیشانی ئیمەیڵ'
    },
    password: {
      en: 'Password',
      ar: 'كلمة المرور',
      ku: 'وشەی نهێنی'
    },
    normalUser: {
      en: 'Normal User',
      ar: 'مستخدم عادي',
      ku: 'بەکارهێنەری ئاسایی'
    },
    businessOwner: {
      en: 'Business Owner',
      ar: 'صاحب عمل',
      ku: 'خاوەن کار'
    },
    login: {
      en: 'Log In',
      ar: 'تسجيل الدخول',
      ku: 'چوونەژوورەوە'
    },
    signup: {
      en: 'Sign Up',
      ar: 'إنشاء حساب',
      ku: 'خۆت تۆمار بکە'
    },
    forgot: {
      en: 'Forgot Password?',
      ar: 'نسيت كلمة المرور؟',
      ku: 'وشەی نهێنیت لەبیرچووە؟'
    },
    or: {
      en: 'Or continue with',
      ar: 'أو استمر بواسطة',
      ku: 'یان بەردەوام بە لەڕێگەی'
    },
    noAccount: {
      en: "Don't have an account?",
      ar: 'ليس لديك حساب؟',
      ku: 'هەژمارت نییە؟'
    },
    haveAccount: {
      en: 'Already have an account?',
      ar: 'لديك حساب بالفعل؟',
      ku: 'پێشتر هەژمارت دروستکردووە؟'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!isConfigured) {
        throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
      }

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: role,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Create profile in profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: signUpData.user.id,
                email: email,
                full_name: name,
                role: role,
              },
            ]);
          if (profileError) throw profileError;
        }
      }
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      let message = 'An error occurred during authentication';
      if (err instanceof Error) {
        message = err.message;
        if (message.includes('Failed to fetch')) {
          message = 'Network error: Could not connect to authentication server. Please check your internet connection or Supabase configuration.';
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2B2F33]/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F5F7F9] transition-colors text-[#6B7280]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-10" dir={language === 'en' ? 'ltr' : 'rtl'}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#2B2F33] poppins-bold mb-2">
                  {isLogin ? translations.welcome[language] : translations.create[language]}
                </h2>
                <p className="text-sm text-[#6B7280]">
                  {isLogin 
                    ? translations.loginDesc[language] 
                    : translations.signupDesc[language]}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold">
                  {error}
                </div>
              )}

              {!import.meta.env.VITE_SUPABASE_URL && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[10px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed">
                  ⚠️ Supabase Configuration Missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable authentication.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="relative">
                      <div className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#6B7280]`}>
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder={translations.fullName[language]}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm`}
                        required={!isLogin}
                      />
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-3 p-1 bg-[#F5F7F9] rounded-2xl border border-[#E5E7EB]">
                      <button
                        type="button"
                        onClick={() => setRole('user')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          role === 'user' 
                            ? 'bg-white text-[#2CA6A4] shadow-sm' 
                            : 'text-[#6B7280] hover:text-[#2B2F33]'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {translations.normalUser[language]}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('business_owner')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          role === 'business_owner' 
                            ? 'bg-white text-[#E87A41] shadow-sm' 
                            : 'text-[#6B7280] hover:text-[#2B2F33]'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        {translations.businessOwner[language]}
                      </button>
                    </div>
                  </>
                )}

                <div className="relative">
                  <div className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#6B7280]`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder={translations.email[language]}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm`}
                    required
                  />
                </div>

                <div className="relative">
                  <div className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#6B7280]`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder={translations.password[language]}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm`}
                    required
                  />
                </div>

                {isLogin && (
                  <div className={`flex ${language === 'en' ? 'justify-end' : 'justify-start'}`}>
                    <button type="button" className="text-xs font-bold text-[#2CA6A4] hover:underline">
                      {translations.forgot[language]}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2CA6A4] hover:bg-[#1e7a78] text-white font-bold rounded-2xl shadow-lg shadow-[#2CA6A4]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? translations.login[language] : translations.signup[language]}
                      <ArrowRight className={`w-4 h-4 ${language === 'en' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'} transition-transform`} />
                    </>
                  )}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                  {isLogin ? translations.noAccount[language] : translations.haveAccount[language]}
                </span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>

              <div className="text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-[#2CA6A4] hover:underline text-sm"
                >
                  {isLogin ? translations.signup[language] : translations.login[language]}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
