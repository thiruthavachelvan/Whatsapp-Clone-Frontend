import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { login, registerUser } from '../services/api';
import { MessageSquare } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!isLogin && !username.trim()) {
      setError('Username is required to register');
      return;
    }

    try {
      setLoading(true);
      let user;
      if (isLogin) {
        user = await login(email);
      } else {
        user = await registerUser(username, email);
      }
      loginUser(user);
    } catch (err) {
      setError(err.response?.data?.message || `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-whatsapp-gray dark:bg-[#0b141a] flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute top-0 w-full h-56 bg-whatsapp-teal dark:bg-[#202c33]"></div>
      
      <div className="z-10 w-full max-w-md bg-white dark:bg-[#222d34] rounded-lg shadow-lg overflow-hidden border border-gray-100 dark:border-white/5">
        <div className="bg-whatsapp-light dark:bg-[#202c33] p-6 flex flex-col items-center border-b border-gray-200 dark:border-white/5">
          <div className="w-16 h-16 bg-whatsapp-green rounded-full flex items-center justify-center mb-4 shadow-md">
            <MessageSquare className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-whatsapp-dark dark:text-[#e9edef]">WhatsApp Web Clone</h1>
          <p className="text-gray-500 dark:text-[#8696a0] mt-2 text-center text-sm">
            {isLogin ? 'Sign in to connect with friends' : 'Create an account to start chatting'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-[#d1d7db] text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#2a3942] border border-gray-300 dark:border-white/10 rounded text-gray-700 dark:text-[#d1d7db] focus:outline-none focus:border-whatsapp-teal focus:ring-1 focus:ring-whatsapp-teal transition-colors"
                placeholder="Choose a username"
                autoComplete="username"
              />
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-[#d1d7db] text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#2a3942] border border-gray-300 dark:border-white/10 rounded text-gray-700 dark:text-[#d1d7db] focus:outline-none focus:border-whatsapp-teal focus:ring-1 focus:ring-whatsapp-teal transition-colors"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-whatsapp-green hover:bg-whatsapp-teal text-white font-bold py-3 px-4 rounded transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Connecting...' : (isLogin ? 'Start Chatting' : 'Create Account')}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-[#8696a0]">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-whatsapp-teal dark:text-whatsapp-green font-semibold hover:underline"
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
