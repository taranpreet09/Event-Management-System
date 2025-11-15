import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Home from '../pages/Home';
import EventList from '../pages/EventList';
import EventDetail from '../pages/EventDetail';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../pages/DashboardLayout'; 
import UserDashboard from '../pages/UserDashboard';
import OrganizerDashboard from '../pages/OrganizerDashboard'; // <-- Duplicate removed
import CreateEvent from '../pages/CreateEvent';
import EditEvent from '../pages/EditEvent';
import Profile from '../pages/Profile'; 
import BroadcastPage from '../pages/BroadcastPage'; // <-- Correctly imported

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<EventList />} />
      <Route path="/events/:id" element={<EventDetail />} />

      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={user?.role === 'organizer' ? <OrganizerDashboard /> : <UserDashboard />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* --- ORGANIZER-ONLY ROUTES --- */}
      <Route path="/create-event" element={<ProtectedRoute requiredRole="organizer"><CreateEvent /></ProtectedRoute>} />
      <Route path="/edit-event/:id" element={<ProtectedRoute requiredRole="organizer"><EditEvent /></ProtectedRoute>} />
      
      {/* ⭐ THIS IS YOUR NEW ROUTE */}
      <Route path="/broadcast" element={<ProtectedRoute requiredRole="organizer"><BroadcastPage /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;