import React, { useState, useEffect, useCallback } from "react";
import {
  FileDown,
  Table as TableIcon,
  DollarSign,
  ShoppingBag,
  Calculator,
  Calendar,
  Loader2,
  Package,
  UserCheck,
  Receipt,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { request } from "../lib/api";
import { formatINR } from "../lib/utils";

const toISO = (d) => d.toISOString().split("T")[0];

const TABS = [
  { id: "sales", label: "Sales Summary", icon: DollarSign },
  { id: "orders", label: "Order History", icon: Receipt },
  { id: "products", label: "Product Report", icon: Package },
  { id: "sessions", label: "Session Report", icon: UserCheck },
];

const PIE_COLORS = [
  "#F5A623", "#4CAF7D", "#E05C5C", "#5C9CE0", "#9B59B6",
  "#E67E22", "#1ABC9C", "#E74C3C", "#3498DB", "#8E44AD",
];

export const ReportsPage = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);

  const [fromDate, setFromDate] = useState(toISO(thirtyDaysAgo));
  const [toDate, setToDate] = useState(toISO(today));
  const [activeTab, setActiveTab] = useState("sales");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data
  const [salesReport, setSalesReport] = useState(null);
  const [ordersReport, setOrdersReport] = useState([]);
  const [productsReport, setProductsReport] = useState([]);
  const [sessionsReport, setSessionsReport] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = `from=${fromDate}&to=${toDate}`;
      const [sales, orders, products, sessions, trend] = await Promise.all([
        request(`/api/reports/sales?${params}`),
        request(`/api/reports/orders?${params}`).catch(() => []),
        request(`/api/reports/products?${params}`).catch(() => []),
        request(`/api/reports/sessions?${params}`).catch(() => []),
        request(`/api/dashboard/sales-trend?${params}`).catch(() => []),
      ]);
      setSalesReport(sales);
      setOrdersReport(orders || []);
      setProductsReport(products || []);
      setSessionsReport(sessions || []);
      setSalesTrend(trend || []);
    } catch (err) {
      console.error("Reports fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Quick period presets
  const setPeriod = (preset) => {
    const now = new Date();
    let from = new Date(now);
    if (preset === "today") {
      from = new Date(now);
    } else if (preset === "week") {
      from.setDate(now.getDate() - 6);
    } else if (preset === "month") {
      from.setDate(now.getDate() - 29);
    } else {
      from.setFullYear(now.getFullYear() - 1);
    }
    setFromDate(toISO(from));
    setToDate(toISO(now));
  };

  // Payment breakdown for pie chart
  const paymentBreakdown = salesReport
    ? [
        { name: "Cash", value: salesReport.paymentBreakdown?.cash ?? 0, color: "#4CAF7D" },
        { name: "Card", value: salesReport.paymentBreakdown?.card ?? 0, color: "#5C9CE0" },
        { name: "UPI", value: salesReport.paymentBreakdown?.upi ?? 0, color: "#F5A623" },
      ].filter((e) => e.value > 0)
    : [];

  const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-elevated text-xs">
          <p className="text-text-secondary font-medium mb-1">{label}</p>
          <p className="text-accent font-bold">{formatINR(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
            Reports & Analytics
          </h1>
          <p className="text-sm text-text-secondary">
            Real-time backend analytics — sales, orders, products, and session reports.
          </p>
        </div>
      </div>

      {/* Date Range & Period Presets */}
      <div className="bg-surface border border-border p-4 rounded-xl shadow-card flex flex-wrap items-center gap-4">
        {/* Period presets */}
        <div className="bg-surface-raised border border-border rounded-lg p-0.5 flex h-9">
          {["today", "week", "month", "all"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 rounded-md text-xs font-semibold transition-all capitalize ${
                // Simple highlight check
                "text-text-secondary hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Calendar size={14} className="text-text-secondary" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-surface-raised border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-accent outline-none"
          />
          <span className="text-text-secondary text-xs">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-surface-raised border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-accent outline-none"
          />
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-accent" />
          <span className="ml-2 text-text-secondary text-sm">Loading reports...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
          Failed to load reports: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Sales KPI Cards */}
          {salesReport && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface border border-border p-5 rounded-xl shadow-card flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Sales</p>
                  <p className="text-2xl font-mono font-bold text-success mt-1">{formatINR(salesReport.totalSales ?? 0)}</p>
                </div>
                <div className="h-10 w-10 bg-success/10 border border-success/20 rounded-lg flex items-center justify-center text-success">
                  <DollarSign size={18} />
                </div>
              </div>
              <div className="bg-surface border border-border p-5 rounded-xl shadow-card flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Net Sales</p>
                  <p className="text-2xl font-mono font-bold text-text-primary mt-1">{formatINR(salesReport.netSales ?? 0)}</p>
                </div>
                <div className="h-10 w-10 bg-surface-raised border border-border rounded-lg flex items-center justify-center text-accent">
                  <Calculator size={18} />
                </div>
              </div>
              <div className="bg-surface border border-border p-5 rounded-xl shadow-card flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Orders</p>
                  <p className="text-2xl font-sora font-bold text-text-primary mt-1">{salesReport.orders ?? 0}</p>
                </div>
                <div className="h-10 w-10 bg-accent-dim border border-accent/20 rounded-lg flex items-center justify-center text-accent">
                  <ShoppingBag size={18} />
                </div>
              </div>
              <div className="bg-surface border border-border p-5 rounded-xl shadow-card flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Discount</p>
                  <p className="text-2xl font-mono font-bold text-danger mt-1">{formatINR(salesReport.totalDiscount ?? 0)}</p>
                </div>
                <div className="h-10 w-10 bg-danger/10 border border-danger/20 rounded-lg flex items-center justify-center text-danger">
                  <Receipt size={18} />
                </div>
              </div>
            </div>
          )}

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend */}
            <div className="lg:col-span-2 bg-surface border border-border p-5 rounded-xl shadow-card space-y-4">
              <h2 className="text-sm font-sora font-bold text-text-primary uppercase tracking-wide">
                Sales Revenue Trend
              </h2>
              <div className="h-64">
                {salesTrend.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-text-secondary text-xs">
                    No sales data for this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F5A623" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
                      <XAxis dataKey="date" stroke="#9A9590" fontSize={10} tickLine={false} />
                      <YAxis stroke="#9A9590" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="sales" stroke="#F5A623" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Payment Breakdown Pie */}
            <div className="bg-surface border border-border p-5 rounded-xl shadow-card space-y-4 flex flex-col">
              <h2 className="text-sm font-sora font-bold text-text-primary uppercase tracking-wide">
                Payment Breakdown
              </h2>
              <div className="h-48 flex items-center justify-center flex-1">
                {paymentBreakdown.length === 0 ? (
                  <div className="text-text-secondary text-xs">No data.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                        {paymentBreakdown.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", borderColor: "#2E2E2E", borderRadius: "8px" }} formatter={(val) => [formatINR(val), "Sales"]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {paymentBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary">{item.name}</span>
                    <span className="font-semibold text-text-primary ml-auto font-mono">{formatINR(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
            <div className="flex border-b border-border">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-all border-b-2 ${
                      activeTab === tab.id
                        ? "border-accent text-accent bg-accent-dim/20"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              {/* Sales Summary Tab */}
              {activeTab === "sales" && salesReport && (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised/10 text-xs font-semibold text-text-secondary uppercase">
                      <th className="py-3 px-6">Metric</th>
                      <th className="py-3 px-6 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-surface-raised/10"><td className="py-3 px-6 text-text-primary">Total Sales</td><td className="py-3 px-6 text-right font-mono font-bold text-success">{formatINR(salesReport.totalSales ?? 0)}</td></tr>
                    <tr className="hover:bg-surface-raised/10"><td className="py-3 px-6 text-text-primary">Total Tax</td><td className="py-3 px-6 text-right font-mono text-text-secondary">{formatINR(salesReport.totalTax ?? 0)}</td></tr>
                    <tr className="hover:bg-surface-raised/10"><td className="py-3 px-6 text-text-primary">Total Discount</td><td className="py-3 px-6 text-right font-mono text-danger">{formatINR(salesReport.totalDiscount ?? 0)}</td></tr>
                    <tr className="hover:bg-surface-raised/10"><td className="py-3 px-6 text-text-primary">Net Sales</td><td className="py-3 px-6 text-right font-mono font-bold text-accent">{formatINR(salesReport.netSales ?? 0)}</td></tr>
                    <tr className="hover:bg-surface-raised/10"><td className="py-3 px-6 text-text-primary">Orders Count</td><td className="py-3 px-6 text-right font-mono text-text-primary">{salesReport.orders ?? 0}</td></tr>
                    <tr className="hover:bg-surface-raised/10"><td className="py-3 px-6 text-text-primary">Cash Sales</td><td className="py-3 px-6 text-right font-mono text-text-primary">{formatINR(salesReport.paymentBreakdown?.cash ?? 0)}</td></tr>
                    <tr className="hover:bg-surface-raised/10"><td className="py-3 px-6 text-text-primary">Card Sales</td><td className="py-3 px-6 text-right font-mono text-text-primary">{formatINR(salesReport.paymentBreakdown?.card ?? 0)}</td></tr>
                    <tr className="hover:bg-surface-raised/10"><td className="py-3 px-6 text-text-primary">UPI Sales</td><td className="py-3 px-6 text-right font-mono text-text-primary">{formatINR(salesReport.paymentBreakdown?.upi ?? 0)}</td></tr>
                  </tbody>
                </table>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised/10 text-xs font-semibold text-text-secondary uppercase">
                      <th className="py-3 px-6">Order ID</th>
                      <th className="py-3 px-6">Table</th>
                      <th className="py-3 px-6">Customer</th>
                      <th className="py-3 px-6">Payment</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ordersReport.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-text-secondary text-sm">No paid orders in this period.</td></tr>
                    ) : (
                      ordersReport.map((o) => (
                        <tr key={o.id} className="hover:bg-surface-raised/10 transition-colors">
                          <td className="py-3 px-6 font-mono font-bold text-accent">#{o.id}</td>
                          <td className="py-3 px-6 text-text-secondary">{o.tableNumber || "—"}</td>
                          <td className="py-3 px-6 text-text-primary font-medium">{o.customerName || "Walk-in"}</td>
                          <td className="py-3 px-6">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-raised border border-border uppercase">
                              {o.paymentMethod || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <span className={`text-xs font-semibold ${o.status === "PAID" ? "text-success" : "text-text-secondary"}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right font-mono font-bold text-text-primary">{formatINR(o.total ?? 0)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Products Tab */}
              {activeTab === "products" && (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised/10 text-xs font-semibold text-text-secondary uppercase">
                      <th className="py-3 px-6">#</th>
                      <th className="py-3 px-6">Product</th>
                      <th className="py-3 px-6">Category</th>
                      <th className="py-3 px-6 text-right">Qty Sold</th>
                      <th className="py-3 px-6 text-right">Gross Revenue</th>
                      <th className="py-3 px-6 text-right">Discount</th>
                      <th className="py-3 px-6 text-right">Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {productsReport.length === 0 ? (
                      <tr><td colSpan={7} className="py-8 text-center text-text-secondary text-sm">No product data for this period.</td></tr>
                    ) : (
                      productsReport.map((p, i) => (
                        <tr key={p.productId} className="hover:bg-surface-raised/10 transition-colors">
                          <td className="py-3 px-6 text-text-secondary font-mono">{i + 1}</td>
                          <td className="py-3 px-6 font-medium text-text-primary">{p.productName}</td>
                          <td className="py-3 px-6 text-text-secondary">{p.categoryName || "—"}</td>
                          <td className="py-3 px-6 text-right font-mono text-text-primary">{p.quantitySold}</td>
                          <td className="py-3 px-6 text-right font-mono text-success">{formatINR(p.grossRevenue ?? 0)}</td>
                          <td className="py-3 px-6 text-right font-mono text-danger">{formatINR(p.discount ?? 0)}</td>
                          <td className="py-3 px-6 text-right font-mono font-bold text-accent">{formatINR(p.netRevenue ?? 0)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Sessions Tab */}
              {activeTab === "sessions" && (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised/10 text-xs font-semibold text-text-secondary uppercase">
                      <th className="py-3 px-6">Session ID</th>
                      <th className="py-3 px-6">Employee</th>
                      <th className="py-3 px-6">Open Time</th>
                      <th className="py-3 px-6">Close Time</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Orders</th>
                      <th className="py-3 px-6 text-right">Sales</th>
                      <th className="py-3 px-6 text-right">Closing Amt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sessionsReport.length === 0 ? (
                      <tr><td colSpan={8} className="py-8 text-center text-text-secondary text-sm">No session data for this period.</td></tr>
                    ) : (
                      sessionsReport.map((s) => (
                        <tr key={s.sessionId} className="hover:bg-surface-raised/10 transition-colors">
                          <td className="py-3 px-6 font-mono font-bold text-accent">#{s.sessionId}</td>
                          <td className="py-3 px-6 text-text-primary font-medium">{s.employeeName}</td>
                          <td className="py-3 px-6 text-text-secondary text-xs">{s.openTime ? new Date(s.openTime).toLocaleString() : "—"}</td>
                          <td className="py-3 px-6 text-text-secondary text-xs">{s.closeTime ? new Date(s.closeTime).toLocaleString() : "—"}</td>
                          <td className="py-3 px-6">
                            <span className={`text-xs font-semibold ${s.status === "OPEN" ? "text-success" : "text-text-secondary"}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right font-mono text-text-primary">{s.orders ?? 0}</td>
                          <td className="py-3 px-6 text-right font-mono text-success">{formatINR(s.sales ?? 0)}</td>
                          <td className="py-3 px-6 text-right font-mono text-text-primary">{formatINR(s.closingAmount ?? 0)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
