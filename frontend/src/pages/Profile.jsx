import React, { useState } from 'react';
import { User, Phone, MapPin, Lock, Save, Package, Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Alert from '../components/common/Alert';

const Profile = () => {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'United States',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const payload = {
        name: profileData.name,
        phone: profileData.phone,
        address: {
          street: profileData.street,
          city: profileData.city,
          state: profileData.state,
          zipCode: profileData.zipCode,
          country: profileData.country,
        },
      };

      await authService.updateProfile(payload);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Could not update profile information.',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'danger', text: 'New password must have at least 6 characters.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to change password. Verify your current password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem', maxWidth: '880px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>My Account Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your personal details, default shipping address, and password security.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Profile Information Form */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--primary)" /> Personal & Shipping Details
          </h2>

          {profileMessage && <Alert type={profileMessage.type} message={profileMessage.text} />}

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className="input"
                value={profileData.name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Email (Immutable)
              </label>
              <input
                type="email"
                className="input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: 'var(--bg-subtle)', cursor: 'not-allowed' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                className="input"
                value={profileData.phone}
                onChange={handleProfileChange}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                Default Shipping Destination
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    className="input"
                    value={profileData.street}
                    onChange={handleProfileChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      className="input"
                      value={profileData.city}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      className="input"
                      value={profileData.state}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      className="input"
                      value={profileData.zipCode}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      className="input"
                      value={profileData.country}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="btn btn-primary"
              style={{ padding: '0.75rem', marginTop: '0.5rem', fontWeight: 700 }}
            >
              {profileLoading ? 'Saving Changes...' : 'Update Profile Details'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          height: 'fit-content',
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="var(--primary)" /> Change Security Password
          </h2>

          {passwordMessage && <Alert type={passwordMessage.type} message={passwordMessage.text} />}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                className="input"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                className="input"
                placeholder="At least 6 characters"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="input"
                placeholder="Repeat new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="btn btn-outline"
              style={{ padding: '0.75rem', marginTop: '0.5rem', fontWeight: 700 }}
            >
              {passwordLoading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
