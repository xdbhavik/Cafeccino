import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { formatINR } from '../../lib/utils';

export const CashPaymentForm = ({ total, isSubmitting, onConfirm }) => {
  const [received, setReceived] = useState('');

  const receivedVal = parseFloat(received) || 0;
  const changeDue = Math.max(0, receivedVal - total);
  const isInsufficient = receivedVal < total;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isInsufficient) return;
    onConfirm({ receivedAmount: receivedVal });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#9A9590]">Amount Received</label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#9A9590] font-mono text-sm">₹</span>
            <input
              type="number"
              step="any"
              placeholder="e.g. 1000"
              disabled={isSubmitting}
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              className="w-full h-11 bg-[#242424] border border-[#2E2E2E] rounded-lg pl-8 pr-4 text-base text-[#F0EDE8] placeholder-[#9A9590]/50 focus:border-[#F5A623] transition-all outline-none font-mono focus:ring-1 focus:ring-[#F5A623]/20"
            />
          </div>
        </div>

        {/* Change Due Row */}
        <div className="p-3.5 bg-[#242424]/40 border border-[#2E2E2E] rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-[#9A9590]">Change Due</span>
          <div className="text-right">
            <span
              className={`text-lg font-bold font-mono ${
                isInsufficient ? 'text-[#E05C5C]' : 'text-[#4CAF7D]'
              }`}
              data-type="price"
            >
              {formatINR(changeDue)}
            </span>
            {isInsufficient && received.trim() !== '' && (
              <p className="text-[10px] text-[#E05C5C] font-semibold mt-0.5 animate-pulse">
                Insufficient amount
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isInsufficient || received.trim() === ''}
        className="w-full h-11 bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] rounded-lg text-sm font-sora font-semibold transition-all mt-6 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-accent disabled:opacity-50 disabled:cursor-not-allowed select-none"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        Confirm Payment
      </button>
    </form>
  );
};
export default CashPaymentForm;
