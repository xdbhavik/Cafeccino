import React, { useState } from 'react';
import { Loader2, Hash } from 'lucide-react';

export const CardPaymentForm = ({ isSubmitting, onConfirm }) => {
  const [ref, setRef] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ref.trim()) return;
    onConfirm({ transactionRef: ref.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#9A9590]">Transaction Reference</label>
          <div className="relative flex items-center">
            <Hash size={16} className="absolute left-3.5 text-[#9A9590]" />
            <input
              type="text"
              placeholder="e.g. TXN0012345"
              disabled={isSubmitting}
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              className="w-full h-11 bg-[#242424] border border-[#2E2E2E] rounded-lg pl-10 pr-4 text-sm text-[#F0EDE8] placeholder-[#9A9590]/50 focus:border-[#F5A623] transition-all outline-none focus:ring-1 focus:ring-[#F5A623]/20"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !ref.trim()}
        className="w-full h-11 bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] rounded-lg text-sm font-sora font-semibold transition-all mt-6 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-accent disabled:opacity-50 disabled:cursor-not-allowed select-none"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        Confirm Payment
      </button>
    </form>
  );
};
export default CardPaymentForm;
