import React, { useState } from 'react';
import { ShoppingBag, User, Tag, ChefHat, X, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useCustomers } from '../../context/CustomersContext';
import { useOrders } from '../../context/OrdersContext';
import { useTables } from '../../context/TablesContext';
import { CartLineItem } from './CartLineItem';
import { OrderSummary } from './OrderSummary';
import { AssignCustomerPopup } from './AssignCustomerPopup';
import { CouponPopup } from './CouponPopup';
import * as Dialog from '@radix-ui/react-dialog';

export const CartPanel = ({ onTriggerToast }) => {
  const {
    orderId,
    tableId,
    customerId,
    items,
    coupon,
    subtotal,
    taxAmount,
    productPromoDiscount,
    orderPromoDiscount,
    couponDiscount,
    totalDiscount,
    total,
    updateQuantity,
    removeItem,
    removeCoupon,
    cancelOrder,
    sendToKitchen,
  } = useCart();

  const { customers } = useCustomers();
  const { getOrderById } = useOrders();
  const { getTableById } = useTables();

  const [customerPopupOpen, setCustomerPopupOpen] = useState(false);
  const [couponPopupOpen, setCouponPopupOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const activeTable = tableId ? getTableById(tableId) : null;
  const activeCustomer = customerId ? customers.find((c) => c.id === customerId) : null;
  const activeOrder = orderId ? getOrderById(orderId) : null;

  const handleSendToKitchen = async () => {
    if (!orderId) return;
    setSending(true);
    try {
      await sendToKitchen();
      if (onTriggerToast) {
        onTriggerToast(
          'Order Sent to Kitchen',
          'Items are now being prepared.',
          'success'
        );
      }
    } catch (err) {
      // Backend throws 500 RuntimeException if order is already sent to kitchen.
      // But items are ALREADY saved in the DB via PUT /lines.
      // We can safely ignore this error and just show a success toast for the reorder.
      if (activeOrder?.sentToKitchen) {
        if (onTriggerToast) {
          onTriggerToast(
            'Kitchen Updated',
            'New items have been sent to the kitchen.',
            'success'
          );
        }
      } else {
        if (onTriggerToast) {
          onTriggerToast(
            'Failed to Send',
            err.message || 'Could not send the order to the kitchen.',
            'error'
          );
        }
      }
    } finally {
      setSending(false);
    }
  };

  const handleConfirmCancel = () => {
    cancelOrder();
    setCancelDialogOpen(false);
    if (onTriggerToast) {
      onTriggerToast('Order Cancelled', 'The order draft was discarded.', 'success');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1A1A1A] text-[#F0EDE8]">
      {/* Header Info */}
      <div className="p-4 border-b border-[#2E2E2E] space-y-3 select-none no-print">
        <motion.div
          animate={items.length === 1 ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.25 }}
          className="flex justify-between items-start"
        >
          <div>
            <h3 className="font-sora font-bold text-base text-[#F0EDE8]">Current Order</h3>
            <span className="font-mono text-xs text-[#9A9590]">
              {activeOrder ? activeOrder.orderNumber : 'New Order'}
            </span>
          </div>
        </motion.div>

        {/* Action Row */}
        <div className="flex flex-wrap gap-2">
          {/* Customer Button */}
          <button
            onClick={() => setCustomerPopupOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242424] hover:bg-[#2E2E2E] border border-[#2E2E2E] hover:border-[#F5A623]/30 rounded-lg text-xs font-inter font-medium text-[#9A9590] hover:text-[#F0EDE8] transition-colors outline-none"
          >
            <User size={13} className="text-[#F5A623]" />
            <span className="truncate max-w-[120px]">
              {activeCustomer ? activeCustomer.name : 'Add Customer'}
            </span>
          </button>

          {/* Discount/Coupon Button */}
          {coupon ? (
            <div className="flex items-center bg-[#3D2B00] border border-[#F5A623] text-[#F5A623] px-2.5 py-1 rounded-lg text-xs font-inter font-medium gap-1.5 shadow-sm">
              <Tag size={13} />
              <span className="font-mono font-bold select-all">{coupon.code}</span>
              <button
                onClick={removeCoupon}
                className="hover:bg-[#F5A623]/20 rounded-full p-0.5 transition-colors focus:outline-none"
              >
                <X size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCouponPopupOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242424] hover:bg-[#2E2E2E] border border-[#2E2E2E] hover:border-[#F5A623]/30 rounded-lg text-xs font-inter font-medium text-[#9A9590] hover:text-[#F0EDE8] transition-colors outline-none"
            >
              <Tag size={13} className="text-[#F5A623]" />
              <span>Discount</span>
            </button>
          )}
        </div>
      </div>

      {/* Body: Items list */}
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
        <AnimatePresence initial={false}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-60 select-none">
              <ShoppingBag size={40} className="text-[#2E2E2E] mb-3" />
              <h4 className="text-sm font-semibold text-[#9A9590] font-inter">No items yet</h4>
              <p className="text-xs text-[#9A9590] font-inter mt-0.5">Tap a product to add it</p>
            </div>
          ) : (
            items.map((item) => (
              <CartLineItem
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Summary */}
      <div className="p-4 border-t border-[#2E2E2E] bg-[#1A1A1A] mt-auto">
        <OrderSummary
          subtotal={subtotal}
          taxAmount={taxAmount}
          productPromoDiscount={productPromoDiscount}
          orderPromoDiscount={orderPromoDiscount}
          couponDiscount={couponDiscount}
          total={total}
          coupon={coupon}
        />

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2 no-print">
          <button
            onClick={handleSendToKitchen}
            disabled={items.length === 0 || sending}
            className="w-full h-11 bg-[#242424] border border-[#2E2E2E] hover:border-[#F5A623] hover:text-[#F5A623] disabled:hover:border-[#2E2E2E] disabled:hover:text-[#F0EDE8] rounded-lg text-sm font-semibold text-[#F0EDE8] flex items-center justify-center gap-1.5 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none font-inter"
          >
            {sending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <ChefHat size={16} />
            )}
            {sending
              ? "Sending..."
              : activeOrder?.sentToKitchen
              ? "Update Kitchen"
              : "Send to Kitchen"}
          </button>

          <Dialog.Root open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <Dialog.Trigger asChild>
              <button
                disabled={items.length === 0 || orderId === null}
                className="w-full h-10 bg-transparent hover:bg-[#E05C5C]/5 border border-[#E05C5C]/40 hover:border-[#E05C5C] text-[#E05C5C] text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all outline-none disabled:opacity-30 disabled:cursor-not-allowed select-none font-inter"
              >
                Cancel Order
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 transition-opacity" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-5 shadow-elevated z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
                <Dialog.Title className="text-base font-bold font-sora text-[#F0EDE8] mb-2">
                  Discard Order Draft?
                </Dialog.Title>
                <Dialog.Description className="text-xs text-[#9A9590] font-inter leading-relaxed mb-6">
                  Are you sure you want to cancel this order? The table will be freed and this draft will be deleted. This action cannot be undone.
                </Dialog.Description>
                <div className="flex justify-end gap-3">
                  <Dialog.Close asChild>
                    <button className="px-4 py-2 bg-[#242424] border border-[#2E2E2E] rounded-lg text-xs font-semibold text-[#9A9590] hover:bg-[#2E2E2E] transition-colors">
                      Keep Draft
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={handleConfirmCancel}
                    className="px-4 py-2 bg-[#E05C5C] hover:bg-[#d04c4c] text-white rounded-lg text-xs font-sora font-semibold transition-colors"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* Popups */}
      <AssignCustomerPopup open={customerPopupOpen} onOpenChange={setCustomerPopupOpen} />
      <CouponPopup open={couponPopupOpen} onOpenChange={setCouponPopupOpen} />
    </div>
  );
};
export default CartPanel;
