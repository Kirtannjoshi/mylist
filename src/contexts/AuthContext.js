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

  const login = async (username) => {
    try {
      // Check if we're in mobile/offline mode or localhost is not available
      const shouldUseOfflineMode = isMobileOrOffline();
      
      if (shouldUseOfflineMode) {
        // Offline mode - use localStorage only
        console.log('Using offline mode for mobile/deployed environment');
        setOfflineMode(true);
        
        const existingUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
        
        if (existingUsers[username]) {
          // User exists in offline storage
          const userData = {
            username: username.trim(),
            ...existingUsers[username]
          };
          setUser(userData);
          return { success: true, message: `Welcome back, ${username}!` };
        } else {
          // User doesn't exist, needs registration
          return { success: false, needsRegistration: true };
        }
      }

      // Online mode - try to connect to backend
      const response = await fetch(`${API_BASE_URL}/auth/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.exists) {
        const userData = {
          username: username.trim(),
          ...data.userData
        };
        setUser(userData);
        return { success: true, message: data.message };
      } else {
        return { success: false, needsRegistration: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // If backend fails, fall back to offline mode
      console.log('Backend unavailable, switching to offline mode');
      setOfflineMode(true);
      
      const existingUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
      
      if (existingUsers[username]) {
        const userData = {
          username: username.trim(),
          ...existingUsers[username]
        };
        setUser(userData);
        return { success: true, message: `Welcome back, ${username}! (Offline mode)` };
      } else {
        return { success: false, needsRegistration: true };
      }
    }
  };

  const register = async (username) => {
    try {
      // Check if we're in mobile/offline mode
      const shouldUseOfflineMode = isMobileOrOffline() || offlineMode;
      
      if (shouldUseOfflineMode) {
        // Offline mode - use localStorage only
        console.log('Registering user in offline mode');
        setOfflineMode(true);
        
        const existingUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
        
        if (existingUsers[username]) {
          throw new Error('Username already exists');
        }
        
        // Create new user data
        const userData = {
          username: username.trim(),
          todo: [],
          bucket: [],
          travel: [],
          media: [],
          music: [],
          books: [],
          createdAt: new Date().toISOString()
        };
        
        // Save to offline storage
        existingUsers[username] = userData;
        localStorage.setItem('mylist_offline_users', JSON.stringify(existingUsers));
        
        setUser(userData);
        return { success: true, message: `Account created successfully! Welcome to myLIST, ${username}! (Offline mode)` };
      }

      // Online mode - try backend
      const response = await fetch(`${API_BASE_URL}/auth/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const userData = {
        username: username.trim(),
        ...data.userData
      };
      setUser(userData);
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Registration error:', error);
      
      // If backend fails, fall back to offline mode
      if (!offlineMode) {
        console.log('Backend unavailable for registration, switching to offline mode');
        setOfflineMode(true);
        
        const existingUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
        
        if (existingUsers[username]) {
          throw new Error('Username already exists');
        }
        
        const userData = {
          username: username.trim(),
          todo: [],
          bucket: [],
          travel: [],
          media: [],
          music: [],
          books: [],
          createdAt: new Date().toISOString()
        };
        
        existingUsers[username] = userData;
        localStorage.setItem('mylist_offline_users', JSON.stringify(existingUsers));
        
        setUser(userData);
        return { success: true, message: `Account created successfully! Welcome to myLIST, ${username}! (Offline mode)` };
      }
      
      throw error;
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
      
      const existingUsers = JSON.parse(localStorage.getItem('mylist_offline_users') || '{}');
      existingUsers[user.username] = {
        username: user.username,
        ...userData,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem('mylist_offline_users', JSON.stringify(existingUsers));
      
      const updatedUser = {
        username: user.username,
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
          username: user.username,
          userData: userData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local user state with the new data
        const updatedUser = {
          username: user.username,
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
      existingUsers[user.username] = {
        username: user.username,
        ...userData,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem('mylist_offline_users', JSON.stringify(existingUsers));
      
      const updatedUser = {
        username: user.username,
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
        existingUsers[user.username] = {
          username: user.username,
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
      const userData = existingUsers[user.username];
      
      if (userData) {
        const fullUserData = {
          username: user.username,
          ...userData
        };
        setUser(fullUserData);
        return fullUserData;
      }
      
      // Return current user data if no stored data found
      return user;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.username}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load data');
      }

      const userData = {
        username: user.username,
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
      const userData = existingUsers[user.username];
      
      if (userData) {
        const fullUserData = {
          username: user.username,
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
