// frontend/src/components/OrganisationRegisterForm.jsx
import React, { useState } from 'react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

const OrganisationRegisterForm = () => {
  const { showModal } = useModal();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    organisationName: '',
    name: '', // Contact person's name
    email: '',
    password: '',
    password2: ''
  });

  const { organisationName, name, email, password, password2 } = formData;
  
  const onChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    if (password !== password2) {
      console.log('Passwords do not match'); // You can add user-facing error handling here
    } else {
      // Submit all form data, crucially including the role
      register({ 
        organisationName, 
        name, 
        email, 
        password,
        role: 'organisation' // This is the key that tells the backend what to do
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Register Your Organisation</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="organisationName">Organisation Name</label>
          <input type="text" id="organisationName" value={organisationName} onChange={onChange} required className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Your Full Name (Contact Person)</label>
          <input type="text" id="name" value={name} onChange={onChange} required className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Work Email Address</label>
          <input type="email" id="email" value={email} onChange={onChange} required className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={onChange} required minLength="6" className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password2">Confirm Password</label>
          <input type="password" id="password2" value={password2} onChange={onChange} required minLength="6" className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" type="submit">
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