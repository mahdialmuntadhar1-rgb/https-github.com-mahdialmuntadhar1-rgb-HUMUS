import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Briefcase, MapPin, Phone, Globe, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useHomeStore } from '@/stores/homeStore';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  'Restaurant', 'Cafe', 'Hotel', 'Hospital', 'Clinic', 'Pharmacy',
  'Supermarket', 'Shopping', 'Gym', 'Salon', 'Car Repair', 'Electronics',
  'Education', 'Real Estate', 'Travel', 'Bank', 'Other'
];

const governorates = [
  'Baghdad', 'Basra', 'Mosul', 'Erbil', 'Sulaymaniyah', 'Duhok',
  'Kirkuk', 'Najaf', 'Karbala', 'Hilla', 'Diyala', 'Anbar',
  'Salahuddin', 'Dhi Qar', 'Muthanna', 'Wasit', 'Babil', 'Qadisiyah'
];

export default function AddBusinessModal({ isOpen, onClose }: AddBusinessModalProps) {
  const { language } = useHomeStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: '',
    governorate: '',
    city: '',
    address: '',
    website: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const translations = {
    title: {
      en: 'Add Your Business',
      ar: 'أضف عملك',
      ku: 'کارەکەت زیاد بکە'
    },
    subtitle: {
      en: 'List your business on Saku Maku and reach thousands of customers',
      ar: 'سجل عملك في شكو ماكو ووصل إلى آلاف العملاء',
      ku: 'کاری خۆت لە ساکو ماکو تۆمار بکە و گەیشتن بە هەزاران کڕیار'
    },
    businessName: {
      en: 'Business Name',
      ar: 'اسم العمل',
      ku: 'ناوی کار'
    },
    phone: {
      en: 'Phone Number',
      ar: 'رقم الهاتف',
      ku: 'ژمارەی تەلەفۆن'
    },
    category: {
      en: 'Category',
      ar: 'الفئة',
      ku: 'پۆل'
    },
    governorate: {
      en: 'Governorate',
      ar: 'المحافظة',
      ku: 'پارێزگا'
    },
    city: {
      en: 'City',
      ar: 'المدينة',
      ku: 'شار'
    },
    address: {
      en: 'Address',
      ar: 'العنوان',
      ku: 'ناونیشان'
    },
    website: {
      en: 'Website (Optional)',
      ar: 'الموقع الإلكتروني (اختياري)',
      ku: 'وێبسایت (بەدیل)'
    },
    description: {
      en: 'Description (Optional)',
      ar: 'الوصف (اختياري)',
      ku: 'وصف (بەدیل)'
    },
    submit: {
      en: 'Submit Business',
      ar: 'تقديم العمل',
      ku: 'پێشکەشکردنی کار'
    },
    success: {
      en: 'Business submitted successfully! We will review it shortly.',
      ar: 'تم تقديم العمل بنجاح! سنقوم بمراجعته قريباً.',
      ku: 'کار بە سەرکەوتوویی پێشکەش کرا! ئێمە بەزووری دەپشکۆین.'
    },
    error: {
      en: 'Failed to submit business. Please try again.',
      ar: 'فشل في تقديم العمل. يرجى المحاولة مرة أخرى.',
      ku: 'شکستی هێنا لە پێشکەشکردنی کار. تکایە هەوڵبدەرەوە.'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.phone.trim() || 
          !formData.category || !formData.governorate || !formData.city.trim()) {
        throw new Error('Please fill in all required fields');
      }

      // Submit to Supabase
      const { data, error: insertError } = await supabase
        .from('businesses')
        .insert([{
          name: formData.name.trim(),
          phone: formData.phone.replace(/[^\d+]/g, ''),
          category: formData.category,
          governorate: formData.governorate,
          city: formData.city.trim(),
          address: formData.address.trim() || null,
          website: formData.website.trim() || null,
          description: formData.description.trim() || null,
          status: 'pending',
          verified: false
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          name: '',
          phone: '',
          category: '',
          governorate: '',
          city: '',
          address: '',
          website: '',
          description: ''
        });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.error[language]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-text-main poppins-bold">
                  {translations.title[language]}
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  {translations.subtitle[language]}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {success ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-bold text-green-600">
                  {translations.success[language]}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Name */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">
                      {translations.businessName[language]} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder={translations.businessName[language]}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">
                      {translations.phone[language]} *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="+964 7XX XXX XXX"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">
                      {translations.category[language]} *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Governorate */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">
                      {translations.governorate[language]} *
                    </label>
                    <select
                      value={formData.governorate}
                      onChange={(e) => handleChange('governorate', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    >
                      <option value="">Select governorate</option>
                      {governorates.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">
                      {translations.city[language]} *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder={translations.city[language]}
                      required
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">
                      {translations.website[language]}
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">
                    {translations.address[language]}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder={translations.address[language]}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">
                    {translations.description[language]}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder={translations.description[language]}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {translations.submit[language]}
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
