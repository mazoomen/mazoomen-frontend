'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface InvitationBodyProps {
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  locationUrl?: string | null;
  welcomeText?: string | null;
}

export const InvitationBody: React.FC<InvitationBodyProps> = ({
  eventTitle,
  eventDate,
  eventLocation,
  locationUrl,
  welcomeText
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(eventDate).getTime();

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
  }, [eventDate]);

  // Helper to split couple names from eventTitle
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

  const { groom, bride } = getCoupleNames(eventTitle);

  // Date Parsing for the calendar card in Arabic
  const parsedDate = new Date(eventDate);
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

  const defaultWelcomeText = `بقلوبٍ يملؤها الفرح\nوبدعاءٍ صادق أن يتمّ الله لنا ولكم الخير\nنتشرف بدعوتكم لمشاركتنا\nفرحة أبنائنا\n\nفي يومٍ جمع الله فيه القلوب\nوكتب فيه بداية عمرٍ جديد\nوجودكم بيننا شرف\nومشاركتكم لنا تزيد الفرح فرحًا 🤍`;

  // Venue location splitter
  const [hallName, cityName] = eventLocation.includes('،')
    ? eventLocation.split('،')
    : eventLocation.includes(',')
      ? eventLocation.split(',')
      : [eventLocation, ''];

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const start = `${parsedDate.getUTCFullYear()}${pad(parsedDate.getUTCMonth() + 1)}${pad(parsedDate.getUTCDate())}T${pad(parsedDate.getUTCHours())}${pad(parsedDate.getUTCMinutes())}${pad(parsedDate.getUTCSeconds())}Z`;
    
    const endDate = new Date(parsedDate.getTime() + 3 * 60 * 60 * 1000);
    const end = `${endDate.getUTCFullYear()}${pad(endDate.getUTCMonth() + 1)}${pad(endDate.getUTCDate())}T${pad(endDate.getUTCHours())}${pad(endDate.getUTCMinutes())}${pad(endDate.getUTCSeconds())}Z`;
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('حفل زفاف ' + eventTitle)}&dates=${start}/${end}&details=${encodeURIComponent(welcomeText || defaultWelcomeText)}&location=${encodeURIComponent(eventLocation)}`;
  };

  return (
    <div id="location-section" className="space-y-8">
      {/* Invitation Card */}
      <div 
        className="max-w-3xl mx-auto mb-8 animate-on-scroll fade-up" 
        style={{ 
          backdropFilter: 'blur(16px)', 
          background: 'rgba(255, 255, 255, 0.08)', 
          border: '1px solid rgba(255, 255, 255, 0.2)', 
          boxShadow: 'rgba(0, 0, 0, 0.15) 0px 8px 32px', 
          borderRadius: '24px', 
          padding: '32px' 
        }}
      >
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <img src="/base44.app/api/apps/6966e1f30fa9fbe508239391/files/public/6966e1f30fa9fbe508239391/e374f88b6_2.svg" alt="Gratitude" className="max-w-[260px] w-full" />
          </div>
        </div>
        <div className="flex justify-center items-center gap-4 text-base mb-4 font-serif text-black font-semibold">
          <span>دعوة لحضور حفل زفاف</span>
        </div>
        <div className="text-center text-base mb-8 px-4 whitespace-pre-line text-black leading-relaxed">
          {welcomeText || defaultWelcomeText}
        </div>
        <div className="text-center text-xl text-black font-semibold">
          {groom} {bride ? `& ${bride}` : ''}
        </div>
      </div>

      {/* Location Details */}
      <div className="text-center mb-8 animate-on-scroll fade-up">
        <div className="text-sm tracking-widest mb-2 text-black">الموقع</div>
        <div className="font-semibold text-lg text-black">{hallName?.trim()}</div>
        {cityName && <div className="text-base text-black">{cityName?.trim()}</div>}
      </div>

      {/* Premium Calendar Widget */}
      <div className="mb-8 px-4 animate-on-scroll fade-up" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
        <div className="mx-auto overflow-hidden shadow-lg border border-black/5" style={{ maxWidth: '260px', borderRadius: '22px' }}>
          <div className="relative flex items-center justify-between px-5 py-3" style={{ background: 'rgb(172, 140, 96)' }}>
            <div className="absolute top-0 left-1/3 -translate-x-1/2 w-5 h-6 rounded-b-full bg-white/20 border border-white/40 shadow-inner" />
            <div className="absolute top-0 right-1/3 translate-x-1/2 w-5 h-6 rounded-b-full bg-white/20 border border-white/40 shadow-inner" />
            <span className="text-[10px] tracking-[0.25em] uppercase opacity-60 text-white font-semibold">{getYearNum()}</span>
            <span className="text-base font-bold tracking-widest uppercase text-white font-serif">{getMonthNameAr()}</span>
            <span className="text-[10px] tracking-[0.25em] uppercase opacity-60 text-white font-semibold">{getDayNameAr()}</span>
          </div>
          <div className="flex flex-col items-center py-6 px-4" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <span className="font-bold leading-none text-[6rem] text-[#ac8c60] font-serif">{getDayNum()}</span>
            <div className="w-12 h-px my-4 bg-black/10" />
            <span className="text-sm tracking-[0.2em] uppercase mb-1 text-black font-medium">{getDayNameAr()}</span>
            <span className="text-lg font-semibold tracking-widest text-[#ac8c60]">{getTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Save Date Button */}
      <div className="relative flex justify-center animate-on-scroll fade-up">
        <button 
          onClick={() => window.open(getGoogleCalendarUrl(), '_blank')}
          className="mx-auto flex items-center px-6 py-3 text-sm font-semibold rounded-full border border-white/20 shadow-md backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors text-black"
          style={{ background: 'rgba(255, 255, 255, 0.08)' }}
        >
          <Calendar className="w-4.5 h-4.5 mr-2 text-[#ac8c60]" />
          احفظ الموعد
        </button>
      </div>

      {/* Countdown Widget */}
      <div 
        className="mt-8 p-4 animate-on-scroll fade-up"
        style={{ 
          backdropFilter: 'blur(16px)', 
          background: 'rgba(255, 255, 255, 0.08)', 
          border: '1px solid rgba(255, 255, 255, 0.2)', 
          boxShadow: 'rgba(0, 0, 0, 0.15) 0px 8px 32px', 
          borderRadius: '24px' 
        }}
      >
        <div className="text-center text-sm tracking-widest mb-4 text-black font-semibold">العد التنازلي</div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'أيام', val: timeLeft.days },
            { label: 'ساعات', val: timeLeft.hours },
            { label: 'دقائق', val: timeLeft.minutes },
            { label: 'ثواني', val: timeLeft.seconds }
          ].map((item, idx) => (
            <div key={idx} className="text-center p-3 rounded-xl bg-white/10 border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-[#ac8c60]" style={{ textShadow: 'rgba(172, 140, 96, 0.38) 0px 0px 12px' }}>
                {item.val}
              </div>
              <div className="text-[10px] tracking-wider mt-1 text-black font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
