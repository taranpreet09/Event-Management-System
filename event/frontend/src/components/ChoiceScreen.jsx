import React from 'react';
import { useModal } from '../context/ModalContext';

const ChoiceScreen = () => {
  const { showModal } = useModal();

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6">Join or Sign In</h2>
      <div className="space-y-4">
        <button 
          onClick={() => showModal('USER_LOGIN')}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:scale-105 transition-transform duration-200"
        >
          Login as User
        </button>
        <button 
          onClick={() => showModal('ORG_REGISTER')}
          className="w-full bg-gray-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transform hover:scale-105 transition-transform duration-200"
        >
          Register as Organisation
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-6">
        Are you an organisation that wants to login? 
        <button onClick={() => showModal('USER_LOGIN')} className="text-indigo-600 hover:underline ml-1 font-semibold">Click here.</button>
      </p>
    </div>
  );
};

export default ChoiceScreen;