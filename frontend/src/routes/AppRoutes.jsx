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
import InboxPage from '../pages/InboxPage';
import ConversationPage from '../pages/ConversationPage';

const AppRoutes = () => {
	const { user } = useAuth();

	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/events" element={<EventList />} />
			<Route path="/events/:id" element={<EventDetail />} />

			{/* DASHBOARD + AUTHENTICATED AREA */}
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<DashboardLayout />
					</ProtectedRoute>
				}
			>
				{/* default dashboard: organizer vs user */}
				<Route
					index
					 element={user?.role === 'organizer' ? <OrganizerDashboard /> : <UserDashboard />} 
				/>
				{/* profile */}
				<Route path="profile" element={<Profile />} />
				{/* organizer-only nested routes */}
				<Route
					path="events/create"
					element={
						<ProtectedRoute requiredRole="organizer">
							<CreateEvent />
						</ProtectedRoute>
					}
				/>
				<Route
					path="events/:id/edit"
					element={
						<ProtectedRoute requiredRole="organizer">
							<EditEvent />
						</ProtectedRoute>
					}
				/>
				<Route
					path="broadcast"
					element={
						<ProtectedRoute requiredRole="organizer">
							<BroadcastPage />
						</ProtectedRoute>
					}
				/>
				{/* inbox (any authenticated user) */}
				<Route
					path="inbox"
					element={
						<ProtectedRoute>
							<InboxPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="inbox/:conversationId"
					element={
						<ProtectedRoute>
							<ConversationPage />
						</ProtectedRoute>
					}
				/>
			</Route>

			<Route path="*" element={<NotFound />} />
		</Routes>
	);
};

export default AppRoutes;
