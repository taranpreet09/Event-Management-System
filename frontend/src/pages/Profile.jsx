import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../api/users';

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
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
    }

    try {
      const res = await changePassword({ currentPassword, newPassword });
      setMessage(res.data.msg);
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <p className="mb-2"><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> <span className="capitalize">{user?.role}</span></p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
        <form onSubmit={onSubmit}>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Current Password</label>
            <input type="password" name="currentPassword" value={currentPassword} onChange={onChange} required className="w-full p-2 border rounded" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">New Password</label>
            <input type="password" name="newPassword" value={newPassword} onChange={onChange} required className="w-full p-2 border rounded" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Confirm New Password</label>
            <input type="password" name="confirmNewPassword" value={confirmNewPassword} onChange={onChange} required className="w-full p-2 border rounded" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;