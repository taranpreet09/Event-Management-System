import { Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext'; 

const Navbar = () => {
  const { showModal } = useModal();
  // You are correctly getting the token and logout function here
  const { token, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-indigo-600">EventManager</Link>
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-indigo-600">Home</Link>
            <Link to="/events" className="text-gray-600 hover:text-indigo-600">Events</Link>
            
            {/* --- THIS IS THE CORRECTED LOGIC --- */}
            {token ? (
              // If the token exists (user is logged in), show these:
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600">Dashboard</Link>
                <button 
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              // Otherwise (user is logged out), show this:
              <button 
                onClick={() => showModal('CHOICE')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Login
              </button>
            )}
            {/* --- END OF CORRECTED LOGIC --- */}
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;