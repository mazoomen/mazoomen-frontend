'use client';

import React, { useState } from 'react';

interface EnvelopeOverlayProps {
  eventTitle: string;
  onOpen: () => void;
}

export const EnvelopeOverlay: React.FC<EnvelopeOverlayProps> = ({ eventTitle, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    onOpen();
    setTimeout(() => {
      setIsDone(true);
    }, 1200);
  };

  // Helper to split couple names from eventTitle (e.g. "أيمن وراما" or "أحمد & سارة")
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
            src="/base44.app/api/apps/6966e1f30fa9fbe508239391/files/mp/public/6966e1f30fa9fbe508239391/941a523da_1000046659.png"
            alt="Wax Seal"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 1%',
              transform: 'scale(1.12)',
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
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-aref-ruqaa), var(--font-amiri), serif',
                fontSize: bride ? '1.45rem' : '1.35rem',
                fontWeight: 700,
                color: '#84693f',
                textAlign: 'center',
                lineHeight: 1.25,
                textShadow: '0px 1px 1px rgba(255, 255, 255, 0.4)',
              }}
            >
              {groom}
              {bride && (
                <>
                  <br />
                  <span style={{
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-cinzel), serif',
                    fontStyle: 'italic',
                    opacity: 0.85,
                    display: 'block',
                    margin: '1px 0',
                    color: '#84693f'
                  }}>&amp;</span>
                  {bride}
                </>
              )}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-cinzel), serif',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.3em',
                color: '#84693f',
                marginTop: '6px',
                opacity: 0.9,
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
