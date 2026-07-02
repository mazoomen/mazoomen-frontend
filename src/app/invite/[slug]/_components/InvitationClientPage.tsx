'use client';

import React, { useState, useEffect } from 'react';
import type { InvitationData } from '@/types/invitation';
import api from '@/lib/api';
import {
  EnvelopeOverlay,
  InvitationHero,
  InvitationBody,
  EventTimeline,
  EventDetails,
  WishesSection,
  BottomNavbar
} from './index';
import "../index-vcqbJqsY.css";

interface InvitationClientPageProps {
  invitation?: InvitationData;
  slug?: string;
  isDeactivatedInitial?: boolean;
}

export default function InvitationClientPage({
  invitation,
  slug,
  isDeactivatedInitial = false,
}: InvitationClientPageProps) {
  const [localInvitation, setLocalInvitation] = useState<InvitationData | undefined>(invitation);
  const [loading, setLoading] = useState(isDeactivatedInitial);
  const [error, setError] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [snowflakes, setSnowflakes] = useState<{ size: number; left: number; delay: string; duration: number }[]>([]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setMusicPlaying(true);
  };

  // ── Client-side fetch with token if initial load was deactivated ──
  useEffect(() => {
    if (!isDeactivatedInitial || !slug) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      setError(true);
      return;
    }

    api.get<InvitationData>(`/invitations/slug/${slug}`)
      .then((res) => {
        setLocalInvitation(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Client side invitation lookup failed:", err);
        setLoading(false);
        setError(true);
      });
  }, [isDeactivatedInitial, slug]);

  useEffect(() => {
    // Generate random snowflakes on client side to avoid hydration mismatch
    const flakes = Array.from({ length: 20 }).map((_, idx) => ({
      size: Math.floor(Math.random() * 5) + 4,
      left: idx * 5,
      delay: (idx * 0.35).toFixed(1),
      duration: Math.floor(Math.random() * 8) + 10,
    }));
    setSnowflakes(flakes);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Trigger Intersection Observer after opening the invitation
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

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F2EB] font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-[#B89C72]" />
          <p className="text-xs text-neutral-400 font-medium">جاري التحقق من الرابط والتصريح…</p>
        </div>
      </div>
    );
  }

  // Deactivated state
  if (error || !localInvitation) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FBF9F5] px-6 text-center font-sans">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4 border border-red-100 shadow-xs">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="mb-3 font-serif text-xl text-[#2C2C2C] font-bold">
          هذه الدعوة غير متاحة حالياً
        </h1>
        <p className="mb-8 max-w-sm text-xs text-[#9B9B9B] leading-relaxed">
          تم إيقاف تفعيل هذا الرابط مؤقتاً من قِبل صاحب الدعوة أو إدارة المنصة. يرجى التواصل مع ناشر الرابط للمزيد من التفاصيل.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F2EB] relative flex flex-col justify-center">
      {/* Background audio controller & Navigation bar */}
      {isOpen && (
        <BottomNavbar 
          musicUrl={localInvitation.musicUrl} 
          musicPlaying={musicPlaying} 
          setMusicPlaying={setMusicPlaying} 
        />
      )}

      {/* Wax seal cover splitting envelope */}
      <EnvelopeOverlay eventTitle={localInvitation.eventTitle} onOpen={handleOpenInvitation} />

      {/* Snowfall Animation overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {snowflakes.map((flake, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-white opacity-[0.15]"
            style={{
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              animation: `snowfall ${flake.duration}s linear ${flake.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Invitation Contents Container */}
      <div className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto overflow-hidden bg-white shadow-2xl rounded-none md:rounded-[32px] md:my-8" dir="rtl" style={{ color: 'rgb(172, 140, 96)' }}>
        {/* Hero Banner Section */}
        <InvitationHero 
          eventTitle={localInvitation.eventTitle} 
          eventDate={localInvitation.eventDate} 
          isOpen={isOpen} 
        />

        {/* Invitation Text Card, Location details & Countdown widgets */}
        <section className="relative min-h-[700px] py-8 px-4">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="/videos/3917df860_CopyofCopyofdesign11.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5" style={{ opacity: 0.25 }} />
          </div>
          <div className="relative z-10">
            <InvitationBody 
              eventTitle={localInvitation.eventTitle}
              eventDate={localInvitation.eventDate}
              eventLocation={localInvitation.eventLocation}
              locationUrl={localInvitation.locationUrl}
              welcomeText={localInvitation.welcomeText}
            />
          </div>
        </section>

        {/* Interactive Event Timeline & Event Guidelines/Details Section */}
        <section className="relative min-h-[700px] py-8 px-4">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="/videos/939bfcb40_CopyofCopyofdesign1.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5" style={{ opacity: 0.25 }} />
          </div>
          <div className="relative z-10 space-y-12">
            <EventTimeline />
            <EventDetails />
          </div>
        </section>

        {/* Gallery moments & Guest wishes timeline */}
        <section className="relative min-h-[763px] py-8 px-4">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="/videos/3917df860_CopyofCopyofdesign11.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5" style={{ opacity: 0.25 }} />
          </div>
          <div className="relative z-10">
            <WishesSection 
              invitationId={localInvitation.id}
              eventTitle={localInvitation.eventTitle}
              images={localInvitation.images}
              welcomeText={localInvitation.welcomeText}
            />
          </div>
        </section>

        {/* Footer info details */}
        <section className="relative min-h-[302px] py-8 px-4">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="/videos/939bfcb40_CopyofCopyofdesign1.mp4"
              autoPlay
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center center', transform: 'scale(1.02)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5" style={{ opacity: 0.25 }} />
          </div>
          <div className="relative z-10">
            <div className="mx-10 h-px mb-6 bg-black/10" />
            <div className="text-center text-black">
              <div className="text-xl mb-2">{localInvitation.eventTitle}</div>
              <div className="text-base mb-2">
                {new Date(localInvitation.eventDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C8C8C8]">
                صنع بكل حب عبر منصة مازوم
              </p>
            </div>
          </div>
        </section>
        
        {/* Bottom padding spacer to clear the floating tabs nav */}
        <div className="h-24" />
      </div>

      <style jsx global>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) translateX(0);
            opacity: 0.15;
          }
          50% {
            transform: translateY(50vh) translateX(20px);
            opacity: 0.15;
          }
          100% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
