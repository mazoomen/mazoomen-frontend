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
  sealImage = "/base44.app/api/apps/6966e1f30fa9fbe508239391/files/mp/public/6966e1f30fa9fbe508239391/941a523da_1000046659.png",
  viewingLang,
  customSealStyle,
  textColor
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  const isDefaultSeal = sealImage === "/base44.app/api/apps/6966e1f30fa9fbe508239391/files/mp/public/6966e1f30fa9fbe508239391/941a523da_1000046659.png";
  const isEn = viewingLang === "en";

  const handleOpen = () => {
    setIsOpen(true);
    onOpen();
    setTimeout(() => {
      setIsDone(true);
    }, 1200);
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

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const pathPrefix = isClient ? window.location.pathname : '';

  if (isDone) return null;

  return (
    <div
      id="opening-overlay"
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ${
        isOpen ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Left panel of the envelope split */}
      <div
        id="left-panel"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          transition: 'transform 1.2s cubic-bezier(0.77, 0, 0.175, 1)',
          borderRight: '1.5px solid rgba(200, 162, 74, 0.35)',
          background: 'rgba(253, 251, 245, 0.35)',
          transform: isOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        {/* Groom Name straight */}
        <div
          className="envelope-name-left"
          style={{
            fontFamily: isEn 
              ? 'var(--font-cinzel), serif' 
              : 'var(--font-aref-ruqaa), var(--font-amiri), serif',
            fontWeight: 700,
            color: textColor || '#5c4625',
            textShadow: '0px 1px 2px rgba(255, 255, 255, 0.65)',
            textAlign: 'right',
            userSelect: 'none',
            opacity: isOpen ? 0 : 0.85,
            transition: 'opacity 0.6s ease',
          }}
        >
          {groom}
        </div>
      </div>

      {/* Right panel of the envelope split */}
      <div
        id="right-panel"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          transition: 'transform 1.2s cubic-bezier(0.77, 0, 0.175, 1)',
          borderLeft: '1.5px solid rgba(200, 162, 74, 0.35)',
          background: 'rgba(253, 251, 245, 0.35)',
          transform: isOpen ? 'translateX(100%)' : 'translateX(0)',
        }}
      >
        {/* Bride Name straight */}
        <div
          className="envelope-name-right"
          style={{
            fontFamily: isEn 
              ? 'var(--font-cinzel), serif' 
              : 'var(--font-aref-ruqaa), var(--font-amiri), serif',
            fontWeight: 700,
            color: textColor || '#5c4625',
            textShadow: '0px 1px 2px rgba(255, 255, 255, 0.65)',
            textAlign: 'left',
            userSelect: 'none',
            opacity: isOpen ? 0 : 0.85,
            transition: 'opacity 0.6s ease',
          }}
        >
          {bride}
        </div>
      </div>

      {/* Central interactive button content */}
      <div
        id="center-content"
        style={{
          position: 'relative',
          zIndex: 10,
          flexDirection: 'column',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scale(0.85)' : 'scale(1)',
        }}
      >
        {/* Curved Circular Text around the seal */}
        <svg
          key={isClient ? `center-svg-client-${pathPrefix}` : 'center-svg-ssr'}
          className="envelope-svg-center"
          viewBox="0 0 340 340"
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <defs>
            {/* Top arc path: clockwise left-to-right, closer to seal (radius 125) */}
            <path id="topArcPath" d="M 45,170 A 125,125 0 0,1 295,170" fill="none" />
            {/* Bottom arc path: counter-clockwise left-to-right (keeps bottom text right-side up, radius 125) */}
            <path id="bottomArcPath" d="M 45,170 A 125,125 0 0,0 295,170" fill="none" />
          </defs>

          {/* Top Text: OPEN / افتح */}
          <text 
            style={{ 
              fill: textColor || '#5c4625',
              fontFamily: isEn 
                ? 'var(--font-cinzel), serif' 
                : 'var(--font-aref-ruqaa), var(--font-amiri), serif',
              fontSize: isEn ? '16px' : '26px',
              fontWeight: 700,
              letterSpacing: isEn ? '0.35em' : 'normal',
            }}
          >
            <textPath href="#topArcPath" xlinkHref="#topArcPath" startOffset="50%" textAnchor="middle">
              {isEn ? 'OPEN' : 'افتح'}
            </textPath>
          </text>

          {/* Bottom Text: Press to open / اضغط للفتح */}
          <text 
            style={{ 
              fill: textColor || '#5c4625',
              fontFamily: 'Cairo, sans-serif',
              fontSize: isEn ? '11px' : '12px',
              fontWeight: 700,
              letterSpacing: isEn ? '0.2em' : 'normal',
            }}
          >
            <textPath href="#bottomArcPath" xlinkHref="#bottomArcPath" startOffset="50%" textAnchor="middle">
              {isEn ? 'PRESS TO OPEN' : 'اضغط للفتح'}
            </textPath>
          </text>
        </svg>

        {/* Wax Seal Open Button */}
        <button
          onClick={handleOpen}
          id="open-invitation-btn"
          className="envelope-seal-btn relative rounded-full overflow-hidden cursor-pointer active:scale-[0.96] transition-transform duration-300 hover:scale-[1.04]"
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.25) 0px 15px 45px, rgba(200, 162, 74, 0.3) 0px 0px 30px',
            border: 'none',
            outline: 'none',
            background: 'none',
            padding: 0,
          }}
        >
          <img
            src={sealImage}
            alt="Wax Seal"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: isDefaultSeal ? 'center 1%' : 'center',
              transform: isDefaultSeal ? 'scale(1.12)' : 'scale(1.02)',
              borderRadius: '50%',
              zIndex: 10,
              ...customSealStyle
            }}
            loading="eager"
          />
        </button>
      </div>

      <style jsx global>{`
        @keyframes pulse-ripple {
          0% {
            box-shadow: 0 0 0 0 rgba(200, 162, 74, 0.6), rgba(0, 0, 0, 0.3) 0px 15px 45px;
          }
          70% {
            box-shadow: 0 0 0 20px rgba(200, 162, 74, 0), rgba(0, 0, 0, 0.3) 0px 15px 45px;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(200, 162, 74, 0), rgba(0, 0, 0, 0.3) 0px 15px 45px;
          }
        }
        #open-invitation-btn {
          animation: pulse-ripple 2s infinite ease-in-out;
        }
        .envelope-seal-btn {
          width: 220px;
          height: 220px;
        }
        .envelope-svg-center {
          width: 340px;
          height: 340px;
        }
        .envelope-name-left {
          position: absolute;
          right: 140px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 2.6rem;
          white-space: nowrap;
        }
        .envelope-name-right {
          position: absolute;
          left: 140px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 2.6rem;
          white-space: nowrap;
        }
        @media (max-width: 768px) {
          .envelope-name-left {
            right: 115px;
            font-size: 1.8rem;
          }
          .envelope-name-right {
            left: 115px;
            font-size: 1.8rem;
          }
        }
        @media (max-width: 640px) {
          .envelope-seal-btn {
            width: 170px;
            height: 170px;
          }
          .envelope-svg-center {
            width: 280px;
            height: 280px;
          }
          .envelope-name-left {
            right: 92px;
            font-size: 1.2rem;
          }
          .envelope-name-right {
            left: 92px;
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};
