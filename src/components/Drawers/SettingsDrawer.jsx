import React, { useContext } from 'react';
import Drawer from './Drawer';
import { Sun, Moon, User, LogOut, MessageSquare } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

const SettingsDrawer = ({ isOpen, onClose, currentUser, onOpenProfile, onLogout }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { logoutUser } = useContext(AuthContext);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#111b21]">

        {/* Profile Card */}
        <div
          className="bg-white dark:bg-[#202c33] mx-0 px-6 py-5 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a3942] transition-colors border-b border-gray-100 dark:border-white/5"
          onClick={() => { onClose(); onOpenProfile?.(); }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow flex-shrink-0 overflow-hidden"
            style={{ backgroundColor: currentUser.avatarColor || '#128C7E' }}
          >
            {currentUser.profilePic ? (
              <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="" />
            ) : (
              currentUser.avatarLetter || currentUser.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <h3 className="text-base font-medium text-gray-900 dark:text-[#e9edef] truncate">{currentUser.username}</h3>
            <p className="text-sm text-gray-500 dark:text-[#8696a0] truncate">{currentUser.about || 'Hey there! I am using WhatsApp.'}</p>
          </div>
          <span className="text-xs text-whatsapp-teal font-medium ml-2 flex-shrink-0">Edit</span>
        </div>

        {/* Functional Settings */}
        <div className="mt-2 bg-white dark:bg-[#202c33]">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#2a3942] transition-colors border-b border-gray-100 dark:border-white/5"
          >
            <div className="w-10 h-10 rounded-full bg-[#f0f2f5] dark:bg-[#111b21] flex items-center justify-center mr-4 flex-shrink-0">
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-400" />}
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Theme</h4>
              <p className="text-xs text-gray-500 dark:text-[#8696a0] mt-0.5">
                Currently {darkMode ? 'Dark' : 'Light'} mode — tap to switch to {darkMode ? 'Light' : 'Dark'}
              </p>
            </div>
            {/* Visual toggle pill */}
            <div className={`w-10 h-5 rounded-full transition-colors duration-300 flex-shrink-0 ${darkMode ? 'bg-whatsapp-teal' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-300 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Edit Profile shortcut */}
          <button
            onClick={() => { onClose(); onOpenProfile?.(); }}
            className="w-full flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#2a3942] transition-colors border-b border-gray-100 dark:border-white/5"
          >
            <div className="w-10 h-10 rounded-full bg-[#f0f2f5] dark:bg-[#111b21] flex items-center justify-center mr-4 flex-shrink-0">
              <User size={20} className="text-whatsapp-teal" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Profile</h4>
              <p className="text-xs text-gray-500 dark:text-[#8696a0] mt-0.5">Change name, about, profile photo</p>
            </div>
          </button>

          {/* Log out */}
          <button
            onClick={() => { onClose(); logoutUser(); }}
            className="w-full flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#2a3942] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#f0f2f5] dark:bg-[#111b21] flex items-center justify-center mr-4 flex-shrink-0">
              <LogOut size={20} className="text-red-400" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-medium text-red-500">Log out</h4>
              <p className="text-xs text-gray-500 dark:text-[#8696a0] mt-0.5">Sign out of your account</p>
            </div>
          </button>
        </div>

        {/* App Info Footer */}
        <div className="mt-auto p-8 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-whatsapp-green rounded-full flex items-center justify-center mb-3 shadow">
            <MessageSquare size={20} className="text-white" />
          </div>
          <p className="text-xs font-semibold text-gray-700 dark:text-[#e9edef]">WhatsApp Web Clone</p>
          <p className="text-[10px] text-gray-400 mt-1">Version 1.0.0</p>
        </div>
      </div>
    </Drawer>
  );
};

export default SettingsDrawer;
