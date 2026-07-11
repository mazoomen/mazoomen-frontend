'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Phone, Music, Camera, MapPin, Heart } from 'lucide-react';

interface BottomNavbarProps {
  musicUrl: string | null;
  musicPlaying: boolean;
  setMusicPlaying: (playing: boolean) => void;
  theme?: 'gold' | 'green' | 'emerald' | 'terracotta' | 'lavender' | 'white';
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
  const isEmerald = theme === 'emerald';
  const isTerracotta = theme === 'terracotta';
  const isLavender = theme === 'lavender';
  const isWhite = theme === 'white';
  const isEn = viewingLang === "en";
  
  // Custom theme colors configuration
  const colors = {
    bg: isEmerald
      ? 'rgba(8, 26, 54, 0.85)'
      : isGreen
      ? 'rgba(253, 251, 246, 0.75)'
      : isTerracotta
      ? 'rgba(254, 250, 246, 0.75)'
      : isLavender
      ? 'rgba(253, 248, 253, 0.75)'
      : isWhite
      ? 'rgba(255, 255, 255, 0.75)'
      : 'rgba(253, 251, 246, 0.75)',
    border: isEmerald
      ? '1px solid rgba(197, 168, 128, 0.35)'
      : isGreen
      ? '1px solid rgba(46, 90, 54, 0.22)'
      : isTerracotta
      ? '1px solid rgba(138, 78, 53, 0.22)'
      : isLavender
      ? '1px solid rgba(150, 96, 141, 0.22)'
      : isWhite
      ? '1px solid rgba(148, 163, 184, 0.35)'
      : '1px solid rgba(172, 140, 96, 0.28)',
    shadow: isEmerald
      ? '0 10px 30px -10px rgba(8, 26, 54, 0.5), 0 1px 3px rgba(197, 168, 128, 0.1)'
      : isGreen
      ? '0 10px 30px -10px rgba(27, 50, 34, 0.12), 0 1px 3px rgba(27, 50, 34, 0.05)'
      : isTerracotta
      ? '0 10px 30px -10px rgba(138, 78, 53, 0.12), 0 1px 3px rgba(138, 78, 53, 0.05)'
      : isLavender
      ? '0 10px 30px -10px rgba(150, 96, 141, 0.12), 0 1px 3px rgba(150, 96, 141, 0.05)'
      : isWhite
      ? '0 10px 30px -10px rgba(148, 163, 184, 0.1), 0 1px 3px rgba(148, 163, 184, 0.03)'
      : '0 10px 30px -10px rgba(172, 140, 96, 0.15), 0 1px 3px rgba(172, 140, 96, 0.05)',
    
    textInactive: isEmerald
      ? 'rgba(255, 255, 255, 0.6)'
      : isGreen
      ? '#4A5D4E'
      : isTerracotta
      ? '#A26B54'
      : isLavender
      ? '#6E4D68'
      : isWhite
      ? '#64748B'
      : '#7D6A53',
    textActive: isEmerald
      ? '#c5a880'
      : isGreen
      ? '#1B3222'
      : isTerracotta
      ? '#8A4E35'
      : isLavender
      ? '#4A2E4B'
      : isWhite
      ? '#334155'
      : '#ac8c60',
    
    btnActiveBg: isEmerald
      ? 'rgba(197, 168, 128, 0.18)'
      : isGreen
      ? 'rgba(46, 90, 54, 0.12)'
      : isTerracotta
      ? 'rgba(138, 78, 53, 0.12)'
      : isLavender
      ? 'rgba(150, 96, 141, 0.12)'
      : isWhite
      ? 'rgba(100, 116, 139, 0.15)'
      : 'rgba(172, 140, 96, 0.15)',
    btnInactiveBg: isEmerald
      ? 'rgba(255, 255, 255, 0.06)'
      : isGreen
      ? 'rgba(46, 90, 54, 0.04)'
      : isTerracotta
      ? 'rgba(138, 78, 53, 0.04)'
      : isLavender
      ? 'rgba(150, 96, 141, 0.04)'
      : isWhite
      ? 'rgba(100, 116, 139, 0.04)'
      : 'rgba(172, 140, 96, 0.04)',
    
    centerBtnBg: isEmerald
      ? 'linear-gradient(135deg, #c5a880 0%, #e2d2bd 50%, #c5a880 100%)'
      : isGreen 
      ? 'linear-gradient(135deg, #1B3222 0%, #3D7348 50%, #1B3222 100%)'
      : isTerracotta
      ? 'linear-gradient(135deg, #8A4E35 0%, #A26B54 50%, #8A4E35 100%)'
      : isLavender
      ? 'linear-gradient(135deg, #4A2E4B 0%, #6E4D68 50%, #4A2E4B 100%)'
      : isWhite
      ? 'linear-gradient(135deg, #334155 0%, #64748B 50%, #334155 100%)'
      : 'linear-gradient(135deg, rgb(172, 140, 96) 0%, rgb(210, 180, 140) 50%, rgb(172, 140, 96) 100%)',
    centerBtnShadow: isEmerald
      ? '0 6px 20px rgba(197, 168, 128, 0.45)'
      : isGreen
      ? '0 6px 20px rgba(27, 50, 34, 0.35)'
      : isTerracotta
      ? '0 6px 20px rgba(138, 78, 53, 0.35)'
      : isLavender
      ? '0 6px 20px rgba(150, 96, 141, 0.35)'
      : isWhite
      ? '0 6px 20px rgba(100, 116, 139, 0.3)'
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
