import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { request } from '../../lib/api';
import { useOrders, mapBackendOrderToFrontend } from './OrdersContext';
import { useTables } from './TablesContext';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { createOrder, updateOrder, setOrderStatus, orders } = useOrders();
  const { activeTableId, setTableStatus, setActiveTableId, refreshTables } = useTables();
  const { session } = useAuth();

  const [orderId, setOrderId] = useState(null);
  const [tableId, setTableId] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Loaded from backend
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPOSData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData, promotionsData] = await Promise.all([
          request('/api/products'),
          request('/api/categories'),
          request('/api/admin/promotions').catch(() => []),
        ]);

        const mappedProducts = (productsData || []).map((p) => ({
          id: p.id,
          name: p.name,
          category: p.categoryId ? p.categoryId.toString() : 'all',
          categoryName: p.categoryName,
          categoryColorHex: p.categoryColorHex || '#F0EDE8',
          price: p.price,
          tax: p.tax,
          unit: p.uom || 'per unit',
          description: p.description,
          showOnKDS: p.showOnKDS,
          imagePath: p.imagePath,
          isActive: p.isActive,
        }));

        const mappedCategories = [
          { id: 'all', name: 'All', color: '#F0EDE8' },
          ...(categoriesData || []).map((c) => ({
            id: c.id.toString(),
            name: c.name,
            color: c.colorHex || '#F0EDE8',
          })),
        ];

        setProducts(mappedProducts);
        setCategories(mappedCategories);
        setPromotions(promotionsData || []);
      } catch (err) {
        console.error("Failed to load POS categories and products", err);
      } finally {
        setLoading(false);
      }
    };

    loadPOSData();
  }, []);

  const calculateTotals = (currentItems, currentCoupon) => {
    let subtotal = 0;
    let taxAmount = 0;

    currentItems.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        subtotal += prod.price * item.quantity;
        taxAmount += (prod.price * item.quantity * prod.tax) / 100;
      }
    });

    // Product-based promotions (summed up)
    let productPromoDiscount = 0;
    promotions.filter((p) => p.type === 'PRODUCT').forEach((promo) => {
      const item = currentItems.find((it) => it.productId === promo.applicableProductId);
      if (item) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod && item.quantity >= (promo.minQty || 0)) {
          if (promo.discountType === 'PERCENT') {
            productPromoDiscount += (prod.price * item.quantity) * (promo.discountValue / 100);
          } else if (promo.discountType === 'FLAT') {
            productPromoDiscount += promo.discountValue;
          }
        }
      }
    });

    // Order-based promotions (summed up)
    let orderPromoDiscount = 0;
    promotions.filter((p) => p.type === 'ORDER' && (!p.code)).forEach((promo) => {
      if (subtotal >= (promo.minOrderAmount || 0)) {
        if (promo.discountType === 'PERCENT') {
          orderPromoDiscount += subtotal * (promo.discountValue / 100);
        } else if (promo.discountType === 'FLAT') {
          orderPromoDiscount += promo.discountValue;
        }
      }
    });

    // Coupon discount
    let couponDiscount = 0;
    if (currentCoupon) {
      const promoCoupon = promotions.find(p => p.code === currentCoupon.code);
      if (promoCoupon) {
        if (promoCoupon.discountType === 'PERCENT') {
          couponDiscount = subtotal * (promoCoupon.discountValue / 100);
        } else if (promoCoupon.discountType === 'FLAT') {
          couponDiscount = promoCoupon.discountValue;
        }
      } else if (currentCoupon.value) {
        if (currentCoupon.type === 'percentage') {
          couponDiscount = subtotal * (currentCoupon.value / 100);
        } else if (currentCoupon.type === 'fixed') {
          couponDiscount = currentCoupon.value;
        }
      }
    }

    const totalDiscount = productPromoDiscount + orderPromoDiscount + couponDiscount;
    const total = Math.max(0, subtotal + taxAmount - totalDiscount);

    return {
      subtotal,
      taxAmount,
      productPromoDiscount,
      orderPromoDiscount,
      couponDiscount,
      totalDiscount,
      total,
    };
  };

  const activeOrder = useMemo(() => {
    return orders.find(o => o.id === orderId);
  }, [orders, orderId]);

  // Derived totals prioritizes backend calculations if activeOrder exists
  const derivedTotals = useMemo(() => {
    if (activeOrder) {
      const backendDiscount = activeOrder.totalDiscount || 0;
      const hasCoupon = !!(activeOrder.coupon && activeOrder.coupon.code);

      // Run client-side promo calculation to break down discount types
      const clientCalc = calculateTotals(items, activeOrder.coupon || coupon);

      let productPromoDiscount = clientCalc.productPromoDiscount;
      let orderPromoDiscount = clientCalc.orderPromoDiscount;
      let couponDiscount = hasCoupon ? Math.max(0, backendDiscount - productPromoDiscount - orderPromoDiscount) : 0;

      // Ensure that we exactly match the backendDiscount
      const allocated = productPromoDiscount + orderPromoDiscount + couponDiscount;
      const remaining = backendDiscount - allocated;

      if (remaining > 0) {
        if (hasCoupon) {
          couponDiscount += remaining;
        } else {
          orderPromoDiscount += remaining;
        }
      } else if (remaining < 0) {
        // scale down proportionally to match backendDiscount
        const sum = productPromoDiscount + orderPromoDiscount + couponDiscount;
        if (sum > 0) {
          const ratio = backendDiscount / sum;
          productPromoDiscount = Number((productPromoDiscount * ratio).toFixed(2));
          orderPromoDiscount = Number((orderPromoDiscount * ratio).toFixed(2));
          couponDiscount = Number((couponDiscount * ratio).toFixed(2));
        }
      }

      // Final adjustment to guarantee exact alignment with backendDiscount up to 2 decimal places
      const finalAllocated = productPromoDiscount + orderPromoDiscount + couponDiscount;
      const finalDiff = Number((backendDiscount - finalAllocated).toFixed(2));
      if (finalDiff !== 0) {
        if (hasCoupon && couponDiscount > 0) {
          couponDiscount = Number((couponDiscount + finalDiff).toFixed(2));
        } else if (orderPromoDiscount > 0) {
          orderPromoDiscount = Number((orderPromoDiscount + finalDiff).toFixed(2));
        } else if (productPromoDiscount > 0) {
          productPromoDiscount = Number((productPromoDiscount + finalDiff).toFixed(2));
        } else {
          // Fallback if everything is 0
          orderPromoDiscount = Number((orderPromoDiscount + finalDiff).toFixed(2));
        }
      }

      return {
        subtotal: activeOrder.subtotal,
        taxAmount: activeOrder.taxAmount,
        productPromoDiscount,
        orderPromoDiscount,
        couponDiscount,
        totalDiscount: backendDiscount,
        total: activeOrder.total,
      };
    }
    return calculateTotals(items, coupon);
  }, [items, coupon, activeOrder, products, promotions]);

  const addItem = async (productId) => {
    const targetTableId = tableId || activeTableId;
    if (!targetTableId) {
      console.warn("Cannot add item without active table");
      return;
    }

    let currentOrderId = orderId;
    if (!currentOrderId) {
      try {
        const newOrder = await createOrder(targetTableId, session?.id);
        currentOrderId = newOrder.id;
        setOrderId(currentOrderId);
        setTableId(targetTableId);
        setTableStatus(targetTableId, 'occupied', currentOrderId);
      } catch (err) {
        refreshTables();
        const msg = err.message || "Failed to start order.";
        throw new Error(msg);
      }
    }

    const existing = items.find((it) => it.productId === productId);
    const newQty = existing ? existing.quantity + 1 : 1;

    try {
      const res = await request(`/api/orders/${currentOrderId}/lines`, {
        method: 'PUT',
        body: JSON.stringify({
          productId,
          qty: newQty,
          lineDiscount: 0.0,
        }),
      });

      const updated = mapBackendOrderToFrontend(res);
      updateOrder(currentOrderId, updated);
      setItems(updated.items);
    } catch (err) {
      console.error("Failed to add line on backend", err);
    }
  };

  const updateQuantity = async (productId, qty) => {
    if (!orderId) return;

    try {
      const res = await request(`/api/orders/${orderId}/lines`, {
        method: 'PUT',
        body: JSON.stringify({
          productId,
          qty: qty,
          lineDiscount: 0.0,
        }),
      });

      const updated = mapBackendOrderToFrontend(res);
      updateOrder(orderId, updated);
      setItems(updated.items);
    } catch (err) {
      console.error("Failed to update line quantity on backend", err);
    }
  };

  const removeItem = async (productId) => {
    if (!orderId) return;

    try {
      const res = await request(`/api/orders/${orderId}/lines`, {
        method: 'PUT',
        body: JSON.stringify({
          productId,
          qty: 0,
          lineDiscount: 0.0,
        }),
      });

      const updated = mapBackendOrderToFrontend(res);
      updateOrder(orderId, updated);
      setItems(updated.items);
    } catch (err) {
      console.error("Failed to remove line on backend", err);
    }
  };

  const applyCoupon = async (couponObj) => {
    if (!orderId) return;
    const code = couponObj.code;
    try {
      const res = await request(`/api/orders/${orderId}/coupon`, {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      const updated = mapBackendOrderToFrontend(res);
      updateOrder(orderId, updated);
      setCoupon(couponObj);
    } catch (err) {
      console.error("Failed to apply coupon on backend", err);
      throw err;
    }
  };

  const removeCoupon = async () => {
    if (!orderId) return;
    try {
      const res = await request(`/api/orders/${orderId}/coupon`, {
        method: 'POST',
        body: JSON.stringify({ code: "NONE" }),
      });
      const updated = mapBackendOrderToFrontend(res);
      updateOrder(orderId, updated);
      setCoupon(null);
    } catch (err) {
      console.error("Failed to remove coupon on backend", err);
    }
  };

  const assignCustomer = (newCustomerId) => {
    if (!orderId) return;
    setCustomerId(newCustomerId);
    updateOrder(orderId, { customerId: newCustomerId });
  };

  const unassignCustomer = () => {
    if (!orderId) return;
    setCustomerId(null);
    updateOrder(orderId, { customerId: null });
  };

  const loadOrder = (order) => {
    if (!order) return;
    setOrderId(order.id);
    setTableId(order.tableId);
    setCustomerId(order.customerId);
    setItems(order.items);
    setCoupon(order.coupon);
    setActiveTableId(order.tableId);
  };

  const reorder = async (prevItems, targetTableId) => {
    setOrderId(null);
    setTableId(targetTableId);
    setCustomerId(null);
    setCoupon(null);

    const newOrder = await createOrder(targetTableId, session?.id);
    const newOrderId = newOrder.id;
    setOrderId(newOrderId);
    setTableStatus(targetTableId, 'occupied', newOrderId);

    let updatedOrderResponse = null;
    for (const it of prevItems) {
      updatedOrderResponse = await request(`/api/orders/${newOrderId}/lines`, {
        method: 'PUT',
        body: JSON.stringify({
          productId: it.productId,
          qty: it.quantity,
          lineDiscount: 0.0,
        }),
      });
    }

    if (updatedOrderResponse) {
      const updated = mapBackendOrderToFrontend(updatedOrderResponse);
      updateOrder(newOrderId, updated);
      setItems(updated.items);
    }
    setActiveTableId(targetTableId);
  };

  const resetCart = () => {
    setOrderId(null);
    setTableId(null);
    setCustomerId(null);
    setItems([]);
    setCoupon(null);
    // NOTE: do NOT reset activeTableId here — TablesContext controls which table
    // is active; resetting it here caused the TopNav table badge to disappear
    // immediately after selecting a new table.
  };

  const cancelOrder = async () => {
    if (!orderId) return;
    const currentTableId = tableId || activeTableId;
    try {
      await request(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      setOrderStatus(orderId, 'CANCELLED');
      if (currentTableId) {
        setTableStatus(currentTableId, 'available', null);
      }
      resetCart();
      setActiveTableId(null); // explicitly deselect table on cancel
    } catch (err) {
      console.error("Failed to cancel order on backend", err);
    }
  };

  const completeOrder = async (paymentData) => {
    if (!orderId) return null;
    const currentTableId = tableId || activeTableId;

    try {
      const res = await request(`/api/orders/${orderId}/pay`, {
        method: 'POST',
        body: JSON.stringify({
          paymentMethod: paymentData.paymentMethod || paymentData,
          receivedAmount: paymentData.receivedAmount ?? null,
          transactionRef: paymentData.transactionRef ?? null,
        }),
      });

      const pMethod = paymentData.paymentMethod || paymentData;
      const updated = mapBackendOrderToFrontend(res);
      updateOrder(orderId, updated);
      setOrderStatus(orderId, 'PAID', pMethod);

      if (currentTableId) {
        setTableStatus(currentTableId, 'available', null);
      }

      const completedSnapshot = {
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        tableId: currentTableId,
        customerId,
        items: updated.items.map((item) => {
          const prod = products.find((p) => p.id === item.productId);
          return {
            ...item,
            productName: item.productName || prod?.name || 'Item',
          };
        }),
        coupon: updated.coupon,
        paymentMethod: pMethod,
        subtotal: updated.subtotal,
        taxAmount: updated.taxAmount,
        totalDiscount: updated.totalDiscount,
        total: updated.total,
      };

      resetCart();
      setActiveTableId(null); // deselect table after payment
      return completedSnapshot;
    } catch (err) {
      console.error("Failed to pay order on backend", err);
      throw err;
    }
  };

  const sendToKitchen = async () => {
    if (!orderId) return;
    try {
      const res = await request(`/api/kitchen-tickets/orders/${orderId}/send`, {
        method: 'POST',
      });
      // The response is KitchenTicketResponse, so we shouldn't map it using mapBackendOrderToFrontend directly.
      // Instead, fetch the order again to get the updated status.
      const orderRes = await request(`/api/orders/${orderId}`);
      const updated = mapBackendOrderToFrontend(orderRes);
      updateOrder(orderId, updated);
      if (updated.items) {
        setItems(updated.items);
      }
      return updated;
    } catch (err) {
      console.error("Failed to send order to kitchen", err);
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        orderId,
        tableId: tableId || activeTableId,
        customerId,
        items,
        coupon: activeOrder?.coupon || coupon,
        products,
        categories,
        loading,
        ...derivedTotals,
        addItem,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        assignCustomer,
        unassignCustomer,
        loadOrder,
        resetCart,
        cancelOrder,
        completeOrder,
        setTableId,
        searchQuery,
        setSearchQuery,
        reorder,
        sendToKitchen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
