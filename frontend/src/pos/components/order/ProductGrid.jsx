import React, { useState, useMemo } from 'react';
import { SearchX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ProductCard } from './ProductCard';

const ITEMS_PER_PAGE = 16;

export const ProductGrid = ({ activeCategoryId, searchQuery, onTriggerToast }) => {
  const { items, categories = [], products = [], loading } = useCart();
  const [currentPage, setCurrentPage] = useState(1);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory = activeCategoryId === 'all' || prod.category === activeCategoryId;
      const matchesSearch = !searchQuery || prod.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategoryId, searchQuery]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryId, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const pageProducts = filteredProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const getCartQty = (prodId) => {
    const item = items.find((it) => it.productId === prodId);
    return item ? item.quantity : 0;
  };

  const isAll = activeCategoryId === 'all';
  const headingText = activeCategory ? activeCategory.name : 'All';
  const countText = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'}`;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 select-none">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F5A623]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Category Header */}
      {!isAll && (
        <div className="px-6 pt-6 pb-2 select-none no-print">
          <h2 className="font-sora font-semibold text-lg text-[#F0EDE8]">
            {headingText} <span className="text-sm font-normal text-[#9A9590] ml-1.5 font-inter">· {countText}</span>
          </h2>
        </div>
      )}

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-2 pt-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 select-none no-print">
            <SearchX size={48} className="text-[#2E2E2E] mb-3" />
            <h3 className="font-sora font-semibold text-base text-[#9A9590]">No products found</h3>
            <p className="text-xs text-[#9A9590]/60 font-inter mt-1">Try searching a different name</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pageProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                cartQuantity={getCartQty(prod.id)}
                onTriggerToast={onTriggerToast}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-[#2E2E2E] flex items-center justify-between select-none no-print">
          <span className="text-xs text-[#9A9590] font-inter">
            Page {safePage} of {totalPages}
            <span className="ml-2 text-[#9A9590]/60">
              ({startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length})
            </span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#242424] border border-[#2E2E2E] text-[#9A9590] hover:text-[#F0EDE8] hover:border-[#F5A623]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-8 min-w-[2rem] px-1.5 flex items-center justify-center rounded-lg text-xs font-semibold font-mono transition-all ${
                  page === safePage
                    ? 'bg-[#F5A623] text-[#0F0F0F] border border-[#F5A623]'
                    : 'bg-[#242424] border border-[#2E2E2E] text-[#9A9590] hover:text-[#F0EDE8] hover:border-[#F5A623]/40'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#242424] border border-[#2E2E2E] text-[#9A9590] hover:text-[#F0EDE8] hover:border-[#F5A623]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductGrid;
