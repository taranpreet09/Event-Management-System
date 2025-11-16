import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/events';
import { toast } from 'react-toastify';

const EventForm = ({ existingEvent = null, onSubmit: onUpdate, isEditing = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && existingEvent) {
      const formattedDate = existingEvent.date ? new Date(existingEvent.date).toISOString().slice(0, 16) : '';
      setFormData({
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        date: formattedDate,
        location: existingEvent.location || '',
      });
    }
  }, [existingEvent, isEditing]);


  const { title, description, date, location } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createEvent(formData);
      toast.success('Event created successfully!');
      // Redirect to main dashboard (route exists and shows organizer dashboard when role=organizer)
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to create event.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };
  
  const finalOnSubmit = isEditing ? (e) => { e.preventDefault(); onUpdate(formData); } : handleCreate;
   const inputStyles = "w-full p-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";
  const buttonStyles = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200";
  
   return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-center font-heading">
        {isEditing ? 'Edit Your Event' : 'Create a New Event'}
      </h2>
      <form onSubmit={finalOnSubmit} className="space-y-6">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Event Title</label>
          <input type="text" name="title" value={title} onChange={onChange} required className={inputStyles} />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
          <textarea name="description" value={description} onChange={onChange} required rows="4" className={inputStyles} />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">Date and Time</label>
          <input type="datetime-local" name="date" value={date} onChange={onChange} required className={inputStyles} />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">Location</label>
          <input type="text" name="location" value={location} onChange={onChange} required className={inputStyles} placeholder="e.g., Online, or City, State" />
        </div>
        <div className="flex items-center justify-center pt-4">
          <button className={buttonStyles} type="submit">
            {isEditing ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;