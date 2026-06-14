import React, { createContext, useContext, useState, useEffect } from 'react';
import { request } from '../../lib/api';

const OrdersContext = createContext(null);

export const mapBackendOrderToFrontend = (o) => {
  if (!o) return null;
  return {
    id: o.id,
    orderNumber: `ORD-${String(o.id).padStart(4, '0')}`,
    tableId: o.tableId,
    customerId: o.customerId,
    customerName: o.customerName || 'Guest',
    status: o.status,
    items: (o.lines || []).map(line => ({
      productId: line.productId,
      productName: line.productName || null,
      quantity: line.qty,
      lineTotal: line.lineTotal,
    })),
    coupon: (o.couponCode && o.couponCode.trim() !== '' && o.couponCode !== 'NONE') ? { code: o.couponCode } : null,
    paymentMethod: o.paymentMethod,
    createdAt: o.createdAt || new Date().toISOString(),
    subtotal: o.subtotal,
    taxAmount: o.tax,
    totalDiscount: o.discount,
    total: o.total,
    sentToKitchen: o.sentToKitchen,
  };
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await request('/api/orders');
      const mapped = (data || []).map(mapBackendOrderToFrontend);
      setOrders(mapped);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getOrderById = (id) => orders.find((o) => o.id === id);

  const createOrder = async (tableId, sessionId = null) => {
    try {
      const res = await request('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ tableId, sessionId }),
      });
      const newOrder = mapBackendOrderToFrontend(res);
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      console.error("Failed to create order on backend", err);
      throw err;
    }
  };

  const updateOrder = (orderId, patch) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o))
    );
  };

  const deleteOrder = async (orderId) => {
    try {
      await request(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("Failed to cancel order", err);
    }
  };

  const setOrderStatus = (orderId, status, paymentMethod = null) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              paymentMethod: paymentMethod !== null ? paymentMethod : o.paymentMethod,
            }
          : o
      )
    );
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        createOrder,
        updateOrder,
        deleteOrder,
        setOrderStatus,
        getOrderById,
        setOrders,
        refreshOrders: fetchOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

