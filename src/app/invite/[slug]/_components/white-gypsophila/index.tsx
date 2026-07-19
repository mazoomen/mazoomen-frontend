'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { InvitationData } from '@/types/invitation';
import { Calendar, Heart, Info, Baby, QrCode, MessageCircle, Users, CheckCircle2, Phone, Camera, X } from 'lucide-react';
import api from '@/lib/api';
import type { CreateRsvpPayload } from '@/types/invitation';
import { EnvelopeOverlay, BottomNavbar } from '../index';

interface InvitationClientPageWhiteGypsophilaProps {
  invitation: InvitationData;
  slug?: string;
  isDeactivatedInitial?: boolean;
  viewingLangProp?: "ar" | "en";
  setViewingLangProp?: React.Dispatch<React.SetStateAction<"ar" | "en">>;
}

interface Particle {
  id: number;
  type: 'leaf' | 'petal';
  size: number;
  left: number;
  delay: string;
  duration: number;
  drift: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface Wish {
  name: string;
  text: string;
}

export default function InvitationClientPageWhiteGypsophila({
  invitation: initialInvitation,
  slug,
  isDeactivatedInitial = false,
  viewingLangProp,
  setViewingLangProp
}: InvitationClientPageWhiteGypsophilaProps) {
  const isEn = viewingLangProp === "en";
  const [invitation, setInvitation] = useState<InvitationData>(initialInvitation);
  const [isOpen, setIsOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // RSVP Form States
  const [wishes, setWishes] = useState<Wish[]>(invitation.wishes || []);

  useEffect(() => {
    if (invitation.wishes) {
      setWishes(invitation.wishes);
    }
  }, [invitation.wishes]);

  const [newWish, setNewWish] = useState('');
  const [guestName, setGuestName] = useState('');
  const [attendance, setAttendance] = useState<'YES' | 'NO' | null>(null);
  const [companionsCount, setCompanionsCount] = useState(1);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Timeline Refs
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineIndicatorRef = useRef<HTMLDivElement>(null);
  const timelineItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Details Refs
  const detailsContainerRef = useRef<HTMLDivElement>(null);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setMusicPlaying(true);
  };

  // Sync prop updates if they change
  useEffect(() => {
    setInvitation(initialInvitation);
  }, [initialInvitation]);

  // Check if owner is logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored && invitation.userId) {
        try {
          const user = JSON.parse(stored);
          if (user && user.id === invitation.userId) {
            setIsOwner(true);
          }
        } catch { }
      }
    }
  }, [invitation.userId]);

  const handleCameraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(isEn 
        ? "The image is too large. Maximum size is 5MB." 
        : "حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت."
      );
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert(isEn 
        ? "Invalid file type. Please upload an image (JPG, PNG, WEBP, GIF)." 
        : "نوع الملف غير صالح. يرجى رفع صورة (JPG, PNG, WEBP, GIF)."
      );
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await api.post<{ url: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const momentUrl = uploadRes.data.url;

      const saveRes = await api.post(`/invitations/${invitation.id}/moments`, { url: momentUrl });
      if (saveRes.data) {
        setInvitation(saveRes.data);
      }
    } catch (err) {
      console.error("Camera upload failed:", err);
      alert(isEn ? "Failed to upload photo. Please try again." : "فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch((err) => console.log('Video play error:', err));
    }
  }, [isOpen]);

  // Generate particles (delicate white baby's breath flowers)
  useEffect(() => {
    const list: Particle[] = Array.from({ length: 25 }).map((_, idx) => ({
      id: idx,
      type: idx % 2 === 0 ? 'leaf' : 'petal',
      size: Math.floor(Math.random() * 6) + 6, // 6px to 12px
      left: Math.random() * 100, // 0% to 100%
      delay: (Math.random() * 8).toFixed(1), // 0s to 8s delay
      duration: Math.floor(Math.random() * 6) + 8, // 8s to 14s duration
      drift: Math.floor(Math.random() * 30) - 15, // -15px to 15px horizontal drift
    }));
    setParticles(list);
  }, []);

  // Countdown timer
  useEffect(() => {
    const targetDate = new Date(invitation.eventDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [invitation.eventDate]);

  // Trigger Intersection Observer for other standard animations (like fade-ups)
  useEffect(() => {
    if (!isOpen) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.05,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll:not(.details-items-container)').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isOpen]);

  // Timeline Scroll Animation trigger
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      if (!timelineContainerRef.current || !timelineIndicatorRef.current) return;

      const activeItems = timelineItemRefs.current.filter((item): item is HTMLDivElement => item !== null);
      if (activeItems.length === 0) return;

      const rect = timelineContainerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const triggerPoint = viewportHeight / 2;
      const containerHeight = rect.height;
      const relativeTop = rect.top - triggerPoint;

      let progress = -relativeTop / containerHeight;
      progress = Math.max(0, Math.min(1, progress));

      const firstItem = activeItems[0];
      const lastItem = activeItems[activeItems.length - 1];

      const startTop = firstItem.offsetTop + (firstItem.offsetHeight / 2);
      const endTop = lastItem.offsetTop + (lastItem.offsetHeight / 2);
      const range = endTop - startTop;

      const indicatorTop = startTop + (progress * range);
      timelineIndicatorRef.current.style.top = `${indicatorTop}px`;

      activeItems.forEach((item) => {
        const itemOffsetTop = item.offsetTop + (item.offsetHeight / 2);
        const timeSpan = item.querySelector('.timeline-time');
        const titleSpan = item.querySelector('.timeline-title');
        const dot = item.querySelector('.timeline-dot');

        if (indicatorTop >= itemOffsetTop - 10) {
          dot?.classList.add('active');
          timeSpan?.classList.add('active');
          titleSpan?.classList.add('active');
        } else {
          dot?.classList.remove('active');
          timeSpan?.classList.remove('active');
          titleSpan?.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    setTimeout(handleScroll, 200);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  // Details Intersection Observer trigger
  useEffect(() => {
    if (!isOpen) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -15% 0px',
      threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.detail-item-row');
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('visible');
            }, index * 150);
          });
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (detailsContainerRef.current) {
      observer.observe(detailsContainerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isOpen]);

  const eventTitle = isEn
    ? (invitation.eventTitleEn || invitation.eventTitle)
    : (invitation.eventTitleAr || invitation.eventTitle);
  const eventLocation = isEn
    ? (invitation.eventLocationEn || invitation.eventLocation)
    : (invitation.eventLocationAr || invitation.eventLocation);
  const welcomeText = isEn
    ? (invitation.welcomeTextEn || invitation.welcomeText)
    : (invitation.welcomeTextAr || invitation.welcomeText);

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

  // Date utilities
  const parsedDate = new Date(invitation.eventDate);

  const getFormattedDate = () => {
    try {
      return new Intl.DateTimeFormat(isEn ? 'en-US' : 'ar-EG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(parsedDate);
    } catch {
      return invitation.eventDate;
    }
  };

  const getMonthName = () => {
    try {
      return new Intl.DateTimeFormat(isEn ? 'en-US' : 'ar-EG', { month: 'long' }).format(parsedDate);
    } catch {
      return '';
    }
  };

  const getDayName = () => {
    try {
      return new Intl.DateTimeFormat(isEn ? 'en-US' : 'ar-EG', { weekday: 'long' }).format(parsedDate);
    } catch {
      return '';
    }
  };

  const getYearNum = () => parsedDate.getFullYear();
  const getDayNum = () => parsedDate.getDate();
  const getTimeString = () => {
    try {
      return new Intl.DateTimeFormat(isEn ? 'en-US' : 'ar-EG', { hour: 'numeric', minute: '2-digit', hour12: true }).format(parsedDate);
    } catch {
      return '';
    }
  };

  const defaultWelcomeTextAr = `بقلوبٍ يملؤها الفرح والسرور،\nنتشرف بدعوتكم لمشاركتنا فرحة العمر\nوتوثيق عهد الحب والوفاء\n\nفي حفل زفاف أبنائنا\n\nحضوركم يسعدنا ويضفي على ليلتنا بهجة وسروراً 🌿`;
  const defaultWelcomeTextEn = `With hearts full of joy and happiness,\nWe are honored to invite you to share our lifetime joy\nAnd witness the bond of love and loyalty\n\nIn our children's wedding ceremony\n\nYour presence delights us and adds joy and happiness to our night 🌿`;
  const defaultWelcomeText = isEn ? defaultWelcomeTextEn : defaultWelcomeTextAr;

  const [hallName, cityName] = eventLocation.includes('،')
    ? eventLocation.split('،')
    : eventLocation.includes(',')
      ? eventLocation.split(',')
      : [eventLocation, ''];

  const getGoogleCalendarUrl = () => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const start = `${parsedDate.getUTCFullYear()}${pad(parsedDate.getUTCMonth() + 1)}${pad(parsedDate.getUTCDate())}T${pad(parsedDate.getUTCHours())}${pad(parsedDate.getUTCMinutes())}${pad(parsedDate.getUTCSeconds())}Z`;

    const endDate = new Date(parsedDate.getTime() + 3 * 60 * 60 * 1000);
    const end = `${endDate.getUTCFullYear()}${pad(endDate.getUTCMonth() + 1)}${pad(endDate.getUTCDate())}T${pad(endDate.getUTCHours())}${pad(endDate.getUTCMinutes())}${pad(endDate.getUTCSeconds())}Z`;

    const calendarTitle = isEn ? `Wedding of ${eventTitle}` : `حفل زفاف ${eventTitle}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarTitle)}&dates=${start}/${end}&details=${encodeURIComponent(welcomeText || defaultWelcomeText)}&location=${encodeURIComponent(eventLocation)}`;
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || attendance === null) return;

    setStatus('submitting');
    setErrorMsg('');

    const payload: CreateRsvpPayload = {
      invitationId: invitation.id,
      name: guestName.trim(),
      attendance,
      guestsCount: attendance === 'YES' ? companionsCount : 0,
      message: newWish.trim() || undefined
    };

    try {
      await api.post('/rsvp', payload);

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

  const timelineEvents = (invitation.eventProgram || []).map((p: any) => ({
    time: p.time || "",
    title: isEn ? (p.titleEn || p.title || "") : (p.titleAr || p.title || ""),
  }));

  const detailRules = (invitation.eventDetails || []).map((d: any) => ({
    icon: <Info className="w-4.5 h-4.5 text-[#64748B]" />,
    text: isEn ? (d.textEn || d.text || "") : (d.textAr || d.text || ""),
  }));

  return (
    <main className="min-h-screen bg-[#F8FAFC] relative flex flex-col justify-center font-cairo garden-theme">
      {/* Google Fonts and CSS Overrides for white/silver theme & custom animations */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@200..1000&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{
        __html: `
        .font-aref {
          font-family: 'Aref Ruqaa', serif !important;
          font-size: 3rem !important;
          text-shadow: 1px 1px 3px rgba(100, 116, 139, 0.1) !important;
        }
        @media (min-width: 768px) {
          .font-aref {
            font-size: 3rem !important;
          }
        }
        .font-cairo {
          font-family: 'Cairo', sans-serif !important;
        }

        @keyframes falling-particles {
          0% {
            transform: translateY(-20px) rotate(0deg) translateX(0);
            opacity: 0.85;
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(var(--drift-x));
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) rotate(360deg) translateX(0);
            opacity: 0;
          }
        }

        /* Override Global CSS definitions to match the white/silver theme */
        .garden-theme .timeline-time, 
        .garden-theme .timeline-title {
          color: #334155 !important;
          opacity: 0 !important;
          transform: translateY(15px) !important;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .garden-theme .timeline-time.active, 
        .garden-theme .timeline-title.active {
          color: #64748B !important;
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        /* Timeline Dot - Silver/slate theme */
        .garden-theme .timeline-dot {
          background: rgba(100, 116, 139, 0.2) !important;
          box-shadow: none !important;
          transform: scale(1) !important;
          transition: background 0.5s ease, box-shadow 0.5s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }

        .garden-theme .timeline-dot.active {
          background: #64748B !important;
          transform: scale(1.4) !important;
          box-shadow: 0 0 0 4px rgba(100, 116, 139, 0.15), 0 0 14px 6px rgba(100, 116, 139, 0.2) !important;
        }

        /* Details list items custom dots overrides */
        .garden-theme .timeline-detail-dot {
          transform: scale(0.6) !important;
          background: rgba(100, 116, 139, 0.15) !important;
          box-shadow: none !important;
          transition: background 0.6s, box-shadow 0.6s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .garden-theme .detail-item-row.visible .timeline-detail-dot {
          transform: scale(1.2) !important;
          background: #64748B !important;
          box-shadow: 0 0 0 4px rgba(100, 116, 139, 0.1), 0 0 14px 6px rgba(100, 116, 139, 0.15) !important;
        }

        /* General override for details cards slide-in transitions */
        .garden-theme .detail-item-row .rounded-xl {
          opacity: 0 !important;
          transform: translateX(20px) !important;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        
        .garden-theme .detail-item-row.visible .rounded-xl {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      ` }} />

      {/* Premium floating language switcher circle */}
      {invitation.languageMode === "both" && setViewingLangProp && (
        <button
          onClick={() => setViewingLangProp(isEn ? 'ar' : 'en')}
          className="fixed top-6 right-6 z-[99999] w-12 h-12 rounded-full border flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 text-xs font-bold font-serif backdrop-blur-md cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            borderColor: 'rgba(148, 163, 184, 0.45)',
            color: '#475569',
            boxShadow: 'rgba(148, 163, 184, 0.1) 0px 4px 20px',
          }}
        >
          {isEn ? 'AR' : 'EN'}
        </button>
      )}

      {/* Background audio controller & Navigation bar */}
      {isOpen && (
        <BottomNavbar
          musicUrl={invitation.musicUrl}
          musicPlaying={musicPlaying}
          setMusicPlaying={setMusicPlaying}
          theme="white"
          viewingLang={isEn ? "en" : "ar"}
          locationUrl={invitation.locationUrl}
          onContactClick={() => setShowContactModal(true)}
        />
      )}

      {/* Wax seal cover splitting envelope with custom scaled white/silver seal */}
      <EnvelopeOverlay eventTitle={eventTitle} onOpen={handleOpenInvitation} sealImage="/images/white-seal.png" viewingLang={isEn ? "en" : "ar"} customSealStyle={{ transform: 'translate(0px, -1px) scale(1.40)' }} textColor="#64748B" />

      {/* Falling Flowers Animation overlay over the entire screen */}
      <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.95), 0 0 12px rgba(226, 232, 240, 0.5)',
              border: '1px solid rgba(226, 232, 240, 0.4)',
              animation: `falling-particles ${p.duration}s linear ${p.delay}s infinite`,
              '--drift-x': `${p.drift}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Invitation Contents Container */}
      <div className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto overflow-hidden bg-white shadow-2xl rounded-none md:rounded-[32px] md:my-8 animate-on-scroll" dir={isEn ? "ltr" : "rtl"} style={{ color: '#334155' }}>

        {/* HERO SECTION */}
        <section className="relative min-h-[700px] flex flex-col items-center justify-start text-center pt-24">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={videoRef}
              src="/videos/temp1.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            {/* Soft transparent overlay */}
            <div className="absolute inset-0 bg-white/20" />
          </div>
          <div className="relative z-10 -mt-8 pr-6 pl-6 flex flex-col items-center w-full">
            <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-[#334155]/20 to-transparent" />
            <div className="text-sm tracking-[0.25em] mb-4 text-[#475569] font-bold">{isEn ? "Wedding Invitation" : "حفل زفاف"}</div>

            {/* Calligraphic Decorative Large Names */}
            <h1 className="font-aref font-bold leading-none text-[#1E293B] select-none my-3 tracking-wide">
              {groom}
            </h1>
            {bride && (
              <>
                <span className="text-3xl font-aref font-normal text-[#64748B] my-1">&amp;</span>
                <h1 className="font-aref font-bold leading-none text-[#1E293B] select-none my-3 tracking-wide">
                  {bride}
                </h1>
              </>
            )}

            <div className="mt-10">
              <div className="text-xs font-bold tracking-wide bg-white/75 backdrop-blur-xs px-5 py-2.5 rounded-full border border-slate-200/50 text-[#334155] shadow-xs">
                {getFormattedDate()}
              </div>
            </div>
          </div>
          <div className="absolute bottom-16 left-10 right-10 h-px bg-slate-200/50" />
        </section>

        {/* INVITATION CARD & COUNTDOWN SECTION */}
        <section className="relative min-h-[700px] py-12 px-6 flex flex-col justify-center">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="/videos/temp1.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-white/30" />
          </div>

          <div className="relative z-10 space-y-8 w-full max-w-lg mx-auto">
            {/* The main invite card with glassmorphism */}
            <div
              className="p-8 animate-on-scroll fade-up"
              style={{
                backdropFilter: 'blur(16px) saturate(120%)',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 8px 32px 0 rgba(148, 163, 184, 0.08)',
                borderRadius: '28px'
              }}
            >
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <span className="text-3xl text-[#94A3B8]">🤍</span>
                </div>
                <h4 className="text-xs font-bold tracking-widest text-[#475569] mb-4 uppercase">{isEn ? "Wedding Invitation" : "دعوة لحضور حفل زفاف"}</h4>
                <div className="text-[15px] whitespace-pre-line text-[#334155] leading-relaxed mb-6 font-medium">
                  {welcomeText || defaultWelcomeText}
                </div>
                <div className="text-xl font-amiri font-bold text-[#475569] tracking-wide">
                  {groom} {bride ? `& ${bride}` : ''}
                </div>
              </div>
            </div>

            {/* Location indicator */}
            <div className="text-center animate-on-scroll fade-up">
              <span className="text-xs tracking-widest uppercase text-slate-500 font-bold block mb-1">{isEn ? "LOCATION" : "الموقع"}</span>
              <h3 className="font-bold text-lg text-[#1E293B]">{hallName?.trim()}</h3>
              {cityName && <p className="text-sm text-slate-500 mt-1 font-semibold">{cityName?.trim()}</p>}
            </div>

            {/* Elegant Calendar Widget */}
            <div className="animate-on-scroll fade-up flex justify-center" style={{ perspective: '1200px' }}>
              <div className="w-full max-w-[240px] overflow-hidden shadow-sm border border-slate-200" style={{ borderRadius: '22px' }}>
                <div className="relative flex items-center justify-between px-5 py-3 bg-[#334155]">
                  <div className="absolute top-0 left-1/3 -translate-x-1/2 w-4 h-4.5 rounded-b-full bg-white/20 border border-white/40" />
                  <div className="absolute top-0 right-1/3 translate-x-1/2 w-4 h-4.5 rounded-b-full bg-white/20 border border-white/40" />
                  <span className="text-[9px] tracking-[0.2em] opacity-85 text-white font-bold">{getYearNum()}</span>
                  <span className="text-sm font-bold tracking-wider text-white font-amiri">{getMonthName()}</span>
                  <span className="text-[9px] tracking-[0.2em] opacity-85 text-white font-bold">{getDayName()}</span>
                </div>
                <div className="flex flex-col items-center py-5 px-4 bg-white/70 backdrop-blur-md">
                  <span className="font-bold leading-none text-[5rem] text-[#334155] font-amiri">{getDayNum()}</span>
                  <div className="w-10 h-px my-3 bg-slate-200" />
                  <span className="text-[11px] tracking-[0.25em] uppercase mb-1 text-slate-500 font-semibold">{getDayName()}</span>
                  <span className="text-sm font-bold tracking-widest text-[#64748B]">{getTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Save date button */}
            <div className="flex justify-center animate-on-scroll fade-up">
              <button
                onClick={() => window.open(getGoogleCalendarUrl(), '_blank')}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-full border border-slate-200 shadow-xs backdrop-blur-md hover:bg-slate-50 transition-all text-[#334155] bg-white/80 cursor-pointer"
              >
                <Calendar className="w-4.5 h-4.5 text-[#64748B]" />
                {isEn ? "Save the Date" : "احفظ الموعد في التقويم"}
              </button>
            </div>

            {/* Countdown widget */}
            <div
              className="p-5 animate-on-scroll fade-up"
              style={{
                backdropFilter: 'blur(16px) saturate(120%)',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 8px 32px 0 rgba(148, 163, 184, 0.08)',
                borderRadius: '24px'
              }}
            >
              <h4 className="text-center text-xs tracking-widest font-bold text-[#475569] mb-3">{isEn ? "COUNTDOWN" : "العد التنازلي للمناسبة"}</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: isEn ? 'Days' : 'أيام', val: timeLeft.days },
                  { label: isEn ? 'Hours' : 'ساعات', val: timeLeft.hours },
                  { label: isEn ? 'Minutes' : 'دقائق', val: timeLeft.minutes },
                  { label: isEn ? 'Seconds' : 'ثواني', val: timeLeft.seconds }
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <div className="text-xl font-bold text-[#334155]">
                      {item.val}
                    </div>
                    <div className="text-[9px] tracking-wider mt-1 text-slate-400 font-semibold">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE EVENT TIMELINE SECTION */}
        {timelineEvents.length > 0 && (
          <section className="relative min-h-[700px] py-12 px-6 flex flex-col justify-center">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <video
                src="/videos/temp1.mp4"
                autoPlay
                loop
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
              />
              <div className="absolute inset-0 bg-white/30" />
            </div>

            <div className="relative z-10 w-full max-w-lg mx-auto space-y-12">
              {/* Timeline layout */}
              <div ref={timelineContainerRef} className="relative py-8 pl-8 pr-4">
                <h3 className="text-center text-sm font-bold tracking-widest uppercase mb-12 text-[#334155]">
                  {isEn ? "EVENT PROGRAM" : "جدول الحفل"}
                </h3>
                
                {/* Active progress indicator track bar line */}
                <div className="absolute top-24 bottom-12 left-4 w-[2px] bg-slate-200">
                  <div
                    ref={timelineIndicatorRef}
                    className="absolute top-0 w-full bg-[#64748B] transition-all duration-300 ease-out"
                    style={{ height: '0%', bottom: 'auto' }}
                  />
                </div>

                <div className="space-y-12">
                  {timelineEvents.map((event, idx) => (
                    <div
                      key={idx}
                      ref={(el) => { timelineItemRefs.current[idx] = el; }}
                      className="relative flex flex-col gap-1 items-start pl-8 text-left"
                    >
                      {/* Left glowing marker dot */}
                      <div className="absolute left-[-21px] top-[6px] w-[10px] h-[10px] rounded-full timeline-dot border-2 border-white" />
                      
                      <span className="text-xs font-bold tracking-widest timeline-time uppercase transition-all duration-500">
                        {event.time}
                      </span>
                      <span className="text-base font-bold timeline-title transition-all duration-500 mt-0.5">
                        {event.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guidelines section */}
              {detailRules.length > 0 && (
                <div ref={detailsContainerRef} className="space-y-6 pt-6">
                  <h3 className="text-center text-sm font-bold tracking-widest uppercase mb-6 text-[#334155]">
                    {isEn ? "EVENT GUIDELINES" : "تعليمات وتنبيهات الحفل"}
                  </h3>
                  <div className="space-y-4">
                    {detailRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 detail-item-row"
                      >
                        <div className="flex-shrink-0 mt-[13px] w-2.5 h-2.5 rounded-full timeline-detail-dot border border-white" />
                        <div className="flex-grow p-4 bg-white/70 backdrop-blur-md rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
                          {rule.icon}
                          <p className="text-xs font-semibold text-[#475569] leading-relaxed">
                            {rule.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* MOMENTS GALLERY & GUESTBOOK SECTION */}
        <section className="relative min-h-[763px] py-12 px-6 flex flex-col justify-center">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="/videos/temp1.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-white/30" />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-auto space-y-12">
            {/* Gallery widget */}
            {invitation.images && invitation.images.length > 0 && (
              <div
                className="p-6 animate-on-scroll fade-up"
                style={{
                  backdropFilter: 'blur(16px) saturate(120%)',
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 8px 32px 0 rgba(148, 163, 184, 0.08)',
                  borderRadius: '28px'
                }}
              >
                <h4 className="text-center text-xs tracking-widest font-bold text-[#475569] mb-4 uppercase">{isEn ? "GALLERY" : "معرض الصور"}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {invitation.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className="aspect-square rounded-xl overflow-hidden shadow-xs border border-slate-100 hover:scale-[1.02] cursor-pointer transition-all"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moments Capture widget */}
            {invitation.allowGuestUploads !== false && (
              <div
                className="p-6 animate-on-scroll fade-up"
                style={{
                  backdropFilter: 'blur(16px) saturate(120%)',
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 8px 32px 0 rgba(148, 163, 184, 0.08)',
                  borderRadius: '28px'
                }}
              >
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-500 shadow-xs">
                    <Camera className="w-6 h-6 text-[#64748B]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E293B]">{isEn ? "Share Your Moments" : "شاركونا لحظاتكم الجميلة"}</h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-1 leading-relaxed">
                      {isEn ? "Upload photos directly from your camera to the shared album!" : "التقطوا صورًا وشاركوها مباشرة في المعرض الحي للحفل!"}
                    </p>
                  </div>
                  <div className="flex justify-center relative">
                    <label className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white hover:bg-slate-800 text-xs font-bold rounded-full shadow-md cursor-pointer transition-all">
                      <Camera className="w-4 h-4" />
                      {isEn ? "Open Camera / Upload Photo" : "افتح الكاميرا أو ارفع صورة"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCameraUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  {isUploading && (
                    <p className="text-[10px] font-bold text-[#64748B] animate-pulse">
                      {isEn ? "Uploading your moment..." : "جاري رفع الصورة..."}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Moments Slideshow/Showcase */}
            {invitation.showMoments !== false && invitation.moments && invitation.moments.length > 0 && (
              <div
                className="p-6 animate-on-scroll fade-up"
                style={{
                  backdropFilter: 'blur(16px) saturate(120%)',
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 8px 32px 0 rgba(148, 163, 184, 0.08)',
                  borderRadius: '28px'
                }}
              >
                <h4 className="text-center text-xs tracking-widest font-bold text-[#475569] mb-4 uppercase">{isEn ? "GUEST PHOTO FEED" : "صور ضيوفنا الكرام"}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {invitation.moments.map((momentUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(momentUrl)}
                      className="aspect-square rounded-lg overflow-hidden border border-slate-100 cursor-pointer shadow-xs hover:scale-[1.03] transition-all"
                    >
                      <img src={momentUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RSVP Form Widget */}
            <div
              className="p-8 animate-on-scroll fade-up"
              id="rsvp"
              style={{
                backdropFilter: 'blur(16px) saturate(120%)',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 8px 32px 0 rgba(148, 163, 184, 0.08)',
                borderRadius: '28px'
              }}
            >
              <h4 className="text-center text-xs tracking-widest font-bold text-[#475569] mb-6 uppercase">{isEn ? "CONFIRM ATTENDANCE" : "تأكيد الحضور"}</h4>
              
              {status === 'success' ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-emerald-500 shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-sm text-slate-800">{isEn ? "Response Sent Successfully" : "تم إرسال تأكيد الحضور بنجاح"}</h5>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    {isEn ? "Thank you for sharing your response! We look forward to seeing you." : "شكراً لمشاركتنا ردكم وتأكيد حضوركم، نسعد بلقائكم!"}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">{isEn ? "Full Name" : "الاسم الكامل"}</label>
                    <input
                      type="text"
                      required
                      placeholder={isEn ? "Please enter your name" : "الرجاء كتابة الاسم الكامل"}
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#64748B] focus:border-[#64748B] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">{isEn ? "Will You Attend?" : "هل ستشرفنا بالحضور؟"}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAttendance('YES');
                          setCompanionsCount(1);
                        }}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          attendance === 'YES'
                            ? 'bg-slate-700 border-slate-700 text-white shadow-md'
                            : 'bg-white/60 border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {isEn ? "Yes, I will attend" : "نعم، سأحضر"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendance('NO')}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          attendance === 'NO'
                            ? 'bg-slate-700 border-slate-700 text-white shadow-md'
                            : 'bg-white/60 border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {isEn ? "Sorry, I cannot attend" : "أعتذر عن الحضور"}
                      </button>
                    </div>
                  </div>

                  {invitation.allowCompanions !== false && attendance === 'YES' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">{isEn ? "Number of Companions" : "عدد المرافقين"}</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCompanionsCount(prev => Math.max(1, prev - 1))}
                          className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-sm font-bold text-[#334155] cursor-pointer hover:bg-slate-50"
                        >
                          -
                        </button>
                        <div className="flex-grow text-center py-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs font-bold text-[#334155]">
                          {companionsCount}
                        </div>
                        <button
                          type="button"
                          onClick={() => setCompanionsCount(prev => Math.min(20, prev + 1))}
                          className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-sm font-bold text-[#334155] cursor-pointer hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">{isEn ? "Leave a Congratulations Message" : "أكتب تهنئة للعروسين"}</label>
                    <textarea
                      placeholder={isEn ? "Write your wish here..." : "شارك العروسين كلماتك الطيبة وتهانيك..."}
                      value={newWish}
                      onChange={(e) => setNewWish(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#64748B] focus:border-[#64748B] transition-all resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-[10px] text-red-500 font-bold text-center">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full py-3.5 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    {status === 'submitting' ? (isEn ? "Sending..." : "جاري الإرسال...") : (isEn ? "Confirm" : "إرسال التأكيد")}
                  </button>
                </form>
              )}
            </div>

            {/* Wishes/Feedback Guestbook Timeline widget */}
            {wishes.length > 0 && (
              <div
                className="p-6 animate-on-scroll fade-up"
                style={{
                  backdropFilter: 'blur(16px) saturate(120%)',
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 8px 32px 0 rgba(148, 163, 184, 0.08)',
                  borderRadius: '28px'
                }}
              >
                <h4 className="text-center text-xs tracking-widest font-bold text-[#475569] mb-4 uppercase">{isEn ? "CONGRATULATIONS ALBUM" : "دفتر التهاني والتبريكات"}</h4>
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4">
                  {wishes.map((wish, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white/60 rounded-xl border border-slate-100 shadow-xs flex flex-col gap-1 text-left"
                    >
                      <span className="text-xs font-bold text-[#1E293B]">
                        {wish.name}
                      </span>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5 whitespace-pre-line">
                        {wish.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
        {/* FOOTER SECTION */}
        <section className="relative min-h-[302px] py-12 px-6 flex flex-col justify-center text-center">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="/videos/temp1.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-white/40" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-px mb-5 bg-slate-200" />
            <h5 className="text-base text-slate-800 font-amiri font-bold mb-1">{eventTitle}</h5>
            <p className="text-xs text-slate-500 font-semibold mb-4">
              {new Date(invitation.eventDate).toLocaleDateString(isEn ? 'en-US' : 'ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <a href="/" className="text-[9px] uppercase tracking-[0.25em] text-slate-400 font-bold hover:underline transition-all cursor-pointer block">
              {isEn ? "Made with love on Mazoom platform" : "صنع بكل حب عبر منصة معزوم"}
            </a>
            {/* Spacer inside the section relative div to keep the video background flowing behind the bottom bar */}
            <div className="h-24" />
          </div>
        </section>
      </div>

      {/* WhatsApp Custom Contact Modal Popup */}
      {showContactModal && (
        <div className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div
            className="bg-[#FAF8F5] border border-slate-200 rounded-[28px] max-w-sm w-full p-6 shadow-2xl relative text-center"
            dir={isEn ? "ltr" : "rtl"}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-12 h-12 rounded-full bg-[#128C7E]/10 flex items-center justify-center mx-auto mb-4 text-[#128C7E]">
              <Phone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-1 font-sans">
              {invitation.contactName || (isEn ? "WhatsApp Contact" : "للتواصل والاستفسار")}
            </h3>
            <p className="text-sm text-slate-500 font-semibold mb-6 font-sans">
              {invitation.contactPhone || "+966 50 000 0001"}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${invitation.contactPhone || "+966500000001"}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-[#EBE7DF] hover:bg-neutral-50 text-black text-xs font-bold transition-all shadow-xs cursor-pointer font-sans"
              >
                <Phone className="w-4 h-4 text-slate-500" />
                {isEn ? "Call" : "اتصال"}
              </a>
              <a
                href={`https://wa.me/${(invitation.contactPhone || "+966500000001").replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#128C7E] text-white hover:bg-[#075e54] text-xs font-bold transition-all shadow-md cursor-pointer font-sans"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.485.002 9.948-4.463 9.95-9.953.002-2.66-1.033-5.16-2.907-7.037C16.542 1.737 14.045.7 11.4.7 5.922.7 1.458 5.163 1.456 10.648c-.001 1.638.428 3.235 1.242 4.636l-.994 3.63 3.72-.975z" />
                </svg>
                {isEn ? "WhatsApp" : "واتساب"}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Overlay for viewing images */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/90 z-[999999] flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all border border-white/15"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt=""
            className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl animate-scale-up"
          />
        </div>
      )}
    </main>
  );
}
