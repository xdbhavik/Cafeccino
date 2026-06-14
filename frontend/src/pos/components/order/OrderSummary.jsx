import React from 'react';
import { formatINR } from '../../lib/utils';

export const OrderSummary = ({
  subtotal,
  taxAmount,
  productPromoDiscount,
  orderPromoDiscount,
  couponDiscount,
  total,
  coupon,
}) => {
  return (
    <div className="space-y-2.5 py-4 border-t border-[#2E2E2E] select-none text-sm font-inter">
      {/* Subtotal */}
      <div className="flex justify-between items-center">
        <span className="text-[#9A9590]">Subtotal</span>
        <span className="font-mono text-[#F0EDE8]" data-type="price">
          {formatINR(subtotal)}
        </span>
      </div>

      {/* Tax */}
      <div className="flex justify-between items-center">
        <span className="text-[#9A9590]">Tax</span>
        <span className="font-mono text-[#F0EDE8]" data-type="price">
          {formatINR(taxAmount)}
        </span>
      </div>

      {/* Product-based Promotions Discount */}
      {productPromoDiscount > 0 && (
        <div className="flex justify-between items-center text-[#4CAF7D]">
          <span>Promo Discount (Product)</span>
          <span className="font-mono">
            -{formatINR(productPromoDiscount)}
          </span>
        </div>
      )}

      {/* Order-based Promotions Discount */}
      {orderPromoDiscount > 0 && (
        <div className="flex justify-between items-center text-[#4CAF7D]">
          <span>Promo Discount (Order)</span>
          <span className="font-mono">
            -{formatINR(orderPromoDiscount)}
          </span>
        </div>
      )}

      {/* Coupon Discount */}
      {couponDiscount > 0 && (
        <div className="flex justify-between items-center text-[#4CAF7D]">
          <span>Coupon ({coupon?.code || 'COUPON'})</span>
          <span className="font-mono">
            -{formatINR(couponDiscount)}
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-[#2E2E2E] my-1" />

      {/* Total */}
      <div className="flex justify-between items-center pt-1">
        <span className="font-sora font-bold text-base text-[#F0EDE8]">Total</span>
        <span className="font-mono font-bold text-xl text-[#F5A623]" data-type="price">
          {formatINR(total)}
        </span>
      </div>
    </div>
  );
};
export default OrderSummary;
