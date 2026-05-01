import React, { useState, useEffect } from 'react';
import Drawer from './Drawer';
import { Search, ArrowLeft } from 'lucide-react';
import { searchUsers } from '../../services/api';

const NewChatDrawer = ({ isOpen, onClose, currentUser, onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (query.trim().length < 1) {
        setResults([]);
        return;
      }
      
      setSearching(true);
      try {
        const data = await searchUsers(query, currentUser._id);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [query, currentUser._id]);

  const handleSelect = (user) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="New Chat">
      <div className="flex flex-col h-full">
        {/* Search Input */}
        <div className="p-3 bg-white dark:bg-[#111b21]">
          <div className="flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5 focus-within:bg-white dark:focus-within:bg-[#323739] transition-colors border-b border-transparent focus-within:border-whatsapp-teal">
            <Search size={18} className="text-gray-500 dark:text-[#aebac1] mr-3" />
            <input 
              type="text" 
              placeholder="Search by username or email" 
              className="bg-transparent border-none outline-none w-full text-sm text-gray-700 dark:text-[#d1d7db] placeholder:dark:text-[#8696a0]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#111b21] custom-scrollbar">
          {searching ? (
            <div className="flex justify-center items-center py-10 text-gray-400 text-sm italic">
              Searching...
            </div>
          ) : query.trim() !== '' && results.length === 0 ? (
            <div className="flex justify-center items-center py-10 text-gray-500 dark:text-[#8696a0] text-sm text-center px-10">
              No contacts found
            </div>
          ) : (
            results.map(user => (
              <div 
                key={user._id}
                onClick={() => handleSelect(user)}
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] transition-colors border-b border-gray-100 dark:border-[#222d34]"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-sm"
                  style={{ backgroundColor: user.avatarColor || '#9ca3af' }}
                >
                  {user.avatarLetter || user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-normal text-gray-900 dark:text-[#e9edef] text-base">{user.username}</h3>
                  <p className="text-xs text-gray-500 dark:text-[#8696a0] truncate mt-0.5">
                    {user.about || 'Hey there! I am using WhatsApp.'}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {query.trim() === '' && (
             <div className="p-6 text-center text-gray-400 text-sm">
                Search for someone to start a new chat
             </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default NewChatDrawer;
