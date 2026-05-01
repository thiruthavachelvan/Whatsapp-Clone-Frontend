import React, { useContext } from 'react';
import Drawer from './Drawer';
import { 
  Key, 
  Lock, 
  MessageSquare, 
  Bell, 
  Database, 
  HelpCircle, 
  Sun, 
  Moon,
  Circle
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';

const SettingsDrawer = ({ isOpen, onClose, currentUser }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const settingsItems = [
    { icon: <Lock size={20} />, title: "Account", desc: "Privacy, security, change number" },
    { icon: <MessageSquare size={20} />, title: "Chats", desc: "Theme, wallpapers, chat history" },
    { icon: <Bell size={20} />, title: "Notifications", desc: "Message, group & call tones" },
    { icon: <Database size={20} />, title: "Storage and data", desc: "Network usage, auto-download" },
    { icon: <HelpCircle size={20} />, title: "Help", desc: "Help center, contact us, privacy policy" },
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#111b21]">
        {/* Profile Summary */}
        <div className="bg-white dark:bg-[#111b21] px-6 py-4 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors mb-2">
           <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-semibold shadow-sm"
            style={{ backgroundColor: currentUser.avatarColor || '#128C7E' }}
          >
            {currentUser.avatarLetter || currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-normal text-gray-900 dark:text-[#e9edef]">{currentUser.username}</h3>
            <p className="text-sm text-gray-500 dark:text-[#8696a0] truncate">{currentUser.about || 'Hey there! I am using WhatsApp.'}</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-white dark:bg-[#111b21] flex-1">
          {settingsItems.map((item, index) => (
            <div 
              key={index}
              className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors border-b border-gray-50 dark:border-white/5"
            >
              <div className="text-gray-500 dark:text-[#8696a0] mr-6">
                {item.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-base font-normal text-gray-900 dark:text-[#e9edef]">{item.title}</h4>
                <p className="text-sm text-gray-500 dark:text-[#8696a0]">{item.desc}</p>
              </div>
            </div>
          ))}

          {/* Theme Toggle in Settings */}
          <div 
            onClick={toggleTheme}
            className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors border-b border-gray-50 dark:border-white/5"
          >
            <div className="text-gray-500 dark:text-[#8696a0] mr-6">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <div className="flex-1">
              <h4 className="text-base font-normal text-gray-900 dark:text-[#e9edef]">Theme</h4>
              <p className="text-sm text-gray-500 dark:text-[#8696a0]">{darkMode ? 'Light' : 'Dark'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 flex flex-col items-center justify-center text-center">
           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">from</p>
           <p className="text-sm font-semibold text-gray-700 dark:text-[#e9edef] tracking-wider">ANTIGRAVITY</p>
        </div>
      </div>
    </Drawer>
  );
};

export default SettingsDrawer;
