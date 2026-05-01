import React, { useState } from 'react';
import Drawer from './Drawer';
import { Pencil, Check } from 'lucide-react';
import { updateProfile } from '../../services/api';

const ProfileDrawer = ({ isOpen, onClose, currentUser, onUpdateUser }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [name, setName] = useState(currentUser.username);
  const [about, setAbout] = useState(currentUser.about || 'Hey there! I am using WhatsApp.');

  const handleUpdateName = async () => {
    if (name.trim() === '') return;
    try {
      const updatedUser = await updateProfile(currentUser._id, { username: name });
      onUpdateUser(updatedUser);
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update name", error);
    }
  };

  const handleUpdateAbout = async () => {
    try {
      const updatedUser = await updateProfile(currentUser._id, { about });
      onUpdateUser(updatedUser);
      setIsEditingAbout(false);
    } catch (error) {
      console.error("Failed to update about", error);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Profile">
      <div className="flex flex-col">
        {/* Avatar Section */}
        <div className="py-8 flex justify-center bg-[#f0f2f5] dark:bg-[#111b21]">
          <div 
            className="w-48 h-48 rounded-full flex items-center justify-center text-white text-6xl font-semibold shadow-md relative group cursor-pointer"
            style={{ backgroundColor: currentUser.avatarColor || '#128C7E' }}
          >
            {currentUser.avatarLetter || currentUser.username.charAt(0).toUpperCase()}
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-xs text-center px-4">
              <span className="uppercase font-bold mb-1">Change Profile Photo</span>
            </div>
          </div>
        </div>

        {/* Name Section */}
        <div className="bg-white dark:bg-[#111b21] px-8 py-4 shadow-sm mb-6">
          <label className="text-whatsapp-teal text-sm mb-4 block font-normal">Your Name</label>
          <div className="flex items-center justify-between border-b border-transparent focus-within:border-whatsapp-teal transition-colors pb-1">
            {isEditingName ? (
              <input 
                type="text" 
                className="bg-transparent border-none outline-none w-full text-gray-800 dark:text-[#e9edef] text-base"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={25}
              />
            ) : (
              <span className="text-gray-800 dark:text-[#e9edef] text-base">{currentUser.username}</span>
            )}
            
            <div className="flex items-center space-x-2 text-gray-400">
              {isEditingName ? (
                <>
                  <span className="text-xs">{25 - name.length}</span>
                  <button onClick={handleUpdateName} className="text-whatsapp-teal hover:text-whatsapp-green">
                    <Check size={20} />
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditingName(true)} className="hover:text-gray-600 dark:hover:text-gray-300">
                  <Pencil size={20} />
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-[#8696a0] mt-4 leading-relaxed">
            This is not your username or pin. This name will be visible to your WhatsApp contacts.
          </p>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-[#111b21] px-8 py-4 shadow-sm">
          <label className="text-whatsapp-teal text-sm mb-4 block font-normal">About</label>
          <div className="flex items-center justify-between border-b border-transparent focus-within:border-whatsapp-teal transition-colors pb-1">
            {isEditingAbout ? (
              <input 
                type="text" 
                className="bg-transparent border-none outline-none w-full text-gray-800 dark:text-[#e9edef] text-base"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                autoFocus
                maxLength={100}
              />
            ) : (
              <span className="text-gray-800 dark:text-[#e9edef] text-base truncate pr-2">{currentUser.about || 'Hey there! I am using WhatsApp.'}</span>
            )}
            
            <div className="flex items-center space-x-2 text-gray-400">
              {isEditingAbout ? (
                <>
                  <span className="text-xs">{100 - about.length}</span>
                  <button onClick={handleUpdateAbout} className="text-whatsapp-teal hover:text-whatsapp-green">
                    <Check size={20} />
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditingAbout(true)} className="hover:text-gray-600 dark:hover:text-gray-300">
                  <Pencil size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ProfileDrawer;
