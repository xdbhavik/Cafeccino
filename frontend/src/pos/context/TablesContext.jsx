import React, { createContext, useContext, useState, useEffect } from 'react';
import { request } from '../../lib/api';

const TablesContext = createContext(null);

export const TablesProvider = ({ children }) => {
  const [floors, setFloors] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeTableId, setActiveTableId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFloorsAndTables = async () => {
    try {
      setLoading(true);
      const [floorsData, tablesData, ordersData] = await Promise.all([
        request('/api/floors'),
        request('/api/tables'),
        request('/api/orders').catch(() => []), // fallback to empty array if fails
      ]);

      const mappedTables = (tablesData || []).map((t) => {
        // Find if this table has an active draft order on the backend
        const activeOrder = (ordersData || []).find(
          (o) => o.tableId === t.id && o.status === 'DRAFT'
        );
        return {
          id: t.id,
          number: t.tableNumber || `T-${t.id}`,
          seats: t.seats,
          floorId: t.floorId,
          status: (t.hasActiveOrder || activeOrder || t.activeOrderId) ? 'occupied' : 'available',
          activeOrderId: t.activeOrderId || (activeOrder ? activeOrder.id : null),
          isActive: t.isActive,
        };
      });

      setFloors(floorsData || []);
      setTables(mappedTables);
    } catch (err) {
      console.error("Failed to fetch floors and tables", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloorsAndTables();
  }, []);

  const getTableById = (id) => tables.find((t) => t.id === id);
  const getTablesByFloor = (floorId) => tables.filter((t) => t.floorId === floorId);

  const selectTable = (tableId) => {
    setActiveTableId(tableId);
  };

  const setTableStatus = (tableId, status, orderId = null) => {
    setTables((prevTables) =>
      prevTables.map((t) =>
        t.id === tableId
          ? { ...t, status, activeOrderId: orderId }
          : t
      )
    );
  };

  return (
    <TablesContext.Provider
      value={{
        floors,
        tables,
        loading,
        activeTableId,
        selectTable,
        setTableStatus,
        getTableById,
        getTablesByFloor,
        setActiveTableId,
        refreshTables: fetchFloorsAndTables,
      }}
    >
      {children}
    </TablesContext.Provider>
  );
};

export const useTables = () => {
  const context = useContext(TablesContext);
  if (!context) {
    throw new Error('useTables must be used within a TablesProvider');
  }
  return context;
};

