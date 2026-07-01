'use client';

import React, { useEffect, useRef } from 'react';
import { Info, Baby, QrCode } from 'lucide-react';

interface DetailRule {
  icon: React.ReactNode;
  text: string;
}

const detailRules: DetailRule[] = [
  { icon: <QrCode className="w-4 h-4 text-[#ac8c60]" />, text: 'الدخول عبر رمز QR فقط' },
  { icon: <Info className="w-4 h-4 text-[#ac8c60]" />, text: 'يرجى تأكيد الحضور (RSVP)' },
  { icon: <Baby className="w-4 h-4 text-[#ac8c60]" />, text: 'جنة الأطفال منازلهم' },
  { icon: <Info className="w-4 h-4 text-[#ac8c60]" />, text: 'الفعالية مخصصة للكبار فقط' }
];

export const EventDetails: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

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
      <h3 className="text-center text-xl mb-6">تفاصيل الحفل</h3>
      <div className="relative pl-8">
        <div 
          className="absolute left-3 top-3 bottom-3 w-px" 
          style={{ background: 'linear-gradient(transparent, rgba(172, 140, 96, 0.44), transparent)' }} 
        />
        
        <div ref={containerRef} className="space-y-4 details-items-container">
          {detailRules.map((rule, index) => (
            <div key={index} className="relative flex items-center gap-3 min-h-[52px] detail-item-row">
              <div 
                className="absolute -left-5 w-2.5 h-2.5 rounded-full shrink-0" 
                style={{ 
                  background: 'rgba(172, 140, 96, 0.19)', 
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
                    background: 'rgba(172, 140, 96, 0.094)', 
                    border: '1px solid rgba(172, 140, 96, 0.19)',
                    boxShadow: 'rgba(172, 140, 96, 0.19) 0px 0px 10px 4px, rgba(172, 140, 96, 0.082) 0px 0px 20px 8px'
                  }}
                >
                  {rule.icon}
                </span>
                <span className="text-sm leading-tight text-right w-full">{rule.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
