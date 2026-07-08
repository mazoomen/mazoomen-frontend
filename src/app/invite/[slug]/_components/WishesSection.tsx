'use client';

import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Heart, CheckCircle2, Camera, X } from 'lucide-react';
import api from '@/lib/api';
import type { CreateRsvpPayload } from '@/types/invitation';

interface Wish {
  name: string;
  text: string;
}

interface WishesSectionProps {
  invitationId: string;
  eventTitle: string;
  images: string[];
  welcomeText?: string | null;
  viewingLang?: string;
  allowGuestUploads: boolean;
  moments: string[];
  ownerId?: string;
  onMomentUploaded?: (updatedInvitation: any) => void;
  wishes?: Wish[];
}

export const WishesSection: React.FC<WishesSectionProps> = ({
  invitationId,
  eventTitle,
  images,
  welcomeText,
  viewingLang,
  allowGuestUploads,
  moments: initialMoments = [],
  ownerId,
  onMomentUploaded,
  wishes: initialWishes = []
}) => {
  const isEn = viewingLang === "en";
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [moments, setMoments] = useState<string[]>(initialMoments);
  const [isUploading, setIsUploading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Close lightbox on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  useEffect(() => {
    setWishes(initialWishes);
  }, [initialWishes]);

  useEffect(() => {
    setMoments(initialMoments);
  }, [initialMoments]);

  // Determine if the current visitor is the owner
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored && ownerId) {
        try {
          const user = JSON.parse(stored);
          if (user && user.id === ownerId) {
            setIsOwner(true);
          }
        } catch { }
      }
    }
  }, [ownerId]);

  const [newWish, setNewWish] = useState('');
  const [guestName, setGuestName] = useState('');
  const [attendance, setAttendance] = useState<'YES' | 'NO' | null>(null);
  const [companionsCount, setCompanionsCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Couple names helper
  const getCoupleNames = (title: string) => {
    const delimiters = [' & ', ' and ', ' و ', ' مع '];
    for (const d of delimiters) {
      if (title.includes(d)) {
        const parts = title.split(d);
        return {
          groom: parts[0]?.trim() || (isEn ? 'Groom' : 'العريس'),
          bride: parts[1]?.trim() || (isEn ? 'Bride' : 'العروس')
        };
      }
    }
    return { groom: title, bride: '' };
  };

  const { groom, bride } = getCoupleNames(eventTitle);

  // Fallbacks for images
  const featuredImage = images && images.length > 0
    ? images[0]
    : '/base44.app/api/apps/6966e1f30fa9fbe508239391/files/public/6966e1f30fa9fbe508239391/eedced598_IMG_2319.jpeg';

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || attendance === null) return;

    setStatus('submitting');
    setErrorMsg('');

    const payload: CreateRsvpPayload = {
      invitationId,
      name: guestName.trim(),
      attendance,
      guestsCount: attendance === 'YES' ? companionsCount : 0,
      message: newWish.trim() || undefined
    };

    try {
      await api.post('/rsvp', payload);

      // If they left a wish message, prepend it to the scroll list locally
      if (newWish.trim()) {
        setWishes([{ name: guestName.trim(), text: newWish.trim() }, ...wishes]);
      }

      setStatus('success');
      setGuestName('');
      setNewWish('');
      setAttendance(null);
      setCompanionsCount(0);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(
        err.response?.data?.message ||
        (isEn ? 'An error occurred while sending your response. Please try again.' : 'حدث خطأ أثناء إرسال ردك. يرجى المحاولة مرة أخرى.')
      );
    }
  };

  const handleCameraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload file to static folder
      const uploadRes = await api.post<{ url: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. Append URL to invitation moments
      const momentUrl = uploadRes.data.url;
      const saveRes = await api.post(`/invitations/${invitationId}/moments`, { url: momentUrl });

      // 3. Update local state
      if (saveRes.data && saveRes.data.moments) {
        setMoments(saveRes.data.moments);
      } else {
        setMoments(prev => [...prev, momentUrl]);
      }

      if (onMomentUploaded && saveRes.data) {
        onMomentUploaded(saveRes.data);
      }
    } catch (err) {
      console.error("Camera upload failed:", err);
      alert(isEn ? "Failed to upload photo. Please try again." : "فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = allowGuestUploads;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mazoom-backend.onrender.com';

  return (
    <div id="rsvp-section" className="space-y-8" dir={isEn ? "ltr" : "rtl"}>
      {/* Bride & Groom Message */}
      <div className="text-center mb-8">
        <h3 className="text-base mb-4 tracking-wide text-[#ac8c60] font-semibold">{isEn ? "Bride & Groom Message" : "رسالة العروسين"}</h3>
        <p className="text-base whitespace-pre-line mb-4 text-black leading-relaxed">
          {isEn
            ? `Our joy is incomplete without you\nYour presence is an honor, and your prayers are our support\nJoin us in this beautiful beginning 🤍`
            : `فرحتنا لا تكتمل إلا بكم\nوجودكم شرف، ودعاؤكم سند\nشاركونا أجمل بداية 🤍`}
        </p>
        <p className="text-base text-black font-semibold">
          {isEn ? "With love, " : "بمحبة ، "}{groom}{bride ? ` & ${bride}` : ''}
        </p>
      </div>

      {/* Featured Image */}
      <div className="mb-8">
        <div
          onClick={() => setSelectedImage(featuredImage.startsWith('/public') ? baseUrl + featuredImage : featuredImage)}
          className="w-full aspect-video rounded-xl bg-cover bg-center shadow-lg transition-all duration-700 cursor-zoom-in hover:opacity-90 active:scale-[0.99] transition-transform"
          style={{ backgroundImage: `url("${featuredImage.startsWith('/public') ? baseUrl + featuredImage : featuredImage}")` }}
        />
      </div>

      {/* Moments Gallery */}
      <div id="moments-section" className="mb-8">
        <h3 className="text-center text-xl mb-4 font-sans">{isEn ? "Moments from the wedding" : "لحظات من الحفل"}</h3>

        {moments.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 border border-dashed border-neutral-300 rounded-[22px] mb-4 font-sans text-xs bg-white/30 backdrop-blur-md">
            {isEn ? "No moments captured yet. Be the first!" : "لا توجد صور ملتقطة بعد. كن أول من يشاركنا لحظاته!"}
          </div>
        ) : (
          <div className="max-h-[380px] md:max-h-[500px] overflow-y-auto pr-1 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {moments.map((src, index) => {
                const fullUrl = src.startsWith('/public') ? baseUrl + src : src;
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(fullUrl)}
                    className="aspect-square rounded-xl overflow-hidden shadow-md cursor-zoom-in active:scale-[0.97] transition-transform"
                    style={{ background: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '22px' }}
                  >
                    <img src={fullUrl} alt="Captured moment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {canUpload && (
          <div className="flex justify-center mt-3">
            <label className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-full border border-black/15 shadow-xs backdrop-blur-md hover:bg-black/5 cursor-pointer bg-white/60 text-black">
              <Camera className="w-4 h-4 text-[#ac8c60]" />
              {isUploading ? (isEn ? "Uploading..." : "جاري الرفع...") : (isEn ? "Capture Moment" : "شاركنا لحظة")}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Guest Attendance Count */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="w-4 h-4 text-black" />
          <span className="text-xs tracking-widest uppercase text-black">{isEn ? "GUESTS COUNT" : "عدد الحضور"}</span>
        </div>
        <div className="text-4xl font-light mb-3 text-[#ac8c60]">219</div>
        <div className="mx-auto w-16 h-px bg-black/10" />
      </div>

      {/* Elegant RSVP Form Card */}
      <div
        className="p-6 mb-8"
        style={{
          backdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'rgba(0, 0, 0, 0.15) 0px 8px 32px',
          borderRadius: '24px'
        }}
      >
        <h3 className="text-center text-xl mb-4 font-semibold text-black flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 text-[#ac8c60] fill-[#ac8c60]" />
          {isEn ? "Confirm Attendance (RSVP)" : "تأكيد حضور الحفل (RSVP)"}
        </h3>

        {status === 'success' ? (
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-600" />
            </div>
            <h4 className="text-lg font-semibold text-emerald-800">{isEn ? "Attendance Registered Successfully!" : "تم تسجيل حضورك بنجاح!"}</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {isEn
                ? "We are honored and delighted to share our joy with you. Looking forward to seeing you!"
                : "يسعدنا ويشرفنا حضوركم الكريم لمشاركتنا فرحتنا. نتطلع للقائكم في الحفل 🤍"}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 px-6 py-2 text-xs font-semibold rounded-full border border-black/15 hover:bg-black/5 text-black cursor-pointer font-sans"
            >
              {isEn ? "Submit another RSVP" : "تسجيل حضور آخر"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleRsvpSubmit} className={`space-y-4 ${isEn ? "text-left" : "text-right"}`}>
            {/* Guest Name */}
            <div>
              <label htmlFor="guest-name" className="block text-sm font-medium text-black mb-1">{isEn ? "Your Full Name" : "الاسم الكريم"}</label>
              <input
                id="guest-name"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={isEn ? "Enter your full name" : "أدخل اسمك الكامل"}
                required
                className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#ac8c60] ${isEn ? "text-left" : "text-right"}`}
              />
            </div>

            {/* Attendance Choice */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">{isEn ? "Will you honor us with your presence?" : "هل ستشرفنا بحضورك؟"}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAttendance('YES')}
                  className={`py-2.5 rounded-xl border font-semibold text-sm transition-all duration-300 cursor-pointer ${attendance === 'YES'
                      ? 'bg-[#ac8c60] text-white border-[#ac8c60]'
                      : 'bg-white/40 border-gray-200 text-black hover:bg-white/60'
                    }`}
                >
                  {isEn ? "Yes, gladly" : "نعم، بكل سرور"}
                </button>
                <button
                  type="button"
                  onClick={() => setAttendance('NO')}
                  className={`py-2.5 rounded-xl border font-semibold text-sm transition-all duration-300 cursor-pointer ${attendance === 'NO'
                      ? 'bg-red-700/20 text-red-900 border-red-300'
                      : 'bg-white/40 border-gray-200 text-black hover:bg-white/60'
                    }`}
                >
                  {isEn ? "Apologize, wishing you all the best" : "أعتذر، متمنياً لكم التوفيق"}
                </button>
              </div>
            </div>

            {/* Companions Count */}
            {attendance === 'YES' && (
              <div className="animate-fade-in">
                <label htmlFor="companions-count" className="block text-sm font-medium text-black mb-1">{isEn ? "Number of companions" : "عدد المرافقين"}</label>
                <select
                  id="companions-count"
                  value={companionsCount}
                  onChange={(e) => setCompanionsCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#ac8c60]"
                >
                  <option value={0}>{isEn ? "Just me (no companions)" : "أنا فقط (بدون مرافقين)"}</option>
                  <option value={1}>{isEn ? "1 Companion (+1)" : "مرافق واحد (+1)"}</option>
                  <option value={2}>{isEn ? "2 Companions (+2)" : "مرافقين اثنين (+2)"}</option>
                  <option value={3}>{isEn ? "3 Companions (+3)" : "ثلاثة مرافقين (+3)"}</option>
                  <option value={4}>{isEn ? "4 Companions (+4)" : "أربعة مرافقين (+4)"}</option>
                  <option value={5}>{isEn ? "5 Companions (+5)" : "خمسة مرافقين (+5)"}</option>
                </select>
              </div>
            )}

            {/* Guest Message/Wish */}
            <div>
              <label htmlFor="wish-text" className="block text-sm font-medium text-black mb-1">{isEn ? "Congratulate the newlyweds (Optional)" : "تهنئة للعروسين (اختياري)"}</label>
              <textarea
                id="wish-text"
                rows={2}
                value={newWish}
                onChange={(e) => setNewWish(e.target.value)}
                placeholder={isEn ? "Write your beautiful wishes here..." : "اكتب تهنئتك الجميلة للعروسين..."}
                className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#ac8c60] resize-none ${isEn ? "text-left" : "text-right"}`}
              />
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="text-center text-sm text-red-700 bg-red-50 p-2.5 rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'submitting' || !guestName.trim() || attendance === null}
              className="w-full py-3 font-semibold text-white rounded-xl shadow-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: 'linear-gradient(135deg, rgb(200, 162, 74), rgb(172, 140, 96))' }}
            >
              {status === 'submitting' ? (isEn ? 'Submitting...' : 'جاري إرسال ردكم...') : (isEn ? 'Confirm RSVP' : 'تأكيد الرد')}
            </button>
          </form>
        )}
      </div>

      {/* Wishes List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 justify-center mb-2">
          <MessageCircle className="w-3 h-3 text-black" />
          <p className="text-xs tracking-widest uppercase text-black font-semibold">{isEn ? "Guests Wishes & Congratulations" : "تهاني وتبريكات الضيوف"}</p>
        </div>

        {/* Wish entry list container */}
        <div className="space-y-3 overflow-y-auto px-2 wishes-scroll max-h-[420px]" style={{ scrollbarWidth: 'none' }}>
          {wishes.map((wish, index) => (
            <div
              key={index}
              className="p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '22px',
                boxShadow: 'rgba(0, 0, 0, 0.08) 0px 2px 8px'
              }}
            >
              <p className="text-sm text-center leading-relaxed text-[#ac8c60] font-semibold mb-1">"{wish.text}"</p>
              <p className="text-[10px] text-center text-gray-500 font-medium">— {wish.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-6 right-6 z-[100000] p-2 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image viewer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div
            className="relative max-w-[90%] max-h-[85%] flex items-center justify-center animate-fade-in"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          >
            <img
              src={selectedImage}
              alt="Zoomed preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10 select-none animate-scale-up"
            />
          </div>

          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleUp {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .animate-fade-in {
              animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .animate-scale-up {
              animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};
