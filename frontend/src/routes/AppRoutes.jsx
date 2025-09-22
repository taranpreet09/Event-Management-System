import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- PAGE & LAYOUT IMPORTS ---
import Home from '../pages/Home';
import EventList from '../pages/EventList';
import EventDetail from '../pages/EventDetail';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../pages/DashboardLayout'; // <-- New Layout
import UserDashboard from '../pages/UserDashboard';
import OrganizerDashboard from '../pages/OrganizerDashboard';
import CreateEvent from '../pages/CreateEvent';
import EditEvent from '../pages/EditEvent';
import Profile from '../pages/Profile'; // <-- New Profile Page

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<EventList />} />
      <Route path="/events/:id" element={<EventDetail />} />

      {/* --- NEW NESTED DASHBOARD ROUTES --- */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Default dashboard route redirects based on role */}
        <Route index element={user?.role === 'organizer' ? <OrganizerDashboard /> : <UserDashboard />} />
        
        {/* Common Profile Route */}
        <Route path="profile" element={<Profile />} />
        
        {/* Add more nested routes for user/organizer as needed */}
      </Route>

      {/* --- ORGANIZER-ONLY TOP-LEVEL ROUTES --- */}
      <Route path="/create-event" element={<ProtectedRoute requiredRole="organizer"><CreateEvent /></ProtectedRoute>} />
      <Route path="/edit-event/:id" element={<ProtectedRoute requiredRole="organizer"><EditEvent /></ProtectedRoute>} />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;