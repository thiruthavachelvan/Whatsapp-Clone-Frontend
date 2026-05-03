import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  MoreVertical,
  Star,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import MessageBubble from './MessageBubble';

const ContactStarredMessages = ({ messages, currentUser, onClose, onToggleStar }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter starred messages for the current user in this chat
  const starredMessages = messages.filter(m => 
    m.starredBy?.includes(currentUser._id) &&
    (searchQuery === '' || m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a] animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-4 flex items-center flex-shrink-0 border-b border-gray-200 dark:border-white/5">
        <button onClick={onClose} className="text-gray-500 dark:text-[#aebac1] hover:bg-gray-200 dark:hover:bg-[#374248] p-2 rounded-full mr-4 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-[#e9edef] font-medium flex-1">Starred messages</h2>
        <button className="text-gray-500 dark:text-[#aebac1] p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#374248]">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2 bg-white dark:bg-[#111b21]">
        <div className="relative flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5 focus-within:bg-white dark:focus-within:bg-[#2a3942] transition-colors">
          <Search size={18} className="text-gray-500 dark:text-[#8696a0] mr-3" />
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 dark:text-[#d1d7db] placeholder:text-gray-500 dark:placeholder:text-[#8696a0]"
          />
        </div>
      </div>

      {/* Starred Messages List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-chat-pattern bg-[#efeae2] dark:bg-[#0b141a] relative">
         <div className="absolute inset-0 bg-chat-pattern opacity-[0.06] dark:opacity-[0.04] pointer-events-none"></div>
         
         <div className="relative z-10 px-4 py-4 space-y-4">
            {starredMessages.length > 0 ? (
              starredMessages.map((m, i) => {
                const isOwn = m.senderId?._id === currentUser._id || m.senderId === currentUser._id;
                return (
                  <div key={m._id || i} className="flex flex-col">
                    <div className="flex items-center justify-between mb-1 px-1">
                       <span className="text-[11px] text-gray-500 dark:text-[#8696a0]">
                          {format(new Date(m.createdAt), 'dd/MM/yyyy')}
                       </span>
                       <ChevronRight size={14} className="text-gray-400" />
                    </div>
                    <MessageBubble 
                      message={m}
                      isOwn={isOwn}
                      showTail={true}
                      onToggleStar={onToggleStar}
                      currentUser={currentUser}
                      onDelete={() => {}} // Not editable from here
                      onPin={() => {}}
                    />
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-gray-500 dark:text-[#8696a0] text-center px-10">
                <div className="w-20 h-20 bg-gray-200/50 dark:bg-[#202c33] rounded-full flex items-center justify-center mb-4">
                  <Star size={40} className="opacity-20" />
                </div>
                <p className="text-sm">No starred messages found in this chat.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ContactStarredMessages;
