import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { COUPONS } from '../../data/dummyData';

export const CouponPopup = ({ open, onOpenChange }) => {
  const { applyCoupon, coupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) return;
    const formattedCode = code.trim().toUpperCase();
    
    try {
      await applyCoupon({ code: formattedCode });
      setStatus('success');
      setMessage(`Coupon ${formattedCode} applied successfully.`);
      setTimeout(() => {
        setStatus(null);
        setCode('');
        onOpenChange(false);
      }, 1000);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Invalid coupon code.');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(val) => {
      setStatus(null);
      setMessage('');
      setCode('');
      onOpenChange(val);
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 transition-opacity" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-5 shadow-elevated z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-base font-semibold font-sora text-[#F0EDE8] flex items-center gap-2">
              <Tag size={16} className="text-[#F5A623]" />
              Apply Coupon
            </Dialog.Title>
            <Dialog.Close className="text-[#9A9590] hover:text-[#F0EDE8] transition-colors p-1 hover:bg-[#242424] rounded">
              <X size={16} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter coupon code (e.g. WELCOME10)"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (status) setStatus(null);
                }}
                style={{ textTransform: 'uppercase' }}
                className="w-full h-10 bg-[#242424] border border-[#2E2E2E] rounded-md px-3 text-sm text-[#F0EDE8] placeholder-[#9A9590] focus:border-[#F5A623] transition-all outline-none"
              />
            </div>

            {status === 'success' && (
              <div className="flex items-center gap-2 text-sm text-[#4CAF7D] bg-[#4CAF7D]/10 p-2.5 rounded-lg border border-[#4CAF7D]/20">
                <CheckCircle2 size={16} />
                <span>Coupon Applied! {message}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-[#E05C5C] bg-[#E05C5C]/10 p-2.5 rounded-lg border border-[#E05C5C]/20">
                <AlertCircle size={16} />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!code.trim() || status === 'success'}
              className="w-full h-10 bg-[#242424] hover:bg-[#2E2E2E] border border-[#2E2E2E] hover:border-[#F5A623] text-sm text-[#F0EDE8] hover:text-[#F5A623] rounded-lg transition-all font-semibold select-none disabled:opacity-50 disabled:hover:border-[#2E2E2E] disabled:hover:text-[#F0EDE8] disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-[#2E2E2E] space-y-3">
            <div className="text-xs text-[#9A9590] font-inter">
              Try: <span className="font-mono text-[#F5A623] cursor-pointer" onClick={() => setCode('WELCOME10')}>WELCOME10</span> · <span className="font-mono text-[#F5A623] cursor-pointer" onClick={() => setCode('FLAT50')}>FLAT50</span> · <span className="font-mono text-[#F5A623] cursor-pointer" onClick={() => setCode('CAFE20')}>CAFE20</span>
            </div>

            <div className="bg-[#3D2B00]/40 border border-[#F5A623]/10 text-[#F5A623] rounded-lg p-2.5 text-xs font-inter leading-relaxed">
              <strong>Tip:</strong> Automated promotions (e.g. order value &gt; ₹1000) apply automatically and don't need a code.
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export default CouponPopup;
