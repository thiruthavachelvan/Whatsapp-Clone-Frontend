import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

const VoiceMessagePlayer = ({ mediaUrl, senderName, avatarColor, avatarLetter }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      const newTime = (e.target.value / 100) * audio.duration;
      audio.currentTime = newTime;
      setProgress(e.target.value);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const displayTime = isPlaying 
    ? formatTime(audioRef.current?.currentTime || 0) 
    : formatTime(duration);

  return (
    <div className="flex items-center min-w-[250px] sm:min-w-[300px] h-16 pt-1">
      <audio ref={audioRef} src={mediaUrl} preload="metadata" />
      
      {/* Avatar Container */}
      <div className="relative mr-4 flex-shrink-0">
        <div 
          className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white text-lg font-medium"
          style={{ backgroundColor: avatarColor || '#6b7280' }}
        >
          {avatarLetter || senderName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-whatsapp-teal text-white rounded-full p-[2px] border-2 border-[#d9fdd3] dark:border-[#005c4b]">
          <Mic size={12} className="fill-current" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col flex-1 mt-1">
        <div className="flex items-center space-x-3 mb-1">
          <button onClick={togglePlay} className="text-gray-500 dark:text-[#aebac1] hover:text-gray-700 dark:hover:text-[#d1d7db] flex-shrink-0">
            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
          </button>
          
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-gray-300 dark:bg-[#4f5d65] rounded-full appearance-none cursor-pointer accent-whatsapp-teal"
            style={{
               background: `linear-gradient(to right, #00a884 ${progress}%, #cbd5e1 ${progress}%)`
            }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-gray-500 dark:text-[#8696a0] pl-[36px]">
          <span>{displayTime}</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceMessagePlayer;
