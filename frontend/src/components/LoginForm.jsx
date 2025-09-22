import React, { useState } from 'react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// The API instance for the one-off email check
const api = axios.create({
  baseURL: 'http://localhost:1111/api',
});

const LoginForm = () => {
  const { showModal } = useModal();
  const { login } = useAuth();
    const navigate = useNavigate(); 

  // State for managing the two-step flow
  const [step, setStep] = useState('ENTER_EMAIL');
  const [displayName, setDisplayName] = useState(null);
  
  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordShown, setPasswordShown] = useState(false);

  // Handles the first step: checking the email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/check-email', { email });
      setDisplayName(res.data.organisationName || res.data.name); 
setStep('ENTER_PASSWORD'); // Move to the next step
    } catch (err) {
       if (err.response && err.response.status === 404) {
        // If user doesn't exist, show the registration modal
        showModal('USER_REGISTER');
      } else {
        console.error("Error checking email", err);
        // For other errors, you might show a generic error message
      }
    }
  };

  // Handles the final step: submitting email and password
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    login({ email, password },navigate);
  };

  return (
    <div>
      {step === 'ENTER_EMAIL' ? (
        // --- STEP 1: RENDER THE EMAIL INPUT ---
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Login to Your Account</h2>
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <button
              className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              type="submit"
            >
              Continue
            </button>
            <p className="text-center text-gray-600 text-sm mt-6">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => showModal('USER_REGISTER')}
                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
      ) : (
        // --- STEP 2: RENDER THE PASSWORD INPUT ---
        <div>
          {displayName ? (
  <h2 className="text-2xl font-bold text-center mb-2">Welcome, {displayName}</h2>
) : (
  <h2 className="text-2xl font-bold text-center mb-2">Enter Your Password</h2>
)}
          <p className="text-center text-gray-500 text-sm mb-6 break-words">{email}</p>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordShown ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="******************"
                />
                <button
                  type="button"
                  onClick={() => setPasswordShown(!passwordShown)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mb-3 text-gray-600 hover:text-indigo-700"
                >
                  {passwordShown ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button
              className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              type="submit"
            >
              Sign In
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginForm;