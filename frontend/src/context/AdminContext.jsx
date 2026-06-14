import React, { createContext, useContext, useState, useMemo } from "react";
import { request } from "../lib/api";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("cafe_admin_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [floors, setFloors] = useState([]);
  const [tables, setTables] = useState([]);
  const [promotionsList, setPromotionsList] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cashierSessions, setCashierSessions] = useState([]);

  // Distinguish Coupons vs Automated Promotions from promotionsList
  const coupons = useMemo(() => {
    return promotionsList.filter((p) => p.code !== null && p.code !== "");
  }, [promotionsList]);

  const promotions = useMemo(() => {
    return promotionsList.filter((p) => p.code === null || p.code === "");
  }, [promotionsList]);

  // Payment methods: loaded from backend
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    card: true,
    upi: true,
    upiId: "",
  });

  // Auth operations
  const login = async (email, password) => {
    const res = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res && res.token) {
      localStorage.setItem("cafe_admin_token", res.token);
      const sessionUser = { name: res.name, email: res.email, role: res.role };
      setCurrentUser(sessionUser);
      localStorage.setItem("cafe_admin_user", JSON.stringify(sessionUser));
      return { success: true };
    }
    return { success: false, message: "Invalid credentials or structure." };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("cafe_admin_user");
    localStorage.removeItem("cafe_admin_token");
  };

  // Fetching operations
  const fetchProducts = async () => {
    const data = await request("/api/products");
    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const data = await request("/api/categories");
    setCategories(data || []);
  };

  const fetchFloors = async () => {
    const data = await request("/api/floors");
    setFloors(data || []);
  };

  const fetchTables = async () => {
    const data = await request("/api/tables");
    setTables(data || []);
  };

  const fetchPromotions = async () => {
    const data = await request("/api/admin/promotions");
    setPromotionsList(data || []);
  };

  const fetchUsers = async () => {
    const data = await request("/api/users");
    setUsers(data || []);
  };

  const fetchOrders = async () => {
    const data = await request("/api/orders");
    setOrders(data || []);
  };

  const fetchSessions = async () => {
    const data = await request("/api/sessions");
    setCashierSessions(data || []);
  };

  // Product Operations
  const addProduct = async (p) => {
    const created = await request("/api/products", {
      method: "POST",
      body: JSON.stringify(p),
    });
    setProducts((prev) => [created, ...prev]);
    return created;
  };

  const updateProduct = async (id, updated) => {
    const data = await request(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updated),
    });
    setProducts((prev) => prev.map((p) => (p.id.toString() === id.toString() ? data : p)));
    return data;
  };

  const deleteProduct = async (id) => {
    await request(`/api/products/${id}`, {
      method: "DELETE",
    });
    setProducts((prev) => prev.filter((p) => p.id.toString() !== id.toString()));
  };

  // Category Operations
  const addCategory = async (cat) => {
    const body = {
      name: cat.name,
      colorHex: cat.colorHex || cat.color,
    };
    const created = await request("/api/categories", {
      method: "POST",
      body: JSON.stringify(body),
    });
    setCategories((prev) => [...prev, created]);
    return created;
  };

  const updateCategory = async (id, updated) => {
    const body = {
      name: updated.name,
      colorHex: updated.colorHex || updated.color,
    };
    const data = await request(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setCategories((prev) => prev.map((c) => (c.id.toString() === id.toString() ? data : c)));
    return data;
  };

  const deleteCategory = async (id) => {
    await request(`/api/categories/${id}`, {
      method: "DELETE",
    });
    setCategories((prev) => prev.filter((c) => c.id.toString() !== id.toString()));
  };

  // Floor Operations
  const addFloor = async (name) => {
    const created = await request("/api/floors", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setFloors((prev) => [...prev, created]);
    return created;
  };

  const deleteFloor = async (id) => {
    await request(`/api/floors/${id}`, {
      method: "DELETE",
    });
    setFloors((prev) => prev.filter((f) => f.id.toString() !== id.toString()));
    setTables((prev) => prev.filter((t) => t.floorId.toString() !== id.toString()));
  };

  // Table Operations
  const addTable = async (table) => {
    const body = {
      tableNumber: table.tableNumber || table.number,
      seats: Number(table.seats),
      floorId: Number(table.floorId),
      isActive: table.isActive !== undefined ? table.isActive : (table.active !== undefined ? table.active : true),
      hasActiveOrder: false,
    };
    const created = await request("/api/tables", {
      method: "POST",
      body: JSON.stringify(body),
    });
    setTables((prev) => [...prev, created]);
    return created;
  };

  const updateTable = async (id, updated) => {
    const body = {
      tableNumber: updated.tableNumber || updated.number,
      seats: Number(updated.seats),
      floorId: Number(updated.floorId),
      isActive: updated.isActive !== undefined ? updated.isActive : (updated.active !== undefined ? updated.active : true),
      hasActiveOrder: updated.hasActiveOrder || false,
    };
    const data = await request(`/api/tables/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setTables((prev) => prev.map((t) => (t.id.toString() === id.toString() ? data : t)));
    return data;
  };

  const deleteTable = async (id) => {
    await request(`/api/tables/${id}`, {
      method: "DELETE",
    });
    setTables((prev) => prev.filter((t) => t.id.toString() !== id.toString()));
  };

  const toggleTableActive = async (id) => {
    const table = tables.find((t) => t.id.toString() === id.toString());
    if (!table) return;
    const body = {
      tableNumber: table.tableNumber,
      seats: table.seats,
      floorId: table.floorId,
      isActive: !table.isActive,
      hasActiveOrder: table.hasActiveOrder,
    };
    const data = await request(`/api/tables/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setTables((prev) => prev.map((t) => (t.id.toString() === id.toString() ? data : t)));
  };

  // User Operations
  const addUser = async (u) => {
    const body = {
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role.toUpperCase(),
    };
    const created = await request("/api/users/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
    setUsers((prev) => [...prev, created]);
    return created;
  };

  const updateUser = async (id, updated) => {
    const body = {
      name: updated.name,
      role: updated.role.toUpperCase(),
    };
    const data = await request(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setUsers((prev) => prev.map((u) => (u.id.toString() === id.toString() ? data : u)));
    return data;
  };

  const deleteUser = async (id) => {
    await request(`/api/users/${id}`, {
      method: "DELETE",
    });
    setUsers((prev) => prev.filter((u) => u.id.toString() !== id.toString()));
  };

  const toggleUserArchive = async (id) => {
    const data = await request(`/api/users/${id}/archive`, {
      method: "PATCH",
    });
    setUsers((prev) => prev.map((u) => (u.id.toString() === id.toString() ? data : u)));
    return data;
  };

  const changeUserPassword = async (id, newPassword) => {
    const data = await request(`/api/users/${id}/password`, {
      method: "PATCH",
      body: JSON.stringify({ newPassword }),
    });
    return data;
  };

  // Promotions & Coupons Operations
  const addPromotion = async (promo) => {
    const created = await request("/api/admin/promotions", {
      method: "POST",
      body: JSON.stringify(promo),
    });
    setPromotionsList((prev) => [...prev, created]);
    return created;
  };

  const updatePromotion = async (id, updatedPromo) => {
    await request(`/api/admin/promotions/${id}`, {
      method: "DELETE",
    });
    const created = await request("/api/admin/promotions", {
      method: "POST",
      body: JSON.stringify(updatedPromo),
    });
    setPromotionsList((prev) => prev.filter((p) => p.id.toString() !== id.toString()).concat(created));
    return created;
  };

  const deletePromotion = async (id) => {
    await request(`/api/admin/promotions/${id}`, {
      method: "DELETE",
    });
    setPromotionsList((prev) => prev.filter((p) => p.id.toString() !== id.toString()));
  };

  const addCoupon = async (cp) => {
    const body = {
      name: cp.description || cp.code,
      code: cp.code.toUpperCase(),
      type: "ORDER",
      applicableProductId: null,
      minQty: null,
      discountType: cp.type === "percentage" ? "PERCENT" : "FLAT",
      discountValue: Number(cp.value),
      minOrderAmount: 100.0,
      startDate: new Date().toISOString().split(".")[0],
      endDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split(".")[0],
    };
    return await addPromotion(body);
  };

  const updateCoupon = async (code, updatedCoupon) => {
    const match = promotionsList.find((p) => p.code === code);
    if (!match) throw new Error("Coupon not found");
    const body = {
      name: updatedCoupon.description || updatedCoupon.code,
      code: updatedCoupon.code.toUpperCase(),
      type: "ORDER",
      applicableProductId: null,
      minQty: null,
      discountType: updatedCoupon.type === "percentage" ? "PERCENT" : "FLAT",
      discountValue: Number(updatedCoupon.value),
      minOrderAmount: 100.0,
      startDate: new Date().toISOString().split(".")[0],
      endDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split(".")[0],
    };
    return await updatePromotion(match.id, body);
  };

  const deleteCoupon = async (code) => {
    const match = promotionsList.find((p) => p.code === code);
    if (!match) return;
    await deletePromotion(match.id);
  };

  // KDS settings toggles showOnKDS via the product update endpoint
  const toggleKdsProduct = async (productId) => {
    const prod = products.find((p) => p.id.toString() === productId.toString());
    if (!prod) return;
    const body = {
      name: prod.name,
      categoryId: prod.categoryId,
      price: prod.price,
      uom: prod.uom,
      tax: prod.tax,
      description: prod.description,
      showOnKDS: !prod.showOnKDS,
      isActive: prod.isActive,
      imagePath: prod.imagePath || "/images/cappuccino.jpg",
    };
    await updateProduct(productId, body);
  };

  const fetchPaymentSettings = async () => {
    const data = await request("/api/settings/payment-methods");
    setPaymentMethods(data);
    return data;
  };

  const updatePaymentSettings = async (cfg) => {
    const merged = { ...paymentMethods, ...cfg };
    const data = await request("/api/settings/payment-methods", {
      method: "PUT",
      body: JSON.stringify({
        cash: merged.cash,
        card: merged.card,
        upi: merged.upi,
        upiId: merged.upiId || "",
      }),
    });
    setPaymentMethods(data);
    return data;
  };

  const value = {
    currentUser,
    cashierSessions,
    products,
    categories,
    floors,
    tables,
    coupons,
    promotions,
    users,
    orders,
    paymentMethods,
    login,
    logout,
    fetchProducts,
    fetchCategories,
    fetchFloors,
    fetchTables,
    fetchPromotions,
    fetchUsers,
    fetchOrders,
    fetchSessions,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addFloor,
    deleteFloor,
    addTable,
    updateTable,
    deleteTable,
    toggleTableActive,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    addPromotion,
    updatePromotion,
    deletePromotion,
    addUser,
    updateUser,
    deleteUser,
    toggleUserArchive,
    changeUserPassword,
    toggleKdsProduct,
    fetchPaymentSettings,
    updatePaymentSettings,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
