'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface EnvelopeOverlayProps {
  eventTitle: string;
  onOpen: () => void;
  sealImage?: string;
  viewingLang?: string;
  customSealStyle?: React.CSSProperties;
  textColor?: string;
  videoUrl?: string | string[];
}

// Floating gold particle type
interface GoldParticle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export const EnvelopeOverlay: React.FC<EnvelopeOverlayProps> = ({ 
  eventTitle, 
  onOpen,
  sealImage = "/images/royal-gold-seal.png",
  viewingLang,
  customSealStyle,
  textColor,
  videoUrl
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Staggered light transition states
  const [sealGlow, setSealGlow] = useState(false);
  const [raysActive, setRaysActive] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [flashFade, setFlashFade] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(true);

  // Video ready & preloading states
  const primaryVideoUrl = Array.isArray(videoUrl) ? videoUrl[0] : videoUrl;
  const [videoReady, setVideoReady] = useState<boolean>(!primaryVideoUrl);
  const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(false);
  const [openRequested, setOpenRequested] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Preload video automatically in background
  useEffect(() => {
    if (!primaryVideoUrl || typeof window === 'undefined') {
      setVideoReady(true);
      return;
    }

    let isMounted = true;
    const video = document.createElement('video');
    video.src = primaryVideoUrl;
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    const handleReady = () => {
      if (isMounted) {
        setVideoReady(true);
      }
    };

    if (video.readyState >= 3) {
      handleReady();
    } else {
      video.addEventListener('canplaythrough', handleReady);
      video.addEventListener('canplay', handleReady);
      video.addEventListener('loadeddata', handleReady);
      video.addEventListener('error', handleReady);
    }

    return () => {
      isMounted = false;
      video.removeEventListener('canplaythrough', handleReady);
      video.removeEventListener('canplay', handleReady);
      video.removeEventListener('loadeddata', handleReady);
      video.removeEventListener('error', handleReady);
      video.removeAttribute('src');
      video.load();
    };
  }, [primaryVideoUrl]);

  const isEn = viewingLang === "en";

  // Generate floating gold particles
  const goldParticles = useMemo<GoldParticle[]>(() => {
    if (!isClient) return [];
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [isClient]);

  const startOpeningAnimation = () => {
    if (isOpen) return;
    setIsOpen(true);
    onOpen();

    // Phase 1 (0ms): Seal glows bright golden
    setSealGlow(true);

    // Phase 2 (500ms): Light rays beam outward
    setTimeout(() => {
      setRaysActive(true);
    }, 500);

    // Phase 3 (1100ms): Full screen engulfed in white-gold light
    setTimeout(() => {
      setFlashActive(true);
    }, 1100);

    // Phase 4 (1700ms): Hide envelope, start fading the light
    setTimeout(() => {
      setShowEnvelope(false);
      setFlashFade(true);
    }, 1700);

    // Phase 5 (2500ms): Fully done, unmount overlay
    setTimeout(() => {
      setIsDone(true);
    }, 2500);
  };

  const handleOpen = () => {
    if (isOpen || openRequested) return;

    if (!videoReady && primaryVideoUrl) {
      setOpenRequested(true);
      setIsLoadingVideo(true);

      // Safety timeout: 7 seconds fallback if network is extremely slow
      setTimeout(() => {
        setVideoReady(true);
      }, 7000);

      return;
    }

    startOpeningAnimation();
  };

  // Automatically open when video becomes ready after click
  useEffect(() => {
    if (openRequested && videoReady && !isOpen) {
      setIsLoadingVideo(false);
      startOpeningAnimation();
    }
  }, [openRequested, videoReady, isOpen]);

  // Helper to split couple names from eventTitle 
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

  if (isDone) return null;

  // Dense Islamic arabesque SVG pattern for envelope body
  const arabesquePatternSVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cdefs%3E%3Cstyle%3E.a%7Bfill:none;stroke:%23c8a050;stroke-width:0.6;opacity:0.25%7D.b%7Bfill:none;stroke:%23c8a050;stroke-width:0.4;opacity:0.18%7D%3C/style%3E%3C/defs%3E%3Ccircle class='a' cx='60' cy='60' r='40'/%3E%3Ccircle class='a' cx='60' cy='60' r='28'/%3E%3Ccircle class='b' cx='60' cy='60' r='16'/%3E%3Ccircle class='a' cx='0' cy='0' r='40'/%3E%3Ccircle class='a' cx='120' cy='0' r='40'/%3E%3Ccircle class='a' cx='0' cy='120' r='40'/%3E%3Ccircle class='a' cx='120' cy='120' r='40'/%3E%3Cpath class='b' d='M60 20 L60 100 M20 60 L100 60'/%3E%3Cpath class='b' d='M32 32 L88 88 M88 32 L32 88'/%3E%3Ccircle class='b' cx='60' cy='20' r='6'/%3E%3Ccircle class='b' cx='60' cy='100' r='6'/%3E%3Ccircle class='b' cx='20' cy='60' r='6'/%3E%3Ccircle class='b' cx='100' cy='60' r='6'/%3E%3Cpath class='a' d='M40 20 Q60 40 80 20'/%3E%3Cpath class='a' d='M40 100 Q60 80 80 100'/%3E%3Cpath class='a' d='M20 40 Q40 60 20 80'/%3E%3Cpath class='a' d='M100 40 Q80 60 100 80'/%3E%3C/svg%3E")`;

  // More ornate pattern for the flaps with denser geometric detail
  const flapPatternSVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cdefs%3E%3Cstyle%3E.c%7Bfill:none;stroke:%23b8943e;stroke-width:0.5;opacity:0.22%7D.d%7Bfill:none;stroke:%23b8943e;stroke-width:0.35;opacity:0.16%7D%3C/style%3E%3C/defs%3E%3Ccircle class='c' cx='40' cy='40' r='28'/%3E%3Ccircle class='c' cx='40' cy='40' r='18'/%3E%3Ccircle class='d' cx='40' cy='40' r='10'/%3E%3Ccircle class='c' cx='0' cy='0' r='28'/%3E%3Ccircle class='c' cx='80' cy='0' r='28'/%3E%3Ccircle class='c' cx='0' cy='80' r='28'/%3E%3Ccircle class='c' cx='80' cy='80' r='28'/%3E%3Cpath class='d' d='M20 20 L60 60 M60 20 L20 60'/%3E%3Cpath class='d' d='M40 12 L40 68 M12 40 L68 40'/%3E%3Ccircle class='d' cx='40' cy='12' r='4'/%3E%3Ccircle class='d' cx='40' cy='68' r='4'/%3E%3Ccircle class='d' cx='12' cy='40' r='4'/%3E%3Ccircle class='d' cx='68' cy='40' r='4'/%3E%3C/svg%3E")`;

  // Dense background arabesque
  const bgPatternSVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cstyle%3E.e%7Bfill:none;stroke:%23c8a76c;stroke-width:0.5;opacity:0.10%7D.f%7Bfill:none;stroke:%23c8a76c;stroke-width:0.35;opacity:0.07%7D%3C/style%3E%3C/defs%3E%3Ccircle class='e' cx='100' cy='100' r='70'/%3E%3Ccircle class='e' cx='100' cy='100' r='50'/%3E%3Ccircle class='f' cx='100' cy='100' r='30'/%3E%3Ccircle class='e' cx='0' cy='0' r='70'/%3E%3Ccircle class='e' cx='200' cy='0' r='70'/%3E%3Ccircle class='e' cx='0' cy='200' r='70'/%3E%3Ccircle class='e' cx='200' cy='200' r='70'/%3E%3Cpath class='f' d='M100 30 L100 170 M30 100 L170 100'/%3E%3Cpath class='f' d='M50 50 L150 150 M150 50 L50 150'/%3E%3Ccircle class='f' cx='100' cy='30' r='10'/%3E%3Ccircle class='f' cx='100' cy='170' r='10'/%3E%3Ccircle class='f' cx='30' cy='100' r='10'/%3E%3Ccircle class='f' cx='170' cy='100' r='10'/%3E%3Cpath class='e' d='M60 30 Q100 60 140 30'/%3E%3Cpath class='e' d='M60 170 Q100 140 140 170'/%3E%3Cpath class='e' d='M30 60 Q60 100 30 140'/%3E%3Cpath class='e' d='M170 60 Q140 100 170 140'/%3E%3C/svg%3E")`;

  return (
    <div
      id="opening-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: `${bgPatternSVG}, radial-gradient(circle at center, #f8f0e0 0%, #efe3cc 35%, #e4d5b3 70%, #d9c99e 100%)`,
        transition: 'opacity 0.8s ease',
        opacity: isDone ? 0 : 1,
        pointerEvents: isOpen ? 'none' : 'auto',
      }}
    >
      {/* GOLD BORDER FRAME around entire viewport */}
      <div
        className="gold-border-frame"
        style={{
          position: 'fixed',
          inset: '8px',
          border: '1.5px solid rgba(200, 160, 60, 0.35)',
          borderRadius: '4px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {/* Inner double border line */}
        <div style={{
          position: 'absolute',
          inset: '4px',
          border: '0.5px solid rgba(200, 160, 60, 0.18)',
          borderRadius: '2px',
          pointerEvents: 'none',
        }} />
      </div>

      {/* FLOATING GOLD PARTICLES */}
      {isClient && goldParticles.map((p) => (
        <div
          key={p.id}
          className="gold-particle"
          style={{
            position: 'fixed',
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.9) 0%, rgba(200, 160, 60, 0.4) 60%, transparent 100%)',
            boxShadow: '0 0 6px 2px rgba(212, 175, 55, 0.3)',
            opacity: p.opacity,
            animation: `float-particle-up ${p.duration}s ${p.delay}s linear infinite`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      ))}

      {/* AMBIENT GOLDEN GLOW behind envelope */}
      <div
        className="ambient-glow"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(200, 160, 60, 0.05) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* 3D Envelope Container */}
      {showEnvelope && (
        <div
          className="envelope-container relative"
          onClick={handleOpen}
          style={{
            width: '520px',
            height: '365px',
            perspective: '1200px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.8s cubic-bezier(0.34, 1.3, 0.64, 1)',
            transform: isOpen ? 'translateY(10%)' : 'translateY(0)',
            zIndex: 10,
            cursor: isOpen ? 'default' : 'pointer',
          }}
        >
        {/* ENVELOPE BACKPLATE (INSIDE LINER) */}
        <div
          className="envelope-back"
          style={{
            position: 'absolute',
            inset: 0,
            background: `${arabesquePatternSVG}, linear-gradient(160deg, #f5efe3 0%, #eee4cf 40%, #e6d9be 80%, #ddd2b3 100%)`,
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.18), 0 6px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.4)',
            border: '1px solid rgba(200, 160, 60, 0.25)',
            borderRadius: '6px',
            zIndex: 1,
          }}
        >
          {/* Inner vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.06) 100%)',
              pointerEvents: 'none',
              borderRadius: '6px',
            }}
          />
        </div>

        {/* SIDE FLAPS */}
        {/* Left Flap — with arabesque texture */}
        <div
          className="envelope-flap-left"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '50.5%',
            background: `${flapPatternSVG}, linear-gradient(to right, #efe9d8 0%, #e6dcc4 100%)`,
            clipPath: 'polygon(0 0, 0 100%, 100% 50%)',
            zIndex: 3,
            filter: 'drop-shadow(2px 0px 8px rgba(0, 0, 0, 0.10))',
          }}
        >
          {/* Gold edge highlight */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, transparent 50%)',
            clipPath: 'polygon(0 0, 0 100%, 100% 50%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Right Flap — with arabesque texture */}
        <div
          className="envelope-flap-right"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '50.5%',
            background: `${flapPatternSVG}, linear-gradient(to left, #efe9d8 0%, #e6dcc4 100%)`,
            clipPath: 'polygon(100% 0, 100% 100%, 0 50%)',
            zIndex: 3,
            filter: 'drop-shadow(-2px 0px 8px rgba(0, 0, 0, 0.10))',
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(225deg, rgba(212, 175, 55, 0.08) 0%, transparent 50%)',
            clipPath: 'polygon(100% 0, 100% 100%, 0 50%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Bottom Flap — with arabesque texture + couple names */}
        <div
          className="envelope-flap-bottom"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '50.5%',
            background: `${flapPatternSVG}, linear-gradient(to top, #e4d9c0 0%, #dbd0b4 100%)`,
            clipPath: 'polygon(0 100%, 100% 100%, 50% 0%)',
            zIndex: 4,
            filter: 'drop-shadow(0px -3px 8px rgba(0, 0, 0, 0.10))',
          }}
        >
          {/* Gold edge shimmer */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(212, 175, 55, 0.06) 0%, transparent 40%)',
            clipPath: 'polygon(0 100%, 100% 100%, 50% 0%)',
            pointerEvents: 'none',
          }} />
          <div
            className="envelope-front-names"
            style={{
              position: 'absolute',
              left: '10%',
              right: '10%',
              bottom: '9%',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isOpen ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div
              style={{
                borderTop: '1.5px solid rgba(200, 162, 74, 0.40)',
                borderBottom: '1.5px solid rgba(200, 162, 74, 0.40)',
                padding: '5px 22px',
                fontFamily: isEn ? "'Cinzel', serif" : "'Aref Ruqaa', serif",
                fontSize: '17px',
                fontWeight: 600,
                color: textColor || '#8a6d2e',
                letterSpacing: isEn ? '0.08em' : 'normal',
                textShadow: '0px 1px 1px rgba(255, 255, 255, 0.8)',
              }}
            >
              {groom} &amp; {bride}
            </div>
          </div>
        </div>

        {/* MAGICAL LIP LIGHT FLARE FROM POCKET OPENING */}
        <div
          className="envelope-lip-flare"
          style={{
            position: 'absolute',
            left: '2%',
            right: '2%',
            bottom: '38%',
            height: '30%',
            background: 'radial-gradient(ellipse at center, rgba(255, 245, 210, 0.95) 0%, rgba(255, 220, 100, 0.6) 30%, rgba(212, 175, 55, 0.3) 55%, rgba(212, 175, 55, 0) 80%)',
            filter: 'blur(12px)',
            zIndex: 3.5,
            pointerEvents: 'none',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'scaleX(1.5) scaleY(2.2)' : 'scale(0.6)',
            transition: 'transform 1.0s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease',
            transitionDelay: isOpen ? '0.2s' : '0s',
          }}
        />

        {/* TOP FLAP (FLIPS OPEN UPWARD) */}
        <div
          className="envelope-flap-top"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '50.5%',
            zIndex: 5,
            transformOrigin: 'top center',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
            filter: isOpen ? 'none' : 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.10))',
          }}
        >
          {/* Front face / gold foil inner face */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: isOpen 
                ? 'linear-gradient(135deg, #dfcba4 0%, #c8a050 50%, #b89764 100%)' 
                : `${flapPatternSVG}, linear-gradient(to bottom, #f0eadb 0%, #e6dcc4 100%)`,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              transition: 'background 0.5s ease',
            }}
          />

          {/* Gold corner ornaments on closed flap */}
          {!isOpen && (
            <div style={{
              position: 'absolute',
              inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              pointerEvents: 'none',
              overflow: 'hidden',
            }}>
              {/* Top-left ornamental corner */}
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                width: '50px',
                height: '50px',
                borderTop: '1.5px solid rgba(200, 160, 60, 0.30)',
                borderLeft: '1.5px solid rgba(200, 160, 60, 0.30)',
                borderRadius: '0',
              }} />
              {/* Top-right ornamental corner */}
              <div style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '50px',
                height: '50px',
                borderTop: '1.5px solid rgba(200, 160, 60, 0.30)',
                borderRight: '1.5px solid rgba(200, 160, 60, 0.30)',
                borderRadius: '0',
              }} />
            </div>
          )}

          {/* Gold foil inner frame line when open */}
          <div
            style={{
              position: 'absolute',
              left: '4%',
              right: '4%',
              top: '4%',
              height: '92%',
              border: '1.5px solid rgba(255, 255, 255, 0.50)',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              opacity: isOpen ? 1 : 0,
              transition: 'opacity 0.5s ease',
              pointerEvents: 'none',
            }}
          />

          {/* Inner shading for 3D depth */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.07) 0%, transparent 50%)',
              pointerEvents: 'none',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }}
          />
        </div>

        {/* WAX SEAL BUTTON — larger, more prominent */}
        {sealImage && sealImage !== "none" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            id="open-invitation-btn"
            className="envelope-seal-btn"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '120px',
              height: '120px',
              transform: 'translate(-50%, -50%) scale(1)',
              transition: 'filter 0.5s ease, box-shadow 0.5s ease',
              opacity: 1,
              zIndex: 10,
              boxShadow: sealGlow
                ? '0 0 80px 40px rgba(255, 220, 80, 0.95), 0 0 150px 70px rgba(212, 175, 55, 0.65), 0 0 250px 120px rgba(255, 200, 50, 0.35)'
                : '0 12px 30px rgba(0, 0, 0, 0.30), 0 0 25px rgba(200, 162, 74, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              border: 'none',
              outline: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              borderRadius: '50%',
              overflow: 'hidden', // Clip any scaled or oversized seal images to the button's boundary
              filter: sealGlow ? 'brightness(2.5) saturate(1.6)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
            }}
          >
            <img
              src={`${sealImage}?v=5`}
              alt="Wax Seal"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                ...customSealStyle
              }}
              loading="eager"
            />
          </button>
        )}

        {/* VIDEO LOADING INDICATOR (Shown when user clicks open while video is downloading over slow network) */}
        {isLoadingVideo && !isOpen && (
          <div
            className="envelope-video-loader"
            style={{
              position: 'absolute',
              left: '50%',
              top: '68%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none',
              animation: 'fadeIn 0.4s ease-out',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                borderRadius: '9999px',
                background: 'rgba(20, 15, 10, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(200, 160, 60, 0.45)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), 0 0 15px rgba(200, 160, 60, 0.25)',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid rgba(200, 160, 60, 0.25)',
                  borderTopColor: '#f5e3b5',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#f5e3b5',
                  letterSpacing: isEn ? '0.04em' : 'normal',
                  whiteSpace: 'nowrap',
                  fontFamily: isEn ? "'Cinzel', sans-serif" : "'Tajawal', 'Cairo', sans-serif",
                }}
              >
                {isEn ? "Loading invitation ..." : "جاري تحميل الدعوة ..."}
              </span>
            </div>
          </div>
        )}

        {/* LIGHT RAYS BEAMING FROM THE SEAL — wider, more dramatic golden rays */}
        <div
          className="seal-light-rays"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '350vmax',
            height: '350vmax',
            transform: 'translate(-50%, -50%)',
            background: `conic-gradient(
              from 0deg,
              rgba(255, 220, 80, 0.45) 0deg, transparent 12deg,
              transparent 25deg, rgba(255, 220, 80, 0.40) 38deg,
              transparent 50deg, transparent 63deg,
              rgba(255, 200, 50, 0.45) 75deg, transparent 88deg,
              transparent 100deg, rgba(255, 220, 80, 0.40) 113deg,
              transparent 125deg, transparent 138deg,
              rgba(255, 200, 50, 0.45) 150deg, transparent 163deg,
              transparent 175deg, rgba(255, 220, 80, 0.40) 188deg,
              transparent 200deg, transparent 213deg,
              rgba(255, 200, 50, 0.45) 225deg, transparent 238deg,
              transparent 250deg, rgba(255, 220, 80, 0.40) 263deg,
              transparent 275deg, transparent 288deg,
              rgba(255, 200, 50, 0.45) 300deg, transparent 313deg,
              transparent 325deg, rgba(255, 220, 80, 0.40) 338deg,
              transparent 350deg, rgba(255, 220, 80, 0.45) 360deg
            )`,
            opacity: raysActive ? 1 : 0,
            transition: 'opacity 0.4s ease-in',
            zIndex: 9,
            pointerEvents: 'none',
            animation: raysActive ? 'spin-rays 5s linear infinite' : 'none',
            maskImage: 'radial-gradient(circle, transparent 50px, black 100px)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 50px, black 100px)',
          }}
        />

        {/* SECONDARY LIGHT RAYS — counter-rotating for depth */}
        <div
          className="seal-light-rays-secondary"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '300vmax',
            height: '300vmax',
            transform: 'translate(-50%, -50%)',
            background: `conic-gradient(
              from 15deg,
              rgba(255, 240, 150, 0.20) 0deg, transparent 18deg,
              transparent 45deg, rgba(255, 240, 150, 0.18) 58deg,
              transparent 75deg, transparent 100deg,
              rgba(255, 240, 150, 0.20) 115deg, transparent 130deg,
              transparent 155deg, rgba(255, 240, 150, 0.18) 170deg,
              transparent 190deg, transparent 215deg,
              rgba(255, 240, 150, 0.20) 230deg, transparent 245deg,
              transparent 270deg, rgba(255, 240, 150, 0.18) 285deg,
              transparent 305deg, transparent 330deg,
              rgba(255, 240, 150, 0.20) 345deg, transparent 360deg
            )`,
            opacity: raysActive ? 0.7 : 0,
            transition: 'opacity 0.6s ease-in 0.15s',
            zIndex: 8,
            pointerEvents: 'none',
            animation: raysActive ? 'spin-rays-reverse 7s linear infinite' : 'none',
            maskImage: 'radial-gradient(circle, transparent 45px, black 90px)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 45px, black 90px)',
          }}
        />

        {/* INVITATION TEXT */}
        <div
          className="envelope-invitation-text text-center select-none"
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            textAlign: 'center',
            fontFamily: isEn ? "'Cinzel', serif" : "'Aref Ruqaa', serif",
            fontSize: '11.5px',
            color: textColor || '#8a6d2e',
            letterSpacing: isEn ? '0.18em' : '0.03em',
            opacity: isOpen ? 0 : 0.75,
            transition: 'opacity 0.4s ease',
            textTransform: isEn ? 'uppercase' : 'none',
          }}
        >
          {isEn ? "You Are Invited For Our Special Day" : "أنتم مدعوون لمشاركتنا فرحتنا"}
        </div>

        <div
          className="envelope-tap-cta"
          style={{
            position: 'absolute',
            bottom: '-90px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isOpen ? 0 : 1,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              padding: '8px 28px',
              borderRadius: '30px',
              border: '1px solid rgba(200, 160, 60, 0.35)',
              background: 'linear-gradient(135deg, rgba(200, 160, 60, 0.08) 0%, rgba(200, 160, 60, 0.03) 100%)',
              fontFamily: isEn ? "'Cinzel', serif" : "'Cairo', sans-serif",
              fontSize: isEn ? '10px' : '11px',
              fontWeight: 600,
              color: textColor || '#8a6d2e',
              letterSpacing: isEn ? '0.20em' : '0.05em',
              textTransform: isEn ? 'uppercase' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {isEn ? "Tap to Open" : "اضغط للفتح"}
          </div>
        </div>
      </div>
      )}

      {/* FULL SCREEN GOLDEN LIGHT FLASH OVERLAY */}
      {isOpen && (
        <div
          className="full-screen-light-flash"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(circle at center, #ffffff 0%, #fff8e0 25%, #f0d878 50%, #d4af37 80%, #b8942e 100%)',
            zIndex: 999999,
            pointerEvents: 'none',
            opacity: flashActive ? (flashFade ? 0 : 1) : 0,
            transition: flashFade
              ? 'opacity 0.8s ease-out'
              : 'opacity 0.4s ease-in',
          }}
        />
      )}

      <style jsx global>{`
        @keyframes pulse-ripple-premium {
          0% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.5), 0 12px 30px rgba(0, 0, 0, 0.30);
          }
          50% {
            box-shadow: 0 0 0 18px rgba(212, 175, 55, 0), 0 12px 30px rgba(0, 0, 0, 0.30);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0), 0 12px 30px rgba(0, 0, 0, 0.30);
          }
        }

        @keyframes float-instruction-premium {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-5px); }
        }

        @keyframes float-particle-up {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }

        @keyframes spin-rays {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes spin-rays-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }

        @keyframes seal-shimmer {
          0%, 100% { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15)) brightness(1.0); }
          50% { filter: drop-shadow(0 4px 8px rgba(212, 175, 55, 0.3)) brightness(1.08); }
        }

        #open-invitation-btn {
          animation: pulse-ripple-premium 2.5s infinite ease-in-out, seal-shimmer 3s infinite ease-in-out;
        }

        .envelope-tap-cta {
          animation: float-instruction-premium 2.5s infinite ease-in-out;
        }

        .envelope-invitation-text {
          animation: float-instruction-premium 3s infinite ease-in-out 0.5s;
        }

        /* Responsive Scaling for Devices */
        @media (max-width: 640px) {
          .envelope-container {
            width: 88vw !important;
            height: 62vw !important;
          }
          .envelope-front-names {
            bottom: 8.5% !important;
            left: 5% !important;
            right: 5% !important;
          }
          .envelope-front-names > div {
            font-size: 12px !important;
            padding: 2px 12px !important;
          }
          .envelope-seal-btn {
            width: 90px !important;
            height: 90px !important;
          }
          .envelope-invitation-text {
            bottom: -40px !important;
            font-size: 9.5px !important;
          }
          .envelope-tap-cta {
            bottom: -72px !important;
          }
          .envelope-tap-cta > div {
            font-size: 9px !important;
            padding: 6px 20px !important;
          }
        }

        @media (max-width: 380px) {
          .envelope-container {
            width: 92vw !important;
            height: 65vw !important;
          }
          .envelope-seal-btn {
            width: 76px !important;
            height: 76px !important;
          }
          .envelope-invitation-text {
            bottom: -35px !important;
            font-size: 8.5px !important;
          }
          .envelope-tap-cta {
            bottom: -62px !important;
          }
          .envelope-tap-cta > div {
            font-size: 8px !important;
            padding: 5px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
