import React, { useState } from 'react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

const OrganisationRegisterForm = () => {
  const { showModal } = useModal();
  const { registerOrganizer } = useAuth(); // <-- Use registerOrganizer

  const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '' });
  const { name, email, password, password2 } = formData;
  
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    if (password !== password2) {
      console.log('Passwords do not match');
    } else {
      // The backend expects 'name' for the organization name
      registerOrganizer({ name, email, password }); // <-- Call registerOrganizer
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Register Your Organisation</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Organisation Name</label>
          <input type="text" name="name" value={name} onChange={onChange} required className="shadow-sm appearance-none border rounded w-full py-2 px-3" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Work Email Address</label>
          <input type="email" name="email" value={email} onChange={onChange} required className="shadow-sm appearance-none border rounded w-full py-2 px-3" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
          <input type="password" name="password" value={password} onChange={onChange} required minLength="6" className="shadow-sm appearance-none border rounded w-full py-2 px-3" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password2">Confirm Password</label>
          <input type="password" name="password2" value={password2} onChange={onChange} required minLength="6" className="shadow-sm appearance-none border rounded w-full py-2 px-3" />
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full" type="submit">
          Create Organisation Account
        </button>
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <button type="button" onClick={() => showModal('USER_LOGIN')} className="font-medium text-indigo-600 hover:text-indigo-500">
            Log In
          </button>
        </p>
      </form>
    </div>
  );
};

export default OrganisationRegisterForm;