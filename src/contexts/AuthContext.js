import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to detect if we're in mobile/online mode
const isMobileOrOffline = () => {
  return !navigator.onLine || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.location.hostname !== 'localhost';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('mylist_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Save user to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('mylist_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mylist_user');
    }
  }, [user]);

  // Helper function to sync data to backend
  const syncDataToBackend = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/save-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          userData: userData
        }),
      });
      
      if (response.ok) {
        console.log('Data synced to backend successfully');
        return true;
      }
    } catch (error) {
      console.error('Failed to sync to backend:', error);
    }
    return false;
  };

  const login = async (username) => {
    try {
      const trimmedUsername = username.trim().toLowerCase(); // Normalize username
      
      // First, always check localStorage for existing user data
      const localUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
      const localUserData = localUsers[trimmedUsername];
      
      // Try to connect to backend first
      let backendUserData = null;
      let backendAvailable = false;
      
      try {
        if (!isMobileOrOffline()) {
          const response = await fetch(`${API_BASE_URL}/auth/check-username`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: trimmedUsername }),
          });

          if (response.ok) {
            const data = await response.json();
            backendAvailable = true;
            
            if (data.exists) {
              backendUserData = {
                username: trimmedUsername,
                ...data.userData
              };
            }
          }
        }
      } catch (backendError) {
        console.log('Backend not available, using offline mode');
        backendAvailable = false;
      }
      
      // Determine the most recent and complete user data
      let finalUserData = null;
      
      if (backendUserData && localUserData) {
        // Both exist - merge them, preferring the most recently modified
        const backendTime = new Date(backendUserData.lastModified || 0).getTime();
        const localTime = new Date(localUserData.lastModified || 0).getTime();
        
        if (localTime > backendTime) {
          // Local is newer, use local and sync to backend later
          finalUserData = { username: trimmedUsername, ...localUserData };
          if (backendAvailable) {
            // Sync local data to backend in background
            syncDataToBackend(finalUserData).catch(console.error);
          }
        } else {
          // Backend is newer or same, use backend data
          finalUserData = backendUserData;
          // Update local storage with backend data
          localUsers[trimmedUsername] = finalUserData;
          localStorage.setItem('mylist_offline_users', JSON.stringify(localUsers));
        }
      } else if (backendUserData) {
        // Only backend data exists
        finalUserData = backendUserData;
        // Save to local storage
        localUsers[trimmedUsername] = finalUserData;
        localStorage.setItem('mylist_offline_users', JSON.stringify(localUsers));
      } else if (localUserData) {
        // Only local data exists
        finalUserData = { username: trimmedUsername, ...localUserData };
        if (backendAvailable) {
          // Try to sync to backend
          syncDataToBackend(finalUserData).catch(console.error);
        }
      } else {
        // No user data found anywhere
        return { success: false, needsRegistration: true };
      }
      
      // Set offline mode if backend is not available
      setOfflineMode(!backendAvailable);
      setUser(finalUserData);
      
      const modeMessage = backendAvailable ? '' : ' (Offline mode)';
      return { success: true, message: `Welcome back, ${trimmedUsername}!${modeMessage}` };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (username) => {
    try {
      const trimmedUsername = username.trim().toLowerCase(); // Normalize username
      
      // Check if user already exists locally or on backend
      const localUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
      const localUserExists = !!localUsers[trimmedUsername];
      
      let backendUserExists = false;
      let backendAvailable = false;
      
      // Try to check backend first (if available)
      try {
        if (!isMobileOrOffline()) {
          const response = await fetch(`${API_BASE_URL}/auth/check-username`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: trimmedUsername }),
          });

          if (response.ok) {
            const data = await response.json();
            backendAvailable = true;
            backendUserExists = data.exists;
          }
        }
      } catch (backendError) {
        console.log('Backend not available for registration, using offline mode');
        backendAvailable = false;
      }
      
      // Check if user already exists anywhere
      if (localUserExists || backendUserExists) {
        throw new Error('Username already exists. Please choose a different username.');
      }
      
      // Create new user data
      const userData = {
        username: trimmedUsername,
        todo: [],
        bucket: [],
        travel: [],
        media: [],
        music: [],
        books: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      
      // Save locally first (always)
      localUsers[trimmedUsername] = userData;
      localStorage.setItem('mylist_offline_users', JSON.stringify(localUsers));
      
      // Try to create on backend if available
      if (backendAvailable) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/create-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: trimmedUsername }),
          });

          if (response.ok) {
            const backendData = await response.json();
            // Merge any additional data from backend
            const mergedUserData = {
              ...userData,
              ...backendData.userData
            };
            
            // Update local storage with merged data
            localUsers[trimmedUsername] = mergedUserData;
            localStorage.setItem('mylist_offline_users', JSON.stringify(localUsers));
            
            setUser(mergedUserData);
            setOfflineMode(false);
            return { success: true, message: `Account created successfully! Welcome to myLIST, ${trimmedUsername}!` };
          }
        } catch (backendError) {
          console.error('Backend registration failed, using offline mode:', backendError);
        }
      }
      
      // Fallback to offline mode
      setOfflineMode(true);
      setUser(userData);
      
      const modeMessage = backendAvailable ? '' : ' (Offline mode)';
      return { success: true, message: `Account created successfully! Welcome to myLIST, ${trimmedUsername}!${modeMessage}` };
      
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mylist_user');
  };

  const syncData = async (userData) => {
    if (!user?.username) return;

    // If in offline mode, just save to localStorage
    if (offlineMode || isMobileOrOffline()) {
      console.log('Syncing data in offline mode');
      const key = (user.username || '').toLowerCase();
      const existingUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
      existingUsers[key] = {
        username: key,
        ...userData,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem('mylist_offline_users', JSON.stringify(existingUsers));
      
      const updatedUser = {
        username: key,
        ...userData
      };
      setUser(updatedUser);
      return { success: true, message: 'Data saved locally' };
    }

    setSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/save-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: (user.username || '').toLowerCase(),
          userData: userData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local user state with the new data
        const updatedUser = {
          username: (user.username || '').toLowerCase(),
          ...userData
        };
        setUser(updatedUser);
        return data;
      } else {
        throw new Error(data.message || 'Failed to sync data');
      }
    } catch (error) {
      console.error('Sync data error:', error);
      
      // Fall back to offline mode
      console.log('Backend sync failed, saving locally');
      setOfflineMode(true);
      
      const existingUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
      const key = (user.username || '').toLowerCase();
      existingUsers[key] = {
        username: key,
        ...userData,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem('mylist_offline_users', JSON.stringify(existingUsers));
      
      const updatedUser = {
        username: key,
        ...userData
      };
      setUser(updatedUser);
      return { success: true, message: 'Data saved locally (offline mode)' };
    } finally {
      setSyncing(false);
    }
  };

  const updateUserData = async (newData) => {
    if (!user) return { success: false, message: 'No user logged in' };

    try {
      // Update local state immediately for better UX
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);

      // If in offline mode, just save locally
      if (offlineMode || isMobileOrOffline()) {
        console.log('Updating user data in offline mode');
        
        const existingUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
        const key = (user.username || '').toLowerCase();
        existingUsers[key] = {
          username: key,
          ...updatedUser,
          lastModified: new Date().toISOString()
        };
        localStorage.setItem('mylist_offline_users', JSON.stringify(existingUsers));
        
        return { success: true, message: 'Data updated locally' };
      }

      // Try to sync with backend
      const result = await syncData(updatedUser);
      return result;
    } catch (error) {
      console.error('Error updating user data:', error);
      return { success: false, message: error.message || 'Failed to update data' };
    }
  };

  const loadUserData = async () => {
    if (!user?.username) return null;

    // If in offline mode or mobile, load from localStorage
    if (offlineMode || isMobileOrOffline()) {
      console.log('Loading user data in offline mode');
      
      const existingUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
      const key = (user.username || '').toLowerCase();
      const userData = existingUsers[key];
      
      if (userData) {
        const fullUserData = {
          username: key,
          ...userData
        };
        setUser(fullUserData);
        return fullUserData;
      }
      
      // Return current user data if no stored data found
      return user;
    }

    try {
  const response = await fetch(`${API_BASE_URL}/user/${(user.username || '').toLowerCase()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load data');
      }

      const userData = {
  username: (user.username || '').toLowerCase(),
        ...data.userData
      };
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Load data error:', error);
      
      // Fall back to offline mode
      console.log('Backend load failed, switching to offline mode');
      setOfflineMode(true);
      
    const existingUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
    const key = (user.username || '').toLowerCase();
    const userData = existingUsers[key];
      
      if (userData) {
        const fullUserData = {
      username: key,
          ...userData
        };
        setUser(fullUserData);
        return fullUserData;
      }
      
      return user;
    }
  };

  const getUserStats = async () => {
    if (!user?.username) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.username}/stats`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get stats');
      }

      return data;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    syncing,
    login,
    register,
    logout,
    syncData,
    updateUserData,
    loadUserData,
    getUserStats,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
