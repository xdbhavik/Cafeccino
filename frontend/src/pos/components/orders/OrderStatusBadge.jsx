import React from 'react';

export const OrderStatusBadge = ({ status }) => {
  const styles = {
    DRAFT: 'bg-[#3D2B00] text-[#F5A623] border-[#F5A623]/20',
    PAID: 'bg-[#4CAF7D]/10 text-[#4CAF7D] border-[#4CAF7D]/20',
    CANCELLED: 'bg-[#E05C5C]/10 text-[#E05C5C] border-[#E05C5C]/20',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-inter font-semibold border select-none ${styles[status] || styles.DRAFT}`}>
      {status}
    </span>
  );
};
export default OrderStatusBadge;
