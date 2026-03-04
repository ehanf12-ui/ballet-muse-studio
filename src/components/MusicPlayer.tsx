import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';
import { BalletTrack, balletTracks, findTrackForSection } from '@/lib/music';

interface MusicPlayerProps {
  /** Currently active section title (e.g. "플리에") */
  activeSectionTitle?: string;
  /** Current time signature of the active section */
  activeMeter?: '4/4' | '3/4';
}

export default function MusicPlayer({ activeSectionTitle, activeMeter }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<BalletTrack>(balletTracks[0]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [autoSwitch, setAutoSwitch] = useState(true);

  // Auto-switch track when active section changes
  useEffect(() => {
    if (!autoSwitch || !activeSectionTitle) return;
    const best = findTrackForSection(activeSectionTitle, activeMeter ?? '4/4');
    if (best && best.id !== currentTrack.id) {
      setCurrentTrack(best);
    }
  }, [activeSectionTitle, activeMeter, autoSwitch]);

  // Load audio when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const wasPlaying = isPlaying;
    audio.src = currentTrack.url;
    audio.load();
    if (wasPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentTrack.id]);

  // Progress update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onTime);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const skip = useCallback((delta: number) => {
    const idx = balletTracks.findIndex(t => t.id === currentTrack.id);
    const next = (idx + delta + balletTracks.length) % balletTracks.length;
    setCurrentTrack(balletTracks[next]);
  }, [currentTrack.id]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  }, [duration]);

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <audio ref={audioRef} muted={muted} preload="metadata" />
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 h-14 bg-card border-t border-border flex items-center px-4 gap-3 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {/* Track info */}
        <div className="flex items-center gap-2 w-48 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Music size={14} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-foreground truncate">{currentTrack.title}</div>
            <div className="text-[9px] text-muted-foreground truncate">{currentTrack.composer} · {currentTrack.meter}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button onClick={() => skip(-1)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack size={14} />
          </button>
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          <button onClick={() => skip(1)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward size={14} />
          </button>
        </div>

        {/* Progress */}
        <span className="text-[9px] text-muted-foreground w-8 text-right tabular-nums">{fmt(progress)}</span>
        <div className="flex-1 h-1 bg-muted rounded-full cursor-pointer group" onClick={seek}>
          <div
            className="h-full bg-primary rounded-full transition-all relative group-hover:h-1.5"
            style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
          />
        </div>
        <span className="text-[9px] text-muted-foreground w-8 tabular-nums">{fmt(duration)}</span>

        {/* Volume + auto */}
        <button onClick={() => setMuted(m => !m)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <button
          onClick={() => setAutoSwitch(a => !a)}
          className={`text-[8px] font-bold px-2 py-0.5 rounded-md border transition-all ${autoSwitch ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}
          title="섹션 클릭 시 자동으로 곡 전환"
        >
          AUTO
        </button>
      </div>
    </>
  );
}
