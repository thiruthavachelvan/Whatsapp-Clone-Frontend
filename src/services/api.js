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

export const toggleStarMessage = async (messageId) => {
  const response = await api.put(`/messages/star/${messageId}`);
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

export default api;
