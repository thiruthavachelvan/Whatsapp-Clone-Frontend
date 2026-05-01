import React from 'react';
import { ArrowLeft } from 'lucide-react';

const Drawer = ({ isOpen, onClose, title, children }) => {
  return (
    <div 
      className={`absolute inset-0 z-50 bg-[#f0f2f5] dark:bg-[#111b21] transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="h-28 bg-whatsapp-teal dark:bg-[#202c33] flex items-end px-5 pb-5 text-white">
        <div className="flex items-center space-x-6">
          <button 
            onClick={onClose}
            className="hover:bg-black/10 p-1 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold tracking-wide">{title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-112px)] overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
};

export default Drawer;
