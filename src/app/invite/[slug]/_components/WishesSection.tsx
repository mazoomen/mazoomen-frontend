'use client';

import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Heart, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import type { CreateRsvpPayload } from '@/types/invitation';

interface Wish {
  name: string;
  text: string;
}

const defaultWishesAr: Wish[] = [
  { name: 'محمد العلي', text: 'ألف مبروك! نسعد بحضور حفلكم الكريم.' },
  { name: 'سارة خالد', text: 'بارك الله لكما وبارك عليكما وجمع بينكما في خير 🤍' },
  { name: 'أحمد وندى', text: 'الله يتمم لكم على خير يا رب، فرحنا لكم من قلب.' },
  { name: 'عبدالله السعد', text: 'دعواتنا لكم بحياة سعيدة ومباركة.' }
];

const defaultWishesEn: Wish[] = [
  { name: 'John Doe', text: 'Congratulations! Wish you a happy marriage.' },
  { name: 'Sarah & Michael', text: 'May Allah bless you both and join you in goodness 🤍' },
  { name: 'Emma Watson', text: 'So happy for you two, wishing you all the best.' },
  { name: 'Alex Cooper', text: 'Wishing you a lifetime of love and happiness.' }
];

interface WishesSectionProps {
  invitationId: string;
  eventTitle: string;
  images: string[];
  welcomeText?: string | null;
  viewingLang?: string;
}

export const WishesSection: React.FC<WishesSectionProps> = ({
  invitationId,
  eventTitle,
  images,
  welcomeText,
  viewingLang
}) => {
  const isEn = viewingLang === "en";
  const [wishes, setWishes] = useState<Wish[]>(isEn ? defaultWishesEn : defaultWishesAr);
  
  useEffect(() => {
    setWishes(isEn ? defaultWishesEn : defaultWishesAr);
  }, [viewingLang]);

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

  const galleryImages = images && images.length > 1
    ? images.slice(1, 5)
    : [
        '/base44.app/api/apps/6966e1f30fa9fbe508239391/files/mp/public/6966e1f30fa9fbe508239391/047e50eca_cap-1781622878182.jpg',
        '/base44.app/api/apps/6966e1f30fa9fbe508239391/files/mp/public/6966e1f30fa9fbe508239391/f605b8cc1_cap-1781418097652.jpg',
        '/base44.app/api/apps/6966e1f30fa9fbe508239391/files/mp/public/6966e1f30fa9fbe508239391/0a5601ba5_cap-1781048585757.jpg',
        '/base44.app/api/apps/6966e1f30fa9fbe508239391/files/mp/public/6966e1f30fa9fbe508239391/68d0ae61f_cap-1780335237305.jpg'
      ];

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
          className="w-full aspect-video rounded-xl bg-cover bg-center shadow-lg transition-all duration-700" 
          style={{ backgroundImage: `url("${featuredImage}")` }}
        />
      </div>

      {/* Moments Gallery */}
      <div id="moments-section" className="mb-8">
        <h3 className="text-center text-xl mb-4">{isEn ? "Moments from the wedding" : "لحظات من الحفل"}</h3>
        <div className="grid grid-cols-2 gap-3">
          {galleryImages.map((src, index) => (
            <div key={index} className="aspect-square rounded-xl overflow-hidden shadow-md" style={{ background: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '22px' }}>
              <img src={src} alt="Captured moment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
          ))}
        </div>
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
              className="mt-4 px-6 py-2 text-xs font-semibold rounded-full border border-black/15 hover:bg-black/5 text-black"
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
                  className={`py-2.5 rounded-xl border font-semibold text-sm transition-all duration-300 ${
                    attendance === 'YES'
                      ? 'bg-[#ac8c60] text-white border-[#ac8c60]'
                      : 'bg-white/40 border-gray-200 text-black hover:bg-white/60'
                  }`}
                >
                  {isEn ? "Yes, gladly" : "نعم، بكل سرور"}
                </button>
                <button
                  type="button"
                  onClick={() => setAttendance('NO')}
                  className={`py-2.5 rounded-xl border font-semibold text-sm transition-all duration-300 ${
                    attendance === 'NO'
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
    </div>
  );
};
