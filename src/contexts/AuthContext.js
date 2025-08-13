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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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
      throw error;
    }
  };

  const register = async (username) => {
    try {
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
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mylist_user');
  };

  const syncData = async (userData) => {
    if (!user?.username) return;

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

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const loadUserData = async () => {
    if (!user?.username) return null;

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
      throw error;
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
