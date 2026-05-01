import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Video, 
  Search, 
  ChevronRight, 
  Star, 
  BellOff, 
  Clock, 
  Heart, 
  List, 
  Ban, 
  ThumbsDown, 
  Trash,
  Info,
  CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';

const ContactInfo = ({ chat, currentUser, onClose, onClearChat, onDeleteChat, onBlockUser, onReportUser, onMuteChat, onOpenSearch, onSelectMessages, messages = [] }) => {
  const [showMuteModal, setShowMuteModal] = useState(false);
  const isGroup = chat.type === 'group';

  // Check current mute status
  const currentMute = currentUser.mutedChats?.find(m => m.chatId === chat._id);
  const isCurrentlyMuted = currentMute && new Date(currentMute.mutedUntil) > new Date();

  const muteOptions = [
    { label: '8 Hours', value: 8 },
    { label: '1 Week', value: 168 },
    { label: 'Always', value: -1 },
  ];

  // In a real app, we would filter media from messages
  const mediaMessages = messages.filter(m => m.type === 'image' || m.type === 'video');
  const mediaCount = mediaMessages.length;

  return (
    <div className="w-full md:w-[350px] lg:w-[400px] h-full bg-white dark:bg-[#111b21] border-l border-gray-200 dark:border-white/5 flex flex-col z-20 animate-slide-in-right relative">
      
      {/* Mute Modal Overlay */}
      {showMuteModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/50">
          <div className="bg-white dark:bg-[#3b4a54] w-full max-w-xs rounded-sm shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-gray-800 dark:text-[#e9edef] text-lg mb-4">Mute notifications</h3>
            <div className="space-y-4 mb-6">
              {muteOptions.map((opt) => {
                const isSelected = currentMute && (
                  opt.value === -1 
                    ? new Date(currentMute.mutedUntil).getFullYear() > new Date().getFullYear() + 50
                    : Math.abs(Math.round((new Date(currentMute.mutedUntil) - new Date()) / 3600000) - opt.value) <= 1
                );
                return (
                  <label key={opt.value} className="flex items-center cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="mute" 
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#8696a0] checked:border-whatsapp-green transition-all"
                        checked={isSelected}
                        onChange={() => onMuteChat(opt.value)}
                      />
                      <div className="absolute h-3 w-3 rounded-full bg-whatsapp-green opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="ml-4 text-gray-700 dark:text-[#d1d7db]">{opt.label}</span>
                  </label>
                );
              })}
              {isCurrentlyMuted && (
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="mute" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#8696a0] checked:border-whatsapp-green transition-all"
                      onChange={() => onMuteChat(0)}
                    />
                    <div className="absolute h-3 w-3 rounded-full bg-whatsapp-green opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="ml-4 text-gray-700 dark:text-[#d1d7db]">Unmute</span>
                </label>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowMuteModal(false)}
                className="text-whatsapp-teal text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 px-4 py-2 rounded transition-colors uppercase"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowMuteModal(false)}
                className="bg-whatsapp-green text-white text-sm font-medium px-6 py-2 rounded shadow-sm hover:bg-opacity-90 transition-colors uppercase"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-4 flex items-center border-b border-gray-200 dark:border-white/5">
        <button onClick={onClose} className="text-gray-500 dark:text-[#aebac1] hover:bg-gray-200 dark:hover:bg-[#374248] p-2 rounded-full mr-4">
          <X size={24} />
        </button>
        <h1 className="text-gray-800 dark:text-[#e9edef] font-medium">{isGroup ? 'Group info' : 'Contact info'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f0f2f5] dark:bg-[#0b141a]">
        {/* Profile Section */}
        <div className="bg-white dark:bg-[#111b21] py-7 px-4 flex flex-col items-center mb-2 shadow-sm">
          <div 
            className="w-48 h-48 rounded-full flex items-center justify-center text-white text-6xl font-bold mb-4 shadow-sm overflow-hidden"
            style={{ backgroundColor: chat.avatarColor || (isGroup ? '#00a884' : '#9ca3af') }}
          >
            {chat.profilePic ? (
              <img src={chat.profilePic} alt={chat.username} className="w-full h-full object-cover" />
            ) : (
              isGroup ? <Info size={80} /> : (chat.avatarLetter || chat.username?.charAt(0).toUpperCase())
            )}
          </div>
          <h2 className="text-xl text-gray-900 dark:text-[#e9edef] mb-1 font-normal">{isGroup ? chat.name : chat.username}</h2>
          {!isGroup && (
            <p className="text-[#8696a0] text-sm mb-4">{chat.email || '+91 12345 67890'}</p>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-8 mt-2">
            <div className="flex flex-col items-center space-y-2 cursor-pointer group">
              <div className="w-10 h-10 border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-whatsapp-teal group-hover:bg-[#f0f2f5] dark:group-hover:bg-[#202c33] transition-colors">
                <Phone size={20} />
              </div>
              <span className="text-xs text-whatsapp-teal">Audio</span>
            </div>
            <div className="flex flex-col items-center space-y-2 cursor-pointer group">
              <div className="w-10 h-10 border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-whatsapp-teal group-hover:bg-[#f0f2f5] dark:group-hover:bg-[#202c33] transition-colors">
                <Video size={20} />
              </div>
              <span className="text-xs text-whatsapp-teal">Video</span>
            </div>
            <div 
              onClick={onOpenSearch}
              className="flex flex-col items-center space-y-2 cursor-pointer group"
            >
              <div className="w-10 h-10 border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-whatsapp-teal group-hover:bg-[#f0f2f5] dark:group-hover:bg-[#202c33] transition-colors">
                <Search size={20} />
              </div>
              <span className="text-xs text-whatsapp-teal">Search</span>
            </div>
          </div>
        </div>

        {/* About / Group Description */}
        <div className="bg-white dark:bg-[#111b21] px-6 py-4 mb-2 shadow-sm">
          <h3 className="text-sm text-[#8696a0] mb-2">{isGroup ? 'Group description' : 'About'}</h3>
          <p className="text-gray-900 dark:text-[#e9edef] text-[15px]">{chat.about || 'Hey there! I am using WhatsApp.'}</p>
          {!isGroup && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <p className="text-xs text-[#8696a0]">{format(new Date(chat.createdAt || Date.now()), 'MMMM d, yyyy')}</p>
            </div>
          )}
        </div>

        {/* Media, links and docs */}
        <div className="bg-white dark:bg-[#111b21] px-6 py-4 mb-2 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[#8696a0]">Media, links and docs</span>
            <div className="flex items-center text-[#8696a0]">
              <span className="text-sm mr-2">{mediaCount}</span>
              <ChevronRight size={18} />
            </div>
          </div>
          {mediaCount > 0 ? (
            <div className="flex space-x-2 overflow-x-hidden">
               {mediaMessages.slice(0, 3).map((m, i) => (
                 <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-[#202c33] rounded-sm overflow-hidden">
                   {/* Placeholder for actual image/video thumbnail */}
                   <div className="w-full h-full flex items-center justify-center text-gray-400">
                     {m.type === 'image' ? 'IMG' : 'VID'}
                   </div>
                 </div>
               ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-[#8696a0] py-2">No media present</p>
          )}
        </div>

        {/* Settings List */}
        <div className="bg-white dark:bg-[#111b21] mb-2 shadow-sm">
          <div className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors">
            <Star size={20} className="text-[#8696a0] mr-6" />
            <span className="flex-1 text-gray-900 dark:text-[#e9edef]">Starred messages</span>
            <ChevronRight size={18} className="text-[#8696a0]" />
          </div>

          <div 
            onClick={onSelectMessages}
            className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors border-t border-gray-100 dark:border-white/5"
          >
            <CheckSquare size={20} className="text-[#8696a0] mr-6" />
            <span className="flex-1 text-gray-900 dark:text-[#e9edef]">Select messages</span>
          </div>
          
          <div 
            onClick={() => setShowMuteModal(true)}
            className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors border-t border-gray-100 dark:border-white/5"
          >
            <BellOff size={20} className="text-[#8696a0] mr-6" />
            <div className="flex-1">
              <p className="text-gray-900 dark:text-[#e9edef]">Mute notifications</p>
              {isCurrentlyMuted && (
                <p className="text-xs text-whatsapp-teal">Muted until {new Date(currentMute.mutedUntil).toLocaleTimeString()}</p>
              )}
            </div>
            <ChevronRight size={18} className="text-[#8696a0]" />
          </div>
        </div>

        {/* Action List */}
        <div className="bg-white dark:bg-[#111b21] mb-20 shadow-sm">
          <div 
            onClick={onClearChat}
            className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors text-[#f15c6d]"
          >
            <Ban size={20} className="mr-6" />
            <span className="flex-1">Clear chat</span>
          </div>
          
          {!isGroup && (
            <>
              <div 
                onClick={onBlockUser}
                className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors text-[#f15c6d] border-t border-gray-100 dark:border-white/5"
              >
                <Ban size={20} className="mr-6" />
                <span className="flex-1">{currentUser.blockedUsers?.includes(chat._id) ? 'Unblock' : 'Block'} {chat.username}</span>
              </div>
              <div 
                onClick={onReportUser}
                className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors text-[#f15c6d] border-t border-gray-100 dark:border-white/5"
              >
                <ThumbsDown size={20} className="mr-6" />
                <span className="flex-1">Report {chat.username}</span>
              </div>
            </>
          )}
          
          <div 
            onClick={onDeleteChat}
            className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors text-[#f15c6d] border-t border-gray-100 dark:border-white/5"
          >
            <Trash size={20} className="mr-6" />
            <span className="flex-1">Delete chat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
