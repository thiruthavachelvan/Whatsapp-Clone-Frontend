import React, { useState, useContext } from 'react';
import { Search, MoreVertical, MessageSquare, LogOut, Sun, Moon, User as UserIcon, Star, Settings, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import ProfileDrawer from './Drawers/ProfileDrawer';
import NewChatDrawer from './Drawers/NewChatDrawer';

const Sidebar = ({ users, activeUsers, currentUser, onLogout, selectedUser, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDrawer, setActiveDrawer] = useState(null); // 'profile', 'new-chat', or null
  const [showMenu, setShowMenu] = useState(false);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { updateUser } = useContext(AuthContext);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21] transition-colors duration-300 relative overflow-hidden">
      {/* Drawers */}
      <ProfileDrawer 
        isOpen={activeDrawer === 'profile'} 
        onClose={() => setActiveDrawer(null)} 
        currentUser={currentUser}
        onUpdateUser={updateUser}
      />
      <NewChatDrawer 
        isOpen={activeDrawer === 'new-chat'} 
        onClose={() => setActiveDrawer(null)} 
        currentUser={currentUser}
        onSelectUser={onSelectUser}
      />

      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-2 flex justify-between items-center border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center">
          <div 
            onClick={() => setActiveDrawer('profile')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-80 transition-opacity"
            style={{ backgroundColor: currentUser.avatarColor || '#128C7E' }}
            title="Profile"
          >
            {currentUser.avatarLetter || currentUser.username.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex space-x-2 text-gray-500 dark:text-[#aebac1] relative">
          <button 
            onClick={toggleTheme}
            className="hover:bg-gray-200 dark:hover:bg-[#374248] p-2 rounded-full transition-colors" 
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setActiveDrawer('new-chat')}
            className="hover:bg-gray-200 dark:hover:bg-[#374248] p-2 rounded-full transition-colors" 
            title="New Chat"
          >
            <MessageSquare size={20} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`hover:bg-gray-200 dark:hover:bg-[#374248] p-2 rounded-full transition-colors ${showMenu ? 'bg-gray-200 dark:bg-[#374248]' : ''}`}
              title="Menu"
            >
              <MoreVertical size={20} />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-[#233138] shadow-lg rounded-sm py-2 z-50 animate-in fade-in zoom-in duration-200">
                  <button className="w-full text-left px-4 py-2 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3">
                    <Users size={18} /> <span>New group</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3">
                    <Star size={18} /> <span>Starred messages</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3">
                    <Settings size={18} /> <span>Settings</span>
                  </button>
                  <hr className="my-1 border-gray-100 dark:border-white/5" />
                  <button 
                    onClick={() => { setShowMenu(false); onLogout(); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3"
                  >
                    <LogOut size={18} /> <span>Log out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#111b21] p-2 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5">
          <Search size={18} className="text-gray-500 dark:text-[#aebac1] mr-3" />
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 dark:text-[#d1d7db] placeholder:dark:text-[#8696a0]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#111b21] custom-scrollbar">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm px-6 text-center">
            <p>No contacts found</p>
            <button 
              onClick={() => setActiveDrawer('new-chat')}
              className="mt-4 text-whatsapp-teal hover:underline font-medium"
            >
              Start a new chat
            </button>
          </div>
        ) : (
          filteredUsers.map(user => {
            const isSelected = selectedUser && selectedUser._id === user._id;
            const isOnline = activeUsers.includes(user._id);
            
            return (
              <div 
                key={user._id}
                onClick={() => onSelectUser(user)}
                className={`flex items-center px-3 py-3 cursor-pointer border-b border-gray-100 dark:border-[#222d34] hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] transition-colors
                  ${isSelected ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' : ''}
                `}
              >
                <div className="relative flex-shrink-0">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-sm"
                    style={{ backgroundColor: user.avatarColor || '#9ca3af' }}
                  >
                    {user.avatarLetter || user.username.charAt(0).toUpperCase()}
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#111b21] rounded-full shadow-sm"></div>
                  )}
                </div>
                
                <div className="ml-4 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-normal text-gray-900 dark:text-[#e9edef] truncate text-base">{user.username}</h3>
                    <span className="text-xs text-gray-400 dark:text-[#8696a0]">
                      {user.createdAt ? format(new Date(user.createdAt), 'h:mm a') : ''}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-[#8696a0] truncate flex items-center justify-between">
                    <span className={isOnline ? "text-whatsapp-teal" : ""}>
                      {user.about || (isOnline ? 'Online' : 'Tap to chat')}
                    </span>
                    {user.unreadCount > 0 && (
                      <span className="bg-whatsapp-green text-white text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shadow-sm ml-2">
                        {user.unreadCount}
                      </span>
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
