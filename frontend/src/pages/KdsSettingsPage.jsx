import React, { useState } from "react";
import { Monitor, Search, CheckCircle, AlertCircle } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export const KdsSettingsPage = () => {
  const { products, categories, toggleKdsProduct, fetchProducts, fetchCategories } = useAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  React.useEffect(() => {
    fetchProducts().catch(console.error);
    fetchCategories().catch(console.error);
  }, []);

  const categoryMap = React.useMemo(() => {
    return categories.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});
  }, [categories]);

  // Filtered Products
  const filteredProducts = React.useMemo(() => {
    return products.filter((prod) => {
      const matchSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCat === "all" || prod.categoryId?.toString() === selectedCat?.toString();
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCat]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
          Kitchen Display Assignments
        </h1>
        <p className="text-sm text-text-secondary">
          Select which products trigger KDS tickets when orders are sent to the kitchen.
          Beverages and snacks can be filtered.
        </p>
      </div>

      {/* Control Filters Block */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-surface border border-border p-4 rounded-xl shadow-card">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-4 py-2 bg-surface-raised border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Category select tab list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              selectedCat === "all"
                ? "bg-accent text-bg border-accent"
                : "bg-surface-raised border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0`}
              style={{
                backgroundColor: selectedCat === cat.id ? `${cat.color}20` : "transparent",
                borderColor: selectedCat === cat.id ? cat.color : "#2E2E2E",
                color: selectedCat === cat.id ? cat.color : "#9A9590",
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Toggle List Card */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="p-4 bg-surface-raised/40 border-b border-border flex items-center justify-between text-xs text-text-secondary uppercase tracking-wider font-semibold">
          <span>Menu Item</span>
          <span className="text-right">KDS Visibility Trigger</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="text-text-secondary mx-auto mb-3" size={24} />
            <p className="text-sm text-text-secondary">No products match selection.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredProducts.map((prod) => {
              const isAssigned = prod.showOnKDS;
              const category = categoryMap[prod.categoryId];

              return (
                <div
                  key={prod.id}
                  onClick={async () => {
                    try {
                      await toggleKdsProduct(prod.id);
                    } catch (err) {
                      alert(err.message || "Failed to toggle KDS assignment.");
                    }
                  }}
                  className="p-4 flex items-center justify-between hover:bg-surface-raised/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-border shrink-0"
                      style={{ backgroundColor: category?.colorHex || category?.color || "#9A9590" }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{prod.name}</p>
                      <p className="text-xs text-text-secondary">
                        {category?.name || "Uncategorized"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await toggleKdsProduct(prod.id);
                      } catch (err) {
                        alert(err.message || "Failed to toggle KDS assignment.");
                      }
                    }}
                    className={`h-9 px-4 rounded-lg flex items-center gap-2 border text-xs font-bold transition-all ${
                      isAssigned
                        ? "bg-success/10 text-success border-success/30 shadow-sm"
                        : "bg-surface-raised text-text-secondary border-border hover:border-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Monitor size={14} />
                    <span>{isAssigned ? "Sent to Kitchen" : "Ignored / Front Only"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
