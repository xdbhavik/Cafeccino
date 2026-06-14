import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { request } from '../../lib/api';

const AuthContext = createContext(null);

// Helper: derive avatar initials from a full name
const deriveAvatar = (name) => {
  if (!name) return 'EM';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

// Read the currently logged-in employee from the shared JWT localStorage key
const readStoredEmployee = () => {
  try {
    const raw = localStorage.getItem('cafe_admin_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    // Only treat this session as POS if the role is EMPLOYEE
    if (user.role !== 'EMPLOYEE') return null;
    return {
      ...user,
      avatar: deriveAvatar(user.name),
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(readStoredEmployee);
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const initPromiseRef = useRef(null);

  useEffect(() => {
    if (!employee) {
      setLoadingSession(false);
      return;
    }

    const initSession = async () => {
      try {
        const current = await request('/api/sessions/current');
        if (current && current.status === 'OPEN') {
          return current;
        } else {
          return await request('/api/sessions/open', { method: 'POST' });
        }
      } catch (err) {
        console.warn("Could not find active session, attempting to open a new one...");
        return await request('/api/sessions/open', { method: 'POST' });
      }
    };

    if (!initPromiseRef.current) {
      initPromiseRef.current = initSession()
        .then(sessionData => {
          setSession(sessionData);
        })
        .catch(err => {
          console.error("Failed to open employee session on backend", err);
        })
        .finally(() => {
          setLoadingSession(false);
          initPromiseRef.current = null;
        });
    }
  }, [employee]);

  const isAuthenticated = employee !== null;

  // closeSession: wipe the shared auth and end the session
  const closeSession = async (paidOrders = []) => {
    if (employee) {
      try {
        const totalSales = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        await request('/api/sessions/close', {
          method: 'POST',
          body: JSON.stringify({ closingAmount: totalSales }),
        });
      } catch (err) {
        console.error("Failed to close session on backend", err);
      }
    }
    localStorage.removeItem('cafe_admin_user');
    localStorage.removeItem('cafe_admin_token');
    setEmployee(null);
    setSession(null);
    return null;
  };

  // Kept for interface compatibility — not used since login is handled by shared LoginPage
  const login = () => false;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        employee,
        session,
        loadingSession,
        login,
        closeSession,
        setIsAuthenticated: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

