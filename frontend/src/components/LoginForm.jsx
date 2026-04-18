import React, { useState } from 'react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api',
});

const LoginForm = () => {
  const { showModal } = useModal();
  const { login } = useAuth();
  const navigate = useNavigate(); 
  const [step, setStep] = useState('ENTER_EMAIL');
  const [displayName, setDisplayName] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/check-email', { email });
      setDisplayName(res.data.organisationName || res.data.name);
      setStep('ENTER_PASSWORD');
    } catch (err) {
       if (err.response && err.response.status === 404) {
        showModal('USER_REGISTER');
      } else {
        const msg = err.response?.data?.msg || 'Error checking email';
        setFormError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    const result = await login({ email, password });
    if (!result?.ok) {
      const msg = result?.msg || 'Invalid credentials';
      setFormError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  const inputStyles = "w-full bg-transparent border border-outline-variant/30 focus:ring-1 focus:border-primary transition-all py-3 px-3 font-body font-light placeholder:text-outline-variant text-sm rounded-lg";
  const buttonStyles = "w-full bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-widest py-4 px-4 rounded-lg hover:opacity-90 transition-opacity";

  return (
    <div className="p-8">
      {step === 'ENTER_EMAIL' ? (
        <div>
          <div className="mb-10">
            <div className="font-headline text-2xl tracking-tighter text-primary mb-2">The Curator</div>
            <p className="font-body text-on-surface-variant">Welcome back. Enter your email to continue.</p>
          </div>
          <form onSubmit={handleEmailSubmit} className="space-y-8">
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold" htmlFor="email">
                Email Address
              </label>
              <input
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required className={inputStyles} placeholder="you@example.com"
              />
            </div>
            <button className={buttonStyles} type="submit" disabled={loading}>
              {loading ? 'Checking...' : 'Continue'}
            </button>
            <p className="text-center text-on-surface-variant text-sm mt-6 font-body">
              Don't have an account?{' '}
              <button
                type="button" onClick={() => showModal('USER_REGISTER')}
                className="font-semibold text-primary hover:opacity-60 transition-opacity"
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
      ) : (
        <div>
          <div className="mb-10">
            {displayName ? (
              <div className="font-headline text-2xl tracking-tighter text-primary mb-2">Welcome, {displayName}</div>
            ) : (
              <div className="font-headline text-2xl tracking-tighter text-primary mb-2">Enter Your Password</div>
            )}
            <p className="font-body text-on-surface-variant break-words">{email}</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-8">
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold" htmlFor="password">
                Password
              </label>
              <input
                type='password' id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required autoFocus className={inputStyles} placeholder="••••••••••••"
              />
            </div>
            <button className={buttonStyles} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            {formError && (
              <p className="text-center text-error text-sm font-body">{formError}</p>
            )}
            <button 
              type="button"
              onClick={() => setStep('ENTER_EMAIL')}
              className="w-full text-center text-on-surface-variant text-sm font-body hover:text-primary transition-colors"
            >
              ← Use a different email
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginForm;