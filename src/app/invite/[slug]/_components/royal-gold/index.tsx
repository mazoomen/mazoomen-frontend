'use client';

import React, { useState, useEffect } from 'react';
import { S3_BASE_URL } from '@/lib/s3';
import type { InvitationData } from '@/types/invitation';
import { Phone } from 'lucide-react';
import {
  EnvelopeOverlay,
  InvitationHero,
  InvitationBody,
  EventTimeline,
  EventDetails,
  WishesSection,
  BottomNavbar
} from '../index';
import "../../invitation.css";

interface InvitationClientPageRoyalGoldProps {
  invitation: InvitationData;
  slug?: string;
  isDeactivatedInitial?: boolean;
  viewingLangProp?: "ar" | "en";
  setViewingLangProp?: React.Dispatch<React.SetStateAction<"ar" | "en">>;
}

export default function InvitationClientPageRoyalGold({
  invitation: initialInvitation,
  slug,
  isDeactivatedInitial = false,
  viewingLangProp,
  setViewingLangProp,
}: InvitationClientPageRoyalGoldProps) {
  const [invitation, setInvitation] = useState<InvitationData>(initialInvitation);
  const [isOpen, setIsOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [snowflakes, setSnowflakes] = useState<{ size: number; left: number; delay: string; duration: number }[]>([]);
  const [viewingLang, setViewingLang] = useState<"ar" | "en">(viewingLangProp || "ar");
  const [showContactModal, setShowContactModal] = useState(false);

  // Sync viewing language with prop changes
  useEffect(() => {
    if (viewingLangProp) {
      setViewingLang(viewingLangProp);
    }
  }, [viewingLangProp]);

  // Notify parent if language changes locally
  const toggleLanguage = () => {
    const nextLang = viewingLang === 'ar' ? 'en' : 'ar';
    setViewingLang(nextLang);
    if (setViewingLangProp) {
      setViewingLangProp(nextLang);
    }
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

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setMusicPlaying(true);
  };

  const isEn = viewingLang === "en";
  const eventTitle = isEn
    ? (invitation.eventTitleEn || invitation.eventTitle)
    : (invitation.eventTitleAr || invitation.eventTitle);
  const eventLocation = isEn
    ? (invitation.eventLocationEn || invitation.eventLocation)
    : (invitation.eventLocationAr || invitation.eventLocation);
  const welcomeText = isEn
    ? (invitation.welcomeTextEn || invitation.welcomeText)
    : (invitation.welcomeTextAr || invitation.welcomeText);

  const eventProgram = (invitation.eventProgram || []).map((p: any) => ({
    time: p.time || "",
    title: isEn ? (p.titleEn || p.title || "") : (p.titleAr || p.title || ""),
  }));

  const eventDetails = (invitation.eventDetails || []).map((d: any) => ({
    text: isEn ? (d.textEn || d.text || "") : (d.textAr || d.text || ""),
  }));

  return (
    <main className="min-h-screen bg-[#F5F2EB] relative flex flex-col justify-center" dir={isEn ? "ltr" : "rtl"}>
      {/* Premium floating language switcher circle */}
      {invitation.languageMode === "both" && (
        <button
          onClick={toggleLanguage}
          className="fixed top-6 right-6 z-[99999] w-12 h-12 rounded-full border flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 text-xs font-bold font-serif backdrop-blur-md cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.45)',
            borderColor: 'rgba(172, 140, 96, 0.35)',
            color: '#ac8c60',
            boxShadow: 'rgba(172, 140, 96, 0.15) 0px 4px 20px',
          }}
        >
          {viewingLang === 'ar' ? 'EN' : 'AR'}
        </button>
      )}

      {/* Background audio controller & Navigation bar */}
      {isOpen && (
        <BottomNavbar
          musicUrl={invitation.musicUrl}
          musicPlaying={musicPlaying}
          setMusicPlaying={setMusicPlaying}
          theme="gold"
          viewingLang={viewingLang}
          locationUrl={invitation.locationUrl}
          onContactClick={() => setShowContactModal(true)}
        />
      )}

      {/* Wax seal cover splitting envelope */}
      <EnvelopeOverlay
        eventTitle={eventTitle}
        onOpen={handleOpenInvitation}
        sealImage="/images/royal-gold-seal.png"
        viewingLang={viewingLang}
        customSealStyle={{ transform: 'translate(0px, -1px) scale(1.20)' }}
        textColor="#ac8c60"
        videoUrl={`${S3_BASE_URL}/templates/videos/939bfcb40_CopyofCopyofdesign1_773e1ce7.mp4`}
      />

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
      <div className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto overflow-hidden bg-white shadow-2xl rounded-none md:rounded-[32px] md:my-8" dir={isEn ? "ltr" : "rtl"} style={{ color: 'rgb(172, 140, 96)' }}>
        {/* Hero Banner Section */}
        <InvitationHero
          eventTitle={eventTitle}
          eventDate={invitation.eventDate}
          isOpen={isOpen}
          viewingLang={viewingLang}
          videoUrl={`${S3_BASE_URL}/templates/videos/939bfcb40_CopyofCopyofdesign1_773e1ce7.mp4`}
        />

        {/* Invitation Text Card, Location details & Countdown widgets */}
        <section className="relative min-h-[700px] py-8 px-4">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              src={`${S3_BASE_URL}/templates/videos/3917df860_CopyofCopyofdesign11_643aa6bb.mp4`}
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
              eventTitle={eventTitle}
              eventDate={invitation.eventDate}
              eventLocation={eventLocation}
              locationUrl={invitation.locationUrl}
              welcomeText={welcomeText}
              viewingLang={viewingLang}
            />
          </div>
        </section>

        {/* Interactive Event Timeline & Event Guidelines/Details Section */}
        <section className="relative min-h-[700px] py-8 px-4">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              src={`${S3_BASE_URL}/templates/videos/939bfcb40_CopyofCopyofdesign1_773e1ce7.mp4`}
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
            <EventTimeline events={eventProgram} viewingLang={viewingLang} />
            <EventDetails details={eventDetails} viewingLang={viewingLang} />
          </div>
        </section>

        {/* Gallery moments & Guest wishes timeline */}
        <section className="relative min-h-[763px] py-8 px-4">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              src={`${S3_BASE_URL}/templates/videos/3917df860_CopyofCopyofdesign11_643aa6bb.mp4`}
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
              eventTitle={eventTitle}
              images={invitation.images}
              welcomeText={welcomeText}
              viewingLang={viewingLang}
              allowGuestUploads={invitation.allowGuestUploads !== false}
              showMoments={invitation.showMoments !== false}
              allowCompanions={invitation.allowCompanions !== false}
              moments={invitation.moments || []}
              ownerId={invitation.userId || undefined}
              onMomentUploaded={(updated: InvitationData) => setInvitation(updated)}
              wishes={invitation.wishes}
            />
          </div>
        </section>

        {/* Footer info details */}
        <section className="relative min-h-[302px] py-8 px-4">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              src={`${S3_BASE_URL}/templates/videos/939bfcb40_CopyofCopyofdesign1_773e1ce7.mp4`}
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
              <div className="text-xl mb-2">{eventTitle}</div>
              <div className="text-base mb-2 font-sans font-semibold">
                {new Date(invitation.eventDate).toLocaleDateString(viewingLang === 'en' ? 'en-US' : 'ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <a href="/" className="text-xs uppercase tracking-[0.2em] text-[#C8C8C8] hover:underline transition-all cursor-pointer block">
                {viewingLang === 'en' ? "Made with love on Mazoomen platform" : "صنع بكل حب عبر منصة معزومين"}
              </a>
              {/* Spacer inside the section relative div to keep the video background flowing behind the bottom bar */}
              <div className="h-24" />
            </div>
          </div>
        </section>
      </div>

      {/* WhatsApp Custom Contact Modal Popup */}
      {showContactModal && (
        <div className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div 
            className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[28px] max-w-sm w-full p-6 shadow-2xl relative text-center"
            dir={viewingLang === 'en' ? "ltr" : "rtl"}
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

            <h3 className="text-lg font-bold text-black mb-1 font-sans">
              {invitation.contactName || (viewingLang === 'en' ? "WhatsApp Contact" : "للتواصل والاستفسار")}
            </h3>
            <p className="text-sm text-neutral-500 font-semibold mb-6 font-sans">
              {invitation.contactPhone || "+966 50 000 0001"}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${invitation.contactPhone || "+966500000001"}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-[#EBE7DF] hover:bg-neutral-50 text-black text-xs font-bold transition-all shadow-xs cursor-pointer font-sans"
              >
                <Phone className="w-4 h-4 text-[#ac8c60]" />
                {viewingLang === 'en' ? "Call" : "اتصال"}
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
                {viewingLang === 'en' ? "WhatsApp" : "واتساب"}
              </a>
            </div>
          </div>
        </div>
      )}

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
