import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

const PRESET_COLORS = ["#6C63FF", "#FF6584", "#43CFAB", "#F5A623", "#56CCF2"];

export const CategoryFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { categories, addCategory, updateCategory, fetchCategories } = useAdmin();

  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories().catch(console.error);
  }, []);

  useEffect(() => {
    if (isEdit && categories.length > 0) {
      const category = categories.find((c) => c.id.toString() === id.toString());
      if (category) {
        setName(category.name);
        setColor(category.colorHex || category.color || PRESET_COLORS[0]);
      } else {
        navigate("/admin/categories");
      }
    }
  }, [id, isEdit, categories, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Category Name is required.");
      return;
    }

    // Check unique category name except when editing same one
    const isDuplicate = categories.some(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id.toString() !== id?.toString()
    );
    if (isDuplicate) {
      setError("A category with this name already exists.");
      return;
    }

    const data = {
      name: name.trim(),
      colorHex: color,
    };

    try {
      if (isEdit) {
        await updateCategory(id, data);
      } else {
        await addCategory(data);
      }
      navigate("/admin/categories");
    } catch (err) {
      setError(err.message || "Failed to save category.");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
          {isEdit ? "Edit Category" : "New Category"}
        </h1>
        <p className="text-sm text-text-secondary">
          Configure visual tags and grouping labels.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-surface border border-border p-6 rounded-xl shadow-card relative overflow-hidden">
        {/* Accent strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: color }}
        />

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Beverages"
              className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          {/* Color Picker Swatches */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Theme Palette
            </label>
            <div className="flex items-center gap-3">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColor(col)}
                  className={`h-8 w-8 rounded-full border-2 transition-all relative ${
                    color.toUpperCase() === col.toUpperCase()
                      ? "border-text-primary scale-110 shadow-lg"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: col }}
                  title={col}
                >
                  {color.toUpperCase() === col.toUpperCase() && (
                    <span className="absolute inset-0.5 rounded-full border border-bg" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Hex Color Picker Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Or Custom Hex Code
            </label>
            <div className="flex items-center gap-2">
              <div
                className="h-10 w-10 border border-border rounded-lg shrink-0"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#HEXCODE"
                className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Form Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="h-10 px-5 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 bg-accent hover:bg-amber-500 text-bg font-sora font-semibold rounded-lg hover:shadow-accent transition-all"
            >
              {isEdit ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
