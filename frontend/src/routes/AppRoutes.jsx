import { Routes, Route } from 'react-router-dom';

// Component Imports
import Home from '../pages/Home';
import EventList from '../pages/EventList';
import EventDetail from '../pages/EventDetail';
import NotFound from '../pages/NotFound';
import UserDashboard from '../pages/UserDashboard'; // You will need to create this page
import OrganizerDashboard from '../pages/OrganizerDashboard';
import CreateEvent from '../pages/CreateEvent';

// Route Protection
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<EventList />} />
      <Route path="/event/:id" element={<EventDetail />} />

      {/* User-Specific Routes */}
      <Route 
        path="/dashboard/user"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Organizer-Specific Routes */}
      <Route 
        path="/dashboard/organizer"
        element={
          <ProtectedRoute requiredRole="organizer">
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/create-event"
        element={
          <ProtectedRoute requiredRole="organizer">
            <CreateEvent />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;