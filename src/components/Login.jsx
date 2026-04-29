import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { login } from '../services/api';
import { MessageSquare } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      setLoading(true);
      const user = await login(username, email);
      loginUser(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-whatsapp-gray flex flex-col items-center justify-center p-4">
      <div className="absolute top-0 w-full h-56 bg-whatsapp-teal"></div>
      
      <div className="z-10 w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-whatsapp-light p-6 flex flex-col items-center border-b border-gray-200">
          <div className="w-16 h-16 bg-whatsapp-green rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-whatsapp-dark">WhatsApp Web Clone</h1>
          <p className="text-gray-500 mt-2 text-center text-sm">
            Sign in to connect with friends
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-whatsapp-teal focus:ring-1 focus:ring-whatsapp-teal transition-colors"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-whatsapp-teal focus:ring-1 focus:ring-whatsapp-teal transition-colors"
              placeholder="Enter email address"
              autoComplete="email"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-whatsapp-green hover:bg-whatsapp-teal text-white font-bold py-3 px-4 rounded transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Connecting...' : 'Start Chatting'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
