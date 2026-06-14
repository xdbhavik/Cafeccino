import React, { useState } from 'react';
import { Coffee, MapPin, Search } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTables } from '../../context/TablesContext';
import { useCart } from '../../context/CartContext';
import { HamburgerMenu } from './HamburgerMenu';
import { FloorModal } from '../floor/FloorModal';

export const TopNav = () => {
  const { employee, closeSession } = useAuth();
  const { activeTableId, getTableById } = useTables();
  const { searchQuery, setSearchQuery } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [floorModalOpen, setFloorModalOpen] = useState(false);

  const handleLogout = async () => {
    // Pass empty array to close session with 0 manual cash
    await closeSession([]);
    navigate('/login');
  };

  const activeTable = activeTableId ? getTableById(activeTableId) : null;
  const isOrderView = location.pathname === '/pos/' || location.pathname === '/pos';

  const navLinks = [
    { label: 'POS Order', path: '/pos/' },
    { label: 'Orders', path: '/pos/orders' },
    { label: 'Customer', path: '/pos/customers' },
    { label: 'Table View', path: '/pos/tables' },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-[#1A1A1A] border-b border-[#2E2E2E] px-4 md:px-6 flex items-center justify-between no-print">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 select-none">
          <Coffee size={22} className="text-[#F5A623]" />
          <span className="font-sora font-bold text-base text-[#F0EDE8] tracking-wide">
            Odoo Cafe POS
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-inter font-medium transition-colors ${
                  isActive
                    ? 'bg-[#3D2B00] text-[#F5A623]'
                    : 'text-[#9A9590] hover:text-[#F0EDE8] hover:bg-[#242424]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Center Section: Search Bar (Order View only) */}
      <div className="flex-1 max-w-xs mx-4 hidden lg:block">
        {isOrderView ? (
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-[#9A9590]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-[#242424] border border-[#2E2E2E] rounded-md pl-10 pr-4 text-sm text-[#F0EDE8] placeholder-[#9A9590] focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]/20 transition-all outline-none"
            />
          </div>
        ) : (
          <div className="h-9 w-full bg-[#242424]/40 border border-[#2E2E2E]/40 rounded-md select-none flex items-center px-4 text-xs text-[#9A9590]/50 font-inter">
            Product search inactive on this page
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Table Badge */}
        <button
          onClick={() => setFloorModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#3D2B00] border border-[#F5A623]/25 px-3 py-1.5 rounded-full text-xs font-inter font-medium text-[#F0EDE8] hover:border-[#F5A623]/60 transition-colors focus:outline-none"
        >
          <MapPin size={14} className="text-[#F5A623]" />
          <span>
            {activeTable ? (
              <>
                Table <span className="font-mono text-[#F5A623]" data-type="table-number">{activeTable.number}</span>
              </>
            ) : (
              <span className="text-[#9A9590]">No table</span>
            )}
          </span>
        </button>

        <div className="h-6 w-px bg-[#2E2E2E]" />

        {/* Cashier Initials & Dropdown */}
        <div className="flex items-center gap-1.5">
          <div className="h-9 w-9 rounded-full bg-[#F5A623] text-[#0F0F0F] flex items-center justify-center font-sora font-bold text-xs select-none">
            {employee?.avatar || 'RM'}
          </div>
          <HamburgerMenu onLogoutClick={handleLogout} />
        </div>
      </div>

      {/* Floor Selection Modal */}
      <FloorModal open={floorModalOpen} onOpenChange={setFloorModalOpen} />
    </header>
  );
};
export default TopNav;
