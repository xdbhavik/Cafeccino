import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, User, Printer, Banknote, CreditCard, QrCode } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTables } from '../../context/TablesContext';
import { useCustomers } from '../../context/CustomersContext';
import { formatINR, formatDateTime } from '../../lib/utils';
import { OrderStatusBadge } from './OrderStatusBadge';

export const OrderDetailDrawer = ({ open, onOpenChange, order }) => {
  const { products = [] } = useCart();
  const { tables = [] } = useTables();
  const { customers = [] } = useCustomers();

  if (!order) return null;

  const table = tables.find((t) => t.id === order.tableId);
  const customer = order.customerId
    ? customers.find((c) => c.id === order.customerId)
    : null;

  const paymentIcons = {
    cash: Banknote,
    card: CreditCard,
    upi: QrCode,
  };
  
  const paymentMethodLower = order.paymentMethod ? order.paymentMethod.toLowerCase() : '';
  const PaymentIcon = paymentIcons[paymentMethodLower] || null;
  const paymentLabel = paymentMethodLower === 'cash' ? 'Cash' : (paymentMethodLower === 'card' ? 'Card' : (paymentMethodLower === 'upi' ? 'UPI' : order.paymentMethod || ''));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black z-40 no-print"
          />
          
          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.28 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-[#1A1A1A] border-l border-[#2E2E2E] z-50 flex flex-col shadow-elevated text-[#F0EDE8] font-inter focus:outline-none"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#2E2E2E] flex justify-between items-center bg-[#1A1A1A] select-none no-print">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sora font-bold text-base text-[#F0EDE8]" data-type="order-number">
                    {order.orderNumber}
                  </h3>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-[11px] text-[#9A9590] mt-1 font-mono">
                  Created on {formatDateTime(order.createdAt)}
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 hover:bg-[#242424] rounded-lg text-[#9A9590] hover:text-[#F0EDE8] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Context Row */}
              <div className="grid grid-cols-2 gap-3 select-none no-print">
                <div className="p-3 bg-[#242424]/40 border border-[#2E2E2E] rounded-xl flex items-center gap-2.5">
                  <div className="h-8 w-8 bg-[#3D2B00] border border-[#F5A623]/25 text-[#F5A623] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9A9590] block font-semibold uppercase">Table</span>
                    <span className="text-sm font-bold text-[#F0EDE8] font-mono" data-type="table-number">
                      {table ? table.number : 'None'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#242424]/40 border border-[#2E2E2E] rounded-xl flex items-center gap-2.5">
                  <div className="h-8 w-8 bg-[#242424] border border-[#2E2E2E] text-[#9A9590] rounded-lg flex items-center justify-center flex-shrink-0">
                    <User size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9A9590] block font-semibold uppercase">Customer</span>
                    <span className="text-sm font-semibold text-[#F0EDE8] truncate max-w-[120px] block">
                      {customer ? customer.name : (order.customerName || 'Walk-in')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#9A9590] uppercase tracking-wider select-none no-print">
                  Order Items ({order.items.length})
                </h4>
                <div className="bg-[#242424]/20 border border-[#2E2E2E] rounded-xl divide-y divide-[#2E2E2E] overflow-hidden">
                  {order.items.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <div key={item.productId} className="p-3 flex justify-between items-center text-xs">
                        <div className="min-w-0 pr-2">
                          <span className="text-[#F0EDE8] font-semibold truncate block">
                            {prod ? prod.name : 'Unknown Item'}
                          </span>
                          <span className="text-[10px] text-[#9A9590] mt-0.5 block font-mono">
                            {formatINR(prod ? prod.price : 0)} × {item.quantity}
                          </span>
                        </div>
                        <span className="font-mono text-[#F5A623] font-semibold" data-type="price">
                          {formatINR(item.lineTotal || 0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary calculations */}
              <div className="bg-[#242424]/40 border border-[#2E2E2E] rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9590]">Subtotal</span>
                  <span className="font-mono text-[#F0EDE8]">{formatINR(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9590]">Tax</span>
                  <span className="font-mono text-[#F0EDE8]">{formatINR(order.taxAmount || 0)}</span>
                </div>
                {order.totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-[#4CAF7D]">
                    <span>Discounts</span>
                    <span className="font-mono">-{formatINR(order.totalDiscount)}</span>
                  </div>
                )}
                <div className="h-px bg-[#2E2E2E] my-1" />
                <div className="flex justify-between items-center text-sm font-bold pt-1.5">
                  <span className="text-[#F0EDE8]">Total</span>
                  <span className="font-mono text-[#F5A623]">{formatINR(order.total || 0)}</span>
                </div>
              </div>

              {/* Payment Details */}
              {order.status === 'PAID' && (
                <div className="bg-[#3D2B00]/20 border border-[#F5A623]/25 rounded-xl p-4 flex items-center justify-between text-xs select-none no-print">
                  <span className="text-[#9A9590]">Payment Method</span>
                  <div className="flex items-center gap-1.5 font-bold text-[#F5A623]">
                    {PaymentIcon && <PaymentIcon size={14} />}
                    <span>{paymentLabel}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer print action */}
            <div className="p-5 border-t border-[#2E2E2E] bg-[#1A1A1A] select-none no-print">
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full h-11 bg-[#242424] hover:bg-[#2E2E2E] border border-[#2E2E2E] rounded-lg text-sm font-semibold text-[#F0EDE8] flex items-center justify-center gap-1.5 transition-colors outline-none"
              >
                <Printer size={16} />
                Print Order Receipt
              </button>
            </div>

            {/* PRINT-ONLY RECEIPT BLOCK FOR WINDOW PRINT */}
            <div className="hidden print:block print-only font-mono text-black text-xs space-y-4 p-4">
              <div className="text-center font-bold text-lg">ODOO CAFE</div>
              <div className="text-center">Every order, handled with precision.</div>
              <hr className="border-black border-dashed" />
              <div>Date: {formatDateTime(order.createdAt)}</div>
              <div>Order: {order.orderNumber}</div>
              {(customer || order.customerName) && <div>Customer: {customer ? customer.name : order.customerName}</div>}
              <hr className="border-black border-dashed" />
              <div className="space-y-1">
                {order.items.map((item) => {
                  const prod = products.find((p) => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex justify-between">
                      <span>{prod ? prod.name : 'Item'} x{item.quantity}</span>
                      <span>{formatINR(item.lineTotal || 0)}</span>
                    </div>
                  );
                })}
              </div>
              <hr className="border-black border-dashed" />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatINR(order.taxAmount)}</span>
              </div>
              {order.totalDiscount > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Discount</span>
                  <span>-{formatINR(order.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL PAID</span>
                <span>{formatINR(order.total)}</span>
              </div>
              <hr className="border-black border-dashed" />
              <div className="text-center font-bold">THANK YOU! VISIT AGAIN!</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default OrderDetailDrawer;
