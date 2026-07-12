'use client';

import React, { useState, useEffect } from 'react';

interface EnvelopeOverlayProps {
  eventTitle: string;
  onOpen: () => void;
  sealImage?: string;
  viewingLang?: string;
  customSealStyle?: React.CSSProperties;
  textColor?: string;
}

export const EnvelopeOverlay: React.FC<EnvelopeOverlayProps> = ({ 
  eventTitle, 
  onOpen,
  sealImage = "/images/royal-gold-seal.png",
  viewingLang,
  customSealStyle,
  textColor
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Staggered light transition states matching reference video
  const [sealGlow, setSealGlow] = useState(false);       // Phase 1: Seal glows bright golden
  const [raysActive, setRaysActive] = useState(false);    // Phase 2: Light rays beam outward
  const [flashActive, setFlashActive] = useState(false);  // Phase 3: Full screen engulfed
  const [flashFade, setFlashFade] = useState(false);      // Phase 4: Light fades to reveal
  const [showEnvelope, setShowEnvelope] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isEn = viewingLang === "en";

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    onOpen();

    // Phase 1 (0ms): Seal starts glowing bright golden
    setSealGlow(true);

    // Phase 2 (600ms): Light rays beam outward from below the seal
    setTimeout(() => {
      setRaysActive(true);
    }, 600);

    // Phase 3 (1200ms): Full screen engulfed in white-gold light
    setTimeout(() => {
      setFlashActive(true);
    }, 1200);

    // Phase 4 (1800ms): Hide envelope, start fading the light
    setTimeout(() => {
      setShowEnvelope(false);
      setFlashFade(true);
    }, 1800);

    // Phase 5 (2600ms): Fully done, unmount overlay
    setTimeout(() => {
      setIsDone(true);
    }, 2600);
  };

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

  return (
    <div
      id="opening-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#ddd2bb',
        background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23c8a76c' stroke-width='0.6' opacity='0.12'/%3E%3Ccircle cx='50' cy='50' r='18' fill='none' stroke='%23c8a76c' stroke-width='0.4' opacity='0.1'/%3E%3Ccircle cx='0' cy='0' r='30' fill='none' stroke='%23c8a76c' stroke-width='0.6' opacity='0.12'/%3E%3Ccircle cx='100' cy='0' r='30' fill='none' stroke='%23c8a76c' stroke-width='0.6' opacity='0.12'/%3E%3Ccircle cx='0' cy='100' r='30' fill='none' stroke='%23c8a76c' stroke-width='0.6' opacity='0.12'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='%23c8a76c' stroke-width='0.6' opacity='0.12'/%3E%3Cline x1='50' y1='20' x2='50' y2='80' stroke='%23c8a76c' stroke-width='0.3' opacity='0.06'/%3E%3Cline x1='20' y1='50' x2='80' y2='50' stroke='%23c8a76c' stroke-width='0.3' opacity='0.06'/%3E%3C/svg%3E"), radial-gradient(circle, #f5efe3 0%, #e8ddc8 40%, #ddd2bb 100%)`,
        transition: 'opacity 0.8s ease',
        opacity: isDone ? 0 : 1,
        pointerEvents: isOpen ? 'none' : 'auto',
      }}
    >
      {/* 3D Envelope Container */}
      {showEnvelope && (
        <div
          className="envelope-container relative"
          style={{
            width: '480px',
            height: '335px',
            perspective: '1200px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.8s cubic-bezier(0.34, 1.3, 0.64, 1)',
            transform: isOpen ? 'translateY(10%)' : 'translateY(0)',
          }}
        >
        {/* ENVELOPE BACKPLATE (INSIDE LINER) */}
        <div
          className="envelope-back"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(160deg, #f5efe3 0%, #e8ddc8 50%, #ddd2bb 100%)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0,0,0,0.08)',
            border: '1px solid rgba(180, 150, 90, 0.2)',
            borderRadius: '6px',
            zIndex: 1,
          }}
        >
          {/* Inner paper texture grain */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.04) 100%)',
              pointerEvents: 'none',
              borderRadius: '6px',
            }}
          />
        </div>


        {/* SIDE FLAPS (OVERLAPPING FRONT OF THE POCKET) */}
        {/* Left Flap — with arabesque texture */}
        <div
          className="envelope-flap-left"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '50.5%',
            background: 'linear-gradient(to right, #efe9d8 0%, #e4dbc5 100%)',
            clipPath: 'polygon(0 0, 0 100%, 100% 50%)',
            zIndex: 3,
            filter: 'drop-shadow(2px 0px 6px rgba(0, 0, 0, 0.08))',
          }}
        >
          {/* Embossed arabesque pattern overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='40' cy='40' r='12' fill='none' stroke='%23c8a76c' stroke-width='0.4' opacity='0.15'/%3E%3Ccircle cx='0' cy='0' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='80' cy='0' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='0' cy='80' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='80' cy='80' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`, clipPath: 'polygon(0 0, 0 100%, 100% 50%)', pointerEvents: 'none' }} />
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
            background: 'linear-gradient(to left, #efe9d8 0%, #e4dbc5 100%)',
            clipPath: 'polygon(100% 0, 100% 100%, 0 50%)',
            zIndex: 3,
            filter: 'drop-shadow(-2px 0px 6px rgba(0, 0, 0, 0.08))',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='40' cy='40' r='12' fill='none' stroke='%23c8a76c' stroke-width='0.4' opacity='0.15'/%3E%3Ccircle cx='0' cy='0' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='80' cy='0' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='0' cy='80' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='80' cy='80' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`, clipPath: 'polygon(100% 0, 100% 100%, 0 50%)', pointerEvents: 'none' }} />
        </div>

        {/* Bottom Flap — with arabesque texture */}
        <div
          className="envelope-flap-bottom"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '50.5%',
            background: 'linear-gradient(to top, #e2d9c3 0%, #d9cfb5 100%)',
            clipPath: 'polygon(0 100%, 100% 100%, 50% 0%)',
            zIndex: 4,
            filter: 'drop-shadow(0px -3px 6px rgba(0, 0, 0, 0.08))',
          }}
        >
          {/* Arabesque pattern on bottom flap */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='40' cy='40' r='12' fill='none' stroke='%23c8a76c' stroke-width='0.4' opacity='0.15'/%3E%3Ccircle cx='0' cy='0' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='80' cy='0' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='0' cy='80' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='80' cy='80' r='20' fill='none' stroke='%23c8a76c' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`, clipPath: 'polygon(0 100%, 100% 100%, 50% 0%)', pointerEvents: 'none' }} />
          {/* Centered calligraphy names on the front cover inside an elegant frame */}
          <div
            className="envelope-front-names"
            style={{
              position: 'absolute',
              left: '10%',
              right: '10%',
              bottom: '11%',
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
                borderTop: '1.5px solid rgba(200, 162, 74, 0.35)',
                borderBottom: '1.5px solid rgba(200, 162, 74, 0.35)',
                padding: '4px 20px',
                fontFamily: isEn ? "'Cinzel', serif" : "'Aref Ruqaa', serif",
                fontSize: '17px',
                fontWeight: 600,
                color: '#8f6f36',
                letterSpacing: isEn ? '0.08em' : 'normal',
                textShadow: '0px 1px 1px rgba(255, 255, 255, 0.8)',
              }}
            >
              {groom} &amp; {bride}
            </div>
          </div>
        </div>

        {/* MAGICAL LIP LIGHT FLARE SPOUTING FROM POCKET OPENING */}
        <div
          className="envelope-lip-flare"
          style={{
            position: 'absolute',
            left: '5%',
            right: '5%',
            bottom: '42%',
            height: '25%',
            background: 'radial-gradient(ellipse at center, rgba(255, 245, 210, 0.95) 0%, rgba(212, 175, 55, 0.5) 40%, rgba(212, 175, 55, 0) 75%)',
            filter: 'blur(10px)',
            zIndex: 3.5,
            pointerEvents: 'none',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'scaleX(1.3) scaleY(1.8)' : 'scale(0.8)',
            transition: 'transform 1.0s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s ease',
            transitionDelay: isOpen ? '0.3s' : '0s',
          }}
        />

        {/* TOP FLAP (CLIPS DOWN & FLIPS OPEN UPWARD) */}
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
            filter: isOpen ? 'none' : 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.08))',
          }}
        >
          {/* Inner liner with gold foil background shown when open */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: isOpen 
                ? 'linear-gradient(135deg, #dfcba4 0%, #b89764 100%)' 
                : 'linear-gradient(to bottom, #efe9d8 0%, #e4dbc5 100%)',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              transition: 'background 0.5s ease',
            }}
          />

          {/* Gold foil liner inner frame line outline shown when open */}
          <div
            style={{
              position: 'absolute',
              left: '4%',
              right: '4%',
              top: '4%',
              height: '92%',
              border: '1.5px solid rgba(255, 255, 255, 0.45)',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              opacity: isOpen ? 1 : 0,
              transition: 'opacity 0.5s ease',
              pointerEvents: 'none',
            }}
          />

          {/* Inner liner shading to make the 3D folded flap look deep and realistic */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.06) 0%, transparent 50%)',
              pointerEvents: 'none',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }}
          />
        </div>

        {/* WAX SEAL BUTTON — glows bright golden on open */}
        <button
          onClick={handleOpen}
          id="open-invitation-btn"
          className="envelope-seal-btn"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '96px',
            height: '96px',
            transform: 'translate(-50%, -50%) scale(1)',
            transition: 'filter 0.6s ease, box-shadow 0.6s ease',
            opacity: 1,
            zIndex: 10,
            boxShadow: sealGlow
              ? '0 0 60px 30px rgba(255, 220, 80, 0.9), 0 0 120px 60px rgba(212, 175, 55, 0.6), 0 0 200px 100px rgba(255, 200, 50, 0.3)'
              : 'rgba(0, 0, 0, 0.25) 0px 10px 25px, rgba(200, 162, 74, 0.35) 0px 0px 20px',
            border: 'none',
            outline: 'none',
            background: 'none',
            padding: 0,
            cursor: 'pointer',
            borderRadius: '50%',
            filter: sealGlow ? 'brightness(2.2) saturate(1.5)' : 'none',
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

        {/* LIGHT RAYS BEAMING FROM THE SEAL — visible golden sunbeams */}
        <div
          className="seal-light-rays"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '300vmax',
            height: '300vmax',
            transform: 'translate(-50%, -50%)',
            background: 'conic-gradient(from 0deg, rgba(255, 220, 80, 0.35) 0deg, transparent 15deg, transparent 30deg, rgba(255, 220, 80, 0.3) 45deg, transparent 60deg, transparent 75deg, rgba(255, 220, 80, 0.35) 90deg, transparent 105deg, transparent 120deg, rgba(255, 220, 80, 0.3) 135deg, transparent 150deg, transparent 165deg, rgba(255, 220, 80, 0.35) 180deg, transparent 195deg, transparent 210deg, rgba(255, 220, 80, 0.3) 225deg, transparent 240deg, transparent 255deg, rgba(255, 220, 80, 0.35) 270deg, transparent 285deg, transparent 300deg, rgba(255, 220, 80, 0.3) 315deg, transparent 330deg, transparent 345deg, rgba(255, 220, 80, 0.35) 360deg)',
            opacity: raysActive ? 1 : 0,
            transition: 'opacity 0.5s ease-in',
            zIndex: 9,
            pointerEvents: 'none',
            animation: raysActive ? 'spin-rays 4s linear infinite' : 'none',
            maskImage: 'radial-gradient(circle, transparent 40px, black 80px)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 40px, black 80px)',
          }}
        />

        {/* FLOATING INSTRUCTION HELPER TEXT */}
        <div
          className="envelope-helper-text text-center select-none"
          style={{
            position: 'absolute',
            bottom: '-45px',
            left: 0,
            right: 0,
            fontFamily: isEn ? "'Cinzel', serif" : "'Cairo', serif",
            fontSize: '11px',
            color: '#8f6f36',
            letterSpacing: isEn ? '0.15em' : 'normal',
            opacity: isOpen ? 0 : 0.8,
            transition: 'opacity 0.4s ease',
          }}
        >
          {isEn ? "PRESS WAX SEAL TO OPEN" : "اضغط على الختم لفتح الدعوة"}
        </div>
      </div>
      )}

      {/* FULL SCREEN MAGICAL LIGHT FLASH OVERLAY */}
      {isOpen && (
        <div
          className="full-screen-light-flash"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(circle at center, #ffffff 0%, #fff8e0 30%, #ecd292 60%, #d4af37 100%)',
            zIndex: 999999,
            pointerEvents: 'none',
            opacity: flashActive ? (flashFade ? 0 : 1) : 0,
            transition: flashFade
              ? 'opacity 0.8s ease-out'
              : 'opacity 0.5s ease-in',
          }}
        />
      )}

      <style jsx global>{`
        @keyframes pulse-ripple {
          0% {
            box-shadow: 0 0 0 0 rgba(200, 162, 74, 0.6), rgba(0, 0, 0, 0.25) 0px 10px 25px;
          }
          70% {
            box-shadow: 0 0 0 15px rgba(200, 162, 74, 0), rgba(0, 0, 0, 0.25) 0px 10px 25px;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(200, 162, 74, 0), rgba(0, 0, 0, 0.25) 0px 10px 25px;
          }
        }
        @keyframes float-instruction {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        #open-invitation-btn {
          animation: pulse-ripple 2s infinite ease-in-out;
        }
        .envelope-helper-text {
          animation: float-instruction 2s infinite ease-in-out;
        }
        @keyframes spin-rays {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Responsive Scaling for Devices */
        @media (max-width: 640px) {
          .envelope-container {
            width: 90vw !important;
            height: 63vw !important;
          }
          .envelope-front-names {
            bottom: 10% !important;
            left: 5% !important;
            right: 5% !important;
          }
          .envelope-front-names > div {
            font-size: 12px !important;
            padding: 2px 12px !important;
          }
          .envelope-seal-btn {
            width: 72px !important;
            height: 72px !important;
          }
          .envelope-helper-text {
            bottom: -35px !important;
            font-size: 9.5px !important;
          }
        }
      `}</style>
    </div>
  );
};
