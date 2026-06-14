import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useOrders } from '../context/OrdersContext';
import { useTables } from '../context/TablesContext';
import { useCustomers } from '../context/CustomersContext';
import { OrdersTable } from '../components/orders/OrdersTable';
import { OrderDetailDrawer } from '../components/orders/OrderDetailDrawer';
import * as Tabs from '@radix-ui/react-tabs';

export const OrdersListPage = () => {
  const { orders } = useOrders();
  const { tables } = useTables();
  const { customers } = useCustomers();

  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('ALL');
  
  // Drawer states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  // Filter orders by status and query
  const filteredOrders = orders.filter((order) => {
    // 1. Status Filter
    const matchesStatus = activeStatus === 'ALL' || order.status === activeStatus;
    
    // 2. Search Query Filter
    if (!query.trim()) return matchesStatus;
    
    const q = query.toLowerCase();
    
    // Table lookup
    const table = tables.find((t) => t.id === order.tableId);
    const tableNum = table ? table.number.toLowerCase() : '';
    
    // Customer lookup
    const customer = order.customerId ? customers.find((c) => c.id === order.customerId) : null;
    const custName = order.customerName ? order.customerName.toLowerCase() : (customer ? customer.name.toLowerCase() : 'guest');
    const custPhone = customer ? customer.phone : '';

    const matchesSearch =
      order.orderNumber.toLowerCase().includes(q) ||
      tableNum.includes(q) ||
      custName.includes(q) ||
      custPhone.includes(q);

    return matchesStatus && matchesSearch;
  });

  const statusTabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1 w-full h-[calc(100vh-64px)] overflow-y-auto bg-[#0F0F0F] text-[#F0EDE8]"
    >
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header Title */}
        <div className="select-none no-print">
          <h1 className="font-sora font-bold text-2xl text-[#F0EDE8]">Session Orders</h1>
          <p className="text-xs text-[#9A9590] mt-1 font-inter">
            Manage transactions log for the active cash drawer ({orders.length} total)
          </p>
        </div>

        {/* Filters Controls Row */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between no-print select-none">
          {/* Search bar */}
          <div className="relative flex items-center max-w-md w-full">
            <Search size={16} className="absolute left-3 text-[#9A9590]" />
            <input
              type="text"
              placeholder="Search by order #, table, customer name or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 bg-[#242424] border border-[#2E2E2E] rounded-lg pl-10 pr-4 text-sm text-[#F0EDE8] placeholder-[#9A9590] focus:border-[#F5A623] transition-all outline-none"
            />
          </div>

          {/* Radix Tabs for status */}
          <Tabs.Root value={activeStatus} onValueChange={setActiveStatus} className="flex-shrink-0">
            <Tabs.List className="flex gap-1 bg-[#242424] border border-[#2E2E2E] p-1 rounded-xl">
              {statusTabs.map((tab) => (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  className="py-1.5 px-4 rounded-lg text-xs font-semibold font-sora transition-all outline-none text-[#9A9590] data-[state=active]:bg-[#3D2B00] data-[state=active]:text-[#F5A623] hover:text-[#F0EDE8] data-[state=active]:hover:text-[#F5A623] focus-visible:ring-1 focus-visible:ring-[#F5A623]/30"
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
        </div>

        {/* Table/Card deck of orders */}
        <OrdersTable orders={filteredOrders} onViewDetails={handleViewDetails} />
      </div>

      {/* Slide-out detail drawer */}
      <OrderDetailDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        order={selectedOrder}
      />
    </motion.div>
  );
};
export default OrdersListPage;
