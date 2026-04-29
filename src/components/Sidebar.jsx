import React, { useState } from 'react';
import { Search, MoreVertical, MessageSquare, LogOut } from 'lucide-react';
import { format } from 'date-fns';

const Sidebar = ({ users, activeUsers, currentUser, onLogout, selectedUser, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] px-4 py-2 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer"
            style={{ backgroundColor: currentUser.avatarColor || '#128C7E' }}
            title={currentUser.username}
          >
            {currentUser.avatarLetter || currentUser.username.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex space-x-4 text-gray-500">
          <button className="hover:bg-gray-200 p-2 rounded-full transition-colors" title="Communities">
            <MessageSquare size={20} />
          </button>
          <button 
            onClick={onLogout} 
            className="hover:bg-gray-200 p-2 rounded-full transition-colors"
            title="Log out"
          >
            <LogOut size={20} />
          </button>
          <button className="hover:bg-gray-200 p-2 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-2 border-b border-gray-200">
        <div className="flex items-center bg-[#f0f2f5] rounded-lg px-3 py-1.5">
          <Search size={18} className="text-gray-500 mr-3" />
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
        {filteredUsers.length === 0 ? (
          <div className="flex justify-center items-center h-20 text-gray-400 text-sm">
            No contacts found
          </div>
        ) : (
          filteredUsers.map(user => {
            const isSelected = selectedUser && selectedUser._id === user._id;
            const isOnline = activeUsers.includes(user._id);
            
            return (
              <div 
                key={user._id}
                onClick={() => onSelectUser(user)}
                className={`flex items-center px-3 py-3 cursor-pointer border-b border-gray-100 hover:bg-[#f5f6f6] transition-colors
                  ${isSelected ? 'bg-[#f0f2f5]' : ''}
                `}
              >
                <div className="relative flex-shrink-0">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                    style={{ backgroundColor: user.avatarColor || '#9ca3af' }}
                  >
                    {user.avatarLetter || user.username.charAt(0).toUpperCase()}
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="ml-4 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-normal text-gray-900 truncate text-base">{user.username}</h3>
                    <span className="text-xs text-gray-400">
                      {user.createdAt ? format(new Date(user.createdAt), 'MMM d') : ''}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 truncate flex items-center">
                    {isOnline ? (
                      <span className="text-whatsapp-teal">Online</span>
                    ) : (
                      'Tap to chat'
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
