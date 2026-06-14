import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Menu, LogOut, ShoppingCart, ClipboardList, Users, LayoutGrid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const HamburgerMenu = ({ onLogoutClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employee } = useAuth();

  const handleNav = (path) => {
    navigate(path);
  };

  const navItems = [
    { label: 'POS Order', path: '/pos/', icon: ShoppingCart },
    { label: 'Orders', path: '/pos/orders', icon: ClipboardList },
    { label: 'Customer', path: '/pos/customers', icon: Users },
    { label: 'Table View', path: '/pos/tables', icon: LayoutGrid },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="outline-none flex items-center justify-center p-2 rounded-lg hover:bg-[#242424] transition-colors focus:ring-1 focus:ring-[#F5A623]/30">
        <Menu size={20} className="text-[#9A9590] hover:text-[#F0EDE8]" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="w-56 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-1.5 shadow-elevated z-50 text-[#F0EDE8] font-inter focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <DropdownMenu.Label className="px-2.5 py-2 text-xs text-[#9A9590] select-none font-medium">
            Logged in as {employee?.name || 'Rohan Mehta'}
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="h-px bg-[#2E2E2E] my-1" />
          
          {/* Mobile Only Nav Links */}
          <div className="md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <DropdownMenu.Item
                  key={item.path}
                  onSelect={() => handleNav(item.path)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-lg cursor-pointer outline-none transition-colors ${
                    isActive ? 'bg-[#3D2B00] text-[#F5A623]' : 'hover:bg-[#242424] text-[#F0EDE8]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </DropdownMenu.Item>
              );
            })}
            <DropdownMenu.Separator className="h-px bg-[#2E2E2E] my-1" />
          </div>

          <DropdownMenu.Item
            onSelect={onLogoutClick}
            className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-[#E05C5C] hover:bg-[#E05C5C]/10 rounded-lg cursor-pointer outline-none transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
