import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Trash2, AlertTriangle } from 'lucide-react';
import { useCustomers } from '../context/CustomersContext';
import { CustomersTable } from '../components/customers/CustomersTable';
import { CustomerFormDialog } from '../components/customers/CustomerFormDialog';

export const CustomersPage = () => {
  const { customers, deleteCustomer, searchCustomers } = useCustomers();

  const [query, setQuery] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  
  // Dialog controller states
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteCustomer(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const filteredCustomers = searchCustomers(query);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1 w-full h-[calc(100vh-64px)] overflow-y-auto bg-[#0F0F0F] text-[#F0EDE8] no-print"
    >
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Title Header */}
        <div className="flex justify-between items-start select-none">
          <div>
            <h1 className="font-sora font-bold text-2xl text-[#F0EDE8]">Customer Registry</h1>
            <p className="text-xs text-[#9A9590] mt-1 font-inter">
              Manage diner files, search contacts, and review loyal spend figures ({customers.length} total)
            </p>
          </div>
        </div>

        {/* Filters & Actions Controls Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between select-none">
          {/* Search bar */}
          <div className="relative flex items-center max-w-md w-full">
            <Search size={16} className="absolute left-3 text-[#9A9590]" />
            <input
              type="text"
              placeholder="Search by name, email or phone number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 bg-[#242424] border border-[#2E2E2E] rounded-lg pl-10 pr-4 text-sm text-[#F0EDE8] placeholder-[#9A9590] focus:border-[#F5A623] transition-all outline-none"
            />
          </div>

          {/* New Customer Action */}
          <button
            onClick={handleCreateClick}
            className="h-10 bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 font-sora shadow-sm hover:shadow-accent"
          >
            <UserPlus size={16} />
            New Customer
          </button>
        </div>

        {/* Customer Database Listing */}
        <CustomersTable
          customers={filteredCustomers}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Dynamic Edit/Create Form Dialog */}
      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
      />

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteTargetId !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setDeleteTargetId(null)}
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
                <h3 className="font-sora font-bold text-base text-[#F0EDE8] mb-1">Remove Customer?</h3>
                <p className="text-xs text-[#9A9590] mb-6">
                  This customer will be removed from the registry. This action cannot be undone.
                </p>
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={() => setDeleteTargetId(null)}
                    className="flex-1 h-10 border border-[#2E2E2E] text-[#F0EDE8] rounded-lg text-sm font-semibold hover:bg-[#242424] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 h-10 bg-[#E05C5C] hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default CustomersPage;
