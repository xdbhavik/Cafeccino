import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';

export const ProductCard = ({ product, cartQuantity, onTriggerToast }) => {
  const { addItem, updateQuantity, categories = [], promotions = [] } = useCart();
  const prevQuantityRef = useRef(cartQuantity);

  const categoryObj = categories.find((c) => c.id === product.category);
  const accentColor = categoryObj ? categoryObj.color : '#F0EDE8';

  // Find active product promotion
  const promotion = promotions.find(
    (p) => p.type === 'PRODUCT' && p.applicableProductId === product.id
  );

  // Monitor quantity for promotion unlock trigger
  useEffect(() => {
    if (promotion && cartQuantity === promotion.minQty && prevQuantityRef.current < promotion.minQty) {
      if (onTriggerToast) {
        onTriggerToast(
          'Promotion Unlocked',
          promotion.name || promotion.description,
          'sparkle'
        );
      }
    }
    prevQuantityRef.current = cartQuantity;
  }, [cartQuantity, promotion, onTriggerToast]);

  const handleAddClick = async () => {
    try {
      await addItem(product.id);
    } catch (err) {
      if (onTriggerToast) {
        onTriggerToast('Failed to Add', err.message, 'error');
      }
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(245,166,35,0.15)' }}
      transition={{ duration: 0.18 }}
      className="relative flex flex-col justify-between bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl overflow-hidden shadow-card hover:border-[#F5A623]/30 group select-none"
    >
      {/* Top Accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

      {/* Main Content */}
      <div className="p-4 flex-1 flex flex-col justify-between min-h-[140px]">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-sora font-semibold text-sm text-[#F0EDE8] line-clamp-2 leading-snug group-hover:text-[#F5A623] transition-colors">
            {product.name}
          </h3>
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: accentColor }}
            title={categoryObj?.name || ''}
          />
        </div>

        {/* Description */}
        <p className="text-xs text-[#9A9590] line-clamp-2 mt-1 leading-relaxed font-inter flex-1">
          {product.description}
        </p>

        {/* Pricing */}
        <div className="flex items-baseline gap-1 mt-3.5">
          <span className="text-base font-bold font-mono text-[#F5A623]" data-type="price">
            {formatINR(product.price)}
          </span>
          <span className="text-[10px] text-[#9A9590] font-inter">
            /{product.unit}
          </span>
        </div>
      </div>

      {/* Button Panel */}
      <div className="px-4 pb-4">
        {cartQuantity > 0 ? (
          <div className="flex items-center justify-between bg-[#3D2B00] border border-[#F5A623] text-[#F5A623] h-9.5 rounded-lg px-2 shadow-sm">
            <button
              onClick={() => updateQuantity(product.id, cartQuantity - 1)}
              className="h-7 w-7 flex items-center justify-center rounded hover:bg-[#F5A623]/10 transition-colors focus:outline-none"
            >
              <Minus size={13} />
            </button>
            <span className="font-mono text-sm font-bold" data-type="qty">
              {cartQuantity}
            </span>
            <button
              onClick={handleAddClick}
              className="h-7 w-7 flex items-center justify-center rounded hover:bg-[#F5A623]/10 transition-colors focus:outline-none"
            >
              <Plus size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddClick}
            className="w-full h-9.5 bg-[#242424] border border-[#2E2E2E] hover:border-[#F5A623]/50 text-[#9A9590] hover:text-[#F0EDE8] text-xs font-semibold font-inter rounded-lg flex items-center justify-center gap-1 transition-all outline-none"
          >
            <Plus size={13} />
            Add
          </button>
        )}
      </div>
    </motion.div>
  );
};
export default ProductCard;
