'use client';

import React, { useState } from 'react';

interface EnvelopeOverlayProps {
  eventTitle: string;
  onOpen: () => void;
  sealImage?: string;
}

export const EnvelopeOverlay: React.FC<EnvelopeOverlayProps> = ({ 
  eventTitle, 
  onOpen,
  sealImage = "/base44.app/api/apps/6966e1f30fa9fbe508239391/files/mp/public/6966e1f30fa9fbe508239391/941a523da_1000046659.png"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  const isDefaultSeal = sealImage === "/base44.app/api/apps/6966e1f30fa9fbe508239391/files/mp/public/6966e1f30fa9fbe508239391/941a523da_1000046659.png";

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
          groom: parts[0]?.trim() || 'العريس',
          bride: parts[1]?.trim() || 'العروس'
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
      />
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
      />

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
        {/* Wax Seal Open Button */}
        <button
          onClick={handleOpen}
          id="open-invitation-btn"
          className="relative rounded-full overflow-hidden cursor-pointer active:scale-[0.96] transition-transform duration-300 hover:scale-[1.04]"
          style={{
            width: '220px',
            height: '220px',
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
            }}
            loading="eager"
          />
          {/* Golden Text Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              padding: '24px 28px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-aref-ruqaa), var(--font-amiri), serif',
                fontSize: bride ? '1.5rem' : '1.35rem',
                fontWeight: 700,
                color: '#5c4625',
                textAlign: 'center',
                lineHeight: 1.2,
                textShadow: '0px 1px 2px rgba(255, 255, 255, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                {groom}
              </span>
              {bride && (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    gap: '10px',
                    margin: '4px 0'
                  }}>
                    <div style={{ height: '1.2px', width: '22px', backgroundColor: 'rgba(92, 70, 37, 0.25)' }} />
                    <span style={{
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-cinzel), serif',
                      fontStyle: 'italic',
                      opacity: 0.85,
                      color: '#5c4625',
                      lineHeight: 1,
                    }}>&amp;</span>
                    <div style={{ height: '1.2px', width: '22px', backgroundColor: 'rgba(92, 70, 37, 0.25)' }} />
                  </div>
                  <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                    {bride}
                  </span>
                </>
              )}
            </div>
            <span
              style={{
                fontFamily: 'var(--font-cinzel), serif',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.35em',
                color: '#5c4625',
                marginTop: '10px',
                opacity: 0.85,
                borderTop: '1px solid rgba(92, 70, 37, 0.18)',
                paddingTop: '6px',
                width: '50%',
                textAlign: 'center',
              }}
            >
              OPEN
            </span>
          </div>
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
      `}</style>
    </div>
  );
};
