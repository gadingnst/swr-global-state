/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import useAsyncProfile from '../states/stores/async-profile';

function AsyncProfile() {
  const [profile, setProfile, { isLoading, error }] = useAsyncProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email
  });

  // Sinkronkan formData dengan profile ketika profile berubah
  useEffect(() => {
    setFormData({
      name: profile.name,
      email: profile.email
    });
  }, [profile.name, profile.email]);

  const handleUpdateProfile = async() => {
    setIsUpdating(true);
    try {
      await setProfile(prev => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleTheme = async() => {
    setIsUpdating(true);
    try {
      await setProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          theme: prev.preferences.theme === 'light' ? 'dark' : 'light'
        },
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Failed to toggle theme:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleNotifications = async() => {
    setIsUpdating(true);
    try {
      await setProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          notifications: !prev.preferences.notifications
        },
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Failed to toggle notifications:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>User Profile</h3>
        <p>🔄 Loading profile from async storage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', border: '1px solid #f00', borderRadius: '8px' }}>
        <h3>User Profile</h3>
        <p>❌ Error loading profile: {error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>User Profile (Async Storage)</h3>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          style={{ padding: '8px', width: '200px' }}
          disabled={isUpdating}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          style={{ padding: '8px', width: '200px' }}
          disabled={isUpdating}
        />
      </div>

      <button
        onClick={handleUpdateProfile}
        disabled={isUpdating}
        style={{ padding: '8px 16px', marginRight: '10px' }}
      >
        {isUpdating ? '⏳' : '💾'} Update Profile
      </button>

      <div style={{ marginTop: '20px' }}>
        <h4>Preferences:</h4>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={handleToggleTheme}
            disabled={isUpdating}
            style={{
              padding: '8px 16px',
              backgroundColor: profile.preferences.theme === 'dark' ? '#333' : '#fff',
              color: profile.preferences.theme === 'dark' ? '#fff' : '#333'
            }}
          >
            {isUpdating ? '⏳' : '🎨'} Theme: {profile.preferences.theme}
          </button>

          <button
            onClick={handleToggleNotifications}
            disabled={isUpdating}
            style={{ padding: '8px 16px' }}
          >
            {isUpdating ? '⏳' : '🔔'} Notifications: {profile.preferences.notifications ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        Last updated: {new Date(profile.lastUpdated).toLocaleString()}
      </div>

      {isUpdating && (
        <p style={{ marginTop: '10px', color: '#666' }}>
          💾 Saving to async storage...
        </p>
      )}
    </div>
  );
}

export default AsyncProfile;
