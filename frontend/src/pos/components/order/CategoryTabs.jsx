import React from 'react';
import { useCart } from '../../context/CartContext';

export const CategoryTabs = ({ activeCategoryId, onCategoryChange, searchQuery, setSearchQuery }) => {
  const { categories = [], products = [] } = useCart();

  const getProductCount = (catId) => {
    if (catId === 'all') return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <>
      {/* Mobile Categories (Horizontal Scroll) */}
      <div className="md:hidden w-full flex flex-col gap-3 p-4 bg-[#1A1A1A] border-b border-[#2E2E2E] no-print">
        {/* Mobile Search Input */}
        <div className="relative flex items-center w-full">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-[#242424] border border-[#2E2E2E] rounded-lg pl-4 pr-4 text-sm text-[#F0EDE8] placeholder-[#9A9590] focus:border-[#F5A623] transition-all outline-none"
          />
        </div>
        
        {/* Horizontal Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            const count = getProductCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-inter font-semibold whitespace-nowrap border transition-all ${
                  isActive
                    ? 'bg-[#3D2B00] border-[#F5A623]/30 text-[#F5A623]'
                    : 'bg-[#242424] border-[#2E2E2E] text-[#9A9590] hover:text-[#F0EDE8]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-65 font-normal">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar Categories */}
      <aside className="hidden md:block w-[200px] h-full bg-[#1A1A1A] border-r border-[#2E2E2E] p-3 overflow-y-auto select-none no-print">
        <div className="space-y-1">
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            const count = getProductCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-inter transition-all outline-none text-left border-l-2 hover:bg-[#242424]/40"
                style={{
                  backgroundColor: isActive ? `${cat.color}15` : 'transparent',
                  borderLeftColor: isActive ? cat.color : 'transparent',
                  color: isActive ? cat.color : '#9A9590',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </div>
                <span className="text-[10px] bg-[#242424] text-[#9A9590] px-1.5 py-0.5 rounded-full font-normal">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
export default CategoryTabs;
