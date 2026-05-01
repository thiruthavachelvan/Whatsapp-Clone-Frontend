import React, { useState } from 'react';
import { X, Search, Send, UserPlus } from 'lucide-react';

const ForwardMessageModal = ({ messages, selectedIds, users, groups, currentUser, onClose, onForward }) => {
  const [search, setSearch] = useState('');
  const [selectedTargets, setSelectedTargets] = useState([]);

  const forwardTexts = messages
    .filter(m => selectedIds.includes(m._id))
    .map(m => m.text)
    .join('\n');

  const allChats = [
    ...users.map(u => ({ ...u, type: 'user', display: u.username })),
    ...groups.map(g => ({ ...g, type: 'group', display: g.name })),
  ].filter(c => c._id !== currentUser._id);

  const filtered = allChats.filter(c =>
    c.display?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTarget = (id) => {
    setSelectedTargets(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedTargets.length === 0) return;
    onForward(selectedTargets, forwardTexts);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[200] p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#233138] w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom sm:zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-[#aebac1] dark:hover:text-white p-1 rounded-full">
              <X size={22} />
            </button>
            <h2 className="text-base font-semibold text-gray-800 dark:text-[#e9edef]">Forward message to</h2>
          </div>
          <UserPlus size={20} className="text-whatsapp-teal" />
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="flex items-center bg-[#f0f2f5] dark:bg-[#2a3942] rounded-full px-4 py-2 border border-transparent focus-within:border-whatsapp-green transition-colors">
            <Search size={16} className="text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search name or number"
              className="bg-transparent outline-none text-sm w-full text-gray-700 dark:text-[#d1d7db] placeholder-gray-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Selected chips */}
        {selectedTargets.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {selectedTargets.map(id => {
              const t = allChats.find(c => c._id === id);
              return (
                <div key={id} className="flex items-center space-x-1 bg-whatsapp-green/15 text-whatsapp-teal rounded-full px-3 py-1 text-xs font-medium">
                  <span>{t?.display}</span>
                  <button onClick={() => toggleTarget(id)}><X size={12} /></button>
                </div>
              );
            })}
          </div>
        )}

        {/* Preview */}
        <div className="mx-4 mb-3 px-3 py-2 bg-[#f0f2f5] dark:bg-[#182229] rounded-lg border-l-4 border-whatsapp-green">
          <p className="text-xs text-gray-500 dark:text-[#8696a0] truncate italic">
            "{forwardTexts.length > 80 ? forwardTexts.slice(0, 80) + '...' : forwardTexts}"
          </p>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
          <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Recent chats</p>
          {filtered.map(chat => (
            <div
              key={chat._id}
              onClick={() => toggleTarget(chat._id)}
              className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-[#f5f6f6] dark:hover:bg-[#182229] cursor-pointer transition-colors"
            >
              <div className="relative flex-shrink-0">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base ${chat.avatarColor || 'bg-gray-400'}`}>
                  {(chat.avatarLetter || chat.display?.[0])?.toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 dark:text-[#e9edef] truncate">{chat.display}</p>
                <p className="text-xs text-gray-400 dark:text-[#8696a0] truncate">
                  {chat.type === 'group' ? 'Group' : 'Message yourself'}
                </p>
              </div>
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedTargets.includes(chat._id) 
                  ? 'bg-whatsapp-green border-whatsapp-green' 
                  : 'border-gray-300 dark:border-[#8696a0]'
              }`}>
                {selectedTargets.includes(chat._id) && <span className="text-white text-[10px] font-bold">✓</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Send */}
        {selectedTargets.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-[#e9edef]">
                {selectedTargets.map(id => allChats.find(c => c._id === id)?.display).join(', ')}
              </p>
            </div>
            <button
              onClick={handleSend}
              className="w-12 h-12 bg-whatsapp-green rounded-full flex items-center justify-center shadow-lg hover:bg-[#06cf9c] transition-colors active:scale-95"
            >
              <Send size={20} className="text-white ml-0.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForwardMessageModal;
