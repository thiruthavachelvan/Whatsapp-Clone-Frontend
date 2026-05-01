import React, { useState, useEffect } from 'react';
import Drawer from './Drawer';
import { fetchStarredMessages } from '../../services/api';
import { format } from 'date-fns';

const StarredMessagesDrawer = ({ isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser?._id) {
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
      loadStarred();
    }
  }, [isOpen, currentUser._id]);

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
              <svg viewBox="0 0 24 24" width="30" height="30" className="text-gray-400 fill-current">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-[#8696a0] text-sm">No starred messages</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {messages.map((msg) => {
              const msgSenderId = msg.senderId?._id || msg.senderId;
              const isOwn = msgSenderId === currentUser._id;
              
              const senderName = msg.senderId?.username || 'Unknown';
              const receiverName = msg.receiverId?.username || 'User';
              
              return (
                <div key={msg._id} className="bg-white dark:bg-[#222d34] mb-1 px-4 py-3 border-b border-gray-100 dark:border-[#2a3942] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] transition-colors">
                   <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold text-whatsapp-teal truncate max-w-[150px]">
                        {isOwn ? 'You' : senderName} 
                        {msg.groupId ? ` @ ${msg.groupId.name || 'Group'}` : ` → ${isOwn ? receiverName : 'You'}`}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {msg.createdAt ? format(new Date(msg.createdAt), 'MMM d, h:mm a') : 'Recently'}
                      </span>
                   </div>
                   <p className="text-sm text-gray-800 dark:text-[#e9edef] line-clamp-3">{msg.text}</p>
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
