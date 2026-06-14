import React, { useState } from 'react';
import { Edit2, Eye, RotateCcw, Ban, CreditCard, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomers } from '../../context/CustomersContext';
import { useTables } from '../../context/TablesContext';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import { formatINR, formatDateTime } from '../../lib/utils';
import { OrderStatusBadge } from './OrderStatusBadge';
import { useNavigate } from 'react-router-dom';

export const OrdersTable = ({ orders, onViewDetails }) => {
  const { customers } = useCustomers();
  const { tables, setTableStatus } = useTables();
  const { loadOrder, reorder, products = [] } = useCart();
  const { setOrderStatus } = useOrders();
  const navigate = useNavigate();

  const [cancelTarget, setCancelTarget] = useState(null);

  const getTableNumber = (tableId) => {
    const t = tables.find((tab) => tab.id === tableId);
    return t ? t.number : 'None';
  };

  const getCustomerName = (customerId) => {
    const c = customers.find((cust) => cust.id === customerId);
    return c ? c.name : 'Walk-in';
  };

  const getItemsSnippet = (orderItems) => {
    return orderItems
      .map((item) => {
        const p = products.find((prod) => prod.id === item.productId);
        return p ? `${p.name} (x${item.quantity})` : `Item (x${item.quantity})`;
      })
      .join(', ');
  };

  const handleEdit = (order) => {
    loadOrder(order);
    navigate('/pos/');
  };

  const handlePay = (order) => {
    loadOrder(order);
    navigate('/pos/');
  };

  const handleCancel = (order) => {
    setCancelTarget(order);
  };

  const handleCancelConfirm = () => {
    if (cancelTarget) {
      setOrderStatus(cancelTarget.id, 'CANCELLED');
      if (cancelTarget.tableId) {
        setTableStatus(cancelTarget.tableId, 'available', null);
      }
      setCancelTarget(null);
    }
  };

  const handleReorderClick = (order) => {
    reorder(order.items, order.tableId);
    navigate('/pos/');
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-[#9A9590] font-inter select-none">
        No orders found matching filters.
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card Deck View (< 1024px) */}
      <div className="block lg:hidden space-y-4 font-inter no-print">
        {orders.map((order) => {
          const tableNum = getTableNumber(order.tableId);
          const custName = order.customerName || getCustomerName(order.customerId);
          const isDraft = order.status === 'DRAFT';
          const isPaid = order.status === 'PAID';
          const isCancelled = order.status === 'CANCELLED';

          return (
            <div
              key={order.id}
              className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-4 space-y-3 shadow-card select-none"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-[#F0EDE8] font-mono" data-type="order-number">
                    {order.orderNumber}
                  </h4>
                  <span className="text-[10px] text-[#9A9590] block font-mono mt-0.5">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Snippet & Metadata */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#9A9590]">Table:</span>
                  <span className="text-[#F0EDE8] font-mono" data-type="table-number">{tableNum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9A9590]">Customer:</span>
                  <span className="text-[#F0EDE8]">{custName}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-[#9A9590]">Items:</span>
                  <span className="text-[#F0EDE8] truncate max-w-[200px] text-right">
                    {getItemsSnippet(order.items)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#2E2E2E]/60 text-sm font-bold">
                  <span className="text-[#9A9590]">Total Amount:</span>
                  <span className="text-[#F5A623] font-mono" data-type="price">{formatINR(order.total || 0)}</span>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {isDraft && (
                  <>
                    <button
                      onClick={() => handleEdit(order)}
                      className="h-8 bg-[#242424] hover:bg-[#2E2E2E] rounded-lg text-xs font-semibold text-[#F0EDE8] flex items-center justify-center gap-1 transition-colors border border-[#2E2E2E]"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handlePay(order)}
                      className="h-8 bg-[#F5A623] hover:bg-[#e09820] rounded-lg text-xs font-semibold text-[#0F0F0F] flex items-center justify-center gap-1 transition-all"
                    >
                      <CreditCard size={12} />
                      Pay
                    </button>
                    <button
                      onClick={() => handleCancel(order)}
                      className="col-span-2 h-8 bg-transparent hover:bg-[#E05C5C]/10 border border-[#E05C5C]/35 rounded-lg text-xs font-semibold text-[#E05C5C] flex items-center justify-center gap-1 transition-colors"
                    >
                      <Ban size={12} />
                      Cancel Order
                    </button>
                  </>
                )}
                {isPaid && (
                  <>
                    <button
                      onClick={() => onViewDetails(order)}
                      className="h-8 bg-[#242424] hover:bg-[#2E2E2E] rounded-lg text-xs font-semibold text-[#F0EDE8] flex items-center justify-center gap-1 transition-colors border border-[#2E2E2E]"
                    >
                      <Eye size={12} />
                      Receipt
                    </button>
                    <button
                      onClick={() => handleReorderClick(order)}
                      className="h-8 bg-[#3D2B00]/40 hover:bg-[#3D2B00] border border-[#F5A623]/25 hover:border-[#F5A623] rounded-lg text-xs font-semibold text-[#F5A623] flex items-center justify-center gap-1 transition-all"
                    >
                      <RotateCcw size={12} />
                      Reorder
                    </button>
                  </>
                )}
                {isCancelled && (
                  <>
                    <button
                      onClick={() => onViewDetails(order)}
                      className="h-8 bg-[#242424] hover:bg-[#2E2E2E] rounded-lg text-xs font-semibold text-[#F0EDE8] flex items-center justify-center gap-1 transition-colors border border-[#2E2E2E]"
                    >
                      <Eye size={12} />
                      Details
                    </button>
                    <button
                      onClick={() => handleReorderClick(order)}
                      className="h-8 bg-[#3D2B00]/40 hover:bg-[#3D2B00] border border-[#F5A623]/25 hover:border-[#F5A623] rounded-lg text-xs font-semibold text-[#F5A623] flex items-center justify-center gap-1 transition-all"
                    >
                      <RotateCcw size={12} />
                      Reorder
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (>= 1024px) */}
      <div className="hidden lg:block w-full overflow-hidden border border-[#2E2E2E] rounded-xl bg-[#1A1A1A] font-inter shadow-card no-print">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="bg-[#242424] border-b border-[#2E2E2E] text-xs font-bold text-[#9A9590] uppercase tracking-wider">
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Table</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Items Summary</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
              <th className="py-3 px-4">Date Time</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2E2E2E]/60 text-xs">
            {orders.map((order) => {
              const isDraft = order.status === 'DRAFT';
              const isPaid = order.status === 'PAID';
              const isCancelled = order.status === 'CANCELLED';
              const paymentMethodLower = order.paymentMethod ? order.paymentMethod.toLowerCase() : '';
              const paymentLabel = paymentMethodLower === 'cash' ? 'Cash' : (paymentMethodLower === 'card' ? 'Card' : (paymentMethodLower === 'upi' ? 'UPI' : order.paymentMethod || ''));

              return (
                <tr key={order.id} className="hover:bg-[#242424]/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#F0EDE8]" data-type="order-number">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#F5A623]" data-type="table-number">
                    {getTableNumber(order.tableId)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#F0EDE8]">
                    {order.customerName || getCustomerName(order.customerId)}
                  </td>
                  <td className="py-3.5 px-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 px-4 text-[#9A9590] max-w-xs truncate" title={getItemsSnippet(order.items)}>
                    {getItemsSnippet(order.items)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#F5A623]" data-type="price">
                    {formatINR(order.total || 0)}
                  </td>
                  <td className="py-3.5 px-4 text-[#9A9590] font-mono">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {isDraft && (
                        <>
                          <button
                            onClick={() => handleEdit(order)}
                            title="Edit Order Draft"
                            className="p-1.5 bg-[#242424] hover:bg-[#2E2E2E] border border-[#2E2E2E] hover:border-[#F5A623]/30 text-[#9A9590] hover:text-[#F5A623] rounded-lg transition-all"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handlePay(order)}
                            title="Checkout Order"
                            className="px-2.5 py-1.5 bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] rounded-lg font-bold flex items-center gap-1 transition-all"
                          >
                            <CreditCard size={13} />
                            Pay
                          </button>
                          <button
                            onClick={() => handleCancel(order)}
                            title="Cancel Order"
                            className="p-1.5 bg-transparent hover:bg-[#E05C5C]/10 border border-transparent hover:border-[#E05C5C]/30 text-[#9A9590] hover:text-[#E05C5C] rounded-lg transition-colors"
                          >
                            <Ban size={13} />
                          </button>
                        </>
                      )}
                      {isPaid && (
                        <>
                          <button
                            onClick={() => onViewDetails(order)}
                            title="View Printable Receipt"
                            className="p-1.5 bg-[#242424] hover:bg-[#2E2E2E] border border-[#2E2E2E] hover:border-[#F5A623]/30 text-[#9A9590] hover:text-[#F5A623] rounded-lg transition-all"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleReorderClick(order)}
                            title="Reorder items"
                            className="px-2.5 py-1.5 bg-[#3D2B00]/40 hover:bg-[#3D2B00] border border-[#F5A623]/25 hover:border-[#F5A623] text-[#F5A623] rounded-lg font-bold flex items-center gap-1 transition-all"
                          >
                            <RotateCcw size={13} />
                            Reorder
                          </button>
                        </>
                      )}
                      {isCancelled && (
                        <>
                          <button
                            onClick={() => onViewDetails(order)}
                            title="View Cancelled Details"
                            className="p-1.5 bg-[#242424] hover:bg-[#2E2E2E] border border-[#2E2E2E] hover:border-[#F5A623]/30 text-[#9A9590] hover:text-[#F5A623] rounded-lg transition-all"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleReorderClick(order)}
                            title="Reorder items"
                            className="px-2.5 py-1.5 bg-[#3D2B00]/40 hover:bg-[#3D2B00] border border-[#F5A623]/25 hover:border-[#F5A623] text-[#F5A623] rounded-lg font-bold flex items-center gap-1 transition-all"
                          >
                            <RotateCcw size={13} />
                            Reorder
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cancel Order Confirmation Dialog */}
      <AnimatePresence>
        {cancelTarget !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setCancelTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-6 shadow-elevated"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-[#E05C5C]/10 text-[#E05C5C] flex items-center justify-center mb-4">
                  <AlertTriangle size={22} />
                </div>
                <h3 className="font-sora font-bold text-base text-[#F0EDE8] mb-1">Cancel Order?</h3>
                <p className="text-xs text-[#9A9590] mb-1 font-mono">{cancelTarget?.orderNumber}</p>
                <p className="text-xs text-[#9A9590] mb-6">
                  This order will be permanently cancelled and cannot be recovered.
                </p>
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={() => setCancelTarget(null)}
                    className="flex-1 h-10 border border-[#2E2E2E] text-[#F0EDE8] rounded-lg text-sm font-semibold hover:bg-[#242424] transition-all"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleCancelConfirm}
                    className="flex-1 h-10 bg-[#E05C5C] hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Ban size={14} /> Cancel Order
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
export default OrdersTable;
