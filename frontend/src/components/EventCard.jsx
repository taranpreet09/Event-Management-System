import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // <-- Import Link

const EventCard = ({ eventId, title, date, location, organizerName, onRegister }) => {
  const { isAuthenticated, user } = useAuth();
  
  // Note: Your backend Event model uses _id, so we should use that for the link
  const isMyEvent = user?.id === eventId; 

  return (
    // The Link component wraps the entire card content
    <Link to={`/events/${eventId}`} className="border rounded-lg overflow-hidden shadow-lg bg-white flex flex-col hover:shadow-xl transition-shadow duration-300">
      <img src={`https://placehold.co/600x400/a0c4ff/333333?text=${title.replace(/\s+/g, '+')}`} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-sm text-gray-500 mb-2">Organized by: <strong>{organizerName}</strong></p>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-1"><strong>Date:</strong> {date}</p>
        <p className="text-gray-600"><strong>Location:</strong> {location}</p>
        
        <div className="mt-auto pt-4">
          {isAuthenticated && !isMyEvent && (
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent the Link from navigating when clicking the button
                onRegister(eventId);
              }}
              className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Register
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;