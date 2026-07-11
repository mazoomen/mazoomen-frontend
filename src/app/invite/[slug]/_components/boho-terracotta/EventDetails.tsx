'use client';

import React, { useEffect, useRef } from 'react';
import { Info } from 'lucide-react';

interface DetailItem {
  text: string;
}

interface EventDetailsProps {
  details?: DetailItem[];
  viewingLang?: string;
}

export const EventDetails: React.FC<EventDetailsProps> = ({ details, viewingLang }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isEn = viewingLang === "en";

  // Don't render if no details provided
  if (!details || details.length === 0) return null;

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -15% 0px',
      threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.detail-item-row');
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('visible');
            }, index * 150);
          });
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <h3 className="text-center text-xl mb-6">{isEn ? "Event Guidelines" : "تفاصيل الحفل"}</h3>
      <div className={`relative ${isEn ? "pr-8" : "pl-8"}`}>
        <div 
          className={`absolute ${isEn ? "right-3" : "left-3"} top-3 bottom-3 w-px`} 
          style={{ background: 'linear-gradient(transparent, rgba(138, 78, 53, 0.44), transparent)' }} 
        />
        
        <div ref={containerRef} className="space-y-4 details-items-container">
          {details.map((detail, index) => (
            <div key={index} className="relative flex items-center gap-3 min-h-[52px] detail-item-row">
              <div 
                className={`absolute ${isEn ? "-right-5" : "-left-5"} w-2.5 h-2.5 rounded-full shrink-0`} 
                style={{ 
                  background: 'rgba(138, 78, 53, 0.19)', 
                  top: '50%', 
                  marginTop: '-5px' 
                }} 
              />
              <div 
                className="flex items-center gap-3 flex-1 px-3 py-2.5 rounded-xl"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  backdropFilter: 'blur(16px)', 
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  boxShadow: 'rgba(0, 0, 0, 0.15) 0px 8px 32px' 
                }}
              >
                <span 
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" 
                  style={{ 
                    background: 'rgba(138, 78, 53, 0.094)', 
                    border: '1px solid rgba(138, 78, 53, 0.19)',
                    boxShadow: 'rgba(138, 78, 53, 0.19) 0px 0px 10px 4px, rgba(138, 78, 53, 0.08) 0px 0px 20px 8px'
                  }}
                >
                  <Info className="w-4 h-4 text-[#8A4E35]" />
                </span>
                <span className={`text-sm leading-tight ${isEn ? "text-left" : "text-right"} w-full`}>{detail.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
