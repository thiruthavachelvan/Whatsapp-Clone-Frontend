import React, { useState } from 'react';
import Drawer from './Drawer';
import { Search, ArrowRight, Check, Camera, ArrowLeft } from 'lucide-react';
import { createGroup } from '../../services/api';

const NewGroupDrawer = ({ isOpen, onClose, currentUser, users, onGroupCreated }) => {
  const [step, setStep] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMember = (user) => {
    if (selectedMembers.find(m => m._id === user._id)) {
      setSelectedMembers(selectedMembers.filter(m => m._id !== user._id));
    } else {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleNext = () => {
    if (selectedMembers.length > 0) setStep(2);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    try {
      const data = await createGroup({
        name: groupName,
        description,
        members: selectedMembers.map(m => m._id),
        adminId: currentUser._id
      });
      onGroupCreated(data);
      handleClose();
    } catch (error) {
      console.error("Failed to create group", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedMembers([]);
    setGroupName('');
    setDescription('');
    onClose();
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={step === 1 ? "Add group members" : "New group"}
    >
      <div className="flex flex-col h-full bg-white dark:bg-[#111b21]">
        {step === 1 ? (
          <>
            {/* Step 1: Member Selection */}
            <div className="p-3 border-b border-gray-100 dark:border-[#222d34]">
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedMembers.map(m => (
                    <div key={m._id} className="flex items-center bg-gray-100 dark:bg-[#202c33] rounded-full pl-1 pr-2 py-1 text-xs">
                       <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white mr-2"
                        style={{ backgroundColor: m.avatarColor || '#9ca3af' }}
                       >
                         {m.avatarLetter || m.username.charAt(0).toUpperCase()}
                       </div>
                       <span className="text-gray-700 dark:text-[#d1d7db]">{m.username}</span>
                       <button onClick={() => toggleMember(m)} className="ml-1 text-gray-400 hover:text-gray-600">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5">
                <Search size={18} className="text-gray-500 dark:text-[#aebac1] mr-3" />
                <input 
                  type="text" 
                  placeholder="Search name or email" 
                  className="bg-transparent border-none outline-none w-full text-sm text-gray-700 dark:text-[#d1d7db]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredUsers.map(user => {
                const isSelected = selectedMembers.find(m => m._id === user._id);
                return (
                  <div 
                    key={user._id}
                    onClick={() => toggleMember(user)}
                    className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] transition-colors border-b border-gray-50 dark:border-[#222d34]"
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold relative"
                      style={{ backgroundColor: user.avatarColor || '#9ca3af' }}
                    >
                      {user.avatarLetter || user.username.charAt(0).toUpperCase()}
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 bg-whatsapp-green rounded-full p-0.5 border-2 border-white dark:border-[#111b21]">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-normal text-gray-900 dark:text-[#e9edef] text-base">{user.username}</h3>
                      <p className="text-xs text-gray-500 dark:text-[#8696a0] truncate">{user.about || 'Hey there! I am using WhatsApp.'}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedMembers.length > 0 && (
              <div className="h-24 bg-[#f0f2f5] dark:bg-[#111b21] flex items-center justify-center">
                <button 
                  onClick={handleNext}
                  className="bg-whatsapp-green hover:bg-whatsapp-teal text-white p-4 rounded-full shadow-lg transition-transform active:scale-95"
                >
                  <ArrowRight size={24} />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Step 2: Group Info */}
            <div className="p-8 flex flex-col items-center">
               <div className="w-48 h-48 bg-gray-200 dark:bg-[#202c33] rounded-full flex items-center justify-center relative group cursor-pointer mb-8">
                  <Camera size={48} className="text-gray-400" />
                  <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-xs text-white text-center px-4">
                    <span className="uppercase font-bold">Add Group Icon</span>
                  </div>
               </div>

               <div className="w-full space-y-6">
                  <div className="border-b-2 border-whatsapp-teal pb-1">
                    <input 
                      type="text" 
                      placeholder="Group Subject" 
                      className="w-full bg-transparent border-none outline-none text-gray-800 dark:text-[#e9edef] text-lg"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  <div className="border-b border-gray-200 dark:border-white/10 pb-1">
                    <input 
                      type="text" 
                      placeholder="Group Description (optional)" 
                      className="w-full bg-transparent border-none outline-none text-gray-600 dark:text-[#8696a0] text-base"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
               </div>
            </div>

            <div className="flex-1 bg-[#f0f2f5] dark:bg-[#111b21]"></div>

            <div className="h-24 bg-[#f0f2f5] dark:bg-[#111b21] flex items-center justify-center">
               <div className="flex space-x-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="bg-white dark:bg-[#202c33] text-whatsapp-teal p-4 rounded-full shadow-md"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <button 
                    onClick={handleCreate}
                    disabled={loading || !groupName.trim()}
                    className={`${loading || !groupName.trim() ? 'bg-gray-400' : 'bg-whatsapp-green hover:bg-whatsapp-teal'} text-white p-4 rounded-full shadow-lg transition-transform active:scale-95`}
                  >
                    {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <Check size={24} />}
                  </button>
               </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
};

export default NewGroupDrawer;
