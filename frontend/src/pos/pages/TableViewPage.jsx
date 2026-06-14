import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTables } from '../context/TablesContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { FloorTabs } from '../components/floor/FloorTabs';
import { TableGrid } from '../components/tables/TableGrid';
import { Layers, CheckCircle2, AlertTriangle, Percent, Eye, Ban, Edit2 } from 'lucide-react';

export const TableViewPage = () => {
  const { floors, tables, selectTable, setTableStatus } = useTables();
  const { resetCart, loadOrder, setTableId } = useCart();
  const { getOrderById, deleteOrder } = useOrders();
  const navigate = useNavigate();

  const [activeFloorId, setActiveFloorId] = useState('');
  const [selectedOccupiedTable, setSelectedOccupiedTable] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  React.useEffect(() => {
    if (floors.length > 0 && !activeFloorId) {
      setActiveFloorId(floors[0].id);
    }
  }, [floors, activeFloorId]);

  const handleTableClick = (table) => {
    selectTable(table.id);

    if (table.status === 'occupied' && table.activeOrderId) {
      // Open options modal instead of redirecting
      setSelectedOccupiedTable(table);
    } else {
      resetCart();
      setTableId(table.id);
      navigate('/pos/');
    }
  };

  const handleAddItemsClick = async () => {
    if (!selectedOccupiedTable) return;
    setActionLoading(true);
    try {
      let existingOrder = getOrderById(selectedOccupiedTable.activeOrderId);

      if (!existingOrder) {
        const res = await fetch(
          `http://localhost:8080/api/orders/${selectedOccupiedTable.activeOrderId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('cafe_admin_token') || ''}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          existingOrder = {
            id: data.id,
            orderNumber: `ORD-${String(data.id).padStart(4, '0')}`,
            tableId: data.tableId,
            customerId: data.customerId,
            customerName: data.customerName || 'Guest',
            status: data.status,
            items: (data.lines || []).map((l) => ({
              productId: l.productId,
              quantity: l.qty,
              lineTotal: l.lineTotal,
            })),
            coupon: data.couponCode ? { code: data.couponCode } : null,
            subtotal: data.subtotal,
            taxAmount: data.tax,
            totalDiscount: data.discount,
            total: data.total,
            sentToKitchen: data.sentToKitchen,
          };
        }
      }

      if (existingOrder) {
        loadOrder(existingOrder);
      } else {
        resetCart();
        setTableId(selectedOccupiedTable.id);
      }
      setSelectedOccupiedTable(null);
      navigate('/pos/');
    } catch (err) {
      console.error('Failed to fetch existing order', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFreeTableClick = async () => {
    if (!selectedOccupiedTable) return;
    setActionLoading(true);
    try {
      await deleteOrder(selectedOccupiedTable.activeOrderId);
      setTableStatus(selectedOccupiedTable.id, 'available', null);
      setSelectedOccupiedTable(null);
    } catch (err) {
      console.error('Failed to free table', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Compute metrics
  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;
  const availableTables = totalTables - occupiedTables;
  const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  const filteredTables = tables.filter((t) => t.floorId === activeFloorId);

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
        <div className="select-none">
          <h1 className="font-sora font-bold text-2xl text-[#F0EDE8]">Table View</h1>
          <p className="text-xs text-[#9A9590] mt-1 font-inter">
            Monitor real-time table occupancy and manage active dining sessions
          </p>
        </div>

        {/* Analytics Summary Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          {/* Total Tables */}
          <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#242424] border border-[#2E2E2E] flex items-center justify-center text-[#9A9590]">
              <Layers size={16} />
            </div>
            <div>
              <span className="text-[10px] text-[#9A9590] uppercase font-semibold block">Total Tables</span>
              <span className="text-lg font-bold font-mono text-[#F0EDE8]">{totalTables}</span>
            </div>
          </div>

          {/* Occupied */}
          <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#3D2B00] border border-[#F5A623]/25 flex items-center justify-center text-[#F5A623]">
              <AlertTriangle size={16} />
            </div>
            <div>
              <span className="text-[10px] text-[#9A9590] uppercase font-semibold block">Occupied</span>
              <span className="text-lg font-bold font-mono text-[#F5A623]">{occupiedTables}</span>
            </div>
          </div>

          {/* Available */}
          <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#4CAF7D]/10 border border-[#4CAF7D]/20 flex items-center justify-center text-[#4CAF7D]">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <span className="text-[10px] text-[#9A9590] uppercase font-semibold block">Available</span>
              <span className="text-lg font-bold font-mono text-[#4CAF7D]">{availableTables}</span>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#242424] border border-[#2E2E2E] flex items-center justify-center text-[#9A9590]">
              <Percent size={16} />
            </div>
            <div>
              <span className="text-[10px] text-[#9A9590] uppercase font-semibold block">Occupancy Rate</span>
              <span className="text-lg font-bold font-mono text-[#F0EDE8]">{occupancyRate}%</span>
            </div>
          </div>
        </div>

        {/* Interactive Floor Tables Map */}
        <div className="space-y-4">
          <FloorTabs floors={floors} activeFloorId={activeFloorId} onFloorChange={setActiveFloorId}>
            <div className="pt-2">
              <TableGrid tables={filteredTables} onTableClick={handleTableClick} />
            </div>
          </FloorTabs>
        </div>
      </div>

      {/* Occupied Table Options Modal */}
      <AnimatePresence>
        {selectedOccupiedTable && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => !actionLoading && setSelectedOccupiedTable(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-6 shadow-elevated"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-[#3D2B00] border border-[#F5A623]/25 text-[#F5A623] flex items-center justify-center mb-4">
                  <AlertTriangle size={22} />
                </div>
                <h3 className="font-sora font-bold text-base text-[#F0EDE8] mb-1">
                  Table {selectedOccupiedTable.number} is Occupied
                </h3>
                <p className="text-xs text-[#9A9590] mb-6">
                  Select an action to perform for this table's active session.
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={handleAddItemsClick}
                    disabled={actionLoading}
                    className="w-full h-11 bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 font-sora shadow-sm"
                  >
                    <Edit2 size={16} /> Add Items / View
                  </button>
                  <button
                    onClick={handleFreeTableClick}
                    disabled={actionLoading}
                    className="w-full h-11 bg-[#1A1A1A] border border-[#E05C5C]/40 text-[#E05C5C] hover:bg-[#E05C5C]/10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Ban size={16} /> Free Table (Cancel Order)
                  </button>
                  <button
                    onClick={() => setSelectedOccupiedTable(null)}
                    disabled={actionLoading}
                    className="w-full h-11 bg-[#242424] border border-[#2E2E2E] text-[#F0EDE8] hover:bg-[#2E2E2E] rounded-lg text-sm font-semibold transition-all"
                  >
                    Cancel
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
export default TableViewPage;
