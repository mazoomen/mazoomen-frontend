'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { InvitationData } from '@/types/invitation';
import { Calendar, Heart, Info, MessageCircle, CheckCircle2, Phone, Camera, X } from 'lucide-react';
import api from '@/lib/api';
import type { CreateRsvpPayload } from '@/types/invitation';
import { EnvelopeOverlay, BottomNavbar } from './index';

interface InvitationClientPageEmeraldProps {
  invitation: InvitationData;
  slug?: string;
  isDeactivatedInitial?: boolean;
  viewingLangProp?: "ar" | "en";
  setViewingLangProp?: React.Dispatch<React.SetStateAction<"ar" | "en">>;
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

export default function InvitationClientPageEmerald({
  invitation: initialInvitation,
  slug,
  isDeactivatedInitial = false,
  viewingLangProp,
  setViewingLangProp
}: InvitationClientPageEmeraldProps) {
  const isEn = viewingLangProp === "en";
  const [invitation, setInvitation] = useState<InvitationData>(initialInvitation);
  const [isOpen, setIsOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [goldParticles, setGoldParticles] = useState<{
    id: number;
    size: number;
    left: number;
    delay: string;
    duration: number;
    opacity: number;
  }[]>([]);

  useEffect(() => {
    // Generate luxury gold dust particles on client side to avoid hydration mismatch
    const list = Array.from({ length: 32 }).map((_, idx) => ({
      id: idx,
      size: Math.floor(Math.random() * 4) + 2, // 2px to 5px
      left: Math.random() * 100,
      delay: (Math.random() * 10).toFixed(1),
      duration: Math.floor(Math.random() * 10) + 8, // 8s to 18s
      opacity: Math.random() * 0.45 + 0.25,
    }));
    setGoldParticles(list);
  }, []);

  const renderDecorativeNames = (title: string) => {
    const delimiters = [' & ', ' and ', ' و ', ' مع '];
    let groom = title;
    let bride = '';
    
    for (const d of delimiters) {
      if (title.includes(d)) {
        const parts = title.split(d);
        groom = parts[0]?.trim() || '';
        bride = parts[1]?.trim() || '';
        break;
      }
    }

    const isArabicNames = /[\u0600-\u06FF]/.test(title);

    if (bride) {
      return (
        <span className="flex items-center justify-center flex-wrap gap-2 md:gap-3 leading-normal">
          <span className={isArabicNames ? 'font-aref-ruqaa font-extrabold text-3xl md:text-4xl' : 'great-vibes-font text-6xl font-normal'}>
            {groom}
          </span>
          <span className="pinyon-font text-[45px] px-2 select-none text-[#c5a880]">
            &
          </span>

          <span className={isArabicNames ? 'font-aref-ruqaa font-extrabold text-3xl md:text-4xl' : 'great-vibes-font text-6xl font-normal'}>
            {bride}
          </span>
        </span>
      );
    }

    return (
      <span className={isArabicNames ? 'font-aref-ruqaa font-extrabold text-3xl md:text-4xl' : 'great-vibes-font text-5xl font-bold'}>
        {title}
      </span>
    );
  };

  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const bodyVideoRef = useRef<HTMLVideoElement>(null);
  const timelineVideoRef = useRef<HTMLVideoElement>(null);
  const wishesVideoRef = useRef<HTMLVideoElement>(null);
  const footerVideoRef = useRef<HTMLVideoElement>(null);

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
  const [companionsCount, setCompanionsCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Timeline Refs
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineIndicatorRef = useRef<HTMLDivElement>(null);
  const timelineItemRefs = useRef<(HTMLDivElement | null)[]>([]);

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
        } catch {}
      }
    }
  }, [invitation.userId]);

  const handleCameraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    if (isOpen) {
      const playVideo = (vRef: React.RefObject<HTMLVideoElement | null>) => {
        if (vRef.current) {
          vRef.current.muted = true;
          vRef.current.play().catch((err) => console.log('Video play error:', err));
        }
      };
      playVideo(mainVideoRef);
      playVideo(bodyVideoRef);
      playVideo(timelineVideoRef);
      playVideo(wishesVideoRef);
      playVideo(footerVideoRef);
    }
  }, [isOpen]);

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

  // Trigger Intersection Observer for scroll animations
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

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isOpen]);

  // Timeline Scroll Progress Line
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

  const getGoogleCalendarLink = () => {
    const calendarTitle = isEn
      ? `Wedding: ${invitation.eventTitleEn || invitation.eventTitle}`
      : `حفل زفاف: ${invitation.eventTitleAr || invitation.eventTitle}`;
    
    const eventLocation = isEn
      ? (invitation.eventLocationEn || invitation.eventLocation)
      : (invitation.eventLocationAr || invitation.eventLocation);

    const startDateRaw = new Date(invitation.eventDate);
    const start = startDateRaw.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const endDateRaw = new Date(startDateRaw.getTime() + 4 * 60 * 60 * 1000);
    const end = endDateRaw.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const defaultWelcomeText = isEn
      ? "You are cordially invited to celebrate our wedding."
      : "نتشرف بدعوتكم لمشاركتنا فرحة ليلة زفافنا.";
    
    const welcomeText = isEn
      ? (invitation.welcomeTextEn || invitation.welcomeText)
      : (invitation.welcomeTextAr || invitation.welcomeText);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarTitle)}&dates=${start}/${end}&details=${encodeURIComponent(welcomeText || defaultWelcomeText)}&location=${encodeURIComponent(eventLocation)}`;
  };

  const eventTitle = isEn
    ? (invitation.eventTitleEn || invitation.eventTitle)
    : (invitation.eventTitleAr || invitation.eventTitle);
  const eventLocation = isEn
    ? (invitation.eventLocationEn || invitation.eventLocation)
    : (invitation.eventLocationAr || invitation.eventLocation);
  const welcomeText = isEn
    ? (invitation.welcomeTextEn || invitation.welcomeText)
    : (invitation.welcomeTextAr || invitation.welcomeText);

  const timelineEvents = (invitation.eventProgram || []).map((p: any) => ({
    time: p.time || "",
    title: isEn ? (p.titleEn || p.title || "") : (p.titleAr || p.title || ""),
  }));

  const detailRules = (invitation.eventDetails || []).map((d: any) => ({
    text: isEn ? (d.textEn || d.text || "") : (d.textAr || d.text || ""),
  }));

  // Seal image from user upload
  const sealImage = "/images/emerald-seal.png";

  return (
    <main className="min-h-screen bg-[#030f23] relative flex flex-col justify-center overflow-x-hidden font-serif" dir={isEn ? "ltr" : "rtl"}>
      {/* Luxury Gold Dust Animation overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {goldParticles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: 'radial-gradient(circle, #ffe4a0 0%, #d4af37 60%, #b39369 100%)',
              boxShadow: '0 0 8px #ffe4a0, 0 0 15px #d4af37',
              opacity: p.opacity,
              animation: `goldDust-${p.id % 3} ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Floating Language Switcher */}
      {invitation.languageMode === "both" && (
        <button
          onClick={() => setViewingLangProp && setViewingLangProp(isEn ? 'ar' : 'en')}
          className="fixed top-6 right-6 z-[99999] w-12 h-12 rounded-full border flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-xs font-bold backdrop-blur-md cursor-pointer"
          style={{
            background: 'rgba(8, 26, 54, 0.45)',
            borderColor: 'rgba(223, 186, 115, 0.35)',
            color: '#dfba73',
            boxShadow: 'rgba(223, 186, 115, 0.15) 0px 4px 20px',
          }}
        >
          {isEn ? 'AR' : 'EN'}
        </button>
      )}

      {/* Background Audio Controller & Bottom Navigation Bar */}
      {isOpen && (
        <BottomNavbar
          musicUrl={invitation.musicUrl}
          musicPlaying={musicPlaying}
          setMusicPlaying={setMusicPlaying}
          theme="emerald"
          viewingLang={isEn ? 'en' : 'ar'}
          locationUrl={invitation.locationUrl}
          onContactClick={() => setShowContactModal(true)}
        />
      )}

      <EnvelopeOverlay
        eventTitle={eventTitle}
        onOpen={handleOpenInvitation}
        sealImage={sealImage}
        viewingLang={isEn ? 'en' : 'ar'}
        customSealStyle={{
          transform: 'translate(-9px, 10px) scale(1.5)',
          objectPosition: 'center',
        }}
      />

      {/* Content Container */}
      <div className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto overflow-hidden bg-[#0a1c36]/90 shadow-2xl rounded-none md:rounded-[32px] md:my-8 border border-[#dfba73]/30" dir={isEn ? "ltr" : "rtl"}>
        
        {/* Section 1: Hero Banner */}
        <section className="relative min-h-[760px] flex flex-col justify-between py-12 px-6 overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={mainVideoRef}
              src="/videos/emerald-bg-1.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#030f23]/15 via-transparent to-[#0a1c36]/35" />
          </div>

          {/* Top text placeholder: Larger and prominent */}
          <div className="relative z-10 text-center space-y-2 mt-4 animate-on-scroll">
            <span className="text-sm md:text-base uppercase tracking-[0.3em] text-[#c5a880] font-extrabold block drop-shadow-md">
              {isEn ? "Wedding Celebration" : "دعوة زواج"}
            </span>
            <div className="h-[2px] w-20 bg-[#c5a880] mx-auto opacity-80" />
          </div>

          {/* Central Names */}
          <div className="relative z-10 text-center space-y-4 my-auto animate-on-scroll">
            <h1 className="text-[#0d233a] leading-relaxed drop-shadow-sm select-none">
              {renderDecorativeNames(eventTitle)}
            </h1>
            <div className="h-[1.5px] w-24 bg-[#c5a880]/60 mx-auto" />
            <p className="text-[20px] font-sans font-bold tracking-wider text-[#c5a880] uppercase">
              {new Date(invitation.eventDate).toLocaleDateString(isEn ? 'en-US' : 'ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Bottom spacer */}
          <div className="h-6 relative z-10" />
        </section>

        {/* Section 2: Invitation Text Card & Countdown */}
        <section className="relative min-h-[750px] py-12 px-6 flex flex-col justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={bodyVideoRef}
              src="/videos/emerald-bg-2.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#0a1c36]/85 backdrop-blur-xs" />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-auto space-y-10">
            {/* Calligraphy header */}
            <div className="text-center animate-on-scroll">
              <span className="text-2xl text-[#dfba73] block font-cairo">🌿</span>
            </div>

            {/* Invitation welcome text */}
            <div
              className="p-8 text-center space-y-6"
              style={{
                background: 'rgba(8, 26, 54, 0.75)',
                border: '1.5px solid rgba(223, 186, 115, 0.35)',
                borderRadius: '24px',
                boxShadow: 'rgba(0, 0, 0, 0.4) 0px 8px 32px',
              }}
            >
              <p className="text-xs uppercase tracking-widest text-[#dfba73] font-bold">
                {isEn ? "In the Name of Allah" : "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
              </p>
              <p className="text-base text-white/95 leading-relaxed font-sans font-medium whitespace-pre-line px-2">
                {welcomeText}
              </p>
            </div>

            {/* Countdown Widget */}
            <div className="animate-on-scroll">
              <p className="text-center text-xs tracking-widest uppercase text-[#dfba73] font-bold mb-4">
                {isEn ? "Time Remaining" : "الوقت المتبقي لليلة العمر"}
              </p>
              <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto text-white">
                {[
                  { label: isEn ? "Days" : "يوم", val: timeLeft.days },
                  { label: isEn ? "Hours" : "ساعة", val: timeLeft.hours },
                  { label: isEn ? "Minutes" : "دقيقة", val: timeLeft.minutes },
                  { label: isEn ? "Seconds" : "ثانية", val: timeLeft.seconds },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-[#dfba73]/15"
                    style={{
                      background: 'rgba(8, 26, 54, 0.8)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                    }}
                  >
                    <span className="text-xl md:text-2xl font-bold font-sans tracking-tight text-[#ffffff]">
                      {String(item.val).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-[#dfba73] font-semibold mt-1 font-sans">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Calendar Button */}
            <div className="text-center animate-on-scroll">
              <a
                href={getGoogleCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#dfba73] to-[#c5a880] text-[#030f23] hover:brightness-105 transition-all duration-300 text-xs font-bold shadow-md cursor-pointer font-sans"
              >
                <Calendar className="w-4 h-4" />
                {isEn ? "Add to Google Calendar" : "حفظ الموعد في تقويم جوجل"}
              </a>
            </div>
          </div>
        </section>

        {/* Section 3: Interactive Event Timeline & Guidelines */}
        <section className="relative min-h-[750px] py-12 px-6 flex flex-col justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={timelineVideoRef}
              src="/videos/emerald-bg-2.mp4"
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#0a1c36]/85 backdrop-blur-xs" />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-auto space-y-12">
            {/* Header Title */}
            <div className="text-center animate-on-scroll">
              <span className="text-xs tracking-widest uppercase text-[#dfba73] font-bold block mb-1">
                {isEn ? "Event Timeline" : "برنامج حفل الزفاف"}
              </span>
              <h2 className="text-xl font-bold text-white">{isEn ? "Celebration Schedule" : "مخطط اليوم المبارك"}</h2>
              <div className="h-0.5 w-12 bg-[#dfba73]/30 mx-auto mt-2" />
            </div>

            {/* Timeline component */}
            {timelineEvents.length > 0 ? (
              <div ref={timelineContainerRef} className="relative pl-6 pr-6 py-2">
                {/* Vertical Indicator Line */}
                <div className="absolute top-0 bottom-0 w-[2px] bg-white/10" style={{ left: isEn ? '24px' : 'auto', right: isEn ? 'auto' : '24px' }} />
                
                {/* Growing progress line on scroll */}
                <div
                  ref={timelineIndicatorRef}
                  className="absolute top-0 w-[2px] transition-all duration-300"
                  style={{
                    left: isEn ? '24px' : 'auto',
                    right: isEn ? 'auto' : '24px',
                    height: '0px',
                    background: 'linear-gradient(to bottom, #dfba73, #ffffff)',
                  }}
                />

                <div className="space-y-8 relative z-10">
                  {timelineEvents.map((event, index) => (
                    <div
                      key={index}
                      ref={(el) => { timelineItemRefs.current[index] = el; }}
                      className="relative flex items-center gap-6 animate-on-scroll"
                    >
                      {/* Round timeline dot anchor indicator */}
                      <div
                        className="timeline-dot w-4 h-4 rounded-full border border-[#dfba73]/50 absolute transition-all duration-300 flex items-center justify-center bg-[#0a1c36]"
                        style={{
                          left: isEn ? '-23px' : 'auto',
                          right: isEn ? 'auto' : '-23px',
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#dfba73]" />
                      </div>

                      <div className={`flex flex-col gap-1 w-full ${isEn ? 'text-left pl-4' : 'text-right pr-4'}`}>
                        <span className="timeline-time text-[11px] font-sans font-bold tracking-wider text-[#dfba73]">
                          {event.time}
                        </span>
                        <span className="timeline-title text-sm text-white font-sans font-semibold">
                          {event.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="p-6 text-center text-white/70"
                style={{
                  background: 'rgba(8, 26, 54, 0.75)',
                  border: '1px dashed rgba(223, 186, 115, 0.3)',
                  borderRadius: '20px',
                }}
              >
                <p className="text-xs font-sans font-semibold">
                  {isEn ? "Wedding schedule will be available soon." : "سيتم إدراج جدول فقرات حفل الزفاف لاحقاً."}
                </p>
              </div>
            )}

            {/* Venue Location card details */}
            <div
              className="p-6 space-y-4 text-center animate-on-scroll"
              style={{
                background: 'rgba(8, 26, 54, 0.75)',
                border: '1.5px solid rgba(223, 186, 115, 0.3)',
                borderRadius: '24px',
              }}
            >
              <h4 className="text-xs uppercase tracking-widest text-[#dfba73] font-bold">
                {isEn ? "Wedding Venue" : "موقع الحفل"}
              </h4>
              <p className="text-sm font-sans font-bold text-white leading-relaxed">
                {eventLocation}
              </p>
              {invitation.locationUrl && (
                <div className="pt-2">
                  <a
                    href={invitation.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-[#dfba73] hover:text-[#e2d2bd] underline cursor-pointer"
                  >
                    {isEn ? "View on Google Maps" : "عرض الموقع الجغرافي بالخريطة"}
                  </a>
                </div>
              )}
            </div>

            {/* Event Guidelines Section */}
            {detailRules.length > 0 && (
              <div className="space-y-4 animate-on-scroll">
                <p className="text-center text-xs tracking-widest uppercase text-[#dfba73] font-bold">
                  {isEn ? "Important Details" : "تنويهات وإرشادات هامة"}
                </p>
                <div className="space-y-3 max-w-sm mx-auto">
                  {detailRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-4 flex gap-3 items-start text-white/90"
                      style={{
                        background: 'rgba(8, 26, 54, 0.7)',
                        border: '1px solid rgba(223, 186, 115, 0.2)',
                        borderRadius: '16px',
                      }}
                    >
                      <Info className="w-4 h-4 text-[#dfba73] shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed font-sans font-semibold">
                        {rule.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Moments Gallery Uploads */}
        <section className="relative min-h-[750px] py-12 px-6 flex flex-col justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={wishesVideoRef}
              src="/videos/emerald-bg-2.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#0a1c36]/85 backdrop-blur-xs" />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-auto space-y-8">
            <div className="text-center animate-on-scroll">
              <span className="text-xs tracking-widest uppercase text-[#dfba73] font-bold block mb-1">
                {isEn ? "Wedding Moments" : "مشاركة لحظاتنا السعيدة"}
              </span>
              <h2 className="text-xl font-bold text-white">{isEn ? "Photo Moments" : "معرض صور الحاضرين"}</h2>
              <div className="h-0.5 w-12 bg-[#dfba73]/30 mx-auto mt-2" />
            </div>

            {/* Moments Grid list */}
            {(invitation.moments || []).length > 0 ? (
              <div className="animate-on-scroll">
                <div className="grid grid-cols-3 gap-2 max-h-[360px] overflow-y-auto pr-1">
                  {(invitation.moments || []).map((momentUrl, index) => {
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedImage(momentUrl)}
                        className="relative aspect-square rounded-xl overflow-hidden shadow-md group cursor-pointer border border-[#dfba73]/15"
                      >
                        <img
                          src={momentUrl}
                          alt="Moment"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className="text-center py-10 text-white/60 font-sans text-xs bg-[#030f23]/75 border border-dashed border-[#dfba73]/30 rounded-[22px]"
              >
                {isEn ? "No moments captured yet. Be the first!" : "لا توجد صور ملتقطة بعد. كن أول من يشاركنا لحظاته الجميلة!"}
              </div>
            )}

            {/* Camera photo upload trigger button */}
            {invitation.allowGuestUploads !== false && (
              <div className="flex justify-center mt-4">
                <label className="flex items-center gap-2 px-6 py-3 text-xs font-semibold rounded-full border border-[#dfba73]/35 shadow-md backdrop-blur-md hover:bg-white/5 cursor-pointer bg-gradient-to-r from-[#dfba73] to-[#c5a880] text-[#030f23] hover:brightness-105 transition-all duration-300">
                  <Camera className="w-4 h-4 text-[#030f23]" />
                  {isUploading ? (isEn ? "Uploading..." : "جاري الرفع...") : (isEn ? "Upload Photo" : "شاركنا لحظة بالصورة")}
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
        </section>

        {/* Section 5: RSVP Form & Congratulations wishes */}
        <section className="relative min-h-[760px] py-12 px-6 flex flex-col justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={footerVideoRef}
              src="/videos/emerald-bg-2.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#0a1c36]/90 backdrop-blur-xs" />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-auto space-y-8">
            {/* Host message */}
            <div className="text-center animate-on-scroll">
              <span className="text-xs tracking-widest uppercase text-[#dfba73] font-bold block mb-1">
                {isEn ? "Message from the family" : "بطاقة الترحيب والتهنئة"}
              </span>
              <p className="text-[14px] text-white/90 leading-relaxed whitespace-pre-line px-4 font-sans font-medium">
                {isEn
                  ? `Your presence completes our joy, and your warm prayers bless our hearts.\nWe look forward to celebrating this special night with you.`
                  : `حضوركم يكلل أفراحنا بالسعادة، ودعواتكم النبيلة تبهج قلوبنا.\nنسعد بلقائكم ونشرف بحضوركم لمشاركتنا هذه الليلة المباركة.`}
              </p>
            </div>

            {/* RSVP Form Widget */}
            <div
              className="p-6 animate-on-scroll"
              style={{
                background: 'rgba(8, 26, 54, 0.8)',
                border: '1.5px solid rgba(223, 186, 115, 0.35)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.4)',
              }}
            >
              <h3 className="text-center text-base font-bold text-white mb-6 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 text-[#dfba73] fill-[#dfba73]" />
                {isEn ? "Confirm RSVP" : "تأكيد الحضور (RSVP)"}
              </h3>

              {status === 'success' ? (
                <div className="text-center py-6 space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-12 h-12 text-[#dfba73]" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {isEn ? "Response Submitted!" : "تم تسجيل حضوركم بنجاح!"}
                  </h4>
                  <p className="text-xs text-white/80 leading-relaxed font-sans">
                    {isEn
                      ? "Thank you for confirming your attendance! We are excited to celebrate this joyous occasion with you. 🤍"
                      : "شاكرين لكم إجابة الدعوة ومشاركتنا فرحة ليلة الزفاف. ننتظر قدومكم بفارغ الصبر! 🤍"}
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-6 py-2 text-xs font-semibold rounded-full border border-[#dfba73]/30 hover:bg-white/5 text-[#dfba73] cursor-pointer font-sans"
                  >
                    {isEn ? "Submit another RSVP" : "تأكيد حضور ضيف آخر"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className={`space-y-4 ${isEn ? "text-left" : "text-right"}`}>
                  {/* Name field */}
                  <div>
                    <label htmlFor="guest-name" className="block text-xs font-semibold text-[#dfba73] mb-1">
                      {isEn ? "Full Name" : "الاسم الكريم"}
                    </label>
                    <input
                      id="guest-name"
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={isEn ? "Your name" : "يرجى كتابة الاسم"}
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border border-[#dfba73]/30 bg-[#030f23]/75 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#dfba73] focus:border-[#dfba73] text-xs font-sans ${isEn ? "text-left" : "text-right"}`}
                    />
                  </div>

                  {/* Attendance buttons */}
                  <div>
                    <label className="block text-xs font-semibold text-[#dfba73] mb-1">
                      {isEn ? "Will you attend?" : "هل ستشرفنا بحضورك؟"}
                    </label>
                    <div className="grid grid-cols-2 gap-3 font-sans">
                      <button
                        type="button"
                        onClick={() => setAttendance('YES')}
                        className={`py-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${attendance === 'YES'
                          ? 'bg-gradient-to-r from-[#dfba73] to-[#c5a880] text-[#030f23] border-[#dfba73]'
                          : 'bg-[#030f23]/40 border-white/10 text-white hover:bg-[#030f23]/70'
                        }`}
                      >
                        {isEn ? "Yes, I will attend" : "نعم، بكل سرور"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendance('NO')}
                        className={`py-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${attendance === 'NO'
                          ? 'bg-red-700/20 text-red-300 border-red-800/40'
                          : 'bg-[#030f23]/40 border-white/10 text-white hover:bg-[#030f23]/70'
                        }`}
                      >
                        {isEn ? "Sorry, cannot attend" : "أعتذر عن الحضور"}
                      </button>
                    </div>
                  </div>

                  {/* Companions slider/count */}
                  {attendance === 'YES' && (
                    <div className="animate-fade-in font-sans">
                      <label htmlFor="companions-count" className="block text-xs font-semibold text-[#dfba73] mb-1">
                        {isEn ? "Number of Companions" : "عدد المرافقين"}
                      </label>
                      <select
                        id="companions-count"
                        value={companionsCount}
                        onChange={(e) => setCompanionsCount(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#dfba73]/30 bg-[#030f23]/80 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#dfba73] focus:border-[#dfba73]"
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

                  {/* Custom wishes congrats input */}
                  <div>
                    <label htmlFor="wish-text" className="block text-xs font-semibold text-[#dfba73] mb-1">
                      {isEn ? "Special Wish for Couple (Optional)" : "تهنئة وتبريك للعروسين (اختياري)"}
                    </label>
                    <textarea
                      id="wish-text"
                      rows={2}
                      value={newWish}
                      onChange={(e) => setNewWish(e.target.value)}
                      placeholder={isEn ? "Write your beautiful wishes..." : "اكتب أمنياتك وتبريكاتك الطيبة هنا..."}
                      className={`w-full px-4 py-2.5 rounded-xl border border-[#dfba73]/30 bg-[#030f23]/75 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#dfba73] focus:border-[#dfba73] resize-none text-xs font-sans ${isEn ? "text-left" : "text-right"}`}
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-center text-xs text-red-300 bg-red-900/20 p-2.5 rounded-xl border border-red-900/40 font-sans">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting' || !guestName.trim() || attendance === null}
                    className="w-full py-3 font-bold text-[#030f23] rounded-xl shadow-lg transition-opacity hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs bg-gradient-to-r from-[#dfba73] to-[#c5a880] font-sans"
                  >
                    {status === 'submitting' ? (isEn ? 'Submitting...' : 'جاري الإرسال...') : (isEn ? 'Confirm RSVP' : 'إرسال تأكيد الحضور')}
                  </button>
                </form>
              )}
            </div>

            {/* Wishes guestbook lists */}
            <div className="space-y-4 animate-on-scroll">
              <div className="flex items-center gap-2 justify-center mb-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#dfba73]" />
                <p className="text-xs tracking-wider uppercase text-[#dfba73] font-bold">
                  {isEn ? "Guests Congratulations" : "تبريكات وتهاني المهنئين"}
                </p>
              </div>

              <div className="space-y-3 overflow-y-auto px-1 max-h-[300px]" style={{ scrollbarWidth: 'none' }}>
                {wishes.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-4"
                    style={{
                      background: 'rgba(8, 26, 54, 0.7)',
                      border: '1px solid rgba(223, 186, 115, 0.2)',
                      borderRadius: '16px',
                    }}
                  >
                    <div className="flex justify-between items-center mb-1 font-sans text-xs">
                      <span className="font-bold text-white">{w.name}</span>
                      <span className="text-[10px] text-[#dfba73]">✨</span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed font-sans whitespace-pre-line">
                      {w.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer info details */}
        <section className="relative min-h-[300px] py-12 px-6 flex flex-col justify-center text-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={footerVideoRef}
              src="/videos/emerald-bg-2.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#0a1c36]/95 backdrop-blur-xs" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="mx-10 h-px bg-[#dfba73]/20" />
            <div className="text-white">
              <div className="text-xl font-bold tracking-wide mb-2 text-[#ffffff]">
                {renderDecorativeNames(eventTitle)}
              </div>
              <div className="text-xs text-[#dfba73] font-sans font-semibold mb-6">
                {new Date(invitation.eventDate).toLocaleDateString(isEn ? 'en-US' : 'ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-sans">
                {isEn ? "Made with love on Mazoom platform" : "صنع بكل حب عبر منصة معزوم"}
              </p>
              {/* Spacer inside the section relative div to keep the video background flowing behind the bottom bar */}
              <div className="h-24" />
            </div>
          </div>
        </section>
      </div>

      {/* WhatsApp Custom Contact Modal Popup */}
      {showContactModal && (
        <div className="fixed inset-0 bg-[#030f23]/65 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
          <div className="bg-[#0a1c36] border border-[#dfba73]/35 rounded-[28px] max-w-sm w-full p-6 shadow-2xl relative text-center text-white font-sans">
            {/* Close Button */}
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 rounded-full bg-[#128C7E]/10 flex items-center justify-center mx-auto mb-4 text-[#128C7E] border border-[#128C7E]/20">
              <Phone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              {invitation.contactName || (isEn ? "WhatsApp Contact" : "للتواصل والاستفسار")}
            </h3>
            <p className="text-sm text-[#dfba73] font-semibold mb-6">
              {invitation.contactPhone || "+966 50 000 0001"}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${invitation.contactPhone || "+966500000001"}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#030f23] border border-[#dfba73]/30 hover:bg-white/5 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#dfba73]" />
                {isEn ? "Call" : "اتصال"}
              </a>
              <a
                href={`https://wa.me/${(invitation.contactPhone || "+966500000001").replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#128C7E] text-white hover:bg-[#075e54] text-xs font-bold transition-all shadow-md cursor-pointer"
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

      {/* Lightbox for moments gallery images */}
      {selectedImage && (
        <div className="fixed inset-0 bg-[#030f23]/85 backdrop-blur-md z-[999999] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-[#dfba73] transition-colors cursor-pointer"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Moment Lightbox"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-[#dfba73]/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Pinyon+Script&display=swap');
        .great-vibes-font {
          font-family: 'Great Vibes', cursive;
        }
        .pinyon-font {
          font-family: 'Pinyon Script', cursive;
        }
        .font-aref-ruqaa {
          font-family: var(--font-aref-ruqaa), var(--font-amiri), serif !important;
        }
        .font-cinzel {
          font-family: var(--font-cinzel), serif !important;
        }
        @keyframes goldDust-0 {
          0% {
            transform: translateY(-20px) translateX(0) scale(0.8) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          50% {
            transform: translateY(50vh) translateX(25px) scale(1.2) rotate(180deg);
            opacity: 0.9;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(105vh) translateX(-10px) scale(0.6) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes goldDust-1 {
          0% {
            transform: translateY(-20px) translateX(0) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          60% {
            transform: translateY(55vh) translateX(-30px) scale(1.1) rotate(-180deg);
            opacity: 0.6;
          }
          85% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(105vh) translateX(15px) scale(0.7) rotate(-360deg);
            opacity: 0;
          }
        }
        @keyframes goldDust-2 {
          0% {
            transform: translateY(-20px) translateX(0) scale(0.9) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 0.6;
          }
          45% {
            transform: translateY(45vh) translateX(15px) scale(1.3) rotate(120deg);
            opacity: 0.85;
          }
          92% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(105vh) translateX(-20px) scale(0.5) rotate(240deg);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
