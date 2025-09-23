import React, { useState } from 'react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:1111/api',
});

const LoginForm = () => {
  const { showModal } = useModal();
  const { login } = useAuth();
  const navigate = useNavigate(); 
  const [step, setStep] = useState('ENTER_EMAIL');
  const [displayName, setDisplayName] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/check-email', { email });
      setDisplayName(res.data.organisationName || res.data.name);
      setStep('ENTER_PASSWORD');
    } catch (err) {
       if (err.response && err.response.status === 404) {
        showModal('USER_REGISTER');
      } else {
        console.error("Error checking email", err);
      }
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    login({ email, password }, navigate);
  };

  const inputStyles = "w-full p-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";
  const buttonStyles = "w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:scale-105 transition-transform duration-200";

  return (
    <div className="p-4">
      {step === 'ENTER_EMAIL' ? (
        <div>
          <h2 className="text-3xl font-bold text-center mb-2 font-heading">Login</h2>
          <p className="text-center text-gray-500 mb-6">Welcome back to EventManager.</p>
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required className={inputStyles} placeholder="you@example.com"
              />
            </div>
            <button className={buttonStyles} type="submit">
              Continue
            </button>
            <p className="text-center text-gray-600 text-sm mt-6">
              Don't have an account?{' '}
              <button
                type="button" onClick={() => showModal('USER_REGISTER')}
                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
      ) : (
        <div>
          {displayName ? (
            <h2 className="text-3xl font-bold text-center mb-2 font-heading">Welcome, {displayName}</h2>
          ) : (
            <h2 className="text-3xl font-bold text-center mb-2 font-heading">Enter Your Password</h2>
          )}
          <p className="text-center text-gray-500 mb-6 break-words">{email}</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                type='password' id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required autoFocus className={inputStyles} placeholder="******************"
              />
            </div>
            <button className={buttonStyles} type="submit">
              Sign In
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginForm;