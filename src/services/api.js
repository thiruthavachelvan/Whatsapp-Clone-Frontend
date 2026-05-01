import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const login = async (email) => {
  const response = await api.post('/users/login', { email });
  return response.data;
};

export const registerUser = async (username, email) => {
  const response = await api.post('/users/register', { username, email });
  return response.data;
};

export const fetchUsers = async (userId) => {
  const response = await api.get(`/users${userId ? `?userId=${userId}` : ''}`);
  return response.data;
};

export const fetchMessages = async (senderId, receiverId, isGroup = false) => {
  const response = await api.get(`/messages/${senderId}/${receiverId}?isGroup=${isGroup}`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await api.post('/messages/send', messageData);
  return response.data;
};

export const markMessagesAsRead = async (senderId, receiverId) => {
  const response = await api.put('/messages/mark-read', { senderId, receiverId });
  return response.data;
};

export const searchUsers = async (query, currentUserId) => {
  const response = await api.get(`/users/search?query=${query}&currentUserId=${currentUserId}`);
  return response.data;
};

export const updateProfile = async (userId, profileData) => {
  const response = await api.put(`/users/update/${userId}`, profileData);
  return response.data;
};

export const toggleStarMessage = async (messageId, userId) => {
  const response = await axios.put(`${API_URL}/messages/star/${messageId}`, { userId });
  return response.data;
};

export const fetchStarredMessages = async (userId) => {
  const response = await api.get(`/messages/starred/${userId}`);
  return response.data;
};

export const createGroup = async (groupData) => {
  const response = await api.post('/groups', groupData);
  return response.data;
};

export const fetchUserGroups = async (userId) => {
  const response = await api.get(`/groups/${userId}`);
  return response.data;
};

export const blockUser = async (userId, targetId) => {
  const response = await api.put('/users/block', { userId, targetId });
  return response.data;
};

export const muteChat = async (userId, chatId, muteDuration) => {
  const response = await api.put('/users/mute', { userId, chatId, muteDuration });
  return response.data;
};

export const reportUser = async (userId, targetId, reason) => {
  const response = await api.post('/users/report', { userId, targetId, reason });
  return response.data;
};

export const clearChat = async (userId, targetId, isGroup) => {
  const response = await api.post('/messages/clear', { userId, targetId, isGroup });
  return response.data;
};

export const deleteChat = async (userId, targetId) => {
  const response = await api.put('/users/hide', { userId, targetId });
  return response.data;
};

export default api;
