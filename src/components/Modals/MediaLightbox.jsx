import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Headphones,
  Play,
  Pause,
  Volume2,
  MoreVertical,
  Star,
} from 'lucide-react';

// Helper to format duration (seconds) → "m:ss"
const formatDuration = (secs) => {
  if (!secs || isNaN(secs)) return '';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/* ── Sub-components ── */

const ToolbarBtn = ({ title, onClick, children, className = "" }) => (
  <button
    title={title}
    onClick={onClick}
    className={`p-2 rounded-full hover:bg-white/10 transition-colors ${className}`}
  >
    {children}
  </button>
);

const NavArrow = ({ direction, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`absolute ${direction === 'left' ? 'left-2' : 'right-2'} z-10
      w-10 h-10 flex items-center justify-center rounded-full
      bg-black/40 hover:bg-black/60 text-white transition-all duration-150
      ${disabled ? 'opacity-0 pointer-events-none' : 'opacity-80 hover:opacity-100'}`}
  >
    {direction === 'left' ? <ChevronLeft size={26} /> : <ChevronRight size={26} />}
  </button>
);

const LightboxAudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <div className="bg-[#e9edef] rounded-full px-4 py-3 flex items-center space-x-4 w-full max-w-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button onClick={togglePlay} className="text-[#111b21] hover:opacity-70 transition-opacity">
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
      </button>

      <div className="text-[#111b21] text-xs font-medium font-mono tracking-tighter whitespace-nowrap">
        {formatDuration(currentTime)} / {formatDuration(duration || 0)}
      </div>

      <input 
        type="range" 
        min={0} 
        max={duration || 100} 
        value={currentTime} 
        onChange={handleSeek}
        className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#111b21]"
      />

      <button className="text-[#111b21] hover:opacity-70 transition-opacity">
        <Volume2 size={20} />
      </button>
      <button className="text-[#111b21] hover:opacity-70 transition-opacity">
        <MoreVertical size={20} />
      </button>
    </div>
  );
};


