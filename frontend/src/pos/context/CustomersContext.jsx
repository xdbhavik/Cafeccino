import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { request } from '../../lib/api';

const CustomersContext = createContext(null);

export const CustomersProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await request('/api/customers');
      setCustomers(data || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addCustomer = async (data) => {
    const body = {
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      address: data.address || '',
    };
    const created = await request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setCustomers((prev) => [created, ...prev]);
    return created;
  };

  const updateCustomer = async (id, data) => {
    const body = {
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      address: data.address || '',
    };
    const updated = await request(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? updated : c))
    );
    return updated;
  };

  const deleteCustomer = async (id) => {
    await request(`/api/customers/${id}`, {
      method: 'DELETE',
    });
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const archiveCustomer = async (id) => {
    const updated = await request(`/api/customers/${id}/archive`, {
      method: 'PATCH',
    });
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? updated : c))
    );
    return updated;
  };

  const searchCustomers = (query) => {
    if (!query) return customers;
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  };

  const lookupByPhone = async (phone) => {
    if (!phone || phone.length < 10) return null;
    try {
      const found = await request(`/api/customers/phone/${encodeURIComponent(phone)}`);
      return found;
    } catch (err) {
      // 404 or not found — return null
      return null;
    }
  };

  return (
    <CustomersContext.Provider
      value={{
        customers,
        loading,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        archiveCustomer,
        searchCustomers,
        lookupByPhone,
        refreshCustomers: fetchCustomers,
      }}
    >
      {children}
    </CustomersContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomersContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomersProvider');
  }
  return context;
};
