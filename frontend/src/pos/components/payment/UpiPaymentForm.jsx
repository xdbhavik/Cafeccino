import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { formatINR } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

export const UpiPaymentForm = ({ total, isSubmitting, onCancel, onConfirm }) => {
  const { orderId } = useCart();
  const [qrUrl, setQrUrl] = useState(null);
  const [qrError, setQrError] = useState(null);
  const [loadingQr, setLoadingQr] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setQrError('No active order for QR generation');
      setLoadingQr(false);
      return;
    }

    // The backend returns a raw PNG image — we use it as an img src directly
    const url = `http://localhost:8080/api/payments/orders/${orderId}/upi-qr`;

    // Verify the image can load
    const img = new Image();
    img.onload = () => {
      setQrUrl(url);
      setLoadingQr(false);
      setQrError(null);
    };
    img.onerror = () => {
      setQrError('UPI QR not available. Check if UPI is enabled in Payment Settings.');
      setLoadingQr(false);
    };
    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [orderId]);

  return (
    <div className="flex flex-col items-center justify-between flex-1 space-y-5">
      <div className="flex flex-col items-center space-y-3 w-full">
        {/* QR Code Container */}
        <div className="bg-white rounded-xl p-3 shadow-md w-[200px] h-[200px] flex items-center justify-center select-none">
          {loadingQr ? (
            <Loader2 size={32} className="animate-spin text-gray-400" />
          ) : qrError ? (
            <div className="flex flex-col items-center gap-2 text-center p-2">
              <AlertCircle size={24} className="text-red-400" />
              <span className="text-[10px] text-gray-500 leading-tight">{qrError}</span>
            </div>
          ) : (
            <img
              src={qrUrl}
              alt="UPI QR Code"
              className="w-full h-full object-contain rounded-lg"
            />
          )}
        </div>

        <span className="text-[13px] font-medium text-[#9A9590] select-none font-inter">Scan to pay</span>

        {/* Amount */}
        <span className="text-2xl font-bold font-mono text-[#F5A623] tracking-wide" data-type="price">
          {formatINR(total)}
        </span>

        {/* Order ID Pill */}
        <div className="bg-[#242424] border border-[#2E2E2E] px-3.5 py-1.5 rounded-full text-xs font-mono text-[#F5A623] flex items-center gap-1 select-none">
          <span>Order:</span>
          <span className="font-bold">#{orderId}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full mt-4">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="flex-1 h-11 bg-[#242424] border border-[#2E2E2E] rounded-lg text-sm text-[#9A9590] hover:bg-[#2E2E2E] transition-colors font-medium select-none"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onConfirm}
          className="flex-1 h-11 bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] rounded-lg text-sm font-sora font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-accent select-none"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Confirmed
        </button>
      </div>
    </div>
  );
};
export default UpiPaymentForm;
