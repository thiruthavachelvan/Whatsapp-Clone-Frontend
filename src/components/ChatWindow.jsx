import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Mic, 
  Send, 
  ArrowLeft, 
  Users, 
  BellOff, 
  Info, 
  CheckSquare, 
  Clock, 
  Heart, 
  List, 
  Star,
  X as CloseIcon, 
  ThumbsDown, 
  Ban, 
  MinusCircle, 
  Trash,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Camera,
  Headphones,
  User,
  BarChart2,
  Calendar,
  Sticker,
  Play,
  Square,
  Plus
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import MessageBubble from './MessageBubble';
import ForwardMessageModal from './Modals/ForwardMessageModal';
import MediaPreviewModal from './Modals/MediaPreviewModal';
import CreatePollModal from './Modals/CreatePollModal';

const ChatWindow = ({ 
  currentUser, 
  selectedChat, 
  messages, 
  onSendMessage, 
  onBack, 
  loading, 
  onToggleStar, 
  onShowContactInfo, 
  onShowSearch, 
  onClearChat,
  onDeleteChat,
  onBlockUser,
  onReportUser,
  onMuteChat,
  onDeleteMessage,
  onPinMessage,
  onUnpinMessage,
  onVote,
  users,
  groups,
  highlightedMessageId,
  forceSelectionMode,
  lightboxIndex,
  setLightboxIndex
}) => {
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showPinModal, setShowPinModal] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [pinDuration, setPinDuration] = useState('168'); // default 7 days
  const [showPinMenu, setShowPinMenu] = useState(false);
  
  // New interaction states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});

  // Get currently pinned message
  const pinnedMessage = messages.find(m => m.pinnedBy && new Date(m.pinExpiry) > new Date());

  useEffect(() => {
    if (forceSelectionMode > 0) {
      setSelectionMode(true);
    }
  }, [forceSelectionMode]);

  const scrollToBottom = () => {
    if (!highlightedMessageId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      messageRefs.current[highlightedMessageId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      scrollToBottom();
    }
  }, [messages, highlightedMessageId]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
      setShowEmojiPicker(false);
    }
  };

  // --- Audio Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // We attach the cancel flag directly to the recorder to check it in onstop
      mediaRecorder.isCancelled = false;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (mediaRecorder.isCancelled || audioChunksRef.current.length === 0) {
          return; // Cancelled
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          onSendMessage('', null, {
            type: 'audio',
            mediaUrl: reader.result,
            mediaName: 'Voice Note',
            mediaSize: audioBlob.size
          });
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = (cancel = false) => {
    if (mediaRecorderRef.current && isRecording) {
      if (cancel) {
        mediaRecorderRef.current.isCancelled = true;
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Attachment Logic ---
  const openFilePicker = (type, accept) => {
    setSelectedAttachmentType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
    setShowAttachmentMenu(false);
  };

  const handleCreatePoll = (pollData) => {
    onSendMessage('', null, { type: 'poll', poll: pollData });
    setShowPollModal(false);
  };

  const AttachmentItem = ({ icon, label, onClick }) => (
    <button 
      onClick={onClick} 
      className="flex items-center space-x-4 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#1f2c33] w-full text-left transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#202c33] flex items-center justify-center">
        {icon}
      </div>
      <span className="text-gray-700 dark:text-[#d1d7db]">{label}</span>
    </button>
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to Base64 (Using Base64 to bypass cloud storage for this clone)
    if (file.size > 16 * 1024 * 1024) {
      alert("File is too large! Maximum allowed is 16MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Url = reader.result;
      
      // Enforce document type if the user specifically clicked the Document button
      let type = selectedAttachmentType === 'Document' ? 'document' : 'document';
      
      if (selectedAttachmentType !== 'Document') {
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';
      }

      const mediaPayload = {
        type,
        mediaUrl: base64Url,
        mediaName: file.name,
        mediaSize: file.size
      };

      if (type === 'image' || type === 'video') {
        setMediaPreview(mediaPayload);
      } else {
        onSendMessage('', null, mediaPayload);
      }
    };
    e.target.value = ''; // Reset input
    setSelectedAttachmentType(null);
  };

  const isGroup = selectedChat.type === 'group';


  return (
    <div className="flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] relative w-full transition-colors duration-300">
      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-2 flex justify-between items-center border-b border-gray-200 dark:border-white/5 z-50 w-full relative shadow-sm">
        <div className="flex items-center flex-1 overflow-hidden">
          <button 
            onClick={onBack}
            className="mr-2 md:hidden hover:bg-gray-200 p-2 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          
          <div 
            onClick={onShowContactInfo}
            className="relative flex-shrink-0 cursor-pointer"
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: selectedChat.avatarColor || (isGroup ? '#00a884' : '#9ca3af') }}
            >
              {isGroup ? <Users size={20} /> : (selectedChat.avatarLetter || selectedChat.username.charAt(0).toUpperCase())}
            </div>
          </div>
          
          <div 
            onClick={onShowContactInfo}
            className="ml-4 cursor-pointer truncate"
          >
            <div className="flex items-center">
              <h2 className="font-normal text-gray-900 dark:text-[#e9edef] text-base truncate mr-2">{isGroup ? selectedChat.name : selectedChat.username}</h2>
              {(() => {
                const muteInfo = currentUser.mutedChats?.find(m => (m.chatId?._id || m.chatId)?.toString() === selectedChat._id);
                return muteInfo && new Date(muteInfo.mutedUntil) > new Date() && <BellOff size={14} className="text-gray-400" />;
              })()}
            </div>
            <p className="text-xs text-gray-500 dark:text-[#8696a0] truncate">
              {isGroup 
                ? selectedChat.members.map(m => m.username).join(', ') 
                : 'click here for contact info'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3 text-gray-500 dark:text-[#aebac1] pl-2">
          <button 
            onClick={onShowSearch}
            className="hover:bg-gray-200 dark:hover:bg-[#374248] p-2 rounded-full transition-colors hidden sm:block"
          >
            <Search size={20} />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`hover:bg-gray-200 dark:hover:bg-[#374248] p-2 rounded-full transition-colors ${showMenu ? 'bg-gray-200 dark:bg-[#374248]' : ''}`}
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                <div className="absolute right-0 top-12 w-60 bg-white dark:bg-[#233138] shadow-xl rounded-sm py-2 z-50 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-white/5">
                  <button onClick={() => { setShowMenu(false); onShowContactInfo(); }} className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3">
                    <Info size={18} /> <span>Contact info</span>
                  </button>
                  <button onClick={() => { setShowMenu(false); onShowSearch(); }} className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3">
                    <Search size={18} /> <span>Search</span>
                  </button>
                  <button onClick={() => { setShowMenu(false); setSelectionMode(true); }} className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3">
                    <CheckSquare size={18} /> <span>Select messages</span>
                  </button>
                  <button onClick={() => { setShowMenu(false); onShowContactInfo(); /* Opens info where mute is */ }} className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center justify-between">
                    <div className="flex items-center space-x-3"><BellOff size={18} /> <span>Mute notifications</span></div>
                    <span className="text-[10px]">▶</span>
                  </button>
                  <button onClick={() => { setShowMenu(false); onBack(); }} className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3">
                    <CloseIcon size={18} /> <span>Close chat</span>
                  </button>
                  
                  <hr className="my-1 border-gray-100 dark:border-white/5" />
                  
                  <button onClick={() => { setShowMenu(false); onReportUser(); }} className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3">
                    <ThumbsDown size={18} /> <span>Report</span>
                  </button>
                  <button onClick={() => { setShowMenu(false); onBlockUser(); }} className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3">
                    <Ban size={18} /> <span>Block</span>
                  </button>
                  <button onClick={() => { setShowMenu(false); onClearChat(); }} className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3">
                    <MinusCircle size={18} /> <span>Clear chat</span>
                  </button>
                  <button onClick={() => { setShowMenu(false); onDeleteChat(); }} className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-gray-700 dark:text-[#d1d7db] text-sm flex items-center space-x-3">
                    <Trash size={18} /> <span>Delete chat</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mute Banner */}
      {(() => {
        const muteInfo = currentUser.mutedChats?.find(m => (m.chatId?._id || m.chatId)?.toString() === selectedChat._id);
        if (muteInfo && new Date(muteInfo.mutedUntil) > new Date()) {
          const timeStr = new Date(muteInfo.mutedUntil).toLocaleString();
          return (
            <div className="bg-[#f0f2f5] dark:bg-[#182229] px-4 py-2 flex items-center justify-center text-xs text-gray-500 dark:text-[#8696a0] border-b border-gray-200 dark:border-white/5 relative z-20">
              <BellOff size={14} className="mr-2" />
              <span>You muted this chat until {timeStr}</span>
            </div>
          );
        }
        return null;
      })()}

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="relative">
          <div 
            className="bg-white dark:bg-[#202c33] px-4 py-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a3942] border-b border-gray-100 dark:border-white/5 z-20 shadow-sm transition-all"
            onClick={() => {
              if (messageRefs.current[pinnedMessage._id]) {
                messageRefs.current[pinnedMessage._id].scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              setShowPinMenu(false);
            }}
            onContextMenu={(e) => { e.preventDefault(); setShowPinMenu(v => !v); }}
          >
            <div className="text-whatsapp-teal flex-shrink-0">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-whatsapp-teal">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-whatsapp-teal">Pinned message</p>
              <p className="text-xs text-gray-600 dark:text-[#d1d7db] truncate">
                {pinnedMessage.isDeletedForEveryone ? "This message was deleted" : pinnedMessage.text}
              </p>
            </div>
            <div 
              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowPinMenu(v => !v);
              }}
            >
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Unpin context menu */}
          {showPinMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowPinMenu(false)} />
              <div className="absolute right-2 top-full mt-1 w-48 bg-white dark:bg-[#233138] shadow-xl rounded-lg py-1 z-40 border border-gray-100 dark:border-white/10">
                <button
                  onClick={() => { onUnpinMessage(pinnedMessage._id); setShowPinMenu(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#182229] text-sm text-gray-700 dark:text-[#d1d7db] flex items-center space-x-3"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="opacity-60">
                    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                  </svg>
                  <span>Unpin</span>
                </button>
                <button
                  onClick={() => {
                    if (messageRefs.current[pinnedMessage._id]) {
                      messageRefs.current[pinnedMessage._id].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    setShowPinMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#182229] text-sm text-gray-700 dark:text-[#d1d7db] flex items-center space-x-3"
                >
                  <Send size={14} className="opacity-60" />
                  <span>Go to message</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-[6%] lg:px-[8%] w-full relative custom-scrollbar">
        {/* Chat Background Pattern with separate opacity */}
        <div className="absolute inset-0 bg-chat-pattern opacity-[0.06] dark:opacity-[0.04] pointer-events-none"></div>
        
        {loading ? (
          <div className="flex justify-center items-center h-full relative z-10">
            <div className="bg-white/80 dark:bg-[#202c33]/80 px-4 py-2 rounded-full text-sm shadow-sm text-gray-500 dark:text-[#aebac1]">
              Loading chat history...
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 w-full relative z-10">
            {messages.length === 0 ? (
              <div className="flex justify-center my-4">
                <div className="bg-[#ffeecd] dark:bg-[#182229] px-4 py-2 rounded-lg text-xs text-gray-600 dark:text-[#8696a0] shadow-sm text-center max-w-[90%] border-b border-yellow-200 dark:border-none">
                  <p className="text-[11px] text-gray-500 dark:text-[#8696a0] leading-relaxed text-center">
                    <span className="block mb-1">🛡️ Your messages are private to this conversation. This is a clone project for demonstration purposes.</span>
                    <span className="block">Click to learn more about our privacy commitment.</span>
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const msgSenderId = message.senderId?._id || message.senderId;
                const isOwn = msgSenderId === currentUser._id;
                
                // Add tail to message bubble if it's the first in a group
                let showTail = true;
                if (index > 0) {
                  const prevSenderId = messages[index - 1].senderId?._id || messages[index - 1].senderId;
                  if (prevSenderId === msgSenderId) {
                    showTail = false;
                  }
                }
                
                return (
                  <div 
                    key={message._id || index}
                    ref={el => messageRefs.current[message._id] = el}
                    className={`flex items-center space-x-4 transition-colors duration-1000 ${highlightedMessageId === message._id ? 'bg-whatsapp-green/20 dark:bg-whatsapp-green/10 rounded-lg' : ''}`}
                  >
                    {selectionMode && (
                      <div className="flex-shrink-0 cursor-pointer pl-2" onClick={() => {
                        setSelectedIds(prev => prev.includes(message._id) ? prev.filter(id => id !== message._id) : [...prev, message._id]);
                      }}>
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${selectedIds.includes(message._id) ? 'bg-whatsapp-green border-whatsapp-green shadow-sm' : 'border-gray-400 dark:border-[#8696a0]'}`}>
                          {selectedIds.includes(message._id) && <span className="text-white text-[10px]">✓</span>}
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <MessageBubble 
                        message={message} 
                        isOwn={isOwn} 
                        showTail={showTail}
                        onToggleStar={onToggleStar}
                        showSenderName={isGroup && !isOwn}
                        currentUser={currentUser}
                        onDelete={() => setShowDeleteModal(message._id)}
                        onPin={() => setShowPinModal(message._id)}
                        onVote={onVote}
                        onImageClick={['image', 'video', 'audio'].includes(message.type) ? () => {
                          const mediaMsgs = messages.filter(m => ['image', 'video', 'audio'].includes(m.type));
                          const idx = mediaMsgs.findIndex(m => m._id === message._id);
                          if (idx !== -1) setLightboxIndex(idx);
                        } : undefined}
                      />
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {!selectionMode && (
        <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-3 flex items-center min-h-[62px] w-full relative z-10 transition-colors duration-300 border-t border-white/5">
          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-[70px] left-4 z-50 animate-in slide-in-bottom">
              <EmojiPicker 
                theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                onEmojiClick={(emojiData) => {
                  setInputText(prev => prev + emojiData.emoji);
                }}
              />
            </div>
          )}

          {/* Attachment Menu Popup */}
          {showAttachmentMenu && (
        <div className="absolute left-4 bottom-20 bg-white dark:bg-[#233138] rounded-xl shadow-2xl py-1 w-52 z-[60] animate-in slide-in-from-bottom-4 duration-200 border border-gray-100 dark:border-white/5">
          <AttachmentItem 
            icon={<FileText size={20} className="text-[#7f66ff]" />} 
            label="Document" 
            onClick={() => openFilePicker('Document', '*/*')} 
          />
          <AttachmentItem 
            icon={<ImageIcon size={20} className="text-[#007bfc]" />} 
            label="Photos & videos" 
            onClick={() => openFilePicker('Image', 'image/*,video/*')} 
          />
          <AttachmentItem 
            icon={<Headphones size={20} className="text-[#ff8f00]" />} 
            label="Audio" 
            onClick={() => openFilePicker('Audio', 'audio/*')} 
          />
          <AttachmentItem 
            icon={<BarChart2 size={20} className="text-[#ffbc38]" />} 
            label="Poll" 
            onClick={() => { setShowPollModal(true); setShowAttachmentMenu(false); }} 
          />
        </div>
      )}

      {showPollModal && (
        <CreatePollModal 
          onClose={() => setShowPollModal(false)} 
          onCreate={handleCreatePoll} 
        />
      )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />

          {isRecording ? (
            <div className="flex-1 flex items-center space-x-4 px-4 bg-white dark:bg-[#2a3942] rounded-lg h-[42px]">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
               <span className="text-gray-700 dark:text-[#d1d7db] font-mono">{formatTime(recordingTime)}</span>
               <div className="flex-1"></div>
               <button onClick={() => stopRecording(true)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                 <Trash size={20} />
               </button>
            </div>
          ) : (
            <>
              <div className="flex space-x-2 mr-2">
                <button 
                  onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachmentMenu(false); }}
                  className={`${showEmojiPicker ? 'text-whatsapp-teal' : 'text-gray-500 dark:text-[#aebac1]'} hover:text-gray-700 dark:hover:text-[#d1d7db] transition-colors p-2 hidden sm:block`}
                >
                  <Smile size={24} />
                </button>
                <button 
                  onClick={() => { setShowAttachmentMenu(!showAttachmentMenu); setShowEmojiPicker(false); }}
                  className={`${showAttachmentMenu ? 'text-whatsapp-teal' : 'text-gray-500 dark:text-[#aebac1]'} hover:text-gray-700 dark:hover:text-[#d1d7db] transition-colors p-2`}
                >
                  <Plus size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex-1 flex bg-white dark:bg-[#2a3942] rounded-lg px-2 sm:px-4 py-0 items-center overflow-hidden h-[42px] border border-transparent focus-within:border-white/20">
                <input
                  type="text"
                  className="w-full bg-transparent outline-none py-2 text-sm text-gray-700 dark:text-[#d1d7db] placeholder:dark:text-[#8696a0]"
                  placeholder="Type a message"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onClick={() => { setShowEmojiPicker(false); setShowAttachmentMenu(false); }}
                />
              </form>
            </>
          )}
          
          <div className="ml-2 flex items-center">
            {inputText.trim() ? (
              <button 
                onClick={handleSubmit} 
                className="text-gray-500 dark:text-[#aebac1] hover:text-whatsapp-teal transition-colors p-2 rounded-full"
              >
                <Send size={24} />
              </button>
            ) : isRecording ? (
              <button 
                onClick={() => stopRecording(false)} 
                className="bg-whatsapp-teal text-white hover:bg-[#00a884] transition-colors p-2 rounded-full shadow-lg"
              >
                <Send size={24} className="ml-0.5" />
              </button>
            ) : (
              <button 
                onClick={startRecording}
                className="text-gray-500 dark:text-[#aebac1] hover:text-gray-700 dark:hover:text-[#d1d7db] transition-colors p-2 hidden sm:block"
              >
                <Mic size={24} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {mediaPreview && (
        <MediaPreviewModal
          fileUrl={mediaPreview.mediaUrl}
          fileType={mediaPreview.type}
          fileName={mediaPreview.mediaName}
          onClose={() => setMediaPreview(null)}
          onSend={(caption) => {
            onSendMessage(caption, null, mediaPreview);
            setMediaPreview(null);
          }}
        />
      )}

      {/* Selection Bar */}
      {selectionMode && (
        <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-6 flex items-center justify-between border-t border-gray-200 dark:border-white/5 z-50 animate-slide-in-bottom">
          <div className="flex items-center space-x-6">
            <button onClick={() => { setSelectionMode(false); setSelectedIds([]); }} className="text-gray-500 hover:text-gray-700">
              <CloseIcon size={24} />
            </button>
            <span className="text-gray-700 dark:text-[#e9edef] font-medium">{selectedIds.length} selected</span>
          </div>
          <div className="flex items-center space-x-8 text-gray-500 dark:text-[#aebac1]">
            <button title="Copy" onClick={() => {
              const text = messages.filter(m => selectedIds.includes(m._id)).map(m => m.text).join('\n');
              navigator.clipboard.writeText(text);
              setSelectionMode(false);
              setSelectedIds([]);
            }}><List size={22} /></button>
            <button title="Star" onClick={() => {
              selectedIds.forEach(id => onToggleStar(id));
              setSelectionMode(false);
              setSelectedIds([]);
            }}><Star size={22} /></button>
            <button title="Delete" onClick={() => setShowDeleteModal('bulk')}><Trash size={22} /></button>
            <button title="Forward" onClick={() => { if(selectedIds.length > 0) setShowForwardModal(true); }} className={`${selectedIds.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}>
              <Send size={22} className="rotate-[-45deg] translate-y-1" />
            </button>
            <button title="Pin" onClick={() => { if(selectedIds.length === 1) setShowPinModal(selectedIds[0]); }} className={`${selectedIds.length !== 1 ? 'opacity-30 cursor-not-allowed' : ''}`}><Clock size={22} /></button>
          </div>
        </div>
      )}

      {/* Action Modals */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4">
          <div className="bg-[#233138] w-full max-w-sm rounded-lg shadow-2xl p-6 text-[#e9edef] animate-in zoom-in duration-200">
            <h3 className="text-xl font-medium mb-8">Delete message?</h3>
            <div className="flex flex-col items-end space-y-4">
              <button 
                onClick={() => {
                  const ids = showDeleteModal === 'bulk' ? selectedIds : [showDeleteModal];
                  ids.forEach(id => onDeleteMessage(id, 'everyone'));
                  setShowDeleteModal(null);
                  setSelectionMode(false);
                  setSelectedIds([]);
                }}
                className="px-4 py-2 text-whatsapp-green hover:bg-whatsapp-green/10 rounded-full transition-colors font-medium"
              >
                Delete for everyone
              </button>
              <button 
                onClick={() => {
                  const ids = showDeleteModal === 'bulk' ? selectedIds : [showDeleteModal];
                  ids.forEach(id => onDeleteMessage(id, 'me'));
                  setShowDeleteModal(null);
                  setSelectionMode(false);
                  setSelectedIds([]);
                }}
                className="px-4 py-2 text-whatsapp-green hover:bg-whatsapp-green/10 rounded-full transition-colors font-medium"
              >
                Delete for me
              </button>
              <button 
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-whatsapp-green hover:bg-whatsapp-green/10 rounded-full transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4">
          <div className="bg-[#233138] w-full max-w-sm rounded-lg shadow-2xl p-6 text-[#e9edef] animate-in zoom-in duration-200">
            <h3 className="text-xl font-medium mb-2">Choose how long your pin lasts</h3>
            <p className="text-gray-400 text-sm mb-6">You can unpin at any time.</p>
            <div className="space-y-3 mb-8">
              {[
                { label: '24 hours', value: '24' },
                { label: '7 days', value: '168' },
                { label: '30 days', value: '720' }
              ].map(opt => (
                <label key={opt.value} className="flex items-center space-x-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="pinDuration" 
                    value={opt.value} 
                    checked={pinDuration === opt.value}
                    onChange={(e) => setPinDuration(e.target.value)}
                    className="w-4 h-4 accent-whatsapp-green"
                  />
                  <span className="group-hover:text-whatsapp-green transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowPinModal(null)} className="text-whatsapp-green hover:bg-whatsapp-green/10 px-4 py-2 rounded-md transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  onPinMessage(showPinModal, pinDuration);
                  setShowPinModal(null);
                  setSelectionMode(false);
                  setSelectedIds([]);
                }}
                className="bg-whatsapp-green text-[#111b21] px-6 py-2 rounded-md font-medium hover:bg-[#06cf9c] transition-colors"
              >
                Pin
              </button>
            </div>
          </div>
        </div>
      )}
      {showForwardModal && (
        <ForwardMessageModal
          messages={messages}
          selectedIds={selectedIds}
          users={users || []}
          groups={groups || []}
          currentUser={currentUser}
          onClose={() => setShowForwardModal(false)}
          onForward={(targetIds, text) => {
            targetIds.forEach(targetId => {
              const targetUser = (users || []).find(u => u._id === targetId);
              const targetGroup = (groups || []).find(g => g._id === targetId);
              const target = targetUser ? { ...targetUser, type: 'user' } : (targetGroup ? { ...targetGroup, type: 'group' } : null);
              if (target) {
                onSendMessage(text, target);
              }
            });
            setSelectionMode(false);
            setSelectedIds([]);
          }}
        />
      )}
    </div>
  );
};

export default ChatWindow;
