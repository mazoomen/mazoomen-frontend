'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Phone, Music, Camera, MapPin, Heart } from 'lucide-react';

interface BottomNavbarProps {
  musicUrl: string | null;
  musicPlaying: boolean;
  setMusicPlaying: (playing: boolean) => void;
  theme?: 'gold' | 'green';
  viewingLang?: string;
  locationUrl?: string | null;
  onContactClick?: () => void;
}

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  musicUrl,
  musicPlaying,
  setMusicPlaying,
  theme = 'gold',
  viewingLang,
  locationUrl,
  onContactClick
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [ytReady, setYtReady] = useState(false);

  const ytVideoId = musicUrl ? getYouTubeVideoId(musicUrl) : null;

  // Cleanup native audio when switching to YouTube
  useEffect(() => {
    if (ytVideoId && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [ytVideoId]);

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (!ytVideoId) {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
          ytPlayerRef.current = null;
      }
      return;
    }

    const initPlayer = () => {
      if (ytPlayerRef.current) return;
      ytPlayerRef.current = new (window as any).YT.Player('yt-player-container', {
        height: '0',
        width: '0',
        videoId: ytVideoId,
        playerVars: {
          autoplay: musicPlaying ? 1 : 0,
          loop: 1,
          playlist: ytVideoId,
          controls: 0,
        },
        events: {
          onReady: () => {
            setYtReady(true);
            if (musicPlaying) {
              ytPlayerRef.current.playVideo();
            }
          },
        },
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
        setYtReady(false);
      }
    };
  }, [ytVideoId]);

  // Control Playback (Standard and YouTube)
  useEffect(() => {
    if (ytVideoId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        if (musicPlaying) {
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.pauseVideo();
        }
      }
    } else {
      const playSrc = musicUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      
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
    }
  }, [musicPlaying, musicUrl, ytVideoId, setMusicPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
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

  const isGreen = theme === 'green';
  const isEn = viewingLang === "en";
  
  // Custom theme colors configuration
  const colors = {
    bg: isGreen ? 'rgba(253, 251, 246, 0.75)' : 'rgba(253, 251, 246, 0.75)',
    border: isGreen ? '1px solid rgba(46, 90, 54, 0.22)' : '1px solid rgba(172, 140, 96, 0.28)',
    shadow: isGreen ? '0 10px 30px -10px rgba(27, 50, 34, 0.12), 0 1px 3px rgba(27, 50, 34, 0.05)' : '0 10px 30px -10px rgba(172, 140, 96, 0.15), 0 1px 3px rgba(172, 140, 96, 0.05)',
    
    textInactive: isGreen ? '#4A5D4E' : '#7D6A53',
    textActive: isGreen ? '#1B3222' : '#ac8c60',
    
    btnActiveBg: isGreen ? 'rgba(46, 90, 54, 0.12)' : 'rgba(172, 140, 96, 0.15)',
    btnInactiveBg: isGreen ? 'rgba(46, 90, 54, 0.04)' : 'rgba(172, 140, 96, 0.04)',
    
    centerBtnBg: isGreen 
      ? 'linear-gradient(135deg, #1B3222 0%, #3D7348 50%, #1B3222 100%)'
      : 'linear-gradient(135deg, rgb(172, 140, 96) 0%, rgb(210, 180, 140) 50%, rgb(172, 140, 96) 100%)',
    centerBtnShadow: isGreen
      ? '0 6px 20px rgba(27, 50, 34, 0.35)'
      : '0 6px 20px rgba(172, 140, 96, 0.35)'
  };

  return (
    <nav 
      className="fixed bottom-6 w-[383px] md:w-[500px] lg:w-[600px] max-w-[calc(100%-32px)] h-16.5 z-[999] flex items-center justify-around px-2"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        background: colors.bg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: colors.border,
        boxShadow: colors.shadow,
      }}
    >
      {/* Hidden YouTube player container */}
      {ytVideoId && (
        <div id="yt-player-container" style={{ width: 0, height: 0, opacity: 0, pointerEvents: 'none', position: 'absolute' }} />
      )}

      {/* Contact */}
      <button 
        onClick={onContactClick} 
        className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
      >
        <span 
          className="w-8.5 h-8.5 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
          style={{ backgroundColor: colors.btnInactiveBg }}
        >
          <Phone className="w-4 h-4" style={{ color: colors.textInactive }} />
        </span>
        <span className="text-[9px] font-bold" style={{ color: colors.textInactive }}>{isEn ? "WhatsApp" : "تواصل"}</span>
      </button>

      {/* Music */}
      <button 
        onClick={toggleMusic}
        className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
      >
        <span 
          className="w-8.5 h-8.5 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
          style={{ 
            backgroundColor: musicPlaying ? colors.btnActiveBg : colors.btnInactiveBg,
            boxShadow: musicPlaying ? `0 0 12px ${isGreen ? 'rgba(46, 90, 54, 0.15)' : 'rgba(172, 140, 96, 0.15)'}` : 'none'
          }}
        >
          <Music className="w-4 h-4" style={{ color: musicPlaying ? colors.textActive : colors.textInactive }} />
        </span>
        <span className="text-[9px] font-bold" style={{ color: musicPlaying ? colors.textActive : colors.textInactive }}>{isEn ? "Music" : "موسيقى"}</span>
      </button>

      {/* Moments/Gallery */}
      <button 
        onClick={() => scrollToSection('moments-section')}
        className="flex flex-col items-center gap-1 relative cursor-pointer bg-transparent border-none outline-none -translate-y-3 hover:scale-105 active:scale-95 transition-all duration-300"
      >
        <span className="relative w-13 h-13 rounded-full flex items-center justify-center"
          style={{
            background: colors.centerBtnBg,
            boxShadow: colors.centerBtnShadow,
          }}
        >
          <Camera className="w-5.5 h-5.5 text-white" />
        </span>
      </button>

      {/* Location */}
      <button 
        onClick={() => {
          if (locationUrl) {
            window.open(locationUrl, '_blank');
          } else {
            scrollToSection('location-section');
          }
        }}
        className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
      >
        <span 
          className="w-8.5 h-8.5 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
          style={{ backgroundColor: colors.btnInactiveBg }}
        >
          <MapPin className="w-4 h-4" style={{ color: colors.textInactive }} />
        </span>
        <span className="text-[9px] font-bold" style={{ color: colors.textInactive }}>{isEn ? "Location" : "الموقع"}</span>
      </button>

      {/* RSVP */}
      <button 
        onClick={() => scrollToSection('rsvp-section')}
        className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
      >
        <span 
          className="w-8.5 h-8.5 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
          style={{ backgroundColor: colors.btnInactiveBg }}
        >
          <Heart className="w-4 h-4" style={{ color: colors.textInactive }} />
        </span>
        <span className="text-[9px] font-bold" style={{ color: colors.textInactive }}>{isEn ? "RSVP" : "تأكيد الحضور"}</span>
      </button>
    </nav>
  );
};
