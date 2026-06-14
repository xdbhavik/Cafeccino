import React from 'react';
import { motion } from 'framer-motion';

export const TableCard = ({ table, onClick }) => {
  const isOccupied = table.status === 'occupied';
  const isOccupiedByOther = isOccupied && !table.activeOrderId;

  return (
    <motion.button
      whileHover={!isOccupiedByOther ? { scale: 1.05 } : {}}
      transition={{ duration: 0.15 }}
      onClick={!isOccupiedByOther ? onClick : undefined}
      disabled={isOccupiedByOther}
      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 p-4 border select-none transition-all outline-none focus:ring-2 focus:ring-[#F5A623]/40 ${
        isOccupiedByOther
          ? 'bg-[#1A1A1A] border-[#E05C5C]/30 text-[#E05C5C]/50 opacity-60 cursor-not-allowed'
          : isOccupied
          ? 'bg-[#3D2B00] border-[#F5A623] text-[#F5A623] shadow-accent'
          : 'bg-[#1A1A1A] border-[#2E2E2E] text-[#F0EDE8] hover:border-[#F5A623]/50'
      }`}
    >
      <span className="font-mono font-bold text-xl" data-type="table-number">
        {table.number}
      </span>
      <span className="text-xs text-[#9A9590] font-inter">
        {table.seats} seats
      </span>
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className={`h-2 w-2 rounded-full ${
            isOccupiedByOther ? 'bg-[#E05C5C]/50' : isOccupied ? 'bg-[#F5A623]' : 'bg-[#4CAF7D]'
          }`}
        />
        <span className="text-[11px] font-semibold font-inter">
          {isOccupiedByOther ? 'In Use' : isOccupied ? 'Occupied' : 'Available'}
        </span>
      </div>
    </motion.button>
  );
};
export default TableCard;
