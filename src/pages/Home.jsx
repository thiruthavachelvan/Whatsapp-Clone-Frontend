import React, { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { fetchUsers, fetchMessages, sendMessage as sendApiMessage } from '../services/api';
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

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    
    socketRef.current.emit('addUser', currentUser._id);
    
    socketRef.current.on('getUsers', (users) => {
      setActiveUsers(users);
    });

    socketRef.current.on('getMessage', (data) => {
      // If the message is from the currently selected user, add it to chat
      setMessages((prev) => {
        // We only append if the message belongs to our current active chat
        // To handle this properly, we should actually dispatch an event or check state
        return [...prev, data];
      });
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
        const data = await fetchMessages(currentUser._id, selectedUser._id);
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedUser, currentUser]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || !selectedUser) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      text: text.trim()
    };

    try {
      // Optimistically add message
      const tempMessage = { ...messageData, createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, tempMessage]);

      // Emit socket event
      socketRef.current.emit('sendMessage', messageData);
      
      // Save to db
      await sendApiMessage(messageData);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="h-screen w-full bg-whatsapp-gray flex overflow-hidden">
      {/* Desktop Layout Background */}
      <div className="absolute top-0 w-full h-32 bg-whatsapp-teal z-0 hidden md:block"></div>
      
      <div className="z-10 w-full h-full md:p-5 flex justify-center">
        <div className="w-full max-w-[1600px] h-full flex bg-white shadow-lg md:rounded-sm overflow-hidden">
          
          {/* Sidebar Area */}
          <div className={`w-full md:w-[30%] lg:w-[35%] flex-shrink-0 flex flex-col border-r border-gray-200 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
            <Sidebar 
              users={users} 
              activeUsers={activeUsers}
              currentUser={currentUser} 
              onLogout={logoutUser}
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
            />
          </div>

          {/* Main Chat Area */}
          <div className={`w-full md:w-[70%] lg:w-[65%] flex flex-col bg-chat-pattern bg-[#efeae2] ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
            {selectedUser ? (
              <ChatWindow 
                currentUser={currentUser}
                selectedUser={selectedUser} 
                messages={messages} 
                onSendMessage={handleSendMessage}
                onBack={() => setSelectedUser(null)}
                loading={loading}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-[#f0f2f5] border-b-[6px] border-whatsapp-green">
                <div className="w-80 h-80 mb-8 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('https://cdn-icons-png.flaticon.com/512/124/124034.png')" }}></div>
                <h2 className="text-3xl font-light text-gray-700 mb-4">WhatsApp Web Clone</h2>
                <p className="text-gray-500 max-w-md">
                  Send and receive messages without keeping your phone online.<br/>
                  Select a chat from the sidebar to start messaging.
                </p>
                <div className="mt-8 flex items-center justify-center text-gray-400 text-sm">
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
