
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, Gauge } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

interface TTSPlayerProps {
  text: string;
  className?: string;
  autoPlay?: boolean;
}

export const TTSPlayer: React.FC<TTSPlayerProps> = ({ text, className = "", autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Handle Play/Pause
  const togglePlay = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioUrl) {
      setIsLoading(true);
      try {
        const url = await generateSpeech(text);
        setAudioUrl(url);
      } catch (e) {
        console.error("Failed to load audio", e);
      } finally {
        setIsLoading(false);
      }
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  // Auto-play when URL becomes available if triggered by user click
  useEffect(() => {
    if (audioUrl && audioRef.current && !isPlaying && !isLoading) {
      // We only want to auto-play if the URL was just fetched in response to a click
      // The simplest way to handle this flow is: click -> set loading -> fetch -> set URL -> effect plays
      // But we need to ensure we don't play on component mount if URL was cached (though we don't cache URL prop yet)
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Playback failed", err));
    }
  }, [audioUrl]);

  const toggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rates = [1.0, 1.25, 1.5, 2.0];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  return (
    <div className={`inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full p-1.5 pr-4 backdrop-blur-md transition-all group ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-400 text-white transition-colors shadow-lg"
        title="Narration"
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={14} className="fill-current" />
        ) : (
          <Play size={14} className="fill-current ml-0.5" />
        )}
      </button>

      <div className="flex items-center gap-3">
         <span className="text-xs font-medium text-white/80 cursor-default select-none">
            {isPlaying ? "Playing..." : "Listen"}
         </span>
         
         <div className="w-px h-3 bg-white/10"></div>

         <button 
           onClick={toggleSpeed}
           className="flex items-center gap-1 text-[10px] font-mono text-white/60 hover:text-white transition-colors"
           title="Playback Speed"
         >
           <Gauge size={12} />
           {playbackRate}x
         </button>
      </div>

      <audio 
        ref={audioRef} 
        src={audioUrl || undefined} 
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};
