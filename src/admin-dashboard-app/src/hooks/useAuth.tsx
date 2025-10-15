import { useState, useEffect } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Simulate fetching user data
        const response = await fetch('/api/user'); // Replace with actual API endpoint
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
  };
};

export default useAuth;