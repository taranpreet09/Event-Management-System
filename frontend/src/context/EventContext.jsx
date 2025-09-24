
import { createContext } from 'react';

export const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
  const value = { events: [], addEvent: () => {}, updateEvent: () => {} };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};