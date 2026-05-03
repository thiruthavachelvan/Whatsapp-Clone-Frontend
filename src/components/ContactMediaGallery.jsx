import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  ExternalLink, 
  Video, 
  Headphones, 
  Play,
  Download,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { format, isSameMonth } from 'date-fns';

const ContactMediaGallery = ({ messages, currentUser, onClose, onMediaClick, onToggleStar }) => {
  const [activeTab, setActiveTab] = useState('Media'); // Media, Docs, Links

  const tabs = ['Media', 'Docs', 'Links'];

  // 1. Extract and Categorize
  const mediaMsgs = messages.filter(m => m.type === 'image' || m.type === 'video' || m.type === 'audio');
  const docMsgs = messages.filter(m => m.type === 'document');
  
  // Extract links from all text messages
  const linkMsgs = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  messages.forEach(m => {
    if (m.text) {
      const matches = m.text.match(urlRegex);
      if (matches) {
        matches.forEach(url => {
          linkMsgs.push({
            url,
            createdAt: m.createdAt,
            _id: `${m._id}-${url}`
          });
        });
      }
    }
  });

  // 2. Grouping Logic (only for Media tab)
  const groupMediaByMonth = (msgs) => {
    const groups = {};
    const sorted = [...msgs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    sorted.forEach(m => {
      const date = new Date(m.createdAt || Date.now());
      const now = new Date();
      let groupName = format(date, 'MMMM').toUpperCase();
      
      if (isSameMonth(date, now)) {
        groupName = 'THIS MONTH';
      }
      
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(m);
    });
    return groups;
  };

  const mediaGroups = groupMediaByMonth(mediaMsgs);

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a] animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-4 flex items-center flex-shrink-0 border-b border-gray-200 dark:border-white/5">
        <button onClick={onClose} className="text-gray-500 dark:text-[#aebac1] hover:bg-gray-200 dark:hover:bg-[#374248] p-2 rounded-full mr-4 transition-colors">
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-white/5">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-medium transition-all relative ${
              activeTab === tab 
                ? 'text-whatsapp-teal' 
                : 'text-gray-500 dark:text-[#8696a0] hover:text-gray-700 dark:hover:text-[#d1d7db]'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-whatsapp-teal"></div>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        {activeTab === 'Media' && (
          <div className="flex flex-col">
            {Object.keys(mediaGroups).length > 0 ? (
              Object.entries(mediaGroups).map(([month, msgs]) => (
                <div key={month} className="mb-6">
                  <h3 className="px-4 py-4 text-[13px] text-gray-500 dark:text-[#8696a0] font-medium">{month}</h3>
                  <div className="grid grid-cols-3 gap-1 px-1">
                    {msgs.map((m, i) => (
                      <div 
                        key={m._id || i} 
                        className="aspect-square bg-gray-200 dark:bg-[#202c33] relative group cursor-pointer hover:opacity-90 overflow-hidden"
                        onClick={() => onMediaClick(m)}
                      >
                        {m.type === 'image' && (
                          <img src={m.mediaUrl} alt="" className="w-full h-full object-cover" />
                        )}
                        {m.type === 'video' && (
                          <div className="w-full h-full relative">
                            <video src={m.mediaUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex items-end p-1.5">
                              <Video size={14} className="text-white" />
                              <span className="text-white text-[10px] ml-1">0:05</span>
                            </div>
                          </div>
                        )}
                        {m.type === 'audio' && (
                          <div className="w-full h-full bg-[#ff8f00]/20 flex flex-col items-center justify-center">
                            <Headphones size={24} className="text-[#ff8f00]" />
                            <div className="absolute bottom-1.5 left-1.5 flex items-center">
                               <Headphones size={12} className="text-[#ff8f00] mr-1" />
                               <span className="text-[#ff8f00] text-[10px]">0:15</span>
                            </div>
                          </div>
                        )}
                        {/* Star indicator */}
                        {m.starredBy?.includes(currentUser?._id) && (
                          <div className="absolute top-1.5 right-1.5 text-yellow-400 drop-shadow-md">
                            <Star size={14} fill="currentColor" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-[#8696a0]">
                <ImageIcon size={48} className="mb-2 opacity-20" />
                <p className="text-sm">No media found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Docs' && (
          <div className="flex flex-col">
            {docMsgs.length > 0 ? (
              docMsgs.map((m, i) => (
                <div key={m._id || i} className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#182229] cursor-pointer border-b border-gray-100 dark:border-white/5 group">
                  <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center text-white mr-4">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#e9edef] text-sm font-normal truncate">{m.mediaName || 'Document'}</p>
                    <p className="text-[#8696a0] text-xs mt-0.5">
                      {Math.round((m.mediaSize || 0) / 1024)} KB • {format(new Date(m.createdAt), 'dd/MM/yy')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleStar(m); }}
                      className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 ${m.starredBy?.includes(currentUser?._id) ? 'text-yellow-400' : 'text-[#8696a0]'}`}
                    >
                      <Star size={18} fill={m.starredBy?.includes(currentUser?._id) ? "currentColor" : "none"} />
                    </button>
                    <button className="text-[#8696a0] p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-[#8696a0]">
                <FileText size={48} className="mb-2 opacity-20" />
                <p className="text-sm">No documents found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Links' && (
          <div className="flex flex-col">
            {linkMsgs.length > 0 ? (
              linkMsgs.map((link, i) => (
                <a 
                  key={link._id || i} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-4 hover:bg-gray-100 dark:hover:bg-[#182229] cursor-pointer border-b border-gray-100 dark:border-white/5"
                >
                  <div className="w-10 h-10 bg-[#00a884]/10 rounded flex items-center justify-center text-whatsapp-teal mr-4">
                    <ExternalLink size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-whatsapp-teal text-sm font-normal truncate hover:underline">{link.url}</p>
                    <p className="text-[#8696a0] text-xs mt-0.5">
                      {format(new Date(link.createdAt), 'dd/MM/yy')}
                    </p>
                  </div>
                </a>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-[#8696a0]">
                <ExternalLink size={48} className="mb-2 opacity-20" />
                <p className="text-sm">No links found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white dark:bg-[#111b21] flex items-center justify-center border-t border-gray-200 dark:border-white/5">
        <button className="flex items-center text-whatsapp-teal text-sm font-medium hover:opacity-80 transition-opacity">
           <ImageIcon size={18} className="mr-3" />
           View media from all chats
        </button>
      </div>
    </div>
  );
};

export default ContactMediaGallery;