const MediaLightbox = ({
  mediaList,       // [{ _id, type, mediaUrl, mediaName, createdAt, senderId }]
  initialIndex,
  currentUser,
  onClose,
  onToggleStar,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);
  const [zoom, setZoom] = useState(1);
  const [videoDurations, setVideoDurations] = useState({});   // { mediaUrl: seconds }
  const filmstripRef = useRef(null);
  const activeThumbRef = useRef(null);
  const videoRef = useRef(null);

  const current = mediaList[currentIndex];

  /* ── Navigation ── */
  const goTo = useCallback(
    (idx) => {
      if (idx < 0 || idx >= mediaList.length) return;
      setCurrentIndex(idx);
      setZoom(1);
    },
    [mediaList.length]
  );

  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  /* ── Keyboard ── */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') onClose();
      else if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 4));
      else if (e.key === '-') setZoom((z) => Math.max(z - 0.25, 0.25));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext, onClose]);

  /* ── Scroll filmstrip to active thumb ── */
  useEffect(() => {
    if (activeThumbRef.current && filmstripRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  /* ── Lock body scroll ── */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* ── Sender info ── */
  const sender = current?.senderId;
  const senderName =
    sender?._id === currentUser?._id
      ? 'You'
      : sender?.username || 'Unknown';
  const avatarColor = sender?.avatarColor || '#9ca3af';
  const avatarLetter = sender?.avatarLetter || senderName.charAt(0).toUpperCase();
  const timeStr = current?.createdAt
    ? `Today at ${format(new Date(current.createdAt), 'HH:mm')}`
    : '';

  const isStarred = current?.starredBy?.includes(currentUser?._id);

  /* ── Toolbar actions ── */
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = current.mediaUrl;
    a.download = current.mediaName || 'media';
    a.click();
  };

  const handleToggleStarLocal = () => {
    if (onToggleStar && current) {
      onToggleStar(current);
    }
  };

  const handleVideoMeta = (e, url) => {
    setVideoDurations((prev) => ({ ...prev, [url]: e.target.duration }));
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col bg-[#0b141a] select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ───────────── HEADER ───────────── */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 z-10">
        {/* Left: avatar + name + time */}
        <div className="flex items-center space-x-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {avatarLetter}
          </div>
          <div>
            <p className="text-[#e9edef] text-sm font-medium leading-tight">{senderName}</p>
            <p className="text-[#8696a0] text-xs">{timeStr}</p>
          </div>
        </div>

        {/* Right: action toolbar */}
        <div className="flex items-center space-x-1 text-[#aebac1]">
          <ToolbarBtn title="Zoom in" onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}>
            <ZoomIn size={20} />
          </ToolbarBtn>
          <ToolbarBtn title="Zoom out" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}>
            <ZoomOut size={20} />
          </ToolbarBtn>
          <ToolbarBtn title="Reset zoom" onClick={() => setZoom(1)}>
            <RotateCcw size={18} />
          </ToolbarBtn>
          <ToolbarBtn title="Download" onClick={handleDownload}>
            <Download size={20} />
          </ToolbarBtn>
          <ToolbarBtn 
            title={isStarred ? "Unstar" : "Star"} 
            onClick={handleToggleStarLocal}
            className={isStarred ? "text-yellow-400" : ""}
          >
            <Star size={20} fill={isStarred ? "currentColor" : "none"} />
          </ToolbarBtn>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <ToolbarBtn title="Close" onClick={onClose}>
            <X size={22} />
          </ToolbarBtn>
        </div>
      </div>

      {/* ───────────── MAIN MEDIA AREA ───────────── */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden min-h-0">
        {/* Left arrow */}
        <NavArrow
          direction="left"
          onClick={goPrev}
          disabled={currentIndex === 0}
        />

        {/* Media */}
        <div
          className="max-w-full max-h-full flex items-center justify-center overflow-hidden"
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s ease',
            cursor: zoom > 1 ? 'zoom-out' : 'default',
          }}
          onClick={() => zoom > 1 && setZoom(1)}
        >
          {current?.type === 'video' ? (
            <video
              ref={videoRef}
              key={current.mediaUrl}
              src={current.mediaUrl}
              controls
              className="max-w-full max-h-[calc(100vh-200px)] rounded-sm"
            />
          ) : current?.type === 'audio' ? (
            <div className="flex items-center justify-center w-[500px] max-w-full px-4">
               <LightboxAudioPlayer src={current.mediaUrl} />
            </div>
          ) : (
            <img
              key={current?.mediaUrl}
              src={current?.mediaUrl}
              alt={current?.mediaName || 'media'}
              className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-sm"
              draggable={false}
            />
          )}
        </div>

        {/* Right arrow */}
        <NavArrow
          direction="right"
          onClick={goNext}
          disabled={currentIndex === mediaList.length - 1}
        />

        {/* Caption overlay — always shown if message has text */}
        {current?.text && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-lg max-w-[70%] text-center backdrop-blur-sm">
            {current.text}
          </div>
        )}
      </div>

      {/* ───────────── FILMSTRIP ───────────── */}
      <div className="flex-shrink-0 bg-[#111b21] border-t border-white/5 py-2 px-4">
        <div
          ref={filmstripRef}
          className="flex space-x-2 overflow-x-auto pb-1 custom-scrollbar-thin"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#374248 transparent' }}
        >
          {mediaList.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={item._id || idx}
                ref={isActive ? activeThumbRef : null}
                onClick={() => goTo(idx)}
                className={`relative flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all duration-150 ${
                  isActive
                    ? 'border-[#00a884] shadow-[0_0_0_1px_#00a884]'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                {item.type === 'video' ? (
                  <>
                    {/* Hidden video to capture metadata for duration */}
                    <video
                      src={item.mediaUrl}
                      className="hidden"
                      onLoadedMetadata={(e) => handleVideoMeta(e, item.mediaUrl)}
                      preload="metadata"
                    />
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="white" className="opacity-80">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    {videoDurations[item.mediaUrl] && (
                      <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[9px] px-1 rounded">
                        {formatDuration(videoDurations[item.mediaUrl])}
                      </span>
                    )}
                  </>
                ) : item.type === 'audio' ? (
                  <div className="w-full h-full bg-[#ff8f00] flex items-center justify-center text-white/80">
                    <Headphones size={24} />
                  </div>
                ) : (
                  <img
                    src={item.mediaUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};



export default MediaLightbox;
