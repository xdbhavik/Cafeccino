import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  LayoutDashboard,
  UtensilsCrossed,
  Tag,
  CreditCard,
  Map,
  Ticket,
  Users,
  Monitor,
  BarChart2,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, cashierSessions, fetchSessions } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchSessions().catch(err => console.error("Failed to fetch sessions", err));
  }, []);

  // Map route path to dynamic titles and breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = path.split("/").filter(Boolean);
    
    // Default breadcrumbs
    const crumbs = [{ label: "Admin", link: "/admin" }];

    if (parts.length === 1) {
      crumbs.push({ label: "Dashboard", link: "/admin" });
    } else if (parts[1] === "products") {
      crumbs.push({ label: "Products", link: "/admin/products" });
      if (parts[2] === "new") crumbs.push({ label: "New Product" });
      else if (parts[3] === "edit") crumbs.push({ label: "Edit Product" });
    } else if (parts[1] === "categories") {
      crumbs.push({ label: "Categories", link: "/admin/categories" });
      if (parts[2] === "new") crumbs.push({ label: "New Category" });
      else if (parts[3] === "edit") crumbs.push({ label: "Edit Category" });
    } else if (parts[1] === "payment-methods") {
      crumbs.push({ label: "Payment Methods" });
    } else if (parts[1] === "floor-plan") {
      crumbs.push({ label: "Floor Plan & Tables" });
    } else if (parts[1] === "coupons") {
      crumbs.push({ label: "Coupons & Promotions", link: "/admin/coupons" });
      if (parts[2] === "new") crumbs.push({ label: "New Discount" });
      else if (parts[3] === "edit") crumbs.push({ label: "Edit Discount" });
    } else if (parts[1] === "users") {
      crumbs.push({ label: "Users & Employees", link: "/admin/users" });
      if (parts[2] === "new") crumbs.push({ label: "New User" });
      else if (parts[3] === "edit") crumbs.push({ label: "Edit User" });
    } else if (parts[1] === "kds-settings") {
      crumbs.push({ label: "KDS Settings" });
    } else if (parts[1] === "reports") {
      crumbs.push({ label: "Reports & Analytics" });
    }

    return crumbs;
  };

  const getPageTitle = () => {
    const crumbs = getBreadcrumbs();
    return crumbs[crumbs.length - 1]?.label || "Dashboard";
  };

  const menuItems = [
    { label: "Home", icon: LayoutDashboard, path: "/admin" },
    { label: "Products", icon: UtensilsCrossed, path: "/admin/products" },
    { label: "Categories", icon: Tag, path: "/admin/categories" },
    { label: "Payment Methods", icon: CreditCard, path: "/admin/payment-methods" },
    { label: "Floor Plan", icon: Map, path: "/admin/floor-plan" },
    { label: "Coupons & Promos", icon: Ticket, path: "/admin/coupons" },
    { label: "Users & Employees", icon: Users, path: "/admin/users" },
    { label: "KDS Settings", icon: Monitor, path: "/admin/kds-settings" },
    { label: "Reports", icon: BarChart2, path: "/admin/reports" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const crumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-bg flex text-text-primary">
      {/* SIDEBAR - Desktop */}
      <aside className="w-64 border-r border-border bg-surface flex-col justify-between hidden md:flex fixed h-screen z-20">
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
            <Coffee className="text-accent" size={24} />
            <span className="font-sora font-bold text-lg tracking-wide text-text-primary">
              Odoo Cafe POS
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // Check if exact match or nested paths under products/categories/etc.
              const isActive = 
                item.path === "/admin" 
                  ? location.pathname === "/admin" 
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all border-l-2 ${
                    isActive
                      ? "text-accent border-accent bg-accent-dim"
                      : "text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-raised"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border bg-surface-raised/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 hover:text-red-400 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />
            {/* Sidebar content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="relative w-64 bg-surface border-r border-border h-full flex flex-col justify-between z-10"
            >
              <div>
                <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Coffee className="text-accent" size={24} />
                    <span className="font-sora font-bold text-lg text-text-primary">Odoo Cafe</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="text-text-secondary">
                    <X size={20} />
                  </button>
                </div>
                <nav className="p-4 space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = 
                      item.path === "/admin" 
                        ? location.pathname === "/admin" 
                        : location.pathname.startsWith(item.path);

                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border-l-2 transition-all ${
                          isActive
                            ? "text-accent border-accent bg-accent-dim"
                            : "text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-raised"
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="p-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-all"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTENT SHELL */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* TOPBAR */}
        <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-text-secondary hover:text-text-primary md:hidden p-1 rounded-md hover:bg-surface-raised"
            >
              <Menu size={20} />
            </button>

            {/* Dynamic Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-xs text-text-secondary font-medium overflow-x-auto whitespace-nowrap">
              {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                return (
                  <React.Fragment key={crumb.label}>
                    {idx > 0 && <ChevronRight size={12} className="text-border shrink-0" />}
                    {crumb.link && !isLast ? (
                      <Link to={crumb.link} className="hover:text-text-primary transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={isLast ? "text-accent font-semibold" : ""}>{crumb.label}</span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* User Status / Avatar */}
          <div className="flex items-center gap-3">
            {/* Session Indicator Pill */}
            {(() => {
              const activeCount = cashierSessions?.filter(s => s.status === "active").length || 0;
              return activeCount > 0 ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  {activeCount} Active {activeCount === 1 ? "Session" : "Sessions"}
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-border text-text-secondary border border-border">
                  No Active Sessions
                </span>
              );
            })()}

            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-text-primary">
                  {currentUser?.name || "Admin User"}
                </p>
                <p className="text-xs text-text-secondary capitalize">
                  {currentUser?.role || "Administrator"}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-accent text-bg flex items-center justify-center font-sora font-bold text-sm">
                {currentUser?.name ? currentUser.name.split(" ").map(n => n[0]).join("") : "AD"}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE BODY */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
