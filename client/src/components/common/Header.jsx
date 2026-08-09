import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Sales':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Warehouse':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Accounts':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200">
          Wholesale & Distribution ERP
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-3 bg-zinc-50 px-3.5 py-1.5 rounded-lg border border-zinc-200">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-zinc-900">{user.name}</span>
              <span className="text-[10px] text-zinc-500">{user.email}</span>
            </div>
            <div
              className={`text-[11px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${getRoleBadgeStyle(
                user.role
              )}`}
            >
              <Shield className="w-3 h-3" />
              {user.role}
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
