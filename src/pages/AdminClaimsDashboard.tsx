import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useAdminClaims } from '@/hooks/useAdminClaims';
import { useHomeStore } from '@/stores/homeStore';

export default function AdminClaimsDashboard() {
  const { language } = useHomeStore();
  const { claims, loading, error, isAdmin, fetchClaims, approveClaim, rejectClaim } = useAdminClaims();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingClaimId, setRejectingClaimId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const translations = {
    title: {
      en: 'Business Claim Requests',
      ar: 'طلبات المطالبة بالأعمال',
      ku: 'داوکارییەکانی داوای کار',
    },
    subtitle: {
      en: 'Review and approve business ownership claims',
      ar: 'راجع ووافق على طلبات ملكية الأعمال',
      ku: 'بسەری بەرەوە و پەسەند بکە داوای خاوەندارییەتی کار',
    },
    noAccess: {
      en: 'Admin access required',
      ar: 'مطلوب صلاحيات المسؤول',
      ku: 'دەستگەیشتنی ئەدمین پێویستە',
    },
    noClaims: {
      en: 'No claim requests found',
      ar: 'لم يتم العثور على طلبات مطالبة',
      ku: 'هیچ داوای داواکاری نەدۆزرایەوە',
    },
    filterAll: { en: 'All', ar: 'الكل', ku: 'هەموو' },
    filterPending: { en: 'Pending', ar: 'قيد الانتظار', ku: 'لە چاوەڕێ' },
    filterApproved: { en: 'Approved', ar: 'موافق عليه', ku: 'پەسەندکراو' },
    filterRejected: { en: 'Rejected', ar: 'مرفوض', ku: 'ڕەتکراوە' },
    approve: { en: 'Approve', ar: 'موافقة', ku: 'پەسەندکردن' },
    reject: { en: 'Reject', ar: 'رفض', ku: 'ڕەتکردنەوە' },
    rejecting: { en: 'Rejecting...', ar: 'جاري الرفض...', ku: 'ڕەتکردنەوە...' },
    approving: { en: 'Approving...', ar: 'جاري الموافقة...', ku: 'پەسەندکردن...' },
    rejectReason: { en: 'Rejection reason (optional)', ar: 'سبب الرفض (اختياري)', ku: 'هۆکاری ڕەتکردنەوە (ئارەزوومەندی)' },
    cancel: { en: 'Cancel', ar: 'إلغاء', ku: 'پاشگەزبوونەوە' },
    confirmReject: { en: 'Confirm Rejection', ar: 'تأكيد الرفض', ku: 'دووپاتیکردنەوەی ڕەتکردنەوە' },
    businessInfo: { en: 'Business Information', ar: 'معلومات العمل', ku: 'زانیاری کار' },
    userInfo: { en: 'User Information', ar: 'معلومات المستخدم', ku: 'زانیاری بەکارهێنەر' },
    submittedAt: { en: 'Submitted', ar: 'قدم', ku: 'نێردرا' },
    reviewedAt: { en: 'Reviewed', ar: 'راجع', ku: 'بسەری گیرا' },
    status: { en: 'Status', ar: 'الحالة', ku: 'دۆخ' },
  };

  const filteredClaims = claims.filter(claim => {
    if (filter === 'all') return true;
    return claim.status === filter;
  });

  const handleApprove = async (claimId: string) => {
    const success = await approveClaim(claimId);
    if (success) {
      console.log('[Admin Dashboard] Claim approved');
    }
  };

  const handleRejectClick = (claimId: string) => {
    setRejectingClaimId(claimId);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectingClaimId) return;
    const success = await rejectClaim(rejectingClaimId, rejectReason);
    if (success) {
      setShowRejectModal(false);
      setRejectingClaimId(null);
      setRejectReason('');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-red-500 mx-auto" />
          <h3 className="text-xl font-bold text-[#2B2F33]">{translations.noAccess[language]}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2B2F33] poppins-bold">{translations.title[language]}</h1>
          <p className="text-sm text-[#6B7280] mt-1">{translations.subtitle[language]}</p>
        </div>
        <button
          onClick={fetchClaims}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl hover:border-primary hover:text-primary transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-bold">Refresh</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-white border border-[#E5E7EB] hover:border-primary hover:text-primary'
            }`}
          >
            {translations[`filter${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof translations][language]}
            {status !== 'all' && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {claims.filter(c => c.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Claims List */}
      {loading && claims.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px] text-center">
          <div className="space-y-4">
            <Building2 className="w-16 h-16 text-[#9CA3AF] mx-auto" />
            <p className="text-sm text-[#6B7280]">{translations.noClaims[language]}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {claim.status === 'pending' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                      <Clock className="w-3 h-3" />
                      {translations.filterPending[language]}
                    </span>
                  )}
                  {claim.status === 'approved' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {translations.filterApproved[language]}
                    </span>
                  )}
                  {claim.status === 'rejected' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                      <XCircle className="w-3 h-3" />
                      {translations.filterRejected[language]}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#9CA3AF]">
                  {translations.submittedAt[language]}: {new Date(claim.submittedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Business Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#2B2F33] uppercase tracking-[0.3em]">
                  {translations.businessInfo[language]}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-bold text-[#2B2F33]">{claim.business?.name}</p>
                    {claim.business?.nameAr && (
                      <p className="text-xs text-[#6B7280]">{claim.business.nameAr}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs">{claim.business?.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">{claim.business?.city}, {claim.business?.governorate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#2B2F33] uppercase tracking-[0.3em]">
                  {translations.userInfo[language]}
                </h4>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-[#6B7280]" />
                  <span className="font-bold text-[#2B2F33]">{claim.user?.fullName || claim.user?.email}</span>
                  <span className="text-xs text-[#6B7280]">({claim.user?.email})</span>
                </div>
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <Phone className="w-3 h-3" />
                  <span className="text-xs">{claim.phone}</span>
                </div>
              </div>

              {/* Rejection Reason */}
              {claim.status === 'rejected' && claim.rejectionReason && (
                <div className="p-3 bg-red-50 rounded-xl">
                  <p className="text-xs text-red-600">{claim.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              {claim.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-[#E5E7EB]">
                  <button
                    onClick={() => handleApprove(claim.id)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {loading ? translations.approving[language] : translations.approve[language]}
                  </button>
                  <button
                    onClick={() => handleRejectClick(claim.id)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    {translations.reject[language]}
                  </button>
                </div>
              )}

              {/* Reviewed Info */}
              {claim.status !== 'pending' && claim.reviewedAt && (
                <div className="pt-4 border-t border-[#E5E7EB]">
                  <p className="text-[11px] text-[#9CA3AF]">
                    {translations.reviewedAt[language]}: {new Date(claim.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(false)}
              className="absolute inset-0 bg-[#2B2F33]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <h3 className="text-lg font-bold text-[#2B2F33]">{translations.confirmReject[language]}</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={translations.rejectReason[language]}
                className="w-full px-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-primary rounded-xl focus:outline-none transition-all text-sm resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#2B2F33] font-bold rounded-xl hover:border-primary hover:text-primary transition-all"
                >
                  {translations.cancel[language]}
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? translations.rejecting[language] : translations.confirmReject[language]}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
