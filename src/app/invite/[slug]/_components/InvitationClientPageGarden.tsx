'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { InvitationData } from '@/types/invitation';
import { Calendar, Heart, Info, Baby, QrCode, MessageCircle, Users, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import type { CreateRsvpPayload } from '@/types/invitation';
import { EnvelopeOverlay, BottomNavbar } from './index';

interface InvitationClientPageGardenProps {
  invitation: InvitationData;
  slug?: string;
  isDeactivatedInitial?: boolean;
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

const defaultWishes: Wish[] = [
  { name: 'محمد العلي', text: 'ألف مبروك! نسعد بحضور حفلكم الكريم.' },
  { name: 'سارة خالد', text: 'بارك الله لكما وبارك عليكما وجمع بينكما في خير 🤍' },
  { name: 'أحمد وندى', text: 'الله يتمم لكم على خير يا رب، فرحنا لكم من قلب.' },
  { name: 'عبدالله السعد', text: 'دعواتنا لكم بحياة سعيدة ومباركة.' }
];

export default function InvitationClientPageGarden({
  invitation,
  slug,
  isDeactivatedInitial = false,
}: InvitationClientPageGardenProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  // RSVP Form States
  const [wishes, setWishes] = useState<Wish[]>(defaultWishes);
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

  // Details Refs
  const detailsContainerRef = useRef<HTMLDivElement>(null);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setMusicPlaying(true);
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

  // Couple names helper
  const getCoupleNames = (title: string) => {
    const delimiters = [' & ', ' and ', ' و ', ' مع '];
    for (const d of delimiters) {
      if (title.includes(d)) {
        const parts = title.split(d);
        return {
          groom: parts[0]?.trim() || 'العريس',
          bride: parts[1]?.trim() || 'العروس'
        };
      }
    }
    return { groom: title, bride: '' };
  };

  const { groom, bride } = getCoupleNames(invitation.eventTitle);

  // Date utilities
  const parsedDate = new Date(invitation.eventDate);
  
  const getArabicFormattedDate = () => {
    try {
      return new Intl.DateTimeFormat('ar-EG', {
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

  const getMonthNameAr = () => {
    try {
      return new Intl.DateTimeFormat('ar-EG', { month: 'long' }).format(parsedDate);
    } catch {
      return '';
    }
  };

  const getDayNameAr = () => {
    try {
      return new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(parsedDate);
    } catch {
      return '';
    }
  };

  const getYearNum = () => parsedDate.getFullYear();
  const getDayNum = () => parsedDate.getDate();
  const getTimeString = () => {
    try {
      return new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit', hour12: true }).format(parsedDate);
    } catch {
      return '';
    }
  };

  const defaultWelcomeText = `بقلوبٍ يملؤها الفرح والسرور،\nنتشرف بدعوتكم لمشاركتنا فرحة العمر\nوتوثيق عهد الحب والوفاء\n\nفي حفل زفاف أبنائنا\n\nحضوركم يسعدنا ويضفي على ليلتنا بهجة وسروراً 🌿`;

  const [hallName, cityName] = invitation.eventLocation.includes('،')
    ? invitation.eventLocation.split('،')
    : invitation.eventLocation.includes(',')
      ? invitation.eventLocation.split(',')
      : [invitation.eventLocation, ''];

  const getGoogleCalendarUrl = () => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const start = `${parsedDate.getUTCFullYear()}${pad(parsedDate.getUTCMonth() + 1)}${pad(parsedDate.getUTCDate())}T${pad(parsedDate.getUTCHours())}${pad(parsedDate.getUTCMinutes())}${pad(parsedDate.getUTCSeconds())}Z`;
    
    const endDate = new Date(parsedDate.getTime() + 3 * 60 * 60 * 1000);
    const end = `${endDate.getUTCFullYear()}${pad(endDate.getUTCMonth() + 1)}${pad(endDate.getUTCDate())}T${pad(endDate.getUTCHours())}${pad(endDate.getUTCMinutes())}${pad(endDate.getUTCSeconds())}Z`;
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('حفل زفاف ' + invitation.eventTitle)}&dates=${start}/${end}&details=${encodeURIComponent(invitation.welcomeText || defaultWelcomeText)}&location=${encodeURIComponent(invitation.eventLocation)}`;
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
        'حدث خطأ أثناء إرسال ردك. يرجى المحاولة مرة أخرى.'
      );
    }
  };

  const timelineEvents = invitation.eventProgram?.length
    ? invitation.eventProgram
    : [];

  const detailRules = invitation.eventDetails?.length
    ? invitation.eventDetails.map((detail) => ({
        icon: <Info className="w-4.5 h-4.5 text-[#2E5A36]" />,
        text: detail.text
      }))
    : [];

  return (
    <main className="min-h-screen bg-[#F5F2EB] relative flex flex-col justify-center font-cairo garden-theme">
      {/* Google Fonts and CSS Overrides for green theme & custom animations */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@200..1000&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        .font-aref {
          font-family: 'Aref Ruqaa', serif !important;
          font-size: 3rem !important;
          text-shadow: 1px 1px 3px rgba(46, 90, 54, 0.12) !important;
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

        /* Override Global CSS definitions to match the green theme instead of gold */
        .garden-theme .timeline-time, 
        .garden-theme .timeline-title {
          color: #1B3222 !important;
          opacity: 0 !important;
          transform: translateY(15px) !important;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .garden-theme .timeline-time.active, 
        .garden-theme .timeline-title.active {
          color: #2E5A36 !important;
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        /* Timeline Dot - Clean filled circle matching template 1 but in green */
        .garden-theme .timeline-dot {
          background: rgba(46, 90, 54, 0.25) !important;
          box-shadow: none !important;
          transform: scale(1) !important;
          transition: background 0.5s ease, box-shadow 0.5s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }

        .garden-theme .timeline-dot.active {
          background: #2E5A36 !important;
          transform: scale(1.4) !important;
          box-shadow: 0 0 0 4px rgba(46, 90, 54, 0.15), 0 0 14px 6px rgba(46, 90, 54, 0.25) !important;
        }

        /* Details list items custom dots overrides - clean circle like template 1 */
        .garden-theme .timeline-detail-dot {
          transform: scale(0.6) !important;
          background: rgba(46, 90, 54, 0.2) !important;
          box-shadow: none !important;
          transition: background 0.6s, box-shadow 0.6s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .garden-theme .detail-item-row.visible .timeline-detail-dot {
          transform: scale(1.2) !important;
          background: #2E5A36 !important;
          box-shadow: 0 0 0 4px rgba(46, 90, 54, 0.15), 0 0 14px 6px rgba(46, 90, 54, 0.25) !important;
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

      {/* Background audio controller & Navigation bar */}
      {isOpen && (
        <BottomNavbar 
          musicUrl={invitation.musicUrl} 
          musicPlaying={musicPlaying} 
          setMusicPlaying={setMusicPlaying} 
          theme="green"
        />
      )}

      {/* Wax seal cover splitting envelope */}
      <EnvelopeOverlay eventTitle={invitation.eventTitle} onOpen={handleOpenInvitation} sealImage="/images/98a4144b-74ef-45c4-8066-8c6cbb1e8a0e.png" />

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
              backgroundColor: p.type === 'leaf' ? 'rgba(74, 109, 85, 0.45)' : 'rgba(255, 255, 255, 0.75)',
              borderRadius: p.type === 'leaf' ? '50% 0 50% 0' : '50%',
              border: p.type === 'petal' ? '1px solid rgba(240, 230, 210, 0.4)' : 'none',
              animation: `falling-particles ${p.duration}s linear ${p.delay}s infinite`,
              '--drift-x': `${p.drift}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Invitation Contents Container (Styled exactly like Template 1, restricted inside a phone-like container card) */}
      <div className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto overflow-hidden bg-white shadow-2xl rounded-none md:rounded-[32px] md:my-8 animate-on-scroll" dir="rtl" style={{ color: '#1B3222' }}>
        
        {/* HERO SECTION */}
        <section className="relative min-h-[700px] flex flex-col items-center justify-start text-center pt-24">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={videoRef}
              src="/videos/Untitled_design.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            {/* Soft tint overlay */}
            <div className="absolute inset-0 bg-[#FAF9F6]/20" />
          </div>
          <div className="relative z-10 -mt-8 pr-6 pl-6 flex flex-col items-center w-full">
            <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-[#1B3222]/40 to-transparent" />
            <div className="text-base tracking-[0.25em] mb-4 text-[#1B3222] font-semibold">حفل زفاف</div>
            
            {/* Calligraphic Decorative Large Names */}
            <h1 className="font-aref font-bold leading-none text-[#1B3222] select-none my-3 tracking-wide">
              {groom}
            </h1>
            {bride && (
              <>
                <span className="text-3xl font-aref font-normal text-[#2E5A36] my-1">&amp;</span>
                <h1 className="font-aref font-bold leading-none text-[#1B3222] select-none my-3 tracking-wide">
                  {bride}
                </h1>
              </>
            )}

            <div className="mt-10">
              <div className="text-xs font-bold tracking-wide bg-[#FAF9F6]/60 backdrop-blur-xs px-5 py-2.5 rounded-full border border-[#1B3222]/10 text-[#1B3222]">
                {getArabicFormattedDate()}
              </div>
            </div>
          </div>
          <div className="absolute bottom-16 left-10 right-10 h-px bg-[#1B3222]/10" />
        </section>

        {/* INVITATION CARD & COUNTDOWN SECTION */}
        <section className="relative min-h-[700px] py-12 px-6 flex flex-col justify-center">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="/videos/Untitled_design.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#FAF9F6]/30" />
          </div>

          <div className="relative z-10 space-y-8 w-full max-w-lg mx-auto">
            {/* The main invite card with glassmorphism */}
            <div 
              className="p-8 animate-on-scroll fade-up"
              style={{ 
                backdropFilter: 'blur(16px) saturate(120%)', 
                background: 'rgba(253, 251, 246, 0.65)', 
                border: '1px solid rgba(255, 255, 255, 0.45)', 
                boxShadow: '0 8px 32px 0 rgba(27, 50, 34, 0.06)', 
                borderRadius: '28px' 
              }}
            >
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <span className="text-3xl text-[#2E5A36]">🌿</span>
                </div>
                <h4 className="text-sm font-bold tracking-widest text-[#1B3222] mb-4 uppercase">دعوة لحضور حفل زفاف</h4>
                <div className="text-[15px] whitespace-pre-line text-[#1B3222] leading-relaxed mb-6 font-medium">
                  {invitation.welcomeText || defaultWelcomeText}
                </div>
                <div className="text-xl font-amiri font-bold text-[#2E5A36] tracking-wide">
                  {groom} {bride ? `& ${bride}` : ''}
                </div>
              </div>
            </div>

            {/* Location indicator */}
            <div className="text-center animate-on-scroll fade-up">
              <span className="text-xs tracking-widest uppercase text-[#1B3222]/60 font-bold block mb-1">الموقع</span>
              <h3 className="font-bold text-lg text-[#1B3222]">{hallName?.trim()}</h3>
              {cityName && <p className="text-sm text-[#1B3222]/80 mt-1 font-semibold">{cityName?.trim()}</p>}
            </div>

            {/* Elegant Calendar Widget */}
            <div className="animate-on-scroll fade-up flex justify-center" style={{ perspective: '1200px' }}>
              <div className="w-full max-w-[240px] overflow-hidden shadow-md border border-[#1B3222]/10" style={{ borderRadius: '22px' }}>
                <div className="relative flex items-center justify-between px-5 py-3 bg-[#1B3222]">
                  <div className="absolute top-0 left-1/3 -translate-x-1/2 w-4 h-4.5 rounded-b-full bg-white/20 border border-white/40" />
                  <div className="absolute top-0 right-1/3 translate-x-1/2 w-4 h-4.5 rounded-b-full bg-white/20 border border-white/40" />
                  <span className="text-[9px] tracking-[0.2em] opacity-85 text-white font-bold">{getYearNum()}</span>
                  <span className="text-sm font-bold tracking-wider text-white font-amiri">{getMonthNameAr()}</span>
                  <span className="text-[9px] tracking-[0.2em] opacity-85 text-white font-bold">{getDayNameAr()}</span>
                </div>
                <div className="flex flex-col items-center py-5 px-4 bg-white/60 backdrop-blur-md">
                  <span className="font-bold leading-none text-[5rem] text-[#1B3222] font-amiri">{getDayNum()}</span>
                  <div className="w-10 h-px my-3 bg-[#1B3222]/10" />
                  <span className="text-[11px] tracking-[0.25em] uppercase mb-1 text-[#1B3222] font-semibold">{getDayNameAr()}</span>
                  <span className="text-sm font-bold tracking-widest text-[#2E5A36]">{getTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Save date button */}
            <div className="flex justify-center animate-on-scroll fade-up">
              <button 
                onClick={() => window.open(getGoogleCalendarUrl(), '_blank')}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-full border border-white/40 shadow-xs backdrop-blur-md hover:bg-white/35 transition-all text-[#1B3222] bg-[#FAF9F6]/60 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#2E5A36]" />
                احفظ الموعد في التقويم
              </button>
            </div>

            {/* Countdown widget */}
            <div 
              className="p-5 animate-on-scroll fade-up"
              style={{ 
                backdropFilter: 'blur(16px) saturate(120%)', 
                background: 'rgba(253, 251, 246, 0.65)', 
                border: '1px solid rgba(255, 255, 255, 0.45)', 
                boxShadow: '0 8px 32px 0 rgba(27, 50, 34, 0.06)', 
                borderRadius: '24px' 
              }}
            >
              <h4 className="text-center text-xs tracking-widest font-bold text-[#1B3222] mb-3">العد التنازلي للمناسبة</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'أيام', val: timeLeft.days },
                  { label: 'ساعات', val: timeLeft.hours },
                  { label: 'دقائق', val: timeLeft.minutes },
                  { label: 'ثواني', val: timeLeft.seconds }
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-2 rounded-xl bg-white/50 border border-[#1B3222]/10 shadow-xs">
                    <div className="text-xl font-bold text-[#1B3222]">
                      {item.val}
                    </div>
                    <div className="text-[9px] tracking-wider mt-1 text-[#1B3222]/70 font-semibold">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TIMELINE & DETAILS SECTION */}
        <section className="relative min-h-[700px] py-12 px-6 flex flex-col justify-center">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="/videos/Untitled_design.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#FAF9F6]/30" />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-auto space-y-8">
            {/* Timeline (Fully Animated) */}
            {timelineEvents.length > 0 && (
              <div 
                className="p-6 timeline-items-container"
                ref={timelineContainerRef}
                style={{ 
                  backdropFilter: 'blur(16px) saturate(120%)', 
                  background: 'rgba(253, 251, 246, 0.65)', 
                  border: '1px solid rgba(255, 255, 255, 0.45)', 
                  boxShadow: '0 8px 32px 0 rgba(27, 50, 34, 0.06)', 
                  borderRadius: '24px' 
                }}
              >
                <h3 className="text-center text-lg font-bold text-[#1B3222] mb-8">برنامج الحفل</h3>
                <div className="relative">
                  {/* Vertical Center Track Line */}
                  <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#2E5A36]/30 to-transparent" style={{ left: '50%', transform: 'translateX(-50%)' }} />
                  
                  {/* Gliding Circular Indicator (Confined to elegant ring like template 1, but in green) */}
                  <div 
                    ref={timelineIndicatorRef} 
                    id="timeline-indicator" 
                    className="absolute pointer-events-none z-20" 
                    style={{ top: '0px', left: '50%', transform: 'translate(-50%, -50%)', transition: 'top 0.1s ease-out' }}
                  >
                    <div className="w-5 h-5 rounded-full" style={{ background: 'transparent', border: '2px solid #2E5A36', boxShadow: '0 0 0 4px rgba(46, 90, 54, 0.15), 0 0 18px 8px rgba(46, 90, 54, 0.25), 0 0 36px 16px rgba(46, 90, 54, 0.1)' }} />
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
                          <span className="text-xs font-bold timeline-time block">
                            {event.time}
                          </span>
                        </div>
                        <div className="w-7 flex justify-center shrink-0 z-10">
                          {/* Circle Dot (Green, styled exactly like Template 1) */}
                          <div className="w-2.5 h-2.5 rounded-full timeline-dot" />
                        </div>
                        <div className="w-[calc(50%-14px)] pl-4 text-left">
                          <span className="text-xs font-bold timeline-title block leading-tight">
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
                  background: 'rgba(253, 251, 246, 0.65)', 
                  border: '1px solid rgba(255, 255, 255, 0.45)', 
                  boxShadow: '0 8px 32px 0 rgba(27, 50, 34, 0.06)', 
                  borderRadius: '24px' 
                }}
              >
                <h3 className="text-center text-lg font-bold text-[#1B3222] mb-5">تفاصيل تهمك</h3>
                <div className="space-y-4 relative pl-7">
                  {/* Vertical track line for details rules */}
                  <div 
                    className="absolute left-2.5 top-3.5 bottom-3.5 w-px bg-gradient-to-b from-transparent via-[#2E5A36]/30 to-transparent" 
                  />

                  {detailRules.map((rule, idx) => (
                    <div key={idx} className="relative flex items-center gap-3.5 min-h-[52px] detail-item-row">
                      {/* Circle Bullet (Green, styled exactly like Template 1) */}
                      <div 
                        className="absolute -left-5 w-2.5 h-2.5 rounded-full shrink-0 timeline-detail-dot" 
                        style={{ 
                          top: '50%', 
                          marginTop: '-5px' 
                        }} 
                      />

                      <div className="flex items-center gap-3 flex-1 p-3 bg-white/40 border border-[#1B3222]/5 rounded-xl">
                        <span className="w-7 h-7 rounded-full bg-[#2E5A36]/10 border border-[#2E5A36]/10 flex items-center justify-center shrink-0">
                          {rule.icon}
                        </span>
                        <span className="text-xs text-[#1B3222] font-semibold leading-tight">{rule.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* WISHES & RSVP SECTION */}
        <section className="relative min-h-[763px] py-12 px-6 flex flex-col justify-center">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="/videos/Untitled_design.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#FAF9F6]/30" />
          </div>

          <div className="relative z-10 w-full max-w-lg mx-auto space-y-8">
            {/* Couple Message */}
            <div className="text-center animate-on-scroll">
              <span className="text-xs tracking-widest uppercase text-[#1B3222]/60 font-bold block mb-1">رسالة العروسين</span>
              <p className="text-[15px] text-[#1B3222] leading-relaxed whitespace-pre-line px-4 font-medium">
                فرحتنا لا تكتمل إلا بمشاركتكم لنا هذا اليوم البهيج
                {"\n"}وجودكم بيننا شرف ودعواتكم الصادقة تمنحنا السعادة
                {"\n"}شاركونا بداية فصل جديد من حياتنا 🌿
              </p>
              <p className="text-sm font-bold text-[#2E5A36] mt-3">
                بكل حب، {groom} {bride ? `& ${bride}` : ''}
              </p>
            </div>

            {/* RSVP Card */}
            <div 
              className="p-6 animate-on-scroll fade-up"
              style={{ 
                backdropFilter: 'blur(16px) saturate(120%)', 
                background: 'rgba(253, 251, 246, 0.65)', 
                border: '1px solid rgba(255, 255, 255, 0.45)', 
                boxShadow: '0 8px 32px 0 rgba(27, 50, 34, 0.06)', 
                borderRadius: '24px' 
              }}
            >
              <h3 className="text-center text-lg font-bold text-[#1B3222] mb-6 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-[#2E5A36] fill-[#2E5A36]" />
                تأكيد حضور الحفل (RSVP)
              </h3>

              {status === 'success' ? (
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-800">تم تسجيل حضوركم بنجاح!</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    نسعد جداً بتلبيتكم للدعوة ومشاركتنا ليلة العمر. ننتظر لقاءكم بشوق! 🤍
                  </p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-6 py-2 text-xs font-semibold rounded-full border border-[#1B3222]/15 hover:bg-[#1B3222]/5 text-[#1B3222] cursor-pointer font-cairo"
                  >
                    تأكيد حضور ضيف آخر
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-4 text-right">
                  {/* Guest Name */}
                  <div>
                    <label htmlFor="guest-name" className="block text-xs font-semibold text-[#1B3222] mb-1">الاسم الكريم</label>
                    <input
                      id="guest-name"
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="يرجى كتابة الاسم الثلاثي"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-[#1B3222]/15 bg-white/70 focus:bg-white text-[#1B3222] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#AC8C60] text-right text-xs"
                    />
                  </div>

                  {/* Attendance */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1B3222] mb-1">هل ستشرفنا بحضورك؟</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAttendance('YES')}
                        className={`py-2.5 rounded-xl border font-bold text-xs transition-all duration-300 cursor-pointer ${
                          attendance === 'YES'
                            ? 'bg-[#1B3222] text-white border-[#1B3222]'
                            : 'bg-white/60 border-gray-200 text-[#1B3222] hover:bg-white/80'
                        }`}
                      >
                        نعم، بكل سرور
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendance('NO')}
                        className={`py-2.5 rounded-xl border font-bold text-xs transition-all duration-300 cursor-pointer ${
                          attendance === 'NO'
                            ? 'bg-red-700/10 text-red-900 border-red-200'
                            : 'bg-white/60 border-gray-200 text-[#1B3222] hover:bg-white/80'
                        }`}
                      >
                        أعتذر، متمنياً لكم السعادة
                      </button>
                    </div>
                  </div>

                  {/* Companions */}
                  {attendance === 'YES' && (
                    <div className="animate-fade-in">
                      <label htmlFor="companions-count" className="block text-xs font-semibold text-[#1B3222] mb-1">عدد المرافقين</label>
                      <select
                        id="companions-count"
                        value={companionsCount}
                        onChange={(e) => setCompanionsCount(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#1B3222]/15 bg-white/70 text-[#1B3222] text-xs focus:outline-none focus:ring-1 focus:ring-[#AC8C60]"
                      >
                        <option value={0}>أنا فقط (بدون مرافقين)</option>
                        <option value={1}>مرافق واحد (+1)</option>
                        <option value={2}>مرافقين اثنين (+2)</option>
                        <option value={3}>ثلاثة مرافقين (+3)</option>
                        <option value={4}>أربعة مرافقين (+4)</option>
                        <option value={5}>خمسة مرافقين (+5)</option>
                      </select>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label htmlFor="wish-text" className="block text-xs font-semibold text-[#1B3222] mb-1">تهنئة خاصة للعروسين (اختياري)</label>
                    <textarea
                      id="wish-text"
                      rows={2}
                      value={newWish}
                      onChange={(e) => setNewWish(e.target.value)}
                      placeholder="اكتب كلماتك العذبة وتهانيك للعروسين هنا..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#1B3222]/15 bg-white/70 focus:bg-white text-[#1B3222] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#AC8C60] text-right resize-none text-xs"
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-center text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-100">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting' || !guestName.trim() || attendance === null}
                    className="w-full py-3 font-bold text-white rounded-xl shadow-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
                    style={{ background: 'linear-gradient(135deg, #1B3222, #2A4D35)' }}
                  >
                    {status === 'submitting' ? 'جاري إرسال تأكيدكم...' : 'تأكيد الحضور والتهنئة'}
                  </button>
                </form>
              )}
            </div>

            {/* Wishes guestbook list */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#1B3222]/80" />
                <p className="text-xs tracking-wider uppercase text-[#1B3222]/80 font-bold">تبريكات وتهاني المهنئين</p>
              </div>

              <div className="space-y-3 overflow-y-auto px-1 wishes-scroll max-h-[300px]" style={{ scrollbarWidth: 'none' }}>
                {wishes.map((wish, index) => (
                  <div 
                    key={index} 
                    className="p-4" 
                    style={{ 
                      background: 'rgba(253, 251, 246, 0.65)', 
                      backdropFilter: 'blur(12px)', 
                      border: '1px solid rgba(255, 255, 255, 0.45)', 
                      borderRadius: '20px', 
                      boxShadow: '0 4px 16px 0 rgba(27, 50, 34, 0.03)' 
                    }}
                  >
                    <p className="text-xs text-center leading-relaxed text-[#1B3222] font-semibold mb-1">"{wish.text}"</p>
                    <p className="text-[9px] text-center text-[#2E5A36] font-bold">— {wish.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER SECTION */}
        <section className="relative min-h-[302px] py-12 px-6 flex flex-col justify-center text-center">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="/videos/Untitled_design.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-[#FAF9F6]/40" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-px mb-5 bg-[#1B3222]/10" />
            <h5 className="text-base text-[#1B3222] font-amiri font-bold mb-1">{invitation.eventTitle}</h5>
            <p className="text-xs text-[#2E5A36] font-semibold mb-4">
              {new Date(invitation.eventDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#1B3222]/50 font-bold">
              صنع بكل حب عبر منصة مازوم
            </p>
            {/* Spacer inside the section relative div to keep the video background flowing behind the bottom bar */}
            <div className="h-24" />
          </div>
        </section>
      </div>
    </main>
  );
}
