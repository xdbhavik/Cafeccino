import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, HelpCircle, UtensilsCrossed } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { formatINR } from "../lib/utils";
import { Dialog } from "../components/ui/Dialog";

export const ProductsListPage = () => {
  const navigate = useNavigate();
  const { products, categories, deleteProduct, fetchProducts, fetchCategories } = useAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  React.useEffect(() => {
    fetchProducts().catch(console.error);
    fetchCategories().catch(console.error);
  }, []);

  // Map category ID to Category Object
  const categoryMap = React.useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {});
  }, [categories]);

  // Filtered Products List
  const filteredProducts = React.useMemo(() => {
    return products.filter((prod) =>
      prod.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteProduct(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const getCategoryBadgeStyle = (catId) => {
    const category = categoryMap[catId];
    const color = category?.colorHex || category?.color || "#9A9590";
    return {
      backgroundColor: `${color}15`,
      borderColor: `${color}30`,
      color: color,
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
            Products Inventory
          </h1>
          <p className="text-sm text-text-secondary">
            Manage all cafe menu items, prices, tax profiles, and categories.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 h-10 px-4 bg-accent hover:bg-amber-500 text-bg font-sora font-bold text-sm rounded-lg hover:shadow-accent transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Control Row: Search */}
      <div className="relative max-w-md">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search menu items..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      {/* Data Section */}
      {filteredProducts.length === 0 ? (
        <div className="bg-surface border border-border p-12 rounded-xl flex flex-col items-center justify-center text-center shadow-card">
          <div className="h-14 w-14 rounded-full bg-surface-raised border border-border flex items-center justify-center mb-4 text-text-secondary">
            <UtensilsCrossed size={24} />
          </div>
          <h3 className="text-lg font-sora font-semibold text-text-primary mb-1">
            {products.length === 0 ? "No Products in System" : "No Products Found"}
          </h3>
          <p className="text-sm text-text-secondary max-w-sm">
            {products.length === 0
              ? "Start building your cafe menu items by clicking the 'Add Product' button."
              : `No items matched your search term "${searchTerm}". Try a different spelling.`}
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-raised/40">
                  <th className="py-4 px-6 font-sora font-semibold text-text-secondary">
                    Product Name
                  </th>
                  <th className="py-4 px-6 font-sora font-semibold text-text-secondary">
                    Category
                  </th>
                  <th className="py-4 px-6 font-sora font-semibold text-text-secondary">
                    Price
                  </th>
                  <th className="py-4 px-6 font-sora font-semibold text-text-secondary">
                    Tax Rate
                  </th>
                  <th className="py-4 px-6 font-sora font-semibold text-text-secondary">
                    Unit
                  </th>
                  <th className="py-4 px-6 font-sora font-semibold text-text-secondary text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-surface-raised/20 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-semibold text-text-primary">
                      {prod.name}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        style={getCategoryBadgeStyle(prod.categoryId)}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
                      >
                        {categoryMap[prod.categoryId]?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-medium text-accent">
                      {formatINR(prod.price)}
                    </td>
                    <td className="py-3.5 px-6 text-text-secondary font-medium">
                      {prod.tax}%
                    </td>
                    <td className="py-3.5 px-6 text-text-secondary">{prod.uom || prod.unit}</td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/${prod.id}/edit`)}
                          className="p-1.5 text-text-secondary hover:text-accent hover:bg-surface-raised rounded-md transition-all"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(prod.id)}
                          className="p-1.5 text-text-secondary hover:text-danger hover:bg-surface-raised rounded-md transition-all"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        title="Confirm Deletion"
        className="max-w-sm"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="h-12 w-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-4">
            <HelpCircle size={24} />
          </div>
          <p className="text-sm text-text-primary font-medium mb-1">
            Are you sure you want to delete this menu item?
          </p>
          <p className="text-xs text-text-secondary mb-6">
            This action cannot be undone. Cashier terminals will immediately stop seeing this product.
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setDeleteTargetId(null)}
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
