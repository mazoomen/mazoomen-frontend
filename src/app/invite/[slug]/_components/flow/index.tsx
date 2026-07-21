'use client';

import React, { useState, useEffect, useRef } from 'react';
import { S3_BASE_URL } from '@/lib/s3';
import type { InvitationData } from '@/types/invitation';
import { Calendar, Heart, Info, Baby, QrCode, MessageCircle, Users, CheckCircle2, Phone, Camera, X } from 'lucide-react';
import api from '@/lib/api';
import type { CreateRsvpPayload } from '@/types/invitation';
import { EnvelopeOverlay, BottomNavbar } from '../index';

interface InvitationClientPageFlowProps {
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

export default function InvitationClientPageFlow({
  invitation: initialInvitation,
  slug,
  isDeactivatedInitial = false,
  viewingLangProp,
  setViewingLangProp
}: InvitationClientPageFlowProps) {
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
      const uploadRes = await api.post<any>(`/invitations/${invitation.id}/guest-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (uploadRes.data) {
        setInvitation(uploadRes.data);
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

  // Generate particles (leaves and flower petals)
  useEffect(() => {
    const list: Particle[] = Array.from({ length: 25 }).map((_, idx) => ({
      id: idx,
      type: idx % 2 === 0 ? 'leaf' : 'petal',
      size: Math.floor(Math.random() * 8) + 8, // 8px to 16px
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
    icon: <Info className="w-4.5 h-4.5 text-[#B07070]" />,
    text: isEn ? (d.textEn || d.text || "") : (d.textAr || d.text || ""),
  }));

  return (
    <main className="min-h-screen bg-[#FFF0F2] relative flex flex-col justify-center font-cairo garden-theme">
      {/* Google Fonts and CSS Overrides for lavender theme & custom animations */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@200..1000&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{
        __html: `
        .font-aref {
          font-family: 'Aref Ruqaa', serif !important;
          font-size: 3rem !important;
          text-shadow: 1px 1px 3px rgba(176, 112, 112, 0.12) !important;
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

        /* Override Global CSS definitions to match the lavender theme */
        .garden-theme .timeline-time, 
        .garden-theme .timeline-title {
          color: #701020 !important;
          opacity: 0 !important;
          transform: translateY(15px) !important;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .garden-theme .timeline-time.active, 
        .garden-theme .timeline-title.active {
          color: #B07070 !important;
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        /* Timeline Dot - Clean filled circle matching template 1 but in lavender */
        .garden-theme .timeline-dot {
          background: rgba(176, 112, 112, 0.25) !important;
          box-shadow: none !important;
          transform: scale(1) !important;
          transition: background 0.5s ease, box-shadow 0.5s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }

        .garden-theme .timeline-dot.active {
          background: #B07070 !important;
          transform: scale(1.4) !important;
          box-shadow: 0 0 0 4px rgba(176, 112, 112, 0.15), 0 0 14px 6px rgba(176, 112, 112, 0.25) !important;
        }

        /* Details list items custom dots overrides - clean circle like template 1 */
        .garden-theme .timeline-detail-dot {
          transform: scale(0.6) !important;
          background: rgba(176, 112, 112, 0.2) !important;
          box-shadow: none !important;
          transition: background 0.6s, box-shadow 0.6s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .garden-theme .detail-item-row.visible .timeline-detail-dot {
          transform: scale(1.2) !important;
          background: #B07070 !important;
          box-shadow: 0 0 0 4px rgba(176, 112, 112, 0.15), 0 0 14px 6px rgba(176, 112, 112, 0.25) !important;
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
            background: 'rgba(255, 240, 242, 0.55)',
            borderColor: 'rgba(176, 112, 112, 0.35)',
            color: '#B07070',
            boxShadow: 'rgba(176, 112, 112, 0.15) 0px 4px 20px',
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
          theme="burgundy"
          viewingLang={isEn ? "en" : "ar"}
          locationUrl={invitation.locationUrl}
          onContactClick={() => setShowContactModal(true)}
        />
      )}

      {/* Wax seal cover splitting envelope with custom scaled lavender seal */}
      <EnvelopeOverlay eventTitle={eventTitle} onOpen={handleOpenInvitation} sealImage="/images/flow-seal.png" viewingLang={isEn ? "en" : "ar"} customSealStyle={{ transform: 'translate(0px, -1px) scale(1.60)' }} textColor="#B07070" />

      {/* Falling Leaves and Petals Animation overlay over the entire screen */}
      <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.type === 'leaf' ? 'rgba(180, 140, 170, 0.45)' : 'rgba(253, 240, 245, 0.8)',
              borderRadius: p.type === 'leaf' ? '50% 0 50% 0' : '50%',
              border: p.type === 'petal' ? '1px solid rgba(240, 230, 210, 0.4)' : 'none',
              animation: `falling-particles ${p.duration}s linear ${p.delay}s infinite`,
              '--drift-x': `${p.drift}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Invitation Contents Container (Styled exactly like Template 1, restricted inside a phone-like container card) */}
      <div className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto overflow-hidden bg-white shadow-2xl rounded-none md:rounded-[32px] md:my-8 animate-on-scroll" dir={isEn ? "ltr" : "rtl"} style={{ color: '#701020' }}>

        {/* HERO SECTION */}
        <section className="relative min-h-[700px] flex flex-col items-center justify-start text-center pt-24">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              ref={videoRef}
              src={`${S3_BASE_URL}/templates/videos/Flow_1080p_202607141304_1c6bb044.mp4`}
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            {/* Soft tint overlay */}
            <div className="absolute inset-0 bg-[#FFF0F2]/20" />
          </div>
          <div className="relative z-10 -mt-8 pr-6 pl-6 flex flex-col items-center w-full">
            <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-[#701020]/40 to-transparent" />
            <div className="text-base tracking-[0.25em] mb-4 text-[#701020] font-semibold">{isEn ? "Wedding Invitation" : "حفل زفاف"}</div>

            {/* Calligraphic Decorative Large Names */}
            <h1 className="font-aref font-bold leading-none text-[#701020] select-none my-3 tracking-wide">
              {groom}
            </h1>
            {bride && (
              <>
                <span className="text-3xl font-aref font-normal text-[#B07070] my-1">&amp;</span>
                <h1 className="font-aref font-bold leading-none text-[#701020] select-none my-3 tracking-wide">
                  {bride}
                </h1>
              </>
            )}

            <div className="mt-10">
              <div className="text-xs font-bold tracking-wide bg-[#FFF0F2]/60 backdrop-blur-xs px-5 py-2.5 rounded-full border border-[#701020]/10 text-[#701020]">
                {getFormattedDate()}
              </div>
            </div>
          </div>
          <div className="absolute bottom-16 left-10 right-10 h-px bg-[#701020]/10" />
        </section>

        {/* INVITATION CARD & COUNTDOWN SECTION */}
        <section className="relative min-h-[700px] py-12 px-6 flex flex-col justify-center">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              src={`${S3_BASE_URL}/templates/videos/Flow_1080p_202607141304_1c6bb044.mp4`}
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#FFF0F2]/30" />
          </div>

          <div className="relative z-10 space-y-8 w-full max-w-lg mx-auto">
            {/* The main invite card with glassmorphism */}
            <div
              className="p-8 animate-on-scroll fade-up"
              style={{
                backdropFilter: 'blur(16px) saturate(120%)',
                background: 'rgba(255, 240, 242, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow: '0 8px 32px 0 rgba(112, 16, 32, 0.06)',
                borderRadius: '28px'
              }}
            >
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <span className="text-3xl text-[#B07070]">✨</span>
                </div>
                <h4 className="text-sm font-bold tracking-widest text-[#701020] mb-4 uppercase">{isEn ? "Wedding Invitation" : "دعوة لحضور حفل زفاف"}</h4>
                <div className="text-[15px] whitespace-pre-line text-[#701020] leading-relaxed mb-6 font-medium">
                  {welcomeText || defaultWelcomeText}
                </div>
                <div className="text-xl font-amiri font-bold text-[#B07070] tracking-wide">
                  {groom} {bride ? `& ${bride}` : ''}
                </div>
              </div>
            </div>

            {/* Location indicator */}
            <div className="text-center animate-on-scroll fade-up">
              <span className="text-xs tracking-widest uppercase text-[#701020]/60 font-bold block mb-1">{isEn ? "LOCATION" : "الموقع"}</span>
              <h3 className="font-bold text-lg text-[#701020]">{hallName?.trim()}</h3>
              {cityName && <p className="text-sm text-[#701020]/80 mt-1 font-semibold">{cityName?.trim()}</p>}
            </div>

            {/* Elegant Calendar Widget */}
            <div className="animate-on-scroll fade-up flex justify-center" style={{ perspective: '1200px' }}>
              <div className="w-full max-w-[240px] overflow-hidden shadow-md border border-[#701020]/10" style={{ borderRadius: '22px' }}>
                <div className="relative flex items-center justify-between px-5 py-3 bg-[#701020]">
                  <div className="absolute top-0 left-1/3 -translate-x-1/2 w-4 h-4.5 rounded-b-full bg-white/20 border border-white/40" />
                  <div className="absolute top-0 right-1/3 translate-x-1/2 w-4 h-4.5 rounded-b-full bg-white/20 border border-white/40" />
                  <span className="text-[9px] tracking-[0.2em] opacity-85 text-white font-bold">{getYearNum()}</span>
                  <span className="text-sm font-bold tracking-wider text-white font-amiri">{getMonthName()}</span>
                  <span className="text-[9px] tracking-[0.2em] opacity-85 text-white font-bold">{getDayName()}</span>
                </div>
                <div className="flex flex-col items-center py-5 px-4 bg-white/60 backdrop-blur-md">
                  <span className="font-bold leading-none text-[5rem] text-[#701020] font-amiri">{getDayNum()}</span>
                  <div className="w-10 h-px my-3 bg-[#701020]/10" />
                  <span className="text-[11px] tracking-[0.25em] uppercase mb-1 text-[#701020] font-semibold">{getDayName()}</span>
                  <span className="text-sm font-bold tracking-widest text-[#B07070]">{getTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Save date button */}
            <div className="flex justify-center animate-on-scroll fade-up">
              <button
                onClick={() => window.open(getGoogleCalendarUrl(), '_blank')}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-full border border-white/40 shadow-xs backdrop-blur-md hover:bg-white/35 transition-all text-[#701020] bg-[#FFF0F2]/60 cursor-pointer"
              >
                <Calendar className="w-4.5 h-4.5 text-[#B07070]" />
                {isEn ? "Save the Date" : "احفظ الموعد في التقويم"}
              </button>
            </div>

            {/* Countdown widget */}
            <div
              className="p-5 animate-on-scroll fade-up"
              style={{
                backdropFilter: 'blur(16px) saturate(120%)',
                background: 'rgba(255, 240, 242, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow: '0 8px 32px 0 rgba(112, 16, 32, 0.06)',
                borderRadius: '24px'
              }}
            >
              <h4 className="text-center text-xs tracking-widest font-bold text-[#701020] mb-3">{isEn ? "COUNTDOWN" : "العد التنازلي للمناسبة"}</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: isEn ? 'Days' : 'أيام', val: timeLeft.days },
                  { label: isEn ? 'Hours' : 'ساعات', val: timeLeft.hours },
                  { label: isEn ? 'Minutes' : 'دقائق', val: timeLeft.minutes },
                  { label: isEn ? 'Seconds' : 'ثواني', val: timeLeft.seconds }
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-2 rounded-xl bg-white/50 border border-[#701020]/10 shadow-xs">
                    <div className="text-xl font-bold text-[#701020]">
                      {item.val}
                    </div>
                    <div className="text-[9px] tracking-wider mt-1 text-[#701020]/70 font-semibold">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TIMELINE & DETAILS SECTION */}
        <section className="relative min-h-[700px] py-12 px-6 flex flex-col justify-center">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              src={`${S3_BASE_URL}/templates/videos/Flow_1080p_202607141304_1c6bb044.mp4`}
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#FFF0F2]/30" />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-auto space-y-8">
            {/* Timeline (Fully Animated) */}
            {timelineEvents.length > 0 && (
              <div
                className="p-6 timeline-items-container"
                ref={timelineContainerRef}
                style={{
                  backdropFilter: 'blur(16px) saturate(120%)',
                  background: 'rgba(255, 240, 242, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.45)',
                  boxShadow: '0 8px 32px 0 rgba(112, 16, 32, 0.06)',
                  borderRadius: '24px'
                }}
              >
                <h3 className="text-center text-lg font-bold text-[#701020] mb-8">{isEn ? "Event Program" : "برنامج الحفل"}</h3>
                <div className="relative">
                  {/* Vertical Center Track Line */}
                  <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#B07070]/30 to-transparent" style={{ left: '50%', transform: 'translateX(-50%)' }} />

                  {/* Gliding Circular Indicator */}
                  <div
                    ref={timelineIndicatorRef}
                    id="timeline-indicator"
                    className="absolute pointer-events-none z-20"
                    style={{ top: '0px', left: '50%', transform: 'translate(-50%, -50%)', transition: 'top 0.1s ease-out' }}
                  >
                    <div className="w-5 h-5 rounded-full" style={{ background: 'transparent', border: '2px solid #B07070', boxShadow: '0 0 0 4px rgba(176, 112, 112, 0.15), 0 0 18px 8px rgba(176, 112, 112, 0.25), 0 0 36px 16px rgba(176, 112, 112, 0.1)' }} />
                  </div>

                  <div className="space-y-8">
                    {timelineEvents.map((event, index) => (
                      <div
                        key={index}
                        ref={(el) => { timelineItemRefs.current[index] = el; }}
                        className="relative flex items-center timeline-item"
                        style={{ minHeight: '68px' }}
                      >
                        <div className="w-[calc(50%-14px)] pr-4 text-right">
                          <span className="text-xs font-bold timeline-time block text-right">
                            {event.time}
                          </span>
                        </div>
                        <div className="w-7 flex justify-center shrink-0 z-10">
                          {/* Circle Dot (Lavender) */}
                          <div className="w-2.5 h-2.5 rounded-full timeline-dot" />
                        </div>
                        <div className="w-[calc(50%-14px)] pl-4 text-left">
                          <span className="text-xs font-bold timeline-title block leading-tight text-left">
                            {event.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Details (Fully Animated) */}
            {detailRules.length > 0 && (
              <div
                ref={detailsContainerRef}
                className="p-6 details-items-container"
                style={{
                  backdropFilter: 'blur(16px) saturate(120%)',
                  background: 'rgba(255, 240, 242, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.45)',
                  boxShadow: '0 8px 32px 0 rgba(112, 16, 32, 0.06)',
                  borderRadius: '24px'
                }}
              >
                <h3 className="text-center text-lg font-bold text-[#701020] mb-5">{isEn ? "Event Guidelines" : "تفاصيل تهمك"}</h3>
                <div className={`space-y-4 relative ${isEn ? "pr-7" : "pl-7"}`}>
                  {/* Vertical track line for details rules */}
                  <div
                    className={`absolute ${isEn ? "right-2.5" : "left-2.5"} top-3.5 bottom-3.5 w-px bg-gradient-to-b from-transparent via-[#B07070]/30 to-transparent`}
                  />

                  {detailRules.map((rule, idx) => (
                    <div key={idx} className="relative flex items-center gap-3.5 min-h-[52px] detail-item-row">
                      {/* Circle Bullet (Lavender) */}
                      <div
                        className={`absolute ${isEn ? "-right-5" : "-left-5"} w-2.5 h-2.5 rounded-full shrink-0 timeline-detail-dot`}
                        style={{
                          top: '50%',
                          marginTop: '-5px'
                        }}
                      />

                      <div className="flex items-center gap-3 flex-1 p-3 bg-white/40 border border-[#701020]/5 rounded-xl">
                        <span className="w-7 h-7 rounded-full bg-[#B07070]/10 border border-[#B07070]/10 flex items-center justify-center shrink-0">
                          {rule.icon}
                        </span>
                        <span className={`text-xs text-[#701020] font-semibold leading-tight w-full ${isEn ? "text-left" : "text-right"}`}>{rule.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* MOMENTS GALLERY SECTION (Flow Theme) */}
        <section id="moments-section" className="relative min-h-[400px] py-12 px-6 flex flex-col justify-center">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              src={`${S3_BASE_URL}/templates/videos/Flow_1080p_202607141304_1c6bb044.mp4`}
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#FFF0F2]/35" />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-auto space-y-6">
            {invitation.showMoments !== false && (
              <>
                <h3 className="text-center text-lg font-bold text-[#701020] font-sans">{isEn ? "Moments from the wedding" : "لحظات من الحفل"}</h3>

                {invitation.moments && invitation.moments.length > 0 ? (
                  <div className="max-h-[380px] md:max-h-[500px] overflow-y-auto pr-1 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    <div className="grid grid-cols-2 gap-3">
                      {invitation.moments.map((src, index) => {
                        const fullUrl = src.startsWith('/public') ? (process.env.NEXT_PUBLIC_API_URL || 'https://mazoom-backend.onrender.com') + src : src;
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
                ) : (
                  <div className="text-center py-8 text-[#701020]/60 border border-dashed border-[#701020]/20 rounded-[22px] font-sans text-xs bg-white/30 backdrop-blur-md">
                    {isEn ? "No moments captured yet. Be the first!" : "لا توجد صور ملتقطة بعد. كن أول من يشاركنا لحظاته!"}
                  </div>
                )}
              </>
            )}

            {invitation.allowGuestUploads !== false && (
              <div className="flex justify-center mt-4">
                <label className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-full border border-[#701020]/15 shadow-xs backdrop-blur-md hover:bg-[#701020]/5 cursor-pointer bg-white/60 text-[#701020]">
                  <Camera className="w-4 h-4 text-[#B07070]" />
                  {isUploading ? (isEn ? "Uploading..." : "جاري الرفع...") : (isEn ? "Open Camera / Upload Photo" : "افتح الكاميرا أو ارفع صورة")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCameraUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </section>

        {/* WISHES & RSVP SECTION */}
        <section id="rsvp-section" className="relative min-h-[763px] py-12 px-6 flex flex-col justify-center">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              src={`${S3_BASE_URL}/templates/videos/Flow_1080p_202607141304_1c6bb044.mp4`}
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#FFF0F2]/30" />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-auto space-y-8">
            {/* Couple Message */}
            <div className="text-center animate-on-scroll">
              <span className="text-xs tracking-widest uppercase text-[#701020]/60 font-bold block mb-1">{isEn ? "Bride & Groom Message" : "رسالة العروسين"}</span>
              <p className="text-[15px] text-[#701020] leading-relaxed whitespace-pre-line px-4 font-medium">
                {isEn
                  ? `Our joy is incomplete without your presence\nYour presence is an honor, and your prayers give us happiness\nJoin us as we start a new chapter of our lives ✨`
                  : `فرحتنا لا تكتمل إلا بمشاركتكم لنا هذا اليوم البهيج\nوجودكم بيننا شرف ودعواتكم الصادقة تمنحنا السعادة\nشاركونا بداية فصل جديد من حياتنا ✨`}
              </p>
              <p className="text-sm font-bold text-[#B07070] mt-3">
                {isEn ? "With love, " : "بكل حب، "}{groom}{bride ? ` & ${bride}` : ''}
              </p>
            </div>

            {/* RSVP Card */}
            <div
              className="p-6 animate-on-scroll fade-up"
              style={{
                backdropFilter: 'blur(16px) saturate(120%)',
                background: 'rgba(255, 240, 242, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow: '0 8px 32px 0 rgba(112, 16, 32, 0.06)',
                borderRadius: '24px'
              }}
            >
              <h3 className="text-center text-lg font-bold text-[#701020] mb-6 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-[#B07070] fill-[#B07070]" />
                {isEn ? "Confirm Attendance (RSVP)" : "تأكيد حضور الحفل (RSVP)"}
              </h3>

              {status === 'success' ? (
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-800">{isEn ? "Attendance Registered Successfully!" : "تم تسجيل حضوركم بنجاح!"}</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {isEn
                      ? "We are delighted by your attendance to share our wedding night. Looking forward to seeing you! 🤍"
                      : "نسعد جداً بتلبيتكم للدعوة ومشاركتنا ليلة العمر. ننتظر لقاءكم بشوق! 🤍"}
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-6 py-2 text-xs font-semibold rounded-full border border-[#701020]/15 hover:bg-[#701020]/5 text-[#701020] cursor-pointer font-cairo"
                  >
                    {isEn ? "Submit another RSVP" : "تأكيد حضور ضيف آخر"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className={`space-y-4 ${isEn ? "text-left" : "text-right"}`}>
                  {/* Guest Name */}
                  <div>
                    <label htmlFor="guest-name" className="block text-xs font-semibold text-[#701020] mb-1">{isEn ? "Your Full Name" : "الاسم الكريم"}</label>
                    <input
                      id="guest-name"
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={isEn ? "Enter your full name" : "يرجى كتابة الاسم الثلاثي"}
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border border-[#701020]/15 bg-white/70 focus:bg-white text-[#701020] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#B07070] text-xs ${isEn ? "text-left" : "text-right"}`}
                    />
                  </div>

                  {/* Attendance */}
                  <div>
                    <label className="block text-xs font-semibold text-[#701020] mb-1">{isEn ? "Will you honor us with your presence?" : "هل ستشرفنا بحضورك؟"}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAttendance('YES');
                          setCompanionsCount(1);
                        }}
                        className={`py-2.5 rounded-xl border font-bold text-xs transition-all duration-300 cursor-pointer ${attendance === 'YES'
                          ? 'bg-[#701020] text-white border-[#701020]'
                          : 'bg-white/60 border-gray-200 text-[#701020] hover:bg-white/80'
                          }`}
                      >
                        {isEn ? "Yes, gladly" : "نعم، بكل سرور"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendance('NO')}
                        className={`py-2.5 rounded-xl border font-bold text-xs transition-all duration-300 cursor-pointer ${attendance === 'NO'
                          ? 'bg-red-700/10 text-red-900 border-red-200'
                          : 'bg-white/60 border-gray-200 text-[#701020] hover:bg-white/80'
                          }`}
                      >
                        {isEn ? "Apologize, wishing you happiness" : "أعتذر، متمنياً لكم السعادة"}
                      </button>
                    </div>
                  </div>

                  {/* Companions */}
                  {invitation.allowCompanions !== false && attendance === 'YES' && (
                    <div className="animate-fade-in space-y-2">
                      <label className="block text-xs font-semibold text-[#701020] mb-1">{isEn ? "Number of companions" : "عدد المرافقين"}</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCompanionsCount(prev => Math.max(1, prev - 1))}
                          className="w-10 h-10 rounded-lg border border-[#701020]/15 bg-white flex items-center justify-center text-sm font-bold text-[#701020] cursor-pointer hover:bg-white/80"
                        >
                          -
                        </button>
                        <div className="flex-grow text-center py-2.5 rounded-lg border border-[#701020]/10 bg-white/60 text-xs font-bold text-[#701020]">
                          {companionsCount}
                        </div>
                        <button
                          type="button"
                          onClick={() => setCompanionsCount(prev => Math.min(20, prev + 1))}
                          className="w-10 h-10 rounded-lg border border-[#701020]/15 bg-white flex items-center justify-center text-sm font-bold text-[#701020] cursor-pointer hover:bg-white/80"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  {invitation.allowCompanions !== false && (
                    <div>
                      <label htmlFor="wish-text" className="block text-xs font-semibold text-[#701020] mb-1">{isEn ? "Special message to the newlyweds (Optional)" : "تهنئة خاصة للعروسين (اختياري)"}</label>
                      <textarea
                        id="wish-text"
                        rows={2}
                        value={newWish}
                        onChange={(e) => setNewWish(e.target.value)}
                        placeholder={isEn ? "Write your beautiful wishes here..." : "اكتب كلماتك العذبة وتهانيك للعروسين هنا..."}
                        className={`w-full px-4 py-2.5 rounded-xl border border-[#701020]/15 bg-white/70 focus:bg-white text-[#701020] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#B07070] resize-none text-xs ${isEn ? "text-left" : "text-right"}`}
                      />
                    </div>
                  )}

                  {errorMsg && (
                    <div className="text-center text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-100">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting' || !guestName.trim() || attendance === null}
                    className="w-full py-3 font-bold text-white rounded-xl shadow-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
                    style={{ background: 'linear-gradient(135deg, #701020, #6E4D68)' }}
                  >
                    {status === 'submitting' ? (isEn ? 'Submitting...' : 'جاري إرسال تأكيدكم...') : (isEn ? 'Confirm RSVP' : 'تأكيد الحضور والتهنئة')}
                  </button>
                </form>
              )}
            </div>

            {/* Wishes guestbook list */}
            {invitation.allowCompanions !== false && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <MessageCircle className="w-3.5 h-3.5 text-[#701020]/80" />
                  <p className="text-xs tracking-wider uppercase text-[#701020]/80 font-bold">{isEn ? "Guests wishes & congratulations" : "تبريكات وتهاني المهنئين"}</p>
                </div>

                <div className="space-y-3 overflow-y-auto px-1 wishes-scroll max-h-[300px] no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {wishes.map((wish, index) => (
                    <div
                      key={index}
                      className="p-4"
                      style={{
                        background: 'rgba(255, 240, 242, 0.65)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.45)',
                        borderRadius: '20px',
                        boxShadow: '0 4px 16px 0 rgba(112, 16, 32, 0.03)'
                      }}
                    >
                      <p className="text-xs text-center leading-relaxed text-[#701020] font-semibold mb-1">"{wish.text}"</p>
                      <p className="text-[9px] text-center text-[#B07070] font-bold">— {wish.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FOOTER SECTION */}
        <section className="relative min-h-[302px] py-12 px-6 flex flex-col justify-center text-center">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              src={`${S3_BASE_URL}/templates/videos/Flow_1080p_202607141304_1c6bb044.mp4`}
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#FFF0F2]/40" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-px mb-5 bg-[#701020]/10" />
            <h5 className="text-base text-[#701020] font-amiri font-bold mb-1">{eventTitle}</h5>
            <p className="text-xs text-[#B07070] font-semibold mb-4">
              {new Date(invitation.eventDate).toLocaleDateString(isEn ? 'en-US' : 'ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <a href="/" className="text-[9px] uppercase tracking-[0.25em] text-[#701020]/50 font-bold hover:underline transition-all cursor-pointer block">
              {isEn ? "Made with love on Mazoom platform" : "صنع بكل حب عبر منصة معزوم"}
            </a>
            {/* Spacer inside the section relative div to keep the video background flowing behind the bottom bar */}
            <div className="h-24" />
          </div>
        </section>
        {/* WhatsApp Custom Contact Modal Popup */}
        {showContactModal && (
          <div className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <div
              className="bg-[#FFF0F2] border border-[#B07070]/15 rounded-[28px] max-w-sm w-full p-6 shadow-2xl relative text-center"
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

              <h3 className="text-lg font-bold text-[#701020] mb-1 font-sans">
                {invitation.contactName || (isEn ? "WhatsApp Contact" : "للتواصل والاستفسار")}
              </h3>
              <p className="text-sm text-[#B07070] font-semibold mb-6 font-sans">
                {invitation.contactPhone || "+966 50 000 0001"}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${invitation.contactPhone || "+966500000001"}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-[#EBE7DF] hover:bg-neutral-50 text-black text-xs font-bold transition-all shadow-xs cursor-pointer font-sans"
                >
                  <Phone className="w-4 h-4 text-[#B07070]" />
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
    </main>
  );
}
