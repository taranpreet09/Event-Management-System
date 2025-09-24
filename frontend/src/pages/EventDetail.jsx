import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEventById } from '../api/events';

const EventDetail = () => {
  const { id } = useParams(); 
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await getEventById(id);
        setEvent(response.data);
      } catch (err) {
        setError('Could not fetch event details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]); 

  if (loading) return <div className="text-center mt-10">Loading Event...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!event) return <div className="text-center mt-10">Event not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <img src={`https://placehold.co/1200x400/7b96d4/ffffff?text=${event.title.replace(/\s+/g, '+')}`} alt={event.title} className="w-full h-64 object-cover" />
        <div className="p-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">{event.title}</h1>
          <p className="text-lg text-gray-600 mb-6">Organized by: <span className="font-semibold text-indigo-600">{event.organizer.name}</span></p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-lg">
            <p className="text-gray-700"><strong>Date & Time:</strong> {new Date(event.date).toLocaleString()}</p>
            <p className="text-gray-700"><strong>Location:</strong> {event.location}</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">About this Event</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;