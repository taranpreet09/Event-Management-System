import React, { useState } from 'react';
import api from '../utils/auth.js'; 
import { toast } from 'react-toastify'; 

const BroadcastPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
  });

  const { title, text } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title || !text) {
      return toast.error('Please fill in both fields.');
    }
    
    try {
      await api.post('/broadcast', formData);
      toast.success('Broadcast message sent successfully!');
      
      setFormData({
        title: '',
        text: '',
      });
      
    } catch (err) {
      console.error(err.response.data);
      toast.error(err.response.data.msg || 'Failed to send broadcast. Are you an organizer?');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Send New Broadcast
      </h1>
      <p className="text-gray-600 mb-4">
        This message will be sent instantly to all currently active users.
      </p>
      
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="title" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="mb-6">
          <label 
            htmlFor="text" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Message
          </label>
          <textarea
            id="text"
            name="text"
            rows="4"
            value={text}
            onChange={onChange} 
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          Send Broadcast Now
        </button>
      </form>
    </div>
  );
};

export default BroadcastPage;