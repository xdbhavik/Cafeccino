import React from 'react';
import { Edit2, Trash2, User } from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import { formatINR } from '../../lib/utils';

export const CustomersTable = ({ customers, onEdit, onDelete }) => {
  const { orders } = useOrders();

  const getCustomerStats = (customerId) => {
    const paidOrders = orders.filter(
      (o) => o.status === 'PAID' && o.customerId === customerId
    );
    const totalOrders = paidOrders.length;
    const totalSpent = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { totalOrders, totalSpent };
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-[#9A9590] font-inter select-none">
        No customers found matching search filters.
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card Deck View (< 768px) */}
      <div className="block md:hidden space-y-4 font-inter select-none">
        {customers.map((cust) => {
          const { totalOrders, totalSpent } = getCustomerStats(cust.id);
          return (
            <div
              key={cust.id}
              className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-4 space-y-3 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#242424] border border-[#2E2E2E] rounded-full flex items-center justify-center text-[#9A9590]">
                  <User size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-[#F0EDE8] truncate">{cust.name}</h4>
                  <span className="text-[10px] text-[#9A9590] truncate block mt-0.5 font-mono">
                    {cust.phone} · {cust.email}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 bg-[#242424]/40 border border-[#2E2E2E]/60 rounded-lg p-2.5 text-[11px]">
                <div>
                  <span className="text-[#9A9590] block">Orders Count</span>
                  <span className="font-bold text-[#F0EDE8] mt-0.5 block font-mono">{totalOrders}</span>
                </div>
                <div>
                  <span className="text-[#9A9590] block">Total Spent</span>
                  <span className="font-bold text-[#F5A623] mt-0.5 block font-mono">{formatINR(totalSpent)}</span>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex justify-end gap-2 pt-1 border-t border-[#2E2E2E]/60">
                <button
                  onClick={() => onEdit(cust)}
                  className="px-3.5 py-1.5 bg-[#242424] border border-[#2E2E2E] hover:border-[#F5A623]/30 text-xs font-semibold rounded-lg text-[#F0EDE8] hover:text-[#F5A623] transition-colors flex items-center gap-1"
                >
                  <Edit2 size={11} />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(cust.id)}
                  className="px-3.5 py-1.5 bg-transparent hover:bg-[#E05C5C]/10 border border-transparent hover:border-[#E05C5C]/30 text-xs font-semibold rounded-lg text-[#E05C5C] transition-colors flex items-center gap-1"
                >
                  <Trash2 size={11} />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block w-full overflow-hidden border border-[#2E2E2E] rounded-xl bg-[#1A1A1A] font-inter shadow-card select-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#242424] border-b border-[#2E2E2E] text-xs font-bold text-[#9A9590] uppercase tracking-wider">
              <th className="py-3.5 px-5">Name</th>
              <th className="py-3.5 px-5">Email Address</th>
              <th className="py-3.5 px-5">Phone Number</th>
              <th className="py-3.5 px-5 text-center">Session Orders</th>
              <th className="py-3.5 px-5 text-right">Session Total Spent</th>
              <th className="py-3.5 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2E2E2E]/60 text-xs">
            {customers.map((cust) => {
              const { totalOrders, totalSpent } = getCustomerStats(cust.id);
              return (
                <tr key={cust.id} className="hover:bg-[#242424]/20 transition-colors">
                  <td className="py-3 px-5 font-semibold text-[#F0EDE8] flex items-center gap-2">
                    <User size={13} className="text-[#9A9590]" />
                    <span>{cust.name}</span>
                  </td>
                  <td className="py-3 px-5 text-[#9A9590]">{cust.email}</td>
                  <td className="py-3 px-5 text-[#9A9590] font-mono">{cust.phone}</td>
                  <td className="py-3 px-5 text-center font-mono font-semibold text-[#F0EDE8]">
                    {totalOrders}
                  </td>
                  <td className="py-3 px-5 text-right font-mono font-bold text-[#F5A623]" data-type="price">
                    {formatINR(totalSpent)}
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit(cust)}
                        title="Edit Details"
                        className="p-1.5 bg-[#242424] hover:bg-[#2E2E2E] border border-[#2E2E2E] hover:border-[#F5A623]/30 text-[#9A9590] hover:text-[#F5A623] rounded-lg transition-all"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(cust.id)}
                        title="Delete customer"
                        className="p-1.5 bg-transparent hover:bg-[#E05C5C]/10 border border-transparent hover:border-[#E05C5C]/30 text-[#9A9590] hover:text-[#E05C5C] rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default CustomersTable;
