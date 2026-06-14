import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { formatINR } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export const CloseSessionDialog = ({ open, onOpenChange }) => {
  const { closeSession, session } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();

  if (!session) return null;

  const paidOrders = orders.filter((o) => o.status === 'PAID');
  
  // Total Sales
  const totalSales = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = paidOrders.length;

  // Session Duration
  const openedAt = new Date(session.openTime || session.openedAt || new Date());
  const now = new Date();
  const diffMs = now - openedAt;
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  const duration = `${hours}h ${mins}m`;

  const handleConfirm = async () => {
    await closeSession(paidOrders);
    onOpenChange(false);
    navigate('/login');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 transition-opacity" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-6 shadow-elevated z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-semibold font-sora text-[#F0EDE8]">
              Close Session?
            </Dialog.Title>
            <Dialog.Close className="text-[#9A9590] hover:text-[#F0EDE8] transition-colors">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-3 bg-[#242424] rounded-lg border border-[#2E2E2E]">
              <span className="text-sm text-[#9A9590] font-inter">Total Sales</span>
              <span className="text-xl font-bold font-mono text-[#F5A623]" data-type="price">
                {formatINR(totalSales)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-[#242424] rounded-lg border border-[#2E2E2E]">
              <span className="text-sm text-[#9A9590] font-inter">Total Orders</span>
              <span className="text-base font-semibold font-mono text-[#F0EDE8]">
                {totalOrders}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#242424] rounded-lg border border-[#2E2E2E]">
              <span className="text-sm text-[#9A9590] font-inter">Session Duration</span>
              <span className="text-sm font-medium text-[#9A9590] font-inter">
                {duration}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Dialog.Close asChild>
              <button className="px-4 py-2 bg-[#242424] border border-[#2E2E2E] rounded-lg text-sm text-[#9A9590] hover:bg-[#2E2E2E] transition-colors font-medium">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-[#E05C5C] hover:bg-[#d04c4c] text-white rounded-lg text-sm font-sora font-semibold transition-colors flex items-center gap-1.5 animate-pulse"
            >
              <LogOut size={14} />
              Close Session
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
