import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, PlusCircle, MapPin, LogOut, Settings, ChevronDown, Search, Briefcase, LayoutDashboard } from "lucide-react";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "motion/react";
import HeroSection from "@/components/home/HeroSection";
import StorySection from "@/components/home/StorySection";
import LocationFilter from "@/components/home/LocationFilter";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeedComponent from "@/components/home/FeedComponent";
import BusinessGrid from "@/components/home/BusinessGrid";
import AuthModal from "@/components/auth/AuthModal";
import BusinessDetailModal from "@/components/home/BusinessDetailModal";
import AddBusinessModal from "@/components/home/AddBusinessModal";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useAuthStore } from "@/stores/authStore";
import { useHomeStore } from "@/stores/homeStore";
import { CATEGORIES } from "@/constants";
import type { Business } from "@/lib/supabase";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, profile, signOut, loading: authLoading } = useAuthStore();
  const { 
    language,
    setLanguage
  } = useHomeStore();
  
  const { 
    businesses, 
    loading: businessesLoading, 
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh
  } = useBusinesses(debouncedQuery);

  // Debounce search query
  const debouncedSetQuery = useMemo(
    () => debounce((query: string) => setDebouncedQuery(query), 500),
    []
  );

  useEffect(() => {
    debouncedSetQuery(searchQuery);
    return () => debouncedSetQuery.cancel();
  }, [searchQuery, debouncedSetQuery]);

  const isRTL = language === 'ar' || language === 'ku';

  const translations = {
    explore: {
      en: 'Explore Businesses',
      ar: 'استكشف الشركات',
      ku: 'گەڕان بەدوای کارەکاندا'
    },
    directory: {
      en: 'Directory',
      ar: 'الدليل',
      ku: 'دایرێکتۆری'
    },
    subtitle: {
      en: 'Discover the best local services across Iraq',
      ar: 'اكتشف أفضل الخدمات المحلية في جميع أنحاء العراق',
      ku: 'باشترین خزمەتگوزارییە ناوخۆییەکان لە سەرانسەری عێراق بدۆزەرەوە'
    },
    showing: {
      en: 'Showing',
      ar: 'عرض',
      ku: 'پیشاندانی'
    },
    of: {
      en: 'of',
      ar: 'من',
      ku: 'لە'
    },
    services: {
      en: 'local services across Iraq',
      ar: 'خدمة محلية في العراق',
      ku: 'خزمەتگوزاری ناوخۆیی لە عێراق'
    },
    grid: {
      en: 'Grid',
      ar: 'شبكة',
      ku: 'تۆڕ'
    },
    map: {
      en: 'Map',
      ar: 'خريطة',
      ku: 'نەخشە'
    },
    manage: {
      en: 'Manage Business',
      ar: 'إدارة الأعمال',
      ku: 'بەڕێوەبردنی کار'
    },
    addBusiness: {
      en: 'Add Business',
      ar: 'أضف عملك',
      ku: 'کارەکەت زیاد بکە'
    },
    settings: {
      en: 'Settings',
      ar: 'الإعدادات',
      ku: 'ڕێکخستنەکان'
    },
    signOut: {
      en: 'Sign Out',
      ar: 'تسجيل الخروج',
      ku: 'چوونەدەرەوە'
    },
    dashboard: {
      en: 'Business Dashboard',
      ar: 'لوحة تحكم الأعمال',
      ku: 'داشبۆردی بازرگانی'
    },
    owner: {
      en: 'Owner',
      ar: 'مالك',
      ku: 'خاوەن'
    },
    member: {
      en: 'Member',
      ar: 'عضو',
      ku: 'ئەندام'
    }
  };

  return (
    <div className="min-h-screen bg-bg-light selection:bg-primary/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode}
      />
      <BusinessDetailModal business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />
      {/* Header */}
      <header className="sticky top-0 z-[60] bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Branch (English Only) */}
          <div 
            className="flex items-center gap-2 group cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-500">
              <span className="text-white font-black text-xl poppins-bold">S</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-text-main poppins-bold tracking-tight leading-none">Saku Maku</h1>
              <p className="text-[8px] text-primary font-black uppercase tracking-[0.2em] mt-0.5">Iraqi Directory</p>
            </div>
          </div>

          {/* Center: Language Only (Search moved to Hero) */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-full border border-slate-200">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${language === 'en' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${language === 'ar' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}
              >
                عربي
              </button>
              <button 
                onClick={() => setLanguage('ku')}
                className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${language === 'ku' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}
              >
                کوردی
              </button>
            </div>
          </div>

          {/* Right: Registration/User */}
          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
            ) : (
              <>
                {user && (
                  <button 
                    onClick={() => setIsAddBusinessModalOpen(true)}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-text-main text-[10px] font-black rounded-xl hover:border-primary hover:text-primary transition-all uppercase tracking-widest"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{translations.addBusiness[language]}</span>
                  </button>
                )}

                {user && profile?.role === 'business_owner' && (
                  <Link 
                    to="/dashboard"
                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-secondary text-bg-dark text-[10px] font-black rounded-xl shadow-lg shadow-secondary/20 hover:bg-secondary-dark hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>{translations.dashboard[language]}</span>
                  </Link>
                )}

                {!user ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setAuthMode('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-text-main text-[10px] font-black rounded-xl hover:border-primary hover:text-primary transition-all uppercase tracking-widest"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{translations.addBusiness[language]}</span>
                    </button>
                    <button 
                      onClick={() => {
                        setAuthMode('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-4 py-2 text-text-muted text-[10px] font-black rounded-xl hover:text-primary transition-all uppercase tracking-widest"
                    >
                      {language === 'ar' ? 'دخول' : language === 'ku' ? 'چوونەژوورەوە' : 'Login'}
                    </button>
                    <button 
                      onClick={() => {
                        setAuthMode('signup');
                        setIsAuthModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-bg-dark text-[10px] font-black rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{language === 'ar' ? 'تسجيل' : language === 'ku' ? 'تۆمارکردن' : 'Register'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1 rounded-xl bg-white border border-slate-200 hover:border-primary transition-all shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-[10px] font-black">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-[70] overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-slate-100 mb-2 bg-slate-50/50">
                            <p className="text-[10px] font-black text-text-main truncate">{profile?.full_name || user.email}</p>
                            <p className="text-[8px] font-bold text-text-muted truncate mt-0.5 opacity-60">{user.email}</p>
                            {profile?.role === 'business_owner' && (
                              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-secondary/10 text-secondary rounded-full">
                                <Briefcase className="w-2.5 h-2.5" />
                                <span className="text-[7px] font-black uppercase tracking-widest">{translations.owner[language]}</span>
                              </div>
                            )}
                          </div>
                          
                          {profile?.role === 'business_owner' && (
                            <Link 
                              to="/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-text-muted hover:bg-slate-50 hover:text-secondary flex items-center gap-3 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" /> {translations.dashboard[language]}
                            </Link>
                          )}

                          <button className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-text-muted hover:bg-slate-50 hover:text-primary flex items-center gap-3 transition-colors">
                            <Settings className="w-4 h-4" /> {translations.settings[language]}
                          </button>
                          
                          <div className="h-px bg-slate-100 my-1" />
                          
                          <button 
                            onClick={() => {
                              signOut();
                              setShowUserMenu(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> {translations.signOut[language]}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pb-24">
        {/* 1. Hero Section */}
        <HeroSection 
          businesses={businesses} 
          onBusinessClick={setSelectedBusiness} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="max-w-7xl mx-auto">
          {/* 2. Quick Filters & Categories */}
          <div className="max-w-xl mx-auto pt-8">
            {/* Dropdown Filters (Utility) */}
            <LocationFilter businesses={businesses} />

            {/* Compact Category Grid (Discovery) */}
            <div className="px-4 mb-12">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-black text-bg-dark poppins-bold uppercase tracking-tight">
                  {language === 'ar' ? 'استكشف الفئات' : language === 'ku' ? 'پۆلەکان بگەڕێ' : 'Explore Categories'}
                </h2>
              </div>
              <CategoryGrid />
            </div>
          </div>

          <div className="max-w-xl mx-auto">
            {/* 3. Featured Businesses (One Line) */}
            <div className="px-4 mb-12">
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-sm font-black text-text-main poppins-bold uppercase tracking-tight flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  {language === 'ar' ? 'أماكن مميزة' : language === 'ku' ? 'شوێنە دیارەکان' : 'Featured Businesses'}
                </h2>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                {businesses.filter(b => b.isFeatured).slice(0, 10).map(business => (
                  <button 
                    key={business.id}
                    onClick={() => setSelectedBusiness(business)}
                    className="flex-shrink-0 w-64 group"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 shadow-lg border border-slate-100">
                      <img 
                        src={business.image || `https://picsum.photos/seed/${business.id}/400/225`} 
                        alt={business.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 via-bg-dark/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <p className="text-white font-black text-xs truncate uppercase tracking-tight">{language === 'ar' ? business.nameAr || business.name : business.name}</p>
                        <p className="text-primary text-[9px] font-black uppercase tracking-widest mt-0.5">
                          {CATEGORIES.find(c => c.id === business.category)?.name[language] || business.category} • {business.governorate}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Trending / Discovery (One Line) */}
            <div className="px-4 mb-12">
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-sm font-black text-text-main poppins-bold uppercase tracking-tight flex items-center gap-2">
                  <div className="w-1 h-4 bg-secondary rounded-full" />
                  {language === 'ar' ? `رائج في ${useHomeStore.getState().selectedGovernorate || 'العراق'}` : language === 'ku' ? `لە ${useHomeStore.getState().selectedGovernorate || 'عێراق'} باوە` : `Trending in ${useHomeStore.getState().selectedGovernorate || 'Iraq'}`}
                </h2>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                {businesses.slice(0, 12).map(business => (
                  <button 
                    key={business.id}
                    onClick={() => setSelectedBusiness(business)}
                    className="flex-shrink-0 w-48 group"
                  >
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 shadow-md border border-slate-100">
                      <img 
                        src={business.image || `https://picsum.photos/seed/${business.id}/300/300`} 
                        alt={business.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-bg-dark/40 group-hover:bg-bg-dark/10 transition-colors" />
                      <div className="absolute bottom-2 left-2 right-2 text-left">
                        <p className="text-white text-[9px] font-black truncate uppercase tracking-tight">{language === 'ar' ? business.nameAr || business.name : business.name}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Platform Activity (Live Feed) */}
            <div className="px-4 mb-12">
              <div className="flex items-center gap-2 mb-6 px-1">
                <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                <h2 className="text-sm font-black text-text-main poppins-bold uppercase tracking-tight">
                  {language === 'ar' ? 'آخر الأخبار والنشاطات' : language === 'ku' ? 'دوایین چالاکییەکان' : 'Live Platform Activity'}
                </h2>
              </div>
              <FeedComponent businesses={businesses} loading={businessesLoading} />
            </div>

            {/* 6. Main Business Listing Grouped by Category */}
            <div id="business-grid" className="px-4 mb-12 space-y-16">
              {CATEGORIES.filter(cat => {
                // Only show categories that have businesses in the current list
                return businesses.some(b => b.category === cat.id);
              }).map(category => {
                const categoryBusinesses = businesses.filter(b => b.category === category.id);
                if (categoryBusinesses.length === 0) return null;

                return (
                    <div key={category.id} className="space-y-6">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <category.icon className="w-4 h-4" />
                          </div>
                          <h2 className="text-lg font-black text-text-main poppins-bold uppercase tracking-tight">
                            {category.name[language]}
                          </h2>
                        </div>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                          {categoryBusinesses.length} {language === 'ar' ? 'منشأة' : language === 'ku' ? 'شوێن' : 'Places'}
                        </span>
                      </div>
                      
                      <BusinessGrid 
                        businesses={expandedCategories.has(category.id) ? categoryBusinesses : categoryBusinesses.slice(0, 3)} 
                        loading={businessesLoading}
                        onBusinessClick={setSelectedBusiness}
                      />

                      {categoryBusinesses.length > 3 && (
                        <button 
                          onClick={() => toggleCategoryExpansion(category.id)}
                          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-text-muted uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
                        >
                          {expandedCategories.has(category.id) 
                            ? (language === 'ar' ? 'عرض أقل' : language === 'ku' ? 'بینینی کەمتر' : 'Show Less')
                            : (language === 'ar' ? 'عرض المزيد في هذا التصنيف' : language === 'ku' ? 'بینینی زیاتر لەم پۆلەدا' : `View More in ${category.name[language]}`)
                          }
                        </button>
                      )}
                    </div>
                );
              })}

              {/* General/Other Category for businesses without a matching category */}
              {businesses.filter(b => !CATEGORIES.some(c => c.id === b.category)).length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg font-black text-bg-dark poppins-bold uppercase tracking-tight">
                        {language === 'ar' ? 'أخرى' : language === 'ku' ? 'ئەوانی تر' : 'Other'}
                      </h2>
                    </div>
                  </div>
                  <BusinessGrid 
                    businesses={businesses.filter(b => !CATEGORIES.some(c => c.id === b.category)).slice(0, 3)} 
                    loading={businessesLoading}
                    onBusinessClick={setSelectedBusiness}
                  />
                </div>
              )}

              {/* Global Load More */}
              {hasMore && (
                <div className="flex flex-col items-center gap-6 py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                      Showing {businesses.length} of {totalCount} local services
                    </div>
                    <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${(businesses.length / totalCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={loadMore}
                    disabled={businessesLoading}
                    className="px-12 py-5 bg-bg-dark text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-[24px] hover:bg-primary hover:text-bg-dark transition-all duration-500 shadow-xl"
                  >
                    {businessesLoading ? 'Loading...' : 'Load More Businesses'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AddBusinessModal 
        isOpen={isAddBusinessModalOpen} 
        onClose={() => setIsAddBusinessModalOpen(false)}
        onSuccess={() => refresh()}
      />

      {/* Footer */}
      <footer className="bg-bg-dark text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                  <span className="text-white font-black text-2xl poppins-bold">S</span>
                </div>
                <h3 className="text-3xl font-black poppins-bold tracking-tighter">Saku Maku</h3>
              </div>
              <p className="text-slate-400 leading-relaxed mb-10 text-base max-w-sm">
                Iraq's most trusted business discovery platform. Connecting millions of users with local businesses across all 19 governorates.
              </p>
              <div className="flex gap-4">
                {['facebook', 'instagram', 'twitter', 'linkedin'].map(social => (
                  <a key={social} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-500 group">
                    <span className="text-[10px] font-black uppercase tracking-tighter group-hover:scale-110 transition-transform">{social.slice(0, 2)}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8">Directory</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Categories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Popular Cities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Featured Listings</a></li>
                <li><a href="#" className="hover:text-white transition-colors">New Businesses</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8">For Business</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Claim Listing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Advertise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8">Mobile App</h4>
              <p className="text-sm text-slate-500 mb-8 font-medium">Download the Saku Maku app for the best experience on the go.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#" className="flex-1 bg-white/5 border border-white/10 p-4 rounded-[20px] flex items-center gap-4 hover:bg-white/10 transition-all group">
                  <div className="text-3xl group-hover:scale-110 transition-transform">🍎</div>
                  <div>
                    <p className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Available on</p>
                    <p className="text-sm font-black">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex-1 bg-white/5 border border-white/10 p-4 rounded-[20px] flex items-center gap-4 hover:bg-white/10 transition-all group">
                  <div className="text-3xl group-hover:scale-110 transition-transform">🤖</div>
                  <div>
                    <p className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Get it on</p>
                    <p className="text-sm font-black">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
            <p>&copy; {new Date().getFullYear()} Saku Maku. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20 font-black text-[10px]">SM</div>
              <div className="flex gap-12">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
