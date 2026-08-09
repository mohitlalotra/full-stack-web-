import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Truck,
  FileText,
  Boxes,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'],
    },
    {
      name: 'Customers & CRM',
      path: '/customers',
      icon: Users,
      roles: ['Admin', 'Sales'],
    },
    {
      name: 'Products & Inventory',
      path: '/products',
      icon: Package,
      roles: ['Admin', 'Warehouse'],
    },
    {
      name: 'Purchase Orders',
      path: '/purchase-orders',
      icon: ShoppingCart,
      roles: ['Admin', 'Warehouse'],
    },
    {
      name: 'Delivery Challans',
      path: '/challans',
      icon: Truck,
      roles: ['Admin', 'Sales', 'Warehouse'],
    },
    {
      name: 'Invoices & Billing',
      path: '/invoices',
      icon: FileText,
      roles: ['Admin', 'Accounts'],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-zinc-200 bg-zinc-50">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-black text-sm">
          <Boxes className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900 text-sm tracking-tight">Apex ERP</span>
          <span className="text-[10px] text-zinc-500 font-mono">Wholesale Portal</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isAllowed = user?.role === 'Admin' || item.roles.includes(user?.role);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-zinc-900 text-white font-semibold shadow-sm'
                    : isAllowed
                    ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-500'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{item.name}</span>
              {!isAllowed && (
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-400 border border-zinc-200 font-mono">
                  Restricted
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
