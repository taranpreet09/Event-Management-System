import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/events';
import { toast } from 'react-toastify';

const EventForm = ({ existingEvent = null, onSubmit: onUpdate, isEditing = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    type: 'in_person',
    category: '',
    date: '',
    registrationDeadline: '',
    location: '',
    coverImageUrl: '',
    capacity: '',
  });
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  useEffect(() => {
    if (isEditing && existingEvent) {
      const formattedDate = existingEvent.date ? new Date(existingEvent.date).toISOString().slice(0, 16) : '';
      const formattedDeadline = existingEvent.registrationDeadline
        ? new Date(existingEvent.registrationDeadline).toISOString().slice(0, 16)
        : '';
      setFormData({
        title: existingEvent.title || '',
        shortDescription: existingEvent.shortDescription || '',
        description: existingEvent.description || '',
        type: existingEvent.type || 'in_person',
        category: existingEvent.category || '',
        date: formattedDate,
        registrationDeadline: formattedDeadline,
        location: existingEvent.location || '',
        coverImageUrl: existingEvent.coverImageUrl || '',
        capacity: existingEvent.capacity != null ? String(existingEvent.capacity) : '',
      });
    }
  }, [existingEvent, isEditing]);


  const { title, shortDescription, description, type, category, date, registrationDeadline, location, coverImageUrl, capacity } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const uploadImage = async (file) => {
    setImageUploadError('');
    setImageUploading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const data = new FormData();
      data.append('image', file);

      const res = await fetch(`${baseUrl}/api/uploads/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: data,
      });

      if (!res.ok) {
        throw new Error('Image upload failed.');
      }

      const json = await res.json();
      setFormData((prev) => ({ ...prev, coverImageUrl: json.url }));
    } catch (err) {
      console.error(err);
      setImageUploadError(err.message || 'Image upload failed.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation to give fast feedback
    const now = new Date();
    const eventDate = new Date(date);
    const regDeadline = new Date(registrationDeadline);

    if (!title || !shortDescription || !description || !type || !category || !date || !registrationDeadline || !location || !coverImageUrl || !capacity) {
      setError('All fields are required.');
      return;
    }

    if (isNaN(eventDate.getTime()) || isNaN(regDeadline.getTime())) {
      setError('Please provide valid dates.');
      return;
    }

    if (eventDate <= now) {
      setError('Event date must be in the future.');
      return;
    }

    if (regDeadline >= eventDate) {
      setError('Registration deadline must be before the event date.');
      return;
    }

    if (regDeadline <= now) {
      setError('Registration deadline must be in the future.');
      return;
    }

    if (Number(capacity) <= 0) {
      setError('Capacity must be a positive number.');
      return;
    }

    try {
      await createEvent({
        ...formData,
        capacity: Number(capacity),
      });
      toast.success('Event created successfully!');
      // Redirect to main dashboard (route exists and shows organizer dashboard when role=organizer)
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to create event.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };
  
  const finalOnSubmit = isEditing
    ? (e) => {
        e.preventDefault();
        onUpdate({
          ...formData,
          capacity: Number(capacity),
        });
      }
    : handleCreate;
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shortDescription">Short Description</label>
          <textarea
            name="shortDescription"
            value={shortDescription}
            onChange={onChange}
            required
            rows="2"
            maxLength={200}
            className={inputStyles}
            placeholder="A brief summary shown on cards and previews"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Full Description</label>
          <textarea name="description" value={description} onChange={onChange} required rows="4" className={inputStyles} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">Event Type</label>
            <select
              name="type"
              value={type}
              onChange={onChange}
              required
              className={inputStyles}
            >
              <option value="in_person">In-person</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Category</label>
            <select
              name="category"
              value={category}
              onChange={onChange}
              required
              className={inputStyles}
            >
              <option value="">Select category</option>
              <option value="Workshop">Workshop</option>
              <option value="Conference">Conference</option>
              <option value="Meetup">Meetup</option>
              <option value="Webinar">Webinar</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">Event Date &amp; Time</label>
            <input type="datetime-local" name="date" value={date} onChange={onChange} required className={inputStyles} />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="registrationDeadline">Registration Deadline</label>
            <input
              type="datetime-local"
              name="registrationDeadline"
              value={registrationDeadline}
              onChange={onChange}
              required
              className={inputStyles}
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">Location</label>
          <input
            type="text"
            name="location"
            value={location}
            onChange={onChange}
            required
            className={inputStyles}
            placeholder={type === 'online' ? 'e.g., Zoom/Meet link or "Online"' : 'e.g., Venue name, City, Country'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="coverImageUrl">Event Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  uploadImage(file);
                }
              }}
              className={inputStyles}
            />
            {imageUploading && (
              <p className="text-xs text-gray-500 mt-1">Uploading image...</p>
            )}
            {coverImageUrl && !imageUploading && !imageUploadError && (
              <p className="text-xs text-emerald-600 mt-1">Image uploaded successfully.</p>
            )}
            {imageUploadError && (
              <p className="text-xs text-red-600 mt-1">{imageUploadError}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">Capacity (number of seats)</label>
            <input
              type="number"
              name="capacity"
              value={capacity}
              onChange={onChange}
              required
              min="1"
              className={inputStyles}
            />
          </div>
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