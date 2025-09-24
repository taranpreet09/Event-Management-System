import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../api/users';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { currentPassword, newPassword, confirmNewPassword } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
    }

    try {
      const res = await changePassword({ currentPassword, newPassword });
      setMessage(res.data.msg);
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'An error occurred.');
    }
  };
 const inputStyles = "w-full p-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";
  const buttonStyles = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200";
 return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-heading">My Profile</h1>
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-200">
        <div className="space-y-4 text-lg">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> <span className="capitalize font-semibold text-indigo-600">{user?.role}</span></p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 font-heading">Change Password</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Current Password</label>
            <input type="password" name="currentPassword" value={currentPassword} onChange={onChange} required className={inputStyles} />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
            <input type="password" name="newPassword" value={newPassword} onChange={onChange} required className={inputStyles} />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password</label>
            <input type="password" name="confirmNewPassword" value={confirmNewPassword} onChange={onChange} required className={inputStyles} />
          </div>
          <div className="pt-2">
            <button type="submit" className={buttonStyles}>
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;