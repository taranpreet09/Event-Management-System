import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/events';

// The form now accepts props to handle editing
const EventForm = ({ existingEvent = null, onSubmit: onUpdate, isEditing = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });
  const [error, setError] = useState('');

  // When editing, populate the form with existing event data
  useEffect(() => {
    if (isEditing && existingEvent) {
      // Format the date correctly for the datetime-local input
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

  // This is the handler for CREATING a new event
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createEvent(formData);
      alert('Event created successfully!');
      navigate('/dashboard/organizer');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create event.');
    }
  };
  
  // Use the appropriate handler based on whether we are editing or creating
  const finalOnSubmit = isEditing ? (e) => { e.preventDefault(); onUpdate(formData); } : handleCreate;
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isEditing ? 'Edit Your Event' : 'Create a New Event'}
      </h2>
      <form onSubmit={finalOnSubmit}>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        {/* Form fields remain the same */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Event Title</label>
          <input type="text" name="title" value={title} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3"/>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
          <textarea name="description" value={description} onChange={onChange} required rows="4" className="shadow appearance-none border rounded w-full py-2 px-3"/>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">Date and Time</label>
          <input type="datetime-local" name="date" value={date} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3"/>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">Location</label>
          <input type="text" name="location" value={location} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3"/>
        </div>
        <div className="flex items-center justify-center">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg" type="submit">
            {isEditing ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;