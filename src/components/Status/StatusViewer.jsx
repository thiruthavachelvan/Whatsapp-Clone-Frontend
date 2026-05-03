import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { viewStatus } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const StatusViewer = ({ group, currentUser, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const currentStatus = group.statuses[currentIndex];

  useEffect(() => {
    // Record view
    if (currentStatus && currentUser) {
      viewStatus(currentStatus._id, currentUser._id).catch(console.error);
    }
  }, [currentIndex, currentStatus?._id, currentUser?._id]);

  useEffect(() => {
    const duration = 5000; // 5 seconds per status
    const interval = 50; // Update progress every 50ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < group.statuses.length - 1) {
            setCurrentIndex(curr => curr + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, group.statuses.length, onClose]);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < group.statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const [showViewers, setShowViewers] = useState(false);
  const viewers = currentStatus?.views || [];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      {/* Progress Bars ... (lines 53-64) */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {group.statuses.map((_, idx) => (
          <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-50"
              style={{ 
                width: idx < currentIndex ? '100%' : (idx === currentIndex ? `${progress}%` : '0%') 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header ... (lines 67-88) */}
      <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/20">
            {group.user.profilePic ? (
              <img src={group.user.profilePic} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white">
                {group.user.avatarLetter || group.user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-white">
            <p className="font-medium">{group.user.username}</p>
            <p className="text-xs opacity-70">
              {new Date(currentStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-white opacity-70 hover:opacity-100 transition-opacity">
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/4 z-20 cursor-pointer" onClick={handlePrev} />
        <div className="absolute inset-y-0 right-0 w-1/4 z-20 cursor-pointer" onClick={handleNext} />
        
        {currentStatus.type === 'video' ? (
          <video 
            src={currentStatus.mediaUrl} 
            className="max-h-full max-w-full object-contain" 
            autoPlay 
            muted 
            playsInline
          />
        ) : (
          <img 
            src={currentStatus.mediaUrl} 
            className="max-h-full max-w-full object-contain" 
            alt="" 
          />
        )}
        
        {currentStatus.text && (
          <div className="absolute bottom-24 left-0 right-0 p-8 text-center text-white text-lg bg-gradient-to-t from-black/60 to-transparent">
            {currentStatus.text}
          </div>
        )}

        {/* Viewers list at the bottom */}
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center text-white z-30">
          <button 
            onClick={() => setShowViewers(!showViewers)}
            className="flex items-center space-x-2 bg-black/60 hover:bg-black/80 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10 transition-all active:scale-95"
          >
            <Eye size={14} className={showViewers ? "text-whatsapp-teal" : "opacity-70"} />
            <span className="text-xs font-medium">{viewers.length} {viewers.length === 1 ? 'view' : 'views'}</span>
          </button>
          
          {showViewers && viewers.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1 max-w-[80%] max-h-32 overflow-y-auto custom-scrollbar p-2 bg-black/40 rounded-lg backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-300">
              {viewers.map((view, i) => (
                <div key={i} className="text-[10px] bg-white/10 px-2 py-1 rounded-full flex items-center space-x-2">
                  {view.userId?.profilePic && <img src={view.userId.profilePic} className="w-3 h-3 rounded-full object-cover" alt="" />}
                  <span className="font-semibold">{view.userId?.username || 'User'}</span>
                  <span className="opacity-50">•</span>
                  <span className="opacity-70">{formatDistanceToNow(new Date(view.viewedAt))} ago</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls (Desktop) */}
      <button 
        onClick={handlePrev}
        className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hidden md:block ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hidden md:block"
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
};

export default StatusViewer;
