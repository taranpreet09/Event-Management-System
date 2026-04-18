import api from '../utils/auth.js';

export const changePassword = (passwordData) => {
    return api.put('/users/change-password', passwordData);
};

export const updateProfile = (profileData) => {
    return api.put('/users/update-profile', profileData);
};

export const deleteAccount = () => {
    return api.delete('/users/delete-account');
};