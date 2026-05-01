import React, { useState, useEffect } from 'react';
import { X, Search, Calendar, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { searchInChat } from '../../services/api';

const SearchInChatDrawer = ({ isOpen, onClose, chat, currentUser, onSelectMessage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setLoading(true);
        try {
          const isGroup = chat.type === 'group';
          const data = await searchInChat(currentUser._id, chat._id, searchTerm, isGroup);
          setResults(data);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, chat._id, currentUser._id]);

  if (!isOpen) return null;

  return (
    <div className="w-full md:w-[350px] lg:w-[400px] h-full bg-white dark:bg-[#111b21] border-l border-gray-200 dark:border-white/5 flex flex-col z-30 animate-slide-in-right">
      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-4 flex items-center border-b border-gray-200 dark:border-white/5">
        <button onClick={onClose} className="text-gray-500 dark:text-[#aebac1] hover:bg-gray-200 dark:hover:bg-[#374248] p-2 rounded-full mr-4">
          <X size={24} />
        </button>
        <h1 className="text-gray-800 dark:text-[#e9edef] font-medium">Search messages</h1>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-white dark:bg-[#111b21]">
        <div className="flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-2 border border-transparent focus-within:border-whatsapp-green transition-all">
          <Search size={20} className="text-gray-500 mr-3" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 dark:text-[#d1d7db]"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-gray-500">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#111b21]">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-green"></div>
          </div>
        ) : searchTerm.trim().length > 0 ? (
          results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((msg) => (
                <div 
                  key={msg._id}
                  onClick={() => onSelectMessage(msg._id)}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#182229] cursor-pointer border-b border-gray-100 dark:border-white/5 transition-colors group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">{format(new Date(msg.createdAt), 'dd/MM/yyyy')}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-[#d1d7db] leading-relaxed">
                    {msg.text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                      part.toLowerCase() === searchTerm.toLowerCase() 
                        ? <span key={i} className="text-whatsapp-green font-bold">{part}</span> 
                        : part
                    )}
                  </p>
                </div>
              ))}
              <div className="p-8 text-center text-xs text-gray-400">
                Search results for messages from the beginning of this chat.
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
              <Search size={48} className="mb-4 opacity-10" />
              <p className="text-sm">No messages found</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 opacity-60">
            <Calendar size={48} className="mb-4 opacity-10" />
            <p className="text-sm">Search for messages with {chat.username || chat.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInChatDrawer;
