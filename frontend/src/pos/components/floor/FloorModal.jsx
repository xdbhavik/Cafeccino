import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useTables } from '../../context/TablesContext';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import { FloorTabs } from './FloorTabs';
import { TableCard } from './TableCard';

export const FloorModal = ({ open, onOpenChange }) => {
  const { floors, tables, activeTableId, selectTable } = useTables();
  const { resetCart, loadOrder, setTableId } = useCart();
  const { getOrderById } = useOrders();

  const [activeFloorId, setActiveFloorId] = useState('');

  React.useEffect(() => {
    if (floors.length > 0 && !activeFloorId) {
      setActiveFloorId(floors[0].id);
    }
  }, [floors, activeFloorId]);

  const handleTableClick = async (table) => {
    selectTable(table.id);

    if (table.status === 'occupied' && table.activeOrderId) {
      // Try to load from local state first
      let existingOrder = getOrderById(table.activeOrderId);

      // If not in local state, fetch from backend
      if (!existingOrder) {
        try {
          const res = await fetch(
            `http://localhost:8080/api/orders/${table.activeOrderId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('cafe_admin_token') || ''}`,
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            // Map backend response to frontend shape
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
        } catch (err) {
          console.error('Failed to fetch existing order from backend', err);
        }
      }

      if (existingOrder) {
        loadOrder(existingOrder);
      } else {
        // Fallback: start fresh on this table
        resetCart();
        setTableId(table.id);
      }
    } else {
      // Fresh available table — clear cart state, keep activeTableId set by selectTable
      resetCart();
      setTableId(table.id);
    }

    onOpenChange(false);
  };

  const filteredTables = tables.filter((t) => t.floorId === activeFloorId);
  const showClose = activeTableId !== null;

  return (
    <Dialog.Root 
      open={open} 
      onOpenChange={(val) => {
        // Enforce selection of a table if activeTableId is null
        if (activeTableId === null && !val) return;
        onOpenChange(val);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 transition-opacity no-print" />
        <Dialog.Content 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-3xl bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-6 shadow-elevated z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh] no-print"
          onEscapeKeyDown={(e) => {
            if (activeTableId === null) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (activeTableId === null) e.preventDefault();
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold font-sora text-[#F0EDE8]">
              Select a Table
            </Dialog.Title>
            {showClose && (
              <Dialog.Close className="text-[#9A9590] hover:text-[#F0EDE8] transition-colors p-1.5 hover:bg-[#242424] rounded-lg">
                <X size={18} />
              </Dialog.Close>
            )}
          </div>

          <FloorTabs floors={floors} activeFloorId={activeFloorId} onFloorChange={setActiveFloorId}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              {filteredTables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onClick={() => handleTableClick(table)}
                />
              ))}
            </div>
          </FloorTabs>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export default FloorModal;
