import React from 'react';
import { TableCard } from '../floor/TableCard';

export const TableGrid = ({ tables, onTableClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onClick={() => onTableClick(table)}
        />
      ))}
    </div>
  );
};
export default TableGrid;
