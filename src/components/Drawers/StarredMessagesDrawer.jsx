import React, { useState, useEffect } from 'react';
import Drawer from './Drawer';
import { fetchStarredMessages, toggleStarMessage } from '../../services/api';
import { format } from 'date-fns';
import { Image, Video, FileText, Headphones, BarChart2, Star } from 'lucide-react';

const StarredMessagesDrawer = ({ isOpen, onClose, currentUser, onSelectChat, onSelectMessage, users, groups }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadStarred = async () => {
    setLoading(true);
    try {
      const data = await fetchStarredMessages(currentUser._id);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load starred messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?._id) {
      loadStarred();
    }
  }, [isOpen, currentUser._id]);

  const handleMessageClick = (msg) => {
    // 1. Find the target chat object
    let targetChat = null;
    if (msg.groupId) {
      targetChat = groups.find(g => g._id === (msg.groupId._id || msg.groupId));
      if (targetChat) targetChat = { ...targetChat, type: 'group' };
    } else {
      const otherUserId = msg.senderId?._id === currentUser._id ? msg.receiverId?._id : msg.senderId?._id;
      targetChat = users.find(u => u._id === otherUserId);
      if (targetChat) targetChat = { ...targetChat, type: 'user' };
    }

    if (targetChat) {
      // 2. Select the chat
      onSelectChat(targetChat);
      // 3. Close drawer
      onClose();
      // 4. Highlight the message (wait a bit for chat to load)
      setTimeout(() => {
        onSelectMessage(msg._id);
      }, 500);
    }
  };

  const handleUnstar = async (e, msgId) => {
    e.stopPropagation();
    try {
      await toggleStarMessage(msgId, currentUser._id);
      setMessages(prev => prev.filter(m => m._id !== msgId));
    } catch (error) {
      console.error("Failed to unstar:", error);
    }
  };

  const renderMediaPreview = (msg) => {
    switch (msg.type) {
      case 'image':
        return (
          <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden bg-gray-100 dark:bg-[#182229]">
            <img src={msg.mediaUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-black/50 p-1 rounded">
              <Image size={14} className="text-white" />
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden bg-black flex items-center justify-center">
            <video src={msg.mediaUrl} className="w-full h-full object-cover opacity-60" />
            <Video size={24} className="text-white absolute" />
          </div>
        );
      case 'document':
        return (
          <div className="mt-2 flex items-center p-2 bg-gray-50 dark:bg-[#182229] rounded border border-gray-100 dark:border-white/5">
            <div className="p-2 bg-red-500 rounded mr-3 text-white">
              <FileText size={16} />
            </div>
            <span className="text-xs text-gray-700 dark:text-[#d1d7db] truncate">{msg.mediaName}</span>
          </div>
        );
      case 'audio':
        return (
          <div className="mt-2 flex items-center p-2 bg-orange-50 dark:bg-orange-900/10 rounded border border-orange-100 dark:border-orange-900/20">
            <div className="p-2 bg-orange-500 rounded mr-3 text-white">
              <Headphones size={16} />
            </div>
            <span className="text-xs text-orange-700 dark:text-orange-400">Audio message</span>
          </div>
        );
      case 'poll':
        return (
          <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded border border-emerald-100 dark:border-emerald-900/20">
            <div className="flex items-center text-emerald-700 dark:text-emerald-400 mb-1">
              <BarChart2 size={16} className="mr-2" />
              <span className="text-xs font-semibold">Poll</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-[#8696a0] truncate">{msg.poll?.question}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Starred Messages">
      <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#111b21]">
        {loading ? (
          <div className="flex justify-center items-center py-10 text-gray-400 text-sm">
            Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="w-20 h-20 bg-gray-200 dark:bg-[#202c33] rounded-full flex items-center justify-center mb-4">
              <Star size={30} className="text-gray-400 fill-current" />
            </div>
            <p className="text-gray-500 dark:text-[#8696a0] text-sm">No starred messages</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {messages.map((msg) => {
              const msgSenderId = msg.senderId?._id || msg.senderId;
              const isOwn = msgSenderId === currentUser?._id;
              const senderName = msg.senderId?.username || 'Unknown';
              const chatName = msg.groupId ? (msg.groupId.name || 'Group') : (isOwn ? msg.receiverId?.username : senderName);
              
              return (
                <div 
                  key={msg._id} 
                  onClick={() => handleMessageClick(msg)}
                  className="bg-white dark:bg-[#222d34] rounded-lg p-3 shadow-sm relative group cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a3942] transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] font-bold text-whatsapp-teal truncate">
                        {isOwn ? 'You' : senderName} {msg.groupId ? `@ ${chatName}` : ''}
                      </span>
                      {!msg.groupId && (
                        <span className="text-[9px] text-gray-400">
                          {isOwn ? `To ${msg.receiverId?.username || 'User'}` : 'Private Chat'}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 whitespace-nowrap ml-2">
                      {msg.createdAt ? format(new Date(msg.createdAt), 'MMM d, h:mm a') : 'Recently'}
                    </span>
                  </div>

                  {msg.text && (
                    <p className="text-sm text-gray-800 dark:text-[#e9edef] line-clamp-3 leading-relaxed">
                      {msg.text}
                    </p>
                  )}
                  
                  {renderMediaPreview(msg)}

                  <button 
                    onClick={(e) => handleUnstar(e, msg._id)}
                    className="absolute bottom-2 right-2 p-1.5 bg-gray-100 dark:bg-[#182229] rounded-full text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-[#2a3942]"
                    title="Unstar"
                  >
                    <Star size={14} fill="currentColor" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default StarredMessagesDrawer;
