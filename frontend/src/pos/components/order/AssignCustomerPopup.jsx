import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, User, UserPlus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomers } from '../../context/CustomersContext';
import { CustomerFormDialog } from '../customers/CustomerFormDialog';
import { useNavigate } from 'react-router-dom';

export const AssignCustomerPopup = ({ open, onOpenChange }) => {
  const { customerId, assignCustomer, unassignCustomer } = useCart();
  const { customers, searchCustomers } = useCustomers();
  const [query, setQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  const matchedCustomers = searchCustomers(query);
  const assignedCustomer = customerId ? customers.find((c) => c.id === customerId) : null;

  const handleSelect = (id) => {
    assignCustomer(id);
    onOpenChange(false);
  };

  const handleManageClick = () => {
    onOpenChange(false);
    navigate('/customers');
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(val) => {
        setQuery('');
        onOpenChange(val);
      }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 transition-opacity" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-6 shadow-elevated z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-bold font-sora text-[#F0EDE8]">
                Assign Customer
              </Dialog.Title>
              <Dialog.Close className="text-[#9A9590] hover:text-[#F0EDE8] transition-colors p-1.5 hover:bg-[#242424] rounded-lg">
                <X size={18} />
              </Dialog.Close>
            </div>

            {/* Currently Assigned Customer Banner */}
            {assignedCustomer && (
              <div className="mb-4 p-3 bg-[#3D2B00]/40 border border-[#F5A623]/25 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center text-[#F5A623]">
                    <User size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F0EDE8] font-inter">
                      {assignedCustomer.name}
                    </h4>
                    <p className="text-xs text-[#9A9590] font-mono">
                      {assignedCustomer.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={unassignCustomer}
                  className="px-3 py-1.5 text-xs text-[#E05C5C] hover:bg-[#E05C5C]/10 border border-transparent hover:border-[#E05C5C]/20 rounded-lg transition-all font-semibold"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Search Input */}
            <div className="relative flex items-center mb-4">
              <Search size={16} className="absolute left-3 text-[#9A9590]" />
              <input
                type="text"
                placeholder="Search by name, email or phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-10 bg-[#242424] border border-[#2E2E2E] rounded-lg pl-10 pr-4 text-sm text-[#F0EDE8] placeholder-[#9A9590] focus:border-[#F5A623] transition-all outline-none"
              />
            </div>

            {/* Customers List */}
            <div className="overflow-y-auto max-h-60 space-y-1.5 pr-1">
              {matchedCustomers.length === 0 ? (
                <div className="text-center py-6 text-sm text-[#9A9590] font-inter select-none">
                  No customers matched search
                </div>
              ) : (
                matchedCustomers.map((cust) => {
                  const isSelected = cust.id === customerId;
                  return (
                    <div
                      key={cust.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#3D2B00]/20 border-[#F5A623]/30'
                          : 'bg-[#242424]/40 border-[#2E2E2E] hover:border-[#F5A623]/20'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-[#F0EDE8] truncate font-inter">
                          {cust.name}
                        </span>
                        <span className="text-xs text-[#9A9590] truncate font-mono mt-0.5">
                          {cust.phone} · {cust.email}
                        </span>
                      </div>
                      {!isSelected && (
                        <button
                          onClick={() => handleSelect(cust.id)}
                          className="px-3 py-1.5 bg-[#242424] border border-[#2E2E2E] hover:border-[#F5A623] hover:text-[#F5A623] rounded-lg text-xs font-semibold text-[#F0EDE8] transition-all"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 pt-4 border-t border-[#2E2E2E] flex flex-col gap-3">
              <button
                onClick={() => setIsFormOpen(true)}
                className="w-full h-10 bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 font-sora shadow-sm hover:shadow-accent"
              >
                <UserPlus size={16} />
                New Customer
              </button>

              <button
                onClick={handleManageClick}
                className="text-xs text-[#9A9590] hover:text-[#F0EDE8] hover:underline transition-colors text-center font-inter mt-1 select-none"
              >
                Manage all customers →
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Customer Registry Form Dialog */}
      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={(newCustomer) => {
          assignCustomer(newCustomer.id);
          onOpenChange(false);
        }}
      />
    </>
  );
};
export default AssignCustomerPopup;
