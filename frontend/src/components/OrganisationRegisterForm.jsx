import React, { useState } from 'react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const OrganisationRegisterForm = () => {
  const { showModal } = useModal();
  const { registerOrganizer } = useAuth(); 

  const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '' });
  const { name, email, password, password2 } = formData;
  
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    const result = await registerOrganizer({ name, email, password });
    if (!result?.ok) {
      const msg = result?.msg || 'Registration failed';
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  const inputStyles = "w-full bg-transparent border border-outline-variant/30 focus:ring-1 focus:border-primary transition-all py-3 px-3 font-body font-light placeholder:text-outline-variant text-sm rounded-lg";

  return (
    <div className="p-8">
      <div className="mb-10">
        <div className="font-headline text-2xl tracking-tighter text-primary mb-2">Register Your Organisation</div>
        <p className="font-body text-on-surface-variant">Become a curator. Partner with excellence.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold" htmlFor="name">Organisation Name</label>
          <input type="text" name="name" value={name} onChange={onChange} required className={inputStyles} placeholder="Your Organisation"/>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold" htmlFor="email">Work Email Address</label>
          <input type="email" name="email" value={email} onChange={onChange} required className={inputStyles} placeholder="contact@company.com"/>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold" htmlFor="password">Password</label>
          <input type="password" name="password" value={password} onChange={onChange} required minLength="6" className={inputStyles} placeholder="••••••••••••"/>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold" htmlFor="password2">Confirm Password</label>
          <input type="password" name="password2" value={password2} onChange={onChange} required minLength="6" className={inputStyles} placeholder="••••••••••••"/>
        </div>
        <button className="w-full bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-widest py-4 px-4 rounded-lg hover:opacity-90 transition-opacity mt-2" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Organisation Account'}
        </button>
        {error && <p className="text-center text-error text-sm font-body">{error}</p>}
        <p className="text-center text-on-surface-variant text-sm font-body">
          Already have an account?{' '}
          <button type="button" onClick={() => showModal('USER_LOGIN')} className="font-semibold text-primary hover:opacity-60 transition-opacity">
            Log In
          </button>
        </p>
      </form>
    </div>
  );
};

export default OrganisationRegisterForm;