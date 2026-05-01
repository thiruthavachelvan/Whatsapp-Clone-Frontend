import React from 'react';
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn, showTail, onToggleStar, showSenderName }) => {
  const timeString = message.createdAt 
    ? format(new Date(message.createdAt), 'h:mm a') 
    : format(new Date(), 'h:mm a');

  const senderName = message.senderId?.username || 'Unknown';

  return (
    <div 
      className={`flex flex-col mb-[2px] relative w-full ${isOwn ? 'items-end' : 'items-start'}`}
      onDoubleClick={() => onToggleStar && onToggleStar(message)}
    >
      <div 
        className={`max-w-[85%] sm:max-w-[70%] rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-sm sm:text-[14.2px] break-words shadow-sm flex relative transition-theme ${
          isOwn 
            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef]' 
            : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef]'
        } ${showTail ? (isOwn ? 'rounded-tr-none mt-1.5' : 'rounded-tl-none mt-1.5') : ''}`}
      >
        {/* Tail SVG ... */}
        {showTail && (
          <span 
            className={`absolute top-0 w-2 h-3.5 ${
              isOwn 
                ? '-right-2 text-[#d9fdd3] dark:text-[#005c4b]' 
                : '-left-2 text-white dark:text-[#202c33]'
            }`}
          >
            {isOwn ? (
              <svg viewBox="0 0 8 13" width="8" height="13" className="fill-current">
                <path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
                <path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z" />
              </svg>
            ) : (
              <svg viewBox="0 0 8 13" width="8" height="13" className="fill-current">
                <path opacity=".13" fill="#0000000" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
                <path fill="currentColor" d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z" />
              </svg>
            )}
          </span>
        )}
        
        <div className="flex flex-col w-full pr-10 min-w-0">
          {showSenderName && (
            <span className="text-[12.5px] font-bold mb-0.5 text-[#e542a3] dark:text-[#ff78c3]">
              {senderName}
            </span>
          )}
          <span dir="ltr" className="leading-[19px] whitespace-pre-wrap word-break">{message.text}</span>
          
          <div className="absolute bottom-[2px] right-1.5 flex items-center">
            {message.isStarred && (
              <svg viewBox="0 0 24 24" width="12" height="12" className="text-gray-400 dark:text-[#8696a0] mr-1 fill-current">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            )}
            <span className="text-[10px] tracking-tight whitespace-nowrap opacity-60">
              {timeString}
            </span>
            {isOwn && (
              <div className="ml-1 flex items-center mb-[1px]">
                {message.isRead ? (
                  /* Double Blue Ticks */
                  <div className="text-[#34b7f1] flex">
                    <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current">
                      <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                    </svg>
                  </div>
                ) : (
                  /* Single Gray Tick */
                  <div className="text-[#aebac1] flex">
                    <svg viewBox="0 0 16 15" width="12" height="15" className="fill-current">
                      <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L0.491 6.418a.365.365 0 0 0-.51.063l-.478.372a.366.366 0 0 0-.064.512l3.456 4.186a.32.32 0 0 0 .484.034l6.272-8.048a.365.365 0 0 0-.064-.512z" />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Transparent block to allow text to wrap properly around the timestamp */}
        <div className="h-[15px] opacity-0 ml-2 mt-[-5px]">
          {timeString}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
