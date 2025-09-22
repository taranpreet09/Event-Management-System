import { Routes, Route } from 'react-router-dom';

import Home from '../pages/Home';
import Profile from '../pages/Profile';
import EventList from '../pages/EventList';
import EventDetail from '../pages/EventDetail';
import MyEvents from '../pages/MyEvents';
import CreateEvent from '../pages/CreateEvent';
import OrganizerDashboard from '../pages/OrganizerDashboard';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/events" element={<EventList />} />
      <Route path="/event/:id" element={<EventDetail />} />
      <Route path="/my-events" element={<MyEvents />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/dashboard" element={<OrganizerDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;