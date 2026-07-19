'use client';

import React, { useEffect, useRef } from 'react';
import { S3_BASE_URL } from '@/lib/s3';

interface InvitationHeroProps {
  eventTitle: string;
  eventDate: string;
  isOpen: boolean;
  viewingLang?: string;
}

export const InvitationHero: React.FC<InvitationHeroProps> = ({ eventTitle, eventDate, isOpen, viewingLang }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isEn = viewingLang === "en";

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch((err) => console.log('Video auto-play error:', err));
    }
  }, [isOpen]);

  // Helper to split couple names from eventTitle (e.g. "أيمن وراما" or "أحمد & سارة")
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

  const getFormattedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const formatter = new Intl.DateTimeFormat(isEn ? 'en-US' : 'ar-EG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return formatter.format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="relative min-h-[700px] flex flex-col items-center justify-start text-center pt-28">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          src={`${S3_BASE_URL}/templates/videos/939bfcb40_CopyofCopyofdesign1_773e1ce7.mp4`}
          autoPlay
          loop
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5" style={{ opacity: 0.25 }} />
        <div className="absolute inset-0 bg-black" style={{ opacity: 0 }} />
      </div>
      <div className="relative z-10 -mt-12 pr-6 pl-6">
        <div
          className="mx-auto mb-8 h-px w-24"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)',
            opacity: 1,
            transform: 'none',
          }}
        />
        <div
          className="text-base tracking-widest mb-8"
          style={{
            color: 'rgb(0, 0, 0)',
            fontFamily: 'sans-serif',
            minHeight: '24px',
            lineHeight: 1.5,
            opacity: 1,
            letterSpacing: '0.2em',
            transform: 'none',
          }}
        >
          {isEn ? "Wedding Invitation" : "حفل زفاف"}
        </div>
        <div style={{ marginTop: '-1rem' }}>
          <p
            style={{
              fontSize: '3.75rem',
              fontWeight: 300,
              lineHeight: 1.4,
              margin: '0px',
              padding: '0.25rem 0px',
              display: 'block',
              textShadow: 'rgb(0, 0, 0) 0px 2px 2px',
              opacity: 1,
              transform: 'none',
              color: 'rgb(172, 140, 96)',
            }}
          >
            {groom}
          </p>
          {bride && (
            <>
              <p
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 300,
                  lineHeight: 1.4,
                  margin: '0px',
                  padding: '0.25rem 0px',
                  display: 'block',
                  opacity: 1,
                  color: 'rgb(172, 140, 96)',
                }}
              >
                &amp;
              </p>
              <p
                style={{
                  fontSize: '3.75rem',
                  fontWeight: 300,
                  lineHeight: 1.4,
                  margin: '0px',
                  padding: '0.25rem 0px',
                  display: 'block',
                  textShadow: 'rgb(0, 0, 0) 0px 2px 2px',
                  opacity: 1,
                  transform: 'none',
                  color: 'rgb(172, 140, 96)',
                }}
              >
                {bride}
              </p>
            </>
          )}
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <div
            className="text-sm tracking-wide whitespace-nowrap ml-1 font-semibold"
            style={{ color: 'rgb(0, 0, 0)', opacity: 1, transform: 'none' }}
          >
            {getFormattedDate(eventDate)}
          </div>
        </div>
      </div>
      <div className="absolute bottom-16 left-10 right-10 h-px" style={{ background: 'rgba(0, 0, 0, 0.1)' }} />
    </section>
  );
};
