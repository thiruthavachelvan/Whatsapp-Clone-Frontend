import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const login = async (username, email) => {
  const response = await api.post('/users/login', { username, email });
  return response.data;
};

export const fetchUsers = async (userId) => {
  const response = await api.get(`/users${userId ? `?userId=${userId}` : ''}`);
  return response.data;
};

export const fetchMessages = async (senderId, receiverId) => {
  const response = await api.get(`/messages/${senderId}/${receiverId}`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await api.post('/messages/send', messageData);
  return response.data;
};

export default api;
