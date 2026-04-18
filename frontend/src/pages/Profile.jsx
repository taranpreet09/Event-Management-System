import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/auth.js';

const Profile = () => {
  const { user, logout, refreshToken } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password states
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Avatar
  const defaultAvatar = user?.profileImage || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundColor=1a1c1c&textColor=faf9f8`;
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview
    setAvatarPreview(URL.createObjectURL(file));
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = uploadRes.data.url;

      // Update profile with new image
      const res = await api.put('/users/update-profile', { profileImage: imageUrl });
      if (res.data.token) refreshToken(res.data.token);
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error('Failed to upload image.');
      setAvatarPreview(defaultAvatar);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.put('/users/update-profile', profileData);
      if (res.data.token) refreshToken(res.data.token);
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const submitPasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwords.new_password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwords.current_password,
        newPassword: passwords.new_password
      });
      toast.success("Password updated successfully.");
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm("Are you absolutely sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        await api.delete('/users/delete-account');
        toast.success("Account deleted successfully.");
        logout();
        navigate('/');
      } catch (err) {
        toast.error(err.response?.data?.msg || "Failed to delete account.");
      }
    }
  };

  const inputUnderlineStyles = "w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/40 focus:border-primary focus:ring-0 px-0 py-3 text-lg font-body font-light placeholder:text-outline-variant/50 transition-colors";

  return (
    <main className="pb-32 max-w-screen-2xl mx-auto w-full">
      {/* Profile & Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Identity Card */}
        <aside className="lg:col-span-4 space-y-10">
          <div className="relative group">
            <div className="aspect-square overflow-hidden rounded-xl bg-surface-container-low max-w-[280px]">
              <img 
                alt={`${user?.name} Profile`} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                src={avatarPreview}
                onError={(e) => { e.target.src = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundColor=1a1c1c&textColor=faf9f8`; }}
              />
            </div>
            <button 
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute -bottom-4 -right-4 bg-primary text-white p-4 rounded-xl shadow-2xl cursor-pointer hover:-translate-y-1 transition-transform disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-2xl">{isUploadingAvatar ? 'hourglass_top' : 'photo_camera'}</span>
            </button>
            <input 
              ref={fileInputRef} type="file" accept="image/*" className="hidden" 
              onChange={handleAvatarUpload}
            />
          </div>
          
          <div className="space-y-6 pt-4">
            <div className="space-y-3 max-w-[280px]">
              <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                <span className="font-body font-light text-on-surface-variant text-sm">Access Role</span>
                <span className="font-label font-bold text-[10px] uppercase tracking-widest bg-surface-container-high px-3 py-1 rounded capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                <span className="font-body font-light text-on-surface-variant text-sm">Status</span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B]"></span>
                  <span className="font-label font-bold text-[10px] uppercase tracking-widest text-[#00A86B]">Active</span>
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Forms */}
        <section className="lg:col-span-8 space-y-20">
          
          {/* Identity Details Section */}
          <div className="bg-surface-container-low p-8 md:p-10 rounded-xl">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-['Noto_Serif'] text-2xl text-primary">Identity Details</h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-primary flex items-center gap-2 group hover:opacity-70">
                  Edit Profile 
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">edit</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={submitProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline">Name</label>
                    <input name="name" value={profileData.name} onChange={handleProfileChange} required className={inputUnderlineStyles} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline">Email Address</label>
                    <input name="email" type="email" value={profileData.email} onChange={handleProfileChange} required className={inputUnderlineStyles} />
                  </div>
                </div>
                <div className="mt-10 flex gap-4 justify-end">
                  <button type="button" onClick={() => { setIsEditing(false); setProfileData({ name: user?.name || '', email: user?.email || '' }); }} className="px-8 py-3 rounded-lg border border-outline-variant/30 font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSavingProfile} className="bg-primary text-white px-8 py-3 rounded-lg font-label text-[10px] uppercase tracking-widest font-bold hover:bg-primary-container transition-colors disabled:opacity-50">
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline">Legal Name</label>
                  <div className="py-3 border-b border-outline-variant/40">
                    <span className="text-lg font-body font-light text-primary">{user?.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline">Email Address</label>
                  <div className="py-3 border-b border-outline-variant/40">
                    <span className="text-lg font-body font-light text-primary">{user?.email}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <div className="pt-16 border-t border-outline-variant/10 space-y-10">
            <div className="max-w-xl">
              <h2 className="font-['Noto_Serif'] text-2xl mb-3 text-primary">Security Update</h2>
              <p className="font-body font-light text-on-surface-variant leading-relaxed text-sm">Ensure your account remains private and secure by updating your credentials periodically.</p>
            </div>
            <form onSubmit={submitPasswordUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline" htmlFor="current_password">Current Password</label>
                <input className={inputUnderlineStyles} id="current_password" name="current_password" placeholder="••••••••" type="password" required value={passwords.current_password} onChange={handlePasswordChange} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline" htmlFor="new_password">New Password</label>
                <input className={inputUnderlineStyles} id="new_password" name="new_password" placeholder="••••••••" type="password" required value={passwords.new_password} onChange={handlePasswordChange} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline" htmlFor="confirm_password">Confirm New Password</label>
                <input className={inputUnderlineStyles} id="confirm_password" name="confirm_password" placeholder="••••••••" type="password" required value={passwords.confirm_password} onChange={handlePasswordChange} />
              </div>
              <div className="md:col-span-2 pt-4">
                <button disabled={isUpdatingPassword} className="bg-primary text-white px-10 py-4 rounded-lg flex items-center justify-between group w-full md:w-auto min-w-[220px] hover:bg-primary-container transition-all duration-300" type="submit">
                  <span className="font-label text-[10px] uppercase tracking-[0.3em] font-bold">{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
                  <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform ml-4">lock_reset</span>
                </button>
              </div>
            </form>
          </div>

          {/* Dangerous Actions */}
          <div className="pt-16 border-t border-outline-variant/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-xl bg-error-container/10 border border-error/10">
              <div>
                <h3 className="font-['Noto_Serif'] text-xl text-error mb-2">Account Deactivation</h3>
                <p className="font-body font-light text-on-surface-variant max-w-md text-sm">Once your account is deactivated, all of your curated archives and personal data will be permanently removed.</p>
              </div>
              <button 
                onClick={handleDeactivate}
                className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-error border-b border-error/20 hover:border-error hover:text-red-700 transition-all py-2 shrink-0"
              >
                Terminate Membership
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Profile;