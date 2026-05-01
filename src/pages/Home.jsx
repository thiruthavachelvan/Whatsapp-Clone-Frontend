import React, { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { 
  fetchUsers, 
  fetchMessages, 
  sendMessage as sendApiMessage, 
  markMessagesAsRead,
  toggleStarMessage,
  fetchUserGroups,
  blockUser,
  muteChat, 
  reportUser, 
  clearChat,
  searchMessages,
  searchInChat,
  deleteMessage as deleteApiMessage,
  pinMessage as pinApiMessage
} from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ContactInfo from '../components/ContactInfo';
import SearchInChatDrawer from '../components/Drawers/SearchInChatDrawer';

const Home = () => {
  const { currentUser, logoutUser, updateUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // Unified state for user or group
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [forceSelectionMode, setForceSelectionMode] = useState(0);
  
  const socketRef = useRef();
  const selectedChatRef = useRef(null);

  // Keep ref in sync with state for socket callbacks
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    
    socketRef.current.emit('addUser', currentUser._id);
    
    socketRef.current.on('getUsers', (users) => {
      setActiveUsers(users);
    });

    socketRef.current.on('getMessage', async (data) => {
      const incomingSenderId = data.senderId?._id || data.senderId;
      console.log("Incoming message from:", incomingSenderId, "to group:", data.groupId);
      
      const isFromSelected = selectedChatRef.current && (
        // For Private Chat: Must have NO groupId and sender must match
        (!data.groupId && selectedChatRef.current.type === 'user' && selectedChatRef.current._id === incomingSenderId) ||
        // For Group Chat: Must HAVE groupId and groupId must match
        (data.groupId && selectedChatRef.current.type === 'group' && selectedChatRef.current._id === data.groupId)
      );

      // Normalize message for the UI
      const normalizedMessage = {
        ...data,
        isRead: true,
        senderId: data.senderInfo ? { ...data.senderInfo, _id: incomingSenderId } : incomingSenderId
      };

      if (isFromSelected) {
        console.log("Adding message to active chat window");
        setMessages((prev) => [...prev, normalizedMessage]);
        if (!data.groupId) {
          await markMessagesAsRead(incomingSenderId, currentUser._id);
        }
      } else {
        console.log("Target chat not active, showing notification in sidebar");
        // Notification for sidebar
        if (data.groupId) {
          setGroups(prev => {
            const groupExists = prev.some(g => g._id === data.groupId);
            if (!groupExists) {
              fetchUserGroups(currentUser._id).then(setGroups);
              return prev;
            }
            return prev.map(g => 
              g._id === data.groupId ? { ...g, unreadCount: (g.unreadCount || 0) + 1 } : g
            );
          });
        } else {
          setUsers((prevUsers) => {
            const userExists = prevUsers.some(u => u._id === incomingSenderId);
            if (!userExists) {
              // Re-fetch to include newly unhidden/new contact
              fetchUsers(currentUser._id).then(setUsers);
              return prevUsers;
            }
            return prevUsers.map(user => 
              user._id === incomingSenderId 
                ? { ...user, unreadCount: (user.unreadCount || 0) + 1 } 
                : user
            );
          });
        }
      }
    });

    socketRef.current.on('groupCreated', (newGroup) => {
      console.log("New group created:", newGroup);
      const isMember = newGroup.members.some(m => (m._id || m) === currentUser._id);
      if (isMember) {
        setGroups(prev => [newGroup, ...prev]);
      }
    });

    socketRef.current.on('messagesRead', ({ receiverId }) => {
      if (selectedChatRef.current && 
          selectedChatRef.current.type === 'user' && 
          selectedChatRef.current._id === receiverId) {
        setMessages((prev) => prev.map(m => ({ ...m, isRead: true })));
      }
    });

    socketRef.current.on('messageDeleted', ({ messageId }) => {
      setMessages((prev) => prev.map(m => 
        m._id === messageId ? { ...m, isDeletedForEveryone: true } : m
      ));
    });

    socketRef.current.on('userUpdated', (updatedUser) => {
      setUsers((prev) => prev.map(u => 
        u._id === updatedUser._id ? { ...u, ...updatedUser } : u
      ));
      
      if (selectedChatRef.current && selectedChatRef.current._id === updatedUser._id) {
        setSelectedChat(prev => ({ ...prev, ...updatedUser }));
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUser]);

  // Load all data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const [usersData, groupsData] = await Promise.all([
          fetchUsers(currentUser._id),
          fetchUserGroups(currentUser._id)
        ]);
        setUsers(usersData);
        setGroups(groupsData);

        const savedChatId = localStorage.getItem('selectedChatId');
        const savedType = localStorage.getItem('selectedChatType');
        
        if (savedChatId) {
          if (savedType === 'group') {
            const group = groupsData.find(g => g._id === savedChatId);
            if (group) setSelectedChat({ ...group, type: 'group' });
          } else {
            const user = usersData.find(u => u._id === savedChatId);
            if (user) setSelectedChat({ ...user, type: 'user' });
          }
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  // Load messages when a chat is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat) return;
      
      // Auto-close contact info when switching chats
      setShowContactInfo(false);

      setLoading(true);
      try {
        const isGroup = selectedChat.type === 'group';
        const data = await fetchMessages(currentUser._id, selectedChat._id, isGroup);
        setMessages(data);

        if (isGroup) {
          setGroups(prev => prev.map(g => 
            g._id === selectedChat._id ? { ...g, unreadCount: 0 } : g
          ));
        } else {
          setUsers(prev => prev.map(u => 
            u._id === selectedChat._id ? { ...u, unreadCount: 0 } : u
          ));
        }
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedChat?._id, currentUser?._id]);

  const handleSendMessage = async (text, targetChat = null, mediaData = null) => {
    const chat = targetChat || selectedChat;
    if ((!text || !text.trim()) && !mediaData) return;
    if (!chat) return;

    const isGroup = chat.type === 'group';
    const messageData = {
      senderId: currentUser._id,
      text: text ? text.trim() : '',
      [isGroup ? 'groupId' : 'receiverId']: chat._id,
      ...(mediaData || { type: 'text' })
    };

    try {
      // 1. Optimistically add message to UI (only if forwarding to active chat)
      const tempMessage = { 
        ...messageData, 
        isRead: false,
        isStarred: false,
        createdAt: new Date().toISOString() 
      };
      if (!targetChat) {
        setMessages((prev) => [...prev, tempMessage]);
      }

      // 2. Save to db
      const savedMessage = await sendApiMessage(messageData);
      
      // If sending a message to someone not in our current users list
      if (!isGroup && !users.some(u => u._id === chat._id)) {
        const updatedUsers = await fetchUsers(currentUser._id);
        setUsers(updatedUsers);
      }
      
      // 3. Update message in state (only for current chat)
      if (!targetChat) {
        setMessages((prev) => prev.map(m => 
          (m.text === tempMessage.text && !m._id) ? { 
            ...savedMessage, 
            isRead: false, 
            isStarred: false,
            senderId: {
              _id: currentUser._id,
              username: currentUser.username,
              avatarColor: currentUser.avatarColor,
              avatarLetter: currentUser.avatarLetter
            }
          } : m
        ));
      }

      // 4. Emit socket event
      socketRef.current.emit('sendMessage', {
        ...messageData,
        _id: savedMessage._id,
        createdAt: savedMessage.createdAt,
        senderInfo: {
          username: currentUser.username,
          avatarColor: currentUser.avatarColor,
          avatarLetter: currentUser.avatarLetter
        }
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleToggleStar = async (messageOrId) => {
    try {
      const messageId = typeof messageOrId === 'string' ? messageOrId : messageOrId._id;
      const updatedMessage = await toggleStarMessage(messageId, currentUser._id);
      setMessages((prev) => prev.map(m => m._id === messageId ? updatedMessage : m));
    } catch (error) {
      console.error("Failed to toggle star", error);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    setSelectedChat({ ...newGroup, type: 'group' });
    localStorage.setItem('selectedChatId', newGroup._id);
    localStorage.setItem('selectedChatType', 'group');
    
    // Notify other members via socket
    socketRef.current.emit('createGroup', newGroup);
  };

  const handleBlock = async () => {
    if (!selectedChat || selectedChat.type === 'group') return;
    try {
      const data = await blockUser(currentUser._id, selectedChat._id);
      updateUser({ ...currentUser, blockedUsers: data.blockedUsers });
      alert(data.message);
    } catch (error) {
      console.error("Failed to block user", error);
    }
  };

  const handleMute = async (duration) => {
    if (!selectedChat) return;
    try {
      const data = await muteChat(currentUser._id, selectedChat._id, duration);
      updateUser({ ...currentUser, mutedChats: data.mutedChats });
    } catch (error) {
      console.error("Failed to mute chat", error);
    }
  };

  const handleReport = async () => {
    if (!selectedChat || selectedChat.type === 'group') return;
    const reason = window.prompt("Please provide a reason for reporting this user:");
    if (reason === null) return; // Cancelled
    try {
      const data = await reportUser(currentUser._id, selectedChat._id, reason);
      alert(data.message);
    } catch (error) {
      console.error("Failed to report user", error);
    }
  };

  const handleClearChat = async () => {
    if (!selectedChat) return;
    if (window.confirm("Are you sure you want to clear this chat? This will delete all messages.")) {
      try {
        await clearChat(currentUser._id, selectedChat._id, selectedChat.type === 'group');
        setMessages([]);
      } catch (error) {
        console.error("Failed to clear chat", error);
      }
    }
  };

  const handleDeleteFullChat = async () => {
    if (!selectedChat) return;
    if (window.confirm("Are you sure you want to delete this chat and the contact?")) {
      try {
        // 1. Clear messages
        await clearChat(currentUser._id, selectedChat._id, selectedChat.type === 'group');
        
        // 2. Hide contact (Delete for user)
        const { deleteChat: deleteChatApi } = await import('../services/api');
        await deleteChatApi(currentUser._id, selectedChat._id);
        
        // 3. Reset UI
        setMessages([]);
        setSelectedChat(null);
        setShowContactInfo(false);
        
        // 4. Refresh users list
        const updatedUsers = await fetchUsers(currentUser._id);
        setUsers(updatedUsers);
        
        alert("Chat and contact deleted");
      } catch (error) {
        console.error("Failed to delete chat", error);
      }
    }
  };

  const handleSelectMessage = (messageId) => {
    setHighlightedMessageId(messageId);
    setShowSearchInChat(false); // close search drawer
    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 3000);
  };

  const handleDeleteMessage = async (messageId, type) => {
    try {
      await deleteApiMessage(messageId, currentUser._id, type);
      setMessages(prev => prev.map(m => {
        if (m._id !== messageId) return m;
        if (type === 'everyone') return { ...m, isDeletedForEveryone: true };
        return { ...m, deletedBy: [...(m.deletedBy || []), currentUser._id] };
      }));
      if (type === 'everyone' && socketRef.current) {
        socketRef.current.emit('deleteMessage', { messageId, chatId: selectedChat._id });
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handlePinMessage = async (messageId, duration) => {
    try {
      const data = await pinApiMessage(messageId, currentUser._id, duration);
      setMessages(prev => prev.map(m => {
        if (m._id === messageId) return data;
        if (m.pinnedBy) return { ...m, pinnedBy: null, pinExpiry: null };
        return m;
      }));
    } catch (error) {
      console.error("Pin error:", error);
    }
  };

  const handleUnpinMessage = async (messageId) => {
    try {
      // Reuse pin endpoint with 0-hour duration to effectively unpin (set expiry to now)
      await pinApiMessage(messageId, currentUser._id, '0');
      setMessages(prev => prev.map(m => 
        m._id === messageId ? { ...m, pinnedBy: null, pinExpiry: null } : m
      ));
    } catch (error) {
      console.error("Unpin error:", error);
    }
  };

  return (
    <div className="h-screen w-full bg-whatsapp-gray dark:bg-[#0b141a] flex overflow-hidden transition-colors duration-300">
      {/* Desktop Layout Background ... */}
      <div className="absolute top-0 w-full h-32 bg-whatsapp-teal dark:bg-transparent z-0 hidden md:block"></div>
      
      <div className="z-10 w-full h-full md:p-5 flex justify-center">
        <div className="w-full max-w-[1600px] h-full flex bg-white dark:bg-[#222d34] shadow-lg md:rounded-sm overflow-hidden">
          
          {/* Sidebar Area */}
          <div className={`w-full md:w-[30%] lg:w-[35%] flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-[#313d45] ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <Sidebar 
              users={users} 
              groups={groups}
              activeUsers={activeUsers}
              currentUser={currentUser} 
              onLogout={logoutUser}
              selectedChat={selectedChat}
              onSelectChat={(chat) => {
                setSelectedChat(chat);
                localStorage.setItem('selectedChatId', chat._id);
                localStorage.setItem('selectedChatType', chat.type);
                if (chat.type === 'group') {
                  setGroups(prev => prev.map(g => g._id === chat._id ? { ...g, unreadCount: 0 } : g));
                } else {
                  setUsers(prev => prev.map(u => u._id === chat._id ? { ...u, unreadCount: 0 } : u));
                }
              }}
              onGroupCreated={handleGroupCreated}
              socket={socketRef.current}
              onSelectMessage={handleSelectMessage}
            />
          </div>

          {/* Main Chat Area */}
          <div className={`flex flex-col bg-chat-pattern bg-[#efeae2] dark:bg-[#0b141a] transition-all duration-300 ${!selectedChat ? 'hidden md:flex flex-1' : 'flex'} ${ (showContactInfo || showSearchInChat) ? 'w-full md:w-[40%] lg:w-[35%]' : 'w-full md:w-[70%] lg:w-[65%]'}`}>
            {selectedChat ? (
              <ChatWindow 
                currentUser={currentUser}
                selectedChat={selectedChat} 
                messages={messages} 
                onSendMessage={handleSendMessage}
                onToggleStar={handleToggleStar}
                onShowContactInfo={() => {
                  setShowSearchInChat(false);
                  setShowContactInfo(!showContactInfo);
                }}
                onShowSearch={() => {
                  setShowContactInfo(false);
                  setShowSearchInChat(!showSearchInChat);
                }}
                onBack={() => {
                  setSelectedChat(null);
                  setShowContactInfo(false);
                  setShowSearchInChat(false);
                  localStorage.removeItem('selectedChatId');
                  localStorage.removeItem('selectedChatType');
                }}
                loading={loading}
                onClearChat={handleClearChat}
                onDeleteChat={handleDeleteFullChat}
                onBlockUser={handleBlock}
                onReportUser={handleReport}
                onMuteChat={handleMute}
                onDeleteMessage={handleDeleteMessage}
                onPinMessage={handlePinMessage}
                onUnpinMessage={handleUnpinMessage}
                users={users}
                groups={groups}
                highlightedMessageId={highlightedMessageId}
                forceSelectionMode={forceSelectionMode}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-[#f0f2f5] dark:bg-[#222d34] border-b-[6px] border-whatsapp-green">
                <div className="w-80 h-80 mb-8 bg-cover bg-center opacity-50 dark:opacity-20" style={{ backgroundImage: "url('https://cdn-icons-png.flaticon.com/512/124/124034.png')" }}></div>
                <h2 className="text-3xl font-light text-gray-700 dark:text-[#e9edef] mb-4">WhatsApp Web Clone</h2>
                <p className="text-gray-500 dark:text-[#8696a0] max-w-md">
                  Send and receive messages without keeping your phone online.<br/>
                  Select a chat from the sidebar to start messaging.
                </p>
                <div className="mt-8 flex items-center justify-center text-gray-400 dark:text-[#8696a0] text-sm">
                  <span className="mr-2">🔒</span> End-to-end encrypted clone project
                </div>
              </div>
            )}
          </div>

          {/* Contact Info Sidebar */}
          {selectedChat && showContactInfo && (
            <ContactInfo 
              chat={selectedChat}
              currentUser={currentUser}
              messages={messages}
              onClose={() => setShowContactInfo(false)}
              onClearChat={handleClearChat}
              onDeleteChat={handleDeleteFullChat}
              onBlockUser={handleBlock}
              onMuteChat={handleMute}
              onReportUser={handleReport}
              onSelectMessages={() => {
                setShowContactInfo(false);
                setForceSelectionMode(prev => prev + 1);
              }}
              onOpenSearch={() => {
                setShowContactInfo(false);
                setShowSearchInChat(true);
              }}
            />
          )}

          {/* Search In Chat Sidebar */}
          {selectedChat && showSearchInChat && (
            <SearchInChatDrawer 
              isOpen={showSearchInChat}
              onClose={() => setShowSearchInChat(false)}
              chat={selectedChat}
              currentUser={currentUser}
              onSelectMessage={handleSelectMessage}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default Home;
