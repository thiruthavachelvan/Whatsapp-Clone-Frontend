import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const MediaPreviewModal = ({ fileUrl, fileType, fileName, onSend, onClose }) => {
  const [caption, setCaption] = useState('');

  return (
    <div className="fixed inset-0 z-[100] bg-[#e9edef] dark:bg-[#111b21] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="h-16 flex items-center px-6">
        <button onClick={onClose} className="text-gray-600 dark:text-[#aebac1] hover:text-gray-800 dark:hover:text-[#d1d7db] transition-colors p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
          <X size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 min-h-0 bg-transparent">
        {fileType === 'image' ? (
          <img src={fileUrl} alt={fileName} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
        ) : (
          <video controls src={fileUrl} className="max-h-full max-w-full drop-shadow-2xl" />
        )}
      </div>

      {/* Footer / Input Area */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-4 flex items-center justify-center w-full min-h-[80px]">
        <div className="flex w-full max-w-2xl items-center gap-4 relative">
          <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg px-4 py-1.5 flex items-center min-h-[50px] shadow-sm">
             <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Type a message"
                className="w-full bg-transparent outline-none text-gray-800 dark:text-[#d1d7db]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSend(caption);
                  }
                }}
             />
          </div>
          
          <button 
            onClick={() => onSend(caption)}
            className="bg-whatsapp-teal text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-[#00a884] transition-colors flex-shrink-0"
          >
            <Send size={24} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewModal;
