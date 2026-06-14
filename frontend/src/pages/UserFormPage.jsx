import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export const UserFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { users, addUser, updateUser, fetchUsers } = useAdmin();

  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee"); // "employee" | "admin"
  const [password, setPassword] = useState("");
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers().catch(console.error);
  }, []);

  useEffect(() => {
    if (isEdit && users.length > 0) {
      // Find matching user by id
      const matchedUser = users.find((u) => u.id.toString() === id.toString());
      if (matchedUser) {
        setName(matchedUser.name);
        setEmail(matchedUser.email);
        setRole(matchedUser.role?.toLowerCase() || "employee");
      } else {
        navigate("/admin/users");
      }
    }
  }, [id, isEdit, users, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Staff name is required.";
    
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!isEdit) {
      if (!password) {
        newErrors.password = "Initial password is required.";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role,
    };

    try {
      if (isEdit) {
        await updateUser(id, data);
      } else {
        // Check duplicate email for new user
        const exists = users.some((u) => u.email.toLowerCase() === data.email);
        if (exists) {
          setErrors({ email: "An account with this email address already exists." });
          return;
        }
        data.password = password;
        await addUser(data);
      }
      navigate("/admin/users");
    } catch (err) {
      alert(err.message || "Failed to save account.");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
          {isEdit ? "Edit Staff Account" : "Register New Account"}
        </h1>
        <p className="text-sm text-text-secondary">
          Configure security credentials, names, and view authorization limits.
        </p>
      </div>

      {/* Card Form */}
      <form
        onSubmit={handleSave}
        className="bg-surface border border-border p-6 rounded-xl shadow-card space-y-4"
      >
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rohan Mehta"
            className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm focus:outline-none focus:ring-2 ${
              errors.name ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
            }`}
          />
          {errors.name && <p className="text-xs text-danger font-medium">{errors.name}</p>}
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="text"
            disabled={isEdit}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. rohan@odoo-cafe.com"
            className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm focus:outline-none focus:ring-2 ${
              errors.email ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
            }`}
          />
          {errors.email && <p className="text-xs text-danger font-medium">{errors.email}</p>}
        </div>

        {/* Role Segment Toggles */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
            System Authorization Role
          </label>
          <div className="bg-surface-raised p-1 border border-border rounded-lg flex max-w-sm">
            <button
              type="button"
              onClick={() => setRole("employee")}
              className={`flex-1 h-9 rounded-md font-sora font-semibold text-xs transition-all ${
                role === "employee"
                  ? "bg-accent text-bg"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Cashier Staff
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 h-9 rounded-md font-sora font-semibold text-xs transition-all ${
                role === "admin"
                  ? "bg-accent text-bg"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Administrator
            </button>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {role === "admin"
              ? "Accesses Admin configuration dashboard panels and reports."
              : "Accesses Cashier live order sales terminal interface views."}
          </p>
        </div>

        {/* Initial Password (Create mode only) */}
        {!isEdit && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Initial Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.password ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
              }`}
            />
            {errors.password && (
              <p className="text-xs text-danger font-medium">{errors.password}</p>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="h-10 px-5 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 px-5 bg-accent hover:bg-amber-500 text-bg font-sora font-semibold rounded-lg hover:shadow-accent transition-all"
          >
            {isEdit ? "Update Account" : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
};
