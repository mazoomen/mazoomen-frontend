'use client';

import React, { useEffect, useRef } from 'react';
import { Phone, Music, Camera, MapPin, Heart } from 'lucide-react';

interface BottomNavbarProps {
  musicUrl: string | null;
  musicPlaying: boolean;
  setMusicPlaying: (playing: boolean) => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  musicUrl,
  musicPlaying,
  setMusicPlaying
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const playSrc = musicUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // beautiful soft fallback instrumental
    
    if (!audioRef.current) {
      audioRef.current = new Audio(playSrc);
      audioRef.current.loop = true;
    } else if (audioRef.current.src !== playSrc) {
      audioRef.current.pause();
      audioRef.current = new Audio(playSrc);
      audioRef.current.loop = true;
    }

    if (musicPlaying) {
      audioRef.current.play().catch(err => {
        console.log("Audio autoplay prevented, waiting for user click.", err);
        setMusicPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [musicPlaying, musicUrl, setMusicPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    setMusicPlaying(!musicPlaying);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className="fixed bottom-4 w-[383px] md:w-[500px] lg:w-[600px] max-w-[calc(100%-32px)] h-16 z-[999] flex items-center justify-around px-2"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(217, 217, 217, 0.19)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderRadius: '12px',
        border: '1px solid rgba(244, 244, 244, 0.28)',
        boxShadow: 'rgba(0, 0, 0, 0.25) 0px 0px 2px',
      }}
    >
      {/* Contact */}
      <button 
        onClick={() => window.open('https://wa.me/966500000000', '_blank')} 
        className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
      >
        <span className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-all">
          <Phone className="w-4 h-4 text-black" />
        </span>
        <span className="text-[10px] text-gray-500 font-semibold font-normal">تواصل</span>
      </button>

      {/* Music */}
      <button 
        onClick={toggleMusic}
        className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
      >
        <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          musicPlaying ? 'bg-[#ac8c60]/20 shadow-[0_0_10px_rgba(200,162,74,0.3)]' : 'bg-black/5'
        }`}>
          <Music className={`w-4 h-4 transition-colors ${musicPlaying ? 'text-[#ac8c60]' : 'text-black'}`} />
        </span>
        <span className="text-[10px] text-gray-500 font-semibold font-normal">موسيقى</span>
      </button>

      {/* Moments/Gallery */}
      <button 
        onClick={() => scrollToSection('moments-section')}
        className="flex flex-col items-center gap-1 relative cursor-pointer bg-transparent border-none outline-none"
      >
        <span className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgb(200, 162, 74) 0%, rgb(240, 217, 138) 50%, rgb(200, 162, 74) 100%)',
          }}
        >
          <Camera className="w-6 h-6 text-white" />
        </span>
      </button>

      {/* Location */}
      <button 
        onClick={() => scrollToSection('location-section')}
        className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
      >
        <span className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-all">
          <MapPin className="w-4 h-4 text-black" />
        </span>
        <span className="text-[10px] text-gray-500 font-semibold font-normal">الموقع</span>
      </button>

      {/* RSVP */}
      <button 
        onClick={() => scrollToSection('rsvp-section')}
        className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
      >
        <span className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-all">
          <Heart className="w-4 h-4 text-black" />
        </span>
        <span className="text-[10px] text-gray-500 font-semibold font-normal">تأكيد الحضور</span>
      </button>
    </nav>
  );
};
