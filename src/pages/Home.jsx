import React, { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { fetchUsers, fetchMessages, sendMessage as sendApiMessage, markMessagesAsRead } from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const Home = () => {
  const { currentUser, logoutUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef();
  const selectedUserRef = useRef(null);

  // Keep ref in sync with state for socket callbacks
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    
    socketRef.current.emit('addUser', currentUser._id);
    
    socketRef.current.on('getUsers', (users) => {
      setActiveUsers(users);
    });

    socketRef.current.on('getMessage', async (data) => {
      // If the message is from the currently selected user, add it to chat
      if (selectedUserRef.current && selectedUserRef.current._id === data.senderId) {
        setMessages((prev) => [...prev, { ...data, isRead: true }]);
        
        // Mark as read in DB immediately. 
        // The backend now automatically emits 'messagesRead' to the sender.
        await markMessagesAsRead(data.senderId, currentUser._id);
      } else {
        // Increment unread count for the sender in the sidebar
        setUsers((prevUsers) => 
          prevUsers.map(user => 
            user._id === data.senderId 
              ? { ...user, unreadCount: (user.unreadCount || 0) + 1 } 
              : user
          )
        );
      }
    });

    socketRef.current.on('messagesRead', ({ receiverId }) => {
      if (selectedUserRef.current && selectedUserRef.current._id === receiverId) {
        setMessages((prev) => prev.map(m => ({ ...m, isRead: true })));
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUser]);

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers(currentUser._id);
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users", error);
      }
    };
    loadUsers();
  }, [currentUser]);

  // Load messages when a user is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUser) return;
      
      setLoading(true);
      try {
        const data = await fetchMessages(selectedUser._id, currentUser._id);
        setMessages(data);

        // Clear unread count for this user locally
        setUsers(prev => prev.map(u => 
          u._id === selectedUser._id ? { ...u, unreadCount: 0 } : u
        ));

      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedUser?._id, currentUser?._id]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || !selectedUser) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      text: text.trim()
    };

    try {
      // 1. Optimistically add message to UI
      const tempMessage = { ...messageData, createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, tempMessage]);

      // 2. Save to db FIRST to avoid race condition with socket
      const savedMessage = await sendApiMessage(messageData);
      
      // 3. Emit socket event only AFTER message is in DB
      socketRef.current.emit('sendMessage', {
        ...messageData,
        _id: savedMessage._id,
        createdAt: savedMessage.createdAt
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  // Initialize selectedUser from localStorage only once when users load
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current && users.length > 0) {
      const savedUserId = localStorage.getItem('selectedChatId');
      if (savedUserId) {
        const user = users.find(u => u._id === savedUserId);
        if (user) {
          setSelectedUser(user);
          hasInitializedRef.current = true;
        }
      } else {
        hasInitializedRef.current = true;
      }
    }
  }, [users]);

  return (
    <div className="h-screen w-full bg-whatsapp-gray dark:bg-[#0b141a] flex overflow-hidden transition-colors duration-300">
      {/* Desktop Layout Background */}
      <div className="absolute top-0 w-full h-32 bg-whatsapp-teal dark:bg-transparent z-0 hidden md:block"></div>
      
      <div className="z-10 w-full h-full md:p-5 flex justify-center">
        <div className="w-full max-w-[1600px] h-full flex bg-white dark:bg-[#222d34] shadow-lg md:rounded-sm overflow-hidden">
          
          {/* Sidebar Area */}
          <div className={`w-full md:w-[30%] lg:w-[35%] flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-[#313d45] ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
            <Sidebar 
              users={users} 
              activeUsers={activeUsers}
              currentUser={currentUser} 
              onLogout={logoutUser}
              selectedUser={selectedUser}
              onSelectUser={(user) => {
                setSelectedUser(user);
                localStorage.setItem('selectedChatId', user._id);
                // Reset unread count locally
                setUsers((prev) => 
                  prev.map(u => u._id === user._id ? { ...u, unreadCount: 0 } : u)
                );
              }}
            />
          </div>

          {/* Main Chat Area */}
          <div className={`w-full md:w-[70%] lg:w-[65%] flex flex-col bg-chat-pattern bg-[#efeae2] dark:bg-[#0b141a] ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
            {selectedUser ? (
              <ChatWindow 
                currentUser={currentUser}
                selectedUser={selectedUser} 
                messages={messages} 
                onSendMessage={handleSendMessage}
                onBack={() => {
                  setSelectedUser(null);
                  localStorage.removeItem('selectedChatId');
                }}
                loading={loading}
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

        </div>
      </div>
    </div>
  );
};

export default Home;
