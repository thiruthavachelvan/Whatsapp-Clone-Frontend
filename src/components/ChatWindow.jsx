import React, { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send, ArrowLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ currentUser, selectedUser, messages, onSendMessage, onBack, loading }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2] relative w-full">
      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] px-4 py-2 flex justify-between items-center border-b border-gray-200 z-10 w-full relative">
        <div className="flex items-center flex-1 overflow-hidden">
          <button 
            onClick={onBack}
            className="mr-2 md:hidden hover:bg-gray-200 p-2 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          
          <div className="relative flex-shrink-0 cursor-pointer">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: selectedUser.avatarColor || '#9ca3af' }}
            >
              {selectedUser.avatarLetter || selectedUser.username.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="ml-4 cursor-pointer truncate">
            <h2 className="font-normal text-gray-900 text-base">{selectedUser.username}</h2>
            <p className="text-xs text-gray-500 truncate">click here for contact info</p>
          </div>
        </div>
        
        <div className="flex space-x-3 text-gray-500 pl-2">
          <button className="hover:bg-gray-200 p-2 rounded-full transition-colors hidden sm:block">
            <Search size={20} />
          </button>
          <button className="hover:bg-gray-200 p-2 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:px-[6%] lg:px-[8%] bg-chat-pattern w-full relative custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="bg-white/80 px-4 py-2 rounded-full text-sm shadow-sm text-gray-500">
              Loading chat history...
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 w-full relative z-10">
            {messages.length === 0 ? (
              <div className="flex justify-center my-4">
                <div className="bg-[#ffeecd] px-4 py-2 rounded-lg text-xs text-gray-600 shadow-sm text-center max-w-[90%]">
                  <span className="block mb-1">🔒 Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp Clone, can read or listen to them.</span>
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwn = message.senderId === currentUser._id;
                // Add tail to message bubble if it's the first in a group
                let showTail = true;
                if (index > 0 && messages[index - 1].senderId === message.senderId) {
                  showTail = false;
                }
                
                return (
                  <MessageBubble 
                    key={message._id || index} 
                    message={message} 
                    isOwn={isOwn} 
                    showTail={showTail}
                  />
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] px-4 py-3 flex items-center min-h-[62px] w-full relative z-10">
        <div className="flex space-x-2 mr-2">
          <button className="text-gray-500 hover:text-gray-700 transition-colors p-2 hidden sm:block">
            <Smile size={24} />
          </button>
          <button className="text-gray-500 hover:text-gray-700 transition-colors p-2">
            <Paperclip size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex bg-white rounded-lg px-2 sm:px-4 py-0 items-center overflow-hidden h-[42px] border border-transparent focus-within:border-white">
          <input
            type="text"
            className="w-full bg-transparent outline-none py-2 text-sm text-gray-700"
            placeholder="Type a message"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </form>
        
        <div className="ml-2 flex items-center">
          {inputText.trim() ? (
            <button 
              onClick={handleSubmit} 
              className="text-gray-500 hover:text-whatsapp-teal transition-colors p-2 bg-[#f0f2f5] rounded-full"
            >
              <Send size={24} />
            </button>
          ) : (
            <button className="text-gray-500 hover:text-gray-700 transition-colors p-2 hidden sm:block">
              <Mic size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
