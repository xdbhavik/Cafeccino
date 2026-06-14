import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus } from 'lucide-react';
import { PRODUCTS, PROMOTIONS } from '../../data/dummyData';
import { formatINR } from '../../lib/utils';

export const CartLineItem = ({ item, onUpdateQuantity, onRemove }) => {
  const prod = PRODUCTS.find((p) => p.id === item.productId);
  if (!prod) return null;

  const lineTotal = prod.price * item.quantity;

  // Check if product-level promo applies
  const promo = PROMOTIONS.find(
    (p) => p.appliesTo === 'product' && p.productId === item.productId
  );
  const isPromoApplied = promo && item.quantity >= promo.minQty;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center justify-between py-3 border-b border-[#2E2E2E] gap-2 select-none"
    >
      {/* Left */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="font-sora font-semibold text-sm text-[#F0EDE8] truncate">
          {prod.name}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-xs text-[#9A9590]">
            {formatINR(prod.price)} × {item.quantity}
          </span>
          {isPromoApplied && (
            <span className="text-[10px] font-inter text-[#4CAF7D] bg-[#4CAF7D]/10 px-2 py-0.5 rounded-full font-medium">
              Promo applied
            </span>
          )}
        </div>
      </div>

      {/* Center Stepper */}
      <div className="flex items-center justify-between bg-[#3D2B00] border border-[#F5A623] text-[#F5A623] h-8 rounded-lg px-1.5 w-24">
        <button
          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-[#F5A623]/10 transition-colors focus:outline-none"
        >
          <Minus size={11} />
        </button>
        <span className="font-mono text-xs font-bold" data-type="qty">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-[#F5A623]/10 transition-colors focus:outline-none"
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-semibold text-[#F0EDE8] min-w-[65px] text-right font-mono" data-type="price">
          {formatINR(lineTotal)}
        </span>
        <button
          onClick={() => onRemove(item.productId)}
          className="text-[#9A9590] hover:text-[#E05C5C] p-1.5 hover:bg-[#E05C5C]/10 rounded transition-colors focus:outline-none"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};
export default CartLineItem;
