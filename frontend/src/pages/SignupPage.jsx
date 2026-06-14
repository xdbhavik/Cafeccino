import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coffee, Loader2 } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { addUser } = useAdmin();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!name) {
      newErrors.name = "Full Name is required.";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

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
    setSuccessMsg("");
    setApiError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await addUser({ name, email, role, password });
      setLoading(false);
      setSuccessMsg("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setLoading(false);
      setApiError(err.message || "Failed to create account.");
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

        {/* Signup Card */}
        <div className="bg-surface border border-border p-8 rounded-2xl shadow-elevated">
          <div className="mb-6">
            <h2 className="text-xl font-sora font-semibold text-text-primary mb-1">
              Create Account
            </h2>
            <p className="text-sm text-text-secondary">
              Set up your credentials to launch your cafe.
            </p>
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">
              {apiError}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aditi Sharma"
                className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-danger/50 focus:border-danger/80 focus:ring-danger/20"
                    : "border-border focus:border-accent focus:ring-accent/20"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-danger font-medium mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Address */}
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

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password (min 6 chars)"
                className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-danger/50 focus:border-danger/80 focus:ring-danger/20"
                    : "border-border focus:border-accent focus:ring-accent/20"
                }`}
              />
              {errors.password && (
                <p className="text-xs text-danger font-medium mt-1">{errors.password}</p>
              )}
            </div>

            {/* Account Role Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20 text-text-primary outline-none"
              >
                <option value="EMPLOYEE">EMPLOYEE (Cashier / POS View)</option>
                <option value="CHEF">CHEF (Kitchen Display View)</option>
              </select>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-accent text-bg font-sora font-semibold rounded-lg hover:bg-amber-500 transition-all flex items-center justify-center gap-2 hover:shadow-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Footer Back to Login */}
          <div className="mt-6 text-center border-t border-border pt-4">
            <p className="text-sm text-text-secondary">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:underline font-medium">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
