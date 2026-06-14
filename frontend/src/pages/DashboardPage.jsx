import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  UtensilsCrossed,
  Tag,
  Map,
  Users,
  Ticket,
  BarChart2,
  ShoppingBag,
  DollarSign,
  UserCheck,
  Calculator,
  TrendingUp,
  Crown,
  Loader2,
  Calendar,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { request } from "../lib/api";
import { formatINR } from "../lib/utils";

// Helper: format a date to ISO yyyy-MM-dd
const toISO = (d) => d.toISOString().split("T")[0];

export const DashboardPage = () => {
  const { currentUser } = useAdmin();

  // Date range — default: today
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [fromDate, setFromDate] = useState(toISO(sevenDaysAgo));
  const [toDate, setToDate] = useState(toISO(today));

  // Data states
  const [summary, setSummary] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, trendData, productsData] = await Promise.all([
        request(`/api/dashboard/summary?from=${fromDate}&to=${toDate}`),
        request(`/api/dashboard/sales-trend?from=${fromDate}&to=${toDate}`),
        request(`/api/dashboard/top-products?from=${fromDate}&to=${toDate}&limit=5`),
      ]);
      setSummary(summaryData);
      setSalesTrend(trendData || []);
      setTopProducts(productsData || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Quick Navigation Config
  const navItems = [
    { label: "Products", icon: UtensilsCrossed, path: "/admin/products", desc: "Manage menu items & pricing" },
    { label: "Categories", icon: Tag, path: "/admin/categories", desc: "Organize layout tags" },
    { label: "Floor Plan", icon: Map, path: "/admin/floor-plan", desc: "Design tables & floors" },
    { label: "Users & Staff", icon: Users, path: "/admin/users", desc: "Configure employee logins" },
    { label: "Coupons & Promos", icon: Ticket, path: "/admin/coupons", desc: "Set up discounts rules" },
    { label: "Reports & Sales", icon: BarChart2, path: "/admin/reports", desc: "View detailed statistics" },
  ];

  // Chart tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-elevated text-xs">
          <p className="text-text-secondary font-medium mb-1">{label}</p>
          <p className="text-accent font-bold">{formatINR(payload[0].value)}</p>
          {payload[0]?.payload?.orders != null && (
            <p className="text-text-secondary">{payload[0].payload.orders} orders</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sora font-bold text-text-primary">
            Welcome, {currentUser?.name || "Administrator"}
          </h1>
          <p className="text-sm text-text-secondary">
            Your business snapshot at a glance.
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-text-secondary" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-accent outline-none"
          />
          <span className="text-text-secondary text-xs">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-accent outline-none"
          />
        </div>
      </div>

      {/* Loading / Error States */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-accent" />
          <span className="ml-2 text-text-secondary text-sm">Loading dashboard...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
          Failed to load dashboard: {error}
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface border border-border p-5 rounded-xl shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Orders</p>
                <p className="text-2xl font-sora font-bold text-text-primary mt-1">{summary.totalOrders ?? 0}</p>
              </div>
              <div className="h-10 w-10 bg-surface-raised border border-border rounded-lg flex items-center justify-center text-accent">
                <ShoppingBag size={18} />
              </div>
            </div>

            <div className="bg-surface border border-border p-5 rounded-xl shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Sales</p>
                <p className="text-2xl font-mono font-bold text-success mt-1">{formatINR(summary.totalSales ?? 0)}</p>
              </div>
              <div className="h-10 w-10 bg-surface-raised border border-border rounded-lg flex items-center justify-center text-success">
                <DollarSign size={18} />
              </div>
            </div>

            <div className="bg-surface border border-border p-5 rounded-xl shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Open Sessions</p>
                <p className="text-2xl font-sora font-bold text-text-primary mt-1">{summary.openSessions ?? 0}</p>
              </div>
              <div className="h-10 w-10 bg-surface-raised border border-border rounded-lg flex items-center justify-center text-accent">
                <UserCheck size={18} />
              </div>
            </div>

            <div className="bg-surface border border-border p-5 rounded-xl shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Avg Order Value</p>
                <p className="text-2xl font-mono font-bold text-text-primary mt-1">{formatINR(summary.averageOrderValue ?? 0)}</p>
              </div>
              <div className="h-10 w-10 bg-surface-raised border border-border rounded-lg flex items-center justify-center text-text-secondary">
                <Calculator size={18} />
              </div>
            </div>
          </div>

          {/* Payment Breakdown Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border p-4 rounded-xl shadow-card">
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1">Cash Sales</p>
              <p className="text-lg font-mono font-bold text-text-primary">{formatINR(summary.cashSales ?? 0)}</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-xl shadow-card">
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1">Card Sales</p>
              <p className="text-lg font-mono font-bold text-text-primary">{formatINR(summary.cardSales ?? 0)}</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-xl shadow-card">
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1">UPI Sales</p>
              <p className="text-lg font-mono font-bold text-text-primary">{formatINR(summary.upiSales ?? 0)}</p>
            </div>
          </div>

          {/* Sales Trend Chart */}
          {salesTrend.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-accent" />
                <h2 className="font-sora font-bold text-text-primary text-lg">Sales Trend</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#9A9590", fontSize: 11 }}
                    axisLine={{ stroke: "#2E2E2E" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9A9590", fontSize: 11 }}
                    axisLine={{ stroke: "#2E2E2E" }}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#F5A623"
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Products Table */}
          {topProducts.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Crown size={18} className="text-accent" />
                <h2 className="font-sora font-bold text-text-primary text-lg">Top Products</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-text-secondary text-xs uppercase tracking-wider">
                      <th className="text-left py-3 px-2">#</th>
                      <th className="text-left py-3 px-2">Product</th>
                      <th className="text-right py-3 px-2">Qty Sold</th>
                      <th className="text-right py-3 px-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={p.productId} className="border-b border-border/50 hover:bg-surface-raised/50 transition-colors">
                        <td className="py-3 px-2 text-text-secondary font-mono">{i + 1}</td>
                        <td className="py-3 px-2 font-medium text-text-primary">{p.productName}</td>
                        <td className="py-3 px-2 text-right font-mono text-text-primary">{p.quantitySold}</td>
                        <td className="py-3 px-2 text-right font-mono text-accent font-semibold">{formatINR(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Nav Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-sora font-bold text-text-primary uppercase tracking-wide">
          Quick Management Navigation
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="bg-surface border border-border p-6 rounded-xl shadow-card hover:border-accent/50 cursor-pointer h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="h-12 w-12 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-accent mb-4">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-sora font-semibold text-text-primary text-base mb-1">
                      {item.label}
                    </h3>
                    <p className="text-xs text-text-secondary">{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider mt-4 inline-flex items-center gap-1">
                    Manage Panel &rarr;
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
