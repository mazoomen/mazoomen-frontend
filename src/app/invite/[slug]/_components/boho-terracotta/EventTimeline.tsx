'use client';

import React, { useEffect, useRef } from 'react';

interface TimelineEvent {
  time: string;
  title: string;
}

interface EventTimelineProps {
  events?: TimelineEvent[];
  viewingLang?: string;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events, viewingLang }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Don't render if no events provided
  if (!events || events.length === 0) return null;

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !indicatorRef.current) return;

      const activeItems = itemRefs.current.filter((item): item is HTMLDivElement => item !== null);
      if (activeItems.length === 0) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const triggerPoint = viewportHeight / 2;
      const containerHeight = rect.height;
      const relativeTop = rect.top - triggerPoint;

      let progress = -relativeTop / containerHeight;
      progress = Math.max(0, Math.min(1, progress));

      const firstItem = activeItems[0];
      const lastItem = activeItems[activeItems.length - 1];
      
      const startTop = firstItem.offsetTop + (firstItem.offsetHeight / 2);
      const endTop = lastItem.offsetTop + (lastItem.offsetHeight / 2);
      const range = endTop - startTop;

      const indicatorTop = startTop + (progress * range);
      indicatorRef.current.style.top = `${indicatorTop}px`;

      activeItems.forEach((item) => {
        const itemOffsetTop = item.offsetTop + (item.offsetHeight / 2);
        const timeSpan = item.querySelector('.timeline-time');
        const titleSpan = item.querySelector('.timeline-title');
        const dot = item.querySelector('.timeline-dot');

        if (indicatorTop >= itemOffsetTop - 10) {
          dot?.classList.add('active');
          timeSpan?.classList.add('active');
          titleSpan?.classList.add('active');
        } else {
          dot?.classList.remove('active');
          timeSpan?.classList.remove('active');
          titleSpan?.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    setTimeout(handleScroll, 200);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="p-4 mb-8" style={{ backdropFilter: 'blur(16px)', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: 'rgba(0, 0, 0, 0.15) 0px 8px 32px', borderRadius: '24px' }}>
      <h3 className="text-center text-xl mb-8">{viewingLang === 'en' ? "Event Program" : "برنامج المناسبة"}</h3>
      <div ref={containerRef} className="relative timeline-items-container">
        {/* Vertical center track line */}
        <div className="absolute top-0 bottom-0 w-px" style={{ left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(transparent, rgba(138, 78, 53, 0.38), transparent)' }} />
        
        {/* Sliding Indicator */}
        <div ref={indicatorRef} id="timeline-indicator" className="absolute pointer-events-none z-20" style={{ top: '0px', left: '50%', transform: 'translate(-50%, -50%)', transition: 'top 0.1s ease-out' }}>
          <div className="w-5 h-5 rounded-full" style={{ background: 'transparent', border: '2px solid rgb(138, 78, 53)', boxShadow: 'rgba(138, 78, 53, 0.15) 0px 0px 0px 4px, rgba(138, 78, 53, 0.27) 0px 0px 18px 8px, rgba(138, 78, 53, 0.09) 0px 0px 36px 16px' }} />
        </div>

        {events.map((event, index) => (
          <div
            key={index}
            ref={(el) => { itemRefs.current[index] = el; }}
            className="relative flex items-center timeline-item"
            style={{ minHeight: '68px' }}
          >
            <div className="w-[calc(50%-14px)] flex items-center justify-end pr-6">
              <span className="text-sm font-bold text-right timeline-time" style={{ color: '#8A4E35' }}>
                {event.time}
              </span>
            </div>
            <div className="flex items-center justify-center shrink-0 z-10" style={{ width: '28px' }}>
              <div className="w-2.5 h-2.5 rounded-full timeline-dot" />
            </div>
            <div className="w-[calc(50%-14px)] flex items-center justify-start pl-6">
              <span className="text-sm font-bold text-left timeline-title" style={{ color: '#8A4E35' }}>
                {event.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
