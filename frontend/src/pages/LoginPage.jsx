import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coffee, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        // Role-based redirect: ADMIN → admin dashboard, EMPLOYEE → POS view, CHEF → Kitchen
        const storedUser = JSON.parse(localStorage.getItem("cafe_admin_user") || "{}");
        if (storedUser.role === "EMPLOYEE") {
          navigate("/pos/");
        } else if (storedUser.role === "CHEF") {
          navigate("/kitchen");
        } else {
          navigate("/admin");
        }
      } else {
        setApiError(res.message);
      }
    } catch (err) {
      setLoading(false);
      setApiError(err.message || "Invalid login credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md z-10">
        {/* Logo Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Coffee className="text-accent" size={36} />
          <h1 className="font-sora font-bold text-2xl text-text-primary">
            Odoo Cafe POS
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-border p-8 rounded-2xl shadow-elevated">
          <div className="mb-6">
            <h2 className="text-xl font-sora font-semibold text-text-primary mb-1">
              Sign In
            </h2>
            <p className="text-sm text-text-secondary">
              Enter your credentials to access the system.
            </p>
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aditi@odoo-cafe.com"
                className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-danger/50 focus:border-danger/80 focus:ring-danger/20"
                    : "border-border focus:border-accent focus:ring-accent/20"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-danger font-medium mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-surface-raised border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-danger/50 focus:border-danger/80 focus:ring-danger/20"
                      : "border-border focus:border-accent focus:ring-accent/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger font-medium mt-1">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-accent text-bg font-sora font-semibold rounded-lg hover:bg-amber-500 transition-all flex items-center justify-center gap-2 hover:shadow-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer Signup Link */}
          <div className="mt-6 text-center border-t border-border pt-4">
            <p className="text-sm text-text-secondary">
              Don't have an account yet?{" "}
              <Link to="/signup" className="text-accent hover:underline font-medium">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
