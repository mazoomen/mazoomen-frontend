'use client';

import React, { useState, useEffect } from 'react';
import type { InvitationData } from '@/types/invitation';
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
  invitation: InvitationData;
}

export default function InvitationClientPage({ invitation }: InvitationClientPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [snowflakes, setSnowflakes] = useState<{ size: number; left: number; delay: string; duration: number }[]>([]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setMusicPlaying(true);
  };

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

  return (
    <main className="min-h-screen bg-[#F5F2EB] relative flex flex-col justify-center">
      {/* Background audio controller & Navigation bar */}
      {isOpen && (
        <BottomNavbar 
          musicUrl={invitation.musicUrl} 
          musicPlaying={musicPlaying} 
          setMusicPlaying={setMusicPlaying} 
        />
      )}

      {/* Wax seal cover splitting envelope */}
      <EnvelopeOverlay eventTitle={invitation.eventTitle} onOpen={handleOpenInvitation} />

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
          eventTitle={invitation.eventTitle} 
          eventDate={invitation.eventDate} 
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
              eventTitle={invitation.eventTitle}
              eventDate={invitation.eventDate}
              eventLocation={invitation.eventLocation}
              locationUrl={invitation.locationUrl}
              welcomeText={invitation.welcomeText}
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
              invitationId={invitation.id}
              eventTitle={invitation.eventTitle}
              images={invitation.images}
              welcomeText={invitation.welcomeText}
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
              <div className="text-xl mb-2">{invitation.eventTitle}</div>
              <div className="text-base mb-2">
                {new Date(invitation.eventDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
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
