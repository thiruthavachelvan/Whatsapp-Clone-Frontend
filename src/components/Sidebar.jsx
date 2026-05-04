import React, { useState, useContext, useEffect } from 'react';
import { Search, MoreVertical, MessageSquare, LogOut, Sun, Moon, User as UserIcon, Star, Settings, Users, BellOff, X } from 'lucide-react';
import { searchMessages } from '../services/api';
import { format } from 'date-fns';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import ProfileDrawer from './Drawers/ProfileDrawer';
import NewChatDrawer from './Drawers/NewChatDrawer';
import StarredMessagesDrawer from './Drawers/StarredMessagesDrawer';
import NewGroupDrawer from './Drawers/NewGroupDrawer';
import SettingsDrawer from './Drawers/SettingsDrawer';
import StatusTab from './Status/StatusTab';

const Sidebar = ({ users, groups, activeUsers, currentUser, onLogout, selectedChat, onSelectChat, onGroupCreated, socket, onSelectMessage, loading, activeTab, onTabChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDrawer, setActiveDrawer] = useState(null); // 'profile', 'new-chat', 'starred', 'new-group', 'settings', or null
  const [showMenu, setShowMenu] = useState(false);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { updateUser } = useContext(AuthContext);
  const [messageResults, setMessageResults] = useState([]);
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearchingMessages(true);
        try {
          const results = await searchMessages(currentUser._id, searchTerm);
          setMessageResults(results);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearchingMessages(false);
        }
      } else {
        setMessageResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentUser._id]);

  // Combine and sort conversations
  const conversations = [
    ...users.map(u => ({ ...u, type: 'user' })),
    ...groups.map(g => ({ ...g, type: 'group' }))
  ].filter(c => 
    (c.username || c.name).toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21] transition-colors duration-300 relative overflow-hidden">
      {/* Drawers */}
      <ProfileDrawer 
        isOpen={activeDrawer === 'profile'} 
        onClose={() => setActiveDrawer(null)} 
        currentUser={currentUser}
        onUpdateUser={updateUser}
        socket={socket}
      />
      <NewChatDrawer 
        isOpen={activeDrawer === 'new-chat'} 
        onClose={() => setActiveDrawer(null)} 
        currentUser={currentUser}
        onSelectUser={(user) => onSelectChat({ ...user, type: 'user' })}
      />
      <StarredMessagesDrawer 
        isOpen={activeDrawer === 'starred'} 
        onClose={() => setActiveDrawer(null)} 
        currentUser={currentUser}
        onSelectChat={onSelectChat}
        onSelectMessage={onSelectMessage}
        users={users}
        groups={groups}
      />
      <NewGroupDrawer 
        isOpen={activeDrawer === 'new-group'} 
        onClose={() => setActiveDrawer(null)} 
        currentUser={currentUser}
        users={users}
        onGroupCreated={onGroupCreated}
      />
      <SettingsDrawer 
        isOpen={activeDrawer === 'settings'} 
        onClose={() => setActiveDrawer(null)} 
        currentUser={currentUser}
      />

      {/* Header ... */}
      <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-2 flex justify-between items-center border-b border-gray-200 dark:border-white/5">
        {/* Profile ... */}
        <div className="flex items-center">
          <div 
            onClick={() => setActiveDrawer('profile')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
            style={{ backgroundColor: currentUser.avatarColor || '#128C7E' }}
            title="Profile"
          >
            {currentUser.profilePic ? (
              <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="" />
            ) : (
              currentUser.avatarLetter || currentUser.username.charAt(0).toUpperCase()
            )}
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
          <button 
            onClick={onLogout} 
            className="hover:bg-gray-200 dark:hover:bg-[#374248] p-2 rounded-full transition-colors"
            title="Log out"
          >
            <LogOut size={20} />
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
                  <button 
                    onClick={() => { setShowMenu(false); setActiveDrawer('new-group'); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3"
                  >
                    <Users size={18} /> <span>New group</span>
                  </button>
                  <button 
                    onClick={() => { setShowMenu(false); setActiveDrawer('starred'); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3"
                  >
                    <Star size={18} /> <span>Starred messages</span>
                  </button>
                  <button 
                    onClick={() => { setShowMenu(false); setActiveDrawer('settings'); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3"
                  >
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'chats' ? (
          <>
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
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-gray-500 hover:text-gray-700">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#111b21] custom-scrollbar">
              {searchTerm.trim().length > 0 && messageResults.length > 0 && (
                <div className="py-2 border-b border-gray-100 dark:border-white/5 bg-[#f0f2f5]/30 dark:bg-[#202c33]/30">
                  <h3 className="px-4 py-2 text-xs font-semibold text-whatsapp-teal uppercase tracking-wider">Messages</h3>
                  {messageResults.map(msg => {
                    const targetChat = msg.groupId ? { ...msg.groupId, type: 'group' } : 
                                      (msg.senderId._id === currentUser._id ? { ...msg.receiverId, type: 'user' } : { ...msg.senderId, type: 'user' });
                    
                    if (!targetChat._id) return null; // Safety check

                    return (
                      <div 
                        key={msg._id}
                        onClick={() => {
                          onSelectChat(targetChat);
                          if (onSelectMessage) onSelectMessage(msg._id);
                          setSearchTerm('');
                        }}
                        className="px-4 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] cursor-pointer group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm dark:text-[#e9edef] group-hover:text-whatsapp-teal transition-colors">
                            {targetChat.username || targetChat.name}
                          </span>
                          <span className="text-[10px] text-gray-400">{format(new Date(msg.createdAt), 'dd/MM/yyyy')}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-[#8696a0] truncate italic">
                          {msg.text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                            part.toLowerCase() === searchTerm.toLowerCase() 
                              ? <span key={i} className="text-whatsapp-green font-bold bg-whatsapp-green/10 px-0.5 rounded">{part}</span> 
                              : part
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {searchTerm.trim().length > 0 && messageResults.length === 0 && !isSearchingMessages && conversations.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center">
                  <Search size={40} className="mb-4 opacity-20" />
                  <p>No results found for "{searchTerm}"</p>
                </div>
              )}
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm px-6 text-center">
                  <div className="w-8 h-8 border-4 border-whatsapp-teal border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>Loading chats...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-[#202c33] rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 dark:text-[#e9edef] font-medium mb-1">No chats found</h3>
                  <p className="text-gray-500 dark:text-[#8696a0] text-sm">
                    Start a new conversation by clicking the message icon above.
                  </p>
                </div>
              ) : (
                conversations.map(chat => {
                  const isSelected = selectedChat && selectedChat._id === chat._id;
                  const isGroup = chat.type === 'group';
                  const isOnline = !isGroup && activeUsers.includes(chat._id);
                  
                  // Check if chat is muted
                  const muteInfo = currentUser.mutedChats?.find(m => (m.chatId?._id || m.chatId)?.toString() === chat._id);
                  const isMuted = muteInfo && new Date(muteInfo.mutedUntil) > new Date();

                  return (
                    <div 
                      key={chat._id}
                      onClick={() => onSelectChat(chat)}
                      className={`flex items-center px-3 py-3 cursor-pointer border-b border-gray-100 dark:border-[#222d34] hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] transition-colors
                        ${isSelected ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' : ''}
                      `}
                    >
                      <div className="relative flex-shrink-0">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-sm overflow-hidden"
                          style={{ backgroundColor: chat.avatarColor || (isGroup ? '#00a884' : '#9ca3af') }}
                        >
                          {chat.profilePic ? (
                            <img src={chat.profilePic} className="w-full h-full object-cover" alt="" />
                          ) : (
                            isGroup ? <Users size={24} /> : (chat.avatarLetter || chat.username.charAt(0).toUpperCase())
                          )}
                        </div>
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#111b21] rounded-full shadow-sm"></div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline mb-1">
                          <div className="flex items-center overflow-hidden mr-2">
                            <h3 className="font-normal text-gray-900 dark:text-[#e9edef] truncate text-base">{isGroup ? chat.name : chat.username}</h3>
                            {isMuted && <BellOff size={14} className="text-gray-400 ml-2 flex-shrink-0" />}
                          </div>
                          <span className="text-xs text-gray-400 dark:text-[#8696a0]">
                            {chat.updatedAt ? format(new Date(chat.updatedAt), 'h:mm a') : ''}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-[#8696a0] truncate flex items-center justify-between">
                          <span className={isOnline ? "text-whatsapp-teal" : ""}>
                            {isGroup ? `${chat.members.length} members` : (chat.about || (isOnline ? 'Online' : 'Tap to chat'))}
                          </span>
                          {(chat.unreadCount > 0) && (
                            <span className={`${isMuted ? 'bg-[#54656f] dark:bg-[#3b4a54]' : 'bg-whatsapp-green'} text-white text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shadow-sm ml-2`}>
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <StatusTab currentUser={currentUser} />
        )}
      </div>

      {/* Tab Switcher Navigation */}
      <div className="h-14 bg-white dark:bg-[#202c33] border-t border-gray-200 dark:border-white/5 flex items-center justify-around flex-shrink-0">
        <button 
          onClick={() => onTabChange('chats')}
          className={`flex flex-col items-center justify-center space-y-1 flex-1 h-full transition-colors ${activeTab === 'chats' ? 'text-whatsapp-teal' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a3942]'}`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-medium">Chats</span>
        </button>
        <button 
          onClick={() => onTabChange('status')}
          className={`flex flex-col items-center justify-center space-y-1 flex-1 h-full transition-colors ${activeTab === 'status' ? 'text-whatsapp-teal' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a3942]'}`}
        >
          <div className="relative">
            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-current"></div>
            </div>
            {/* Notification dot for new status if needed */}
          </div>
          <span className="text-[10px] font-medium">Status</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
