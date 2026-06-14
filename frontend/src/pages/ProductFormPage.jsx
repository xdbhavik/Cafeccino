import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FolderPlus, HelpCircle } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { Dialog } from "../components/ui/Dialog";

const PRESET_COLORS = ["#6C63FF", "#FF6584", "#43CFAB", "#F5A623", "#56CCF2"];

export const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, categories, addProduct, updateProduct, addCategory, fetchProducts, fetchCategories } = useAdmin();

  const isEdit = Boolean(id);

  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("Piece");
  const [tax, setTax] = useState("5");
  const [description, setDescription] = useState("");
  
  const [errors, setErrors] = useState({});

  // Inline category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [newCatError, setNewCatError] = useState("");

  // Fetch categories and products on mount
  useEffect(() => {
    fetchCategories().catch(console.error);
    fetchProducts().catch(console.error);
  }, []);

  // Load existing product if editing
  useEffect(() => {
    if (isEdit && products.length > 0) {
      const product = products.find((p) => p.id.toString() === id.toString());
      if (product) {
        setName(product.name);
        setCategoryId(product.categoryId?.toString() || "");
        setPrice(product.price.toString());
        setUnit(product.uom || product.unit || "Piece");
        setTax(product.tax.toString());
        setDescription(product.description || "");
      } else {
        navigate("/admin/products");
      }
    }
  }, [id, isEdit, products, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Product Name is required.";
    if (!categoryId) newErrors.category = "Category selection is required.";
    
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = "Please enter a valid price greater than 0.";
    }

    const parsedTax = parseFloat(tax);
    if (isNaN(parsedTax) || parsedTax < 0 || parsedTax > 100) {
      newErrors.tax = "Tax rate must be between 0 and 100%.";
    }

    if (!unit.trim()) newErrors.unit = "Unit of measure is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const existing = isEdit ? products.find((p) => p.id.toString() === id.toString()) : null;

    const data = {
      name,
      categoryId: Number(categoryId),
      price: parseFloat(price),
      uom: unit,
      tax: parseFloat(tax),
      description,
      showOnKDS: existing ? existing.showOnKDS : true,
      isActive: existing ? existing.isActive : true,
      imagePath: existing ? existing.imagePath : "/images/cappuccino.jpg",
    };

    try {
      if (isEdit) {
        await updateProduct(id, data);
      } else {
        await addProduct(data);
      }
      navigate("/admin/products");
    } catch (err) {
      alert(err.message || "Failed to save product.");
    }
  };

  const handleInlineCategoryCreate = async (e) => {
    e.preventDefault();
    setNewCatError("");

    if (!newCatName.trim()) {
      setNewCatError("Category Name is required.");
      return;
    }

    // Check if category name already exists
    const exists = categories.some(
      (c) => c.name.toLowerCase() === newCatName.trim().toLowerCase()
    );
    if (exists) {
      setNewCatError("Category name already exists.");
      return;
    }

    try {
      const created = await addCategory({
        name: newCatName.trim(),
        colorHex: newCatColor,
      });

      // Auto-select the newly created category
      setCategoryId(created.id.toString());
      setCategoryModalOpen(false);
      setNewCatName("");
      setNewCatColor(PRESET_COLORS[0]);
    } catch (err) {
      setNewCatError(err.message || "Failed to create category.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
          {isEdit ? "Edit Product" : "Create New Product"}
        </h1>
        <p className="text-sm text-text-secondary">
          Define product names, rates, and parameters for your menus.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSave}
        className="bg-surface border border-border p-6 rounded-xl shadow-card space-y-4"
      >
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Product Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Espresso Romano"
            className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.name ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
            }`}
          />
          {errors.name && <p className="text-xs text-danger font-medium">{errors.name}</p>}
        </div>

        {/* Category Selector with Inline Creation Option */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Category
            </label>
            <button
              type="button"
              onClick={() => setCategoryModalOpen(true)}
              className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold"
            >
              <FolderPlus size={12} />
              <span>Create New Inline</span>
            </button>
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.category ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
            }`}
          >
            <option value="">Select menu category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-danger font-medium">{errors.category}</p>
          )}
        </div>

        {/* Double Column: Price & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Price */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Price (₹)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 180"
              className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm transition-all font-mono focus:outline-none focus:ring-2 ${
                errors.price ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
              }`}
            />
            {errors.price && <p className="text-xs text-danger font-medium">{errors.price}</p>}
          </div>

          {/* Unit of Measure */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Unit of Measure
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.unit ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
              }`}
            >
              <option value="Piece">Piece</option>
              <option value="Cup">Cup</option>
              <option value="Plate">Plate</option>
              <option value="Glass">Glass</option>
              <option value="Set">Set</option>
            </select>
            {errors.unit && <p className="text-xs text-danger font-medium">{errors.unit}</p>}
          </div>
        </div>

        {/* Tax Rate */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Tax Rate (%)
          </label>
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            placeholder="e.g. 5"
            className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.tax ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
            }`}
          />
          {errors.tax && <p className="text-xs text-danger font-medium">{errors.tax}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this product ingredient profile..."
            rows={3}
            className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Form Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="h-10 px-5 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 px-5 bg-accent hover:bg-amber-500 text-bg font-sora font-semibold rounded-lg hover:shadow-accent transition-all"
          >
            {isEdit ? "Update Product" : "Save Product"}
          </button>
        </div>
      </form>

      {/* Inline Create Category Modal */}
      <Dialog
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Create New Category"
      >
        <form onSubmit={handleInlineCategoryCreate} className="space-y-4">
          {newCatError && (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">
              {newCatError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Category Name
            </label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Cold Drinks"
              className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Category Accent Color
            </label>
            <div className="flex items-center gap-3">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setNewCatColor(col)}
                  className={`h-8 w-8 rounded-full border-2 transition-all relative ${
                    newCatColor === col ? "border-text-primary scale-110 shadow-lg" : "border-transparent"
                  }`}
                  style={{ backgroundColor: col }}
                >
                  {newCatColor === col && (
                    <span className="absolute inset-0.5 rounded-full border border-bg" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="h-10 px-4 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 bg-accent hover:bg-amber-500 text-bg font-sora font-semibold rounded-lg transition-all"
            >
              Create Category
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
