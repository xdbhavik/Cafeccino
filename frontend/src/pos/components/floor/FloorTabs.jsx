import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';

export const FloorTabs = ({ floors, activeFloorId, onFloorChange, children }) => {
  return (
    <Tabs.Root value={activeFloorId} onValueChange={onFloorChange} className="w-full">
      <Tabs.List className="flex gap-2 p-1 bg-[#242424] rounded-xl border border-[#2E2E2E] mb-6">
        {floors.map((floor) => (
          <Tabs.Trigger
            key={floor.id}
            value={floor.id}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-inter font-semibold transition-all outline-none text-[#9A9590] data-[state=active]:bg-[#3D2B00] data-[state=active]:text-[#F5A623] hover:text-[#F0EDE8] data-[state=active]:hover:text-[#F5A623] focus-visible:ring-1 focus-visible:ring-[#F5A623]/30"
          >
            {floor.name}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {floors.map((floor) => (
        <Tabs.Content key={floor.id} value={floor.id} className="outline-none">
          {children}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};
export default FloorTabs;
