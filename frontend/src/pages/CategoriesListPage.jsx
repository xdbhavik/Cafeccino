import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, HelpCircle, Tag } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { Dialog } from "../components/ui/Dialog";

export const CategoriesListPage = () => {
  const navigate = useNavigate();
  const { categories, deleteCategory, products, fetchCategories, fetchProducts } = useAdmin();

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [dependencyWarning, setDependencyWarning] = useState("");

  React.useEffect(() => {
    fetchCategories().catch(console.error);
    fetchProducts().catch(console.error);
  }, []);

  const handleDeleteTrigger = (catId) => {
    // Check if category has products linked to it
    const linkedProducts = products.filter((p) => p.categoryId?.toString() === catId?.toString());
    if (linkedProducts.length > 0) {
      setDependencyWarning(
        `Warning: There are ${linkedProducts.length} product(s) currently linked to this category. Deleting this category will leave these items uncategorized.`
      );
    } else {
      setDependencyWarning("");
    }
    setDeleteTargetId(catId);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteCategory(deleteTargetId);
      setDeleteTargetId(null);
      setDependencyWarning("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
            Categories Configuration
          </h1>
          <p className="text-sm text-text-secondary">
            Manage groups used for organizing menus, statistics, and cash terminal overlays.
          </p>
        </div>
        <Link
          to="/admin/categories/new"
          className="inline-flex items-center gap-2 h-10 px-4 bg-accent hover:bg-amber-500 text-bg font-sora font-bold text-sm rounded-lg hover:shadow-accent transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </Link>
      </div>

      {/* Grid List */}
      {categories.length === 0 ? (
        <div className="bg-surface border border-border p-12 rounded-xl flex flex-col items-center justify-center text-center shadow-card">
          <div className="h-14 w-14 rounded-full bg-surface-raised border border-border flex items-center justify-center mb-4 text-text-secondary">
            <Tag size={24} />
          </div>
          <h3 className="text-lg font-sora font-semibold text-text-primary mb-1">
            No Categories configured
          </h3>
          <p className="text-sm text-text-secondary max-w-sm">
            Create categories to group menu items logically in the Cashier Terminal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => {
            // Count products in this category
            const count = products.filter((p) => p.categoryId?.toString() === cat.id?.toString()).length;

            return (
              <div
                key={cat.id}
                className="bg-surface border border-border p-5 rounded-xl shadow-card relative flex flex-col justify-between group"
              >
                {/* Visual Category Accent Line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                  style={{ backgroundColor: cat.colorHex || cat.color }}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-border shrink-0"
                      style={{ backgroundColor: cat.colorHex || cat.color }}
                    />
                    <h3 className="font-sora font-semibold text-text-primary">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="text-xs text-text-secondary bg-surface-raised px-2 py-0.5 rounded-full border border-border">
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6 border-t border-border/40 pt-3">
                  <button
                    onClick={() => navigate(`/admin/categories/${cat.id}/edit`)}
                    className="p-1.5 text-text-secondary hover:text-accent hover:bg-surface-raised rounded-md transition-all text-xs flex items-center gap-1"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTrigger(cat.id)}
                    className="p-1.5 text-text-secondary hover:text-danger hover:bg-surface-raised rounded-md transition-all text-xs flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={deleteTargetId !== null}
        onClose={() => {
          setDeleteTargetId(null);
          setDependencyWarning("");
        }}
        title="Delete Category"
        className="max-w-sm"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="h-12 w-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-4">
            <HelpCircle size={24} />
          </div>
          <p className="text-sm text-text-primary font-medium mb-1">
            Are you sure you want to delete this category?
          </p>

          {dependencyWarning && (
            <p className="text-xs text-danger font-semibold bg-danger/10 p-2.5 rounded-md border border-danger/25 mb-4 text-left">
              {dependencyWarning}
            </p>
          )}

          <p className="text-xs text-text-secondary mb-6">
            Deleting this category removes its visual tab from Cashier POS terminals.
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => {
                setDeleteTargetId(null);
                setDependencyWarning("");
              }}
              className="flex-1 h-10 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 h-10 bg-danger text-text-primary rounded-lg text-sm font-semibold hover:bg-red-600 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
