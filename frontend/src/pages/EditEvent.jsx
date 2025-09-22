import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, updateEvent } from '../api/events';
import EventForm from '../components/EventForm'; // We will reuse the EventForm

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEventById(id);
        setEvent(response.data);
      } catch (error) {
        console.error("Failed to fetch event", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      await updateEvent(id, formData);
      alert('Event updated successfully!');
      navigate('/dashboard/organizer');
    } catch (error) {
      alert('Failed to update event.');
      console.error("Failed to update event", error);
    }
  };

  if (loading) return <div>Loading event details...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* We will refactor EventForm to accept existing data and a custom handler */}
      <EventForm 
        existingEvent={event} 
        onSubmit={handleUpdate} 
        isEditing={true} 
      />
    </div>
  );
};

export default EditEvent;