import React from 'react';
import { format } from 'date-fns';
import { Pin, Trash, ChevronDown } from 'lucide-react';
import VoiceMessagePlayer from './VoiceMessagePlayer';

const renderTextWithLinks = (text) => {
  if (!text) return null;
  // Regex to find URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[#027eb5] dark:text-[#53bdeb] hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const MessageBubble = ({ message, isOwn, showTail, onToggleStar, showSenderName, currentUser, onDelete, onPin, onVote, onImageClick }) => {
  // Hide if deleted for current user
  if (message.deletedBy?.includes(currentUser?._id)) return null;

  const timeString = message.createdAt 
    ? format(new Date(message.createdAt), 'h:mm a') 
    : format(new Date(), 'h:mm a');

  const senderName = message.senderId?.username || 'Unknown';
  const isStarred = message.starredBy?.includes(currentUser?._id);
  const isPinned = message.pinnedBy === (currentUser?._id || message.senderId?._id); // Simple check for demo
  const isDeleted = message.isDeletedForEveryone;

  return (
    <div 
      className={`flex flex-col mb-[2px] relative w-full group ${isOwn ? 'items-end' : 'items-start'}`}
    >
      <div 
        className={`max-w-[85%] sm:max-w-[70%] rounded-lg ${message.type === 'image' || message.type === 'video' ? 'p-1' : 'px-2 sm:px-3 py-1 sm:py-1.5'} text-sm sm:text-[14.2px] break-words shadow-sm flex relative transition-theme ${
          isOwn 
            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef]' 
            : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef]'
        } ${showTail ? (isOwn ? 'rounded-tr-none mt-1.5' : 'rounded-tl-none mt-1.5') : ''} ${isDeleted ? 'italic opacity-60' : ''}`}
      >
        {/* Tail SVG */}
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
          {showSenderName && !isDeleted && (
            <span className="text-[12.5px] font-bold mb-0.5 text-[#e542a3] dark:text-[#ff78c3]">
              {senderName}
            </span>
          )}
          
          <div className="flex flex-col items-start">
            {isDeleted ? (
              <span className="flex items-center text-[#8696a0] italic">
                <Trash size={14} className="mr-2" />
                {isOwn ? 'You deleted this message' : 'This message was deleted'}
              </span>
            ) : (
              <>
                {message.type === 'audio' && (
                  <div className="mb-1 w-full max-w-[300px]" onDoubleClick={() => onImageClick?.()} title="Double-click to open in viewer">
                    <VoiceMessagePlayer 
                      mediaUrl={message.mediaUrl} 
                      senderName={senderName}
                      avatarColor={message.senderId?.avatarColor}
                      avatarLetter={message.senderId?.avatarLetter}
                    />
                  </div>
                )}
                {message.type === 'image' && (
                  <div
                    className="relative group/image cursor-pointer"
                    onClick={() => onImageClick?.()}
                  >
                    <img
                      src={message.mediaUrl}
                      alt={message.mediaName || 'image'}
                      className="w-[280px] max-w-full rounded-lg object-cover block"
                      style={{ maxHeight: '320px' }}
                    />
                    {/* Download overlay — stops propagation so it doesn't open lightbox */}
                    <a
                      href={message.mediaUrl}
                      download={message.mediaName || 'image'}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-black/70 z-10"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                      </svg>
                    </a>
                  </div>
                )}
                {message.type === 'video' && (
                  <div 
                    className="relative group/video cursor-pointer"
                    onClick={() => onImageClick?.()}
                  >
                    <video 
                      src={message.mediaUrl} 
                      className="w-[280px] max-w-full rounded-lg bg-black object-cover block"
                      style={{ maxHeight: '320px' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors rounded-lg">
                      <div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center text-white pl-1 shadow-md">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                {message.type === 'document' && (
                  <div className="mb-1 flex items-center bg-black/5 dark:bg-white/5 p-2 rounded-md w-full max-w-[250px]">
                    <div className="bg-red-500 text-white p-2 rounded-md mr-3">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="text-sm font-medium text-gray-800 dark:text-[#e9edef] truncate">{message.mediaName}</span>
                      <span className="text-xs text-gray-500">{(message.mediaSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <a href={message.mediaUrl} download={message.mediaName} className="ml-2 text-whatsapp-teal hover:underline p-1">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                         <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                      </svg>
                    </a>
                  </div>
                )}
                {message.type === 'poll' && message.poll && (
                  <div className="mb-1 w-full min-w-[240px] max-w-[300px] flex flex-col space-y-3 py-1">
                    <h3 className="font-semibold text-[15px] text-gray-800 dark:text-[#e9edef] leading-tight px-1">
                      {message.poll.question}
                    </h3>
                    <div className="space-y-2">
                      {message.poll.options?.map((opt, idx) => {
                        const totalVotes = message.poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);
                        const voteCount = opt.votes?.length || 0;
                        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                        const hasVoted = opt.votes?.includes(currentUser?._id);

                        // Temp messages haven't been persisted yet — block voting until real ID exists
                        const isTempMessage = message._id?.startsWith?.('temp_');
                        return (
                          <div 
                            key={idx} 
                            className={`relative group/opt ${isTempMessage ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                            onClick={() => {
                              if (isTempMessage) return; // silently block — message still saving
                              onVote?.(message._id, idx);
                            }}
                          >
                            {/* Progress bar background */}
                            <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 rounded-full ${hasVoted ? 'bg-whatsapp-teal/30 dark:bg-whatsapp-teal/40' : 'bg-gray-300 dark:bg-gray-600/50'}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            {/* Content */}
                            <div className="relative flex items-center justify-between px-3 py-1.5 min-h-[36px]">
                              <div className="flex items-center space-x-2 min-w-0">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${hasVoted ? 'bg-whatsapp-teal border-whatsapp-teal' : 'border-gray-400 dark:border-gray-500'}`}>
                                  {hasVoted && (
                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-[13.5px] truncate ${hasVoted ? 'font-medium' : ''}`}>
                                  {opt.text}
                                </span>
                              </div>
                              <span className="text-[11px] font-medium text-gray-500 dark:text-[#8696a0] ml-2 flex-shrink-0">
                                {voteCount > 0 && voteCount}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-[11px] text-[#8696a0] px-1 pt-1 flex justify-between items-center border-t border-black/5 dark:border-white/5 mt-1">
                      <span>{message.poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0)} votes</span>
                      <button className="text-whatsapp-teal hover:underline font-medium">View votes</button>
                    </div>
                  </div>
                )}
                {message.text && message.type !== 'poll' && (
                  <span dir="ltr" className="leading-[19px] whitespace-pre-wrap word-break">
                    {renderTextWithLinks(message.text)}
                  </span>
                )}
              </>
            )}
          </div>
          
          <div className="absolute bottom-[2px] right-1.5 flex items-center space-x-1">
            {isPinned && <Pin size={12} className="text-gray-400 dark:text-[#8696a0] rotate-45" />}
            {isStarred && (
              <svg viewBox="0 0 24 24" width="12" height="12" className="text-gray-400 dark:text-[#8696a0] fill-current">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            )}
            <span className="text-[10px] tracking-tight whitespace-nowrap opacity-60">
              {timeString}
            </span>
            {isOwn && !isDeleted && (
              <div className="ml-1 flex items-center mb-[1px]">
                {message.isRead ? (
                  <div className="text-[#34b7f1] flex">
                    <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current">
                      <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                    </svg>
                  </div>
                ) : (
                  <div className="text-[#aebac1] flex">
                    <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current">
                      <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L0.491 6.418a.365.365 0 0 0-.51.063l-.478.372a.366.366 0 0 0-.064.512l3.456 4.186a.32.32 0 0 0 .484.034l6.272-8.048a.365.365 0 0 0-.064-.512z" />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Dropdown Menu Arrow on Hover */}
        {!isDeleted && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // We'll use a simple native context menu or similar for demo
                // but let's just trigger onDelete/onPin directly if needed
                onDelete();
              }}
              className="p-1 hover:bg-black/10 rounded-full"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        )}

        <div className="h-[15px] opacity-0 ml-2 mt-[-5px]">
          {timeString}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
